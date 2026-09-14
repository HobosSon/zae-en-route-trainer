/*
 * Flight strip generator page controller. Generated strips are posted onto
 * the bay board (window.StripBoard); blank templates render as a plain list.
 * A scenario (all strips on the board) has a code that reproduces it exactly
 * (StripGen.generateScenario), and an answer key from the conflict engine:
 * the completed strip with the controller's stripmarking, the restrictions,
 * reports, phraseology and coordination for each aircraft.
 * Requires zae.js, conflicts.js, generator.js, fps-strip.js, strip-board.js.
 */
(function () {
  "use strict";
  const el = FPSStrip.el;

  const TYPE_LABELS = { departure: "Departure", enroute: "En Route", arrival: "Arrival", blank: "Blank" };

  const KEY_ORDER = [
    ["stripType", "Strip type"], ["bay", "Bay"], ["callsign", "Callsign"], ["aircraft", "Aircraft"],
    ["equip", "Equipment"], ["tas", "Filed TAS"], ["gs", "Est. ground speed"],
    ["origin", "Departing"], ["destination", "Destination"], ["route", "Route (space 25)"],
    ["airway", "Airway / traversal"], ["postedFix", "Posted fix"], ["arrivalFix", "Arrival fix"],
    ["nextPostedFix", "Next posted fix (space 21)"], ["previousFix", "Previous fix"], ["nextFix", "Next fix"],
    ["requiredPostings", "Fix postings"], ["allPostings", "Airway postings"], ["altitude", "Altitude"],
    ["direction", "Direction of flight"], ["proposedTime", "Proposed time"], ["departureTime", "Departure time"],
    ["ete", "ETE"], ["plusTimeMath", "Plus-time (Quick Estimate)"], ["estimateMath", "Posted-fix estimate"]
  ];
  const MATH_KEYS = { plusTimeMath: 1, estimateMath: 1 };

  function renderAnswerKey(strip) {
    const meta = strip.meta;
    const box = el("div", "answer-key");
    box.appendChild(el("h4", null, "Answer key / self-check"));

    // the completed strip: what the controller's stripmarking looks like once every action is done
    if (strip.marks) {
      const cs = el("div", "completed-strip");
      cs.appendChild(el("div", "cap", "Completed strip (red = preplanned / coordination circles, black = issued to the pilot)"));
      cs.appendChild(FPSStrip.render(strip.spaces, { marks: strip.marks, showNums: false }));
      box.appendChild(cs);
    }

    const ctrl = meta.controller;
    if (ctrl) {
      const ck = el("div", "ctrl-key");
      const section = function (title, items, cls) {
        if (!items || !items.length) return;
        ck.appendChild(el("h5", null, title));
        const ul = el("ul");
        items.forEach(function (t) { ul.appendChild(el("li", cls || null, t)); });
        ck.appendChild(ul);
      };
      section("Control actions for " + ctrl.flight, ctrl.items);
      section("Reports to solicit", ctrl.reports);
      section("Coordination", ctrl.coordination);
      section("Phraseology", ctrl.phraseology, "phr");
      box.appendChild(ck);
    }

    const dl = el("dl");
    KEY_ORDER.forEach(function (pair) {
      const val = meta[pair[0]];
      if (val == null || val === "") return;
      dl.appendChild(el("dt", null, pair[1]));
      dl.appendChild(el("dd", MATH_KEYS[pair[0]] ? "math" : null, val));
    });
    if (meta.notes && meta.notes.length) meta.notes.forEach(function (n) { dl.appendChild(el("div", "note", n)); });
    box.appendChild(dl);
    return box;
  }

  function stripTag(strip, index) {
    const tag = el("div", "strip-tag");
    tag.appendChild(el("span", null, "#" + (strip.flight || index + 1)));
    tag.appendChild(el("span", "badge", TYPE_LABELS[strip.type] || strip.type));
    if (strip.bay) tag.appendChild(el("span", "bay-badge", strip.bay + " bay"));
    if (strip.type !== "blank") tag.appendChild(el("span", null, (strip.spaces["3"] || "") + " · " + (strip.spaces["4"] || "")));
    else tag.appendChild(el("span", null, "fill me in"));
    return tag;
  }

  // ---- wire up ----------------------------------------------------------
  const out = document.getElementById("output");
  const diffSel = document.getElementById("difficulty");
  const typeSel = document.getElementById("type");
  const countInput = document.getElementById("count");
  const genBtn = document.getElementById("generate");
  const codeInput = document.getElementById("code");
  const loadBtn = document.getElementById("load-code");
  const numsToggle = document.getElementById("show-nums");
  const revealAllToggle = document.getElementById("reveal-all");
  const diffControl = diffSel ? diffSel.closest(".control") : null;

  let current = [];
  let scenario = null;
  let board = null;      // StripBoard for generated strips (kept so drags survive toggles)
  let details = null;    // answer-key panel under the board
  let selected = null;

  function isBlank() { return typeSel.value === "blank"; }
  function currentIsBlank() { return current.length && current[0].type === "blank"; }

  // Blank templates: the plain editable list.
  function renderBlank() {
    out.innerHTML = "";
    board = null;
    current.forEach(function (strip, i) {
      const card = el("div", "strip-card");
      card.appendChild(stripTag(strip, i));
      card.appendChild(FPSStrip.render(null, { editable: true, showNums: numsToggle.checked }));
      out.appendChild(card);
    });
  }

  // The details panel never shrinks: closing and reopening an answer key keeps
  // the page where it is instead of yanking it up (extra room stays below).
  let detailsMinHeight = 0;
  function holdDetailsHeight() {
    if (!details) return;
    detailsMinHeight = Math.max(detailsMinHeight, details.offsetHeight);
    details.style.minHeight = detailsMinHeight + "px";
  }
  function showDetails(strip) {
    selected = strip;
    if (!details) return;
    holdDetailsHeight();
    details.innerHTML = "";
    if (!strip) {
      details.appendChild(el("p", "empty-note", "Click a strip on the board to see its answer key."));
      return;
    }
    const card = el("div", "strip-card");
    card.appendChild(stripTag(strip));
    card.appendChild(renderAnswerKey(strip));
    details.appendChild(card);
  }

  function renderAllKeys() {
    if (!details) return;
    details.innerHTML = "";
    current.forEach(function (strip, i) {
      const card = el("div", "strip-card");
      card.appendChild(stripTag(strip, i));
      card.appendChild(renderAnswerKey(strip));
      details.appendChild(card);
    });
  }

  function hhmm(m) { return StripGen.toHHMM(m); }

  // Scenario bar: the code (share it to reproduce the board), the window, a
  // summary of who is traffic for whom and how it was resolved.
  function renderScenarioBar() {
    const bar = el("div", "scenario-bar");
    bar.appendChild(el("span", null, "Scenario"));
    bar.appendChild(el("span", "code", scenario.code));
    const copy = el("button", "btn btn-ghost", "Copy code");
    copy.addEventListener("click", function () {
      const txt = scenario.code;
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { copy.textContent = "Copied"; setTimeout(function () { copy.textContent = "Copy code"; }, 1200); });
      else { codeInput.value = txt; codeInput.select(); }
    });
    bar.appendChild(copy);
    bar.appendChild(el("span", null, "Window " + hhmm(scenario.window.start) + "–" + hhmm(scenario.window.start + scenario.window.span) + "Z"));
    bar.appendChild(el("span", null, scenario.flights.length + " aircraft · " + scenario.strips.length + " strips"));
    const rules = ZAEConflicts.RULES;
    bar.appendChild(el("span", "rules", "Rules: 10 min / 20 DME · 44-kt 3 min · 22-kt 5 min · 2-minute departure rule · holding pattern airspace protected 10 min before the holder's estimate · CBM 3 and MEI 1 West MOAs active"));
    return bar;
  }

  function renderTrafficSummary() {
    const an = scenario.analysis;
    if (!an) return null;
    const box = el("div", "traffic-summary");
    box.appendChild(el("h4", null, "Traffic picture"));
    const ul = el("ul");
    const seen = {};
    const pairs = an.pairs.filter(function (p) { const k = p.a.cs + "|" + p.b.cs + "|" + p.node + "|" + p.type; if (seen[k]) return false; seen[k] = 1; return true; });
    scenario.flights.forEach(function (f) {
      const p = an.plan[f.id];
      const traffic = p.restrictions.filter(function (r) { return r.why === "traffic"; });
      const parts = [];
      traffic.forEach(function (r) { parts.push(ZAEConflicts._internal.restrictionMark(r) + (r.vs ? " (vs " + r.vs.join(", ") + ")" : "")); });
      if (p.altNotAvail) parts.push(p.altNotAvail.requested / 100 + " not available (" + p.altNotAvail.vs + "), assign " + p.altNotAvail.assigned / 100);
      if (p.depRule) parts.push(p.depRule.text);
      if (p.altNote) parts.push("clearance altitude " + p.arrivalAlt / 100 + " — " + p.altNote);
      if (f.iafdof) parts.push("IAFDOF " + f.alt / 100 + " → " + p.finalAlt / 100);
      const li = el("li");
      li.appendChild(el("strong", null, f.cs + " "));
      li.appendChild(document.createTextNode(f.kind === "overflight" ? "en route " : f.kind + " "));
      if (parts.length) li.appendChild(document.createTextNode("— " + parts.join("; ")));
      else li.appendChild(el("span", "ok", "— no restriction needed"));
      ul.appendChild(li);
    });
    pairs.filter(function (p) { return p.ok; }).forEach(function (p) {
      const li = el("li");
      li.appendChild(document.createTextNode(p.a.cs + " / " + p.b.cs + " at " + p.node + ": " + (p.type === "cross-ok" ? Math.round(p.dt) + " min — separated by time (report over the fix proves it)" : p.type === "same-dme-ok" ? "DME separation (" + p.req.nm + " nm) — solicit DME" : Math.round(p.gap) + " min behind a faster aircraft (" + p.req.rule + " rule)")));
      ul.appendChild(li);
    });
    box.appendChild(ul);
    return box;
  }

  // Generated strips: the bay board plus a details panel.
  function renderBoard() {
    out.innerHTML = "";
    if (scenario) {
      out.appendChild(renderScenarioBar());
      const ts = renderTrafficSummary();
      if (ts) out.appendChild(ts);
    }
    const hint = el("p", "board-hint",
      "Strips in suspense (a departure awaiting its clearance request, with its postings stacked directly above it) sit above the bay label; " +
      "active postings sit below, earliest time at the bottom. Hover a strip to enlarge it, click it for its answer key, drag it to any bay or position. " +
      "A selected strip stays enlarged and can be marked up with the tools above it; press F or Space to flag it as a reminder; click anywhere else to deselect.");
    out.appendChild(hint);
    const boardEl = el("div");
    out.appendChild(boardEl);
    details = el("div", "strip-details");
    out.appendChild(details);

    StripMarkup.attach();
    board = StripBoard.create(boardEl, {
      showNums: numsToggle.checked,
      keepSelectionWithin: ".strip-details, .sm-ui", // reading the answer key or using the marking tools must not deselect
      onSelect: function (strip, slot) {
        if (!revealAllToggle.checked) showDetails(strip);
        if (strip) StripMarkup.activate(strip, slot); else StripMarkup.deactivate();
      },
      onMove: function () { StripMarkup.reposition(); },
      onRender: function (slot) { StripMarkup.rebind(slot); }
    });
    board.setStrips(current);
    if (revealAllToggle.checked) renderAllKeys();
    else showDetails(null);
  }

  function render() {
    if (!current.length) {
      out.innerHTML = "";
      board = null;
      out.appendChild(el("div", "empty-state", "No strips yet. Set your options and press Generate, or load a scenario code."));
      return;
    }
    if (currentIsBlank()) renderBlank();
    else renderBoard();
  }

  function applyScenario(sc) {
    scenario = sc;
    detailsMinHeight = 0;
    StripMarkup.deactivate();
    current = sc.strips;
    codeInput.value = sc.code;
    // reflect the code's settings in the controls
    if (StripGen.tiers[sc.difficulty]) diffSel.value = sc.difficulty;
    typeSel.value = sc.type;
    countInput.value = sc.count;
    try { history.replaceState(null, "", "#" + sc.code); } catch (e) { /* ignore */ }
    syncControls();
    render();
  }

  function generate() {
    const c = parseInt(countInput.value, 10);
    if (isBlank()) {
      const n = c && c > 0 ? Math.min(c, 12) : 3;
      current = [];
      scenario = null;
      for (let i = 0; i < n; i++) current.push({ type: "blank" });
      render();
      return;
    }
    const opts = { difficulty: diffSel.value, type: typeSel.value };
    if (c && c > 0) opts.count = Math.min(c, 12);
    applyScenario(StripGen.generateScenario(opts));
  }

  function loadCode() {
    const code = (codeInput.value || "").trim().toUpperCase();
    const parsed = StripGen.parseCode(code);
    if (!parsed) {
      codeInput.setCustomValidity("Codes look like D3A-K7Q2MX");
      codeInput.reportValidity();
      return;
    }
    codeInput.setCustomValidity("");
    applyScenario(StripGen.generateScenario({ code: code }));
  }

  function syncControls() {
    if (diffControl) diffControl.style.opacity = isBlank() ? "0.4" : "";
    if (diffSel) diffSel.disabled = isBlank();
    if (revealAllToggle) revealAllToggle.disabled = isBlank();
  }

  genBtn.addEventListener("click", generate);
  loadBtn.addEventListener("click", loadCode);
  codeInput.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); loadCode(); } });
  codeInput.addEventListener("input", function () { codeInput.setCustomValidity(""); });
  numsToggle.addEventListener("change", function () {
    if (board) board.setShowNums(numsToggle.checked); // keeps any drag layout
    else render();
  });
  revealAllToggle.addEventListener("change", function () {
    if (board) { if (revealAllToggle.checked) renderAllKeys(); else showDetails(selected); }
    else render();
  });
  typeSel.addEventListener("change", syncControls);

  syncControls();
  // a code in the URL hash (strips.html#D3A-K7Q2MX) loads that scenario
  const hashCode = (location.hash || "").replace(/^#/, "");
  if (hashCode && StripGen.parseCode(hashCode)) { codeInput.value = hashCode; loadCode(); }
  else render();
})();
