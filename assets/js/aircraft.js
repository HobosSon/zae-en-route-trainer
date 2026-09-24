/*
 * Aircraft Characteristics Study Guide page. Renders the course chart
 * (window.ZAE_AIRCRAFT) column by column and lets the reader hide any kind
 * of element (true airspeed, engines, type, weight class, climb rate,
 * designator, model) to quiz themselves. A hidden element keeps its space;
 * clicking a cell peeks at what is hidden in it.
 */
(function () {
  "use strict";
  const DATA = window.ZAE_AIRCRAFT;
  const host = document.getElementById("ac-chart");
  const togHost = document.getElementById("ac-toggles");
  const actHost = document.getElementById("ac-toggle-actions");
  const legendHost = document.getElementById("ac-legend");
  if (!DATA || !host) return;

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  // The kinds of element that can be shown or hidden (data-k on each piece of the chart)
  const KINDS = [
    ["tas", "True airspeed (column)"],
    ["eng", "Number of engines"],
    ["type", "Type (P / TP / J)"],
    ["wt", "Weight class"],
    ["climb", "Climb rate"],
    ["actas", "True airspeed (aircraft)"],
    ["des", "Aircraft designator"],
    ["model", "Aircraft model"]
  ];
  const shown = {}; KINDS.forEach(function (k) { shown[k[0]] = true; });

  function header(g) {
    const h = el("div", "ac-head");
    h.appendChild(el("div", "ac-head-tas", null)).appendChild(el("span", "ac-f", g.tas)).dataset.k = "tas";
    const row = el("div", "ac-head-row");
    [["eng", g.eng], ["type", g.type], ["wt", g.wt]].forEach(function (p) { const s = el("span", "ac-f", p[1]); s.dataset.k = p[0]; row.appendChild(s); });
    h.appendChild(row);
    h.addEventListener("click", peek);
    return h;
  }
  function cell(a, col) {
    const c = el("div", "ac-cell");
    const top = el("div", "ac-cell-top");
    const t = el("span", "ac-f ac-actas", a.tas || ""); t.dataset.k = "actas"; if (!a.tas) t.classList.add("is-empty");
    const cl = el("span", "ac-f", a.climb); cl.dataset.k = "climb";
    top.appendChild(t); top.appendChild(cl);
    const d = el("div", "ac-f ac-des", a.d); d.dataset.k = "des";
    const m = el("div", "ac-f ac-model", a.m); m.dataset.k = "model";
    c.appendChild(top); c.appendChild(d); c.appendChild(m);
    c.addEventListener("click", peek);
    return c;
  }
  function peek(e) {
    // show what is hidden in this box until it is clicked again
    const box = e.currentTarget;
    if (!box.querySelector(".ac-f.is-hidden")) return;
    box.classList.toggle("is-peek");
  }
  function group(g) {
    const frag = document.createDocumentFragment();
    frag.appendChild(header(g));
    g.ac.forEach(function (a) { frag.appendChild(cell(a, g)); });
    return frag;
  }

  function build() {
    host.innerHTML = "";
    DATA.columns.forEach(function (col) {
      const c = el("div", "ac-col");
      c.appendChild(group(col));
      if (col.then) { c.appendChild(el("div", "ac-split")); c.appendChild(group(col.then)); }
      host.appendChild(c);
    });
    applyShown();
  }
  function applyShown() {
    Array.prototype.forEach.call(host.querySelectorAll(".ac-f"), function (f) { f.classList.toggle("is-hidden", !shown[f.dataset.k]); });
    Array.prototype.forEach.call(host.querySelectorAll(".is-peek"), function (b) { b.classList.remove("is-peek"); });
  }

  function buildToggles() {
    if (!togHost) return;
    togHost.innerHTML = "";
    KINDS.forEach(function (k) {
      const lab = el("label", "toggle");
      const cb = el("input"); cb.type = "checkbox"; cb.checked = shown[k[0]];
      cb.addEventListener("change", function () { shown[k[0]] = cb.checked; applyShown(); });
      lab.appendChild(cb); lab.appendChild(document.createTextNode(" " + k[1]));
      togHost.appendChild(lab);
    });
    if (actHost) {
      actHost.innerHTML = "";
      const act = function (txt, on) {
        const b = el("button", "btn btn-ghost", txt); b.type = "button";
        b.addEventListener("click", function () { togHost.querySelectorAll("input").forEach(function (cb) { if (cb.checked !== on) { cb.checked = on; cb.dispatchEvent(new Event("change")); } }); });
        actHost.appendChild(b);
      };
      act("Show all", true); act("Hide all", false);
    }
  }

  function buildLegend() {
    if (!legendHost) return;
    legendHost.innerHTML = "";
    const L = DATA.legend;
    const ex = el("div", "ac-legend-example");
    const box = el("div", "ac-col ac-col-example");
    box.appendChild(header({ tas: "300", eng: "4", type: "TP", wt: "L" }));
    box.appendChild(cell({ d: "PA24", m: "Piper Comanche", climb: "1000-1200", tas: "120" }));
    ex.appendChild(box);
    const keys = el("dl", "ac-legend-keys");
    [["True airspeed", "the speed at the top of the column, or beside the climb rate when the aircraft differs from it"],
     ["Number of engines", "the first item on the header's second line"],
     ["Type", L.types.map(function (t) { return t[0] + " " + t[1]; }).join(" · ")],
     ["Weight class", L.weights.map(function (t) { return t[0] + " " + t[1]; }).join(" · ")],
     ["Climb rate", "feet per minute, the small figure above the designator"],
     ["Designator / model", "the large code and the name under it"]].forEach(function (p) {
      keys.appendChild(el("dt", null, p[0])); keys.appendChild(el("dd", null, p[1]));
    });
    ex.appendChild(keys);
    legendHost.appendChild(ex);
    const notes = el("ul", "ac-notes");
    L.notes.forEach(function (n) { notes.appendChild(el("li", null, n)); });
    legendHost.appendChild(notes);
    legendHost.appendChild(el("p", "ac-source", DATA.source));
  }

  build(); buildToggles(); buildLegend();
})();
