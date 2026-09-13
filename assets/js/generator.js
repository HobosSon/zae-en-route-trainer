/*
 * ZAE flight progress strip generator.
 * Produces randomized, rule-consistent nonradar strips (departure /
 * en route / arrival) for Sector 66 Jackson Low, at three difficulty tiers.
 *
 * Exposed as the global `StripGen`. Requires ZAE (assets/data/zae.js).
 *
 * Each generated strip is an object:
 *   { type, spaces: {"3":..,"4":.., "14a":..}, meta: {...answer key...} }
 * `spaces` keys match the LP05 Appendix B numbered spaces.
 */
(function (root) {
  "use strict";

  const ZAE = root.ZAE;

  // ---- tiny helpers ------------------------------------------------------
  function rint(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function chance(p) { return Math.random() < p; }
  function pad2(n) { return String(n).padStart(2, "0"); }
  function pad4(n) { return String(n).padStart(4, "0"); }

  // Zulu clock as minutes-of-day <-> HHMM
  function toHHMM(mins) {
    mins = ((mins % 1440) + 1440) % 1440;
    return pad2(Math.floor(mins / 60)) + pad2(mins % 60);
  }
  function fromHHMM(s) { return parseInt(s.slice(0, 2), 10) * 60 + parseInt(s.slice(2), 10); }

  function beacon() {
    let b = "";
    for (let i = 0; i < 4; i++) b += rint(0, 7);
    return b;
  }

  // Quick Estimate Method (LP05): MPM = first two digits of GS / 6.
  function milesPerMinute(gs) {
    const firstTwo = Math.floor(gs / (gs >= 100 ? 10 : 1)); // first two digits
    const mpm = Math.round((firstTwo / 6) * 10) / 10;
    return Math.max(0.5, mpm);
  }
  function plusTime(distanceNm, gs) {
    return Math.max(1, Math.round(distanceNm / milesPerMinute(gs)));
  }

  // Compass arrow + label from a magnetic course (space 23 / space 16 usage)
  function directionArrow(course) {
    course = ((course % 360) + 360) % 360;
    if (course >= 315 || course < 45) return { arrow: "↑", label: "N" };
    if (course < 135) return { arrow: "→", label: "E" };
    if (course < 225) return { arrow: "↓", label: "S" };
    return { arrow: "←", label: "W" };
  }

  // ---- difficulty tiers --------------------------------------------------
  const TIERS = {
    trainee: {
      label: "Trainee",
      countRange: [1, 2],
      types: ["departure", "departure", "enroute", "enroute", "arrival"],
      equip: ["A", "A", "A", "U", "B"],
      altCap: 17000,
      allowBlocks: false,
      allowHeavy: false,
      remarkChance: 0.1,
      // prefer straightforward airline/GA on main airways
      gaChance: 0.35
    },
    developmental: {
      label: "Developmental",
      countRange: [2, 4],
      types: ["departure", "departure", "enroute", "enroute", "arrival", "arrival"],
      equip: ["A", "A", "U", "B", "D", "T", "Y", "C", "I"],
      altCap: 20000,
      allowBlocks: false,
      allowHeavy: true,
      remarkChance: 0.3,
      gaChance: 0.45
    },
    cpc: {
      label: "CPC",
      countRange: [3, 6],
      types: ["departure", "departure", "enroute", "enroute", "arrival", "arrival", "enroute"],
      equip: ["A", "U", "B", "D", "T", "X", "Y", "C", "I", "M", "N", "P"],
      altCap: 23000,
      allowBlocks: true,
      allowHeavy: true,
      remarkChance: 0.5,
      gaChance: 0.5
    }
  };

  const REMARKS = [
    "SLOW CLIMBER", "NO OXYGEN", "STUDENT PILOT", "MINIMUM FUEL",
    "REQ FL230", "WX DEVIATION RTE", "TCAS INOP", "PILOT REQ HIGHER",
    "VKS LNDG PRACTICE", "OPR CHK RQ"
  ];

  // ---- aircraft / callsign ----------------------------------------------
  function chooseAircraft(tier) {
    const ga = chance(tier.gaChance);
    let pool = ZAE.AIRCRAFT.filter(function (a) { return ga ? a.ga : true; });
    if (!ga) pool = ZAE.AIRCRAFT.filter(function (a) { return a.cat === "J" || a.cat === "T"; });
    return pick(pool);
  }

  // "TUX" aircraft (equipment suffix /T, /U, or /X: no DME) are uncommon at
  // Aero Center, so hold them to roughly 7% of draws regardless of tier pool.
  const NON_DME = { T: 1, U: 1, X: 1 };
  function chooseEquip(tier, ac) {
    const tux = tier.equip.filter(function (x) { return NON_DME[x]; });
    const rest = tier.equip.filter(function (x) { return !NON_DME[x]; });
    let s = (tux.length && (!rest.length || chance(0.07))) ? pick(tux) : pick(rest.length ? rest : tier.equip);
    // GA piston rarely has TACAN; keep it plausible without adding a TUX suffix.
    if (ac.cat === "P" && (s === "M" || s === "N" || s === "P")) s = pick(["A", "D"]);
    return s;
  }

  function callsign(ac) {
    if (!ac.ga) {
      // airline: ICAO prefix + 1-4 digit flight number
      return pick(ZAE.AIRLINES) + rint(1, 3999);
    }
    // GA N-number: N + 1-3 digits + optional 1-2 letters (avoid I/O)
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    let n = "N" + rint(1, 999);
    const tail = rint(0, 2);
    for (let i = 0; i < tail; i++) n += letters[rint(0, letters.length - 1)];
    return n;
  }

  // ---- route helpers -----------------------------------------------------
  function airwaysThrough(navId) {
    return Object.keys(ZAE.AIRWAYS)
      .map(function (k) { return ZAE.AIRWAYS[k]; })
      .filter(function (aw) { return aw.points.indexOf(navId) !== -1; });
  }

  // Build a directed traversal of an airway: {aw, points, legs, course}
  function traverse(aw, forward) {
    const points = forward ? aw.points.slice() : aw.points.slice().reverse();
    const legs = forward ? aw.legs.slice() : aw.legs.slice().reverse();
    const course = forward ? aw.course : (aw.course + 180) % 360;
    return { aw: aw, points: points, legs: legs, course: course };
  }

  function distanceBetween(trav, i, j) {
    // sum legs between point index i and j (i<j)
    let d = 0;
    for (let k = i; k < j; k++) d += trav.legs[k];
    return d;
  }

  function postingFor(aw, fixId) {
    for (let i = 0; i < aw.postings.length; i++) if (aw.postings[i].fix === fixId) return aw.postings[i];
    return null;
  }

  function externalFor(navId) {
    const list = ZAE.EXTERNAL_AIRPORTS[navId];
    return list ? pick(list) : (navId + " (via " + navId + ")");
  }

  function maxMEA(trav, upToIndex) {
    let m = 0;
    const lim = upToIndex == null ? trav.legs.length : upToIndex;
    for (let k = 0; k < lim; k++) m = Math.max(m, trav.aw.meaLegs[k]);
    return m || 3000;
  }

  // ---- altitude ----------------------------------------------------------
  function aircraftCap(ac) {
    if (ac.cat === "P") return 11000;
    if (ac.cat === "T") return 20000;
    return 23000;
  }

  function chooseAltitude(course, mea, tier, ac) {
    const cap = Math.min(tier.altCap, aircraftCap(ac), ZAE.LOW_CEILING);
    const eastbound = (((course % 360) + 360) % 360) < 180; // 0-179 => odd thousands
    const floorK = Math.max(5, Math.ceil(mea / 1000)); // never below 5,000 ft
    const opts = [];
    for (let k = floorK; k <= Math.floor(cap / 1000); k++) {
      const isOdd = k % 2 === 1;
      if (eastbound === isOdd) opts.push(k * 1000);
    }
    if (!opts.length) {
      // fall back to nearest legal thousand at/above MEA regardless of parity
      return Math.max(mea, floorK * 1000);
    }
    let alt = pick(opts);
    // Occasional block altitude for the top tier
    if (tier.allowBlocks && chance(0.15)) {
      const higher = opts.filter(function (a) { return a > alt; });
      if (higher.length) return { block: [alt, higher[0]] };
    }
    return alt;
  }

  function altToHundreds(alt) {
    if (alt && alt.block) return (alt.block[0] / 100) + "B" + (alt.block[1] / 100);
    return String(alt / 100);
  }
  function altPlain(alt) {
    if (alt && alt.block) return alt.block[0] + "B" + alt.block[1] + " (block)";
    return alt.toLocaleString() + " ft";
  }
  function altMagnitude(alt) { return alt && alt.block ? alt.block[0] : alt; }

  // ---- filed TAS / GS ----------------------------------------------------
  // Filed TAS is always a multiple of 10, clamped to 120-480 kt.
  function filedTAS(ac) {
    let t = Math.round(rint(ac.tas[0], ac.tas[1]) / 10) * 10;
    return Math.max(120, Math.min(480, t));
  }
  function groundSpeed(tas) { return Math.max(90, tas + rint(-25, 15)); } // light wind effect (for estimates only)

  // ---- strip assembly ----------------------------------------------------
  function baseCore(ac, equip, tas, gs) {
    const heavy = ac.heavy;
    const s = {};
    s["3"] = callsign(ac);
    s["4"] = (heavy ? "H/" : "") + ac.type + "/" + equip;
    s["5"] = "T" + tas;
    s["6"] = "66";
    s["8"] = String(gs);
    // NOTE: strip number (10) and beacon (27) are computer-generated codes,
    // intentionally omitted from the practice strips (may return in scenarios).
    return s;
  }

  function equipMeaning(equip) {
    const e = ZAE.EQUIP[equip];
    return e ? (e.nav + ", " + e.xpdr) : equip;
  }

  // Common answer-key scaffold
  function keyBase(type, ac, equip, tas, gs, cs) {
    return {
      stripType: type,
      callsign: cs,
      aircraft: ac.type + " (" + ({ J: "jet", T: "turboprop", P: "piston" }[ac.cat]) + ")",
      heavy: ac.heavy,
      equip: "/" + equip + " — " + equipMeaning(equip),
      tas: tas + " kt",
      gs: gs + " kt",
      notes: []
    };
  }

  // Non-compulsory reporting points — never used as previous/next fix.
  const NONCOMP_FIXES = { DINKY: 1, BARNE: 1, HAZAL: 1, RICKS: 1, HEDUD: 1, DESKE: 1, YAZOO: 1, BOOSI: 1, ARGUW: 1, UBABY: 1 };
  function isComp(id) { return !NONCOMP_FIXES[id]; }
  function compBefore(trav, i) { for (let k = i - 1; k >= 0; k--) if (isComp(trav.points[k])) return { fix: trav.points[k], k: k }; return null; }
  function compAfter(trav, i) { for (let k = i + 1; k < trav.points.length; k++) if (isComp(trav.points[k])) return { fix: trav.points[k], k: k }; return null; }

  // ---- EN ROUTE ----------------------------------------------------------
  function genEnroute(tier) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const aw = pick(Object.keys(ZAE.AIRWAYS).map(function (k) { return ZAE.AIRWAYS[k]; }));
      const trav = traverse(aw, chance(0.5));
      // candidate posted fixes that have a COMPULSORY previous fix and a next fix
      const cands = aw.postings
        .map(function (p) { return { p: p, i: trav.points.indexOf(p.fix) }; })
        .filter(function (c) { return c.i >= 1 && c.i < trav.points.length - 1 && compBefore(trav, c.i) && compAfter(trav, c.i); });
      if (!cands.length) continue;
      const chosen = pick(cands);
      const postedFix = chosen.p.fix;
      const i = chosen.i;
      const prevC = compBefore(trav, i);
      const nextC = compAfter(trav, i);
      const prevFix = prevC.fix;
      const nextFix = nextC.fix;

      const ac = chooseAircraft(tier);
      const equip = chooseEquip(tier, ac);
      const tas = filedTAS(ac);
      const gs = groundSpeed(tas);

      const distPrevToPosted = distanceBetween(trav, prevC.k, i);
      const pt = plusTime(distPrevToPosted, gs);
      const estPrev = rint(0, 1439);
      const estPrevStr = toHHMM(estPrev);
      const estPostedStr = toHHMM(estPrev + pt);

      const mea = maxMEA(trav);
      const alt = chooseAltitude(trav.course, mea, tier, ac);
      const dir = directionArrow(trav.course);

      const entryNav = trav.points[0];
      const exitNav = trav.points[trav.points.length - 1];
      const origin = externalFor(entryNav);
      const dest = externalFor(exitNav);
      const conn = origin === "K" + entryNav ? " " : "./.";
      const routeStr = origin + conn + entryNav + " " + aw.id + " " + exitNav + " " + dest;

      // Overflight (entered from an adjacent center): carry the received estimate,
      // NO plus time (14a) and blank actual time (14).
      const s = baseCore(ac, equip, tas, gs);
      s["11"] = prevFix;
      s["12"] = estPrevStr;
      s["15"] = estPostedStr;
      s["19"] = postedFix;
      s["20"] = altToHundreds(alt);
      s["21"] = nextFix || dest;
      s["25"] = routeStr;
      if (chance(0.5)) s["29-30"] = ZAE.NAVAIDS[exitNav] ? (ZAE.NAVAIDS[exitNav].owner) : "";

      const key = keyBase("En Route", ac, equip, tas, gs, s["3"]);
      key.route = routeStr;
      key.airway = aw.id + " (" + trav.points.join(" → ") + ")";
      key.postedFix = postedFix + (postingFor(aw, postedFix).at !== postedFix ? " (posted under " + postingFor(aw, postedFix).at + " bay)" : "");
      key.previousFix = prevFix;
      key.nextFix = nextFix || dest;
      key.altitude = altPlain(alt) + "  (MEA " + mea.toLocaleString() + " ft; " + dir.label + "-bound → " + ((trav.course < 180) ? "odd" : "even") + " thousands)";
      key.direction = dir.label;
      key.notes.push("Overflight (entered from an adjacent center): estimate over " + prevFix + " is received, so no plus time is posted — carry the estimate over " + postedFix + ".");
      key.estimateMath = "Est " + prevFix + " " + estPrevStr + " → " + postedFix + " est " + estPostedStr;
      key.allPostings = aw.postings.map(function (p) { return p.fix + (p.at !== p.fix ? "@" + p.at : ""); }).join(", ");
      return { type: "enroute", spaces: s, meta: key };
    }
    return null;
  }

  // En route strip that follows a departure WITHIN ZAE airspace — this is the
  // only case that carries a plus time (14a): computed from the departure
  // gateway fix to the downstream posted fix.
  const DEP_GATEWAY = { KJAN: "MHZ", KJVW: "MHZ", KVKS: "MHZ", "0M8": "MHZ", KGWO: "SQS" };
  // Departures that reach MHZ on a preplanned, coordinated heading that is
  // never depicted in the route: Byerley (0M8) flies 150 to join V427 east of
  // HATER; Vicksburg (KVKS) flies 030 to join V417. nm is the approximate
  // airport-to-MHZ distance, used only for the first-fix estimate; tune here.
  const DEP_JOIN = { "0M8": { via: "V427", nm: 30 }, KVKS: { via: "V417", nm: 45 } };
  const BYERLEY_TO_HATER_NM = 19; // westbound variant only
  // Share of departure flights generated as already departed (active below the
  // header). 0 = every departure posts in suspense.
  const DEPARTED_SHARE = 0;
  // Internal (Sector 66) NAVAIDs: overflights and arrivals must enter ZAE at a
  // boundary NAVAID, never at one of these.
  function isHub(id) { const n = ZAE.NAVAIDS[id]; return !!n && n.owner === "66"; }
  // 0M8 -> MLU (westbound) departures are switched off for now; flip to true
  // to generate them again (route "0M8 MLU <dest>", next fix HATER).
  const BYERLEY_WESTBOUND = false;
  // Fixes on the MLU side of MHZ: a Byerley departure continuing past MHZ
  // must not turn back toward them.
  const WEST_OF_MHZ = { MLU: 1, HATER: 1, DORTS: 1, STUEE: 1, DINKY: 1, HEDUD: 1 };
  function genEnrouteDeparted(tier) {
    const apts = Object.keys(DEP_GATEWAY);
    for (let attempt = 0; attempt < 60; attempt++) {
      const aptId = pick(apts);
      const gw = DEP_GATEWAY[aptId];
      const throughAws = airwaysThrough(gw);
      const aw = pick(throughAws);
      // find a traversal + posting strictly downstream of the gateway
      let trav = traverse(aw, true);
      let gi = trav.points.indexOf(gw);
      let cands = aw.postings.map(function (p) { return { p: p, i: trav.points.indexOf(p.fix) }; }).filter(function (c) { return c.i > gi && c.p.fix !== gw; });
      if (!cands.length) { trav = traverse(aw, false); gi = trav.points.indexOf(gw); cands = aw.postings.map(function (p) { return { p: p, i: trav.points.indexOf(p.fix) }; }).filter(function (c) { return c.i > gi && c.p.fix !== gw; }); }
      if (!cands.length) continue;
      const chosen = pick(cands);
      const postedFix = chosen.p.fix;
      const pidx = chosen.i;

      const ac = chooseAircraft(tier);
      const equip = chooseEquip(tier, ac);
      const tas = filedTAS(ac);
      const gs = groundSpeed(tas);

      const dist = distanceBetween(trav, gi, pidx);
      const pt = plusTime(dist, gs);
      const gwTime = rint(0, 1439);
      const estPosted = gwTime + pt;

      const mea = maxMEA(trav);
      const alt = chooseAltitude(trav.course, mea, tier, ac);
      const exitNav = trav.points[trav.points.length - 1];
      const nextC = compAfter(trav, pidx);
      const dest = externalFor(exitNav);
      const nextFix = nextC ? nextC.fix : dest;
      const routeStr = aptId + " " + gw + " " + aw.id + " " + exitNav + " " + dest;

      const s = baseCore(ac, equip, tas, gs);
      s["11"] = gw;                       // previous fix = departure gateway
      s["12"] = toHHMM(gwTime);
      s["14a"] = "+" + pt;                // plus time (departed ZAE)
      s["15"] = toHHMM(estPosted);
      s["19"] = postedFix;
      s["20"] = altToHundreds(alt);
      s["21"] = nextFix;
      s["25"] = routeStr;

      const key = keyBase("En Route", ac, equip, tas, gs, s["3"]);
      key.origin = ZAE.AIRPORTS[aptId] ? (ZAE.AIRPORTS[aptId].name + " (" + aptId + ")") : aptId;
      key.route = routeStr;
      key.airway = aw.id + " (" + trav.points.slice(gi).join(" → ") + ")";
      key.postedFix = postedFix + (postingFor(aw, postedFix).at !== postedFix ? " (posted under " + postingFor(aw, postedFix).at + " bay)" : "");
      key.previousFix = gw + " (departure gateway)";
      key.nextFix = nextFix;
      key.altitude = altPlain(alt) + "  (MEA " + mea.toLocaleString() + " ft)";
      key.notes.push("Departed within ZAE (" + aptId + ") — plus time IS posted.");
      key.plusTimeMath = "Dist " + gw + "→" + postedFix + " = " + dist + " nm; MPM = " + Math.floor(gs / 10) + "/6 ≈ " + milesPerMinute(gs) + "; +time = " + dist + " ÷ " + milesPerMinute(gs) + " ≈ " + pt + " min";
      key.estimateMath = "Est " + gw + " " + toHHMM(gwTime) + " + " + pt + " = " + postedFix + " est " + toHHMM(estPosted);
      return { type: "enroute", spaces: s, meta: key };
    }
    return null;
  }

  // ---- PROPOSAL / DEPARTURE ---------------------------------------------
  function airportEntryNav(aptId) {
    if (["KJAN", "KHKS", "KJVW", "KTVR", "0M8", "KVKS"].indexOf(aptId) !== -1) return "MHZ";
    if (aptId === "KGWO") return "SQS";
    return "MHZ";
  }

  // Only airports that are valid space-19 bay postings.
  const DEP_AIRPORTS = ["KJAN", "KJVW", "KGWO", "KVKS", "0M8"];
  const ARR_AIRPORTS = ["KJAN", "KJVW", "KGWO"];

  function genProposalOrDeparture(tier, isDeparture) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const aptId = pick(DEP_AIRPORTS);
      const apt = ZAE.AIRPORTS[aptId];
      const entryNav = airportEntryNav(aptId);
      const throughAws = airwaysThrough(entryNav);
      if (!throughAws.length) continue;
      const aw = pick(throughAws);
      // pick a direction that leads outward from entryNav (has points after it)
      let trav = traverse(aw, true);
      let ei = trav.points.indexOf(entryNav);
      if (ei >= trav.points.length - 1) { trav = traverse(aw, false); ei = trav.points.indexOf(entryNav); }
      if (ei < 0 || ei >= trav.points.length - 1) continue;

      const exitNav = trav.points[trav.points.length - 1];
      const dest = externalFor(exitNav);

      const ac = chooseAircraft(tier);
      const equip = chooseEquip(tier, ac);
      const tas = filedTAS(ac);
      const gs = groundSpeed(tas);

      // next posted fix strictly after the departure/entry point
      let nextPosted = null, npIndex = -1;
      for (let k = ei + 1; k < trav.points.length; k++) {
        const pp = postingFor(aw, trav.points[k]);
        if (pp) { nextPosted = pp; npIndex = k; break; }
      }
      const nextFixSpace21 = nextPosted ? nextPosted.fix : exitNav;

      const mea = maxMEA(trav);
      const alt = chooseAltitude(trav.course, mea, tier, ac);
      const dir = directionArrow(trav.course);

      const ptime = toHHMM(rint(0, 1439));
      // GA files ETE; append to destination in the route (space 25)
      const ete = ac.ga ? pad4(rint(35, 200)) : null;
      const routeStr = [aptId, entryNav, aw.id, exitNav, dest + (ete ? "/" + ete : "")].join(" ");

      const s = baseCore(ac, equip, tas, gs);
      s["16"] = "↑"; // departure arrow
      s["19"] = aptId + " P" + ptime;
      s["21"] = nextFixSpace21;
      s["24"] = altToHundreds(alt);
      s["25"] = routeStr;
      if (ZAE.NAVAIDS[exitNav] && ZAE.NAVAIDS[exitNav].owner && ZAE.NAVAIDS[exitNav].owner.charAt(0) === "Z") {
        s["29-30"] = ZAE.NAVAIDS[exitNav].owner;
      }

      const key = keyBase(isDeparture ? "Departure" : "Proposal", ac, equip, tas, gs, s["3"]);
      key.origin = apt.name + " (" + aptId + ") — " + apt.apch + ", Rwy " + apt.rwy;
      key.route = routeStr;
      key.airway = aw.id + " (" + trav.points.slice(ei).join(" → ") + ")";
      key.nextPostedFix = nextPosted
        ? nextPosted.fix + (nextPosted.at !== nextPosted.fix ? " (posted under " + nextPosted.at + " bay)" : "")
        : exitNav + " (coordination fix — hand off to " + (ZAE.NAVAIDS[exitNav] ? ZAE.NAVAIDS[exitNav].owner : "?") + ")";
      key.altitude = "Requested " + altPlain(alt) + "  (MEA " + mea.toLocaleString() + " ft; " + dir.label + "-bound → " + ((trav.course < 180) ? "odd" : "even") + " thousands)";
      key.proposedTime = "P" + ptime + " (proposed departure)";
      if (ete) key.ete = ete.slice(0, 2) + "+" + ete.slice(2) + " (ETE, GA aircraft)";
      key.requiredPostings = "Along this route in Jackson Low: " +
        aw.postings.map(function (p) { return p.fix + (p.at !== p.fix ? "@" + p.at : ""); }).join(", ");

      if (isDeparture) {
        // airborne: actual departure time + estimate to next posted fix
        const depMin = fromHHMM(ptime) + rint(0, 6);
        const depStr = toHHMM(depMin);
        s["18"] = depStr;
        s["20"] = altToHundreds(alt);
        delete s["24"]; // assigned now, shown in 20
        if (nextPosted) {
          const dist = distanceBetween(trav, ei, npIndex);
          const pt = plusTime(dist, gs);
          s["15"] = toHHMM(depMin + pt);
          key.estimateMath =
            "Dep " + depStr + " + (" + dist + " nm ÷ " + milesPerMinute(gs) + " MPM ≈ " + pt + " min) = " +
            nextPosted.fix + " est " + toHHMM(depMin + pt);
        }
        key.departureTime = depStr + " (actual off " + aptId + ")";
        key.altitude = "Assigned " + altPlain(alt) + "  (MEA " + mea.toLocaleString() + " ft)";
      }

      return { type: isDeparture ? "departure" : "proposal", spaces: s, meta: key };
    }
    return null;
  }

  // ---- ARRIVAL -----------------------------------------------------------
  function genArrival(tier) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const aptId = pick(ARR_AIRPORTS);
      const apt = ZAE.AIRPORTS[aptId];
      const entryNav = airportEntryNav(aptId); // last posted fix before the field
      const throughAws = airwaysThrough(entryNav);
      if (!throughAws.length) continue;
      const aw = pick(throughAws);
      // direction inbound: aircraft flies toward entryNav from outside, so entryNav should be near the END
      let trav = traverse(aw, true);
      let ei = trav.points.indexOf(entryNav);
      if (ei <= 0) { trav = traverse(aw, false); ei = trav.points.indexOf(entryNav); }
      if (ei <= 0) continue;
      const prevC = compBefore(trav, ei);
      if (!prevC) continue;

      const prevFix = prevC.fix;
      const originNav = trav.points[0];
      const origin = externalFor(originNav);

      const ac = chooseAircraft(tier);
      const equip = chooseEquip(tier, ac);
      const tas = filedTAS(ac);
      const gs = groundSpeed(tas);

      const dist = distanceBetween(trav, prevC.k, ei);
      const pt = plusTime(dist, gs);
      const estPrev = rint(0, 1439);
      const estFix = estPrev + pt;

      const mea = maxMEA(trav);
      const alt = chooseAltitude(trav.course, mea, tier, ac);

      const conn = origin === "K" + originNav ? " " : "./.";
      const routeStr = origin + conn + originNav + " " + aw.id + " " + entryNav + " " + aptId;
      const s = baseCore(ac, equip, tas, gs);
      s["11"] = prevFix;
      s["12"] = toHHMM(estPrev);
      s["15"] = toHHMM(estFix);
      s["16"] = "↓"; // arrival arrow
      s["19"] = entryNav;
      s["20"] = altToHundreds(alt);
      s["21"] = aptId;
      s["25"] = routeStr;
      s["28"] = "CAF " + toHHMM(estFix + rint(2, 8)); // cleared-approach placeholder / EFC-style misc

      const key = keyBase("Arrival", ac, equip, tas, gs, s["3"]);
      key.destination = apt.name + " (" + aptId + ") — " + apt.apch + ", Rwy " + apt.rwy + (apt.loc ? ", " + apt.loc : "");
      key.route = routeStr;
      key.airway = aw.id + " inbound (" + trav.points.slice(0, ei + 1).join(" → ") + ")";
      key.arrivalFix = entryNav + " (last posted fix before the field)";
      key.previousFix = prevFix;
      key.altitude = altPlain(alt) + "  (MEA " + mea.toLocaleString() + " ft)";
      key.estimateMath = "Est " + prevFix + " " + toHHMM(estPrev) + " → " + entryNav + " est " + toHHMM(estFix);
      key.notes.push("Arrival arrow (↓) posted in space 16. Space 28 carries miscellaneous control data (e.g., cleared-for-approach time).");
      if (apt.apch === "JAN") key.notes.push("JAN Approach: nonradar limits at/below 5,000 ft (freq 119.2 / 259.2).");
      return { type: "arrival", spaces: s, meta: key };
    }
    return null;
  }

  function markRemark(text, alt) {
    if (text === "REQ FL230" && altMagnitude(alt) >= 21000) text = "REQ HIGHER";
    return "○ " + text; // the "O" symbol seen on ZAE example strips
  }

  // ---- multi-bay flight -------------------------------------------------
  // Which bay each posting fix belongs to.
  const BAY_OF = {
    MLU: "VKS", KVKS: "VKS", "0M8": "VKS", STUEE: "VKS", DORTS: "VKS", HATER: "VKS",
    MHZ: "MHZ", KJAN: "MHZ", KJVW: "MHZ", SQS: "SQS", KGWO: "SQS"
  };
  const BAYS = ["VKS", "MHZ", "SQS"];
  // Bay a strip posts to when the generator did not already tag it (the single
  // en route fallback): the posted fix in space 19, or the departure airport.
  function bayForStrip(s) {
    const first = String((s.spaces && s.spaces["19"]) || "").split(" ")[0];
    return BAY_OF[first] || BAY_OF[s.meta && s.meta.postedFix] || "MHZ";
  }
  // Boundary NAVAID -> adjacent facility (for the space-30 handoff note).
  const FACILITY_OF_EXIT = { MLU: "ZFW", MCB: "ZHU", HEZ: "ZHU", GCV: "ZHU" };

  // Returns an ARRAY of strips for ONE plane — one per ZAE bay it transits.
  function generateFlight(tier, kind, win) {
    for (let attempt = 0; attempt < 60; attempt++) {
      const ac = chooseAircraft(tier);
      const equip = chooseEquip(tier, ac);
      const tas = filedTAS(ac);
      const gs = groundSpeed(tas);

      let aw, trav, startIdx, endIdx, entryNav, exitNav, origin, dest, originAirport = null, destAirport = null;
      let legToFirst = 0;       // nm from the departure airport to its first fix (0 = not modelled)
      let routeOverride = null; // departure routes that do not follow "APT GW AIRWAY EXIT DEST"

      if (kind === "departure") {
        const aptId = pick(DEP_AIRPORTS);
        originAirport = aptId; origin = aptId;
        const gw = DEP_GATEWAY[aptId];
        const join = DEP_JOIN[aptId]; // preplanned heading to the gateway, not depicted
        if (aptId === "0M8" && BYERLEY_WESTBOUND && chance(0.5)) {
          // westbound: V427 via HATER to MLU and out to ZFW
          aw = ZAE.AIRWAYS.V427;
          trav = traverse(aw, false); // MHZ -> HATER -> MLU
          startIdx = trav.points.indexOf("HATER"); endIdx = trav.points.indexOf("MLU");
          entryNav = "MLU"; exitNav = "MLU"; dest = externalFor("MLU");
          legToFirst = BYERLEY_TO_HATER_NM;
          routeOverride = "0M8 MLU " + dest;
        } else {
          // via the gateway VORTAC, then any airway leaving it; airports that
          // join MHZ on a preplanned heading must not continue back west
          aw = pick(airwaysThrough(gw));
          trav = traverse(aw, true);
          let gi = trav.points.indexOf(gw);
          if (gi >= trav.points.length - 1) { trav = traverse(aw, false); gi = trav.points.indexOf(gw); }
          if (gi < 0 || gi >= trav.points.length - 1) continue;
          if (join && WEST_OF_MHZ[trav.points[gi + 1]]) continue;
          startIdx = gi; endIdx = trav.points.length - 1;
          entryNav = gw; exitNav = trav.points[endIdx]; dest = externalFor(exitNav);
          legToFirst = join ? join.nm : 0;
        }
      } else if (kind === "arrival") {
        const aptId = pick(ARR_AIRPORTS);
        const feeder = airportEntryNav(aptId);
        aw = pick(airwaysThrough(feeder));
        trav = traverse(aw, true);
        let fi = trav.points.indexOf(feeder);
        if (fi <= 0) { trav = traverse(aw, false); fi = trav.points.indexOf(feeder); }
        if (fi <= 0) continue;
        startIdx = 0; endIdx = fi;
        entryNav = trav.points[0]; exitNav = feeder;
        if (isHub(entryNav)) continue; // must enter ZAE at a boundary NAVAID
        destAirport = aptId; origin = externalFor(entryNav); dest = aptId;
      } else { // overflight
        aw = ZAE.AIRWAYS[pick(Object.keys(ZAE.AIRWAYS))];
        trav = traverse(aw, chance(0.5));
        startIdx = 0; endIdx = trav.points.length - 1;
        entryNav = trav.points[0]; exitNav = trav.points[endIdx];
        if (isHub(entryNav) || isHub(exitNav)) continue; // transit boundary to boundary
        origin = externalFor(entryNav); dest = externalFor(exitNav);
      }
      if (!isComp(trav.points[startIdx])) continue; // need a compulsory anchor

      // postings on this airway within the flown segment
      const postings = aw.postings
        .map(function (p) { return { fix: p.fix, i: trav.points.indexOf(p.fix) }; })
        .filter(function (o) { return o.i >= startIdx && o.i <= endIdx; })
        .sort(function (a, b) { return a.i - b.i; });

      // one event per bay
      let events = [];
      if (kind === "departure") {
        events.push({ posted: originAirport, i: startIdx, evt: "departure", bay: BAY_OF[originAirport] || BAY_OF[DEP_GATEWAY[originAirport]] });
        postings.forEach(function (o) { if (o.i >= startIdx) events.push({ posted: o.fix, i: o.i, evt: "enroute", bay: BAY_OF[o.fix] }); });
      } else if (kind === "arrival") {
        postings.forEach(function (o) {
          if (o.i === endIdx) events.push({ posted: o.fix, i: o.i, evt: "arrival", bay: BAY_OF[o.fix] });
          else events.push({ posted: o.fix, i: o.i, evt: "enroute", bay: BAY_OF[o.fix] });
        });
        if (!events.some(function (e) { return e.evt === "arrival"; })) events.push({ posted: exitNav, i: endIdx, evt: "arrival", bay: BAY_OF[exitNav] });
      } else {
        postings.forEach(function (o) { events.push({ posted: o.fix, i: o.i, evt: "enroute", bay: BAY_OF[o.fix] }); });
      }
      // dedupe by bay, keep order
      const seen = {};
      events = events.filter(function (e) { if (!e.bay || seen[e.bay]) return false; seen[e.bay] = 1; return true; });
      events.sort(function (a, b) { return a.i - b.i; });
      if (!events.length) continue;

      const mea = maxMEA(trav);
      const alt = chooseAltitude(trav.course, mea, tier, ac);
      const conn = origin === "K" + entryNav ? " " : "./.";
      let routeStr;
      if (kind === "departure") routeStr = routeOverride || (originAirport + " " + entryNav + " " + aw.id + " " + exitNav + " " + dest);
      else if (kind === "arrival") routeStr = origin + conn + entryNav + " " + aw.id + " " + exitNav + " " + destAirport;
      else routeStr = origin + conn + entryNav + " " + aw.id + " " + exitNav + " " + dest;

      // chain center-estimate times over compulsory fixes as offsets from the
      // start, then slide the whole flight into the scenario window so every
      // posted time on the board sits within 45 minutes of the others.
      const rel = {}; rel[startIdx] = legToFirst ? plusTime(legToFirst, gs) : 0; let cur = rel[startIdx], lastComp = startIdx;
      for (let k = startIdx + 1; k <= endIdx; k++) {
        if (isComp(trav.points[k])) { cur += plusTime(distanceBetween(trav, lastComp, k), gs); rel[k] = cur; lastComp = k; }
      }
      const span = events.reduce(function (m, e) { return Math.max(m, rel[e.i] || 0); }, 0);
      if (win && span > win.span && attempt < 40) continue; // prefer flights that fit the window
      const baseT = win ? win.start + rint(0, Math.max(0, win.span - span)) : rint(0, 1439);
      const timeAt = {};
      Object.keys(rel).forEach(function (k) { timeAt[k] = (baseT + rel[k]) % 1440; });

      const cs = callsign(ac);
      const equipStr = "/" + equip + " — " + equipMeaning(equip);
      const exitFacility = (kind !== "arrival") ? FACILITY_OF_EXIT[exitNav] : null;
      const lastEvt = events[events.length - 1];
      const strips = [];

      // Departures are "in suspense" (held above the bay header together with
      // all of their postings) until a clearance request comes in. A flight is
      // only posted as already departed when another strip carries its
      // next-fix estimate.
      // Next fix for a departure strip: the gateway VORTAC when it posts in a
      // different bay (0M8, KVKS -> MHZ, which then gets its own posting);
      // otherwise the departure strip already covers the gateway's bay
      // (KJAN/KJVW at MHZ, KGWO at SQS) and the next fix is the one after it.
      const depBay = kind === "departure" ? events[0].bay : null;
      const gwSameBay = kind === "departure" && BAY_OF[trav.points[startIdx]] === depBay;
      const firstFix = gwSameBay
        ? (compAfter(trav, startIdx) || { fix: trav.points[endIdx], k: endIdx })
        : { fix: trav.points[startIdx], k: startIdx };
      const departed = kind === "departure" && events.length > 1 && chance(DEPARTED_SHARE);
      const suspense = kind === "departure" && !departed;

      events.forEach(function (ev) {
        const s = {};
        s["3"] = cs;
        s["4"] = (ac.heavy ? "H/" : "") + ac.type + "/" + equip;
        s["5"] = "T" + tas;
        s["6"] = "66";
        // altitude: assigned in 20 once coordinated; a flight still in suspense
        // only has the pilot's requested altitude, which goes in 24 on all its strips
        if (kind === "departure" && !departed) s["24"] = altToHundreds(alt);
        else s["20"] = altToHundreds(alt);
        s["25"] = routeStr;

        let prevC = compBefore(trav, ev.i);
        // a departure's first posting is preceded by the airport itself, never
        // by airway points behind the first fix
        if (kind === "departure" && (ev.i === startIdx || (prevC && prevC.k < startIdx))) prevC = { fix: originAirport, k: -1, apt: true };
        const nextC = compAfter(trav, ev.i);

        if (ev.evt === "departure") {
          s["16"] = "↑";
          s["21"] = firstFix.fix; // next fix is the first fix off the airport
          if (departed) {
            // already off: actual departure time (space 18) and the estimate
            // over the first fix (space 15) instead of a proposed time
            s["18"] = toHHMM(baseT);
            s["19"] = originAirport;
            s["15"] = toHHMM(timeAt[firstFix.k]);
          } else {
            s["19"] = originAirport + " P" + toHHMM(baseT);
          }
        } else {
          // a boundary posting (first fix inside ZAE on an overflight/arrival)
          // has no previous fix in our airspace: its estimate is the one
          // received from the adjacent facility
          const atEntry = kind !== "departure" && ev.i === startIdx;
          if (!atEntry) {
            s["11"] = prevC ? prevC.fix : entryNav;
            s["12"] = toHHMM(prevC && !prevC.apt ? timeAt[prevC.k] : baseT);
          }
          // actual off time goes on the first fix posting after departure
          if (departed && ev === events[1]) s["14"] = toHHMM(baseT);
          s["15"] = toHHMM(timeAt[ev.i]);
          s["19"] = ev.posted;
          if (ev.evt === "arrival") { s["16"] = "↓"; s["21"] = destAirport; }
          else s["21"] = nextC ? nextC.fix : dest;
          // plus time ONLY on en route strips that follow a ZAE departure
          if (kind === "departure" && ev.evt === "enroute" && prevC) {
            const pt = prevC.apt ? (legToFirst ? plusTime(legToFirst, gs) : 0) : plusTime(distanceBetween(trav, prevC.k, ev.i), gs);
            if (pt) s["14a"] = "+" + pt;
          }
        }
        if (ev === lastEvt && exitFacility) s["30"] = exitFacility;

        const key = keyBase(ev.evt === "departure" ? "Departure" : ev.evt === "arrival" ? "Arrival" : "En Route", ac, equip, tas, gs, cs);
        key.route = routeStr;
        key.bay = ev.bay + " bay";
        key.postedFix = ev.evt === "departure" ? (originAirport + " (departure)") : ev.posted;
        if (s["11"]) key.previousFix = s["11"];
        if (s["21"]) key.nextFix = s["21"];
        key.altitude = (kind === "departure" && !departed ? "Requested " : "Assigned ") + altPlain(alt) + "  (MEA " + mea.toLocaleString() + " ft" + (kind === "departure" && !departed ? "; in space 24 until coordinated" : "") + ")";
        if (s["14a"]) key.estimateMath = "Est " + s["11"] + " " + s["12"] + " " + s["14a"] + " = " + ev.posted + " est " + s["15"];
        else if (s["15"] && s["11"]) key.estimateMath = "Est " + s["11"] + " " + s["12"] + " → " + ev.posted + " est " + s["15"];
        else if (s["15"]) key.estimateMath = "Est over " + ev.posted + " " + s["15"] + " received from " + ((ZAE.NAVAIDS[ev.posted] || {}).owner || "the adjacent facility") + " (boundary posting: no previous fix in ZAE)";
        if (exitFacility && ev === lastEvt) key.notes.push("Leaving ZAE to " + exitFacility + " — noted in space 30.");
        if (events.length > 1) key.notes.push("Part of a " + events.length + "-bay flight (" + events.map(function (e) { return e.bay; }).join(" → ") + "); all strips are one plane.");

        const strip = { type: ev.evt, spaces: s, meta: key, bay: ev.bay, homeBay: ev.bay };
        // every strip of a departure flight carries an explicit suspense flag so
        // an already-departed departure strip posts below the header, not above
        if (kind === "departure") strip.suspense = suspense;
        if (suspense) {
          strip.suspense = true;
          strip.suspenseTime = parseInt(toHHMM(baseT), 10); // HHMM, groups the flight above the header
          strip.bay = depBay;
          if (ev.evt === "departure") {
            key.proposedTime = "P" + toHHMM(baseT) + " (proposed departure; strip in suspense above the " + depBay + " bay header)";
          } else {
            key.notes.push("Departure still in suspense: this posting is held directly above the departure strip in the " + depBay + " bay until a clearance request comes in; it normally posts under " + ev.bay + ".");
          }
        } else if (kind === "departure" && ev.evt === "departure") {
          key.departureTime = toHHMM(baseT) + " (actual off " + originAirport + ")";
          key.notes.push("Already departed: actual off time in space 18 and the estimate over " + firstFix.fix + " in space 15, so the strip is active below the bay header.");
        }
        strips.push(strip);
      });
      return strips;
    }
    return null;
  }

  // Reject strips that break basic posting logic (guards the fallbacks):
  // previous fix equal to the posted fix, or a ZAE airport as the origin of an
  // en route/arrival strip (those are departures).
  const INTERNAL_APT = { KJAN: 1, KHKS: 1, KJVW: 1, KTVR: 1, KVKS: 1, KGWO: 1, "0M8": 1 };
  function stripSane(st, kind) {
    const sp = st.spaces || {};
    const posted = String(sp["19"] || "").split(" ")[0];
    if (sp["11"] && posted && sp["11"] === posted) return false;
    if (kind !== "departure" && INTERNAL_APT[String(sp["25"] || "").split(/[ ./]/)[0]]) return false;
    return true;
  }

  // ---- public API --------------------------------------------------------
  function generateOne(tierKey, forcedType) {
    const tier = TIERS[tierKey] || TIERS.trainee;
    let type = forcedType && forcedType !== "any" ? forcedType : pick(tier.types);
    if (type === "proposal") type = "departure"; // proposals retired: departures only
    const kind = type === "departure" ? "departure" : type === "arrival" ? "arrival" : "overflight";
    const f = generateFlight(tier, kind);
    let s = (f && f[0]) || genEnroute(tier);
    if (s && !stripSane(s, kind)) s = null;
    if (s && !s.bay) s.bay = bayForStrip(s);
    return s;
  }

  function generate(opts) {
    opts = opts || {};
    const tierKey = opts.difficulty || "trainee";
    const tier = TIERS[tierKey] || TIERS.trainee;
    let count = opts.count;
    if (!count) count = rint(tier.countRange[0], tier.countRange[1]);
    // Scenario window: every posted time (P-times, fix and airport estimates
    // inside ZAE) lands within 45 minutes so the board reads as one problem.
    // Start early enough that the window never crosses midnight.
    const win = { start: rint(0, 1380), span: 45 };
    const out = [];
    for (let i = 0; i < count; i++) {
      let type = opts.type && opts.type !== "any" ? opts.type : pick(tier.types);
      if (type === "proposal") type = "departure"; // proposals retired: departures only
      const kind = type === "departure" ? "departure" : type === "arrival" ? "arrival" : "overflight";
      let strips = generateFlight(tier, kind, win) || [];
      const sane = function (st) { return stripSane(st, kind); };
      for (let tries = 0; tries < 3 && strips.length && !strips.every(sane); tries++) strips = generateFlight(tier, kind, win) || [];
      if (!strips.every(sane)) strips = [];
      // fallbacks: a windowed overflight keeps the board's 45-minute spread; the
      // single-strip generator is the last resort
      if (!strips.length) strips = (generateFlight(tier, "overflight", win) || []).filter(function (st) { return stripSane(st, "overflight"); });
      if (!strips.length) { const s = genEnroute(tier); strips = s && stripSane(s, "overflight") ? [s] : []; }
      strips.forEach(function (s) {
        s.flight = i + 1;
        if (!s.bay) s.bay = bayForStrip(s);
      });
      out.push.apply(out, strips);
    }
    return out;
  }

  root.StripGen = {
    generate: generate,
    generateOne: generateOne,
    tiers: TIERS,
    bays: BAYS,
    bayOf: function (fix) { return BAY_OF[fix]; },
    _internal: { plusTime: plusTime, milesPerMinute: milesPerMinute, directionArrow: directionArrow }
  };
})(typeof window !== "undefined" ? window : this);
