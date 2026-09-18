/*
 * Aero Center (ZAE) facility data — Sector 66 "Jackson Low" non-radar environment.
 * Sourced from Academy Initial En Route Qualification Training, Course 50148001:
 *   - LP03 Aero Center Airspace
 *   - LP05 Flight Progress Strips
 *   - Handout 00 ZAE Non-Radar Map (Sector 66, Jackson Low)
 *
 * All data is fictional / training-use only. Courses are approximate, derived from
 * the published radials and the sector map, and are internally consistent with the
 * hemispheric cruising-altitude parity assigned to each airway.
 *
 * Exposed as the global `ZAE`.
 */
(function (root) {
  "use strict";

  // ---- NAVAIDs & fixes ---------------------------------------------------
  // kind: VORTAC | VORDME | NDB | INT (intersection) | DME (dme fix)
  // owner: ZAE sector number, or adjacent facility id (ZHU/ZFW), or sector for tie-in navaids
  // dir: rough compass position relative to the MHZ hub (for flavor / reference)
  const NAVAIDS = {
    MHZ: { id: "MHZ", name: "Magnolia", kind: "VORTAC", owner: "66", dir: "hub" },
    SQS: { id: "SQS", name: "Sidon", kind: "VORTAC", owner: "66", dir: "N" },
    IGB: { id: "IGB", name: "Bigbee", kind: "VORTAC", owner: "12", dir: "NE" },
    MEI: { id: "MEI", name: "Meridian", kind: "VORTAC", owner: "65", dir: "E" },
    GLH: { id: "GLH", name: "Greenville", kind: "VOR/DME", owner: "67", dir: "NW" },
    BLE: { id: "BLE", name: "Lake Providence", kind: "NDB", owner: "66", dir: "W" },
    TKH: { id: "TKH", name: "Tallulah", kind: "NDB", owner: "66", dir: "SW" },
    VKS: { id: "VKS", name: "Vicksburg", kind: "NDB", owner: "66", dir: "SW" },
    // Tie-in / adjacent NAVAIDs used as airway endpoints
    MLU: { id: "MLU", name: "Monroe", kind: "VORTAC", owner: "ZFW", dir: "W" },
    MCB: { id: "MCB", name: "McComb", kind: "VORTAC", owner: "ZHU", dir: "S" },
    HEZ: { id: "HEZ", name: "Natchez", kind: "VOR/DME", owner: "ZHU", dir: "SW" },
    UJM: { id: "UJM", name: "Marvell", kind: "VOR/DME", owner: "15", dir: "N" },
    GCV: { id: "GCV", name: "Greene County", kind: "VORTAC", owner: "ZHU", dir: "SE" },
    HLI: { id: "HLI", name: "Holly Springs", kind: "VORTAC", owner: "12", dir: "N" },
    EIC: { id: "EIC", name: "Shelby", kind: "VORTAC", owner: "ZFW", dir: "W" },
    MEM: { id: "MEM", name: "Memphis", kind: "VORTAC", owner: "ZME", dir: "N" },
    TXK: { id: "TXK", name: "Texarkana", kind: "VORTAC", owner: "ZFW", dir: "W" }
  };

  // Named intersections / DME fixes on ZAE airways (for reference & remarks)
  const FIXES = {
    BOOSI: { id: "BOOSI", kind: "INT", def: "MHZ350/MEI284 (MHZ R-350 016 DME)" },
    MIZZE: { id: "MIZZE", kind: "INT", def: "MHZ129/MEI216 (MHZ R-129 058 DME)" },
    UBABY: { id: "UBABY", kind: "DME", def: "SQS023 023 DME" },
    HEDUD: { id: "HEDUD", kind: "INT", def: "MHZ266/SQS194 (MHZ R-266 023 DME), MRA 5000" },
    DINKY: { id: "DINKY", kind: "INT", def: "MLU087/HEZ353 (MHZ R-266 031 DME)" },
    STUEE: { id: "STUEE", kind: "INT", def: "MLU087/HEZ338 (MHZ R-266 019 DME) — nonradar" },
    DESKE: { id: "DESKE", kind: "DME", def: "GLH143 048 DME" },
    BARNE: { id: "BARNE", kind: "INT", def: "HEZ044/TKH135 (HEZ R-044 025 DME)" },
    ZAMMA: { id: "ZAMMA", kind: "INT", def: "MHZ049/OSX322 (MHZ R-049 046 DME)" },
    DORTS: { id: "DORTS", kind: "INT", def: "MLU102/MHZ251/HEZ011 (MHZ R-251 049 DME)" },
    HATER: { id: "HATER", kind: "INT", def: "MLU072/MHZ281 (MHZ R-281 049 DME)" },
    RICKS: { id: "RICKS", kind: "INT", def: "MHZ164/MCB016/LBY308 (MHZ R-164 038 DME)" },
    ARGUW: { id: "ARGUW", kind: "DME", def: "SQS156 016 DME" },
    HAZAL: { id: "HAZAL", kind: "INT", def: "MHZ194/MCB345/VKS126 (MHZ R-194 038 DME)" },
    YAZOO: { id: "YAZOO", kind: "DME", def: "MHZ335 030 DME" }
  };

  // ---- Airways -----------------------------------------------------------
  // points: ordered fix ids (forward direction)
  // legs:   nm between consecutive points (legs.length === points.length-1)
  // meaLegs: MEA per leg (feet)
  // postings: JAN Low fix postings (Appendix A). `at` = bay header the fix is filed under.
  // course: approx magnetic course in the listed (forward) direction; reverse = +180.
  const AIRWAYS = {
    V9: {
      id: "V9", points: ["MCB", "MHZ", "BOOSI", "SQS", "UJM"],
      legs: [72, 16, 42, 69], meaLegs: [3000, 3000, 3000, 3000],
      postings: [{ fix: "SQS", at: "SQS" }, { fix: "MHZ", at: "MHZ" }], course: 355
    },
    V11: {
      id: "V11", points: ["GCV", "MIZZE", "MHZ", "BOOSI", "SQS", "UBABY", "HLI"],
      legs: [62, 58, 16, 42, 23, 64], meaLegs: [3000, 3000, 3000, 3000, 3000, 3000],
      postings: [{ fix: "SQS", at: "SQS" }, { fix: "MHZ", at: "MHZ" }], course: 350
    },
    V18: {
      id: "V18", points: ["MLU", "STUEE", "DINKY", "HEDUD", "MHZ", "MEI"],
      legs: [19, 12, 41, 23, 70], meaLegs: [4000, 4000, 4000, 4000, 3000],
      postings: [{ fix: "STUEE", at: "VKS" }, { fix: "MHZ", at: "MHZ" }], course: 88
    },
    V74: {
      id: "V74", points: ["GLH", "DESKE", "MHZ"],
      legs: [48, 26], meaLegs: [3000, 3000],
      postings: [{ fix: "MHZ", at: "MHZ" }], course: 140
    },
    V245: {
      id: "V245", points: ["HEZ", "BARNE", "MHZ", "ZAMMA", "IGB"],
      legs: [26, 53, 46, 56], meaLegs: [3000, 3000, 3000, 3000],
      postings: [{ fix: "MHZ", at: "MHZ" }], course: 47
    },
    V278: {
      id: "V278", points: ["GLH", "SQS", "IGB"],
      legs: [36, 88], meaLegs: [3000, 3000],
      postings: [{ fix: "SQS", at: "SQS" }], course: 89
    },
    V417: {
      id: "V417", points: ["MLU", "DORTS", "MHZ", "MEI"],
      legs: [49, 49, 72], meaLegs: [5000, 4000, 3000],
      postings: [{ fix: "DORTS", at: "VKS" }, { fix: "MHZ", at: "MHZ" }], course: 80
    },
    V427: {
      id: "V427", points: ["MLU", "HATER", "MHZ"],
      legs: [49, 49], meaLegs: [5000, 4000],
      postings: [{ fix: "HATER", at: "VKS" }, { fix: "MHZ", at: "MHZ" }], course: 101
    },
    V535: {
      id: "V535", points: ["SQS", "HLI"],
      legs: [92], meaLegs: [3000],
      postings: [{ fix: "SQS", at: "SQS" }], course: 10
    },
    V555: {
      id: "V555", points: ["MCB", "RICKS", "MHZ", "ARGUW", "SQS"],
      legs: [37, 38, 44, 16], meaLegs: [3000, 3000, 3000, 3000],
      postings: [{ fix: "SQS", at: "SQS" }, { fix: "MHZ", at: "MHZ" }], course: 347
    },
    V557: {
      id: "V557", points: ["MCB", "HAZAL", "MHZ", "YAZOO", "SQS"],
      legs: [37, 38, 30, 30], meaLegs: [3000, 3000, 3000, 3000],
      postings: [{ fix: "SQS", at: "SQS" }, { fix: "MHZ", at: "MHZ" }], course: 358
    }
  };

  // Jet routes (high altitude, VKS High / MEI High / CBM High)
  const JETROUTES = {
    "J4-20": { id: "J4-20", points: ["EIC", "MHZ", "MEI"], legs: [185, 70], course: 91 },
    J35: { id: "J35", points: ["MEM", "SQS", "MCB"], legs: [94, 129], course: 185 },
    J52: { id: "J52", points: ["TXK", "SQS", "IGB"], legs: [191, 88], course: 89 }
  };

  // ---- Airports ----------------------------------------------------------
  // apch: approach control / airspace class. rwy: runway configuration(s).
  const AIRPORTS = {
    KJAN: { id: "KJAN", name: "Jackson International", apch: "JAN", rwy: "16/34", loc: "MHZ153010" },
    KHKS: { id: "KHKS", name: "Hawkins Field", apch: "JAN", rwy: "16/34", loc: "MHZ190010" },
    KJVW: { id: "KJVW", name: "John Bell Williams", apch: "JAN", rwy: "12/30", loc: "MHZ220017" },
    KVKS: { id: "KVKS", name: "Vicksburg", apch: "Class E", rwy: "1/19", loc: "at VKS NDB" },
    KTVR: { id: "KTVR", name: "Tallulah", apch: "Class E", rwy: "18/36", loc: "MHZ257044" },
    KGWO: { id: "KGWO", name: "Greenwood", apch: "Class D (Twr 120.2)", rwy: "5/23, 18/36", loc: "SQS076010" },
    "0M8": { id: "0M8", name: "Byerley", apch: "Class G", rwy: "17/35", loc: "at BLE NDB" },
    // Monroe is outside Sector 66 (ZFW); arrivals are cleared to DINKY on V18 (MLU LOA)
    KMLU: { id: "KMLU", name: "Monroe Regional", apch: "MLU", rwy: "4/22", loc: "at MLU VORTAC", external: true },
    // Natchez is ZHU's; KVKS departures reach it on the HEZ026 radial without progressing HEZ
    KHEZ: { id: "KHEZ", name: "Natchez", apch: "ZHU", rwy: "13/31", loc: "at HEZ VOR/DME", external: true }
  };

  // Airports associated with each airway-endpoint NAVAID, used to build realistic
  // point-of-origin / destination fields. Boundary NAVAIDs map to external fields;
  // interior ZAE NAVAIDs map to the nearest local field(s).
  const EXTERNAL_AIRPORTS = {
    // interior ZAE NAVAIDs -> nearby local airports
    MHZ: ["KJAN", "KHKS", "KJVW"],
    SQS: ["KGWO"],
    MEI: ["KMEI"],
    IGB: ["KCBM", "KTUP", "KGTR"],
    GLH: ["KGLH"],
    // boundary NAVAIDs -> external destinations
    MLU: ["KMLU", "KSHV", "KLFT"],
    MCB: ["KMCB", "KBTR", "KMSY"],
    MEI: ["KMEI", "KBHM", "KMGM"],
    IGB: ["KCBM", "KTUP", "KGTR"],
    HLI: ["KOLV", "KMEM", "KHKA"],
    GLH: ["KGLH", "KLIT", "KPBF"],
    UJM: ["KHEE", "KLIT", "KMEM"],
    GCV: ["KTCL", "KBHM", "KEET"],
    HEZ: ["KHEZ", "KBTR", "KASD"],
    EIC: ["KSHV", "KDFW", "KGGG"],
    MEM: ["KMEM", "KBNA", "KSTL"],
    TXK: ["KTXK", "KDFW", "KLIT"]
  };

  // ---- Sectors -----------------------------------------------------------
  const SECTORS_LOW = [
    { sector: "66", name: "JAN Low", freq: "125.0", freqG: "325.0" },
    { sector: "67", name: "GLH Low", freq: "126.0", freqG: "326.0" },
    { sector: "15", name: "HEE Low", freq: "127.0", freqG: "327.0" },
    { sector: "12", name: "CBM Low", freq: "128.0", freqG: "328.0" },
    { sector: "65", name: "EWA Low", freq: "129.0", freqG: "329.0" }
  ];

  const APPROACHES = {
    JAN: { id: "JAN", name: "Jackson Approach", freq: "119.2", freqG: "259.2", nonradarTop: 5000 },
    MLU: { id: "MLU", name: "Monroe Approach", freq: "118.2", freqG: "258.2", nonradarTop: 6000 }
  };

  // ---- Equipment suffixes (ZAE-common set, LP05 pg 10) --------------------
  // key: suffix letter (used after aircraft type, e.g. C172/A)
  const EQUIP = {
    X: { s: "X", nav: "No DME", xpdr: "No transponder" },
    T: { s: "T", nav: "No DME", xpdr: "Transponder, no Mode C" },
    U: { s: "U", nav: "No DME", xpdr: "Transponder with Mode C" },
    D: { s: "D", nav: "DME", xpdr: "No transponder" },
    B: { s: "B", nav: "DME", xpdr: "Transponder, no Mode C" },
    A: { s: "A", nav: "DME", xpdr: "Transponder with Mode C" },
    M: { s: "M", nav: "TACAN only", xpdr: "No transponder" },
    N: { s: "N", nav: "TACAN only", xpdr: "Transponder, no Mode C" },
    P: { s: "P", nav: "TACAN only", xpdr: "Transponder with Mode C" },
    Y: { s: "Y", nav: "RNAV", xpdr: "No transponder" },
    C: { s: "C", nav: "RNAV", xpdr: "Transponder, no Mode C" },
    I: { s: "I", nav: "RNAV", xpdr: "Transponder with Mode C" }
  };

  // ---- Aircraft types ----------------------------------------------------
  // cat: J=jet, T=turboprop, P=piston. tas=[min,max] filed true airspeed.
  // ga: general-aviation (files ETE, usually flies N-number).
  // Aircraft from the Block 1 "SH00 Aircraft Characteristic Study Guide"
  // (Course 50148001, V.2025-02). tas is the guide's true airspeed; types the
  // guide lists as 460+ file 480. Heavies and supers (B763, B772, A343, A388,
  // B742, B1, B2, C5, C17, K35R, B52) are omitted for now; if they return,
  // remember a heavy files with "H/" before the type in space 4.
  // cat: P piston, T turboprop, J jet. ga: N-number call sign. mil: military.
  const AIRCRAFT = [
    // Single-engine piston (160 kt column; overrides per guide)
    { type: "BE36", cat: "P", tas: [160, 160], ga: true, heavy: false },
    { type: "C172", cat: "P", tas: [120, 120], ga: true, heavy: false },
    { type: "C182", cat: "P", tas: [120, 120], ga: true, heavy: false },
    { type: "C210", cat: "P", tas: [160, 160], ga: true, heavy: false },
    { type: "PA24", cat: "P", tas: [120, 120], ga: true, heavy: false },
    { type: "PA32", cat: "P", tas: [160, 160], ga: true, heavy: false },
    { type: "PA46", cat: "P", tas: [160, 160], ga: true, heavy: false },
    { type: "SR22", cat: "P", tas: [160, 160], ga: true, heavy: false },
    // Twin-engine piston
    { type: "BE58", cat: "P", tas: [160, 160], ga: true, heavy: false },
    { type: "C421", cat: "P", tas: [200, 200], ga: true, heavy: false },
    { type: "PA31", cat: "P", tas: [160, 160], ga: true, heavy: false },
    { type: "PA34", cat: "P", tas: [160, 160], ga: true, heavy: false },
    // Turboprops
    { type: "C208", cat: "T", tas: [160, 160], ga: true, heavy: false },
    { type: "PC12", cat: "T", tas: [200, 200], ga: true, heavy: false },
    { type: "BE9T", cat: "T", tas: [200, 200], ga: true, heavy: false },
    { type: "B350", cat: "T", tas: [270, 270], ga: true, heavy: false },
    { type: "C441", cat: "T", tas: [240, 240], ga: true, heavy: false },
    { type: "B190", cat: "T", tas: [240, 240], ga: false, heavy: false },
    { type: "SW4",  cat: "T", tas: [240, 240], ga: false, heavy: false },
    { type: "DH8",  cat: "T", tas: [240, 240], ga: false, heavy: false },
    { type: "DH8D", cat: "T", tas: [270, 270], ga: false, heavy: false },
    { type: "SF34", cat: "T", tas: [240, 240], ga: false, heavy: false },
    { type: "C130", cat: "T", tas: [300, 300], ga: false, heavy: false, mil: true },
    // Jets: bizjets (GA registration)
    { type: "C510", cat: "J", tas: [320, 320], ga: true, heavy: false },
    { type: "EA50", cat: "J", tas: [320, 320], ga: true, heavy: false },
    { type: "BE40", cat: "J", tas: [430, 430], ga: true, heavy: false },
    { type: "LJ55", cat: "J", tas: [430, 430], ga: true, heavy: false },
    { type: "C750", cat: "J", tas: [480, 480], ga: true, heavy: false },
    { type: "GLF4", cat: "J", tas: [480, 480], ga: true, heavy: false },
    // Jets: military
    { type: "T37",  cat: "J", tas: [320, 320], ga: false, heavy: false, mil: true },
    { type: "T38",  cat: "J", tas: [480, 480], ga: false, heavy: false, mil: true },
    { type: "F16",  cat: "J", tas: [480, 480], ga: false, heavy: false, mil: true },
    // Jets: airline
    { type: "CRJ2", cat: "J", tas: [400, 400], ga: false, heavy: false },
    { type: "CRJ9", cat: "J", tas: [430, 430], ga: false, heavy: false },
    { type: "E145", cat: "J", tas: [430, 430], ga: false, heavy: false },
    { type: "E190", cat: "J", tas: [430, 430], ga: false, heavy: false },
    { type: "A320", cat: "J", tas: [430, 430], ga: false, heavy: false },
    { type: "B712", cat: "J", tas: [430, 430], ga: false, heavy: false },
    { type: "B738", cat: "J", tas: [430, 430], ga: false, heavy: false },
    { type: "MD82", cat: "J", tas: [430, 430], ga: false, heavy: false },
    { type: "B753", cat: "J", tas: [480, 480], ga: false, heavy: false }
  ];

  // Airline callsign prefixes (ICAO 3-letter) for non-GA jets/turboprops.
  const AIRLINES = ["AAL", "DAL", "UAL", "SWA", "JBU", "AAY", "NKS", "FDX", "UPS", "ASH", "SKW", "RPA", "ENY", "GJS"];
  // Military tactical call signs (word + two digits) for the guide's military types.
  const MIL_CALLSIGNS = ["REACH", "SABER", "VIPER", "HAWK", "TALON", "COLT", "DEMON", "TREND"];

  // ---- Radials (LP03 "Airways and Radials") --------------------------------
  // Outbound radial FROM each NAVAID along each airway TOWARD the named
  // neighbouring point. DCT holds the airport radials (LP03 airport locations)
  // and the preplanned departure joins; HOLD is the published holding radial.
  const RADIALS = {
    MHZ: {
      V9: { MCB: 179, BOOSI: 350 }, V11: { MIZZE: 129, BOOSI: 350 },
      V18: { HEDUD: 266, MEI: 91 }, V74: { DESKE: 320 },
      V245: { BARNE: 223, ZAMMA: 49 }, V417: { DORTS: 251, J417: 251, MEI: 106 },
      V427: { HATER: 281 }, V555: { RICKS: 164, ARGUW: 5 }, V557: { HAZAL: 194, YAZOO: 335 },
      DCT: { KJAN: 153, KJVW: 220, KHKS: 190 }, HOLD: 300
    },
    SQS: {
      V9: { BOOSI: 171, UJM: 341 }, V11: { BOOSI: 171, UBABY: 23 },
      V278: { GLH: 273, IGB: 86 }, V535: { HLI: 7 }, V555: { ARGUW: 156 }, V557: { YAZOO: 186 },
      DCT: { KGWO: 76 }, HOLD: 256
    },
    MLU: { V18: { STUEE: 87 }, V417: { DORTS: 102 }, V427: { HATER: 72 } },
    // holding fixes that are not NAVAIDs: bearings along the airway / direct legs
    DINKY: { V18: { HEDUD: 88, STUEE: 268 }, HOLD: 88 },
    VKS: { DCT: { DORTS: 330, KVKS: 0 }, HDG: { J417: 30, J417W: 330 }, HOLD: 195 },
    MCB: { V9: { MHZ: 1 }, V555: { RICKS: 16 }, V557: { HAZAL: 345 } },
    MEI: { V18: { MHZ: 272 }, V417: { MHZ: 257 } },
    IGB: { V245: { ZAMMA: 231 }, V278: { SQS: 266 } },
    GLH: { V74: { DESKE: 143 }, V278: { SQS: 92 } },
    HLI: { V11: { UBABY: 203 }, V535: { SQS: 187 } }
  };

  // DME divergence distance minima below FL180 (LP18, JO 7110.65 Table 6-5-2):
  // radials of the same NAVAID diverging by at least the angle are laterally
  // separated once either aircraft is this far from the NAVAID. Between two
  // rows use the greater distance; under 15 degrees there is no lateral.
  const DIVERGENCE = [[90, 5], [55, 6], [45, 7], [35, 8], [30, 9], [25, 11], [20, 13], [15, 17]];

  // Airway boundary mileages (LP03 pp. 33-35): where each airway leaves Sector
  // 66 airspace, or crosses an approach control's lateral boundary. `to` is
  // the facility on the far side. JAN and MLU approach are lateral boundaries
  // only (JAN nonradar 5,000 and below; MLU 6,000 and below).
  const BOUNDARIES = {
    V74: [{ nav: "GLH", nm: 26, dir: "SE", to: "67" }, { nav: "MHZ", nm: 20, dir: "NW", to: "JAN" }],
    V278: [{ nav: "SQS", nm: 13, dir: "NW", to: "67" }, { nav: "SQS", nm: 14, dir: "NE", to: "12" }],
    V9: [{ nav: "SQS", nm: 24, dir: "NW", to: "15" }, { nav: "MHZ", nm: 17, dir: "NW", to: "JAN" }, { nav: "MHZ", nm: 35, dir: "SE", to: "JAN" }, { nav: "MCB", nm: 21, dir: "NE", to: "ZHU" }],
    V535: [{ nav: "SQS", nm: 23, dir: "NE", to: "12" }],
    V11: [{ nav: "SQS", nm: 25, dir: "NE", to: "12" }, { nav: "MHZ", nm: 17, dir: "NW", to: "JAN" }, { nav: "MHZ", nm: 16, dir: "SE", to: "65" }],
    V245: [{ nav: "MHZ", nm: 14, dir: "NE", to: "65" }, { nav: "MHZ", nm: 26, dir: "SW", to: "JAN" }, { nav: "HEZ", nm: 20, dir: "NE", to: "ZHU" }],
    V18: [{ nav: "MHZ", nm: 12, dir: "SE", to: "65" }, { nav: "MHZ", nm: 19, dir: "SW", to: "JAN" }, { nav: "MLU", nm: 31, dir: "NE", to: "MLUAPCH" }, { nav: "MLU", nm: 15, dir: "NE", to: "ZFW" }],
    V417: [{ nav: "MHZ", nm: 12, dir: "SE", to: "65" }, { nav: "MHZ", nm: 20, dir: "SW", to: "JAN" }, { nav: "MLU", nm: 31, dir: "SE", to: "MLUAPCH" }, { nav: "MLU", nm: 16, dir: "SE", to: "ZFW" }],
    V427: [{ nav: "MHZ", nm: 18, dir: "NW", to: "JAN" }, { nav: "MLU", nm: 31, dir: "NE", to: "MLUAPCH" }, { nav: "MLU", nm: 14, dir: "NE", to: "ZFW" }],
    V555: [{ nav: "MHZ", nm: 17, dir: "NE", to: "JAN" }, { nav: "MHZ", nm: 35, dir: "SE", to: "JAN" }, { nav: "MCB", nm: 21, dir: "NE", to: "ZHU" }],
    V557: [{ nav: "MHZ", nm: 17, dir: "NW", to: "JAN" }, { nav: "MHZ", nm: 33, dir: "SW", to: "JAN" }, { nav: "MCB", nm: 21, dir: "NW", to: "ZHU" }]
  };

  // Points where a KGWO departure is clear of the SQS holding pattern /
  // KGWO approach airspace (LP18 "SQS holding pattern" figure), by the
  // airway it climbs out on. `apch` is the larger distance that also clears
  // the approach and missed-approach airspace (V11 and V278 east).
  const SQS_CLEAR = {
    "V9:UJM": { nm: 8, dir: "NW" }, "V535:HLI": { nm: 8, dir: "NE" },
    "V11:UBABY": { nm: 7, dir: "NE", apch: 10 }, "V278:IGB": { nm: 7, dir: "NE", apch: 14 },
    "V278:GLH": { nm: 17, dir: "NW" }, "V557:YAZOO": { nm: 7, dir: "SW" },
    "V9:BOOSI": { nm: 5, dir: "SE" }, "V11:BOOSI": { nm: 5, dir: "SE" }, "V555:ARGUW": { nm: 7, dir: "SE" }
  };

  // Holding pattern airspace (H00 Color Card Stock Map): the distance from
  // the holding fix, along each radial, at which an aircraft is clear of the
  // published holding pattern's protected airspace (template 8). `apch` is
  // the larger distance that also clears the KGWO approach and missed
  // approach airspace (V11 and V278 east of SQS). Airport radials are the
  // direct legs to/from the fields under the pattern.
  const HPA = {
    MHZ: { hold: "NW", radial: 300, clear: { 320: 17, 335: 13, 350: 9, 5: 7, 49: 6, 91: 6, 106: 6, 129: 6, 164: 7, 179: 7, 194: 8, 223: 9, 251: 14, 266: 17, 281: 17, 153: 7, 190: 7, 220: 9 } },
    SQS: { hold: "SW", radial: 256, clear: { 273: 17, 341: 8, 7: 8, 23: 7, 86: 7, 156: 7, 171: 5, 186: 7, 76: 7 }, apch: { 23: 10, 86: 14 } },
    // DINKY (MLU R-087 at 31 DME): hold northeast on V18. Clear 17 nm toward
    // HEDUD (the card's "X 48 NE MLU"); the pattern also covers V427 between
    // the MLU Approach boundary and 45 NE MLU ("X 45 NE MLU"). EFC is the
    // DINKY estimate + 5 (MLU LOA: TCP time + 5).
    DINKY: { hold: "NE on V18", radial: 88, efc: 5, clear: { 88: 17, 268: 5 },
      segments: [{ airway: "V427", nav: "MLU", from: 31, to: 45, miss: "X 45 NE MLU" }],
      miss: [{ airway: "V18", text: "X 48 NE MLU" }, { airway: "V427", text: "X 45 NE MLU" }] },
    // VKS NDB (KVKS is on the field): hold southwest on the 195 bearing, left
    // turns, between the 195 and 206 bearings. The pattern covers V417 between
    // 37 SW MHZ and DORTS ("X 37 SW MHZ") and the HEZ026R inside 25 NE HEZ
    // ("X 25 NE HEZ"). EFC is the VKS estimate + 10.
    VKS: { hold: "SW on the 195 bearing", radial: 195, efc: 10, clear: { 330: 8, 30: 8, 0: 0 },
      segments: [{ airway: "V417", nav: "MHZ", from: 37, to: 49, miss: "X 37 SW MHZ" }, { airway: "HEZ026R", nav: "HEZ", from: 25, to: 42, miss: "X 25 NE HEZ" }],
      miss: [{ airway: "V417", text: "X 37 SW MHZ" }, { airway: "HEZ026R", text: "X 25 NE HEZ" }] }
  };

  // Special use airspace that is always active at Aero Center (course
  // direction): Columbus 3 MOA over KGWO and northeast of SQS on V11, and
  // Meridian 1 West on V245 northeast of MHZ (both 8,000 up to FL180).
  const MOA = {
    CBM3: { floor: 8000, ceiling: 17999, kgwoClear: { nm: 8, dir: "NE", alt: 7000 }, airways: [{ airway: "V11", from: "SQS", toward: "HLI" }] },
    MEI1W: { floor: 8000, ceiling: 17999, airways: [{ airway: "V245", from: "MHZ", toward: "IGB" }] }
  };

  // Preplanned departure paths that are never depicted on the strip: the leg
  // from the airport to its first NAVAID/airway. [point, nm, via]. Byerley
  // flies 150 to join V427 near HATER (about 8 nm), then V427 to MHZ.
  // Vicksburg departs northeast and flies 030 about 10 nm to join V417 (J417,
  // about 35 nm southwest of MHZ). KGWO/KJAN/KJVW go direct to the VORTAC.
  const DEP_PATHS = {
    "0M8": [["HATER", 8, "HDG"], ["MHZ", 49, "V427"]],
    KVKS: [["J417", 10, "HDG"]],          // eastbound: 030 joins about 35 nm SW of MHZ
    KVKSW: [["J417W", 7, "HDG"]],         // westbound: 330 joins about 5 nm E of DORTS
    KGWO: [["SQS", 10, "DCT"]],
    KJAN: [["MHZ", 10, "DCT"]],
    KJVW: [["MHZ", 17, "DCT"]]
  };
  // Distances from the KVKS join points along V417.
  const J417 = { toMHZ: 35, toDORTS: 14, westToDORTS: 5 };

  root.ZAE = {
    NAVAIDS, FIXES, AIRWAYS, JETROUTES, AIRPORTS, EXTERNAL_AIRPORTS,
    SECTORS_LOW, APPROACHES, EQUIP, AIRCRAFT, AIRLINES, MIL_CALLSIGNS,
    RADIALS, DIVERGENCE, BOUNDARIES, SQS_CLEAR, HPA, MOA, DEP_PATHS, J417,
    LOW_CEILING: 23000, // ZAE low sectors: FL230 and below

    // Convenience: resolve a fix/navaid id to a display + description.
    describeFix: function (id) {
      if (NAVAIDS[id]) return NAVAIDS[id].name + " " + NAVAIDS[id].kind + " (" + id + ")";
      if (FIXES[id]) return id + " — " + FIXES[id].def;
      if (AIRPORTS[id]) return AIRPORTS[id].name + " (" + id + ")";
      return id;
    }
  };
})(typeof window !== "undefined" ? window : this);
