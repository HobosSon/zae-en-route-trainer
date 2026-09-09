/*
 * Flight strip page controller — renders FPS2000-style paper flight progress
 * strips that mirror the FAA Academy simulator format, plus a blank editable
 * template mode. Requires zae.js, generator.js.
 */
(function () {
  "use strict";

  // Grid lines for the strip template, in a 1000 x 188 coordinate space.
  // Column order matches the FPS2000 paper strip:
  // AID | prev-fix+posted-fix | 14/14a + 17|18 box | arrow | altitude | next-fix | route
  const GRID = {
    rect: [0, 0, 1000, 188],
    vlines: [210, 290, 380, 440, 520, 600],
    hlines: [[210, 118, 290, 118], [600, 118, 1000, 118]],
    box: [298, 98, 74, 44],       // x,y,w,h  (spaces 17|18)
    boxsplit: 335
  };

  // Cells: key -> field mapping + placement (% of strip) + style class + space #.
  // field is the LP05 space number this cell shows.
  const CELLS = [
    { k: "aid", f: "3", x: 2, y: 5, w: 18, cls: "aid", n: "3" },
    { k: "type", f: "4", x: 2, y: 33, w: 18, cls: "type", n: "4" },
    { k: "tas", f: "5", x: 2, y: 55, w: 18, cls: "tas", n: "5" },
    { k: "strip", f: "10", x: 3, y: 80, w: 7, cls: "sm", n: "10" },
    { k: "prevfix", f: "11", x: 21.5, y: 8, w: 7, cls: "mid", n: "11" },
    { k: "prevtime", f: "12", x: 21.5, y: 36, w: 7, cls: "mid", n: "12" },
    { k: "postedfix", f: "19", x: 21.5, y: 80, w: 17, cls: "big", n: "19" },
    { k: "act", f: "14", x: 29.7, y: 8, w: 4, cls: "mid", n: "14" },
    { k: "plus", f: "14a", x: 34, y: 8, w: 4.5, cls: "mid", n: "14a" },
    { k: "box17", f: "17", x: 30.3, y: 55, w: 3.4, cls: "sm", n: "17" },
    { k: "box18", f: "18", x: 33.8, y: 55, w: 3.4, cls: "sm", n: "18" },
    { k: "arrow", f: "16", x: 38, y: 28, w: 6, cls: "arrow", n: "16" },
    { k: "altA", f: "20", x: 44.5, y: 30, w: 7.5, cls: "big", n: "20" },
    { k: "nextfix", f: "21", x: 52.5, y: 8, w: 7, cls: "mid", n: "21" },
    { k: "reqalt", f: "24", x: 52.5, y: 74, w: 7, cls: "mid", n: "24" },
    { k: "route", f: "25", x: 61, y: 8, w: 37, cls: "route", n: "25" },
    { k: "remarks", f: "26", x: 61, y: 72, w: 37, cls: "rem", n: "26" }
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
        let v = spaces ? spaces[c.f] : "";
        // arrow falls back to direction arrow (space 23) for en route strips
        if (c.k === "arrow" && (v == null || v === "") && spaces) v = spaces["23"] || "";
        if (v != null && v !== "") cell.textContent = slashZero(v);
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
