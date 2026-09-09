/*
 * ZAE Sector 66 "Jackson Low" non-radar map.
 * Boundaries, airways and holding patterns are traced from the official chart's
 * vector geometry (zae-map-geom.js, rotated north-up); fixes sit at their exact
 * chart positions. Jet routes are omitted (nonradar focus). Every element type
 * is a toggle-able layer (all on by default).
 */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const G = window.ZAE_MAPGEOM, ZAE = window.ZAE;
  const CX = 900, CY = 660, PXNM = 7.276, ANGOFF = 10;
  function polar(o, radial, distNM) {
    const a = (radial + ANGOFF) * Math.PI / 180;
    return [o[0] + distNM * PXNM * Math.sin(a), o[1] - distNM * PXNM * Math.cos(a)];
  }

  const FIX = {
    MHZ: [900, 660], SQS: [900, 238], MEI: [1451, 774], IGB: [1612, 296],
    MLU: [143, 563], MCB: [819, 1122], GLH: [657, 184], HEZ: [389, 994],
    BOOSI: [897, 529], ARGUW: [958, 458], YAZOO: [836, 433], MIZZE: [1199, 976],
    HEDUD: [696, 632], DINKY: [380, 594], STUEE: [298, 585], DESKE: [754, 421],
    BARNE: [542, 891], ZAMMA: [1244, 486], DORTS: [498, 700], HATER: [521, 518],
    RICKS: [922, 938], HAZAL: [774, 916], UBABY: [951, 154],
    UJM: [838, -72], HLI: [990, -52], HLI2: [1071, -41], GCV: [1276, 1058]
  };
  const NAV_VORTAC = ["MHZ", "SQS", "MEI", "IGB", "MLU", "MCB"];
  const NAV_VORDME = ["GLH", "HEZ"];
  const COMPULSORY = ["STUEE", "HATER", "DORTS", "ZAMMA", "MIZZE"];
  const NONCOMP = ["DINKY", "HEDUD", "BOOSI", "HAZAL", "RICKS", "UBABY", "ARGUW", "DESKE", "BARNE", "YAZOO"];

  // airports/NDBs placed by radial/DME from a NAVAID, or at explicit coords
  const AIRPORTS_POLAR = [["KJAN", "MHZ", 153, 10], ["KHKS", "MHZ", 190, 10], ["KJVW", "MHZ", 220, 17], ["KTVR", "MHZ", 257, 44], ["KGWO", "SQS", 76, 10]];
  const AIRPORTS_XY = [["KVKS", 470, 795]];
  const NDBS_XY = [["BLE", 513, 428, 10, -4], ["TKH", 432, 762, -12, 2], ["VKS", 470, 795, 12, 4]];

  const LBL = {
    MHZ: [16, 6], SQS: [16, 6], MEI: [16, 6], IGB: [16, 6], MLU: [-16, 6, "end"],
    MCB: [0, 28], GLH: [-14, -8, "end"], HEZ: [-14, 6, "end"],
    BOOSI: [-12, 0, "end"], ARGUW: [12, 2], YAZOO: [-12, 2, "end"], MIZZE: [12, 6],
    DINKY: [0, 20], STUEE: [-6, 20, "end"], DESKE: [-12, 0, "end"],
    BARNE: [12, 6], ZAMMA: [10, -8], DORTS: [0, 20], HATER: [10, -8],
    RICKS: [14, 4], HAZAL: [-12, 4, "end"], UBABY: [12, 2]
  };
  const EXITS = [["UJM", "TO UJM"], ["HLI", "TO HLI"], ["HLI2", "TO HLI"], ["GCV", "TO GCV"]];

  // Diamond (boundary) mileages: [value, originNav, radial, boundaryType]
  const DIAMONDS = [
    ["20", "MHZ", 320, "apch"], ["17", "MHZ", 335, "apch"], ["17", "MHZ", 350, "apch"], ["17", "MHZ", 5, "apch"],
    ["35", "MHZ", 164, "apch"], ["35", "MHZ", 179, "apch"], ["33", "MHZ", 194, "apch"],
    ["26", "MHZ", 223, "apch"], ["20", "MHZ", 251, "apch"], ["19", "MHZ", 266, "apch"], ["18", "MHZ", 281, "apch"],
    ["14", "MHZ", 49, "sector"], ["12", "MHZ", 91, "sector"], ["12", "MHZ", 106, "sector"], ["16", "MHZ", 129, "sector"],
    ["24", "SQS", 341, "sector"], ["23", "SQS", 7, "sector"], ["25", "SQS", 23, "sector"], ["14", "SQS", 86, "sector"], ["13", "SQS", 273, "sector"],
    ["26", "GLH", 143, "sector"],
    ["14", "MLU", 72, "artcc"], ["15", "MLU", 87, "artcc"], ["16", "MLU", 102, "artcc"],
    ["31", "MLU", 72, "apch"], ["31", "MLU", 87, "apch"], ["31", "MLU", 102, "apch"],
    ["21", "MCB", 345, "artcc"], ["21", "MCB", 1, "artcc"], ["21", "MCB", 16, "artcc"],
    ["20", "HEZ", 44, "artcc"]
  ];
  const RADIALS = {
    MHZ: [5, 49, 91, 106, 129, 164, 179, 194, 223, 251, 266, 281, 300, 320, 335, 350],
    SQS: [7, 23, 86, 156, 171, 186, 256, 273, 341],
    MEI: [257, 272], MLU: [72, 87, 102], MCB: [345, 1, 16], HEZ: [26, 44], GLH: [92, 143]
  };
  const MILES = [
    ["MCB", "MHZ", 72], ["MHZ", "BOOSI", 16], ["BOOSI", "SQS", 42], ["SQS", "UJM", 69],
    ["GCV", "MIZZE", 62], ["MIZZE", "MHZ", 58], ["SQS", "UBABY", 23], ["UBABY", "HLI2", 64],
    ["MLU", "STUEE", 19], ["STUEE", "DINKY", 12], ["DINKY", "HEDUD", 41], ["HEDUD", "MHZ", 23], ["MHZ", "MEI", 70],
    ["GLH", "DESKE", 48], ["DESKE", "MHZ", 26],
    ["HEZ", "BARNE", 26], ["BARNE", "MHZ", 53], ["MHZ", "ZAMMA", 46], ["ZAMMA", "IGB", 56],
    ["GLH", "SQS", 36], ["SQS", "IGB", 88],
    ["MLU", "DORTS", 49], ["DORTS", "MHZ", 49], ["MLU", "HATER", 49], ["HATER", "MHZ", 49],
    ["SQS", "HLI", 92],
    ["MCB", "RICKS", 37], ["RICKS", "MHZ", 38], ["MHZ", "ARGUW", 44], ["ARGUW", "SQS", 16],
    ["MCB", "HAZAL", 37], ["HAZAL", "MHZ", 38], ["MHZ", "YAZOO", 30], ["YAZOO", "SQS", 30]
  ];
  // Airway id + MEA: [fromFix, toFix, awyId, mea]
  const AWYMEA = [
    ["BOOSI", "SQS", "V9", "3000"], ["MIZZE", "MHZ", "V11", "3000"],
    ["STUEE", "DINKY", "V18", "4000"], ["MHZ", "MEI", "V18", "3000"],
    ["GLH", "DESKE", "V74", "3000"], ["BARNE", "MHZ", "V245", "3000"],
    ["GLH", "SQS", "V278", "3000"], ["MLU", "DORTS", "V417", "5000"], ["DORTS", "MHZ", "V417", "4000"],
    ["MLU", "HATER", "V427", "5000"], ["HATER", "MHZ", "V427", "4000"],
    ["SQS", "HLI", "V535", "3000*2000"], ["RICKS", "MHZ", "V555", "3000"], ["HAZAL", "MHZ", "V557", "3000"]
  ];
  const SECTORS = [
    [560, -70, "15", "HEE LO", "127.0 - 327.0"], [1180, 90, "12", "CBM LO", "128.0 - 328.0"],
    [1460, 560, "65", "EWA LO", "129.0 - 329.0"], [300, 300, "67", "GLH LO", "126.0 - 326.0"],
    [110, 470, "F30", "MLU LO", "135.1 - 335.1"], [250, 1120, "H40", "POE LO", "134.1 - 334.1"],
    [560, 1170, "H27", "PCU LO", "133.1 - 333.1"], [1180, 1140, "H65", "MCB HI", "133.25 - 333.25"]
  ];
  // compact sector blocks placed between V427 and V74
  const SECTORS_SM = [
    [712, 560, "66", "JAN LO", "125.0 - 325.0"], [712, 600, "45", "VKS HI", "130.25 - 330.25"]
  ];
  const MOA_LABELS = [["COLUMBUS 3 MOA", 1230, 130], ["MERIDIAN 1 WEST", 1230, 620], ["MERIDIAN 2 WEST", 1210, 960]];

  function E(n, a, p) { const e = document.createElementNS(NS, n); if (a) for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function T(x, y, s, cls, p, extra) { const t = E("text", Object.assign({ x: x, y: y, class: cls }, extra || {}), p); t.textContent = s; return t; }
  function poly(arr, cls, p, closed) { arr.forEach(function (pl) { E(closed ? "polygon" : "polyline", { points: pl.map(function (q) { return q.join(","); }).join(" "), class: cls }, p); }); }

  // ray (O, angle deg from up clockwise) vs boundary segments -> nearest hit point
  function rayHit(o, angDeg, segLists) {
    const a = (angDeg + ANGOFF) * Math.PI / 180;
    const ux = Math.sin(a), uy = -Math.cos(a);
    let best = null, bt = 1e9;
    segLists.forEach(function (pls) {
      pls.forEach(function (pl) {
        for (let i = 0; i < pl.length - 1; i++) {
          const ax = pl[i][0], ay = pl[i][1], bx = pl[i + 1][0], by = pl[i + 1][1];
          const dx = bx - ax, dy = by - ay;
          const den = ux * dy - uy * dx;
          if (Math.abs(den) < 1e-6) continue;
          const t = ((ax - o[0]) * dy - (ay - o[1]) * dx) / den;
          const s = ((ax - o[0]) * uy - (ay - o[1]) * ux) / den;
          if (t > 4 && s >= 0 && s <= 1 && t < bt) { bt = t; best = [o[0] + ux * t, o[1] + uy * t]; }
        }
      });
    });
    return best ? { pt: best, t: bt, ux: ux, uy: uy } : null;
  }

  function hexPts(cx, cy, r) {
    const p = [];
    for (let k = 0; k < 6; k++) { const a = k * 60 * Math.PI / 180; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return p;
  }

  function build() {
    const host = document.getElementById("map"); if (!host || !G || !ZAE) return;
    host.innerHTML = "";
    const svg = E("svg", { viewBox: "80 -150 1640 1400", class: "zae-map", role: "img", "aria-label": "ZAE Sector 66 non-radar map" }, host);
    const layers = {};
    function L(id, label) { const g = E("g", { "data-layer": id }, svg); layers[id] = { label: label, g: g }; return g; }
    const gHold = L("holding", "Holding patterns");
    const gMOA = L("moa", "MOAs");
    const gApch = L("apch", "Approach airspace");
    const gSector = L("sector", "Sector borders");
    const gArtcc = L("artcc", "ARTCC boundaries");
    const gAirway = L("airways", "Airways");
    const gAwy = L("awy", "Airway / MEA labels");
    const gMiles = L("miles", "Route mileages");
    const gDiam = L("diamonds", "Diamond mileages");
    const gRad = L("radials", "Radials");
    const gApt = L("airports", "Airports & NDBs");
    const gNav = L("navaids", "NAVAIDs & fixes");
    const gLbl = L("labels", "Fix labels");
    const gSec = L("sectors", "Sector info");
    const gMia = L("mia", "MIA chart");

    // holding patterns / shaded blobs (bottom)
    if (G.gray) poly(G.gray.filter(function (pl) { return pl.length >= 4; }), "hold", gHold, true);
    // boundaries & airways
    poly(G.moa, "moa", gMOA);
    poly(G.apch, "bnd-apch", gApch);
    poly(G.sector, "bnd-sector", gSector);
    poly(G.artcc, "bnd-artcc", gArtcc);
    if (G.blk) poly(G.blk, "bnd-artcc", gArtcc); // ZFW/ZHU + other solid borders
    // HEZ R-026 line to VKS
    E("line", { x1: FIX.HEZ[0], y1: FIX.HEZ[1], x2: 470, y2: 795, class: "thinline" }, gArtcc);
    poly(G.airway, "vic", gAirway);
    EXITS.forEach(function (e) { const p = FIX[e[0]]; T(p[0], p[1] - 10, e[1], "exit-lbl", gAwy); });

    // airway id + MEA labels (offset perpendicular toward hub side)
    AWYMEA.forEach(function (m) {
      const a = FIX[m[0]], b = FIX[m[1]]; if (!a || !b) return;
      let mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      let nx = -dy / len, ny = dx / len;
      if ((mx + nx * 10 - CX) ** 2 + (my + ny * 10 - CY) ** 2 < (mx - nx * 10 - CX) ** 2 + (my - ny * 10 - CY) ** 2) { nx = -nx; ny = -ny; }
      mx += nx * 13; my += ny * 13;
      T(mx, my - 5, m[2], "awy", gAwy);
      T(mx, my + 7, m[3], "mea", gAwy);
    });
    // route mileage boxes (offset perpendicular AWAY from hub so they clear lines/fixes)
    MILES.forEach(function (m) {
      const a = FIX[m[0]], b = FIX[m[1]]; if (!a || !b) return;
      let mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      let nx = -dy / len, ny = dx / len;
      if ((mx + nx * 12 - CX) ** 2 + (my + ny * 12 - CY) ** 2 < (mx - nx * 12 - CX) ** 2 + (my - ny * 12 - CY) ** 2) { nx = -nx; ny = -ny; }
      mx += nx * 12; my += ny * 12;
      const w = String(m[2]).length * 8 + 8;
      E("rect", { x: mx - w / 2, y: my - 8, width: w, height: 15, class: "milebox" }, gMiles);
      T(mx, my + 3.5, String(m[2]), "milebox-t", gMiles);
    });

    // diamond mileages placed at the boundary edge (inset toward origin)
    const BSET = { apch: [G.apch], sector: [G.sector], artcc: [G.artcc, G.blk || []] };
    DIAMONDS.forEach(function (d) {
      const o = FIX[d[1]]; if (!o) return;
      const hit = rayHit(o, d[2], BSET[d[3]]);
      let p;
      if (hit) { p = [hit.pt[0] - hit.ux * 11, hit.pt[1] - hit.uy * 11]; }
      else { p = polar(o, d[2], 20); }
      const s = 10;
      E("polygon", { points: [p[0], p[1] - s, p[0] + s, p[1], p[0], p[1] + s, p[0] - s, p[1]].join(" "), class: "diamond" }, gDiam);
      T(p[0], p[1] + 4, d[0], "diamond-t", gDiam);
    });

    // radials
    Object.keys(RADIALS).forEach(function (nid) {
      const o = FIX[nid]; if (!o) return;
      RADIALS[nid].forEach(function (r) { const p = polar(o, r, 8.5); T(p[0], p[1] + 3, ("00" + r).slice(-3), "radial", gRad); });
    });

    // airports & NDBs
    function airport(x, y, id, dx, dy, anch) {
      E("circle", { cx: x, cy: y, r: 4, class: "apt" }, gApt);
      E("line", { x1: x - 6, y1: y, x2: x + 6, y2: y, class: "apt-t" }, gApt);
      E("line", { x1: x, y1: y - 6, x2: x, y2: y + 6, class: "apt-t" }, gApt);
      if (id) T(x + (dx || 8), y + (dy || 4), id, "nname-sm", gApt, anch ? { "text-anchor": anch } : null);
    }
    function ndb(x, y, id, dx, dy) {
      for (let r = 3; r <= 9; r += 3) E("circle", { cx: x, cy: y, r: r, class: "ndb" }, gApt);
      E("circle", { cx: x, cy: y, r: 1.5, class: "ndb-dot" }, gApt);
      if (id) T(x + dx, y + dy, id, "nname-sm", gApt);
    }
    AIRPORTS_POLAR.forEach(function (a) { const p = polar(FIX[a[1]], a[2], a[3]); airport(p[0], p[1], a[0]); });
    NDBS_XY.forEach(function (n) { ndb(n[1], n[2], n[0], n[3], n[4]); });
    AIRPORTS_XY.forEach(function (a) { airport(a[1], a[2], a[0], 12, 14); });
    T(513 + 10, 428 + 8, "0M8", "nname-sm", gApt);

    // NAVAID + fix symbols
    function vortac(p) {
      E("polygon", { points: hexPts(p[0], p[1], 8).map(function (q) { return q.join(","); }).join(" "), class: "vor" }, gNav);
      [0, 2, 4].forEach(function (k) { const a = k * 60 * Math.PI / 180; const tx = p[0] + Math.cos(a) * 8.5, ty = p[1] + Math.sin(a) * 8.5; E("rect", { x: tx - 2.6, y: ty - 2.6, width: 5.2, height: 5.2, class: "vor-tab" }, gNav); });
      E("polygon", { points: [p[0] + 2, p[1] - 3, p[0] + 2, p[1] + 3, p[0] - 3, p[1]].join(" "), class: "vor-in" }, gNav);
    }
    function vordme(p) {
      E("rect", { x: p[0] - 10, y: p[1] - 10, width: 20, height: 20, class: "vordme" }, gNav);
      E("polygon", { points: hexPts(p[0], p[1], 6.5).map(function (q) { return q.join(","); }).join(","), class: "vor" }, gNav);
      E("polygon", { points: [p[0] + 1.6, p[1] - 2.4, p[0] + 1.6, p[1] + 2.4, p[0] - 2.4, p[1]].join(" "), class: "vor-in" }, gNav);
    }
    function fix(p, comp) { E("polygon", { points: [p[0], p[1] - 8, p[0] + 7, p[1] + 5, p[0] - 7, p[1] + 5].join(" "), class: comp ? "fix-c" : "fix-nc" }, gNav); }
    NAV_VORTAC.forEach(function (id) { vortac(FIX[id]); });
    NAV_VORDME.forEach(function (id) { vordme(FIX[id]); });
    COMPULSORY.forEach(function (id) { fix(FIX[id], true); });
    NONCOMP.forEach(function (id) { fix(FIX[id], false); });

    // MRA flag at HEDUD
    (function () {
      const p = FIX.HEDUD;
      E("line", { x1: p[0], y1: p[1] - 8, x2: p[0], y2: p[1] - 20, class: "flagpole" }, gNav);
      E("polygon", { points: [p[0], p[1] - 20, p[0] + 9, p[1] - 17, p[0], p[1] - 14].join(" "), class: "flag" }, gNav);
    })();

    // fix labels
    Object.keys(LBL).forEach(function (id) { const p = FIX[id], o = LBL[id]; T(p[0] + o[0], p[1] + o[1], id, "nname", gLbl, o[2] ? { "text-anchor": o[2] } : null); });
    // HEDUD label top-left + MRA underneath
    T(FIX.HEDUD[0] - 10, FIX.HEDUD[1] - 6, "HEDUD", "nname", gLbl, { "text-anchor": "end" });
    T(FIX.HEDUD[0] - 10, FIX.HEDUD[1] + 6, "MRA 5000", "note-sm", gLbl, { "text-anchor": "end" });

    // sector legends
    function secBlock(s, cls) { T(s[0], s[1], s[2], cls[0], gSec); T(s[0], s[1] + 18, s[3], cls[1], gSec); T(s[0], s[1] + 34, s[4], cls[2], gSec); }
    SECTORS.forEach(function (s) { secBlock(s, ["sec-num", "sec-name", "sec-freq"]); });
    SECTORS_SM.forEach(function (s) { T(s[0], s[1], s[2] + " " + s[3], "sec-name-sm", gSec); T(s[0], s[1] + 13, s[4], "sec-freq-sm", gSec); });
    // approach control notes
    T(120, 720, "MLU APCH", "sec-name", gSec); T(120, 736, "SFC-060 NR", "sec-freq", gSec); T(120, 752, "118.2 - 258.2", "sec-freq", gSec);
    const jan = polar(FIX.MHZ, 153, 10);
    T(jan[0] + 14, jan[1] + 40, "JAN APCH", "sec-name", gSec); T(jan[0] + 14, jan[1] + 56, "SFC-050 NR", "sec-freq", gSec); T(jan[0] + 14, jan[1] + 72, "119.2 - 259.2", "sec-freq", gSec);
    MOA_LABELS.forEach(function (m) { T(m[1], m[2], m[0], "moa-lbl", gMOA); T(m[1], m[2] + 13, "8000-FL180 by NOTAM", "moa-sub", gMOA); });

    // MIA chart
    const mx0 = 1360, my0 = -130, mw = 330, mh = 200;
    E("rect", { x: mx0, y: my0, width: mw, height: mh, class: "mia-box" }, gMia);
    T(mx0 + 14, my0 + 28, "MIA CHART", "mia-title", gMia);
    T(mx0 + mw / 2, my0 + 28, "3200", "mia-val", gMia);
    T(mx0 + mw / 2, my0 + 90, "2500", "mia-val", gMia);
    T(mx0 + mw / 2, my0 + 184, "2700", "mia-val", gMia);
    E("line", { x1: mx0 + 70, y1: my0 + 62, x2: mx0 + 292, y2: my0 + 62, class: "mia-line" }, gMia);
    T(mx0 + 60, my0 + 65, "GLH", "mia-nn", gMia, { "text-anchor": "end" }); T(mx0 + 160, my0 + 52, "SQS", "mia-nn", gMia); T(mx0 + 302, my0 + 65, "IGB", "mia-nn", gMia);
    T(mx0 + 225, my0 + 55, "V278", "mia-awy", gMia);
    E("line", { x1: mx0 + 70, y1: my0 + 146, x2: mx0 + 292, y2: my0 + 146, class: "mia-line" }, gMia);
    T(mx0 + 60, my0 + 149, "MLU", "mia-nn", gMia, { "text-anchor": "end" }); T(mx0 + 160, my0 + 136, "MHZ", "mia-nn", gMia); T(mx0 + 302, my0 + 149, "MEI", "mia-nn", gMia);
    T(mx0 + 225, my0 + 139, "V18", "mia-awy", gMia);

    buildToggles(layers);
  }

  function buildToggles(layers) {
    const host = document.getElementById("map-toggles"); if (!host) return;
    host.innerHTML = "";
    Object.keys(layers).forEach(function (id) {
      const lab = document.createElement("label"); lab.className = "toggle";
      const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = true;
      cb.addEventListener("change", function () { layers[id].g.style.display = cb.checked ? "" : "none"; });
      lab.appendChild(cb); lab.appendChild(document.createTextNode(" " + layers[id].label));
      host.appendChild(lab);
    });
    const bar = document.getElementById("map-toggle-actions");
    if (bar) {
      bar.innerHTML = "";
      function act(txt, on) { const b = document.createElement("button"); b.className = "btn btn-ghost"; b.textContent = txt; b.addEventListener("click", function () { host.querySelectorAll("input").forEach(function (cb) { if (cb.checked !== on) { cb.checked = on; cb.dispatchEvent(new Event("change")); } }); }); bar.appendChild(b); }
      act("All on", true); act("All off", false);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
