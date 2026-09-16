/*
 * Remote side of a scenario (H00 Nonradar Remote Procedures).
 *
 * The Remote plays the pilots and the adjacent facilities. Their strips are
 * the controller's strips plus, in space 26, the typed scenario data they
 * work from (initial contact time, departure clearance request time,
 * ON FREQUENCY, altitude requests, KVKS weather, departure sequence), and in
 * space 27 the red call reminders in time order, minutes only:
 *   IC  initial contact          (departures: blank, 2 min after departure)
 *   RQ  a request                (clearance 5 min before P-time; altitude)
 *   PR  progressing the posted fix at the center estimate
 *   Z   tower jurisdiction       (JAN / MLU arrivals, 2 min after the fix)
 *   LD  landed                   (KGWO 7 min / KVKS 5 min after the fix or the
 *                                 approach clearance, whichever is later: blank)
 *   RP  report passing           (added by the Remote when asked, at the bottom)
 * Blank times are underlined and filled in during the problem. Every estimate
 * a Remote makes uses the card's rough miles per minute, never the real speed.
 *
 * Space 26 is split in two: spaces["26"] holds the remarks both sides see
 * (FRC, ...); strip.remote.fields holds the Remote-only data, from which the
 * typed lines and the reminders are derived — so a scenario builder only has
 * to supply the fields, never the reminders.
 *
 *   ZAERemote.decorate(flights)                 strip.remote for generated flights
 *   ZAERemote.derive(strip, fields, info)       { lines26, reminders, calls } from a strip's
 *                                               type, its space-26 fields and a few facts
 *   ZAERemote.depTimes(flight, depT)            estimates chained from the plus times once off
 *   ZAERemote.cardMPM(speed)
 * Requires ZAE (assets/data/zae.js). Deterministic: every random draw
 * (on-frequency flights, IC variation, altitude requests) is made by the
 * seeded generator, so a scenario code reproduces the Remote's strips too.
 */
(function (root) {
  "use strict";
  const ZAE = root.ZAE;

  // SPEED -> MPM as printed on the H00 Color Card Stock Map:
  //   0-85 = 1, 90-145 = 2, 150-205 = 3, 210-265 = 4, 270-325 = 5,
  //   330-385 = 6, 390-445 = 7, 450+ = 8
  const MPM_TABLE = [[85, 1], [145, 2], [205, 3], [265, 4], [325, 5], [385, 6], [445, 7]];
  function cardMPM(speed) {
    for (let i = 0; i < MPM_TABLE.length; i++) if (speed <= MPM_TABLE[i][0]) return MPM_TABLE[i][1];
    return 8;
  }

  const REQ_BEFORE_P = 5;      // departure clearance requested 5 minutes before the P-time
  const DEP_AFTER_CLNC = 2;    // actual departure 2 minutes after the clearance is given
  const IC_AFTER_DEP = 2;      // initial contact 2 minutes after departure
  const TOWER_JUR_AFTER = 2;   // JAN / MLU arrivals: tower jurisdiction 2 minutes after the holding fix estimate
  const LAND_AFTER = { KGWO: 7, KVKS: 5 };
  const HOLD_APCH = { KJAN: "Jackson Approach", KHKS: "Jackson Approach", KJVW: "Jackson Approach", KMLU: "Monroe Approach" };
  const LAND_CALLER = { KGWO: "Greenwood Tower", KVKS: "Flight Service" };
  // who calls Jackson Low for the departure clearance
  const REQUESTER = { KGWO: "Greenwood Tower", KJAN: "Jackson Approach", KHKS: "Jackson Approach", KJVW: "Jackson Approach", KVKS: "Flight Data", "0M8": "Flight Data" };

  function pad2(n) { return String(n).padStart(2, "0"); }
  function toHHMM(mins) { mins = ((Math.round(mins) % 1440) + 1440) % 1440; return pad2(Math.floor(mins / 60)) + pad2(mins % 60); }
  function fromHHMM(s) { const m = String(s || "").replace(/Ø/g, "0").match(/(\d{2})(\d{2})/); return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : null; }
  function mm(mins) { return toHHMM(mins).slice(2); }
  function hundreds(alt) { return String(alt / 100); }
  function spokenAlt(alt) {
    const th = Math.floor(alt / 1000), hd = (alt % 1000) / 100;
    const W = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "niner"];
    if (alt >= 18000) return "flight level " + String(alt / 100).split("").map(function (d) { return W[+d]; }).join(" ");
    return String(th).split("").map(function (d) { return W[+d]; }).join(" ") + " thousand" + (hd ? " " + W[hd] + " hundred" : "");
  }
  function navName(id) { const n = ZAE.NAVAIDS[id]; if (!n) return id; return n.name + " " + (n.kind === "VOR/DME" ? "VOR/DME" : n.kind === "NDB" ? "radio beacon" : "VORTAC"); }
  function fixName(id) { return ZAE.NAVAIDS[id] ? navName(id) : ZAE.AIRPORTS[id] ? ZAE.AIRPORTS[id].name + " Airport" : id; }

  // The typed space-26 lines, the space-27 reminders and the calls for one
  // strip.
  //   strip:  { type: "departure"|"enroute"|"arrival", spaces }
  //   fields: { onFreq, ic (minutes), reqClnc (minutes), depSeq, altReq: {alt, t}, vksWx (true/false/null) }
  //   info:   { kind ("departure"|"overflight"|"arrival" of the whole flight), cs, alt,
  //             est (minutes over the posted fix), fix, nextFix, nextNextFix, originAirport,
  //             destAirport, dest, icFix, icFixT, icNext, firstOfFlight, depFirstFix }
  function derive(strip, fields, info) {
    fields = fields || {}; info = info || {};
    const r = { lines26: [], reminders: [], calls: [] };
    const add = function (key, t, at) { r.reminders.push({ id: key + "_" + Math.round(at), k: key, t: t, at: at }); };
    const cs = info.cs || (strip.spaces && strip.spaces["3"]) || "";
    if (strip.type === "departure") {
      const P = info.est != null ? info.est : fromHHMM((strip.spaces || {})["19"]);
      const rq = fields.reqClnc != null ? fields.reqClnc : (P != null ? P - REQ_BEFORE_P : null);
      if (rq != null) {
        r.lines26.push("REQ CLNC " + toHHMM(rq));
        add("RQ", mm(rq), rq);
        const who = REQUESTER[info.originAirport] || "Flight Data";
        r.calls.push({ k: "RQ", at: rq, who: who, text: "Jackson Low, " + who + ", request departure clearance " + cs + " to the " + (info.dest || "destination") + " airport." });
      }
      if (fields.depSeq) r.lines26.push("DEPARTURE #" + fields.depSeq);
      add("IC", null, (P != null ? P : 0) + DEP_AFTER_CLNC + IC_AFTER_DEP);
      r.calls.push({ k: "IC", at: null, who: cs, text: "Aero Center, " + cs + " off " + fixName(info.originAirport || "the airport") + " at (departure time), climbing to (assigned altitude)" + (info.depFirstFix ? ", " + fixName(info.depFirstFix) + " next" : "") + ". — 2 minutes after the departure time, which is 2 minutes after the clearance." });
    } else {
      const est = info.est != null ? info.est : fromHHMM((strip.spaces || {})["15"]);
      if (info.firstOfFlight) {
        if (fields.onFreq) r.lines26.push("ON FREQUENCY");
        else if (fields.ic != null) {
          r.lines26.push("IC " + toHHMM(fields.ic));
          add("IC", mm(fields.ic), fields.ic);
          const icFix = info.icFix || info.fix, icT = info.icFixT != null ? info.icFixT : est;
          r.calls.push({ k: "IC", at: fields.ic, who: cs, text: "Aero Center, " + cs + " estimating " + fixName(icFix) + (icT != null ? " " + toHHMM(icT) : "") + (info.alt ? ", at " + spokenAlt(info.alt) : "") + (info.icNext ? ", " + fixName(info.icNext) + " next" : "") + "." });
        }
      }
      const arrHold = strip.type === "arrival" && HOLD_APCH[info.destAirport];
      if (info.kind === "departure") {
        if (est != null) add("PR", null, est); // its time follows from the actual departure time
      } else if (arrHold) {
        if (est != null) {
          add("Z", mm(est + TOWER_JUR_AFTER), est + TOWER_JUR_AFTER);
          r.calls.push({ k: "Z", at: est + TOWER_JUR_AFTER, who: HOLD_APCH[info.destAirport], text: "Jackson Low, " + HOLD_APCH[info.destAirport] + ", " + cs + " tower jurisdiction." });
        }
      } else if (est != null && (fields.onFreq || fields.ic == null || est >= fields.ic)) {
        add("PR", mm(est), est);
        r.calls.push({ k: "PR", at: est, who: cs, text: "Aero Center, " + cs + " progressing " + fixName(info.fix) + " " + toHHMM(est) + (info.alt ? ", at " + spokenAlt(info.alt) : "") + (info.nextFix && info.nextFixT != null ? ", estimating " + fixName(info.nextFix) + " " + toHHMM(info.nextFixT) : "") + (info.nextNextFix ? ", " + fixName(info.nextNextFix) + " next" : "") + "." });
      }
      if (strip.type === "arrival" && LAND_AFTER[info.destAirport] && est != null) {
        add("LD", null, est + LAND_AFTER[info.destAirport]);
        r.calls.push({ k: "LD", at: null, who: LAND_CALLER[info.destAirport], text: "Jackson Low, " + LAND_CALLER[info.destAirport] + ", " + cs + " landed (time). — " + LAND_AFTER[info.destAirport] + " minutes after the " + info.fix + " estimate (" + toHHMM(est + LAND_AFTER[info.destAirport]) + ") or " + LAND_AFTER[info.destAirport] + " minutes after the approach clearance, whichever is later." });
      }
      if (strip.type === "arrival" && info.destAirport === "KVKS" && fields.vksWx != null) r.lines26.push(fields.vksWx ? "HAS KVKS WX" : "DOES NOT HAVE KVKS WX");
    }
    if (fields.altReq && fields.altReq.alt && fields.altReq.t != null) {
      r.lines26.push("REQ " + hundreds(fields.altReq.alt) + " AT " + toHHMM(fields.altReq.t));
      add("RQ", mm(fields.altReq.t), fields.altReq.t);
      r.calls.push({ k: "RQ", at: fields.altReq.t, who: cs, text: "Aero Center, " + cs + " request " + spokenAlt(fields.altReq.alt) + "." });
    }
    r.reminders.sort(function (a, b) { return a.at - b.at; });
    r.calls.sort(function (a, b) { return (a.at == null ? 1e9 : a.at) - (b.at == null ? 1e9 : b.at); });
    return r;
  }

  // the strip the aircraft is working at time t: first posting still ahead, else the last
  function activeStrip(f, t) {
    for (let k = 0; k < f.strips.length; k++) if (f.nodes[f.strips[k].nodeIdx].t >= t) return f.strips[k];
    return f.strips[f.strips.length - 1];
  }
  function nextComp(f, i) { for (let k = i + 1; k < f.nodes.length; k++) if (f.nodes[k].comp) return f.nodes[k]; return null; }
  function firstCompAfter(f, t) { for (let k = 0; k < f.nodes.length; k++) if (f.nodes[k].comp && f.nodes[k].t > t) return f.nodes[k]; return null; }

  function decorate(flights) {
    // departures off the same field with the same request time are sequenced,
    // faster aircraft first (as the departure rules and H00 direct)
    const groups = {};
    flights.forEach(function (f) { if (f.kind !== "departure") return; const k = f.originAirport + "|" + f.baseT; (groups[k] = groups[k] || []).push(f); });
    Object.keys(groups).forEach(function (k) {
      const g = groups[k]; if (g.length < 2) { g[0].depSeq = null; return; }
      g.sort(function (a, b) { return (b.gs - a.gs) || (a.seq - b.seq); });
      g.forEach(function (f, i) { f.depSeq = i + 1; });
    });

    flights.forEach(function (f) {
      const mpm = cardMPM(f.tas);
      f.remote = { mpm: mpm, onFreq: !!f.onFreq, icT: f.onFreq ? null : f.icT };
      f.strips.forEach(function (s, k) {
        const n = f.nodes[s.nodeIdx];
        const fields = { onFreq: k === 0 && !!f.onFreq, ic: k === 0 && !f.onFreq ? f.icT : null, depSeq: f.depSeq || null, vksWx: f.vksWx, altReq: null };
        if (f.altReq && activeStrip(f, f.altReq.t) === s) fields.altReq = f.altReq;
        const nx = s.type === "departure" ? null : nextComp(f, n.idx), nx2 = nx ? nextComp(f, nx.idx) : null;
        const icFix = !f.onFreq && f.icT != null ? (firstCompAfter(f, f.icT) || n) : n;
        const info = {
          kind: f.kind, cs: f.cs, alt: f.alt, est: n.t, fix: n.id, nextFix: nx ? nx.id : null, nextFixT: nx ? nx.t : null, nextNextFix: nx2 ? nx2.id : null,
          originAirport: f.originAirport, destAirport: f.destAirport, dest: f.dest, firstOfFlight: k === 0,
          icFix: icFix.id, icFixT: icFix.t, icNext: (function () { const a = nextComp(f, icFix.idx); return a ? a.id : null; })(),
          depFirstFix: s.type === "departure" ? (f.strips[1] ? f.nodes[f.strips[1].nodeIdx].id : (f.nodes[1] ? f.nodes[1].id : null)) : null
        };
        const r = derive(s, fields, info);
        r.mpm = mpm; r.fields = fields; r.dep = s.type === "departure"; r.flightId = f.id; r.k = k;
        s.remote = r;
      });
    });
  }

  // Once the aircraft is off (actual departure time in space 18): the initial
  // contact 2 minutes later and each posting's estimate chained from the
  // strips' plus times (previous strip's estimate + this strip's +N).
  function depTimes(f, depT) {
    const out = { ic: depT + IC_AFTER_DEP, est: {} };
    let t = depT;
    f.strips.forEach(function (s, k) {
      if (k === 0) return;
      const prev = f.strips[k - 1];
      const prevId = k === 1 ? f.originAirport : f.nodes[prev.nodeIdx].id;
      let plus = parseInt(String(s.spaces["14a"] || "").replace(/[^\d]/g, ""), 10);
      if (isNaN(plus) || s.spaces["11"] !== prevId) plus = Math.round(f.nodes[s.nodeIdx].rel - (k === 1 ? 0 : f.nodes[prev.nodeIdx].rel));
      t += plus;
      out.est[k] = t;
    });
    return out;
  }

  root.ZAERemote = {
    decorate: decorate, derive: derive, depTimes: depTimes, cardMPM: cardMPM, MPM_TABLE: MPM_TABLE,
    toHHMM: toHHMM, fromHHMM: fromHHMM, mm: mm,
    IC_AFTER_DEP: IC_AFTER_DEP, DEP_AFTER_CLNC: DEP_AFTER_CLNC, REQ_BEFORE_P: REQ_BEFORE_P, LAND_AFTER: LAND_AFTER, TOWER_JUR_AFTER: TOWER_JUR_AFTER
  };
})(typeof window !== "undefined" ? window : this);
