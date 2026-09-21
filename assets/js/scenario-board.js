/*
 * Scenario board: the bay board with everything both the generator page and
 * the Practice Scenarios player need around it — the Controller / Remote
 * toggle, the board hint, the details panel under the board (which never
 * shrinks, so closing and reopening a strip's details keeps the page where it
 * is), the stripmarking rail wiring, and the Remote's departure-time flow
 * (the actual departure time typed in space 18 recomputes the flight's
 * estimates, IC and PR times).
 *
 *   const sb = ScenarioBoard.create(outEl, {
 *     strips, flights,           // strips carry .remote (ZAERemote) and .flightId
 *     view: "controller"|"remote",
 *     showNums, revealAll,
 *     bar: [nodes] | fn(barEl),  // extra content in the scenario bar (code, window, rules)
 *     before: [nodes],           // blocks between the bar and the board (traffic picture)
 *     hint: text,
 *     renderDetails: fn(strip, view) -> node | null,  // page-specific details (answer key)
 *     onViewChange: fn(view)
 *   });
 *   sb.setView(v) / sb.getView() / sb.setShowNums(b) / sb.setRevealAll(b) / sb.board / sb.selected()
 *   ScenarioBoard.prepare(strips, flights)  // bays + suspense for authored strips
 *   ScenarioBoard.stripTag(strip, index)
 * Requires fps-strip.js, strip-board.js, strip-markup.js, remote.js;
 * StripGen (generator.js) for the bay table when present.
 */
(function (root) {
  "use strict";
  const el = function (tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const TYPE_LABELS = { departure: "Departure", enroute: "En Route", arrival: "Arrival", blank: "Blank" };
  const BAY_OF = { MLU: "VKS", KVKS: "VKS", "0M8": "VKS", STUEE: "VKS", DORTS: "VKS", HATER: "VKS", DINKY: "VKS", KMLU: "VKS", VKS: "VKS", TKH: "VKS", BLE: "VKS", MHZ: "MHZ", KJAN: "MHZ", KJVW: "MHZ", KHKS: "MHZ", SQS: "SQS", KGWO: "SQS" };
  function bayOf(fix) { return (root.StripGen && root.StripGen.bayOf(fix)) || BAY_OF[fix] || null; }
  function hhmm(m) { return root.ZAERemote ? root.ZAERemote.toHHMM(m) : String(m); }

  function stripTag(strip, index) {
    const tag = el("div", "strip-tag");
    tag.appendChild(el("span", null, "#" + (strip.flight || (index != null ? index + 1 : ""))));
    tag.appendChild(el("span", "badge", TYPE_LABELS[strip.type] || strip.type));
    if (strip.bay) tag.appendChild(el("span", "bay-badge", strip.bay + " bay"));
    if (strip.type !== "blank") tag.appendChild(el("span", null, ((strip.spaces || {})["3"] || "") + " · " + ((strip.spaces || {})["4"] || "")));
    else tag.appendChild(el("span", null, "fill me in"));
    return tag;
  }

  // Authored strips: bay from the posted fix, departures (and their
  // postings) in suspense above their departure bay's label.
  function prepare(strips, flights) {
    (flights || []).forEach(function (f, i) {
      const dep = f.strips.filter(function (s) { return s.type === "departure"; })[0];
      const depBay = dep ? bayOf(root.ZAERemote.postedFix(dep)) : null;
      const pt = dep ? parseInt(root.ZAERemote.pTime(dep) || "9999", 10) : null;
      const depSeq = dep && dep.remoteFields && parseInt(dep.remoteFields.depSeq, 10) ? parseInt(dep.remoteFields.depSeq, 10) : null;
      f.strips.forEach(function (s, k) {
        s.flight = f.seq || i + 1;
        s.flightRank = depSeq != null ? depSeq : (f.seq || i + 1); // same P-time: DEPARTURE #1 first, else authoring order
        if (s.order == null) s.order = k;                          // postings stack in the flight's own order
        s.homeBay = bayOf(root.ZAERemote.postedFix(s)) || "MHZ";
        if (dep) { s.suspense = true; s.suspenseTime = pt; s.bay = depBay || s.homeBay; }
        else { s.suspense = false; s.bay = s.homeBay; }
      });
    });
    (strips || []).forEach(function (s) { if (!s.bay) s.bay = bayOf(root.ZAERemote.postedFix(s)) || "MHZ"; });
    return strips;
  }

  // The Remote's calls for a strip, in order, with phraseology.
  function renderRemoteCalls(strip, flights) {
    const r = strip.remote;
    if (!r) return null;
    const box = el("div", "remote-calls");
    box.appendChild(el("h4", null, "Remote calls for this strip"));
    const flight = (flights || []).filter(function (f) { return f.id === strip.flightId; })[0];
    const facts = [];
    if (r.mpm != null) facts.push("Miles per minute " + r.mpm + " (card table" + (flight && flight.tas ? ", T" + flight.tas : "") + ")");
    if (r.fields && r.fields.onFreq && r.k === 0) facts.push("On frequency at the start — no initial contact; the pilot's estimate is in space 17");
    if (r.lines26.length) facts.push("Space 26: " + r.lines26.join(" · "));
    if (facts.length) box.appendChild(el("p", "remote-facts", facts.join(". ") + "."));
    if (r.calls.length) {
      const ul = el("ul");
      r.calls.forEach(function (c) {
        const li = el("li");
        li.appendChild(el("strong", null, c.k + (c.at != null ? " " + hhmm(c.at) : " (during the problem)") + " — " + c.who + ": "));
        li.appendChild(el("span", "phr", "“" + c.text.replace(/ — .*$/, "") + "”"));
        const note = c.text.match(/ — (.*)$/);
        if (note) li.appendChild(el("div", "note", note[1]));
        ul.appendChild(li);
      });
      box.appendChild(ul);
    } else box.appendChild(el("p", "empty-note", "No calls on this strip."));
    return box;
  }

  function create(out, opts) {
    opts = opts || {};
    const strips = opts.strips || [];
    const flights = opts.flights || [];
    let view = opts.view === "remote" ? "remote" : "controller";
    let showNums = !!opts.showNums, revealAll = !!opts.revealAll;
    let selected = null, board = null, details = null, detailsMinHeight = 0;
    const api = {};

    out.innerHTML = "";
    // scenario bar: toggle + page content
    const bar = el("div", "scenario-bar");
    const vt = el("div", "view-toggle");
    vt.title = "Controller strips, or the Remote's strips (same strips plus the initial-contact / request data in space 26 and the red call reminders in space 27)";
    [["controller", "Controller"], ["remote", "Remote"]].forEach(function (pair) {
      const b = el("button", "btn btn-ghost" + (view === pair[0] ? " is-on" : ""), pair[1] + " strips");
      b.type = "button"; b.dataset.view = pair[0];
      b.addEventListener("click", function () { setView(pair[0]); });
      vt.appendChild(b);
    });
    if (typeof opts.bar === "function") opts.bar(bar, vt);
    else { bar.appendChild(vt); (opts.bar || []).forEach(function (n) { if (n) bar.appendChild(n); }); }
    out.appendChild(bar);
    (opts.before || []).forEach(function (n) { if (n) out.appendChild(n); });
    if (opts.hint !== "") out.appendChild(el("p", "board-hint", opts.hint ||
      "Strips in suspense (a departure awaiting its clearance request, with its postings stacked directly above it) sit above the bay label; " +
      "active postings sit below, earliest time at the bottom. Hover a strip to enlarge it, click it for its details, drag it to any bay or position. " +
      "A selected strip stays enlarged and can be marked up with the tools on the left; press F or Space to flag it as a reminder; click anywhere else to deselect. " +
      "Remote strips (toggle in the scenario bar) add the typed initial-contact and request data in space 26, the miles per minute in space 9 and the red call reminders in space 27."));
    const boardEl = el("div");
    out.appendChild(boardEl);
    details = el("div", "strip-details");
    out.appendChild(details);

    function holdDetailsHeight() {
      detailsMinHeight = Math.max(detailsMinHeight, details.offsetHeight);
      details.style.minHeight = detailsMinHeight + "px";
    }
    function card(strip, index) {
      const c = el("div", "strip-card");
      c.appendChild(stripTag(strip, index));
      if (view === "remote") { const rc = renderRemoteCalls(strip, flights); if (rc) c.appendChild(rc); }
      if (opts.renderDetails) { const d = opts.renderDetails(strip, view); if (d) c.appendChild(d); }
      return c;
    }
    function showDetails(strip) {
      selected = strip;
      holdDetailsHeight();
      details.innerHTML = "";
      if (!strip) { details.appendChild(el("p", "empty-note", "Click a strip on the board to see its details.")); return; }
      details.appendChild(card(strip));
    }
    function renderAll() {
      details.innerHTML = "";
      strips.forEach(function (strip, i) { details.appendChild(card(strip, i)); });
    }
    function refreshDetails() { if (revealAll) renderAll(); else showDetails(selected); }

    function setView(v) {
      view = v === "remote" ? "remote" : "controller";
      root.StripMarkup.setView(view);
      Array.prototype.forEach.call(bar.querySelectorAll(".view-toggle button"), function (b) { b.classList.toggle("is-on", b.dataset.view === view); });
      board.render(); // keeps the drag layout and the selection
      refreshDetails();
      if (opts.onViewChange) opts.onViewChange(view);
    }

    // Remote view: the actual departure time typed in space 18 of a departure
    // strip sets the flight's estimates (chained from the plus times), the
    // initial contact (2 minutes after departure) and the PR times on its
    // other strips; the old center estimates are lined through and the new
    // ones written beside them. Clearing the time undoes it.
    function onDepTime(strip, hhmm4, stripEl) {
      const flight = flights.filter(function (f) { return f.id === strip.flightId; })[0];
      if (!flight) return;
      const ok = /^\d{4}$/.test(hhmm4) && parseInt(hhmm4.slice(0, 2), 10) < 24 && parseInt(hhmm4.slice(2), 10) < 60;
      const depT = ok ? parseInt(hhmm4.slice(0, 2), 10) * 60 + parseInt(hhmm4.slice(2), 10) : null;
      const times = ok ? root.ZAERemote.depTimes(flight, depT) : null;
      root.StripMarkup.setReminderTime(strip, stripEl, "IC", ok ? root.ZAERemote.mm(times.ic) : "");
      flight.strips.forEach(function (sib, k) {
        if (k === 0) { // KMLU: the departure strip's own STUEE estimate and PR follow the departure time too
          if (times && times.est[0] != null) { root.StripMarkup.setCell(sib, stripEl, "17", root.ZAERemote.toHHMM(times.est[0])); root.StripMarkup.setStrike(sib, "15", !!sib.spaces["15"]); root.StripMarkup.setReminderTime(sib, stripEl, "PR", root.ZAERemote.mm(times.est[0])); }
          else if (!ok && flight.depAtFix) { root.StripMarkup.setCell(sib, stripEl, "17", ""); root.StripMarkup.setStrike(sib, "15", false); root.StripMarkup.setReminderTime(sib, stripEl, "PR", ""); }
          root.StripMarkup.reposition(); // draw / clear the strike on the selected strip without redrawing it
          return;
        }
        const sEl = sib.uid ? board.stripEl(sib.uid) : null;
        root.StripMarkup.setCell(sib, sEl, "17", ok ? root.ZAERemote.toHHMM(times.est[k]) : ""); // the recomputed fix estimate goes in 17
        root.StripMarkup.setStrike(sib, "15", ok && !!sib.spaces["15"]); // suspense strips have no printed estimate to strike
        root.StripMarkup.setReminderTime(sib, sEl, "PR", ok ? root.ZAERemote.mm(times.est[k]) : "");
        root.StripMarkup.setReminderTime(sib, sEl, "Z", ok ? root.ZAERemote.mm(times.est[k] + root.ZAERemote.TOWER_JUR_AFTER) : "");
        if (sEl) root.StripMarkup.apply(sEl, sib);
      });
    }

    root.StripMarkup.attach();
    root.StripMarkup.setView(view);
    root.StripMarkup.configure({ onDepTime: onDepTime });
    board = root.StripBoard.create(boardEl, {
      showNums: showNums,
      keepSelectionWithin: ".strip-details, .sm-ui, .scenario-bar, .controls", // reading the details, the marking tools, the view toggle or the page controls must not deselect
      renderOpts: function (st) { return view === "remote" && st.remote ? { remote: { mpm: st.remote.mpm, lines26: st.remote.lines26, plus23: st.remote.plus23, keep14a: st.remote.keep14a } } : null; },
      onSelect: function (strip, slot) {
        if (!revealAll) showDetails(strip);
        if (strip) root.StripMarkup.activate(strip, slot); else root.StripMarkup.deactivate();
      },
      onMove: function () { root.StripMarkup.reposition(); },
      onRender: function (slot) { root.StripMarkup.rebind(slot); }
    });
    board.setStrips(strips);
    refreshDetails();

    api.board = board;
    api.setView = setView;
    api.getView = function () { return view; };
    api.setShowNums = function (b) { showNums = !!b; board.setShowNums(showNums); };
    api.setRevealAll = function (b) { revealAll = !!b; details.innerHTML = ""; detailsMinHeight = 0; details.style.minHeight = ""; refreshDetails(); }; // no held height: unchecking must not leave blank space
    api.selected = function () { return selected; };
    api.refreshDetails = refreshDetails;
    api.bar = bar;
    return api;
  }

  root.ScenarioBoard = { create: create, prepare: prepare, stripTag: stripTag, renderRemoteCalls: renderRemoteCalls, bayOf: bayOf };
})(typeof window !== "undefined" ? window : this);
