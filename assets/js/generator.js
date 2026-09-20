/*
 * ZAE flight progress strip generator.
 * Produces randomized, rule-consistent nonradar strips (departure /
 * en route / arrival) for Sector 66 Jackson Low, at three difficulty tiers,
 * and — with ZAEConflicts loaded — whole scenarios that are checked to be
 * workable without a separation error, with an answer key per strip.
 *
 * Exposed as the global `StripGen`. Requires ZAE (assets/data/zae.js).
 * Optional: ZAEConflicts (assets/js/conflicts.js) for the scenario check and
 * ZAERemote (assets/js/remote.js) for the Remote's strips.
 *
 * Each generated strip is an object:
 *   { type, spaces: {"3":..,"4":.., "14a":..}, meta: {...answer key...},
 *     bay, homeBay, flight, suspense, marks }
 * `spaces` keys match the LP05 Appendix B numbered spaces.
 *
 * Seeds: every draw comes from a seeded generator, so a scenario code
 * (e.g. "D3A-K7Q2MX") reproduces the exact same board later or on another
 * machine — one person can act as the Remote while another controls.
 */
(function (root) {
  "use strict";

  const ZAE = root.ZAE;

  // ---- seeded random ---------------------------------------------------
  // mulberry32: small, fast, good enough for scenario reproduction.
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashSeed(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const SEED_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  function randomSeed() {
    let s = "";
    for (let i = 0; i < 6; i++) s += SEED_CHARS[Math.floor(Math.random() * SEED_CHARS.length)];
    return s;
  }
  let rng = Math.random; // swapped for a seeded generator during generate()

  // ---- tiny helpers ------------------------------------------------------
  function rint(a, b) { return Math.floor(rng() * (b - a + 1)) + a; }
  function pick(arr) { return arr[Math.floor(rng() * arr.length)]; }
  function chance(p) { return rng() < p; }
  function pad2(n) { return String(n).padStart(2, "0"); }
  function pad4(n) { return String(n).padStart(4, "0"); }

  // Zulu clock as minutes-of-day <-> HHMM
  function toHHMM(mins) {
    mins = ((Math.round(mins) % 1440) + 1440) % 1440;
    return pad2(Math.floor(mins / 60)) + pad2(mins % 60);
  }
  function fromHHMM(s) { return parseInt(s.slice(0, 2), 10) * 60 + parseInt(s.slice(2), 10); }

  // Quick Estimate Method (LP05): MPM = first two digits of GS / 6.
  function milesPerMinute(gs) {
    // Speeds under 100 kt have no "first two digits", so use the true value
    // (gs / 60): 95 kt is 1.6 MPM, not 15.8.
    const firstTwo = gs >= 100 ? Math.floor(gs / 10) : gs / 10;
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
      label: "Trainee", code: "T",
      countRange: [1, 2],
      types: ["departure", "departure", "enroute", "enroute", "arrival"],
      equip: ["A", "A", "A", "U", "B"],
      altCap: 17000,
      allowBlocks: false,
      allowHeavy: false,
      remarkChance: 0.1,
      iafdofChance: 0,
      moaChance: 0,        // flights filed through an active MOA (red W preplanning item)
      onFreqChance: 0.3,   // en route / arrival flights already on frequency when the problem starts
      altReqChance: 0,     // level overflights that ask for a different altitude mid-flight
      gaChance: 0.35
    },
    developmental: {
      label: "Developmental", code: "D",
      countRange: [2, 4],
      types: ["departure", "departure", "enroute", "enroute", "arrival", "arrival"],
      equip: ["A", "A", "U", "B", "D", "T", "Y", "C", "I"],
      altCap: 17000,
      allowBlocks: false,
      allowHeavy: true,
      remarkChance: 0.3,
      iafdofChance: 0.06,  // aircraft entering the sector IAFDOF (nonstandard: kept rare)
      moaChance: 0.12,
      onFreqChance: 0.35,
      altReqChance: 0.08,
      gaChance: 0.45
    },
    cpc: {
      label: "CPC", code: "C",
      countRange: [3, 6],
      types: ["departure", "departure", "enroute", "enroute", "arrival", "arrival", "enroute"],
      equip: ["A", "U", "B", "D", "T", "X", "Y", "C", "I", "M", "N", "P"],
      altCap: 17000,
      allowBlocks: false,
      allowHeavy: true,
      remarkChance: 0.5,
      iafdofChance: 0.08,
      moaChance: 0.18,
      onFreqChance: 0.35,
      altReqChance: 0.12,
      gaChance: 0.5
    }
  };
  const TIER_BY_CODE = { T: "trainee", D: "developmental", C: "cpc" };
  const TYPE_CODES = { any: "A", departure: "D", enroute: "E", arrival: "R" };
  const TYPE_BY_CODE = { A: "any", D: "departure", E: "enroute", R: "arrival" };

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
  function chooseEquip(tier, ac, allowTux) {
    const tux = tier.equip.filter(function (x) { return NON_DME[x]; });
    const rest = tier.equip.filter(function (x) { return !NON_DME[x]; });
    let s = (allowTux && tux.length && (!rest.length || chance(0.07))) ? pick(tux) : pick(rest.length ? rest : tier.equip);
    // GA piston rarely has TACAN; keep it plausible without adding a TUX suffix.
    if (ac.cat === "P" && (s === "M" || s === "N" || s === "P")) s = pick(["A", "D"]);
    return s;
  }
  function hasDME(equip) { return !NON_DME[equip]; }

  function callsign(ac) {
    if (ac.mil) return pick(ZAE.MIL_CALLSIGNS) + rint(10, 99); // military: word + two digits
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

  // Build a directed traversal of an airway: {aw, points, legs, course, forward}
  function traverse(aw, forward) {
    const points = forward ? aw.points.slice() : aw.points.slice().reverse();
    const legs = forward ? aw.legs.slice() : aw.legs.slice().reverse();
    const meas = forward ? aw.meaLegs.slice() : aw.meaLegs.slice().reverse();
    const course = forward ? aw.course : (aw.course + 180) % 360;
    return { aw: aw, points: points, legs: legs, meas: meas, course: course, forward: forward };
  }

  function distanceBetween(trav, i, j) {
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

  function maxMEA(trav, fromIdx, toIdx) {
    let m = 0;
    const a = fromIdx == null ? 0 : fromIdx, b = toIdx == null ? trav.legs.length : toIdx;
    for (let k = a; k < b; k++) m = Math.max(m, trav.meas[k]);
    return m || 3000;
  }

  // ---- altitude ----------------------------------------------------------
  function aircraftCap(ac) {
    if (ac.cat === "P") return 11000;
    if (ac.cat === "T") return 20000;
    return 23000;
  }

  // Appropriate altitude parity for a traversal. Hemispheric rule (0-179 odd,
  // 180-359 even) except the ZAE/ZHU LOA: V9, V555 and V557 are
  // precoordinated NORTHBOUND ODD / SOUTHBOUND EVEN.
  const LOA_NORTH_ODD = { V9: 1, V555: 1, V557: 1 };
  function wantsOdd(trav) {
    if (LOA_NORTH_ODD[trav.aw.id]) return !!trav.forward; // forward = MCB end toward the north
    return (((trav.course % 360) + 360) % 360) < 180;
  }

  // Lowest altitude a flight may use on this traversal: MEA, never below
  // 5,000, and above the approach controls it overflies (JAN nonradar 5,000
  // and below on every MHZ route; MLU nonradar 6,000 and below inside 31 nm
  // of MLU on V417/V427/V18).
  function altitudeFloor(trav, fromIdx, toIdx) {
    let floor = Math.max(5000, maxMEA(trav, fromIdx, toIdx));
    const pts = trav.points.slice(fromIdx == null ? 0 : fromIdx, (toIdx == null ? trav.points.length - 1 : toIdx) + 1);
    if (pts.indexOf("MHZ") !== -1) floor = Math.max(floor, 6000);
    if (pts.indexOf("MLU") !== -1) floor = Math.max(floor, 7000);
    return floor;
  }

  // Highest altitude usable on this traversal: the always-active MOAs
  // (Columbus 3 on V11 toward HLI, Meridian 1 West on V245 toward IGB) start
  // at 8,000, so aircraft continuing onto those segments stay at or below 7,000.
  function altitudeCap(trav, fromIdx, toIdx, tier, ac) {
    let cap = Math.min(tier.altCap, aircraftCap(ac), ZAE.LOW_CEILING);
    const pts = trav.points.slice(fromIdx == null ? 0 : fromIdx, (toIdx == null ? trav.points.length - 1 : toIdx) + 1);
    Object.keys(ZAE.MOA).forEach(function (k) {
      ZAE.MOA[k].airways.forEach(function (seg) {
        if (trav.aw.id !== seg.airway) return;
        const fi = pts.indexOf(seg.from), ti = pts.indexOf(seg.toward);
        if (fi !== -1 && ti !== -1 && ti > fi) cap = Math.min(cap, ZAE.MOA[k].floor - 1000);
      });
    });
    return cap;
  }
  // The active MOA this traversal flies through (its airway segment lies on the path), if any.
  function moaOnPath(trav, fromIdx, toIdx) {
    const pts = trav.points.slice(fromIdx == null ? 0 : fromIdx, (toIdx == null ? trav.points.length - 1 : toIdx) + 1);
    let hit = null;
    Object.keys(ZAE.MOA).forEach(function (k) {
      ZAE.MOA[k].airways.forEach(function (seg) {
        if (hit || trav.aw.id !== seg.airway) return;
        const fi = pts.indexOf(seg.from), ti = pts.indexOf(seg.toward);
        if (fi !== -1 && ti !== -1 && ti > fi) hit = { id: k, airway: seg.airway, from: seg.from, toward: seg.toward, floor: ZAE.MOA[k].floor, ceiling: ZAE.MOA[k].ceiling };
      });
    });
    return hit;
  }
  // Preplanning item: an aircraft filed through an active MOA (the card's
  // "V245 ZAMMA AOB 090 [MEI 1 WEST]" / "V11 HLI AOA 8000 [CBM3 MOA]" checks).
  // Returns { moa, alt, fixAlt, reroute } or null: alt is the filed altitude
  // inside the MOA, fixAlt the highest appropriate altitude under its floor
  // (null when the aircraft is too high for a 2,000 ft change: V11 traffic is
  // rerouted V535 instead), reroute the airway that avoids the MOA.
  const MOA_MAX = { MEI1W: 9000 }; // the card checks V245 ZAMMA traffic at or below 9,000
  function moaCase(trav, fromIdx, toIdx, floor, tier, ac) {
    const moa = moaOnPath(trav, fromIdx, toIdx); if (!moa) return null;
    const genCap = Math.min(tier.altCap, aircraftCap(ac), ZAE.LOW_CEILING);
    const inside = altitudeOptions(trav, Math.max(floor, moa.floor), tier, ac, Math.min(genCap, MOA_MAX[moa.id] || moa.ceiling));
    const under = altitudeOptions(trav, floor, tier, ac, moa.floor - 1000);
    if (!inside.length || !under.length) return null;
    const alt = pick(inside), fixAlt = under[under.length - 1];
    const reroute = moa.id === "CBM3" ? "V535" : null;
    if (alt - fixAlt > 2000 && !reroute) return null;
    return { moa: moa, alt: alt, fixAlt: alt - fixAlt <= 2000 ? fixAlt : null, reroute: reroute };
  }
  function altitudeOptions(trav, floor, tier, ac, cap) {
    if (cap == null) cap = Math.min(tier.altCap, aircraftCap(ac), ZAE.LOW_CEILING);
    const odd = wantsOdd(trav);
    const floorK = Math.ceil(floor / 1000);
    const opts = [];
    for (let k = floorK; k <= Math.floor(cap / 1000); k++) {
      if (odd === (k % 2 === 1)) opts.push(k * 1000);
    }
    return opts;
  }
  function chooseAltitude(trav, floor, tier, ac, cap) {
    const opts = altitudeOptions(trav, floor, tier, ac, cap);
    if (!opts.length) return Math.ceil(floor / 1000) * 1000;
    return pick(opts);
  }
  // The wrong-parity neighbour used for IAFDOF flights.
  function wrongParityNear(alt, floor, cap) {
    const c = [alt + 1000, alt - 1000].filter(function (a) { return a >= floor && a <= cap; });
    return c.length ? pick(c) : null;
  }

  function altToHundreds(alt) { return String(alt / 100); }
  function altPlain(alt) { return alt.toLocaleString() + " ft"; }

  // ---- filed TAS / GS ----------------------------------------------------
  // Filed TAS is always a multiple of 10, clamped to 120-480 kt.
  function filedTAS(ac) {
    let t = Math.round(rint(ac.tas[0], ac.tas[1]) / 10) * 10;
    return Math.max(120, Math.min(480, t));
  }
  function groundSpeed(tas) { return Math.max(90, tas + rint(-25, 15)); } // light wind effect (for estimates only)

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
  const NONCOMP_FIXES = { DINKY: 1, BARNE: 1, HAZAL: 1, RICKS: 1, HEDUD: 1, DESKE: 1, YAZOO: 1, BOOSI: 1, ARGUW: 1, UBABY: 1, J417: 1, J417W: 1 };
  function isComp(id) { return !NONCOMP_FIXES[id]; }

  // ---- bays -------------------------------------------------------------
  const BAY_OF = {
    MLU: "VKS", KVKS: "VKS", "0M8": "VKS", STUEE: "VKS", DORTS: "VKS", HATER: "VKS", DINKY: "VKS", VKS: "VKS", TKH: "VKS", KMLU: "VKS",
    MHZ: "MHZ", KJAN: "MHZ", KJVW: "MHZ", SQS: "SQS", KGWO: "SQS"
  };
  const BAYS = ["VKS", "MHZ", "SQS"];
  function bayForStrip(s) {
    const first = String((s.spaces && s.spaces["19"]) || "").split(" ")[0];
    return BAY_OF[first] || BAY_OF[s.meta && s.meta.postedFix] || "MHZ";
  }
  // Boundary NAVAID -> adjacent facility (for the space-30 handoff note).
  const FACILITY_OF_EXIT = { MLU: "ZFW", MCB: "ZHU", HEZ: "ZHU", GCV: "ZHU" };
  // Sector that owns the far side of each exit NAVAID (for coordination).
  const NEXT_SECTOR = { MLU: "MLU LO (ZFW 30)", MCB: "PCU LO (ZHU 27)", HEZ: "POE LO (ZHU 40)", GCV: "PCU LO (ZHU 27)", MEI: "D65", IGB: "D12", HLI: "D12", UJM: "D15", GLH: "D67" };

  function isHub(id) { const n = ZAE.NAVAIDS[id]; return !!n && n.owner === "66"; }

  // Airports and the airway points a departure may continue on. Byerley
  // (0M8) joins V427 and goes MHZ-bound; it never turns back toward MLU.
  const DEP_AIRPORTS = ["KJAN", "KJVW", "KGWO", "KVKS", "0M8", "KMLU"];
  // KMLU departures: cleared through MLU Approach, always V18 by default. Their
  // departure strip is posted at STUEE (KMLU and the P-time in 11/12, the plus
  // time to STUEE in 14a, MHZ as the next fix); the MHZ strip follows.
  const KMLU_DEP = { first: "STUEE", nm: 19 };
  const ARR_AIRPORTS = ["KJAN", "KJVW", "KGWO", "KGWO", "KMLU", "KVKS"];
  // How each arrival ends: the airway feeder (holding fix or the posting before
  // it), extra legs after the airway, the airport leg, the filed route tail
  // and the lowest altitude the arrival may cruise at.
  //   KMLU: any airway into MHZ (not from the MLU side), then V18 HEDUD DINKY STUEE. The printed strip
  //         posts STUEE (DINKY is nonradar-only); the controller amends it to DINKY, estimate = STUEE - 3.
  //   KVKS: any airway into MHZ (not from HEZ), then V417 DORTS and direct VKS (about 10 nm); KVKS is on the NDB
  const ARRIVALS = {
    KJAN: { feeder: "MHZ", leg: 10 }, KJVW: { feeder: "MHZ", leg: 17 }, KGWO: { feeder: "SQS", leg: 10 },
    KMLU: { via: "MHZ", notFrom: ["MLU"], suffix: [["HEDUD", 23, "V18"], ["DINKY", 41, "V18"], ["STUEE", 12, "V18"]], feeder: "STUEE", holdFix: "DINKY", leg: 19, routeTail: "V18 MLU", minAlt: 7000, tux: true },
    KVKS: { via: "MHZ", notFrom: ["HEZ"], suffix: [["DORTS", 49, "V417"], ["VKS", 10, "DCT"]], feeder: "DORTS", holdFix: "VKS", leg: 0, routeTail: "V417 DORTS VKS", minAlt: 6000,
            // from the Monroe side: V417 straight to DORTS (never around MHZ)
            direct: { MLU: { airway: "V417", via: "DORTS", suffix: [["VKS", 10, "DCT"]], routeTail: "V417 DORTS VKS" } } }
  };
  const WEST_OF_MHZ = { MLU: 1, HATER: 1, DORTS: 1, STUEE: 1, DINKY: 1, HEDUD: 1, J417: 1, J417W: 1 };
  const KVKS_WEST_SHARE = 0.3;   // KVKS departures that go V417 west to MLU
  const KVKS_HEZ_SHARE = 0.22;   // KVKS departures that leave on the HEZ026 radial (not in the filed route)
  const HEZ026R = { id: "HEZ026R", points: ["KVKS", "HEZ"], legs: [42], meaLegs: [3000], postings: [], course: 206 };
  const BYERLEY_JAN_SHARE = 0.35; // 0M8 departures that land at a JAN Approach field (both strips in suspense)
  const JAN_FIELDS = ["KJAN", "KJVW"];
  const ENTRY_DEFAULT_NM = 10;   // sector boundary past an entry NAVAID with no listed boundary mileage
  function airportEntryNav(aptId) { return aptId === "KGWO" ? "SQS" : "MHZ"; }
  function airportLegNm(aptId) { const p = ZAE.DEP_PATHS[aptId]; return p ? p[0][1] : 10; }
  const INTERNAL_APT = { KJAN: 1, KHKS: 1, KJVW: 1, KTVR: 1, KVKS: 1, KGWO: 1, "0M8": 1 };

  // ---- flight construction ---------------------------------------------
  // A flight is: aircraft data + an ordered path of nodes with cumulative
  // distance (`d`, nm) and time (`t`, minutes of day), the leg it arrived on
  // (`via`: airway id, DCT or HDG) and the bay each posting belongs to.
  function generateFlight(tier, kind, win, seq) {
    for (let attempt = 0; attempt < 80; attempt++) {
      const ac = chooseAircraft(tier);
      const tas = filedTAS(ac);
      const gs = groundSpeed(tas);

      let aw, trav, startIdx, endIdx, entryNav, exitNav, origin, dest, originAirport = null, destAirport = null;
      let prefix = []; // nodes before trav.points[startIdx]: [[id, nm, via]]
      let suffix = []; // nodes after trav.points[endIdx] (arrivals): [[id, nm, via]]
      let routeOverride = null;
      let arrSpec = null;
      let hez026 = null;
      let depAtFix = null;

      if (kind === "departure") {
        const aptId = pick(DEP_AIRPORTS);
        originAirport = aptId; origin = aptId;
        if (aptId === "KVKS" && chance(KVKS_WEST_SHARE)) {
          // V417 west to Monroe: KVKS -> (030 to join) -> DORTS -> MLU
          aw = ZAE.AIRWAYS.V417; trav = traverse(aw, false); // MEI MHZ DORTS MLU
          startIdx = trav.points.indexOf("DORTS"); endIdx = trav.points.indexOf("MLU");
          prefix = [["KVKS", 0, null], ["J417W", ZAE.DEP_PATHS.KVKSW[0][1], "HDG"], ["DORTS", ZAE.J417.westToDORTS, "V417"]];
          entryNav = "MLU"; exitNav = "MLU"; dest = externalFor("MLU");
          if (dest === "KMLU") continue; // Sector 66 works KMLU arrivals through DINKY; a KVKS/0M8 departure does not fit that process
          routeOverride = "KVKS MLU " + dest;
        } else if (aptId === "KVKS" && chance(KVKS_HEZ_SHARE)) {
          // Natchez 026 radial to HEZ (ZHU). The radial is not in the filed route: the controller
          // coordinates it. "KVKS KHEZ" flights do not progress HEZ ("cleared via the HEZ026R").
          const toKHEZ = chance(0.5);
          aw = HEZ026R; trav = traverse(aw, true); startIdx = 0; endIdx = 1;
          prefix = [];
          entryNav = "HEZ"; exitNav = "HEZ";
          dest = toKHEZ ? "KHEZ" : pick(["KBTR", "KASD"]);
          routeOverride = toKHEZ ? "KVKS KHEZ" : "KVKS HEZ " + dest;
          hez026 = { toKHEZ: toKHEZ };
        } else if (aptId === "KMLU") {
          aw = ZAE.AIRWAYS.V18; trav = traverse(aw, true); // MLU STUEE DINKY HEDUD MHZ MEI
          startIdx = trav.points.indexOf(KMLU_DEP.first); endIdx = trav.points.length - 1;
          prefix = [["KMLU", 0, null], [KMLU_DEP.first, KMLU_DEP.nm, "V18"]];
          entryNav = KMLU_DEP.first; exitNav = trav.points[endIdx]; dest = externalFor(exitNav);
          routeOverride = "KMLU V18 MHZ V18 " + exitNav + " " + dest;
          depAtFix = KMLU_DEP.first;
        } else if (aptId === "0M8" && chance(BYERLEY_JAN_SHARE)) {
          // Byerley to a JAN Approach field: 0M8 -> 150 to join V427 -> MHZ -> the airport.
          // A departure that is also a JAN arrival: departure strip and MHZ arrival strip, both in suspense.
          aw = ZAE.AIRWAYS.V427; trav = traverse(aw, true); // MLU HATER MHZ
          startIdx = endIdx = trav.points.indexOf("MHZ");
          prefix = [["0M8", 0, null]].concat(ZAE.DEP_PATHS["0M8"].map(function (p) { return [p[0], p[1], p[2]]; }));
          entryNav = "MHZ"; exitNav = "MHZ";
          destAirport = pick(JAN_FIELDS); dest = destAirport;
          arrSpec = { leg: ARRIVALS[destAirport].leg, minAlt: 6000, holdFix: "MHZ", feeder: "MHZ" };
          routeOverride = "0M8 V427 MHZ " + destAirport;
        } else {
          const gw = airportEntryNav(aptId);
          aw = pick(airwaysThrough(gw));
          trav = traverse(aw, true);
          let gi = trav.points.indexOf(gw);
          if (gi >= trav.points.length - 1) { trav = traverse(aw, false); gi = trav.points.indexOf(gw); }
          if (gi < 0 || gi >= trav.points.length - 1) continue;
          if ((aptId === "0M8" || aptId === "KVKS") && WEST_OF_MHZ[trav.points[gi + 1]]) continue;
          startIdx = gi; endIdx = trav.points.length - 1;
          entryNav = gw; exitNav = trav.points[endIdx]; dest = externalFor(exitNav);
          if (dest === "KMLU") continue; // KMLU arrivals are worked through DINKY; departures inside 66 do not fit that process
          // airport -> gateway legs (LP03 airport locations / preplanned joins)
          prefix = [[aptId, 0, null]].concat(ZAE.DEP_PATHS[aptId].map(function (p) { return [p[0], p[1], p[2]]; }));
          if (aptId === "KVKS") prefix.push(["MHZ", ZAE.J417.toMHZ, "V417"]);
        }
      } else if (kind === "arrival") {
        const aptId = pick(ARR_AIRPORTS);
        arrSpec = ARRIVALS[aptId];
        const feeder = arrSpec.via || arrSpec.feeder; // the airway point the arrival leaves the airway at
        aw = pick(airwaysThrough(feeder));
        trav = traverse(aw, chance(0.5));
        let fi = trav.points.indexOf(feeder);
        if (fi <= 0) { trav = traverse(aw, !trav.forward); fi = trav.points.indexOf(feeder); }
        if (fi <= 0) continue;
        startIdx = 0; endIdx = fi;
        entryNav = trav.points[0]; exitNav = feeder;
        if (isHub(entryNav)) continue; // must enter ZAE at a boundary NAVAID
        if (arrSpec.notFrom && arrSpec.notFrom.indexOf(entryNav) !== -1) continue;
        suffix = arrSpec.suffix || [];
        if (arrSpec.direct && arrSpec.direct[entryNav]) {
          const dspec = arrSpec.direct[entryNav];
          if (aw.id !== dspec.airway) continue;
          endIdx = trav.points.indexOf(dspec.via); if (endIdx <= 0) continue;
          exitNav = dspec.via; suffix = dspec.suffix; arrSpec = Object.assign({}, arrSpec, { routeTail: dspec.routeTail });
        }
        destAirport = aptId; origin = externalFor(entryNav); dest = aptId;
      } else { // overflight
        aw = ZAE.AIRWAYS[pick(Object.keys(ZAE.AIRWAYS))];
        trav = traverse(aw, chance(0.5));
        startIdx = 0; endIdx = trav.points.length - 1;
        entryNav = trav.points[0]; exitNav = trav.points[endIdx];
        if (isHub(entryNav) || isHub(exitNav)) continue; // transit boundary to boundary
        origin = externalFor(entryNav); dest = externalFor(exitNav);
      }
      if (!isComp(trav.points[startIdx])) continue;

      // TUX (non-DME) aircraft only where the course's restrictions can be
      // written without DME: overflights, KJAN/KJVW arrivals from inside
      // Sector 66 airways, and KGWO departures.
      const tuxOK = kind === "overflight" || (kind === "departure" && originAirport === "KGWO") || (kind === "arrival" && !!arrSpec.tux);
      const equip = chooseEquip(tier, ac, tuxOK);
      const dme = hasDME(equip);

      // ---- path nodes: prefix (airport legs) + airway points [startIdx..endIdx] + airport
      const nodes = [];
      let cum = 0;
      prefix.forEach(function (p, i) { if (i) cum += p[1]; nodes.push({ id: p[0], d: cum, via: p[2] || (i ? "DCT" : null) }); });
      const awStartD = cum;
      for (let k = startIdx; k <= endIdx; k++) {
        if (k > startIdx) cum += trav.legs[k - 1];
        if (nodes.length && nodes[nodes.length - 1].id === trav.points[k]) { nodes[nodes.length - 1].awIdx = k; continue; }
        nodes.push({ id: trav.points[k], d: cum, via: k > startIdx ? aw.id : (nodes.length ? nodes[nodes.length - 1].via : null), awIdx: k });
      }
      if (destAirport) { // arrivals, and departures that land inside the sector
        suffix.forEach(function (p) { cum += p[1]; nodes.push({ id: p[0], d: cum, via: p[2] || "DCT" }); });
        cum += arrSpec.leg != null ? arrSpec.leg : airportLegNm(destAirport);
        nodes.push({ id: destAirport, d: cum, via: "DCT" });
      }
      if (hez026 && hez026.toKHEZ) nodes.push({ id: "KHEZ", d: cum, via: "DCT" }); // the field is at HEZ; HEZ itself is not progressed
      nodes.forEach(function (n, i) { n.bay = BAY_OF[n.id] || null; n.comp = isComp(n.id) || !!INTERNAL_APT[n.id] || (destAirport && i >= nodes.length - 2); n.idx = i; });
      if (hez026 && hez026.toKHEZ) nodes[nodeIdxOf(nodes, "HEZ")].comp = false;

      // ---- times: chain rounded plus-times between compulsory nodes (as the
      // strips do), interpolate the rest. rel[] is minutes after the start.
      const rel = new Array(nodes.length);
      rel[0] = 0; let lastC = 0;
      for (let i = 1; i < nodes.length; i++) {
        if (nodes[i].comp || i === nodes.length - 1) {
          rel[i] = rel[lastC] + plusTime(nodes[i].d - nodes[lastC].d, gs);
          // interpolate skipped non-compulsory nodes
          for (let j = lastC + 1; j < i; j++) rel[j] = rel[lastC] + (rel[i] - rel[lastC]) * (nodes[j].d - nodes[lastC].d) / (nodes[i].d - nodes[lastC].d);
          lastC = i;
        }
      }
      // posted events (one per bay), which also bound the scenario window
      const postedIdx = [];
      if (kind === "departure") postedIdx.push(depAtFix ? nodeIdxOf(nodes, depAtFix) : 0); // KMLU: the departure strip is the STUEE posting
      nodes.forEach(function (n, i) {
        if (i === 0 && kind === "departure") return;
        const awOf = n.awIdx != null ? aw : (ZAE.AIRWAYS[n.via] || null); // suffix legs use their own airway's postings
        if (awOf && postingFor(awOf, n.id) && n.bay) postedIdx.push(i);
        else if (kind === "arrival" && i === nodes.length - 2 && n.bay && postedIdx.indexOf(i) === -1) postedIdx.push(i);
      });
      const seen = {};
      const events = postedIdx.filter(function (i) { const b = nodes[i].bay; if (!b || seen[b]) return false; seen[b] = 1; return true; });
      if (!events.length) continue;
      let span = events.reduce(function (m, i) { return Math.max(m, rel[i]); }, 0);
      if (kind === "arrival") span = Math.max(span, rel[nodes.length - 1]); // airport estimate is posted too
      if (win && span > win.span && attempt < 60) continue;
      // where the flight enters Sector 66: the boundary on the entry airway
      // past the (neighbour-owned) entry NAVAID, in minutes after node 0
      let entryRel = 0;
      if (kind !== "departure" && nodes.length > 1) {
        const bx = (ZAE.BOUNDARIES[aw.id] || []).filter(function (x) { return x.nav === entryNav && x.to !== "JAN" && x.to !== "MLUAPCH"; })[0];
        const legD = nodes[1].d - nodes[0].d;
        const dB = Math.min(bx ? bx.nm : ENTRY_DEFAULT_NM, legD);
        entryRel = legD ? (rel[1] - rel[0]) * dB / legD : 0;
      }
      // Some en route / arrival flights are already on frequency when the
      // problem starts: they entered a few minutes before the clock, with
      // their first posting still ahead (pilot estimate in space 17).
      let baseT = null, onFreq = false;
      if (win && kind !== "departure" && tier.onFreqChance && chance(tier.onFreqChance)) {
        const before = rint(1, 6);
        if (rel[events[0]] - entryRel >= before + 1 && span - entryRel + before <= win.span) { baseT = Math.round(win.start - before - entryRel); onFreq = true; }
      }
      if (baseT == null) baseT = win ? win.start + rint(0, Math.max(0, win.span - span)) : rint(0, 1439);
      nodes.forEach(function (n, i) { n.t = baseT + rel[i]; n.rel = rel[i]; });
      const entryT = baseT + entryRel;
      // initial contact: about when the aircraft enters our airspace, give or take
      let icT = null;
      if (kind !== "departure" && !onFreq) icT = Math.max(win ? win.start : 0, Math.round(entryT + rint(-1, 3)));

      // ---- altitude
      const floor = Math.max(altitudeFloor(trav, startIdx, endIdx), arrSpec && arrSpec.minAlt ? arrSpec.minAlt : 0);
      let cap = altitudeCap(trav, startIdx, endIdx, tier, ac);
      if (kind === "departure" && destAirport) cap = Math.min(cap, floor + 2000); // a short hop: no higher than two above the lowest
      if (cap < floor) continue; // e.g. V245 northeast of MHZ: 6,000 floor, 7,000 cap, parity may leave nothing
      let alt = chooseAltitude(trav, floor, tier, ac, cap);
      // filed through an active MOA (overflights and departures leaving on V245 to ZAMMA or V11 to HLI)
      let moa = null;
      if (kind !== "arrival" && !destAirport && tier.moaChance && chance(tier.moaChance)) {
        const mc = moaCase(trav, startIdx, endIdx, floor, tier, ac);
        if (mc) { moa = mc; alt = mc.alt; }
      }
      let iafdofAlt = null;
      if (kind === "overflight" && !moa && tier.iafdofChance && chance(tier.iafdofChance)) {
        const w = wrongParityNear(alt, floor, cap);
        if (w) iafdofAlt = w; // the aircraft ARRIVES at the wrong altitude; `alt` is the appropriate one
      }
      const filedAlt = iafdofAlt || alt;
      // an aircraft entering IAFDOF is APREQ'd by the adjacent facility before it
      // enters (and before its initial contact); the Remote makes that call
      let apreqT = null;
      if (iafdofAlt && icT != null) {
        apreqT = icT - rint(3, 6);
        if (win && apreqT < win.start) { icT += win.start - apreqT; apreqT = win.start; }
      }
      // an uncommon mid-flight altitude request from a level overflight (the
      // Remote asks at altReq.t; the controller must check it against traffic)
      let altReq = null;
      if (kind === "overflight" && !iafdofAlt && tier.altReqChance && chance(tier.altReqChance)) {
        const choices = altitudeOptions(trav, floor, tier, ac, cap).filter(function (a) { return a !== alt && Math.abs(a - alt) <= 4000; });
        const lastT = baseT + rel[events[events.length - 1]];
        const from = Math.max(win ? win.start : 0, icT != null ? icT : baseT) + 2;
        if (choices.length && lastT - from >= 4) altReq = { alt: pick(choices), t: rint(from, lastT - 2) };
      }
      const vksWx = kind === "arrival" && destAirport === "KVKS" ? chance(0.8) : null;
      const dir = directionArrow(trav.course);
      const conn = origin === "K" + entryNav ? " " : "./.";
      let routeStr;
      if (kind === "departure") routeStr = routeOverride || (originAirport + " " + entryNav + " " + aw.id + " " + exitNav + " " + dest);
      else if (kind === "arrival") {
        const tail = arrSpec.routeTail || "";
        // "MEI V18 MLU KMLU" when the entry airway is the tail's airway; else "MCB V9 MHZ V18 MLU KMLU"
        routeStr = origin + conn + entryNav + " " + (tail.split(" ")[0] === aw.id ? tail : aw.id + " " + exitNav + (tail ? " " + tail : "")) + " " + destAirport;
      }
      else routeStr = origin + conn + entryNav + " " + aw.id + " " + exitNav + " " + dest;

      const cs = callsign(ac);
      const exitFacility = (kind !== "arrival") ? FACILITY_OF_EXIT[exitNav] : null;

      const flight = {
        id: "F" + seq, seq: seq, kind: kind, cs: cs, ac: ac, type: ac.type, equip: equip, dme: dme, tas: tas, gs: gs,
        mpm: milesPerMinute(gs), aw: aw.id, trav: trav, startIdx: startIdx, endIdx: endIdx,
        course: trav.course, dirLabel: dir.label, wantsOdd: wantsOdd(trav),
        alt: filedAlt, reqAlt: filedAlt, appropriateAlt: alt, iafdof: !!iafdofAlt, floor: floor, cap: cap,
        originAirport: originAirport, destAirport: destAirport, origin: origin, dest: dest,
        entryNav: entryNav, exitNav: exitNav, exitFacility: exitFacility, nextSector: NEXT_SECTOR[exitNav] || null, prevSector: NEXT_SECTOR[entryNav] || null,
        iafdofApreqT: apreqT,
        holdFix: destAirport ? (arrSpec.holdFix || arrSpec.feeder) : null, hez026: hez026, depAtFix: depAtFix,
        nodes: nodes, events: events, baseT: baseT, route: routeStr, strips: [],
        onFreq: onFreq, entryT: entryT, icT: icT, altReq: altReq, vksWx: vksWx,
        moa: moa ? { id: moa.moa.id, airway: moa.moa.airway, from: moa.moa.from, toward: moa.moa.toward, floor: moa.moa.floor, fixAlt: moa.fixAlt, reroute: moa.reroute } : null
      };
      flight.strips = buildStrips(flight);
      return flight;
    }
    return null;
  }

  // Which posting is a departure strip's "next fix": the first compulsory
  // node after the airport in a different bay than the departure bay (0M8 and
  // KVKS -> MHZ; KJAN -> the fix after MHZ; KGWO -> the fix after SQS).
  function departureNextFix(flight) {
    const depBay = flight.nodes[0].bay;
    for (let i = 1; i < flight.nodes.length; i++) {
      const n = flight.nodes[i];
      if (n.comp && n.bay !== depBay) return n;
    }
    return flight.nodes[flight.nodes.length - 1];
  }
  function nodeIdxOf(nodes, id) { for (let i = 0; i < nodes.length; i++) if (nodes[i].id === id) return i; return -1; }
  function prevComp(flight, i) { for (let k = i - 1; k >= 0; k--) if (flight.nodes[k].comp) return flight.nodes[k]; return null; }
  function nextComp(flight, i) { for (let k = i + 1; k < flight.nodes.length; k++) if (flight.nodes[k].comp) return flight.nodes[k]; return null; }

  // The filed proposal time. It equals the assumed departure time unless the
  // clearance is held (a KVKS departure waiting for a KVKS arrival's landed report).
  function pTimeOf(f) { return f.propT != null ? f.propT : f.baseT; }

  // KVKS arrival vs. KVKS departure priority (Lab Procedures: the arrival has
  // priority unless the departure's proposal time is earlier than the arrival's
  // fix estimate; the course uses DORTS here). Arrival first: the departure
  // clearance waits for Flight Data's landed report (VKS estimate + 5), so the
  // assumed departure time becomes that report + 2 while the P-time stays as
  // filed. Departure first: nothing to shift — the conflict engine holds the
  // arrival at VKS until the departure reports past the pattern.
  // Returns the shifts applied (for a revert if the trial fails).
  function sequenceKVKS(all) {
    const shifts = [];
    const deps = all.filter(function (f) { return f.kind === "departure" && f.originAirport === "KVKS"; });
    const arrs = all.filter(function (f) { return f.kind === "arrival" && f.destAirport === "KVKS"; });
    deps.forEach(function (d) {
      if (d.waitLand) return;
      arrs.forEach(function (a) {
        const di = nodeIdxOf(a.nodes, "DORTS");
        const dortsT = di >= 0 ? a.nodes[di].t : a.nodes[a.nodes.length - 2].t;
        const P = pTimeOf(d);
        if (dortsT > P) return; // the departure has priority
        const landT = a.nodes[a.nodes.length - 2].t + 5;
        const clncT = P - 5; // the clearance is requested 5 minutes before the P-time
        if (landT <= clncT) return; // landed before the request: cleared on request
        const newBase = landT + 2;
        if (newBase <= d.baseT) return;
        const delta = newBase - d.baseT;
        shifts.push({ f: d, baseT: d.baseT, propT: d.propT, waitLand: d.waitLand, strips: d.strips });
        d.propT = P; d.baseT = newBase; d.waitLand = { arr: a.cs, arrId: a.id, landT: landT };
        d.nodes.forEach(function (n) { n.t += delta; });
        if (d.entryT != null) d.entryT += delta;
        d.strips = buildStrips(d);
        d.strips.forEach(function (s) { s.flight = d.seq; });
      });
    });
    return shifts;
  }
  function revertShifts(shifts) {
    shifts.forEach(function (sh) {
      const d = sh.f, delta = d.baseT - sh.baseT;
      d.nodes.forEach(function (n) { n.t -= delta; });
      if (d.entryT != null) d.entryT -= delta;
      d.baseT = sh.baseT; d.propT = sh.propT; d.waitLand = sh.waitLand; d.strips = sh.strips;
    });
  }

  function buildStrips(f) {
    const strips = [];
    const kind = f.kind;
    const suspense = kind === "departure";
    const depBay = kind === "departure" ? f.nodes[0].bay : null;
    const lastEv = f.events[f.events.length - 1];
    const firstFix = kind === "departure" ? departureNextFix(f) : null;

    f.events.forEach(function (ei, evNo) {
      const n = f.nodes[ei];
      const evt = evNo === 0 && kind === "departure" ? "departure" : (f.destAirport && evNo === f.events.length - 1 ? "arrival" : "enroute");
      const s = {};
      s["3"] = f.cs;
      s["4"] = (f.ac.heavy ? "H/" : "") + f.type + "/" + f.equip;
      s["5"] = "T" + f.tas;
      s["6"] = "66";
      // altitude: assigned in 20 once coordinated; a flight still in suspense
      // only has the pilot's requested altitude, which goes in 24 on all its strips
      if (suspense) s["24"] = altToHundreds(f.alt);
      else s["20"] = altToHundreds(f.alt);
      s["25"] = f.route;

      let prev = prevComp(f, ei);
      // the strip directly after a departure strip is preceded by the airport
      // itself: previous fix is the airport and the previous time is its P-time
      if (kind === "departure" && evNo === 1 && !f.depAtFix) prev = { id: f.originAirport, apt: true, t: f.baseT };
      const next = nextComp(f, ei);

      if (evt === "departure" && f.depAtFix) {
        // KMLU: the departure strip is the STUEE posting — airport and P-time in 11/12,
        // plus time to STUEE in 14a (no estimate: it depends on the departure time), MHZ next
        s["16"] = "↑";
        s["11"] = f.originAirport; s["12"] = "P" + toHHMM(pTimeOf(f));
        const pt = Math.round(n.rel); if (pt) s["14a"] = "+" + pt;
        s["19"] = n.id;
        s["21"] = next ? next.id : firstFix.id;
      } else if (evt === "departure") {
        s["16"] = "↑";
        s["21"] = firstFix.id;
        s["19"] = f.originAirport + " P" + toHHMM(pTimeOf(f));
      } else {
        // a boundary posting (first fix inside ZAE on an overflight/arrival)
        // has no previous fix in our airspace: its estimate is the one
        // received from the adjacent facility
        const atEntry = kind !== "departure" && ei === 0;
        // strips in suspense carry no times at all (every estimate depends on the
        // actual departure time): only the P-time and the plus times
        if (!atEntry && prev) {
          s["11"] = prev.id;
          if (prev.apt) s["12"] = "P" + toHHMM(pTimeOf(f)); else if (!suspense) s["12"] = toHHMM(prev.t);
        }
        if (!suspense) s["15"] = toHHMM(n.t);
        s["19"] = n.id;
        if (f.onFreq && evNo === 0) s["17"] = toHHMM(n.t); // on frequency at the start: the pilot's estimate
        if (evt === "arrival") { s["16"] = "↓"; s["21"] = next ? next.id : f.destAirport; if (!suspense) s["22"] = toHHMM((next || f.nodes[f.nodes.length - 1]).t); }
        else s["21"] = next ? next.id : f.dest;
        // plus time ONLY on en route strips that follow a ZAE departure
        if (kind === "departure" && prev) {
          const pt = Math.round(n.rel - (prev.apt ? 0 : prev.rel));
          if (pt) s["14a"] = "+" + pt;
        }
      }
      if (ei === lastEv && f.exitFacility) s["30"] = f.exitFacility;

      const key = keyBase(evt === "departure" ? "Departure" : evt === "arrival" ? "Arrival" : "En Route", f.ac, f.equip, f.tas, f.gs, f.cs);
      key.route = f.route;
      key.bay = n.bay + " bay";
      key.postedFix = evt === "departure" ? (f.originAirport + " (departure)") : n.id;
      if (s["11"]) key.previousFix = s["11"];
      if (s["21"]) key.nextFix = s["21"];
      const mea = maxMEA(f.trav, f.startIdx, f.endIdx);
      key.altitude = (suspense ? "Requested " : "Assigned ") + altPlain(f.alt) + "  (MEA " + mea.toLocaleString() + " ft; " + f.dirLabel + "-bound → " + (f.wantsOdd ? "odd" : "even") + " thousands" + (suspense ? "; in space 24 until coordinated" : "") + ")";
      if (suspense && s["14a"]) key.estimateMath = "In suspense: no estimate until the aircraft is off. Assumed (" + (f.waitLand ? "off " + toHHMM(f.baseT) + " after the landed report" : "P-time based") + "): " + s["11"] + (s["12"] ? " " + s["12"] : "") + " " + s["14a"] + " = " + n.id + " " + toHHMM(n.t) + "; recompute from the actual departure time.";
      else if (s["14a"]) key.estimateMath = "Est " + s["11"] + " " + s["12"] + " " + s["14a"] + " = " + n.id + " est " + s["15"];
      else if (s["15"] && s["11"]) key.estimateMath = "Est " + s["11"] + " " + s["12"] + " → " + n.id + " est " + s["15"];
      else if (s["15"]) key.estimateMath = "Est over " + n.id + " " + s["15"] + " received from " + ((ZAE.NAVAIDS[n.id] || {}).owner || "the adjacent facility") + " (boundary posting: no previous fix in ZAE)";
      if (f.onFreq && evNo === 0) key.notes.push("On frequency when the problem starts (entered Sector 66 about " + toHHMM(f.entryT) + "): pilot estimate in space 17 — check the altitude as level.");
      if (f.altReq) key.notes.push("Will request " + altPlain(f.altReq.alt) + " at " + toHHMM(f.altReq.t) + " (Remote's strip) — approve only if separated from traffic.");
      if (f.exitFacility && ei === lastEv) key.notes.push("Leaving ZAE to " + f.exitFacility + " — noted in space 30.");
      if (f.events.length > 1) key.notes.push("Part of a " + f.events.length + "-bay flight (" + f.events.map(function (i) { return f.nodes[i].bay; }).join(" → ") + "); all strips are one plane.");

      const strip = { type: evt, spaces: s, meta: key, bay: n.bay, homeBay: n.bay, flightId: f.id, nodeIdx: ei, cs: f.cs, order: evNo };
      if (kind === "departure") {
        strip.suspense = true;
        strip.suspenseTime = parseInt(toHHMM(pTimeOf(f)), 10);
        strip.bay = depBay;
        if (evt === "departure") key.proposedTime = "P" + toHHMM(pTimeOf(f)) + " (proposed departure; strip in suspense above the " + depBay + " bay header)" + (f.waitLand ? "; clearance held for " + f.waitLand.arr + "'s landed report at " + toHHMM(f.waitLand.landT) + ", assumed off " + toHHMM(f.baseT) : "");
        else key.notes.push("Departure still in suspense: this posting is held directly above the departure strip in the " + depBay + " bay until a clearance request comes in; it normally posts under " + n.bay + ".");
      }
      strips.push(strip);
    });
    return strips;
  }

  // Reject strips that break basic posting logic.
  function stripSane(st, kind) {
    const sp = st.spaces || {};
    const posted = String(sp["19"] || "").split(" ")[0];
    if (sp["11"] && posted && sp["11"] === posted) return false;
    if (kind !== "departure" && INTERNAL_APT[String(sp["25"] || "").split(/[ ./]/)[0]]) return false;
    return true;
  }

  // ---- scenario codes ----------------------------------------------------
  function makeCode(tierKey, count, type, seed) {
    return (TIERS[tierKey] || TIERS.trainee).code + count + (TYPE_CODES[type] || "A") + "-" + seed;
  }
  function parseCode(code) {
    const m = String(code || "").trim().toUpperCase().match(/^([TDC])(\d{1,2})([ADER])-([A-Z0-9]{4,10})$/);
    if (!m) return null;
    return { difficulty: TIER_BY_CODE[m[1]], count: Math.max(1, Math.min(12, parseInt(m[2], 10))), type: TYPE_BY_CODE[m[3]], seed: m[4] };
  }

  // ---- scenario --------------------------------------------------------
  // Generates `count` flights inside one 45-minute window, adding them one at
  // a time and keeping only the combinations the conflict engine can resolve
  // under the course rules (no moving level overflights, 2-minute rule only,
  // etc.). Deterministic for a given code.
  function generateScenario(opts) {
    opts = opts || {};
    const parsed = opts.code ? parseCode(opts.code) : null;
    const tierKey = (parsed && parsed.difficulty) || opts.difficulty || "trainee";
    const tier = TIERS[tierKey] || TIERS.trainee;
    const type = (parsed && parsed.type) || opts.type || "any";
    const seed = (parsed && parsed.seed) || (opts.seed ? String(opts.seed).toUpperCase() : randomSeed());
    rng = mulberry32(hashSeed(tierKey + "|" + type + "|" + seed));
    let count = (parsed && parsed.count) || opts.count;
    if (!count) count = rint(tier.countRange[0], tier.countRange[1]);
    const code = makeCode(tierKey, count, type, seed);

    // Scenario window: every posted time (P-times, fix and airport estimates
    // inside ZAE) lands within 45 minutes so the board reads as one problem.
    const win = { start: rint(0, 1380), span: 45 };
    const engine = root.ZAEConflicts || null;
    const flights = [];
    let analysis = null;
    let seq = 0;
    for (let i = 0; i < count; i++) {
      let t = type && type !== "any" ? type : pick(tier.types);
      if (t === "proposal") t = "departure";
      const kind = t === "departure" ? "departure" : t === "arrival" ? "arrival" : "overflight";
      let placed = false;
      for (let tries = 0; tries < 30 && !placed; tries++) {
        const k = tries < 20 ? kind : "overflight"; // fall back to an overflight if this kind will not fit
        const f = generateFlight(tier, k, win, ++seq);
        if (!f || !f.strips.every(function (st) { return stripSane(st, k); })) continue;
        const shifts = sequenceKVKS(flights.concat([f]));
        if (engine) {
          const trial = engine.analyze(flights.concat([f]), { window: win });
          if (!trial.ok) { revertShifts(shifts); continue; }
          analysis = trial;
        }
        f.seq = flights.length + 1;
        f.strips.forEach(function (s) { s.flight = f.seq; });
        flights.push(f);
        placed = true;
      }
    }
    if (engine && !analysis) analysis = engine.analyze(flights, { window: win });
    const strips = [];
    flights.forEach(function (f) { f.strips.forEach(function (s) { if (!s.bay) s.bay = bayForStrip(s); strips.push(s); }); });
    if (engine && analysis) engine.decorate(flights, analysis);
    // the current ATIS letter (KGWO arrivals check on with it); drawn last so the flights are unchanged
    const atis = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(rng() * 26)];
    if (root.ZAERemote) root.ZAERemote.decorate(flights, { atis: atis });
    rng = Math.random;
    return { code: code, seed: seed, difficulty: tierKey, type: type, count: count, window: win, flights: flights, strips: strips, analysis: analysis, atis: atis };
  }

  // Back-compatible: an array of strips (with the scenario attached).
  function generate(opts) {
    const sc = generateScenario(opts);
    const arr = sc.strips;
    arr.scenario = sc;
    return arr;
  }

  function generateOne(tierKey, forcedType) {
    const sc = generateScenario({ difficulty: tierKey, type: forcedType, count: 1 });
    return sc.strips[0] || null;
  }

  root.StripGen = {
    generate: generate,
    generateScenario: generateScenario,
    generateOne: generateOne,
    parseCode: parseCode,
    tiers: TIERS,
    bays: BAYS,
    bayOf: function (fix) { return BAY_OF[fix]; },
    toHHMM: toHHMM,
    _internal: { plusTime: plusTime, milesPerMinute: milesPerMinute, directionArrow: directionArrow, generateFlight: generateFlight, mulberry32: mulberry32 }
  };
})(typeof window !== "undefined" ? window : this);
