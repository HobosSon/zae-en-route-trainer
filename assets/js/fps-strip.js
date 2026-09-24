/*
 * Shared FPS2000-style flight progress strip renderer (LP05 Appendix B layout).
 * Exposed as window.FPSStrip so the generator page and scenarios both reuse it.
 *   FPSStrip.render(spaces, { editable, showNums, marks, remote }) -> HTMLElement (.fps-strip)
 *     remote: { mpm, lines26, plus23 } — the Remote's typed scenario data in
 *             space 26, the miles-per-minute figure written in red in space 9,
 *             and the plus time printed in space 23 instead of 14a
 *   FPSStrip.readEditable(stripEl) -> { "<space>": value } from a filled-in blank
 *   FPSStrip.CELLS, FPSStrip.el, FPSStrip.slashZero
 */
(function (root) {
  "use strict";
  const SVGNS = "http://www.w3.org/2000/svg";

  // Column dividers + 17/18 box traced from SLP05 Appendix B (viewBox 1000x188).
  // Majors: 152 A|B, 238 B|C, 402 C|D, 594 D|E, 662 E|F, 910 F|G.
  const GRID = {
    vlines: [152, 238, 402, 594, 662, 910],
    // 17/18 box spans center cell [238-402], y 0.599-0.780 of strip height,
    // split 31.7% (17 narrow) / 68.3% (18 wide).
    box: [238, 113, 164, 34],
    boxsplit: 290
  };

  const CELLS = [
    // Column A [0-15.2]: aircraft ID / type / TAS / strip no.
    { k: "aid", f: "3", x: 2, y: 5, w: 13, cls: "aid", n: "3" },
    { k: "type", f: "4", x: 2, y: 33, w: 13, cls: "type", n: "4" },
    { k: "tas", f: "5", x: 2, y: 47, w: 13, cls: "tas", n: "5" },
    { k: "strip", f: "10", x: 3.5, y: 80, w: 6, cls: "sm", n: "10" },
    // Column B [15.2-23.8]: previous fix + times
    { k: "prevfix", f: "11", x: 15.8, y: 8, w: 7, cls: "mid", n: "11" },
    { k: "prevtime", f: "12", x: 15.8, y: 24, w: 7, cls: "mid", n: "12" },
    { k: "act", f: "14", x: 15.8, y: 55, w: 6, cls: "mid", n: "14" },
    { k: "plus", f: "14a", x: 15.8, y: 78, w: 6, cls: "mid", n: "14a" },
    // Column C [23.8-40.2]: center estimate / arrow / 17-18 box / posted fix
    { k: "centerest", f: "15", x: 24.5, y: 4, w: 11.5, cls: "est", n: "15" },
    { k: "arrow", f: "16", x: 35, y: 1, w: 4.5, cls: "arrow", n: "16" },
    { k: "box17", f: "17", x: 24.5, y: 63, w: 4, cls: "sm", n: "17" },
    { k: "box18", f: "18", x: 30, y: 63, w: 9, cls: "sm", n: "18" },
    { k: "postedfix", f: "19", x: 24.5, y: 79, w: 15, h: 19, cls: "big pfv", n: "19" },
    // Column D [40.2-59.4]: altitude
    { k: "altA", f: "20", x: 41, y: 8, w: 14, cls: "big", n: "20" },
    { k: "alt20a", f: "20a", x: 41, y: 78, w: 14, cls: "sm", n: "20a" },
    // Column E [59.4-66.2]: next fix / dir / requested alt
    { k: "nextfix", f: "21", x: 60, y: 8, w: 6, cls: "mid", n: "21" },
    { k: "b22", f: "22", x: 60, y: 33, w: 6, cls: "sm", n: "22" },
    { k: "b23", f: "23", x: 59.4, y: 52, w: 6.8, cls: "dir", n: "23" },
    { k: "reqalt", f: "24", x: 60, y: 78, w: 6, cls: "mid", n: "24" },
    // Column F [66.2-91.0]: route (25) / remarks (26)
    { k: "route", f: "25", x: 67, y: 8, w: 23, cls: "route", n: "25" },
    { k: "remarks", f: "26", x: 67, y: 50, w: 23, cls: "rem", n: "26" },
    // Column G [91.0-100]: 27 / 28 / 30
    { k: "b27", f: "27", x: 91.5, y: 8, w: 7, cls: "sm", n: "27" },
    { k: "b28", f: "28", x: 91.5, y: 30, w: 7, cls: "sm", n: "28" },
    { k: "b30", f: "30", x: 91.5, y: 82, w: 7, cls: "mid", n: "30" }
  ];

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
    const b = document.createElementNS(SVGNS, "rect");
    b.setAttribute("x", GRID.box[0]); b.setAttribute("y", GRID.box[1]); b.setAttribute("width", GRID.box[2]); b.setAttribute("height", GRID.box[3]); svg.appendChild(b);
    line(GRID.boxsplit, GRID.box[1], GRID.boxsplit, GRID.box[1] + GRID.box[3]);
    return svg;
  }

  // Stripmarking overlay boxes (percent of the strip) for the completed
  // answer-key strip: where the controller writes in each space.
  const MARK_BOX = {
    "12": { x: 15.8, y: 22, w: 7.5, h: 20 }, "14": { x: 15.8, y: 50, w: 8, h: 24 }, "15": { x: 24.5, y: 2, w: 10.8, h: 58 },
    "18": { x: 29.5, y: 60, w: 10.5, h: 20 }, "20": { x: 41, y: 4, w: 18.5, h: 92 }, "23": { x: 59.6, y: 48, w: 6.5, h: 22 },
    "24": { x: 60, y: 74, w: 6.5, h: 24 }, "26": { x: 67, y: 48, w: 23.5, h: 50 }, "28": { x: 91.2, y: 26, w: 8.5, h: 56 },
    "19": { x: 31.5, y: 78, w: 8.5, h: 20 },   // beside the posted fix (an amended fix)
    "12b": { x: 15.8, y: 38, w: 8, h: 16 },    // under the P-time (KMLU: assumed / actual departure times)
    "15b": { x: 24.5, y: 30, w: 14, h: 28 }    // under the center estimate (a coordinated estimate for another fix)
  };
  const MARK_HIDES_BASE = { "20": 1 }; // the marks restate this space in full (15 only when a mark replaces it)

  // marks: { "<space>": [ { t, c: 'red'|'blk', circ: 'red'|'blk', ul: 'red', strike, bar, corner, replace } ] }
  function renderMarks(wrap, marks) {
    // spaces that share a box (29 writes into the 28 column) are merged
    const grouped = {};
    Object.keys(marks).forEach(function (sp) {
      const key = MARK_BOX[sp] ? sp : sp === "29" ? "28" : "26";
      grouped[key] = (grouped[key] || []).concat(marks[sp] || []);
    });
    Object.keys(grouped).forEach(function (sp) {
      const box = MARK_BOX[sp];
      const list = grouped[sp];
      if (!list || !list.length) return;
      // KMLU departure strip: the EDC sits directly above the plus time in 14a (the assumed and actual departure times are above it, under the P-time)
      const bottom = sp === "14" && grouped["12b"] && grouped["12b"].length;
      const m = el("div", "fps-marks mk-sp" + sp + (list.some(function (mk) { return mk.row; }) ? " mk-row" : "") + (bottom ? " mk-bottom" : ""));
      m.style.left = box.x + "%"; m.style.top = box.y + "%"; m.style.width = box.w + "%"; m.style.height = box.h + "%";
      list.forEach(function (mk) {
        if (mk.bar) { m.appendChild(el("span", "mk-bar")); return; }
        const s = el("span", "mk " + (mk.c === "red" ? "mk-red" : "mk-blk") + (mk.circ ? " mk-circ-" + mk.circ : "") + (mk.ul ? " mk-ul-" + mk.ul : "") + (mk.strike ? " mk-strike" : "") + (mk.corner ? " mk-corner" : "") + (mk.big ? " mk-big" : "") + (mk.alt ? " mk-alt" : ""));
        if (mk.circMm && /^\d{4}$/.test(String(mk.t))) { // HHMM with only the minutes circled (a coordinated estimate)
          s.appendChild(document.createTextNode(slashZero(String(mk.t).slice(0, 2))));
          s.appendChild(el("span", "mk-circ-" + mk.circMm + " mk-mm", slashZero(String(mk.t).slice(2))));
        } else s.textContent = slashZero(mk.t);
        // inline: written right after the previous mark on the same line (a red W beside the altitude)
        const prev = m.lastElementChild;
        if (mk.inline && prev && prev.classList.contains("mk")) { s.classList.add("mk-inline"); prev.appendChild(s); }
        else m.appendChild(s);
      });
      wrap.appendChild(m);
    });
  }

  function render(spaces, opts) {
    opts = opts || {};
    const editable = !!opts.editable, showNums = !!opts.showNums;
    const marks = opts.marks || null;
    const wrap = el("div", "fps-strip" + (editable ? " editable" : "") + (marks ? " marked" : ""));
    wrap.appendChild(gridSvg());
    CELLS.forEach(function (c) {
      const cell = el("div", "fps-cell " + c.cls);
      cell.dataset.f = c.f; // space number (the markup editor finds cells by it)
      if (marks && marks[c.f] && marks[c.f].length && (MARK_HIDES_BASE[c.f] || marks[c.f].some(function (m) { return m.replace; }))) cell.classList.add("mk-hidden");
      cell.style.left = c.x + "%";
      cell.style.top = c.y + "%";
      cell.style.width = c.w + "%";
      if (c.h) cell.style.height = c.h + "%";
      if (editable) {
        cell.setAttribute("contenteditable", "true");
        cell.setAttribute("spellcheck", "false");
        cell.dataset.k = c.k;
        cell.dataset.f = c.f;
        const v = spaces ? spaces[c.f] : "";
        if (v != null && v !== "") cell.textContent = v;
      } else {
        const v = opts.hide && opts.hide.indexOf(c.f) !== -1 ? "" : (spaces ? spaces[c.f] : "");
        if (v != null && v !== "") {
          if (c.k === "centerest" && /^\d{4}$/.test(String(v))) {
            cell.appendChild(el("span", "hh", slashZero(String(v).slice(0, 2))));
            cell.appendChild(el("span", "mm", slashZero(String(v).slice(2))));
          } else {
            cell.textContent = slashZero(v);
          }
        }
      }
      wrap.appendChild(cell);
      if (showNums) {
        const badge = el("span", "fps-num", c.n);
        badge.style.left = c.x + "%";
        badge.style.top = c.y + "%";
        wrap.appendChild(badge);
      }
    });
    if (marks) renderMarks(wrap, marks);
    if (opts.remote) renderRemote(wrap, opts.remote);
    return wrap;
  }

  // Remote strips: the typed lines in space 26 (initial contact time, request
  // time, ON FREQUENCY, ...) and the miles per minute in red in space 9.
  function renderRemote(wrap, r) {
    wrap.classList.add("remote");
    if (r.mpm != null) {
      const m = el("div", "fps-cell fps-mpm", String(r.mpm));
      m.style.left = "7.4%"; m.style.top = "45%"; m.style.width = "4.5%"; // right beside the filed airspeed (space 5)
      wrap.appendChild(m);
    }
    if (r.plus23) { // the Remote's strips print the plus time to the NEXT fix in 23 (the controller moves it to the next strip's 14a)
      const c23 = wrap.querySelector('.fps-cell[data-f="23"]');
      if (c23) { c23.textContent = slashZero(r.plus23); c23.classList.add("fps-plus23"); }
    }
    // the Remote's strips show everything the controller's do (14a included), plus 23
    if (r.lines26 && r.lines26.length) {
      const c26 = wrap.querySelector('.fps-cell[data-f="26"]');
      const b = c26 || el("div", "fps-cell");
      if (c26 && c26.textContent) { const printed = el("div", null, c26.textContent); c26.textContent = ""; c26.appendChild(printed); }
      b.classList.add("fps-r26");
      r.lines26.forEach(function (t) { b.appendChild(el("div", null, slashZero(t))); });
      if (!c26) { b.style.left = "67%"; b.style.top = "50%"; b.style.width = "23%"; wrap.appendChild(b); }
    }
  }

  // Read the values a user typed into a blank/editable strip into a spaces object.
  function readEditable(stripEl) {
    const spaces = {};
    stripEl.querySelectorAll(".fps-cell[contenteditable]").forEach(function (cell) {
      const val = cell.textContent.trim();
      if (val) spaces[cell.dataset.f] = val.toUpperCase();
    });
    return spaces;
  }

  root.FPSStrip = { render: render, readEditable: readEditable, CELLS: CELLS, el: el, slashZero: slashZero };
})(typeof window !== "undefined" ? window : this);
