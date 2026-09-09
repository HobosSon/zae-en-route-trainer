/*
 * Flight strip page controller. Wires the controls to StripGen and renders
 * authentic nonradar strips + optional answer keys. Requires zae.js, generator.js.
 */
(function () {
  "use strict";

  // Strip layout mirrors LP05 Appendix B (nonradar strip). Each column holds rows;
  // each row holds one or more numbered cells. `big`/`arrow`/`route`/`rem` pick styling.
  const LAYOUT = [
    { cls: "col-id", rows: [
      [{ s: "1" }, { s: "2" }],
      [{ s: "3", big: true }],
      [{ s: "4" }],
      [{ s: "5" }],
      [{ s: "6" }, { s: "7" }],
      [{ s: "8" }, { s: "9" }],
      [{ s: "10" }]
    ]},
    { cls: "col-prev", rows: [
      [{ s: "11" }],
      [{ s: "12" }],
      [{ s: "13" }],
      [{ s: "14" }],
      [{ s: "14a" }]
    ]},
    { cls: "col-center", rows: [
      [{ s: "15" }, { s: "16", arrow: true }],
      [{ s: "17" }, { s: "18" }],
      [{ s: "19", big: true }]
    ]},
    { cls: "col-alt", rows: [
      [{ s: "20", big: true }],
      [{ s: "20a" }]
    ]},
    { cls: "col-next", rows: [
      [{ s: "21" }],
      [{ s: "22" }],
      [{ s: "23", arrow: true }],
      [{ s: "24" }]
    ]},
    { cls: "col-route", rows: [
      [{ s: "25", route: true }],
      [{ s: "26", rem: true }]
    ]},
    { cls: "col-right", rows: [
      [{ s: "27" }],
      [{ s: "28" }],
      [{ s: "29-30" }]
    ]}
  ];

  const TYPE_LABELS = {
    proposal: "Proposal", departure: "Departure", enroute: "En Route", arrival: "Arrival"
  };

  const KEY_ORDER = [
    ["stripType", "Strip type"],
    ["callsign", "Callsign"],
    ["aircraft", "Aircraft"],
    ["equip", "Equipment"],
    ["tas", "Filed TAS"],
    ["gs", "Est. ground speed"],
    ["origin", "Departing"],
    ["destination", "Destination"],
    ["route", "Route (space 25)"],
    ["airway", "Airway / traversal"],
    ["postedFix", "Posted fix"],
    ["arrivalFix", "Arrival fix"],
    ["nextPostedFix", "Next posted fix (space 21)"],
    ["previousFix", "Previous fix"],
    ["nextFix", "Next fix"],
    ["requiredPostings", "Fix postings"],
    ["allPostings", "Airway postings"],
    ["altitude", "Altitude"],
    ["direction", "Direction of flight"],
    ["proposedTime", "Proposed time"],
    ["departureTime", "Departure time"],
    ["ete", "ETE"],
    ["plusTimeMath", "Plus-time (Quick Estimate)"],
    ["estimateMath", "Posted-fix estimate"]
  ];

  const MATH_KEYS = { plusTimeMath: 1, estimateMath: 1 };

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function renderStrip(strip, showNums) {
    const wrap = el("div", "strip" + (showNums ? "" : " hide-nums"));
    LAYOUT.forEach(function (col) {
      const colEl = el("div", "strip-col " + col.cls);
      col.rows.forEach(function (row) {
        const rowEl = el("div", "strip-row");
        row.forEach(function (cellDef) {
          const cell = el("div", "cell");
          cell.appendChild(el("span", "num", cellDef.s));
          const value = strip.spaces[cellDef.s];
          if (value != null && value !== "") {
            let vcls = "val";
            if (cellDef.big) vcls += " big";
            if (cellDef.arrow) vcls += " arrow";
            if (cellDef.route) vcls += " route";
            if (cellDef.rem) vcls += " rem";
            cell.appendChild(el("span", vcls, value));
          }
          rowEl.appendChild(cell);
        });
        colEl.appendChild(rowEl);
      });
      wrap.appendChild(colEl);
    });
    return wrap;
  }

  function renderAnswerKey(meta) {
    const box = el("div", "answer-key");
    box.appendChild(el("h4", null, "Answer key / self-check"));
    const dl = el("dl");
    KEY_ORDER.forEach(function (pair) {
      const val = meta[pair[0]];
      if (val == null || val === "") return;
      dl.appendChild(el("dt", null, pair[1]));
      const dd = el("dd", MATH_KEYS[pair[0]] ? "math" : null, val);
      dl.appendChild(dd);
    });
    if (meta.notes && meta.notes.length) {
      meta.notes.forEach(function (n) { dl.appendChild(el("div", "note", n)); });
    }
    box.appendChild(dl);
    return box;
  }

  function renderCard(strip, index, showNums) {
    const card = el("div", "strip-card");

    const tag = el("div", "strip-tag");
    const badge = el("span", "badge", TYPE_LABELS[strip.type] || strip.type);
    tag.appendChild(el("span", null, "#" + (index + 1)));
    tag.appendChild(badge);
    tag.appendChild(el("span", null, strip.spaces["3"] + " · " + (strip.spaces["4"] || "")));
    card.appendChild(tag);

    card.appendChild(renderStrip(strip, showNums));

    const revealRow = el("div", "reveal-row");
    const btn = el("button", "btn btn-ghost", "Reveal details");
    let keyEl = null;
    btn.addEventListener("click", function () {
      if (keyEl) {
        keyEl.remove(); keyEl = null; btn.textContent = "Reveal details";
      } else {
        keyEl = renderAnswerKey(strip.meta);
        card.appendChild(keyEl);
        btn.textContent = "Hide details";
      }
    });
    revealRow.appendChild(btn);
    card.appendChild(revealRow);
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

  let current = [];

  function render() {
    out.innerHTML = "";
    if (!current.length) {
      out.appendChild(el("div", "empty-state", "No strips yet. Set your difficulty and press Generate."));
      return;
    }
    const showNums = numsToggle.checked;
    current.forEach(function (strip, i) {
      const card = renderCard(strip, i, showNums);
      out.appendChild(card);
      if (revealAllToggle.checked) {
        card.appendChild(renderAnswerKey(strip.meta));
        const b = card.querySelector(".btn-ghost");
        if (b) b.textContent = "Hide details";
      }
    });
  }

  function generate() {
    const opts = { difficulty: diffSel.value, type: typeSel.value };
    const c = parseInt(countInput.value, 10);
    if (c && c > 0) opts.count = Math.min(c, 12);
    current = StripGen.generate(opts);
    render();
  }

  genBtn.addEventListener("click", generate);
  numsToggle.addEventListener("change", render);
  revealAllToggle.addEventListener("change", render);

  // First load
  render();
})();
