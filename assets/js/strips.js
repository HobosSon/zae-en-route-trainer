/*
 * Flight strip generator page controller. Generated strips are posted onto
 * the bay board (ScenarioBoard over window.StripBoard); blank templates
 * render as a plain list. A scenario (all strips on the board) has a code
 * that reproduces it exactly (StripGen.generateScenario), and an answer key
 * from the conflict engine: the completed strip with the controller's
 * stripmarking, the restrictions, reports, phraseology and coordination for
 * each aircraft. The scenario bar switches between the Controller's strips
 * and the Remote's (a code shared as CODE/remote opens that view).
 * Requires zae.js, conflicts.js, remote.js, generator.js, fps-strip.js,
 * strip-board.js, strip-markup.js, scenario-board.js.
 */
(function () {
  "use strict";
  const el = FPSStrip.el;

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
  let sb = null;             // ScenarioBoard for generated strips (kept so drags survive toggles)
  let view = "controller";   // "controller" | "remote" — whose strips the board shows

  function isBlank() { return typeSel.value === "blank"; }
  function currentIsBlank() { return current.length && current[0].type === "blank"; }

  // Blank templates: the plain editable list.
  function renderBlank() {
    out.innerHTML = "";
    sb = null;
    current.forEach(function (strip, i) {
      const card = el("div", "strip-card");
      card.appendChild(ScenarioBoard.stripTag(strip, i));
      card.appendChild(FPSStrip.render(null, { editable: true, showNums: numsToggle.checked }));
      out.appendChild(card);
    });
  }

  function hhmm(m) { return StripGen.toHHMM(m); }
  function updateHash() {
    if (!scenario) return;
    try { history.replaceState(null, "", "#" + scenario.code + (view === "remote" ? "/remote" : "")); } catch (e) { /* ignore */ }
  }

  // Scenario bar content: the code (share it to reproduce the board), the window, the rules in force.
  function barHead() {
    const nodes = [];
    nodes.push(el("span", null, "Scenario"));
    nodes.push(el("span", "code", scenario.code));
    const copy = el("button", "btn btn-ghost", "Copy code");
    copy.addEventListener("click", function () {
      const txt = scenario.code + (view === "remote" ? "/remote" : "");
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { copy.textContent = "Copied"; setTimeout(function () { copy.textContent = "Copy code"; }, 1200); });
      else { codeInput.value = txt; codeInput.select(); }
    });
    nodes.push(copy);
    return nodes;
  }
  function barTail() {
    return [
      el("span", null, "Window " + hhmm(scenario.window.start) + "–" + hhmm(scenario.window.start + scenario.window.span) + "Z"),
      el("span", null, scenario.flights.length + " aircraft · " + scenario.strips.length + " strips"),
      el("span", "rules", "Rules: 10 min / 20 DME · 44-kt 3 min · 22-kt 5 min · 2-minute departure rule · holding pattern airspace protected 10 min before the holder's estimate · CBM 3 and MEI 1 West MOAs active")
    ];
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

  // Generated strips: the bay board plus the details panel.
  function renderBoard() {
    sb = ScenarioBoard.create(out, {
      strips: current,
      flights: scenario ? scenario.flights : [],
      view: view,
      showNums: numsToggle.checked,
      revealAll: revealAllToggle.checked,
      bar: function (bar, toggle) {
        if (scenario) barHead().forEach(function (n) { bar.appendChild(n); });
        bar.appendChild(toggle);
        if (scenario) barTail().forEach(function (n) { bar.appendChild(n); });
      },
      before: scenario ? [renderTrafficSummary()] : [],
      renderDetails: function (strip) { return renderAnswerKey(strip); },
      onViewChange: function (v) { view = v; updateHash(); }
    });
  }

  function render() {
    if (!current.length) {
      out.innerHTML = "";
      sb = null;
      out.appendChild(el("div", "empty-state", "No strips yet. Set your options and press Generate, or load a scenario code."));
      return;
    }
    if (currentIsBlank()) renderBlank();
    else renderBoard();
  }

  function applyScenario(sc) {
    scenario = sc;
    StripMarkup.deactivate();
    current = sc.strips;
    codeInput.value = sc.code;
    // reflect the code's settings in the controls
    if (StripGen.tiers[sc.difficulty]) diffSel.value = sc.difficulty;
    typeSel.value = sc.type;
    countInput.value = sc.count;
    updateHash();
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
    const raw = (codeInput.value || "").trim().toUpperCase().split("/");
    const code = raw[0];
    if (raw[1] === "REMOTE") view = "remote";
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
    if (sb) sb.setShowNums(numsToggle.checked); // keeps any drag layout
    else render();
  });
  revealAllToggle.addEventListener("change", function () {
    if (sb) sb.setRevealAll(revealAllToggle.checked);
    else render();
  });
  typeSel.addEventListener("change", syncControls);

  syncControls();
  // a code in the URL hash (strips.html#D3A-K7Q2MX, or #D3A-K7Q2MX/remote for
  // the Remote's strips) loads that scenario
  const hashParts = (location.hash || "").replace(/^#/, "").split("/");
  if (hashParts[1] && hashParts[1].toLowerCase() === "remote") view = "remote";
  if (hashParts[0] && StripGen.parseCode(hashParts[0])) { codeInput.value = hashParts[0]; loadCode(); }
  else render();
})();
