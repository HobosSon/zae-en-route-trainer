/*
 * Flight strip generator page controller. Generated strips are posted onto
 * the bay board (window.StripBoard); blank templates render as a plain list.
 * Requires zae.js, generator.js, fps-strip.js, strip-board.js.
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

  function renderAnswerKey(meta) {
    const box = el("div", "answer-key");
    box.appendChild(el("h4", null, "Answer key / self-check"));
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
  const numsToggle = document.getElementById("show-nums");
  const revealAllToggle = document.getElementById("reveal-all");
  const diffControl = diffSel ? diffSel.closest(".control") : null;

  let current = [];
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

  function showDetails(strip) {
    selected = strip;
    if (!details) return;
    details.innerHTML = "";
    if (!strip) {
      details.appendChild(el("p", "empty-note", "Click a strip on the board to see its answer key."));
      return;
    }
    const card = el("div", "strip-card");
    card.appendChild(stripTag(strip));
    card.appendChild(renderAnswerKey(strip.meta));
    details.appendChild(card);
  }

  function renderAllKeys() {
    if (!details) return;
    details.innerHTML = "";
    current.forEach(function (strip, i) {
      const card = el("div", "strip-card");
      card.appendChild(stripTag(strip, i));
      card.appendChild(renderAnswerKey(strip.meta));
      details.appendChild(card);
    });
  }

  // Generated strips: the bay board plus a details panel.
  function renderBoard() {
    out.innerHTML = "";
    const hint = el("p", "board-hint",
      "Strips in suspense (a departure awaiting its clearance request, with its postings stacked directly above it) sit above the bay label; " +
      "active postings sit below, earliest time at the bottom. Hover a strip to enlarge it, click it for its answer key, drag it to any bay or position. " +
      "With a strip selected, press F or Space to flag it as a reminder.");
    out.appendChild(hint);
    const boardEl = el("div");
    out.appendChild(boardEl);
    details = el("div", "strip-details");
    out.appendChild(details);

    board = StripBoard.create(boardEl, {
      showNums: numsToggle.checked,
      onSelect: function (strip) { if (!revealAllToggle.checked) showDetails(strip); }
    });
    board.setStrips(current);
    if (revealAllToggle.checked) renderAllKeys();
    else showDetails(null);
  }

  function render() {
    if (!current.length) {
      out.innerHTML = "";
      board = null;
      out.appendChild(el("div", "empty-state", "No strips yet. Set your options and press Generate."));
      return;
    }
    if (currentIsBlank()) renderBlank();
    else renderBoard();
  }

  function generate() {
    const c = parseInt(countInput.value, 10);
    if (isBlank()) {
      const n = c && c > 0 ? Math.min(c, 12) : 3;
      current = [];
      for (let i = 0; i < n; i++) current.push({ type: "blank" });
    } else {
      const opts = { difficulty: diffSel.value, type: typeSel.value };
      if (c && c > 0) opts.count = Math.min(c, 12);
      current = StripGen.generate(opts);
    }
    render();
  }

  function syncControls() {
    if (diffControl) diffControl.style.opacity = isBlank() ? "0.4" : "";
    if (diffSel) diffSel.disabled = isBlank();
    if (revealAllToggle) revealAllToggle.disabled = isBlank();
  }

  genBtn.addEventListener("click", generate);
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
  render();
})();
