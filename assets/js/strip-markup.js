/*
 * Stripmarking editor for strips on the bay board.
 *
 * With a strip selected (it stays enlarged), the controller marks it the way
 * SLP05 / the Aero Center Phraseology and Stripmarking Guide describe. The
 * tools live on a rail down the left of the page (dimmed until a strip is
 * selected):
 *   - pen colour red (preplanned, reminders, coordination) or black (issued)
 *   - highlight text -> circle it (red or black; both may stack, the second
 *     colour drawn as the larger circle), line it through (black) or
 *     underline it (pen colour)
 *   - click in the route (space 25) -> a caret ^ between two route elements
 *     with an amendment written under it (which can itself be circled)
 *   - the printed cells 12, 14, 17, 18, 19, 20, 24 and the route are written in
 *     directly (pen colour); boxes for restrictions under 20 (a black bar
 *     separates them from the altitude), the coordinated altitude left of 24,
 *     the landing time under 22; box 18 can be split (assumed / actual)
 *   - RLS / SYD / V<: red = the preplanning reminder outside the left border
 *     of box 15, black = the actual entry inside box 15 with its text
 *   - space 26: C (comm change: time, fix or mileage) and 67 (block) entries
 *     with their value, plus free text in the pen colour
 *   - spaces 27-30: D-A, H-, VR, APCH, Z, V, free text. H- opens a text box
 *     beside it for the holding instructions (Space or Enter = next line);
 *     Z and V are written over the holding instructions.
 * Picking the same mark in the same colour again removes it. Marks live on
 * the strip object (strip.markup) so they survive drags and re-renders.
 *
 * Remote view (StripMarkup.setView("remote")): the red call reminders from
 * strip.remote are drawn at the top of space 27, earliest first. Clicking a
 * reminder's letters lines it through (call made); blank times (IC and PR on
 * departures, LD) are underlined boxes the Remote fills in; RP (report
 * passing, at the bottom) comes from an "RP … /HHMM" line typed in space 26. Departure strips get a
 * black box in space 18 for the actual departure time, and the page hook
 * onDepTime(strip, hhmm) recomputes the flight's estimates from it.
 *
 *   StripMarkup.attach()                 once per page (builds the rail)
 *   StripMarkup.activate(strip, slotEl)  when a board strip is selected
 *   StripMarkup.deactivate()
 *   StripMarkup.apply(stripEl, strip)    draw a strip's marks (board render)
 */
(function (root) {
  "use strict";

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  // where: "g" = spaces 27-30, "15" = box 15 (preplan outside / actual inside), "26" = space 26 entries
  const PALETTE = [
    { id: "T", label: "T", where: "15", top: true, title: "T outside the left border of box 15, at the very top (where the RLS / SYD / V< reminders go): a reminder to ask whether the pilot will accept a northeast departure with turns (KVKS departures joining V417). Not required, highly recommended; click the T on the strip to line it through once asked" },
    { id: "RLS", label: "RLS", where: "15", seed: "RLS ", title: "Released (rule): red = preplan reminder, black = actual entry in box 15" },
    { id: "SYD", label: "SYD", where: "15", seed: "SYD / ", title: "Visual separation approved: red = preplan reminder, black = actual entry in box 15" },
    { id: "V", label: "V<", where: "15", seed: "V< ", title: "Void time: red = preplan reminder, black = actual entry in box 15" },
    { id: "C", label: "C", where: "26", seed: "", title: "Communications change: the time, fix or mileage where the pilot contacts the next facility (space 26)" },
    { id: "EDC", label: "EDC", where: "edc", title: "Expect departure clearance: EDC with the time under it, in 14a (above the plus time when there is one)" },
    { id: "67", label: "67", where: "26", seed: "67 ", title: "Airspace blocked with sector 67 and the altitude (space 26)" },
    { id: "DA", label: "D-A", where: "g", editable: true, seed: "D-A", title: "Operating initials: yours and the receiver's" },
    { id: "H", label: "H-", where: "g", title: "Cleared to hold: holding instructions typed beside it (Space or Enter = next line)" },
    { id: "VR", label: "VR", where: "g", timed: true, title: "VOR approach (KGWO: VOR runway 5 circle to runway 23) with the time under it" },
    { id: "APCH", label: "APCH", where: "g", timed: true, title: "Cleared approach (KVKS / 0M8) with the time under it" },
    { id: "Z", label: "Z", where: "g", over: true, title: "Tower jurisdiction (written over the holding instructions)" },
    { id: "VV", label: "V", where: "g", over: true, title: "Cleared beyond the fix / for approach (written over the holding instructions)" },
    { id: "TXT", label: "abc", where: "g", editable: true, seed: "", title: "Free text" }
  ];
  function def(id) { return PALETTE.find(function (p) { return p.id === id; }); }

  const ui = { pen: "red", strip: null, slot: null, stripEl: null, rail: null, sel: null, seq: 0, view: "controller", hooks: {} };

  function model(strip) {
    if (!strip.markup) strip.markup = { ranges: [], carets: [], text26: "", items26: [], s15: [], misc: [], rtimes: {}, done: {}, rp: [], dep18: "", cells: {}, restr: "", coord: "", land: "", rls: "", split18: false, b18L: "", b18R: "", edc: null };
    const m = strip.markup;
    ["ranges", "carets", "items26", "s15", "misc", "rp"].forEach(function (k) { if (!m[k]) m[k] = []; });
    ["rtimes", "done", "cells"].forEach(function (k) { if (!m[k]) m[k] = {}; });
    ["text26", "dep18", "restr", "coord", "land", "b18L", "b18R"].forEach(function (k) { if (m[k] == null) m[k] = ""; });
    if (m.edc === undefined) m.edc = null;
    return m;
  }
  function isRemote(strip) { return ui.view === "remote" && !!(strip && strip.remote); }
  // The airport a departure strip (and only the departure strip of the flight) leaves from.
  function depAirport(strip) {
    if (!strip || strip.type !== "departure") return null;
    const sp = strip.spaces || {};
    const first = String(sp["19"] || "").trim().split(/\s+/)[0];
    if (/^[K0-9][A-Z0-9]{2,3}$/.test(first) && /P\d{4}/.test(String(sp["19"] || ""))) return first;
    if (String(sp["11"] || "").trim() === "KMLU") return "KMLU";
    return /^[K0-9][A-Z0-9]{2,3}$/.test(first) ? first : null;
  }
  const INSTR_APTS = { "0M8": 1, KVKS: 1 };                         // departure instructions are written in space 15
  const RLS_APTS = { KMLU: 1, KGWO: 1, KJAN: 1, KHKS: 1, KJVW: 1 };  // release rules go in a box at the bottom of box 15
  function selectedEl(stripEl) { return !!stripEl.closest(".sb-strip.is-selected"); }

  // ---- geometry helpers ------------------------------------------------
  function pct(stripEl, r) {
    const s = stripEl.getBoundingClientRect();
    return { left: (r.left - s.left) / s.width * 100, top: (r.top - s.top) / s.height * 100, width: r.width / s.width * 100, height: r.height / s.height * 100 };
  }
  function cellOf(stripEl, f) { return stripEl.querySelector('.fps-cell[data-f="' + f + '"]'); }
  function targetEl(stripEl, target) {
    if (target.cell) return cellOf(stripEl, target.cell);
    if (target.caret) return stripEl.querySelector('.sm-caret-text[data-id="' + target.caret + '"]');
    if (target.mk) return stripEl.querySelector('[data-mk="' + target.mk + '"]');
    return null;
  }
  function textNodesIn(rootEl) {
    const out = [];
    (function walk(n) { if (n.nodeType === 3) { out.push(n); return; } for (let i = 0; i < n.childNodes.length; i++) walk(n.childNodes[i]); })(rootEl);
    return out;
  }
  function pointAt(rootEl, off, atStart) {
    const nodes = textNodesIn(rootEl);
    let acc = 0;
    for (let i = 0; i < nodes.length; i++) {
      const len = nodes[i].nodeValue.length;
      // a range start at the very end of a node is placed at the start of the next one, so its
      // rects belong to the text it covers (not a zero-width rect in the previous element)
      if (off < acc + len || (off === acc + len && (!atStart || i === nodes.length - 1))) return { node: nodes[i], offset: off - acc };
      acc += len;
    }
    const last = nodes[nodes.length - 1];
    return last ? { node: last, offset: last.nodeValue.length } : null;
  }
  function rangeFor(rootEl, start, end) {
    const a = pointAt(rootEl, start, true), b = pointAt(rootEl, end);
    if (!a || !b) return null;
    const r = document.createRange();
    r.setStart(a.node, a.offset); r.setEnd(b.node, b.offset);
    return r;
  }
  function fullText(rootEl) { return textNodesIn(rootEl).map(function (n) { return n.nodeValue; }).join(""); }
  function sameTarget(a, b) { return (a.cell || "") === (b.cell || "") && (a.caret || "") === (b.caret || "") && (a.mk || "") === (b.mk || ""); }

  // ---- editable helpers ------------------------------------------------------
  function editable(cls, text, onInput, opts) {
    opts = opts || {};
    const d = el("div", cls + " sm-edit");
    d.contentEditable = "true"; d.spellcheck = false;
    if (opts.key) d.dataset.mk = opts.key;
    if (opts.html) { d.innerHTML = text || ""; d.dataset.html = "1"; } else d.textContent = text || "";
    if (opts.placeholder) d.dataset.ph = opts.placeholder;
    if (opts.lines) { // Space or Enter starts a new line (holding instructions)
      d.addEventListener("keydown", function (e) {
        if (e.key !== " " && e.key !== "Enter") return;
        e.preventDefault();
        const sel = window.getSelection(); if (!sel.rangeCount) return;
        const r = sel.getRangeAt(0); r.deleteContents();
        const nl = document.createTextNode("\n"); r.insertNode(nl);
        r.setStartAfter(nl); r.collapse(true); sel.removeAllRanges(); sel.addRange(r);
        onInput(d);
      });
    }
    d.addEventListener("input", function () { onInput(d); });
    d.addEventListener("mousedown", function (e) { e.stopPropagation(); });
    return d;
  }
  function focusEnd(node) {
    if (!node) return;
    node.focus();
    const r = document.createRange(); r.selectNodeContents(node); r.collapse(false);
    const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }

  // ---- apply -------------------------------------------------------------------
  function apply(stripEl, strip) {
    let layer = stripEl.querySelector(".sm-layer");
    if (layer) layer.remove();
    layer = el("div", "sm-layer");
    stripEl.appendChild(layer);
    stripEl.classList.add("sm-marked");
    const m = model(strip);

    // printed cells the controller writes in (typed in the pen colour): 12, 14,
    // 17 (fix estimates), 18 (progression; split for departures), 19 (an amended
    // next fix such as DINKY), 20 (altitude changes), 24 (requested altitude), 25 (route)
    applyCells(stripEl, strip, m);
    // restrictions under the altitude (with the black bar once there are any),
    // the coordinated-altitude box left of 24, the landing time under 22
    const b13 = editable("sm-b13", m.b13 || "", function (d) { m.b13 = sanitize(d.innerHTML); }, { html: true, placeholder: "", key: "b13" });
    b13.addEventListener("beforeinput", penInput); b13.title = "Space 13: revised time over the previous fix (KMLU: the assumed departure time in red)";
    layer.appendChild(b13);
    if (!INSTR_APTS[depAirport(strip)]) { // no center estimate on a 0M8 / KVKS departure strip: space 15 holds the departure instructions
      const b15 = editable("sm-15b", m.b15 || "", function (d) { m.b15 = sanitize(d.innerHTML); }, { html: true, placeholder: "", key: "b15" });
      b15.addEventListener("beforeinput", penInput); b15.title = "Beside the center estimate: a revised estimate (cross out the old minutes, or all four digits across an hour, and recoordinate)";
      layer.appendChild(b15);
    }
    const restr = editable("sm-restr", m.restr, function (d) { m.restr = sanitize(d.innerHTML); bar.classList.toggle("is-on", !!d.textContent.trim()); }, { html: true, placeholder: "restrictions", key: "restr" });
    restr.addEventListener("beforeinput", penInput);
    restr.title = "Restrictions, one per line (Enter = next line)";
    layer.appendChild(restr);
    const bar = el("div", "sm-bar20" + (String(m.restr || "").replace(/<[^>]*>/g, "").trim() ? " is-on" : ""));
    layer.appendChild(bar);
    const coord = editable("sm-coord", m.coord, function (d) { m.coord = sanitize(d.innerHTML); }, { html: true, placeholder: "", key: "coord" });
    coord.addEventListener("beforeinput", penInput);
    coord.title = "Altitude coordinated with the next sector (red; circled once approved)";
    layer.appendChild(coord);
    const land = editable("sm-land", m.land, function (d) { m.land = sanitize(d.innerHTML); }, { html: true, placeholder: "", key: "land" });
    land.addEventListener("beforeinput", penInput);
    land.title = "Landing time (KGWO / KVKS arrivals)";
    layer.appendChild(land);
    // split box 18 (departures): assumed departure time left, actual right
    if (m.split18 && !(isRemote(strip) && strip.remote.dep)) {
      const L = editable("sm-18L", m.b18L, function (d) { m.b18L = sanitize(d.innerHTML); }, { html: true, placeholder: "", key: "b18L" });
      L.addEventListener("beforeinput", penInput); L.title = "Assumed departure time (red)";
      const R = editable("sm-18R", m.b18R, function (d) { m.b18R = sanitize(d.innerHTML); }, { html: true, placeholder: "", key: "b18R" });
      R.addEventListener("beforeinput", penInput); R.title = "Actual departure time (black)";
      layer.appendChild(L); layer.appendChild(el("div", "sm-18slash", "/")); layer.appendChild(R);
    }
    // EDC with its time under it: in 14a, or above the plus time when there is one
    if (m.edc) {
      const hasPlus = !!((strip.spaces || {})["14a"] || "").trim() || !!((m.cells["14a"] || "").replace(/<[^>]*>/g, "").trim());
      const e = el("div", "sm-edc sm-blk" + (hasPlus ? " above-plus" : ""));
      e.appendChild(el("div", "sm-edc-k", "EDC"));
      const t = editable("sm-edc-t", m.edc.time, function (d) { m.edc.time = sanitize(d.innerHTML); }, { html: true, placeholder: "", key: "edc" });
      t.addEventListener("beforeinput", penInput);
      t.title = "EDC time; cross it out and write the new one under it if it is recoordinated (shift-click EDC to remove)";
      e.appendChild(t);
      e.addEventListener("click", function (ev) { if (ev.shiftKey) { ev.stopPropagation(); m.edc = null; apply(stripEl, strip); } });
      layer.appendChild(e);
    }
    const in15 = el("div", "sm-in15");
    const pre15 = el("div", "sm-pre15");
    m.s15.forEach(function (it) {
      const d = def(it.id);
      if (d.top) { // the T outside box 15's left border, at the top
        const t = el("div", "sm-t15 sm-" + it.color, d.label); t.dataset.mk = "t15";
        t.title = d.title + " — click to strike it through once the pilot has been asked (again to undo); shift-click to remove";
        t.addEventListener("click", function (e) {
          e.stopPropagation();
          if (e.shiftKey) { toggleItem(strip, stripEl, it.id, it.color); return; }
          // a plain click lines the T through (the question has been asked); highlight + Strike does the same
          const i = m.ranges.findIndex(function (x) { return x.kind === "strike" && x.target.mk === "t15"; });
          if (i >= 0) m.ranges.splice(i, 1); else m.ranges.push({ target: { mk: "t15" }, start: 0, end: 1, kind: "strike", seq: ++ui.seq });
          layoutMarks(stripEl, strip);
        });
        layer.appendChild(t); return;
      }
      if (it.color === "red") { const r = el("div", "sm-pre sm-red", d.label); r.title = d.title + " — click to remove"; r.addEventListener("click", function (e) { e.stopPropagation(); toggleItem(strip, stripEl, it.id, "red"); }); pre15.appendChild(r); }
      else { const b = editable("sm-actual sm-blk", it.text, function (x) { it.text = x.textContent; }); b.dataset.iid = it.iid; in15.appendChild(b); }
    });
    layer.appendChild(in15); layer.appendChild(pre15);
    // release rules (RLS 2 MIN <…, SYD/…) at the bottom of box 15 on KMLU, JAN APCH and KGWO departure strips
    if (RLS_APTS[depAirport(strip)]) {
      const rls = editable("sm-rls", m.rls || "", function (d) { m.rls = sanitize(d.innerHTML); }, { html: true, placeholder: "release rules", key: "rls" });
      rls.addEventListener("beforeinput", penInput);
      rls.title = "Release rules for this departure (RLS 2 MIN <…, SYD/…), typed in the pen colour";
      layer.appendChild(rls); layer.classList.add("has-rls");
    }

    // space 26: entries (C, 67) then free text
    const box26 = el("div", "sm-box26");
    m.items26.forEach(function (it) {
      if (it.id === "C") {
        const row = el("div", "sm-item26 sm-item26-c sm-" + it.color);
        const big = el("span", "sm-c-big", "C"); big.title = def(it.id).title + " (shift-click to remove)";
        big.addEventListener("click", function (e) { if (e.shiftKey) { e.preventDefault(); e.stopPropagation(); toggleItem(strip, stripEl, it.id, it.color); } });
        const val = editable("sm-c-val", String(it.text || "").replace(/^C\s*/, ""), function (x) { it.text = x.textContent; });
        val.dataset.iid = it.iid;
        row.appendChild(big); row.appendChild(val);
        box26.appendChild(row);
        return;
      }
      const b = editable("sm-item26 sm-" + it.color, it.text, function (x) { it.text = x.textContent; });
      b.dataset.iid = it.iid; b.title = def(it.id).title + " (shift-click to remove)";
      b.addEventListener("click", function (e) { if (e.shiftKey) { e.preventDefault(); toggleItem(strip, stripEl, it.id, it.color); } });
      box26.appendChild(b);
    });
    const t26 = editable("sm-text26", m.text26, function (d) { m.text26 = sanitize(d.innerHTML); syncAutoRP(strip, stripEl, m); }, { html: true });
    t26.addEventListener("beforeinput", penInput);
    t26.title = "Space 26: remarks, reports, reminders (typed in the pen colour)";
    box26.appendChild(t26);
    layer.appendChild(box26);

    // spaces 27-30 (Remote view: the red call reminders come first)
    const g = el("div", "sm-gbox");
    if (isRemote(strip)) {
      g.appendChild(renderReminders(strip, stripEl, m));
      layer.appendChild(el("div", "sm-xout")); // black X through 27-30 once no reminder is left (set below)
      if (strip.remote.dep) {
        const d = editable("sm-dep18 sm-blk" + (strip.remote.depBox === "12" ? " sm-dep12" : ""), m.dep18, function (x) { m.dep18 = x.textContent.replace(/[^\d]/g, "").slice(0, 4); if (ui.hooks.onDepTime) ui.hooks.onDepTime(strip, m.dep18, stripEl); }, { placeholder: "    " });
        d.title = (strip.remote.depBox === "12" ? "Actual departure time under the P-time (KMLU: space 18 is for the STUEE progression)" : "Actual departure time (2 minutes after the clearance)") + ": the fix estimates, IC and PR times follow from it";
        layer.appendChild(d);
      }
    }
    const overs = m.misc.filter(function (c) { return def(c.id).over; });
    const hasH = m.misc.some(function (c) { return c.id === "H"; });
    m.misc.forEach(function (chip) { if (!(def(chip.id).over && hasH)) g.appendChild(renderChip(chip, strip, stripEl)); });
    layer.appendChild(g);
    updateXout(strip, stripEl, m);
    if (hasH) overs.forEach(function (chip, i) { // written over the holding instructions
      const o = el("div", "sm-over sm-" + chip.color, def(chip.id).label);
      o.style.marginLeft = (i * 2.5) + "cqw"; o.title = def(chip.id).title + " — click to remove";
      o.addEventListener("click", function (e) { e.stopPropagation(); toggleItem(strip, stripEl, chip.id, chip.color); });
      layer.appendChild(o);
    });

    // carets and their amendment boxes
    m.carets.forEach(function (c) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "sm-caret sm-" + c.color); svg.setAttribute("viewBox", "0 0 10 20"); svg.dataset.id = c.id;
      const pl = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      pl.setAttribute("points", "1.2,19.5 5,0.8 8.8,19.5"); svg.appendChild(pl);
      svg.addEventListener("click", function (e) { e.stopPropagation(); if (confirm("Remove this route amendment?")) removeCaret(strip, stripEl, c.id); });
      layer.appendChild(svg);
      const box = editable("sm-caret-text sm-" + c.color, c.text, function (d) { c.text = d.textContent; layoutMarks(stripEl, strip); }, { placeholder: "amend" });
      box.dataset.id = c.id;
      layer.appendChild(box);
    });
    layoutMarks(stripEl, strip);
  }

  // Rect-based overlays (circles, strikes, underlines, caret positions).
  function layoutMarks(stripEl, strip) {
    const layer = stripEl.querySelector(".sm-layer"); if (!layer) return;
    const m = model(strip);
    Array.prototype.forEach.call(layer.querySelectorAll(".sm-circ, .sm-strike, .sm-ul, .sm-x"), function (n) { n.remove(); });
    const s = stripEl.getBoundingClientRect();
    if (!s.width) return;
    const aspect = s.width / s.height;
    const isCircle = function (k) { return k.indexOf("circ-") === 0; };
    Array.prototype.forEach.call(stripEl.querySelectorAll(".sm-t15.is-struck"), function (n) { n.classList.remove("is-struck"); });
    m.ranges.forEach(function (rk) {
      const tel = targetEl(stripEl, rk.target); if (!tel) return;
      if (rk.target.mk === "t15" && rk.kind === "strike") { tel.classList.add("is-struck"); return; } // the T: lined through by the font's own strike position
      const rg = rangeFor(tel, rk.start, rk.end); if (!rg) return;
      const rects = rg.getClientRects();
      if (!rects.length) return;
      let padIdx = 0;
      if (isCircle(rk.kind)) m.ranges.forEach(function (o) { if (o !== rk && isCircle(o.kind) && o.seq < rk.seq && sameTarget(o.target, rk.target) && o.start < rk.end && rk.start < o.end) padIdx++; });
      // one box per visual line: rects that overlap vertically are merged
      const lines = [];
      Array.prototype.forEach.call(rects, function (r) {
        if (!r.width || !r.height) return; // boundary rects carry no text
        const hit = lines.find(function (L) { return r.top < L.bottom && L.top < r.bottom; });
        if (hit) { hit.left = Math.min(hit.left, r.left); hit.top = Math.min(hit.top, r.top); hit.right = Math.max(hit.right, r.right); hit.bottom = Math.max(hit.bottom, r.bottom); }
        else lines.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });
      });
      lines.forEach(function (L) {
        const p = pct(stripEl, { left: L.left, top: L.top, width: L.right - L.left, height: L.bottom - L.top });
        if (rk.kind === "strike") {
          // through the middle of the capitals/digits (they sit in the upper part of the line box)
          const d = el("div", "sm-strike");
          d.style.left = p.left + "%"; d.style.width = p.width + "%"; d.style.top = (p.top + p.height * 0.42) + "%";
          layer.appendChild(d);
          return;
        }
        if (rk.kind === "x") { // an X through the text
          const d = el("div", "sm-x");
          d.style.left = p.left + "%"; d.style.top = p.top + "%"; d.style.width = p.width + "%"; d.style.height = p.height + "%";
          layer.appendChild(d);
          return;
        }
        if (rk.kind.indexOf("ul-") === 0) {
          const d = el("div", "sm-ul sm-" + rk.kind.slice(3));
          d.style.left = p.left + "%"; d.style.width = p.width + "%"; d.style.top = (p.top + p.height * 0.86) + "%";
          layer.appendChild(d);
          return;
        }
        const padX = 0.35 + padIdx * 0.5, padY = padX * aspect * 0.55;
        const d = el("div", "sm-circ sm-" + rk.kind.replace("circ-", ""));
        d.style.left = (p.left - padX) + "%"; d.style.top = (p.top - padY) + "%";
        d.style.width = (p.width + 2 * padX) + "%"; d.style.height = (p.height + 2 * padY) + "%";
        layer.appendChild(d);
      });
    });
    m.carets.forEach(function (c) {
      const tel = targetEl(stripEl, { cell: "25" }); if (!tel) return;
      const rg = rangeFor(tel, c.offset, c.offset); if (!rg) return;
      const r = rg.getClientRects()[0];
      const svg = layer.querySelector('.sm-caret[data-id="' + c.id + '"]');
      const box = layer.querySelector('.sm-caret-text[data-id="' + c.id + '"]');
      if (!r || !svg || !box) return;
      const p = pct(stripEl, r);
      const w = 2.6, h = w * aspect * 0.95 * 2;
      svg.style.left = (p.left - w / 2) + "%"; svg.style.top = (p.top - 0.6) + "%"; svg.style.width = w + "%"; svg.style.height = h + "%";
      box.style.left = (p.left - 6) + "%"; box.style.top = (p.top + h - 1) + "%"; box.style.width = "12%";
    });
  }

  // ---- space 26 free text: runs of colour ---------------------------------------
  function runsOf(node, colour, out) {
    Array.prototype.forEach.call(node.childNodes, function (n) {
      if (n.nodeType === 3) { if (n.nodeValue) out.push({ c: colour, t: n.nodeValue }); return; }
      if (n.tagName === "BR") { out.push({ br: true }); return; }
      if (n.tagName === "DIV") { out.push({ br: true }); runsOf(n, colour, out); return; }
      const c = /sm-red/.test(n.className) ? "red" : /sm-blk/.test(n.className) ? "blk" : colour;
      if (/\bsm-g\b/.test(n.className) && GLYPHS[n.dataset.g]) { out.push({ c: c, g: n.dataset.g }); return; }
      runsOf(n, c, out);
    });
    return out;
  }
  function sanitize(html) {
    const tmp = el("div"); tmp.innerHTML = html;
    const runs = runsOf(tmp, "blk", []);
    const out = [];
    runs.forEach(function (r) {
      if (r.br) { out.push("<br>"); return; }
      const last = out[out.length - 1];
      if (last && last !== "<br>" && !last.g && !r.g && last.c === r.c) { last.t += r.t; return; }
      out.push(r.g ? { c: r.c, g: r.g } : { c: r.c, t: r.t });
    });
    return out.map(function (r) {
      if (r === "<br>") return r;
      if (r.g) return glyphEl(r.g, r.c).outerHTML;
      return '<span class="sm-' + r.c + '">' + escapeHtml(r.t) + "</span>";
    }).join("");
  }
  function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  // Marks from the AERO Center commonly used stripmarking list that no font has: drawn, in the pen colour.
  // Each is an inline glyph span (non-editable, deleted as one character) that sanitize() keeps.
  // Drawn inline as SVG (a 20x20 grid) so every copy is the same size whatever the pixel it lands on.
  const GLYPHS = {
    up: { name: "climb and maintain", fallback: "↑", d: ["M10 18V2", "M4 8l6-6 6 6"] },
    dn: { name: "descend and maintain", fallback: "↓", d: ["M10 2v16", "M4 12l6 6 6-6"] },
    rt: { name: "via depart", fallback: "→", d: ["M2 10h16", "M12 4l6 6-6 6"] },
    aoa: { name: "at or above", fallback: "↑", d: ["M10 18V2", "M4 8l6-6 6 6", "M2 13h16"] },
    aob: { name: "at or below", fallback: "↓", d: ["M10 2v16", "M4 12l6 6 6-6", "M2 7h16"] },
    join: { name: "joining", fallback: "⟋", d: ["M2 4h16", "M2 11h16", "M2 18l16-7"] },
    eca: { name: "enter controlled airspace", fallback: "△", d: ["M10 2l9 16H1z", "M4 4l7 7", "M7.5 11.5H11V8"] }
  };
  const SVG_NS = "http://www.w3.org/2000/svg";
  function glyphEl(g, colour) {
    const e = el("span", (colour ? "sm-" + colour + " " : "") + "sm-g");
    e.dataset.g = g; e.contentEditable = "false"; e.title = GLYPHS[g] ? GLYPHS[g].name : "";
    const svg = document.createElementNS(SVG_NS, "svg"); svg.setAttribute("viewBox", "0 0 20 20"); svg.setAttribute("aria-hidden", "true");
    (GLYPHS[g] ? GLYPHS[g].d : []).forEach(function (d) { const p = document.createElementNS(SVG_NS, "path"); p.setAttribute("d", d); svg.appendChild(p); });
    e.appendChild(svg);
    return e;
  }
  // Typed text goes into a span of the current pen colour, never nested in the other colour.
  function penInput(e) {
    if (e.inputType !== "insertText" && e.inputType !== "insertParagraph") return;
    const sel = window.getSelection(); if (!sel.rangeCount) return;
    e.preventDefault();
    if (e.inputType === "insertParagraph") insertAtCursor(e.target, null);
    else insertAtCursor(e.target, String(e.data).replace(/0/g, "Ø"));
  }
  // Insert text (or a line break when text is null, or a drawn glyph) at the caret of an editable box, in the pen colour.
  function insertAtCursor(box, text, glyph) {
    const sel = window.getSelection(); if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0); range.deleteContents();
    let node;
    if (text == null && !glyph) node = el("br");
    else {
      const tn = range.startContainer.nodeType === 3 ? range.startContainer : null;
      const parentSpan = tn ? tn.parentNode : null;
      const inSpan = parentSpan && parentSpan.classList && (parentSpan.classList.contains("sm-red") || parentSpan.classList.contains("sm-blk"));
      if (inSpan && !glyph && parentSpan.classList.contains("sm-" + ui.pen)) node = document.createTextNode(text);
      else {
        node = glyph ? glyphEl(glyph, ui.pen) : el("span", "sm-" + ui.pen, text);
        if (inSpan) {
          const off = range.startOffset;
          if (off >= tn.nodeValue.length) range.setStartAfter(parentSpan);
          else if (off <= 0) range.setStartBefore(parentSpan);
          else { const rest = tn.splitText(off); const tail = el("span", parentSpan.className); tail.appendChild(rest); parentSpan.parentNode.insertBefore(tail, parentSpan.nextSibling); range.setStartAfter(parentSpan); }
          range.collapse(true);
        }
      }
    }
    range.insertNode(node);
    range.setStartAfter(node); range.collapse(true);
    sel.removeAllRanges(); sel.addRange(range);
    box.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // ---- Remote call reminders (space 27) ------------------------------------------------
  function renderReminders(strip, stripEl, m) {
    const box = el("div", "sm-rmd");
    const rows = strip.remote.reminders.map(function (x) { return { id: x.id, k: x.k, t: x.t, blank: x.t == null }; })
      .concat(m.rp.map(function (x) { return { id: x.iid, k: "RP", t: x.t || null, blank: !x.t, rp: x }; }));
    rows.forEach(function (row) {
      const d = el("div", "sm-rmd-row sm-red" + (m.done[row.id] ? " is-done" : ""));
      d.dataset.rid = row.id;
      const k = el("span", "sm-rmd-k", row.k);
      k.title = (row.rp ? "Report passing (from the RP line in space 26) — click when called (lines it through)" : "Click when the call is made (lines it through)");
      k.addEventListener("click", function (e) {
        if (!selectedEl(stripEl)) return; // a click on an unselected strip just selects it
        e.stopPropagation();
        m.done[row.id] = !m.done[row.id];
        d.classList.toggle("is-done", !!m.done[row.id]);
        updateXout(strip, stripEl, m);
      });
      d.appendChild(k);
      if (row.blank) {
        const val = row.rp ? row.rp.t : (m.rtimes[row.id] || "");
        const t = editable("sm-rmd-t sm-rmd-blank", val, function (x) { const v = x.textContent; if (row.rp) row.rp.t = v; else m.rtimes[row.id] = v; }, { placeholder: "" });
        t.dataset.rid = row.id;
        t.title = row.rp ? "Minutes the aircraft is estimated to pass the point (card miles per minute)" : "Minutes — filled in during the problem";
        d.appendChild(t);
      } else d.appendChild(el("span", "sm-rmd-t", row.t));
      box.appendChild(d);
    });
    return box;
  }
  // Reports written in space 26 on the Remote's strip ("RP 30 SW MHZ/1231") become
  // RP reminders in space 27 with the minutes of the expected report.
  function autoRPs(text26) {
    const tmp = el("div"); tmp.innerHTML = String(text26 || "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/div>/gi, "\n");
    const out = [];
    (tmp.textContent || "").replace(/Ø/g, "0").split(/\n/).forEach(function (line) {
      const mt = line.match(/^\s*RP\b[^\/]*\/\s*(\d{4})/i);
      if (mt) out.push({ iid: "rpa" + out.length, t: mt[1].slice(2), auto: true });
    });
    return out;
  }
  function syncAutoRP(strip, stripEl, m) {
    if (!isRemote(strip)) return;
    const next = autoRPs(m.text26);
    if (JSON.stringify(next) === JSON.stringify(m.rp)) return;
    m.rp = next;
    const old = stripEl && stripEl.querySelector(".sm-rmd");
    if (old) old.replaceWith(renderReminders(strip, stripEl, m));
    updateXout(strip, stripEl, m);
  }
  // The Remote's strip is done when every reminder in 27 is lined through (or
  // there was none): a black X through 27-30. A report the controller asks for
  // later (an RP line in 26) brings the strip back until that RP is crossed out.
  function updateXout(strip, stripEl, m) {
    const x = stripEl && stripEl.querySelector(".sm-xout"); if (!x) return;
    if (!isRemote(strip)) { x.classList.remove("is-on"); return; }
    const rows = strip.remote.reminders.map(function (r) { return r.id; }).concat(m.rp.map(function (r) { return r.iid; }));
    x.classList.toggle("is-on", rows.every(function (id) { return !!m.done[id]; }));
  }
  // Write a computed time into a reminder blank (and its model) without redrawing the strip.
  function setReminderTime(strip, stripEl, key, value) {
    const m = model(strip);
    strip.remote.reminders.forEach(function (x) {
      if (x.k !== key || x.t != null) return;
      m.rtimes[x.id] = value;
      const node = stripEl && stripEl.querySelector('.sm-rmd-t[data-rid="' + x.id + '"]');
      if (node && node.textContent !== value) node.textContent = value;
    });
  }

  // ---- chips (27-30) ---------------------------------------------------------------
  function renderChip(chip, strip, stripEl) {
    const d = def(chip.id);
    const c = el("div", "sm-chip sm-" + chip.color);
    c.dataset.cid = chip.cid;
    if (d.editable) c.appendChild(editable("sm-chip-text", chip.text, function (x) { chip.text = x.textContent; }));
    else c.appendChild(el("span", "sm-chip-text", d.label));
    if (chip.id === "H") {
      const h = editable("sm-hold-text", chip.hold, function (x) { chip.hold = x.textContent; }, { lines: true, placeholder: "SW\n256\nLT\n1243" });
      c.appendChild(h);
    }
    if (d.timed) { // VR / APCH: the 4-digit time directly under the label
      c.classList.add("sm-chip-col");
      const t = editable("sm-chip-time", chip.time || "", function (x) { chip.time = x.textContent.replace(/[^\dØ]/g, "").slice(0, 4); }, { placeholder: "" });
      t.title = "Time (HHMM)";
      c.appendChild(t);
    }
    c.title = d.title + " — shift-click to remove";
    c.addEventListener("click", function (e) { e.stopPropagation(); if (e.shiftKey) toggleItem(strip, stripEl, chip.id, chip.color); });
    return c;
  }

  // Add the mark for `id` in the pen colour, or remove it if that exact mark
  // (same id, same colour) is already on the strip.
  function toggleItem(strip, stripEl, id, color) {
    const d = def(id); if (!d) return;
    const m = model(strip);
    color = color || ui.pen;
    if (d.where === "edc") { // EDC: on or off, black, with a time box under it
      m.edc = m.edc ? null : { time: "" };
      apply(stripEl, strip);
      const t = stripEl.querySelector(".sm-edc-t"); if (t) focusEnd(t);
      return;
    }
    const list = d.where === "15" ? m.s15 : d.where === "26" ? m.items26 : m.misc;
    const i = list.findIndex(function (x) { return x.id === id && x.color === color; });
    if (i >= 0) {
      list.splice(i, 1);
      if (d.top) m.ranges = m.ranges.filter(function (x) { return x.target.mk !== "t15"; }); // a removed T takes its strike with it
      apply(stripEl, strip); return;
    }
    const item = { iid: "i" + (++ui.seq) + Date.now().toString(36), cid: "c" + ui.seq, id: id, color: color };
    if (d.where === "15") { if (color === "blk") item.text = d.seed; }
    else if (d.where === "26") item.text = d.seed;
    else { if (d.editable) item.text = d.seed; if (id === "H") item.hold = ""; }
    list.push(item);
    apply(stripEl, strip);
    // put the caret where the value goes
    let target = null;
    if (d.where === "15" && color === "blk") target = stripEl.querySelector('.sm-actual[data-iid="' + item.iid + '"]');
    else if (d.where === "26") target = stripEl.querySelector('.sm-item26[data-iid="' + item.iid + '"], .sm-c-val[data-iid="' + item.iid + '"]');
    else if (id === "H") target = stripEl.querySelector('.sm-chip[data-cid="' + item.cid + '"] .sm-hold-text');
    else if (d.editable) target = stripEl.querySelector('.sm-chip[data-cid="' + item.cid + '"] .sm-chip-text');
    else if (d.timed) target = stripEl.querySelector('.sm-chip[data-cid="' + item.cid + '"] .sm-chip-time');
    if (target) focusEnd(target);
  }

  // ---- text-range marks -------------------------------------------------------------
  function captureSelection() {
    const sel = window.getSelection();
    if (!ui.stripEl || !sel || !sel.rangeCount) { ui.sel = null; return; }
    const r0 = sel.getRangeAt(0);
    const a = r0.startContainer;
    const ea = a.nodeType === 3 ? a.parentNode : a;
    const cell = ea.closest ? ea.closest(".fps-cell, .sm-caret-text, [data-mk]") : null;
    if (!cell || !ui.stripEl.contains(cell)) { ui.sel = null; return; }
    if (!textNodesIn(cell).length) { ui.sel = null; return; }
    // clamp the selection to this box (a double-click selection often ends at the start of the next node)
    const box = document.createRange(); box.selectNodeContents(cell);
    const r = r0.cloneRange();
    if (r.compareBoundaryPoints(Range.START_TO_START, box) < 0) r.setStart(box.startContainer, box.startOffset);
    if (r.compareBoundaryPoints(Range.END_TO_END, box) > 0) r.setEnd(box.endContainer, box.endOffset);
    const pre = document.createRange(); pre.selectNodeContents(cell); pre.setEnd(r.startContainer, r.startOffset);
    const start = pre.toString().length;
    let end = start + r.toString().length;
    const txt = fullText(cell);
    while (end > start && /\s/.test(txt[end - 1] || "")) end--; // a double-click may take the trailing blank
    const target = cell.classList.contains("sm-caret-text") ? { caret: cell.dataset.id } : cell.dataset.mk ? { mk: cell.dataset.mk } : { cell: cell.dataset.f };
    ui.sel = { target: target, start: start, end: end, collapsed: start === end };
  }
  function applySelection(kind) {
    captureSelection();
    const s = ui.sel;
    if (!ui.strip || !s || s.collapsed) return;
    const m = model(ui.strip);
    const existing = m.ranges.findIndex(function (x) { return x.kind === kind && sameTarget(x.target, s.target) && x.start === s.start && x.end === s.end; });
    if (existing >= 0) m.ranges.splice(existing, 1);
    else m.ranges.push({ target: s.target, start: s.start, end: s.end, kind: kind, seq: ++ui.seq });
    layoutMarks(ui.stripEl, ui.strip);
  }
  function insertCaret() {
    captureSelection();
    const s = ui.sel;
    if (!ui.strip || !s || !s.target.cell || s.target.cell !== "25") { alert("Click a spot in the route (space 25) first — the ^ goes between the two route elements around it."); return; }
    const tel = targetEl(ui.stripEl, { cell: "25" }); if (!tel) return;
    const text = fullText(tel);
    let off = s.start;
    let left = off; while (left > 0 && text[left - 1] !== " ") left--;
    let right = off; while (right < text.length && text[right] !== " ") right++;
    off = (off - left <= right - off) ? Math.max(0, left) : Math.min(text.length, right);
    if (off === 0 || off === text.length) { alert("The ^ must sit between two route elements."); return; }
    const m = model(ui.strip);
    const at = m.carets.find(function (c) { return c.offset === off; });
    if (at) { removeCaret(ui.strip, ui.stripEl, at.id); return; } // a toggle: the same spot again removes the ^
    const c = { id: "k" + (++ui.seq) + Date.now().toString(36), offset: off, color: ui.pen, text: "" };
    m.carets.push(c);
    apply(ui.stripEl, ui.strip);
    const box = ui.stripEl.querySelector('.sm-caret-text[data-id="' + c.id + '"]'); if (box) box.focus();
  }

  // ---- printed cells the controller writes in ------------------------------------
  // 4: a changed equipment suffix (INOP DME: B→T, A→U, D→X); 15: the center estimate (written on a
  // departure's other strips); 20a: RL / RR altitudes; 21: an amended next fix under the printed one;
  // 22: the pilot's next fix estimate (the printed one is the Remote's unless the next fix is an airport)
  const EDIT_CELLS = ["4", "12", "14", "15", "17", "18", "19", "20", "20a", "21", "22", "24", "25"];
  function applyCells(stripEl, strip, m) {
    EDIT_CELLS.forEach(function (f) {
      const c = cellOf(stripEl, f); if (!c) return;
      if (m.cells[f] != null) c.innerHTML = m.cells[f];
      const off = f === "18" && (m.split18 || (isRemote(strip) && strip.remote.dep)); // the split boxes / the Remote's departure box take over 18
      c.classList.toggle("sm-cell-edit", !off);
      if (f === "15") c.classList.toggle("sm-15-instr", !!INSTR_APTS[depAirport(strip)]); // 0M8 / KVKS departure instructions: small, wrapped
      if (c.dataset.smBound) return;
      c.dataset.smBound = "1"; c.dataset.html = "1"; // typed as pen-colour runs; drawn glyphs allowed
      c.addEventListener("beforeinput", penInput);
      c.addEventListener("input", function () { m.cells[f] = sanitize(c.innerHTML); layoutMarks(stripEl, strip); });
    });
    setCellsEditable(stripEl, selectedEl(stripEl));
  }
  function setCellsEditable(stripEl, on) {
    if (!stripEl) return;
    Array.prototype.forEach.call(stripEl.querySelectorAll(".fps-cell.sm-cell-edit"), function (c) {
      if (on) { c.contentEditable = "true"; c.spellcheck = false; } else c.removeAttribute("contenteditable");
    });
  }
  // Write a value into one of those cells from code (the Remote's recomputed fix estimates go in 17).
  function setCell(strip, stripEl, f, text) {
    const m = model(strip);
    m.cells[f] = text ? '<span class="sm-blk">' + escapeHtml(text) + "</span>" : null;
    const c = stripEl && cellOf(stripEl, f);
    if (c) { if (m.cells[f] != null) c.innerHTML = m.cells[f]; else c.textContent = (strip.spaces || {})[f] ? String(strip.spaces[f]).replace(/0/g, "Ø") : ""; }
  }
  function removeCaret(strip, stripEl, id) {
    const m = model(strip);
    m.carets = m.carets.filter(function (c) { return c.id !== id; });
    m.ranges = m.ranges.filter(function (r) { return r.target.caret !== id; });
    apply(stripEl, strip);
  }

  // ---- the rail -----------------------------------------------------------------------
  function buildRail() {
    const rail = el("div", "sm-rail sm-ui is-idle");
    rail.addEventListener("mousedown", function (e) { if (e.target.tagName !== "INPUT" && !e.target.isContentEditable) e.preventDefault(); }); // keep the text selection
    const section = function (title) { const s = el("div", "sm-sec"); if (title) s.appendChild(el("div", "sm-sec-title", title)); rail.appendChild(s); return s; };

    const penSec = section("Pen");
    const pen = el("div", "sm-pen");
    const red = el("button", "sm-pen-btn sm-pen-red is-on", "Red"); red.type = "button"; red.title = "Preplanning, reminders, coordination circles, W's";
    const blk = el("button", "sm-pen-btn sm-pen-blk", "Black"); blk.type = "button"; blk.title = "Issued to the pilot, times, assigned altitudes";
    red.addEventListener("click", function () { ui.pen = "red"; red.classList.add("is-on"); blk.classList.remove("is-on"); });
    blk.addEventListener("click", function () { ui.pen = "blk"; blk.classList.add("is-on"); red.classList.remove("is-on"); });
    pen.appendChild(red); pen.appendChild(blk); penSec.appendChild(pen);

    // symbols from the AERO Center commonly used stripmarking list, typed at the cursor in the pen colour
    const symSec = section("Special marks");
    const syms = el("div", "sm-syms");
    // [text or null, glyph id or null, meaning]
    // [text before the glyph, glyph id, meaning]: every arrow is drawn so they all match in size and weight
    [["T", "rt", "via depart"], [null, "up", "climb and maintain"], [null, "aoa", "at or above"], [null, "dn", "descend and maintain"], [null, "aob", "at or below"], [null, "join", "joining"], [null, "eca", "enter controlled airspace"]].forEach(function (d) {
      const c = el("button", "sm-sym", d[0]); c.type = "button";
      c.appendChild(glyphEl(d[1], null));
      c.title = d[2] + " — written at the cursor in the pen colour";
      c.addEventListener("click", function () {
        const a = document.activeElement;
        if (!ui.stripEl || !a || !a.isContentEditable || !ui.stripEl.contains(a)) return;
        if (!a.dataset.html) { insertAtCursor(a, (d[0] || "") + GLYPHS[d[1]].fallback); return; } // plain-text boxes cannot hold a drawn glyph
        if (d[0]) insertAtCursor(a, d[0]);
        insertAtCursor(a, null, d[1]);
      });
      syms.appendChild(c);
    });
    symSec.appendChild(syms);

    const textSec = section("Highlight text");
    const mk = function (label, title, fn) { const b = el("button", "btn btn-ghost sm-act", label); b.type = "button"; b.title = title; b.addEventListener("click", fn); textSec.appendChild(b); return b; };
    mk("◯ Circle", "Circle the highlighted text in the pen colour (again to remove; both colours may stack)", function () { applySelection("circ-" + ui.pen); });
    mk("— Strike", "Line the highlighted text through (black; again to remove)", function () { applySelection("strike"); });
    mk("_ Underline", "Underline the highlighted text in the pen colour (IAFDOF, TUX suffix, FRC in red)", function () { applySelection("ul-" + ui.pen); });
    mk("✕ Cross Out", "Cross the highlighted text out with an X (black; again to remove)", function () { applySelection("x"); });

    const routeSec = section("Route");
    const caret = el("button", "btn btn-ghost sm-act", "^ Amend"); caret.type = "button"; caret.title = "Put the cursor in the route, then insert a ^ there with the amendment under it; the same spot again removes it";
    caret.addEventListener("click", insertCaret); routeSec.appendChild(caret);

    const boxSec = section("Boxes");
    const split = el("button", "btn btn-ghost sm-act", "Split 18"); split.type = "button"; split.title = "Departures: split box 18 — assumed departure time on the left, actual on the right (again to join)";
    split.addEventListener("click", function () { if (!ui.strip) return; const m = model(ui.strip); m.split18 = !m.split18; split.classList.toggle("is-on", m.split18); apply(ui.stripEl, ui.strip); const L = ui.stripEl.querySelector(".sm-18L"); if (L) focusEnd(L); });
    boxSec.appendChild(split);
    ui.splitBtn = split;

    const chipSec = function (title, ids) {
      const sec = section(title);
      const wrap = el("div", "sm-chips");
      ids.forEach(function (id) {
        const p = def(id);
        const c = el("div", "sm-pal-chip", p.label);
        c.title = p.title + " — click (again to remove)";
        c.addEventListener("click", function () { if (ui.strip) toggleItem(ui.strip, ui.stripEl, p.id); });
        wrap.appendChild(c);
      });
      sec.appendChild(wrap);
    };
    chipSec("Box 15", ["T", "RLS", "SYD", "V"]);
    chipSec("Space 14a", ["EDC"]);
    chipSec("Space 26", ["C", "67"]);
    chipSec("Spaces 27–30", ["DA", "H", "VR", "APCH", "Z", "VV", "TXT"]);

    const misc = section(null);
    const remHint = el("div", "sm-hint sm-remote-only", "Remote: click a reminder's letters when the call is made. A report the controller asks for is written in black in space 26 with the time it is expected (RP 30 SW MHZ/1231) or, for a DME, the mileage and the time (25 NW MHZ/1231); an RP line adds RP with its minutes to the reminders. Departure strips: type the actual departure time (2 min after the clearance) and the estimates, IC and PR follow.");
    misc.appendChild(remHint);
    const clear = el("button", "btn btn-ghost sm-act sm-danger", "Clear strip"); clear.type = "button"; clear.title = "Remove every mark on this strip";
    clear.addEventListener("click", function () { if (!ui.strip) return; if (!confirm("Clear all marks on " + (ui.strip.spaces["3"] || "this strip") + "?")) return; ui.strip.markup = null; apply(ui.stripEl, ui.strip); });
    misc.appendChild(clear);
    misc.appendChild(el("div", "sm-hint", "Select a strip on the board to mark it up. Highlight text to circle, underline, x, or strike it through"));
    return rail;
  }

  let raf = null;
  function scheduleLayout() { if (raf) return; raf = requestAnimationFrame(function () { raf = null; if (ui.strip && ui.stripEl) layoutMarks(ui.stripEl, ui.strip); }); }

  // ---- public ---------------------------------------------------------------------
  function attach() {
    if (ui.rail) return;
    ui.rail = buildRail();
    document.body.appendChild(ui.rail);
    document.body.classList.add("has-sm-rail");
    if (!ui.listening) { // once per page, even if the rail is detached and attached again
      ui.listening = true;
      window.addEventListener("resize", scheduleLayout);
      document.addEventListener("selectionchange", function () { if (ui.stripEl) captureSelection(); });
    }
  }
  function activate(strip, slot) {
    ui.strip = strip; ui.slot = slot;
    ui.stripEl = slot ? slot.querySelector(".fps-strip") : null;
    if (!ui.stripEl) return deactivate();
    apply(ui.stripEl, strip);
    setCellsEditable(ui.stripEl, true);
    if (ui.rail) { ui.rail.classList.remove("is-idle"); if (ui.splitBtn) ui.splitBtn.classList.toggle("is-on", !!model(strip).split18); }
    setTimeout(scheduleLayout, 160);
  }
  function deactivate() {
    setCellsEditable(ui.stripEl, false);
    ui.strip = null; ui.slot = null; ui.stripEl = null; ui.sel = null;
    if (ui.rail) ui.rail.classList.add("is-idle");
  }
  // Remove the rail from the page (a page that leaves the board, e.g. back to the scenario list).
  function detach() {
    deactivate();
    if (ui.rail && ui.rail.parentNode) ui.rail.parentNode.removeChild(ui.rail);
    ui.rail = null;
    document.body.classList.remove("has-sm-rail");
  }
  function rebind(slot) { if (ui.strip && slot) { ui.slot = slot; ui.stripEl = slot.querySelector(".fps-strip"); apply(ui.stripEl, ui.strip); setCellsEditable(ui.stripEl, true); scheduleLayout(); } }
  function setView(v) { ui.view = v === "remote" ? "remote" : "controller"; if (ui.rail) ui.rail.classList.toggle("is-remote", ui.view === "remote"); }
  function configure(hooks) { Object.assign(ui.hooks, hooks || {}); }
  // Programmatic marks (used when a departure time recomputes a flight's estimates).
  function setStrike(strip, cell, on) {
    const m = model(strip);
    const has = m.ranges.findIndex(function (r) { return r.kind === "strike" && r.auto && r.target.cell === cell; });
    if (on && has < 0) m.ranges.push({ target: { cell: cell }, start: 0, end: 4, kind: "strike", seq: ++ui.seq, auto: true });
    if (!on && has >= 0) m.ranges.splice(has, 1);
  }

  root.StripMarkup = { attach: attach, detach: detach, activate: activate, deactivate: deactivate, apply: apply, rebind: rebind, reposition: scheduleLayout, toggleItem: toggleItem, setView: setView, configure: configure, model: model, setStrike: setStrike, setCell: setCell, setReminderTime: setReminderTime, PALETTE: PALETTE, _ui: ui };
})(typeof window !== "undefined" ? window : this);
