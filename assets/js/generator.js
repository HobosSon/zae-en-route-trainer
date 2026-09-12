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
      types: ["departure", "departure", "enroute", "enroute", "enroute"],
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
      types: ["departure", "departure", "enroute", "enroute", "arrival"],
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
      types: ["departure", "departure", "enroute", "enroute", "arrival", "enroute"],
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
    const ac = pick(pool);
    return ac;
  }

  function chooseEquip(tier, ac) {
    // GA piston rarely has TACAN; keep it plausible but driven by the tier pool.
    let s = pick(tier.equip);
    if (ac.cat === "P" && (s === "M" || s === "N" || s === "P")) s = pick(["A", "U", "T", "D"]);
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
    const floorK = Math.ceil(mea / 1000);
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
  function generateFlight(tier, kind) {
    for (let attempt = 0; attempt < 60; attempt++) {
      const ac = chooseAircraft(tier);
      const equip = chooseEquip(tier, ac);
      const tas = filedTAS(ac);
      const gs = groundSpeed(tas);

      let aw, trav, startIdx, endIdx, entryNav, exitNav, origin, dest, originAirport = null, destAirport = null;

      if (kind === "departure") {
        const aptId = pick(DEP_AIRPORTS);
        const gw = DEP_GATEWAY[aptId];
        aw = pick(airwaysThrough(gw));
        trav = traverse(aw, true);
        let gi = trav.points.indexOf(gw);
        if (gi >= trav.points.length - 1) { trav = traverse(aw, false); gi = trav.points.indexOf(gw); }
        if (gi < 0 || gi >= trav.points.length - 1) continue;
        startIdx = gi; endIdx = trav.points.length - 1;
        entryNav = gw; exitNav = trav.points[endIdx];
        originAirport = aptId; origin = aptId; dest = externalFor(exitNav);
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
        destAirport = aptId; origin = externalFor(entryNav); dest = aptId;
      } else { // overflight
        aw = ZAE.AIRWAYS[pick(Object.keys(ZAE.AIRWAYS))];
        trav = traverse(aw, chance(0.5));
        startIdx = 0; endIdx = trav.points.length - 1;
        entryNav = trav.points[0]; exitNav = trav.points[endIdx];
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
        events.push({ posted: originAirport, i: startIdx, evt: "departure", bay: BAY_OF[DEP_GATEWAY[originAirport]] });
        postings.forEach(function (o) { if (o.i > startIdx) events.push({ posted: o.fix, i: o.i, evt: "enroute", bay: BAY_OF[o.fix] }); });
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
      if (kind === "departure") routeStr = originAirport + " " + entryNav + " " + aw.id + " " + exitNav + " " + dest;
      else if (kind === "arrival") routeStr = origin + conn + entryNav + " " + aw.id + " " + exitNav + " " + destAirport;
      else routeStr = origin + conn + entryNav + " " + aw.id + " " + exitNav + " " + dest;

      // chain center-estimate times over compulsory fixes from the start
      const baseT = rint(0, 1439);
      const timeAt = {}; let cur = baseT, lastComp = startIdx; timeAt[startIdx] = baseT;
      for (let k = startIdx + 1; k <= endIdx; k++) {
        if (isComp(trav.points[k])) { cur += plusTime(distanceBetween(trav, lastComp, k), gs); timeAt[k] = cur; lastComp = k; }
      }

      const cs = callsign(ac);
      const equipStr = "/" + equip + " — " + equipMeaning(equip);
      const exitFacility = (kind !== "arrival") ? FACILITY_OF_EXIT[exitNav] : null;
      const lastEvt = events[events.length - 1];
      const strips = [];

      events.forEach(function (ev) {
        const s = {};
        s["3"] = cs;
        s["4"] = (ac.heavy ? "H/" : "") + ac.type + "/" + equip;
        s["5"] = "T" + tas;
        s["6"] = "66";
        s["20"] = altToHundreds(alt);
        s["25"] = routeStr;

        const prevC = compBefore(trav, ev.i);
        const nextC = compAfter(trav, ev.i);

        if (ev.evt === "departure") {
          s["16"] = "↑";
          s["19"] = originAirport + " P" + toHHMM(baseT);
          s["21"] = nextC ? nextC.fix : dest;
        } else {
          s["11"] = prevC ? prevC.fix : entryNav;
          s["12"] = toHHMM(prevC ? timeAt[prevC.k] : baseT);
          s["15"] = toHHMM(timeAt[ev.i]);
          s["19"] = ev.posted;
          if (ev.evt === "arrival") { s["16"] = "↓"; s["21"] = destAirport; }
          else s["21"] = nextC ? nextC.fix : dest;
          // plus time ONLY on en route strips that follow a ZAE departure
          if (kind === "departure" && ev.evt === "enroute" && prevC) {
            s["14a"] = "+" + plusTime(distanceBetween(trav, prevC.k, ev.i), gs);
          }
        }
        if (ev === lastEvt && exitFacility) s["30"] = exitFacility;

        const key = keyBase(ev.evt === "departure" ? "Departure" : ev.evt === "arrival" ? "Arrival" : "En Route", ac, equip, tas, gs, cs);
        key.route = routeStr;
        key.bay = ev.bay + " bay";
        key.postedFix = ev.evt === "departure" ? (originAirport + " (departure)") : ev.posted;
        if (s["11"]) key.previousFix = s["11"];
        if (s["21"]) key.nextFix = s["21"];
        key.altitude = altPlain(alt) + "  (MEA " + mea.toLocaleString() + " ft)";
        if (s["14a"]) key.estimateMath = "Est " + s["11"] + " " + s["12"] + " " + s["14a"] + " = " + ev.posted + " est " + s["15"];
        else if (s["15"]) key.estimateMath = "Est " + s["11"] + " " + s["12"] + " → " + ev.posted + " est " + s["15"];
        if (exitFacility && ev === lastEvt) key.notes.push("Leaving ZAE to " + exitFacility + " — noted in space 30.");
        if (events.length > 1) key.notes.push("Part of a " + events.length + "-bay flight (" + events.map(function (e) { return e.bay; }).join(" → ") + "); all strips are one plane.");

        strips.push({ type: ev.evt, spaces: s, meta: key, bay: ev.bay });
      });
      return strips;
    }
    return null;
  }

  // ---- public API --------------------------------------------------------
  function generateOne(tierKey, forcedType) {
    const tier = TIERS[tierKey] || TIERS.trainee;
    let type = forcedType && forcedType !== "any" ? forcedType : pick(tier.types);
    if (type === "proposal") type = "departure"; // proposals retired: departures only
    const kind = type === "departure" ? "departure" : type === "arrival" ? "arrival" : "overflight";
    const f = generateFlight(tier, kind);
    const s = (f && f[0]) || genEnroute(tier);
    if (s && !s.bay) s.bay = bayForStrip(s);
    return s;
  }

  function generate(opts) {
    opts = opts || {};
    const tierKey = opts.difficulty || "trainee";
    const tier = TIERS[tierKey] || TIERS.trainee;
    let count = opts.count;
    if (!count) count = rint(tier.countRange[0], tier.countRange[1]);
    const out = [];
    for (let i = 0; i < count; i++) {
      let type = opts.type && opts.type !== "any" ? opts.type : pick(tier.types);
      if (type === "proposal") type = "departure"; // proposals retired: departures only
      const kind = type === "departure" ? "departure" : type === "arrival" ? "arrival" : "overflight";
      let strips = generateFlight(tier, kind) || [];
      if (!strips.length) { const s = genEnroute(tier); strips = s ? [s] : []; }
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
