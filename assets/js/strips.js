/*
 * Flight strip generator page controller. Uses window.FPSStrip for rendering.
 * Requires zae.js, generator.js, fps-strip.js.
 */
(function () {
  "use strict";
  const el = FPSStrip.el;

  const TYPE_LABELS = { proposal: "Proposal", departure: "Departure", enroute: "En Route", arrival: "Arrival", blank: "Blank" };

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

  function renderCard(strip, index, showNums) {
    const card = el("div", "strip-card");
    const tag = el("div", "strip-tag");
    tag.appendChild(el("span", null, "#" + (strip.flight || index + 1)));
    tag.appendChild(el("span", "badge", TYPE_LABELS[strip.type] || strip.type));
    if (strip.bay) tag.appendChild(el("span", "bay-badge", strip.bay + " bay"));
    if (strip.type !== "blank") tag.appendChild(el("span", null, (strip.spaces["3"] || "") + " · " + (strip.spaces["4"] || "")));
    else tag.appendChild(el("span", null, "fill me in"));
    card.appendChild(tag);

    card.appendChild(FPSStrip.render(strip.type === "blank" ? null : strip.spaces, { editable: strip.type === "blank", showNums: showNums }));

    if (strip.type !== "blank") {
      const revealRow = el("div", "reveal-row");
      const btn = el("button", "btn btn-ghost", "Reveal details");
      let keyEl = null;
      btn.addEventListener("click", function () {
        if (keyEl) { keyEl.remove(); keyEl = null; btn.textContent = "Reveal details"; }
        else { keyEl = renderAnswerKey(strip.meta); card.appendChild(keyEl); btn.textContent = "Hide details"; }
      });
      revealRow.appendChild(btn);
      card.appendChild(revealRow);
    }
    return card;
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

  function isBlank() { return typeSel.value === "blank"; }

  function render() {
    out.innerHTML = "";
    if (!current.length) {
      out.appendChild(el("div", "empty-state", "No strips yet. Set your options and press Generate."));
      return;
    }
    const showNums = numsToggle.checked;
    current.forEach(function (strip, i) {
      const card = renderCard(strip, i, showNums);
      out.appendChild(card);
      if (strip.type !== "blank" && revealAllToggle.checked) {
        card.appendChild(renderAnswerKey(strip.meta));
        const b = card.querySelector(".btn-ghost");
        if (b) b.textContent = "Hide details";
      }
    });
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
  numsToggle.addEventListener("change", render);
  revealAllToggle.addEventListener("change", render);
  typeSel.addEventListener("change", syncControls);

  syncControls();
  render();
})();
