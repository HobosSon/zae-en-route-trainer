/*
 * Flight strip page controller — renders FPS2000-style paper flight progress
 * strips that mirror the FAA Academy simulator format, plus a blank editable
 * template mode. Requires zae.js, generator.js.
 */
(function () {
  "use strict";

  // Grid lines for the strip template, in a 1000 x 188 coordinate space, matching
  // LP05 Appendix B exactly. Columns:
  // AID | 11-14a | 15/16 + 17|18 box + 19 | 20 | 21-24 | 25/26 | 27-30
  // The ONLY horizontal lines are the top & bottom of the 17|18 box.
  const GRID = {
    rect: [0, 0, 1000, 188],
    vlines: [145, 225, 375, 525, 600, 930],
    hlines: [],
    box: [225, 98, 150, 40],      // spaces 17|18 — spans the FULL center column (edge to edge)
    boxsplit: 285
  };

  // Cells: key -> field mapping + placement (% of strip) + style class + space #.
  const CELLS = [
    { k: "aid", f: "3", x: 2, y: 5, w: 12, cls: "aid", n: "3" },
    { k: "type", f: "4", x: 2, y: 33, w: 12, cls: "type", n: "4" },
    { k: "tas", f: "5", x: 2, y: 55, w: 12, cls: "tas", n: "5" },
    { k: "strip", f: "10", x: 3.5, y: 80, w: 6, cls: "sm", n: "10" },
    // col B (no internal lines) — 11 & 12 grouped at top
    { k: "prevfix", f: "11", x: 15, y: 8, w: 7, cls: "mid", n: "11" },
    { k: "prevtime", f: "12", x: 15, y: 24, w: 7, cls: "mid", n: "12" },
    { k: "act", f: "14", x: 15, y: 55, w: 4, cls: "mid", n: "14" },
    { k: "plus", f: "14a", x: 15, y: 78, w: 6, cls: "mid", n: "14a" },
    // col C — center estimate (4-digit), arrow top-right, 17|18 box (full-width), posted fix below
    { k: "centerest", f: "15", x: 23.5, y: 4, w: 9, cls: "est", n: "15" },
    { k: "arrow", f: "16", x: 33.5, y: 4, w: 3.5, cls: "arrow", n: "16" },
    { k: "box17", f: "17", x: 23, y: 55, w: 5, cls: "sm", n: "17" },
    { k: "box18", f: "18", x: 29, y: 55, w: 8, cls: "sm", n: "18" },
    { k: "postedfix", f: "19", x: 23, y: 77, w: 14, cls: "big", n: "19" },
    // col D — altitude, same width as col C, top-left
    { k: "altA", f: "20", x: 38.5, y: 8, w: 12, cls: "big", n: "20" },
    { k: "alt20a", f: "20a", x: 38.5, y: 78, w: 12, cls: "sm", n: "20a" },
    // col E — 21/22/23/24
    { k: "nextfix", f: "21", x: 53, y: 8, w: 6.5, cls: "mid", n: "21" },
    { k: "b22", f: "22", x: 53, y: 33, w: 6.5, cls: "sm", n: "22" },
    { k: "b23", f: "23", x: 53, y: 52, w: 6.5, cls: "dir", n: "23" },
    { k: "reqalt", f: "24", x: 53, y: 78, w: 6.5, cls: "mid", n: "24" },
    // col F — route / remarks (no line between)
    { k: "route", f: "25", x: 61, y: 8, w: 31, cls: "route", n: "25" },
    { k: "remarks", f: "26", x: 61, y: 70, w: 31, cls: "rem", n: "26" },
    // col G — 27-30
    { k: "b27", f: "27", x: 93.5, y: 8, w: 6, cls: "sm", n: "27" },
    { k: "b28", f: "28", x: 93.5, y: 30, w: 6, cls: "sm", n: "28" },
    { k: "b29", f: "29", x: 93.5, y: 72, w: 3, cls: "sm", n: "29" },
    { k: "b30", f: "30", x: 96.5, y: 72, w: 3, cls: "sm", n: "30" }
  ];

  const TYPE_LABELS = { proposal: "Proposal", departure: "Departure", enroute: "En Route", arrival: "Arrival", blank: "Blank" };

  const KEY_ORDER = [
    ["stripType", "Strip type"], ["callsign", "Callsign"], ["aircraft", "Aircraft"],
    ["equip", "Equipment"], ["tas", "Filed TAS"], ["gs", "Est. ground speed"],
    ["origin", "Departing"], ["destination", "Destination"], ["route", "Route (space 25)"],
    ["airway", "Airway / traversal"], ["postedFix", "Posted fix"], ["arrivalFix", "Arrival fix"],
    ["nextPostedFix", "Next posted fix (space 21)"], ["previousFix", "Previous fix"], ["nextFix", "Next fix"],
    ["requiredPostings", "Fix postings"], ["allPostings", "Airway postings"], ["altitude", "Altitude"],
    ["direction", "Direction of flight"], ["proposedTime", "Proposed time"], ["departureTime", "Departure time"],
    ["ete", "ETE"], ["plusTimeMath", "Plus-time (Quick Estimate)"], ["estimateMath", "Posted-fix estimate"]
  ];
  const MATH_KEYS = { plusTimeMath: 1, estimateMath: 1 };

  const SVGNS = "http://www.w3.org/2000/svg";
  function slashZero(s) { return String(s).replace(/0/g, "Ø"); }
  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function gridSvg() {
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("class", "fps-grid");
    svg.setAttribute("viewBox", "0 0 1000 188");
    svg.setAttribute("preserveAspectRatio", "none");
    function line(x1, y1, x2, y2) { const l = document.createElementNS(SVGNS, "line"); l.setAttribute("x1", x1); l.setAttribute("y1", y1); l.setAttribute("x2", x2); l.setAttribute("y2", y2); svg.appendChild(l); }
    const r = document.createElementNS(SVGNS, "rect");
    r.setAttribute("x", 0.5); r.setAttribute("y", 0.5); r.setAttribute("width", 999); r.setAttribute("height", 187); svg.appendChild(r);
    GRID.vlines.forEach(function (x) { line(x, 0, x, 188); });
    GRID.hlines.forEach(function (h) { line(h[0], h[1], h[2], h[3]); });
    const b = document.createElementNS(SVGNS, "rect");
    b.setAttribute("x", GRID.box[0]); b.setAttribute("y", GRID.box[1]); b.setAttribute("width", GRID.box[2]); b.setAttribute("height", GRID.box[3]); svg.appendChild(b);
    line(GRID.boxsplit, GRID.box[1], GRID.boxsplit, GRID.box[1] + GRID.box[3]);
    return svg;
  }

  // Render one FPS strip. `spaces` = data (or null for blank). opts: {editable, showNums}
  function renderFpsStrip(spaces, editable, showNums) {
    const wrap = el("div", "fps-strip" + (editable ? " editable" : ""));
    wrap.appendChild(gridSvg());
    CELLS.forEach(function (c) {
      const cell = el("div", "fps-cell " + c.cls);
      cell.style.left = c.x + "%";
      cell.style.top = c.y + "%";
      cell.style.width = c.w + "%";
      if (editable) {
        cell.setAttribute("contenteditable", "true");
        cell.setAttribute("spellcheck", "false");
        cell.dataset.k = c.k;
      } else {
        const v = spaces ? spaces[c.f] : "";
        if (v != null && v !== "") {
          // Space 15 (center estimate): hours larger, minutes raised — like the paper strips.
          if (c.k === "centerest" && /^\d{4}$/.test(String(v))) {
            const hh = el("span", "hh", slashZero(String(v).slice(0, 2)));
            const mm = el("span", "mm", slashZero(String(v).slice(2)));
            cell.appendChild(hh); cell.appendChild(mm);
          } else {
            cell.textContent = slashZero(v);
          }
        }
      }
      wrap.appendChild(cell);
      if (showNums) {
        const badge = el("span", "fps-num", c.n);
        badge.style.left = c.x + "%";
        badge.style.top = (c.y) + "%";
        wrap.appendChild(badge);
      }
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
      dl.appendChild(el("dd", MATH_KEYS[pair[0]] ? "math" : null, val));
    });
    if (meta.notes && meta.notes.length) meta.notes.forEach(function (n) { dl.appendChild(el("div", "note", n)); });
    box.appendChild(dl);
    return box;
  }

  function renderCard(strip, index, showNums) {
    const card = el("div", "strip-card");
    const tag = el("div", "strip-tag");
    tag.appendChild(el("span", null, "#" + (index + 1)));
    tag.appendChild(el("span", "badge", TYPE_LABELS[strip.type] || strip.type));
    if (strip.type !== "blank") tag.appendChild(el("span", null, (strip.spaces["3"] || "") + " · " + (strip.spaces["4"] || "")));
    else tag.appendChild(el("span", null, "fill me in"));
    card.appendChild(tag);

    card.appendChild(renderFpsStrip(strip.type === "blank" ? null : strip.spaces, strip.type === "blank", showNums));

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

  // grey out difficulty when blank template is selected (it doesn't apply)
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
