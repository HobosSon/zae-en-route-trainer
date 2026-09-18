/*
 * ZAE nonradar conflict engine.
 *
 * Given the flights of a generated scenario (see generator.js for the flight
 * model: aircraft, path nodes with distances/times, altitude, kind), it
 *   1. applies the course's airspace restrictions (JAN/MLU approach
 *      boundaries, Columbus 3 MOA over KGWO, the JAN and MLU LOAs),
 *   2. finds every pair of aircraft that is traffic for each other —
 *      same altitude within 10 minutes at a crossing fix, on the same
 *      course, or head-on on the same airway — using JO 7110.65 Chapter 6
 *      nonradar minima as taught in Lessons 16-19,
 *   3. resolves each conflict the way Aero Center expects: level en route
 *      aircraft are never moved (unless IAFDOF); departures and arrivals get
 *      crossing restrictions, altitude changes within 2,000 ft, position or
 *      DME reports, and successive departures use the 2-minute rule,
 *   4. reports the scenario as unworkable when no such resolution exists,
 *      so the generator can draw a different flight.
 *
 * decorate() then writes the completed answer-key strips: restrictions under
 * the restriction bar, red W's (lined through), report-passing reminders,
 * departure instructions, void times, coordination circles.
 *
 * Exposed as the global `ZAEConflicts`. Requires ZAE (assets/data/zae.js).
 */
(function (root) {
  "use strict";
  const ZAE = root.ZAE;

  // ---- rule table (tune here) --------------------------------------------
  const RULES = {
    LONG_MIN: 10,                       // standard longitudinal, minutes (JO 7110.65 6-4-2)
    DME_NM: 20,                         // standard DME/ATD longitudinal, nm
    RULE44: { kt: 44, min: 3, nm: 5 },  // lead at least 44 kt faster
    RULE22: { kt: 22, min: 5, nm: 10 }, // lead at least 22 kt faster
    VERT: 1000,                         // vertical minimum below FL290
    DEP_RULE_MIN: 2,                    // successive departures: the 2-minute rule only (never 1 minute)
    ALT_CHANGE_MAX: 2000,               // a departure may be held this far from its request without penalty
    OPP_BUFFER_MIN: 10,                 // vertical needed from 10 min before until 10 min after passing
    JAN_TOP: 5000, MLU_TOP: 6000,       // nonradar vertical limits of the approach controls
    CBM3_ACTIVE: true,                  // Columbus 3 MOA (8,000 to FL180) over KGWO — always active at Aero Center
    MEI1W_ACTIVE: true,                 // Meridian 1 West MOA on V245 northeast of MHZ — always active
    KGWO_MOA_CLEAR: { nm: 8, dir: "NE", alt: 7000 },
    HPA_BEFORE_MIN: 10,                 // holding pattern airspace is protected from 10 min before the holder's fix estimate
    HPA_AFTER_JAN_MIN: 2,               // ...until JAN/MLU approach reports tower jurisdiction (2 min past the estimate)
    HPA_AFTER_GWO_MIN: 7,               // ...until a KGWO arrival has landed (7 min past the SQS estimate)
    HPA_DEFAULT_CLEAR: 8,               // clear distance for a radial the card does not list
    JAN_LOWEST: 6000,                   // lowest ARTCC altitude at MHZ for JAN arrivals
    MLU_LOWEST: 7000,                   // lowest ARTCC altitude at DINKY for KMLU arrivals (MLU approach 6,000 and below)
    VKS_LOWEST: 6000,                   // KVKS arrivals: 6,000 until 20 SW MHZ (JAN airspace), then the approach
    HPA_AFTER_VKS_MIN: 5,               // ...until a KVKS arrival has landed (5 min past the VKS estimate)
    EFC_MIN: 10,                        // expect further clearance: fix estimate + 10 (holds at MHZ: none, "no delay expected") ...
    EFC_DINKY_MIN: 5,                   // ...except DINKY: + 5 (MLU LOA, TCP time + 5)
    DINKY_FROM_STUEE_MIN: 3,            // DINKY estimate = STUEE estimate - 3 (the printed strip posts STUEE)
    MLU_TCP_DME: { nm: 49, dir: "NE" }, // DME aircraft contact MLU Approach 49 NE MLU (after progressing MHZ)
    MLU_NONDME_BEFORE_MIN: 5,           // non-DME aircraft are transferred 5 min before the DINKY estimate
    VKS_APCH: { node: "MHZ", nm: 20, dir: "SW", alt: 6000 }, // "maintain 6,000 until 20 SW MHZ, cleared approach"
    KGWO_HOLD_ALT: 7000,                // KGWO arrivals cross SQS at or below 7,000 / hold at 7,000
    EDC_MIN: 10, VOID_MIN: 10, ADVISE_MIN: 10
  };

  // Symbols from the Aero Center Phraseology and Stripmarking Guide (H00 p.3)
  const SYM = { climb: "↑", descend: "↓", above: "⤒", below: "⤓", at: "@", cross: "X", join: "⌒", depart: "T→", enterCA: "⊿", warn: "W" };

  // ---- helpers ------------------------------------------------------------
  function pad2(n) { return String(n).padStart(2, "0"); }
  function toHHMM(mins) { mins = ((Math.round(mins) % 1440) + 1440) % 1440; return pad2(Math.floor(mins / 60)) + pad2(mins % 60); }
  function hundreds(alt) { return String(alt / 100); }
  function spoken(alt) {
    const th = Math.floor(alt / 1000), hd = (alt % 1000) / 100;
    const digits = String(th).split("").map(function (d) { return ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "niner"][+d]; }).join(" ");
    return digits + " thousand" + (hd ? " " + ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "niner"][hd] + " hundred" : "");
  }
  function dirLabel(radial) {
    radial = ((radial % 360) + 360) % 360; if (radial === 0) radial = 360;
    if (radial === 360) return "N"; if (radial < 90) return "NE"; if (radial === 90) return "E";
    if (radial < 180) return "SE"; if (radial === 180) return "S"; if (radial < 270) return "SW";
    if (radial === 270) return "W"; return "NW";
  }
  const DIR_WORD = { N: "north", NE: "northeast", E: "east", SE: "southeast", S: "south", SW: "southwest", W: "west", NW: "northwest" };
  const AIRWAY_SPOKEN = { V9: "Victor Niner", V11: "Victor Eleven", V18: "Victor Eighteen", V74: "Victor Seventy-four", V245: "Victor Two Forty-five", V278: "Victor Two Seventy-eight", V417: "Victor Four Seventeen", V427: "Victor Four Twenty-seven", V535: "Victor Five Thirty-five", V555: "Victor Five Fifty-five", V557: "Victor Five Fifty-seven" };
  function spokenAirway(id) { return AIRWAY_SPOKEN[id] || String(id || ""); }
  function navName(id) { const n = ZAE.NAVAIDS[id]; if (!n) return id + (ZAE.FIXES[id] ? " intersection" : ""); return n.name + " " + (n.kind === "VOR/DME" ? "VOR/DME" : n.kind === "NDB" ? "radio beacon" : "VORTAC"); }
  function angleBetween(a, b) { let d = Math.abs(((a - b) % 360 + 360) % 360); if (d > 180) d = 360 - d; return d; }
  // Lateral divergence distance (nm) for radials of the same NAVAID diverging
  // by `angle` degrees; null under 15 degrees (no lateral separation).
  function divergenceNm(angle) {
    if (angle > 90) angle = 90;
    for (let i = 0; i < ZAE.DIVERGENCE.length; i++) if (angle >= ZAE.DIVERGENCE[i][0]) return ZAE.DIVERGENCE[i][1];
    return null;
  }
  // Outbound radial from node i of flight f toward node j (adjacent).
  function radialToward(f, i, j) {
    const from = f.nodes[i], to = f.nodes[j];
    const via = j > i ? to.via : from.via;
    const tbl = ZAE.RADIALS[from.id];
    if (!tbl) return null;
    if (via === "HDG") return null;
    const key = via === "DCT" || !tbl[via] ? "DCT" : via;
    return tbl[key] && tbl[key][to.id] != null ? tbl[key][to.id] : null;
  }
  function radialsAt(f, i) {
    const out = [];
    if (i > 0) { const r = radialToward(f, i, i - 1); if (r != null) out.push({ r: r, side: "in", node: f.nodes[i - 1].id }); }
    if (i < f.nodes.length - 1) { const r = radialToward(f, i, i + 1); if (r != null) out.push({ r: r, side: "out", node: f.nodes[i + 1].id }); }
    return out;
  }
  function isAirport(id) { return !!ZAE.AIRPORTS[id]; }
  function isNavaid(id) { return !!ZAE.NAVAIDS[id]; }
  function bandsOverlap(a, b) { return !(a[0] >= b[1] + RULES.VERT || b[0] >= a[1] + RULES.VERT); }
  function nodeIndex(f, id) { for (let i = 0; i < f.nodes.length; i++) if (f.nodes[i].id === id) return i; return -1; }
  // Boundary mileage from `nav` along `airway` toward facility `to` (or the first listed).
  function boundaryFrom(airway, nav, to) {
    const list = ZAE.BOUNDARIES[airway] || [];
    for (let i = 0; i < list.length; i++) if (list[i].nav === nav && (!to || list[i].to === to)) return list[i];
    return null;
  }
  function lowestFor(f) {
    if (f.destAirport === "KGWO") return RULES.KGWO_HOLD_ALT;
    if (f.destAirport === "KMLU") return RULES.MLU_LOWEST;
    if (f.destAirport === "KVKS") return RULES.VKS_LOWEST;
    return RULES.JAN_LOWEST;
  }
  function arrivalFloor(f) {
    if (f.destAirport === "KGWO") return Math.min(f.alt, RULES.KGWO_HOLD_ALT);
    return Math.min(f.alt, lowestFor(f));
  }
  // the holding fix, its node and the estimate the controller works with
  // (DINKY: STUEE estimate - 3, as the printed strip posts STUEE)
  function holdIdx(f) { const N = holdFix(f); const i = N ? nodeIndex(f, N) : -1; return i >= 0 ? i : f.nodes.length - 2; }
  function holdT(f) {
    if (holdFix(f) === "DINKY") { const si = nodeIndex(f, "STUEE"); if (si >= 0) return f.nodes[si].t - RULES.DINKY_FROM_STUEE_MIN; }
    return f.nodes[holdIdx(f)].t;
  }
  // expect-further-clearance time: fix estimate + 10, DINKY + 5, none at MHZ
  function efcFor(f) {
    const N = holdFix(f);
    if (N === "MHZ") return null;
    return holdT(f) + (N === "DINKY" ? RULES.EFC_DINKY_MIN : RULES.EFC_MIN);
  }

  // ---- restriction text ------------------------------------------------
  // r: { kind: 'cross'|'crossfix'|'maintain', node, nm, dir, on, limit: 'below'|'above'|'at', alt }
  function restrictionMark(r) {
    if (r.kind === "maintain") return "M " + hundreds(r.alt) + " / " + r.nm + " " + r.dir + " " + r.node;
    const sym = r.limit === "above" ? SYM.above : r.limit === "at" ? SYM.at : SYM.below;
    if (r.kind === "crossfix") return SYM.cross + " " + r.node + " " + sym + " " + hundreds(r.alt);
    return SYM.cross + " " + r.nm + " " + r.dir + " " + r.node + (r.on ? " ." : "") + " " + sym + " " + hundreds(r.alt);
  }
  function restrictionPhr(r) {
    if (r.kind === "maintain") return "maintain " + spoken(r.alt) + " until " + r.nm + " miles " + DIR_WORD[r.dir] + " of " + navName(r.node);
    const lim = r.limit === "above" ? "at or above" : r.limit === "at" ? "at and maintain" : "at or below";
    if (r.kind === "crossfix") return "cross " + navName(r.node) + " " + lim + " " + spoken(r.alt);
    return "cross " + r.nm + " miles " + DIR_WORD[r.dir] + " of " + navName(r.node) + (r.on ? " established on " + r.on : "") + " " + lim + " " + spoken(r.alt);
  }

  // ---- bands ---------------------------------------------------------------
  // The altitudes a flight may occupy at node i under the current plan:
  // level en route [alt, alt]; a departure climbs from the ground to its
  // final altitude (nonradar: climb rate is never used for separation) unless
  // a crossing restriction caps it; an arrival is anywhere between its
  // clearance altitude and cruise (pilot's discretion) unless held level.
  function restrictionCoversD(f, r, d) {
    const ni = nodeIndex(f, r.node); if (ni < 0) return false;
    const N = f.nodes[ni];
    const nm = r.nm || 0;
    if (r.kind === "maintain") return d <= N.d + nm + 0.01;   // level until nm past the node
    if (r.limit === "above") return d >= N.d - nm - 0.01;     // at/above from nm before the node onward
    return d <= N.d + nm + 0.01;                              // at/below through nm past the node
  }
  // Band at a distance `d` along the flight's path (nm from its first node).
  function bandAtD(f, d, plan) {
    const p = plan[f.id];
    if (f.kind === "overflight") {
      if (f.iafdof) return [Math.min(f.alt, p.finalAlt), Math.max(f.alt, p.finalAlt)];
      return [f.alt, f.alt];
    }
    if (f.kind === "departure") {
      let lo = 0, hi = p.finalAlt;
      p.restrictions.forEach(function (r) {
        if (r.limit === "below" && restrictionCoversD(f, r, d)) hi = Math.min(hi, r.alt);
        if (r.limit === "above" && restrictionCoversD(f, r, d)) lo = Math.max(lo, r.alt);
      });
      return [lo, Math.max(lo, hi)];
    }
    // arrival: "cross nm before N at or below" applies from that point on
    let lo = p.arrivalAlt, hi = f.alt;
    p.restrictions.forEach(function (r) {
      const ni = nodeIndex(f, r.node); if (ni < 0) return;
      const N = f.nodes[ni];
      if (r.kind === "maintain" && d <= N.d + (r.nm || 0) + 0.01) { lo = hi = f.alt; }
      if (r.kind !== "maintain" && r.limit === "below" && d >= N.d - (r.nm || 0) - 0.01) hi = Math.min(hi, r.alt);
    });
    return [lo, Math.max(lo, hi)];
  }
  function bandAt(f, i, plan) { return bandAtD(f, f.nodes[i].d, plan); }
  function unionBand(a, b) { return [Math.min(a[0], b[0]), Math.max(a[1], b[1])]; }

  // ---- shared geometry --------------------------------------------------
  // Runs of nodes two flights have in common, in A's order: same-direction,
  // opposite-direction, or isolated crossings. Airport nodes are excluded
  // (same-airport pairs are handled separately).
  // Only points where Sector 66 must provide the separation count: fixes and
  // NAVAIDs inside the sector, plus Monroe for aircraft converging on it
  // (Lab Procedures III-65: the restriction would have to happen in 66).
  function relevant(f, i) {
    const id = f.nodes[i].id;
    if (isAirport(id)) return false;
    const nav = ZAE.NAVAIDS[id];
    if (nav && nav.owner !== "66") return id === "MLU" && i === f.nodes.length - 1;
    return true;
  }
  function sharedRuns(A, B) {
    const bIdx = {};
    B.nodes.forEach(function (n, j) { if (relevant(B, j) && bIdx[n.id] == null) bIdx[n.id] = j; });
    const runs = [];
    let cur = null;
    for (let i = 0; i < A.nodes.length; i++) {
      const id = A.nodes[i].id;
      if (!relevant(A, i) || bIdx[id] == null) { if (cur) { runs.push(cur); cur = null; } continue; }
      const j = bIdx[id];
      if (cur) {
        const last = cur.pairs[cur.pairs.length - 1];
        if (last[0] === i - 1 && ((cur.dir === "same" || cur.dir === null) && j === last[1] + 1)) { cur.dir = "same"; cur.pairs.push([i, j]); continue; }
        if (last[0] === i - 1 && ((cur.dir === "opp" || cur.dir === null) && j === last[1] - 1)) { cur.dir = "opp"; cur.pairs.push([i, j]); continue; }
        runs.push(cur);
      }
      cur = { dir: null, pairs: [[i, j]] };
    }
    if (cur) runs.push(cur);
    runs.forEach(function (r) { if (!r.dir) r.dir = "cross"; });
    return runs;
  }

  // Required longitudinal spacing (minutes) between a leader and a trailer on
  // the same course; reduced minima when the leader is faster. Returns
  // { min, dme } — `dme` when DME minima (both aircraft DME) are what apply.
  function requiredSpacing(lead, trail) {
    const diff = lead.gs - trail.gs;
    let min = RULES.LONG_MIN, nm = RULES.DME_NM, rule = null;
    if (diff >= RULES.RULE44.kt) { min = RULES.RULE44.min; nm = RULES.RULE44.nm; rule = "44K"; }
    else if (diff >= RULES.RULE22.kt) { min = RULES.RULE22.min; nm = RULES.RULE22.nm; rule = "22K"; }
    let dme = false;
    if (lead.dme && trail.dme) {
      const dmeMin = nm / trail.mpm;
      if (dmeMin < min) { min = dmeMin; dme = true; }
    }
    return { min: min, nm: nm, rule: rule, dme: dme };
  }

  // ---- holding pattern airspace ------------------------------------------
  // An arrival cleared to MHZ (hold NW as published) or to KGWO via SQS
  // activates the published holding pattern airspace at its fix from 10
  // minutes before its estimate until it is tower jurisdiction / landed.
  // Every other aircraft is inside that airspace from the card's clear
  // distance before the fix to the clear distance after it.
  // The altitudes a holding arrival owns in its pattern: its descent band, and
  // when it is stacked above another holder, down to the lowest stack altitude
  // (the stack moves down by 1,000 once the bottom aircraft is tower
  // jurisdiction, so the pattern always owns the lowest altitude).
  function holdBand(arr, ai, plan) {
    const b = bandAt(arr, ai, plan);
    const p = plan[arr.id];
    if (p.stackedWith && p.stackedWith.length) return [Math.min(b[0], lowestFor(arr)), b[1]];
    return b;
  }
  // arrivals, and departures that land inside the sector (0M8 to a JAN field), hold at their fix
  function holdFix(f) { return f.kind === "arrival" || (f.kind === "departure" && f.destAirport) ? (f.holdFix || f.nodes[f.nodes.length - 2].id) : null; }
  function hpaWindow(f) {
    const N = holdFix(f); if (!N) return null;
    const t = holdT(f);
    const after = f.destAirport === "KGWO" ? RULES.HPA_AFTER_GWO_MIN : f.destAirport === "KVKS" ? RULES.HPA_AFTER_VKS_MIN : RULES.HPA_AFTER_JAN_MIN;
    return { node: N, from: t - RULES.HPA_BEFORE_MIN, to: t + after };
  }
  function hpaClear(N, radial, apch) {
    const h = ZAE.HPA[N]; if (!h || radial == null) return RULES.HPA_DEFAULT_CLEAR;
    const r = ((radial % 360) + 360) % 360;
    if (apch && h.apch && h.apch[r] != null) return h.apch[r];
    return h.clear[r] != null ? h.clear[r] : RULES.HPA_DEFAULT_CLEAR;
  }
  // [enter, exit] times of flight X inside the pattern at node index i, plus the clear distances used
  function hpaOccupancy(X, i, N) {
    const inR = i > 0 ? radialToward(X, i, i - 1) : null, outR = i < X.nodes.length - 1 ? radialToward(X, i, i + 1) : null;
    const cin = i > 0 ? Math.min(hpaClear(N, inR), X.nodes[i].d - X.nodes[i - 1].d) : 0;
    const cout = i < X.nodes.length - 1 ? Math.min(hpaClear(N, outR), X.nodes[i + 1].d - X.nodes[i].d) : 0;
    return { from: X.nodes[i].t - cin / X.mpm, to: X.nodes[i].t + cout / X.mpm, cin: cin, cout: cout, inR: inR, outR: outR };
  }
  function hpaConflict(arr, X, xi, plan) {
    const w = hpaWindow(arr); if (!w) return null;
    if ((plan[arr.id].stackedWith || []).indexOf(X.id) !== -1) return null; // already stacked in the pattern
    const N = w.node;
    const ai = holdIdx(arr);
    const occ = hpaOccupancy(X, xi, N);
    // X occupies the pattern from the clear distance before the fix to the clear distance after it
    const dN = X.nodes[xi].d;
    let xb = bandAtD(X, dN, plan);
    xb = unionBand(xb, bandAtD(X, dN - occ.cin, plan));
    xb = unionBand(xb, bandAtD(X, dN + occ.cout, plan));
    if (!bandsOverlap(holdBand(arr, ai, plan), xb)) return null;
    if (occ.to < w.from || occ.from > w.to) return null;
    return { a: arr, b: X, type: "hpa", node: N, i: ai, j: xi, occ: occ, window: w, dt: Math.abs(arr.nodes[ai].t - X.nodes[xi].t) };
  }

  // A KVKS arrival holds when it is stacked, pushed above 6,000, or a KVKS departure forces it.
  function kvksHolding(p) { return !!(p.stackedWith && p.stackedWith.length) || p.arrivalAlt > RULES.VKS_LOWEST || !!p.forceHold; }

  // KVKS departure vs a KVKS arrival's holding pattern at VKS: the departure
  // climbs out under the pattern, stays below the holder until the miss point
  // on its route and reports passing it — 37 SW MHZ eastbound, 54 SE MLU
  // westbound, 25 NE HEZ on the HEZ026 radial (Lab Procedures III-51..53).
  // d: nm from KVKS to the miss point; minAlt: the MEA there (outside the JAN / MLU approach airspace)
  const VKS_MISS = { east: { node: "MHZ", nm: 37, dir: "SW", d: 8, minAlt: 4000 }, west: { node: "MLU", nm: 54, dir: "SE", d: 7, minAlt: 5000 }, hez: { node: "HEZ", nm: 25, dir: "NE", d: 17, minAlt: 3000 } };
  function vksDepMiss(dep) { return dep.hez026 ? VKS_MISS.hez : (nodeIndex(dep, "MHZ") >= 0 ? VKS_MISS.east : VKS_MISS.west); }
  function kvksDepConflict(arr, dep, plan) {
    if (holdFix(arr) !== "VKS" || dep.kind !== "departure" || dep.originAirport !== "KVKS") return null;
    if ((plan[arr.id].stackedWith || []).indexOf(dep.id) !== -1) return null;
    const w = hpaWindow(arr), ai = holdIdx(arr), miss = vksDepMiss(dep);
    const occ = { from: dep.baseT, to: dep.baseT + miss.d / dep.mpm };
    if (occ.to < w.from || occ.from > w.to) return null;
    if (!bandsOverlap(holdBand(arr, ai, plan), unionBand(bandAtD(dep, 0, plan), bandAtD(dep, miss.d, plan)))) return null;
    return { a: arr, b: dep, type: "hpa", kvks: miss, node: "VKS", i: ai, j: 0, occ: occ, window: w, dt: Math.abs(holdT(arr) - dep.baseT) };
  }

  // DME from `nav` of a node on flight X's airway traversal (null if not on it).
  function dmeFrom(X, node, nav) {
    if (!X.trav || node.awIdx == null) return null;
    const ni = X.trav.points.indexOf(nav); if (ni < 0) return null;
    let d = 0; const a = Math.min(ni, node.awIdx), b = Math.max(ni, node.awIdx);
    for (let k = a; k < b; k++) d += X.trav.legs[k];
    return d;
  }
  // Holding pattern airspace that lies along another airway (DINKY over V427,
  // VKS over V417): a flight crossing that stretch during the protected
  // window at an overlapping altitude is inside the pattern. Only level
  // traffic is generated across these stretches (departures that would be are
  // rejected up front), so the resolution is the arrival's altitude.
  function hpaSegConflicts(arr, X, plan) {
    const N = holdFix(arr); const h = N && ZAE.HPA[N];
    if (!h || !h.segments || X === arr || nodeIndex(X, N) >= 0) return [];
    if ((plan[arr.id].stackedWith || []).indexOf(X.id) !== -1) return [];
    const w = hpaWindow(arr); const ai = holdIdx(arr);
    const out = [];
    h.segments.forEach(function (sg) {
      for (let i = 0; i + 1 < X.nodes.length; i++) {
        const a = X.nodes[i], b = X.nodes[i + 1];
        if (b.via !== sg.airway) continue;
        const dA = dmeFrom(X, a, sg.nav), dB = dmeFrom(X, b, sg.nav);
        if (dA == null || dB == null) continue;
        const lo = Math.max(Math.min(dA, dB), sg.from), hi = Math.min(Math.max(dA, dB), sg.to);
        if (lo >= hi) continue;
        // fraction of the leg inside the stretch -> path distance and time
        const f0 = (lo - dA) / (dB - dA), f1 = (hi - dA) / (dB - dA);
        const d0 = a.d + (b.d - a.d) * Math.min(f0, f1), d1 = a.d + (b.d - a.d) * Math.max(f0, f1);
        const t0 = a.t + (b.t - a.t) * Math.min(f0, f1), t1 = a.t + (b.t - a.t) * Math.max(f0, f1);
        if (t1 < w.from || t0 > w.to) continue;
        const xb = unionBand(bandAtD(X, d0, plan), bandAtD(X, d1, plan));
        if (!bandsOverlap(holdBand(arr, ai, plan), xb)) continue;
        out.push({ a: arr, b: X, type: "hpa", seg: sg, node: N, i: ai, j: i + 1, occ: { from: t0, to: t1 }, window: w, dt: Math.abs(arr.nodes[ai].t - t0) });
      }
    });
    return out;
  }

  // ---- conflict detection --------------------------------------------------
  function pairConflicts(A, B, plan) {
    const out = [];
    if (holdFix(A)) out.push.apply(out, hpaSegConflicts(A, B, plan));
    if (holdFix(B)) out.push.apply(out, hpaSegConflicts(B, A, plan));
    const kd = kvksDepConflict(A, B, plan) || kvksDepConflict(B, A, plan);
    if (kd) out.push(kd);
    sharedRuns(A, B).forEach(function (run) {
      if (run.dir === "cross" || run.pairs.length === 1) {
        const i = run.pairs[0][0], j = run.pairs[0][1];
        // at an arrival's holding fix the pattern airspace is what must be protected
        if (holdFix(A) && holdFix(A) === A.nodes[i].id) { const c = hpaConflict(A, B, j, plan); if (c) out.push(c); return; }
        if (holdFix(B) && holdFix(B) === B.nodes[j].id) { const c = hpaConflict(B, A, i, plan); if (c) { out.push(c); } return; }
        if (!bandsOverlap(bandAt(A, i, plan), bandAt(B, j, plan))) return;
        const dt = Math.abs(A.nodes[i].t - B.nodes[j].t);
        if (dt < RULES.LONG_MIN) out.push({ a: A, b: B, type: "cross", i: i, j: j, node: A.nodes[i].id, dt: dt, run: run });
        return;
      }
      if (run.dir === "same") {
        const first = run.pairs[0];
        const lead = A.nodes[first[0]].t <= B.nodes[first[1]].t ? A : B;
        const trail = lead === A ? B : A;
        const req = requiredSpacing(lead, trail);
        let overlap = false, worst = Infinity, sign = null, overtake = false;
        run.pairs.forEach(function (pr) {
          if (!bandsOverlap(bandAt(A, pr[0], plan), bandAt(B, pr[1], plan))) return;
          overlap = true;
          const g = B.nodes[pr[1]].t - A.nodes[pr[0]].t;
          if (sign == null) sign = g >= 0 ? 1 : -1; else if ((g >= 0 ? 1 : -1) !== sign) overtake = true;
          worst = Math.min(worst, Math.abs(g));
        });
        if (!overlap) return;
        if (overtake || worst < req.min) out.push({ a: A, b: B, type: "same", run: run, lead: lead, trail: trail, req: req, gap: worst, node: A.nodes[first[0]].id, overtake: overtake });
        else if (req.dme) out.push({ a: A, b: B, type: "same-dme-ok", run: run, lead: lead, trail: trail, req: req, gap: worst, node: A.nodes[first[0]].id, ok: true });
        else if (req.rule) out.push({ a: A, b: B, type: "same-rule-ok", run: run, lead: lead, trail: trail, req: req, gap: worst, node: A.nodes[first[0]].id, ok: true });
        return;
      }
      // opposite direction: they pass somewhere on the run unless one is gone
      const fa = run.pairs[0], la = run.pairs[run.pairs.length - 1];
      const aIn = [A.nodes[fa[0]].t, A.nodes[la[0]].t], bIn = [B.nodes[la[1]].t, B.nodes[fa[1]].t];
      const meet = !(aIn[1] + RULES.OPP_BUFFER_MIN < bIn[0] || bIn[1] + RULES.OPP_BUFFER_MIN < aIn[0]);
      if (!meet) return;
      let overlap = false;
      run.pairs.forEach(function (pr) { if (bandsOverlap(bandAt(A, pr[0], plan), bandAt(B, pr[1], plan))) overlap = true; });
      if (overlap) out.push({ a: A, b: B, type: "opp", run: run, node: A.nodes[fa[0]].id });
    });
    return out;
  }

  // ---- airspace restrictions (traffic independent) -------------------------
  function nwBound(f) { // KJAN/KJVW departures toward the MHZ holding pattern side
    const i = nodeIndex(f, "MHZ"); if (i < 0 || i >= f.nodes.length - 1) return null;
    const r = radialToward(f, i, i + 1); if (r == null) return null;
    return (r >= 271 || r === 360) ? r : null; // 271-360: NW/N quadrant (V74 320, V557 335, V9 350, V427 281)
  }
  function airspacePlan(f, p) {
    if (f.kind === "departure") {
      const apt = f.originAirport;
      const gwIdx = 1 + (apt === "0M8" ? 1 : 0); // index of the gateway VORTAC
      if (apt === "KGWO") {
        if (RULES.CBM3_ACTIVE && p.finalAlt >= 8000) {
          const outAw = f.nodes[gwIdx + 1] ? f.nodes[gwIdx + 1].via : null;
          const ne = outAw && ["V11", "V278", "V535"].indexOf(outAw) !== -1 && (radialToward(f, gwIdx, gwIdx + 1) < 90);
          if (f.dme) addRestriction(p, { kind: "cross", node: "SQS", nm: RULES.KGWO_MOA_CLEAR.nm, dir: RULES.KGWO_MOA_CLEAR.dir, on: ne ? outAw : null, limit: "below", alt: RULES.KGWO_MOA_CLEAR.alt, why: "airspace", label: "Columbus 3 MOA (8,000 to FL180 over KGWO, always active)" });
          else p.restrictions.push({ kind: "crossfix", node: "SQS", limit: "below", alt: RULES.KGWO_MOA_CLEAR.alt, why: "airspace", label: "Columbus 3 MOA — fix restriction, aircraft has no DME" });
        }
        const mi = nodeIndex(f, "MHZ");
        if (mi > 0) {
          const b = boundaryFrom(f.nodes[mi].via, "MHZ", "JAN");
          if (b) addRestriction(p, { kind: "cross", node: "MHZ", nm: b.nm, dir: b.dir, limit: "above", alt: RULES.JAN_TOP + 1000, why: "airspace", label: "JAN Approach airspace (5,000 and below)" });
        }
      } else if (apt === "KJAN" || apt === "KJVW") {
        p.restrictions.push({ kind: "crossfix", node: "MHZ", limit: "below", alt: RULES.JAN_TOP, why: "loa", tower: true, label: "JAN LOA: tower clears departures direct MHZ, cross MHZ at or below 5,000" });
        if (f.exitNav === "MLU") {
          const b = boundaryFrom(f.aw, "MLU", "MLUAPCH");
          if (b) p.restrictions.push({ kind: "cross", node: "MLU", nm: b.nm, dir: b.dir, limit: "above", alt: RULES.MLU_TOP + 1000, why: "airspace", label: "MLU Approach airspace (6,000 and below)" });
        }
      } else if (apt === "0M8") {
        p.depInstr = SYM.enterCA + " 150 " + SYM.join + " V427";
        p.depInstrPhr = "when entering controlled airspace fly heading one five zero until joining Victor Four Twenty-seven, Victor Four Twenty-seven Magnolia";
        addRestriction(p, { kind: "cross", node: "MHZ", nm: 18, dir: "NW", on: "V427", limit: "above", alt: RULES.JAN_TOP + 1000, why: "airspace", label: "JAN Approach airspace (5,000 and below)" });
      } else if (apt === "KVKS" && f.hez026) {
        // Natchez 026 radial: not in the filed route, coordinated with POE LO; no JAN/MLU airspace on it
        p.depInstr = "HEZ026R";
        p.viaPhr = f.hez026.toKHEZ ? "the HEZ zero two six radial" : "Natchez zero two six radial, Natchez as filed";
        p.coord.push({ to: "POE LO (ZHU 40)", what: "The HEZ026R is not in the route: coordinate it — “" + f.cs + " departing Vicksburg via the Natchez zero two six radial" + (f.hez026.toKHEZ ? ", landing Natchez" : "") + ".”" });
      } else if (apt === "KVKS") {
        if (f.exitNav === "MLU" && nodeIndex(f, "MHZ") < 0) {
          p.depInstr = SYM.depart + " NE TL 330 " + SYM.join + " V417";
          p.depInstrPhr = "depart northeast, turn left, fly heading three three zero until joining Victor Four Seventeen, Victor Four Seventeen Monroe";
          addRestriction(p, { kind: "cross", node: "MLU", nm: 31, dir: "SE", on: "V417", limit: "above", alt: RULES.MLU_TOP + 1000, why: "airspace", label: "MLU Approach airspace (6,000 and below)" });
        } else {
          p.depInstr = SYM.depart + " NE TR 030 " + SYM.join + " V417";
          p.depInstrPhr = "depart northeast, turn right, fly heading zero three zero until joining Victor Four Seventeen, Victor Four Seventeen Magnolia";
          addRestriction(p, { kind: "cross", node: "MHZ", nm: 20, dir: "SW", on: "V417", limit: "above", alt: RULES.JAN_TOP + 1000, why: "airspace", label: "JAN Approach airspace (5,000 and below)" });
        }
      }
      if (apt === "0M8" || apt === "KVKS") {
        p.voidTime = f.baseT + RULES.VOID_MIN;
        p.verify = true;
      }
      p.edc = f.baseT + RULES.EDC_MIN;
      if (f.destAirport) janArrivalPlan(f, p); // a departure landing at a JAN field: it holds at MHZ too
    } else if (f.kind === "arrival") {
      const feeder = f.nodes[f.nodes.length - 2].id;
      const entryLegAw = f.nodes[1] ? f.nodes[1].via : f.aw;
      if (f.destAirport === "KGWO") {
        p.approach = "VR"; p.approachPhr = "cleared VOR runway five approach circle to runway two three";
        // descend only inside Sector 66: maintain cruise to our boundary on the entry airway
        const si = nodeIndex(f, "SQS");
        let prevNav = null;
        for (let k = si - 1; k >= 0; k--) if (isNavaid(f.nodes[k].id)) { prevNav = f.nodes[k]; break; }
        const b = prevNav && ZAE.NAVAIDS[prevNav.id].owner !== "66" ? boundaryFrom(f.nodes[si].via, "SQS", ZAE.NAVAIDS[prevNav.id].owner) : null;
        if (b && f.alt > RULES.KGWO_HOLD_ALT && f.dme) {
          p.restrictions.push({ kind: "maintain", node: "SQS", nm: b.nm, dir: b.dir, alt: f.alt, why: "airspace", label: "descend only inside Sector 66 (boundary with sector " + b.to + " at " + b.nm + " " + b.dir + " SQS)" });
        }
        if (f.alt > RULES.KGWO_HOLD_ALT) p.restrictions.push({ kind: "crossfix", node: "SQS", limit: "below", alt: RULES.KGWO_HOLD_ALT, why: "approach", label: "KGWO approach / SQS holding airspace (block 7,000 and below with D67)" });
        p.coord.push({ to: "GWO Tower 120.2", what: "Inbound: " + f.cs + ", " + f.type + ", estimated Greenwood Airport " + toHHMM(f.nodes[f.nodes.length - 1].t) + ", VOR approach" });
        p.coord.push({ to: "D67 (GLH Low)", what: "APREQ: block " + spoken(Math.min(f.alt, RULES.KGWO_HOLD_ALT)) + " and below for holding and approach at Sidon" });
        p.block67 = Math.min(f.alt, RULES.KGWO_HOLD_ALT);
      } else if (f.destAirport === "KMLU") {
        // MLU LOA: cleared to DINKY (clearance limit and holding fix), lowest ARTCC
        // altitude 7,000, hold northeast on V18, EFC = DINKY estimate + 5; DME
        // aircraft contact MLU Approach 49 NE MLU (after progressing MHZ),
        // non-DME aircraft 5 minutes before the DINKY estimate
        p.clearanceLimit = "DINKY";
        p.dinkyEst = holdT(f); // STUEE estimate - 3
        p.efc = efcFor(f);
        p.holdMark = "H- NE V18 " + toHHMM(p.efc);
        p.holdPhr = "hold northeast on Victor Eighteen, expect further clearance " + toHHMM(p.efc);
        if (f.dme) { p.tcp = "DINKY"; p.tcpPhr = "four niner miles northeast Monroe VORTAC"; p.commMark = "C " + RULES.MLU_TCP_DME.nm + " " + RULES.MLU_TCP_DME.dir + " MLU"; p.commNote = RULES.MLU_TCP_DME.nm + " NE MLU, issued after the aircraft progresses MHZ"; }
        else { p.tcp = "DINKY"; p.tcpPhr = "at DINKY intersection"; p.commMark = "C DINKY"; p.commNote = "AT DINKY for a non-DME aircraft — the controller must say so in the frequency change (“contact Monroe Approach 118.2 at DINKY”)"; }
      } else if (f.destAirport === "KVKS") {
        // uncontrolled field on the VKS NDB: no traffic -> approach clearance before
        // the DORTS estimate; traffic -> hold at VKS (SW on the 195 bearing, left
        // turns, EFC + 10), the approach once clear
        p.clearanceLimit = "VKS";
        p.efc = efcFor(f);
        p.holdMark = "H- VKS SW 195 LT " + toHHMM(p.efc);
        p.holdPhr = "hold southwest on the one niner five bearing from the Vicksburg radio beacon, left turns, expect further clearance " + toHHMM(p.efc);
        p.apchRestr = { kind: "maintain", node: RULES.VKS_APCH.node, nm: RULES.VKS_APCH.nm, dir: RULES.VKS_APCH.dir, alt: RULES.VKS_APCH.alt };
        p.apchPhr = restrictionPhr(p.apchRestr) + ", cleared approach Vicksburg Airport";
        const di = nodeIndex(f, "DORTS");
        p.decideBy = di >= 0 ? f.nodes[di].t : f.nodes[f.nodes.length - 2].t;
      } else {
        janArrivalPlan(f, p);
      }
    }
  }
  // JAN arrivals: cleared to MHZ, lowest ARTCC altitude, hold NW as published, no EFC
  function janArrivalPlan(f, p) {
    p.clearanceLimit = "MHZ";
    p.efc = null;
    p.holdMark = "H- NW";
    p.holdPhr = "hold northwest as published, no delay expected";
    // the JAN boundary on the side the arrival comes from (V9/V555/V557 cross it twice)
    const fi = f.nodes.length - 2;
    const inR = radialToward(f, fi, fi - 1);
    const inAw = f.nodes[fi].via;
    let b = null;
    (ZAE.BOUNDARIES[inAw] || []).forEach(function (x) { if (x.nav === "MHZ" && x.to === "JAN" && (!b || (inR != null && x.dir === dirLabel(inR)))) b = x; });
    p.tcp = b ? b.nm + " " + b.dir + " MHZ on " + inAw : "the JAN boundary";
    p.tcpPhr = b ? b.nm + " miles " + DIR_WORD[b.dir] + " of Magnolia VORTAC on " + inAw : "the boundary";
    const inbound = radialToward(f, f.nodes.length - 2, f.nodes.length - 3);
    if (inbound != null && (inbound >= 271 || inbound === 360)) { p.levelAt = { nm: 9, dir: "NW" }; }
  }

  // ---- resolution ----------------------------------------------------------
  function restrictionPoint(dep, i, other, j) {
    // divergence between the departure's outbound radial at node i and the
    // other aircraft's radials at the same NAVAID
    const outR = i < dep.nodes.length - 1 ? radialToward(dep, i, i + 1) : null;
    if (outR == null) return null;
    const theirs = radialsAt(other, j);
    if (!theirs.length) return null;
    let angle = 180;
    theirs.forEach(function (x) { angle = Math.min(angle, angleBetween(outR, x.r)); });
    // same next node = same course, no lateral
    if (i < dep.nodes.length - 1 && theirs.some(function (x) { return x.node === dep.nodes[i + 1].id; })) return null;
    const nm = divergenceNm(angle);
    if (nm == null) return null;
    return { nm: nm, dir: dirLabel(outR), angle: angle, radial: outR };
  }
  function entryPoint(f, i, other, j) {
    // divergence before node i (inbound side): where f enters the other's protected airspace
    const inR = i > 0 ? radialToward(f, i, i - 1) : null;
    if (inR == null) return null;
    const theirs = radialsAt(other, j);
    if (!theirs.length) return null;
    let angle = 180;
    theirs.forEach(function (x) { angle = Math.min(angle, angleBetween(inR, x.r)); });
    if (i > 0 && theirs.some(function (x) { return x.node === f.nodes[i - 1].id; })) return null;
    const nm = divergenceNm(angle);
    if (nm == null) return null;
    return { nm: nm, dir: dirLabel(inR), angle: angle, radial: inR };
  }
  // Lowest altitude a departure may be restricted to at/through node i.
  function minDepAlt(dep, i) {
    const id = dep.nodes[i].id;
    if (id === "MHZ" && dep.originAirport !== "KJAN" && dep.originAirport !== "KJVW") return RULES.JAN_TOP + 1000;
    if (id === "MLU") return RULES.MLU_TOP + 1000;
    return 5000;
  }
  // "established on (airway)" goes with the restriction when the point could
  // be confused: KGWO departures 10 nm or less NE of SQS (LP18 note), or when
  // the aircraft arrives at and leaves the NAVAID in the same compass direction.
  function onAirwayNote(dep, i, nm) {
    const aw = dep.nodes[i + 1] ? dep.nodes[i + 1].via : null;
    if (!aw || !/^V\d+$/.test(aw)) return null;
    if (dep.nodes[i].id === "SQS" && nm <= 10 && ["V11", "V278", "V535"].indexOf(aw) !== -1) return aw;
    const inR = i > 0 ? radialToward(dep, i, i - 1) : null, outR = radialToward(dep, i, i + 1);
    if (inR != null && outR != null && dirLabel(inR) === dirLabel(outR)) return aw;
    return null;
  }
  // Restrictions at the same NAVAID with the same sense within 5 flying miles
  // are combined (Lab Procedures III-4A): the farther point, the tighter altitude.
  function addRestriction(p, r) {
    for (let k = 0; k < p.restrictions.length; k++) {
      const x = p.restrictions[k];
      if (x.node !== r.node || x.limit !== r.limit || x.kind !== r.kind || x.tower) continue;
      if (Math.abs((x.nm || 0) - (r.nm || 0)) > 5) continue;
      if (r.limit === "below" ? r.alt < x.alt : r.alt > x.alt) { x.alt = r.alt; x.why = "traffic"; }
      x.nm = Math.max(x.nm || 0, r.nm || 0);
      x.on = x.on || r.on;
      x.vs = (x.vs || []).concat(r.vs || []);
      if (r.label && x.label !== r.label) x.label = x.label + "; " + r.label;
      return true;
    }
    p.restrictions.push(r);
    return true;
  }
  function conflictNote(p, text) { p.notes.push(text); }

  function resolveDepVsBand(dep, i, other, j, band, plan, c) {
    // `band` is what the other aircraft occupies at the shared NAVAID
    const p = plan[dep.id];
    const T = band[0], Thi = band[1];
    const belowAlt = T - RULES.VERT, aboveAlt = Thi + RULES.VERT;
    const node = dep.nodes[i];
    const tag = other.cs + " " + hundreds(T) + (Thi !== T ? "-" + hundreds(Thi) : "") + " at " + node.id + " " + toHHMM(other.nodes[j].t);
    // 1. below, until laterally clear past the NAVAID
    if (dep.dme) {
      const pt = restrictionPoint(dep, i, other, j);
      if (pt && belowAlt >= minDepAlt(dep, i)) {
        addRestriction(p, { kind: "cross", node: node.id, nm: pt.nm, dir: pt.dir, on: onAirwayNote(dep, i, pt.nm), limit: "below", alt: belowAlt, why: "traffic", vs: [other.cs], label: "traffic: " + tag + " — vertical until " + pt.nm + " nm past " + node.id + " (radials diverge " + pt.angle + "°)" });
        p.warnings.push(other.cs);
        return true;
      }
      // 2. above, before entering the other's protected airspace (needs room to climb)
      const ep = entryPoint(dep, i, other, j);
      if (ep && aboveAlt <= p.finalAlt && (node.d - ep.nm) >= 25) {
        addRestriction(p, { kind: "cross", node: node.id, nm: ep.nm, dir: ep.dir, limit: "above", alt: aboveAlt, why: "traffic", vs: [other.cs], label: "traffic: " + tag + " — above it before " + ep.nm + " nm from " + node.id });
        p.warnings.push(other.cs);
        return true;
      }
    }
    // 3. altitude not available: stop the climb below the traffic (within 2,000 ft of the request)
    if (belowAlt >= dep.floor && dep.reqAlt - belowAlt <= RULES.ALT_CHANGE_MAX && belowAlt >= minDepAlt(dep, i)) {
      // keep the departure's parity where possible: prefer T-1000 if it matches, else T-2000
      let assign = belowAlt;
      const odd = dep.wantsOdd;
      if (((assign / 1000) % 2 === 1) !== odd && assign - 1000 >= dep.floor && dep.reqAlt - (assign - 1000) <= RULES.ALT_CHANGE_MAX) assign -= 1000;
      if (assign < p.finalAlt) {
        p.finalAlt = assign;
        p.altNotAvail = { requested: dep.reqAlt, assigned: assign, vs: other.cs, expectAt: "when clear of " + other.cs };
        p.warnings.push(other.cs);
        return true;
      }
    }
    return false;
  }

  function resolveConflict(c, plan, state) {
    const A = c.a, B = c.b;
    const kinds = [A.kind, B.kind];
    const moving = function (f) { return f.kind !== "overflight" || f.iafdof; };
    // ---- same-airport successive departures are handled up front (see departureRules)
    if (!moving(A) && !moving(B)) return { ok: false, reason: "two level en route aircraft would be traffic at " + c.node + " (" + A.cs + " / " + B.cs + ") and en route aircraft are not moved" };

    // IAFDOF: try the other direction once
    const tryFlip = function (f) {
      if (!(f.kind === "overflight" && f.iafdof) || state.flipped[f.id]) return false;
      const p = plan[f.id];
      const alt = f.alt, other = p.finalAlt === alt + 1000 ? alt - 1000 : alt + 1000;
      const parityOK = ((other / 1000) % 2 === 1) === f.wantsOdd;
      if (!parityOK || other < f.floor || other > f.cap) return false;
      p.finalAlt = other; state.flipped[f.id] = true; return true;
    };

    if (c.type === "hpa") {
      // c.a is the arrival that owns the pattern; c.b is inside it
      const arr = c.a, X = c.b, N = c.node, xi = c.j;
      const pa = plan[arr.id];
      const band = holdBand(arr, c.i, plan);
      const label = arr.cs + " inbound " + N + " " + toHHMM(holdT(arr)) + " (holding pattern airspace protected " + toHHMM(c.window.from) + "–" + toHHMM(c.window.to) + ")";
      if (c.kvks) {
        // the departure stays under the holder until the miss point on its route and reports passing it
        const p = plan[X.id];
        const below = band[0] - RULES.VERT;
        const m = c.kvks;
        if (below < m.minAlt) return { ok: false, reason: X.cs + " (KVKS departure) cannot stay under " + arr.cs + " holding at VKS (" + hundreds(band[0]) + ")" };
        addRestriction(p, { kind: "cross", node: m.node, nm: m.nm, dir: m.dir, limit: "below", alt: below, why: "traffic", vs: [arr.cs], label: "VKS holding pattern airspace: " + label + " — under the pattern until clear of it at " + m.nm + " " + m.dir + " " + m.node });
        const at = toHHMM(X.baseT + m.d / X.mpm);
        p.reports.push({ text: "RP " + m.nm + " " + m.dir + " " + m.node, record: m.nm + m.dir + m.node + "/" + at, phr: X.cs + ", report passing " + m.nm + " miles " + DIR_WORD[m.dir] + " of " + navName(m.node), why: "clear of the VKS holding pattern airspace (" + arr.cs + " holding); the arrival gets its approach after this report", at: at });
        p.warnings.push(arr.cs);
        pa.forceHold = true; pa.forcedBy = X.cs; pa.warnings.push(X.cs);
        return { ok: true };
      }
      if (c.seg) {
        // pattern airspace along another airway: hold above the level traffic (lowest ARTCC altitude available)
        if (X.kind === "overflight" && X.iafdof && tryFlip(X)) return { ok: true };
        const xb = bandAt(X, xi, plan);
        const want = xb[1] + RULES.VERT;
        if (want <= arr.alt && want <= lowestFor(arr) + 2000 && pa.arrivalAlt < want) {
          pa.arrivalAlt = want; pa.warnings.push(X.cs);
          pa.altNote = "lowest ARTCC altitude available with " + X.cs + " at " + hundreds(xb[0]) + " on " + c.seg.airway + " through the " + N + " holding pattern airspace (" + c.seg.miss + ")";
          return { ok: true };
        }
        return { ok: false, reason: X.cs + " on " + c.seg.airway + " passes through " + arr.cs + "'s holding pattern airspace at " + N + " (" + c.seg.miss + ")" };
      }
      if (X.kind === "departure") {
        const p = plan[X.id];
        const below = band[0] - RULES.VERT;
        if (c.occ.outR != null && below >= minDepAlt(X, xi)) {
          addRestriction(p, { kind: "cross", node: N, nm: c.occ.cout, dir: dirLabel(c.occ.outR), on: onAirwayNote(X, xi, c.occ.cout), limit: "below", alt: below, why: "traffic", vs: [arr.cs], label: "holding pattern airspace: " + label + " — stay under it until clear of the pattern" });
          p.warnings.push(arr.cs);
          return { ok: true };
        }
        const above = band[1] + RULES.VERT;
        if (X.dme && c.occ.inR != null && above <= p.finalAlt && (X.nodes[xi].d - c.occ.cin) >= 25) {
          addRestriction(p, { kind: "cross", node: N, nm: c.occ.cin, dir: dirLabel(c.occ.inR), limit: "above", alt: above, why: "traffic", vs: [arr.cs], label: "holding pattern airspace: " + label + " — above it before entering the pattern" });
          p.warnings.push(arr.cs);
          return { ok: true };
        }
        return { ok: false, reason: X.cs + " (departure) cannot be kept clear of " + arr.cs + "'s holding pattern airspace at " + N };
      }
      if (X.kind === "overflight" && !X.iafdof) {
        // never move the level aircraft: get under it before entering the pattern...
        const under = X.alt - RULES.VERT;
        if (arr.dme && under >= pa.arrivalAlt && c.i > 0) {
          const inR = radialToward(arr, c.i, c.i - 1);
          const cin = Math.min(hpaClear(N, inR), arr.nodes[c.i].d - arr.nodes[c.i - 1].d);
          const bnd = boundaryFrom(arr.nodes[c.i].via, N);
          if (inR != null && (!bnd || cin < bnd.nm)) {
            addRestriction(pa, { kind: "cross", node: N, nm: cin, dir: dirLabel(inR), limit: "below", alt: under, why: "traffic", vs: [X.cs], label: "holding pattern airspace: " + X.cs + " level at " + hundreds(X.alt) + " through the pattern — be under it before entering" });
            pa.warnings.push(X.cs);
            return { ok: true };
          }
        }
        // ...or hold above it (lowest ARTCC altitude available)
        const want = X.alt + RULES.VERT;
        if (arr.destAirport !== "KGWO" && want <= arr.alt && want <= lowestFor(arr) + 2000 && pa.arrivalAlt < want) {
          pa.arrivalAlt = want; pa.warnings.push(X.cs); pa.altNote = "lowest ARTCC altitude available with " + X.cs + " at " + hundreds(X.alt) + " through the holding pattern airspace";
          return { ok: true };
        }
        return { ok: false, reason: X.cs + " (level) passes through " + arr.cs + "'s holding pattern airspace at " + N + " at " + hundreds(X.alt) };
      }
      if (X.kind === "overflight" && X.iafdof) { if (tryFlip(X)) return { ok: true }; return { ok: false, reason: X.cs + " (IAFDOF) conflicts with " + arr.cs + "'s holding pattern airspace at " + N }; }
      if (X.kind === "arrival" && holdFix(X) !== N) {
        // an arrival for another field transiting this pattern: keep it level at
        // cruise until clear, above the holder (or the holder takes the lowest
        // altitude above it)
        const px = plan[X.id];
        if (c.occ.outR == null) return { ok: false, reason: X.cs + " (arrival) transits " + arr.cs + "'s holding pattern airspace at " + N };
        const lvl = { kind: "maintain", node: N, nm: c.occ.cout, dir: dirLabel(c.occ.outR), alt: X.alt, why: "traffic", vs: [arr.cs], label: "holding pattern airspace: " + label + " — stay level at cruise until clear of the pattern" };
        if (X.alt >= band[1] + RULES.VERT) {
          addRestriction(px, lvl); px.warnings.push(arr.cs); state.leveled[X.id + ":" + N] = true;
          return { ok: true };
        }
        const want = X.alt + RULES.VERT;
        if (want <= arr.alt && want <= lowestFor(arr) + 2000 && pa.arrivalAlt < want) {
          addRestriction(px, lvl); px.warnings.push(arr.cs); state.leveled[X.id + ":" + N] = true;
          pa.arrivalAlt = want; pa.warnings.push(X.cs);
          pa.altNote = "lowest ARTCC altitude available with " + X.cs + " level at " + hundreds(X.alt) + " through the holding pattern airspace";
          return { ok: true };
        }
        return { ok: false, reason: X.cs + " (arrival, " + hundreds(X.alt) + ") transits " + arr.cs + "'s holding pattern airspace at " + N + " and cannot be kept above it" };
      }
      if (X.kind === "arrival") {
        // two arrivals sharing the fix: the later one takes the next altitude up (stack 60, 70, 80 ...)
        const later = holdT(arr) >= holdT(X) ? arr : X;
        const earlier = later === arr ? X : arr;
        const pl = plan[later.id];
        if (later.destAirport !== "KGWO") {
          const want = plan[earlier.id].arrivalAlt + RULES.VERT;
          if (want <= later.alt && want <= lowestFor(later) + 2000 && pl.arrivalAlt <= want) {
            pl.arrivalAlt = want; pl.warnings.push(earlier.cs);
            pl.altNote = "lowest ARTCC altitude available (" + earlier.cs + " holding at " + hundreds(plan[earlier.id].arrivalAlt) + ")";
            // stacked in the pattern: the earlier one is at its altitude by the time the later one arrives
            pl.stackedWith = (pl.stackedWith || []).concat([earlier.id]);
            plan[earlier.id].stackedWith = (plan[earlier.id].stackedWith || []).concat([later.id]);
            return { ok: true };
          }
        }
        return { ok: false, reason: arr.cs + " and " + X.cs + " both need the holding pattern at " + N };
      }
      return { ok: false, reason: "unhandled holding pattern conflict" };
    }

    if (c.type === "cross") {
      const i = c.i, j = c.j;
      const order = A.kind === "departure" ? [[A, i, B, j], [B, j, A, i]] : [[B, j, A, i], [A, i, B, j]];
      for (let k = 0; k < order.length; k++) {
        const dep = order[k][0], di = order[k][1], oth = order[k][2], oj = order[k][3];
        if (dep.kind === "departure") {
          if (oth.kind === "departure") continue; // two climbing aircraft: only time separates them
          if (oth.kind === "arrival") {
            // hold the arrival level at cruise across the fix, then keep the departure under it
            const pa = plan[oth.id];
            const feederIdx = oth.nodes.length - 2;
            if (oj !== feederIdx && !state.leveled[oth.id + ":" + oth.nodes[oj].id]) {
              const pt = restrictionPoint(oth, oj, dep, di);
              if (pt) {
                addRestriction(pa, { kind: "maintain", node: oth.nodes[oj].id, nm: pt.nm, dir: pt.dir, alt: oth.alt, why: "traffic", vs: [dep.cs], label: "traffic: " + dep.cs + " climbing through " + oth.nodes[oj].id + " — stay level at cruise until laterally clear" });
                pa.warnings.push(dep.cs);
                state.leveled[oth.id + ":" + oth.nodes[oj].id] = true;
                return { ok: true };
              }
            }
          }
          if (resolveDepVsBand(dep, di, oth, oj, bandAt(oth, oj, plan), plan, c)) return { ok: true };
        }
      }
      // arrival vs level traffic / IAFDOF
      const arrFirst = A.kind === "arrival" ? [[A, i, B, j], [B, j, A, i]] : [[B, j, A, i], [A, i, B, j]];
      for (let k = 0; k < arrFirst.length; k++) {
        const arr = arrFirst[k][0], ai = arrFirst[k][1], oth = arrFirst[k][2], oj = arrFirst[k][3];
        if (arr.kind !== "arrival") continue;
        const pa = plan[arr.id];
        const band = bandAt(oth, oj, plan);
        if (oth.kind === "arrival") {
          // two arrivals: same airport at the feeder -> the later one gets the next lowest altitude
          if (arr.destAirport === oth.destAirport && ai === arr.nodes.length - 2) {
            const later = arr.nodes[ai].t >= oth.nodes[oj].t ? arr : oth;
            const pl = plan[later.id];
            if (later.destAirport !== "KGWO") {
              const otherAlt = plan[later === arr ? oth.id : arr.id].arrivalAlt;
              const want = otherAlt + 1000;
              if (want < later.alt && want <= lowestFor(later) + 2000 && pl.arrivalAlt < want) { pl.arrivalAlt = want; pl.warnings.push((later === arr ? oth : arr).cs); pl.altNote = "lowest ARTCC altitude available (" + (later === arr ? oth : arr).cs + " at " + hundreds(otherAlt) + ")"; return { ok: true }; }
            }
          }
          continue;
        }
        if (oth.kind === "departure") continue; // handled above
        // level (or IAFDOF) traffic in the arrival's descent band
        const T = band[0], Thi = band[1];
        const feederIdx = arr.nodes.length - 2;
        // (a) descend under it before entering its airspace
        if (arr.dme) {
          const ep = entryPoint(arr, ai, oth, oj);
          if (ep && T - RULES.VERT >= pa.arrivalAlt) {
            // the point must be inside Sector 66
            const prev = arr.nodes[ai - 1];
            const legAw = arr.nodes[ai].via;
            const bnd = prev && !isNavaid(prev.id) ? null : boundaryFrom(legAw, arr.nodes[ai].id);
            const inside = !bnd || ep.nm < bnd.nm;
            if (ai > 0 && inside) {
              addRestriction(pa, { kind: "cross", node: arr.nodes[ai].id, nm: ep.nm, dir: ep.dir, limit: "below", alt: T - RULES.VERT, why: "traffic", vs: [oth.cs], label: "traffic: " + oth.cs + " " + hundreds(T) + " at " + arr.nodes[ai].id + " " + toHHMM(oth.nodes[oj].t) + " — under it before " + ep.nm + " nm from " + arr.nodes[ai].id, before: true });
              pa.warnings.push(oth.cs);
              return { ok: true };
            }
          }
          // (b) stay level at cruise past it (not at the feeder)
          if (ai !== feederIdx && Thi < arr.alt && !state.leveled[arr.id + ":" + arr.nodes[ai].id]) {
            const pt = restrictionPoint(arr, ai, oth, oj);
            if (pt) {
              addRestriction(pa, { kind: "maintain", node: arr.nodes[ai].id, nm: pt.nm, dir: pt.dir, alt: arr.alt, why: "traffic", vs: [oth.cs], label: "traffic: " + oth.cs + " " + hundreds(T) + " at " + arr.nodes[ai].id + " — stay level at cruise until laterally clear" });
              pa.warnings.push(oth.cs);
              state.leveled[arr.id + ":" + arr.nodes[ai].id] = true;
              return { ok: true };
            }
          }
        }
        // (c) lowest available altitude one higher (JAN arrivals)
        if (arr.destAirport !== "KGWO" && Thi + RULES.VERT <= arr.alt && Thi + RULES.VERT <= lowestFor(arr) + 2000 && pa.arrivalAlt <= Thi) {
          pa.arrivalAlt = Thi + RULES.VERT; pa.warnings.push(oth.cs);
          pa.altNote = "lowest ARTCC altitude available (" + oth.cs + " at " + hundreds(T) + ")";
          return { ok: true };
        }
        if (tryFlip(oth)) return { ok: true };
        return { ok: false, reason: arr.cs + " (arrival) cannot be separated from " + oth.cs + " at " + arr.nodes[ai].id };
      }
      if (tryFlip(A) || tryFlip(B)) return { ok: true };
      return { ok: false, reason: A.cs + " and " + B.cs + " are traffic at " + c.node + " (" + Math.round(c.dt) + " min apart) with no available restriction" };
    }

    if (c.type === "same") {
      const lead = c.lead, trail = c.trail;
      // a departure trailing / leading level traffic on the same course
      const dep = A.kind === "departure" ? A : B.kind === "departure" ? B : null;
      const oth = dep === A ? B : A;
      if (dep && oth.kind !== "departure") {
        const p = plan[dep.id];
        const band = bandAt(oth, c.run.pairs[0][dep === A ? 1 : 0], plan);
        const T = band[0];
        const belowAlt = T - RULES.VERT;
        if (belowAlt >= dep.floor && dep.reqAlt - belowAlt <= RULES.ALT_CHANGE_MAX && belowAlt < p.finalAlt) {
          let assign = belowAlt;
          if (((assign / 1000) % 2 === 1) !== dep.wantsOdd && assign - 1000 >= dep.floor && dep.reqAlt - (assign - 1000) <= RULES.ALT_CHANGE_MAX) assign -= 1000;
          p.finalAlt = assign;
          p.altNotAvail = { requested: dep.reqAlt, assigned: assign, vs: oth.cs, expectAt: "when clear of " + oth.cs };
          p.warnings.push(oth.cs);
          return { ok: true };
        }
        return { ok: false, reason: dep.cs + " would join " + oth.cs + "'s course at " + c.node + " with " + Math.round(c.gap) + " min (" + c.req.min.toFixed(0) + " needed)" };
      }
      const arr = A.kind === "arrival" ? A : B.kind === "arrival" ? B : null;
      if (arr && (arr === A ? B : A).kind === "overflight") {
        const o = arr === A ? B : A;
        if (tryFlip(o)) return { ok: true };
        // descend under before the run starts is only possible inside the sector — not modelled
        return { ok: false, reason: arr.cs + " (arrival) follows/leads " + o.cs + " on the same course inside " + Math.round(c.gap) + " min" };
      }
      if (tryFlip(A) || tryFlip(B)) return { ok: true };
      return { ok: false, reason: A.cs + " and " + B.cs + " on the same course " + Math.round(c.gap) + " min apart (" + Math.round(c.req.min) + " needed)" };
    }

    if (c.type === "opp") {
      const dep = A.kind === "departure" ? A : B.kind === "departure" ? B : null;
      const oth = dep === A ? B : A;
      if (dep && oth.kind === "overflight") {
        const p = plan[dep.id];
        const band = bandAt(oth, c.run.pairs[0][dep === A ? 1 : 0], plan);
        const belowAlt = band[0] - RULES.VERT;
        if (belowAlt >= dep.floor && dep.reqAlt - belowAlt <= RULES.ALT_CHANGE_MAX && belowAlt < p.finalAlt) {
          p.finalAlt = belowAlt;
          p.altNotAvail = { requested: dep.reqAlt, assigned: belowAlt, vs: oth.cs, expectAt: "after passing " + oth.cs };
          p.warnings.push(oth.cs);
          return { ok: true };
        }
      }
      const arr = A.kind === "arrival" ? A : B.kind === "arrival" ? B : null;
      if (arr && (arr === A ? B : A).kind === "overflight") {
        const o = arr === A ? B : A;
        const pa = plan[arr.id];
        const pr = c.run.pairs[c.run.pairs.length - 1];
        const lastIdx = arr === A ? pr[0] : pr[1];
        const band = bandAt(o, arr === A ? pr[1] : pr[0], plan);
        if (lastIdx !== arr.nodes.length - 2 && band[1] < arr.alt && !state.leveled[arr.id + ":" + arr.nodes[lastIdx].id]) {
          const oIdx = arr === A ? pr[1] : pr[0];
          const pt = restrictionPoint(arr, lastIdx, o, oIdx) || { nm: 5, dir: dirLabel(radialToward(arr, lastIdx, lastIdx + 1) || 0) };
          addRestriction(pa, { kind: "maintain", node: arr.nodes[lastIdx].id, nm: pt.nm, dir: pt.dir, alt: arr.alt, why: "traffic", vs: [o.cs], label: "opposite direction " + o.cs + " at " + hundreds(band[0]) + " — stay level at cruise until past it" });
          pa.warnings.push(o.cs);
          state.leveled[arr.id + ":" + arr.nodes[lastIdx].id] = true;
          return { ok: true };
        }
        if (tryFlip(o)) return { ok: true };
      }
      if (tryFlip(A) || tryFlip(B)) return { ok: true };
      return { ok: false, reason: A.cs + " and " + B.cs + " opposite direction on the same airway at overlapping altitudes" };
    }
    return { ok: false, reason: "unhandled conflict type" };
  }

  // Successive departures from the same airport: the 2-minute rule (courses
  // diverge within 5 minutes after takeoff), never if the second is faster,
  // or the 44/22-knot rule when the FIRST is faster; then the second must
  // end up below the first unless it is slower.
  function departureRules(flights, plan) {
    const deps = flights.filter(function (f) { return f.kind === "departure"; });
    for (let a = 0; a < deps.length; a++) for (let b = a + 1; b < deps.length; b++) {
      const F = deps[a], S = deps[b];
      if (F.originAirport !== S.originAirport) continue;
      let first = F.baseT <= S.baseT ? F : S, second = first === F ? S : F;
      if (F.baseT === S.baseT) { first = F.gs >= S.gs ? F : S; second = first === F ? S : F; } // faster first
      if (second.baseT - first.baseT < 0) continue;
      const pf = plan[first.id], ps = plan[second.id];
      // proposals 10 or more minutes apart are separated by time; no rule needed
      if (second.baseT - first.baseT >= RULES.LONG_MIN) continue;
      const diff = first.gs - second.gs;
      let rule;
      if (diff >= RULES.RULE44.kt) rule = { min: RULES.RULE44.min, text: "RLS " + RULES.RULE44.min + " MIN < " + first.cs, phr: second.cs + " released three minutes after " + first.cs + " departs (44-knot rule)", kind: "44K" };
      else if (diff >= RULES.RULE22.kt) rule = { min: RULES.RULE22.min, text: "RLS " + RULES.RULE22.min + " MIN < " + first.cs, phr: second.cs + " released five minutes after " + first.cs + " departs (22-knot rule)", kind: "22K" };
      else if (second.gs <= first.gs) rule = { min: RULES.DEP_RULE_MIN, text: "RLS " + RULES.DEP_RULE_MIN + " MIN < " + first.cs, phr: second.cs + " released two minutes after " + first.cs + " departs", kind: "2MIN" };
      else return { ok: false, reason: second.cs + " is faster than " + first.cs + " off " + first.originAirport + " — the 2-minute rule cannot be used behind a slower aircraft" };
      if (second.baseT - first.baseT < rule.min) return { ok: false, reason: first.originAirport + " departures " + first.cs + "/" + second.cs + " proposed " + (second.baseT - first.baseT) + " min apart (" + rule.min + " needed)" };
      ps.depRule = rule;
      ps.warnings.push(first.cs); pf.warnings.push(second.cs);
      if (first.originAirport === "KGWO") { pf.depInstr = SYM.depart + " SW–SQS"; ps.depInstr = SYM.depart + " SW–SQS"; pf.depInstrPhr = ps.depInstrPhr = "depart southwest direct Sidon"; }
      // after the initial rule, the trailer must stay under the leader unless a speed rule applies
      if (rule.kind === "2MIN" && ps.finalAlt >= pf.finalAlt && sharesCourse(first, second)) {
        const want = pf.finalAlt - RULES.VERT;
        const assign = ((want / 1000) % 2 === 1) === second.wantsOdd ? want : want - 1000;
        if (assign >= second.floor && second.reqAlt - assign <= RULES.ALT_CHANGE_MAX) { ps.finalAlt = assign; ps.altNotAvail = { requested: second.reqAlt, assigned: assign, vs: first.cs, expectAt: "when " + first.cs + " is clear" }; }
        else return { ok: false, reason: second.cs + " requests " + hundreds(second.reqAlt) + " behind " + first.cs + " at " + hundreds(pf.finalAlt) + " on the same course off " + first.originAirport };
      }
    }
    return { ok: true };
  }
  function sharesCourse(a, b) { return sharedRuns(a, b).some(function (r) { return r.dir === "same" && r.pairs.length >= 2; }); }

  // ---- reports ------------------------------------------------------------
  // Position/DME reports the controller must solicit for the separation used.
  function reportsFor(flights, plan, pairs) {
    pairs.forEach(function (c) {
      if (!c.ok && c.type !== "cross-ok") return;
      const A = c.a, B = c.b;
      if (c.type === "same-dme-ok") {
        [A, B].forEach(function (f) { plan[f.id].reports.push({ text: "SAY DME " + c.node, phr: f.cs + ", say DME from " + navName(c.node), why: "DME separation (" + c.req.nm + " nm) with " + (f === A ? B.cs : A.cs), at: toHHMM(f.nodes[nodeIndex(f, c.node)].t) }); });
      }
      if (c.type === "cross-ok" || c.type === "same-rule-ok") {
        [A, B].forEach(function (f) {
          if (f.kind !== "departure") return;
          const gw = f.nodes[f.originAirport === "0M8" ? 2 : 1].id;
          if (c.node !== gw) return;
          const other = f === A ? B : A;
          plan[f.id].reports.push({ text: "RP " + gw, record: gw + "/" + toHHMM(f.nodes[nodeIndex(f, gw)].t), phr: f.cs + ", report passing " + navName(gw), why: "airport and VORTAC are not co-located: a " + gw + " report (or DME) proves the " + Math.round(c.dt != null ? c.dt : c.gap) + " min from " + other.cs, at: toHHMM(f.nodes[nodeIndex(f, gw)].t) });
        });
      }
    });
  }

  // ---- analysis -----------------------------------------------------------
  function initPlan(flights) {
    const plan = {};
    flights.forEach(function (f) {
      plan[f.id] = { finalAlt: f.kind === "overflight" && f.iafdof ? f.appropriateAlt : f.alt, restrictions: [], reports: [], warnings: [], notes: [], coord: [], depRule: null, depInstr: null, altNotAvail: null, arrivalAlt: f.destAirport ? arrivalFloor(f) : null };
      airspacePlan(f, plan[f.id]);
    });
    return plan;
  }

  function analyze(flights, opts) {
    const plan = initPlan(flights);
    const state = { flipped: {}, leveled: {} };
    const unsolvable = [];
    const dr = departureRules(flights, plan);
    if (!dr.ok) return { ok: false, unsolvable: [dr.reason], plan: plan, pairs: [] };
    let pairs = [];
    for (let iter = 0; iter < 24; iter++) {
      pairs = [];
      for (let a = 0; a < flights.length; a++) for (let b = a + 1; b < flights.length; b++) {
        const A = flights[a], B = flights[b];
        if (A.kind === "departure" && B.kind === "departure" && A.originAirport === B.originAirport) continue; // departure rules
        // KGWO departure vs KGWO arrival (tower visual separation, approach airspace reports) is not modelled yet;
        // JAN-airport pairs are handled by the LOA (departures cross MHZ at or below 5,000) and the holding pattern logic
        if (A.kind !== B.kind && A.kind !== "overflight" && B.kind !== "overflight" && (A.originAirport || A.destAirport) === "KGWO" && (B.originAirport || B.destAirport) === "KGWO") {
          return { ok: false, unsolvable: [A.cs + " and " + B.cs + " are an arrival and a departure at KGWO (not modelled yet)"], plan: plan, pairs: [] };
        }
        if (A.kind === "arrival" && B.kind === "arrival" && A.destAirport === "KGWO" && B.destAirport === "KGWO") {
          return { ok: false, unsolvable: [A.cs + " and " + B.cs + " are two KGWO arrivals (holding stack not modelled yet)"], plan: plan, pairs: [] };
        }
        pairs.push.apply(pairs, pairConflicts(A, B, plan));
      }
      const open = pairs.filter(function (c) { return !c.ok; });
      if (!open.length) break;
      const sig = open[0].type + "|" + open[0].a.id + "|" + open[0].b.id + "|" + open[0].node;
      if (state.lastSig === sig) { unsolvable.push("no usable resolution (" + open[0].type + ") for " + open[0].a.cs + " / " + open[0].b.cs + " at " + open[0].node); break; }
      state.lastSig = sig;
      const r = resolveConflict(open[0], plan, state);
      if (!r.ok) { unsolvable.push(r.reason); break; }
      if (iter === 23) unsolvable.push("could not settle " + open[0].a.cs + " / " + open[0].b.cs);
    }
    // time-separated crossings worth a report (departures at their VORTAC)
    const crossOk = [];
    for (let a = 0; a < flights.length; a++) for (let b = a + 1; b < flights.length; b++) {
      const A = flights[a], B = flights[b];
      sharedRuns(A, B).forEach(function (run) {
        if (run.dir !== "cross" && run.pairs.length !== 1) return;
        const i = run.pairs[0][0], j = run.pairs[0][1];
        if (!bandsOverlap(bandAt(A, i, plan), bandAt(B, j, plan))) return;
        const dt = Math.abs(A.nodes[i].t - B.nodes[j].t);
        if (dt >= RULES.LONG_MIN && dt < 20) crossOk.push({ a: A, b: B, type: "cross-ok", node: A.nodes[i].id, dt: dt, ok: true });
      });
    }
    reportsFor(flights, plan, pairs.filter(function (c) { return c.ok; }).concat(crossOk));
    return { ok: !unsolvable.length, unsolvable: unsolvable, plan: plan, pairs: pairs.concat(crossOk) };
  }

  // ---- answer key: strip marks + controller summary -------------------------
  // marks[space] = [ { t, c: 'red'|'blk', circ: 'red'|'blk', ul: bool, strike: bool, bar: bool } ]
  function decorate(flights, analysis) {
    const plan = analysis.plan;
    flights.forEach(function (f) {
      const p = plan[f.id];
      // restrictions in the order the aircraft meets them (tower restriction first)
      p.restrictions.sort(function (x, y) {
        if (!!x.tower !== !!y.tower) return x.tower ? -1 : 1;
        const dx = (f.nodes[Math.max(0, nodeIndex(f, x.node))] || {}).d || 0, dy = (f.nodes[Math.max(0, nodeIndex(f, y.node))] || {}).d || 0;
        const px = dx + (x.kind === "maintain" ? (x.nm || 0) : x.limit === "above" || (f.kind === "arrival" && x.limit === "below") ? -(x.nm || 0) : (x.nm || 0));
        const py = dy + (y.kind === "maintain" ? (y.nm || 0) : y.limit === "above" || (f.kind === "arrival" && y.limit === "below") ? -(y.nm || 0) : (y.nm || 0));
        return px - py;
      });
      const ctrl = { flight: f.cs, kind: f.kind, items: [], phraseology: [], coordination: [], reports: [], warnings: p.warnings.slice() };
      if (f.onFreq) ctrl.items.push("On frequency when the problem starts (pilot estimate in space 17): check the altitude as level in space 20; no check-on to acknowledge.");
      if (f.altReq) ctrl.items.push("Altitude request at " + toHHMM(f.altReq.t) + ": " + hundreds(f.altReq.alt) + ". Approve only if it stays separated from every aircraft it would then share altitude with (not checked by the engine yet); otherwise “unable”.");
      const restrictionsPhr = p.restrictions.map(function (r) { return restrictionPhr(r); });
      if (f.kind === "departure") {
        const dest = f.dest, apt = f.originAirport;
        const fromApt = (apt === "0M8" || apt === "KVKS") ? "cleared from " + ZAE.AIRPORTS[apt].name + " Airport to " : "cleared to ";
        let via;
        if (p.viaPhr) via = p.viaPhr;
        else if (apt === "KGWO") via = (p.depInstr ? "depart southwest direct Sidon" : "direct Sidon") + " as filed";
        else if (p.depInstrPhr) via = p.depInstrPhr + " as filed";
        else { // JAN LOA: airway and first fix outside approach control airspace
          const mi = nodeIndex(f, "MHZ");
          const nxt = f.nodes[mi + 1];
          let firstFix = null; for (let k = mi + 1; k < f.nodes.length; k++) if (isNavaid(f.nodes[k].id)) { firstFix = f.nodes[k]; break; }
          via = (nxt ? spokenAirway(nxt.via) + " " : "") + (firstFix ? navName(firstFix.id) : "") + " as filed";
        }
        let phr = f.cs + ", " + fromApt + (ZAE.AIRPORTS[dest] ? ZAE.AIRPORTS[dest].name : dest) + " Airport via " + via;
        const traffic = p.restrictions.filter(function (r) { return !r.tower; });
        if (traffic.length) phr += ". " + traffic.map(restrictionPhr).map(function (s) { return s.charAt(0).toUpperCase() + s.slice(1); }).join(", ");
        phr += ". Climb and maintain " + spoken(p.finalAlt);
        if (p.altNotAvail) phr += ". " + spoken(p.altNotAvail.requested).replace(/^\w/, function (c) { return c.toUpperCase(); }) + " is not available, expect " + spoken(p.altNotAvail.requested) + " " + p.altNotAvail.expectAt;
        if (p.voidTime != null) phr += ". Clearance void if not off by " + toHHMM(p.voidTime) + ", if not off by " + toHHMM(p.voidTime) + " advise Aero Center not later than " + toHHMM(p.voidTime + RULES.ADVISE_MIN) + " of intentions";
        if (p.verify) phr += ". Verify this clearance will allow compliance with local traffic pattern and terrain or obstruction avoidance. Advise " + f.cs + " released for departure, contact Aero Center one two five point zero";
        if (p.depRule) phr += ". " + p.depRule.phr.charAt(0).toUpperCase() + p.depRule.phr.slice(1);
        ctrl.phraseology.push(phr + ".");
        ctrl.items.push("EDC " + toHHMM(p.edc) + " if the clearance cannot be issued when requested (10 minutes from the request).");
        if (p.voidTime != null) ctrl.items.push("Uncontrolled field: void time " + toHHMM(p.voidTime) + " (advise by " + toHHMM(p.voidTime + RULES.ADVISE_MIN) + "), and the “verify” phraseology because departure instructions were issued.");
        if (apt === "KJAN" || apt === "KJVW") ctrl.items.push("JAN LOA: the tower clears the aircraft direct MHZ with a restriction to cross MHZ at or below 5,000 — Center issues route and altitude.");
        if (f.nextSector) ctrl.coordination.push("APREQ " + f.nextSector + ": “In suspense, " + f.cs + ", assumed " + ZAE.AIRPORTS[apt].name + " departure " + toHHMM(f.baseT) + ", climbing to " + spoken(p.finalAlt) + (f.hez026 ? ", via the Natchez zero two six radial" : "") + (p.depRule && p.depRule.kind !== "2MIN" ? ", using the " + (p.depRule.kind === "44K" ? "forty-four" : "twenty-two") + " knot rule in trail of " + p.depRule.text.split("< ")[1] : "") + ".”");
        if (f.hez026) ctrl.items.push("HEZ026R departure: the radial is not in the filed route (" + f.route + ") — " + (f.hez026.toKHEZ ? "“cleared via the HEZ zero two six radial” for the route portion; KHEZ arrivals do not progress HEZ" : "“via Natchez zero two six radial, Natchez as filed”") + ". Coordinate the radial with POE LO. Not traffic for aircraft on V417.");
        p.coord.forEach(function (c) { ctrl.coordination.push(c.to + ": " + c.what); });
        if (f.destAirport) {
          // the same aircraft is a JAN arrival: hold at MHZ, TCP at the JAN boundary, inbound coordination
          const ap = [];
          if (p.arrivalAlt < p.finalAlt) ap.push("descend and maintain " + spoken(p.arrivalAlt));
          ctrl.phraseology.push("Once airborne (before MHZ): " + f.cs + ", cleared to Magnolia VORTAC, " + (ap.length ? ap.join(", ") + ", " : "") + p.holdPhr + ". Contact Jackson Approach one one niner point two, " + p.tcpPhr + ".");
          ctrl.coordination.push("Inbound to JAN Approach: “" + f.cs + ", " + f.type + " slant " + f.equip + ", estimated Magnolia VORTAC " + toHHMM(f.nodes[f.nodes.length - 2].t) + ", " + (p.arrivalAlt < p.finalAlt ? "descending to " : "at ") + spoken(p.arrivalAlt) + (f.destAirport !== "KJAN" ? ", landing " + ZAE.AIRPORTS[f.destAirport].name : "") + ", your control " + p.tcpPhr + ".”");
          ctrl.items.push("Departure that lands at " + ZAE.AIRPORTS[f.destAirport].name + ": both strips stay in suspense; the MHZ strip is the arrival strip (hold northwest, no EFC, TCP " + p.tcp + ").");
        }
      } else if (f.kind === "arrival") {
        if (f.destAirport === "KGWO") {
          const parts = [];
          p.restrictions.forEach(function (r) { parts.push(restrictionPhr(r)); });
          let phr = f.cs + ", " + (parts.length ? parts.join(", ") + ", " : "") + p.approachPhr;
          ctrl.phraseology.push(phr.charAt(0).toUpperCase() + phr.slice(1) + ".");
          ctrl.phraseology.push(f.cs + ", contact Greenwood Tower one two zero point two (after the aircraft reports passing Sidon).");
          ctrl.items.push("KGWO estimate = SQS estimate + 7 minutes (" + toHHMM(f.nodes[f.nodes.length - 1].t) + "); runway 23 is always active — VOR runway 5 approach circle to runway 23.");
        } else if (f.destAirport === "KMLU") {
          const parts = [];
          p.restrictions.forEach(function (r) { parts.push(restrictionPhr(r)); });
          if (p.arrivalAlt < f.alt) parts.push("descend and maintain " + spoken(p.arrivalAlt));
          const phr = f.cs + ", cleared to DINKY intersection" + (parts.length ? ", " + parts.join(", ") : "") + ", " + p.holdPhr + ". Contact Monroe Approach one one eight point two, " + p.tcpPhr + ".";
          ctrl.phraseology.push(phr);
          ctrl.coordination.push("Inbound to MLU Approach: “" + f.cs + ", " + f.type + " slant " + f.equip + ", estimated DINKY intersection " + toHHMM(p.dinkyEst) + ", " + (p.arrivalAlt < f.alt ? "descending to " : "at ") + spoken(p.arrivalAlt) + ", your control DINKY.”");
          ctrl.items.push("The printed strip posts STUEE (DINKY is nonradar-only): write DINKY beside it and use the STUEE estimate minus 3 (" + toHHMM(f.nodes[nodeIndex(f, "STUEE")].t) + " → " + toHHMM(p.dinkyEst) + ") as the DINKY estimate for the clearance, the inbound coordination and the EFC.");
          ctrl.items.push("MLU LOA: DINKY intersection is the clearance limit and holding fix (hold northeast on V18); lowest ARTCC altitude 7,000 (MLU Approach owns 6,000 and below); EFC " + toHHMM(p.efc) + " = DINKY estimate + 5; communications change " + p.commNote + ".");
          if (p.altNote) ctrl.items.push("Clearance altitude " + hundreds(p.arrivalAlt) + ": " + p.altNote + ".");
        } else if (f.destAirport === "KVKS") {
          const holding = kvksHolding(p);
          const parts = [];
          p.restrictions.forEach(function (r) { parts.push(restrictionPhr(r)); });
          ctrl.items.push("Decide before the DORTS estimate (" + toHHMM(p.decideBy) + "): " + (holding ? "traffic" + (p.forcedBy ? " (KVKS departure " + p.forcedBy + " under the pattern until it reports the miss point)" : "") + " — clear the aircraft to hold at VKS, at least 5 minutes before the fix; the approach once clear" : "no traffic — issue the approach clearance") + ".");
          if (!holding) {
            ctrl.phraseology.push(f.cs + ", " + (parts.length ? parts.join(", ") + ", " : "") + p.apchPhr + ". Report cancellation of IFR this frequency or with Aero Center Flight Data, change to advisory frequency approved.");
          } else {
            const hp = parts.slice(); hp.push((p.arrivalAlt < f.alt ? "descend and maintain " : "maintain ") + spoken(p.arrivalAlt));
            ctrl.phraseology.push(f.cs + ", cleared to Vicksburg radio beacon, " + hp.join(", ") + ", " + p.holdPhr + ".");
            ctrl.phraseology.push("Once clear: " + f.cs + ", " + p.apchPhr + ". Report cancellation of IFR this frequency or with Aero Center Flight Data, change to advisory frequency approved.");
          }
          ctrl.items.push("KVKS is an uncontrolled field on the VKS NDB (NDB runway 1): no inbound coordination; the Remote answers as FSS and reports landed 5 minutes after the VKS estimate (" + toHHMM(f.nodes[f.nodes.length - 2].t) + ") or the approach clearance, whichever is later. The 20 SW MHZ restriction keeps the approach out of JAN airspace (5,000 and below).");
          if (p.altNote) ctrl.items.push("Holding altitude " + hundreds(p.arrivalAlt) + ": " + p.altNote + ".");
        } else {
          const parts = [];
          p.restrictions.forEach(function (r) { parts.push(restrictionPhr(r)); });
          if (p.levelAt) parts.push("cross " + p.levelAt.nm + " miles " + DIR_WORD[p.levelAt.dir] + " of Magnolia VORTAC at and maintain " + spoken(p.arrivalAlt));
          else parts.push("descend and maintain " + spoken(p.arrivalAlt));
          const phr = f.cs + ", cleared to Magnolia VORTAC, " + parts.join(", ") + ", " + p.holdPhr + ". Contact Jackson Approach one one niner point two, " + p.tcpPhr + ".";
          ctrl.phraseology.push(phr);
          ctrl.coordination.push("Inbound to JAN Approach: “" + f.cs + ", " + f.type + " slant " + f.equip + ", estimated Magnolia VORTAC " + toHHMM(f.nodes[f.nodes.length - 2].t) + ", descending to " + spoken(p.arrivalAlt) + (p.levelAt ? " with a restriction to cross " + p.levelAt.nm + " miles " + DIR_WORD[p.levelAt.dir] + " Magnolia at and maintain " + spoken(p.arrivalAlt) : "") + (f.destAirport !== "KJAN" ? ", landing " + ZAE.AIRPORTS[f.destAirport].name : "") + ", your control " + p.tcpPhr + ".”");
          if (p.altNote) ctrl.items.push("Clearance altitude " + hundreds(p.arrivalAlt) + ": " + p.altNote + ".");
        }
        p.coord.forEach(function (c) { ctrl.coordination.push(c.to + ": " + c.what); });
        if (p.stackedWith && p.stackedWith.length) {
          const N = holdFix(f);
          const others = p.stackedWith.map(function (id) { return flights.filter(function (o) { return o.id === id; })[0]; }).filter(Boolean);
          const below = others.filter(function (o) { return plan[o.id].arrivalAlt < p.arrivalAlt; });
          const above = others.filter(function (o) { return plan[o.id].arrivalAlt > p.arrivalAlt; });
          if (below.length) {
            const bottom = below.slice().sort(function (x, y) { return plan[x.id].arrivalAlt - plan[y.id].arrivalAlt; })[0];
            ctrl.items.push("Holding stack at " + N + ": " + f.cs + " holds at " + hundreds(p.arrivalAlt) + " above " + below.map(function (o) { return o.cs + " (" + hundreds(plan[o.id].arrivalAlt) + ")"; }).join(", ") + ". When " + bottom.cs + " is tower jurisdiction (" + toHHMM(holdT(bottom) + RULES.HPA_AFTER_JAN_MIN) + ") move the stack down 1,000: descend " + f.cs + " to " + hundreds(p.arrivalAlt - RULES.VERT) + ". The pattern owns " + hundreds(lowestFor(f)) + " as long as anyone is holding.");
          }
          if (above.length) ctrl.items.push("Holding stack at " + N + ": " + above.map(function (o) { return o.cs + " (" + hundreds(plan[o.id].arrivalAlt) + ")"; }).join(", ") + " stacked above " + f.cs + " at " + hundreds(p.arrivalAlt) + "; they come down 1,000 once " + f.cs + " is tower jurisdiction.");
        }
      } else {
        if (f.iafdof) {
          const dir = p.finalAlt > f.alt ? "climb" : "descend";
          ctrl.items.push("IAFDOF: " + hundreds(f.alt) + " is inappropriate for direction of flight (" + f.dirLabel + "-bound on " + f.aw + (["V9", "V555", "V557"].indexOf(f.aw) !== -1 ? ", ZHU LOA northbound odd / southbound even" : "") + "). Underline the altitude in red; assign an appropriate altitude before the aircraft leaves Sector 66.");
          ctrl.phraseology.push(f.cs + ", " + dir + " and maintain " + spoken(p.finalAlt) + ".");
          if (f.nextSector) ctrl.coordination.push("APREQ " + f.nextSector + ": “" + f.cs + " revised altitude, " + dir + "ing to " + spoken(p.finalAlt) + ".”");
        } else {
          ctrl.items.push("Level en route aircraft that is not changing altitude: no restriction required. Acknowledge the check-on, issue the altimeter, altitude checkmark in space 20.");
        }
      }
      p.restrictions.forEach(function (r) {
        ctrl.items.push((r.why === "traffic" ? "Traffic restriction" : r.tower ? "Tower (LOA) restriction" : "Airspace restriction") + ": " + restrictionMark(r) + " — " + (r.label || ""));
      });
      if (p.altNotAvail) ctrl.items.push("Requested " + hundreds(p.altNotAvail.requested) + " not available (traffic " + p.altNotAvail.vs + "): assign " + hundreds(p.altNotAvail.assigned) + " (within 2,000 ft of the request), expect the requested altitude " + p.altNotAvail.expectAt + ".");
      if (p.depRule) ctrl.items.push("Successive departures: " + p.depRule.text + " (" + p.depRule.phr + ").");
      p.reports = p.reports.filter(function (r, i, arr) { return arr.findIndex(function (x) { return x.text === r.text && x.why === r.why; }) === i; });
      p.reports.forEach(function (r) { ctrl.reports.push(r.text + (r.record ? " → record " + r.record + " in space 26" : "") + " about " + r.at + ": " + r.why); });
      if (p.warnings.length) ctrl.items.push("Red W in space " + (f.kind === "departure" ? "24" : "20") + " for traffic: " + uniq(p.warnings).join(", ") + " — line it through once the resolution is issued.");

      // ---- marks on each strip of the flight
      f.strips.forEach(function (s) { s.marks = stripMarks(f, p, s, flights); s.meta.controller = ctrl; s.meta.scenarioRules = null; });
    });
  }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  function stripMarks(f, p, s, flights) {
    const m = {};
    const add = function (sp, mark) { (m[sp] = m[sp] || []).push(mark); };
    const nodeId = s.type === "departure" ? f.originAirport : s.spaces["19"];
    const nIdx = nodeIndex(f, nodeId);
    const bayNodes = f.nodes.filter(function (n) { return n.bay === s.homeBay; }).map(function (n) { return n.id; });
    const nextEvIdx = (function () { const k = f.strips.indexOf(s); return k >= 0 && f.events[k + 1] != null ? f.events[k + 1] : nIdx; })();
    const applies = function (r) { // restriction happens in this strip's bay, or before this flight's next posting
      const ri = nodeIndex(f, r.node);
      if (ri < 0) return true;
      if (bayNodes.indexOf(r.node) !== -1) return true;
      return ri <= nextEvIdx && ri >= nIdx;
    };
    const ws = uniq(p.warnings);
    if (f.kind === "departure") {
      const isDep = s.type === "departure";
      // space 20: assigned final altitude, bar, restrictions
      add("20", { t: SYM.climb + " " + hundreds(p.finalAlt), c: "blk", alt: true });
      const rs = p.restrictions.filter(function (r) { return !r.tower && applies(r); });
      if (rs.length) add("20", { bar: true });
      rs.forEach(function (r) { add("20", { t: restrictionMark(r), c: r.why === "traffic" ? "red" : "red", circ: "blk" }); });
      if (ws.length) add("24", { t: SYM.warn, c: "red", strike: true });
      if (isDep) {
        if (p.depInstr) add("15", { t: p.depInstr, c: "red", circ: "blk" });
        if (p.depRule) add("15", { t: p.depRule.text, c: "blk" });
        if (p.voidTime != null) add("15", { t: "V<" + toHHMM(p.voidTime) + "(" + toHHMM(p.voidTime + RULES.ADVISE_MIN).slice(2) + ")", c: "blk" });
        add("14", { t: "EDC " + toHHMM(p.edc), c: "blk", strike: true });
        add("18", { t: toHHMM(f.baseT) + "/", c: "red" });
      }
      if (p.altNotAvail) add("26", { t: hundreds(p.altNotAvail.requested) + " 10<D", c: "blk" });
      p.reports.forEach(function (r) { if (bayNodes.indexOf(r.text.split(" ").pop()) !== -1 || isDep) add("26", { t: r.text, c: "blk" }); });
      if (p.depRule && p.depRule.kind !== "2MIN") add("26", { t: p.depRule.kind.replace("K", "K <") + " " + p.depRule.text.split("< ")[1], c: "blk" });
      if (f.destAirport && s.type === "arrival") {
        if (p.arrivalAlt < p.finalAlt) add("20", { t: SYM.descend + " " + hundreds(p.arrivalAlt), c: "blk" });
        add("28", { t: p.holdMark, c: "blk" });
        add("29", { t: p.tcp, c: "blk" });
        add("15", { t: s.spaces["15"], c: "blk", circ: "red", replace: true });
      }
      // coordination circle on the altitude of the strip leaving the sector
      if (s === f.strips[f.strips.length - 1] && f.nextSector) add("20", { t: hundreds(p.finalAlt), c: "blk", circ: "red", corner: true });
    } else if (f.kind === "arrival") {
      add("20", { t: hundreds(f.alt), c: "blk", alt: true });
      const rs = p.restrictions.filter(applies);
      const isArr = s.type === "arrival";
      if (rs.length || isArr) add("20", { bar: true });
      rs.forEach(function (r) { add("20", { t: restrictionMark(r), c: "red", circ: "blk" }); });
      if (isArr) {
        if (f.destAirport === "KGWO") { add("28", { t: "VR", c: "red", circ: "red" }); add("26", { t: "67  " + hundreds(p.block67), c: "blk", circ: "red" }); }
        else if (f.destAirport === "KMLU") {
          // holding stripmarking omits the fix and altitude: H- NE V18 EFC; comm change in 26
          if (p.arrivalAlt < f.alt) add("20", { t: SYM.descend + " " + hundreds(p.arrivalAlt), c: "blk" });
          add("28", { t: p.holdMark, c: "blk" });
          add("26", { t: p.commMark, c: "blk" });
          add("19", { t: "DINKY", c: "blk" });                                   // beside the printed STUEE
          add("15b", { t: toHHMM(p.dinkyEst), c: "blk", circ: "red" });          // DINKY estimate = STUEE - 3, coordinated
        } else if (f.destAirport === "KVKS") {
          // the only holding stripmarking that names the fix: H- VKS SW 195 LT EFC
          const holding = kvksHolding(p);
          if (p.arrivalAlt < f.alt) add("20", { t: SYM.descend + " " + hundreds(p.arrivalAlt), c: "blk" });
          if (holding) add("28", { t: p.holdMark, c: "blk" });
          else { add("20", { t: restrictionMark(p.apchRestr), c: "blk" }); add("28", { t: "APCH", c: "blk" }); }
        } else {
          add("20", { t: p.levelAt ? SYM.cross + " " + p.levelAt.nm + " " + p.levelAt.dir + " " + SYM.at + " " + hundreds(p.arrivalAlt) : SYM.descend + " " + hundreds(p.arrivalAlt), c: "blk" });
          add("28", { t: p.holdMark, c: "blk" });
          add("29", { t: p.tcp, c: "blk" });
          add("15", { t: s.spaces["15"], c: "blk", circ: "red", replace: true });
        }
      }
      if (ws.length) add("20", { t: SYM.warn, c: "red", strike: true, corner: true });
    } else {
      if (f.iafdof) {
        add("20", { t: hundreds(f.alt), c: "blk", ul: "red", alt: true });
        add("20", { t: (p.finalAlt > f.alt ? SYM.climb : SYM.descend) + " " + hundreds(p.finalAlt), c: "blk", circ: "red" });
      } else {
        add("20", { t: hundreds(f.alt) + " ✓", c: "blk", alt: true });
      }
      if (ws.length) add("20", { t: SYM.warn, c: "red", strike: true, corner: true });
    }
    // direction arrow (space 23) in red
    const arrow = { N: "↑", E: "→", S: "↓", W: "←" }[f.dirLabel];
    if (arrow) add("23", { t: arrow, c: "red" });
    return m;
  }

  root.ZAEConflicts = { analyze: analyze, decorate: decorate, RULES: RULES, SYM: SYM, _internal: { sharedRuns: sharedRuns, bandAt: bandAt, divergenceNm: divergenceNm, requiredSpacing: requiredSpacing, restrictionMark: restrictionMark, restrictionPhr: restrictionPhr } };
})(typeof window !== "undefined" ? window : this);
