/*
 * Shared FPS2000-style flight progress strip renderer (LP05 Appendix B layout).
 * Exposed as window.FPSStrip so the generator page and scenarios both reuse it.
 *   FPSStrip.render(spaces, { editable, showNums }) -> HTMLElement (.fps-strip)
 *   FPSStrip.readEditable(stripEl) -> { "<space>": value } from a filled-in blank
 *   FPSStrip.CELLS, FPSStrip.el, FPSStrip.slashZero
 */
(function (root) {
  "use strict";
  const SVGNS = "http://www.w3.org/2000/svg";

  const GRID = {
    vlines: [145, 225, 375, 525, 600, 930],
    box: [225, 98, 150, 40],
    boxsplit: 285
  };

  const CELLS = [
    { k: "aid", f: "3", x: 2, y: 5, w: 12, cls: "aid", n: "3" },
    { k: "type", f: "4", x: 2, y: 33, w: 12, cls: "type", n: "4" },
    { k: "tas", f: "5", x: 2, y: 47, w: 12, cls: "tas", n: "5" },
    { k: "strip", f: "10", x: 3.5, y: 80, w: 6, cls: "sm", n: "10" },
    { k: "prevfix", f: "11", x: 15, y: 8, w: 7, cls: "mid", n: "11" },
    { k: "prevtime", f: "12", x: 15, y: 24, w: 7, cls: "mid", n: "12" },
    { k: "act", f: "14", x: 15, y: 55, w: 4, cls: "mid", n: "14" },
    { k: "plus", f: "14a", x: 15, y: 78, w: 6, cls: "mid", n: "14a" },
    { k: "centerest", f: "15", x: 23.5, y: 4, w: 9, cls: "est", n: "15" },
    { k: "arrow", f: "16", x: 32.5, y: 1, w: 4.5, cls: "arrow", n: "16" },
    { k: "box17", f: "17", x: 23, y: 55, w: 5, cls: "sm", n: "17" },
    { k: "box18", f: "18", x: 29, y: 55, w: 8, cls: "sm", n: "18" },
    { k: "postedfix", f: "19", x: 23, y: 73.5, w: 14, h: 26, cls: "big pfv", n: "19" },
    { k: "altA", f: "20", x: 38.5, y: 8, w: 12, cls: "big", n: "20" },
    { k: "alt20a", f: "20a", x: 38.5, y: 78, w: 12, cls: "sm", n: "20a" },
    { k: "nextfix", f: "21", x: 53, y: 8, w: 6.5, cls: "mid", n: "21" },
    { k: "b22", f: "22", x: 53, y: 33, w: 6.5, cls: "sm", n: "22" },
    { k: "b23", f: "23", x: 53, y: 52, w: 6.5, cls: "dir", n: "23" },
    { k: "reqalt", f: "24", x: 53, y: 78, w: 6.5, cls: "mid", n: "24" },
    { k: "route", f: "25", x: 61, y: 8, w: 31, cls: "route", n: "25" },
    { k: "remarks", f: "26", x: 61, y: 70, w: 31, cls: "rem", n: "26" },
    { k: "b27", f: "27", x: 93.5, y: 8, w: 6, cls: "sm", n: "27" },
    { k: "b28", f: "28", x: 93.5, y: 30, w: 6, cls: "sm", n: "28" },
    { k: "b30", f: "30", x: 93.5, y: 72, w: 6, cls: "mid", n: "30" }
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

  function render(spaces, opts) {
    opts = opts || {};
    const editable = !!opts.editable, showNums = !!opts.showNums;
    const wrap = el("div", "fps-strip" + (editable ? " editable" : ""));
    wrap.appendChild(gridSvg());
    CELLS.forEach(function (c) {
      const cell = el("div", "fps-cell " + c.cls);
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
        const v = spaces ? spaces[c.f] : "";
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
    return wrap;
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
