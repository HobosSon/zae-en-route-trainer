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
 *   - a revised estimate box beside the center estimate (space 15)
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
 * passing, at the bottom) is added from the rail. Departure strips get a
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
    { id: "RLS", label: "RLS", where: "15", seed: "RLS ", title: "Released (rule): red = preplan reminder, black = actual entry in box 15" },
    { id: "SYD", label: "SYD", where: "15", seed: "SYD / ", title: "Visual separation approved: red = preplan reminder, black = actual entry in box 15" },
    { id: "V", label: "V<", where: "15", seed: "V< ", title: "Void time: red = preplan reminder, black = actual entry in box 15" },
    { id: "C", label: "C", where: "26", seed: "C ", title: "Communications change: the time, fix or mileage where the pilot contacts the next facility (space 26)" },
    { id: "67", label: "67", where: "26", seed: "67 ", title: "Airspace blocked with sector 67 and the altitude (space 26)" },
    { id: "DA", label: "D-A", where: "g", editable: true, seed: "D-A", title: "Operating initials: yours and the receiver's" },
    { id: "H", label: "H-", where: "g", title: "Cleared to hold: holding instructions typed beside it (Space or Enter = next line)" },
    { id: "VR", label: "VR", where: "g", title: "VOR approach (KGWO: VOR runway 5 circle to runway 23)" },
    { id: "APCH", label: "APCH", where: "g", title: "Cleared approach (KVKS / 0M8)" },
    { id: "Z", label: "Z", where: "g", over: true, title: "Tower jurisdiction (written over the holding instructions)" },
    { id: "VV", label: "V", where: "g", over: true, title: "Cleared beyond the fix / for approach (written over the holding instructions)" },
    { id: "TXT", label: "abc", where: "g", editable: true, seed: "", title: "Free text" }
  ];
  function def(id) { return PALETTE.find(function (p) { return p.id === id; }); }

  const ui = { pen: "red", strip: null, slot: null, stripEl: null, rail: null, sel: null, seq: 0, view: "controller", hooks: {} };

  function model(strip) {
    if (!strip.markup) strip.markup = { ranges: [], carets: [], text26: "", items26: [], s15: [], est15: "", misc: [], rtimes: {}, done: {}, rp: [], dep18: "" };
    const m = strip.markup;
    ["ranges", "carets", "items26", "s15", "misc", "rp"].forEach(function (k) { if (!m[k]) m[k] = []; });
    ["rtimes", "done"].forEach(function (k) { if (!m[k]) m[k] = {}; });
    if (m.text26 == null) m.text26 = ""; if (m.est15 == null) m.est15 = ""; if (m.dep18 == null) m.dep18 = "";
    return m;
  }
  function isRemote(strip) { return ui.view === "remote" && !!(strip && strip.remote); }
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
    return null;
  }
  function textNodesIn(rootEl) {
    const out = [];
    (function walk(n) { if (n.nodeType === 3) { out.push(n); return; } for (let i = 0; i < n.childNodes.length; i++) walk(n.childNodes[i]); })(rootEl);
    return out;
  }
  function pointAt(rootEl, off) {
    const nodes = textNodesIn(rootEl);
    let acc = 0;
    for (let i = 0; i < nodes.length; i++) {
      const len = nodes[i].nodeValue.length;
      if (off <= acc + len) return { node: nodes[i], offset: off - acc };
      acc += len;
    }
    const last = nodes[nodes.length - 1];
    return last ? { node: last, offset: last.nodeValue.length } : null;
  }
  function rangeFor(rootEl, start, end) {
    const a = pointAt(rootEl, start), b = pointAt(rootEl, end);
    if (!a || !b) return null;
    const r = document.createRange();
    r.setStart(a.node, a.offset); r.setEnd(b.node, b.offset);
    return r;
  }
  function fullText(rootEl) { return textNodesIn(rootEl).map(function (n) { return n.nodeValue; }).join(""); }
  function sameTarget(a, b) { return (a.cell || "") === (b.cell || "") && (a.caret || "") === (b.caret || ""); }

  // ---- editable helpers ------------------------------------------------------
  function editable(cls, text, onInput, opts) {
    opts = opts || {};
    const d = el("div", cls + " sm-edit");
    d.contentEditable = "true"; d.spellcheck = false;
    if (opts.html) d.innerHTML = text || ""; else d.textContent = text || "";
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

    // space 15: revised estimate beside the minutes, actual entries inside the
    // box, preplanning reminders just outside its left border
    const est = editable("sm-est15 sm-blk", m.est15, function (d) { m.est15 = d.textContent; }, { placeholder: "" });
    est.title = "Revised center estimate (strike the old one, write the new one here)";
    layer.appendChild(est);
    const in15 = el("div", "sm-in15");
    const pre15 = el("div", "sm-pre15");
    m.s15.forEach(function (it) {
      const d = def(it.id);
      if (it.color === "red") { const r = el("div", "sm-pre sm-red", d.label); r.title = d.title + " — click to remove"; r.addEventListener("click", function (e) { e.stopPropagation(); toggleItem(strip, stripEl, it.id, "red"); }); pre15.appendChild(r); }
      else { const b = editable("sm-actual sm-blk", it.text, function (x) { it.text = x.textContent; }); b.dataset.iid = it.iid; in15.appendChild(b); }
    });
    layer.appendChild(in15); layer.appendChild(pre15);

    // space 26: entries (C, 67) then free text
    const box26 = el("div", "sm-box26");
    m.items26.forEach(function (it) {
      const b = editable("sm-item26 sm-" + it.color, it.text, function (x) { it.text = x.textContent; });
      b.dataset.iid = it.iid; b.title = def(it.id).title + " (shift-click to remove)";
      b.addEventListener("click", function (e) { if (e.shiftKey) { e.preventDefault(); toggleItem(strip, stripEl, it.id, it.color); } });
      box26.appendChild(b);
    });
    const t26 = editable("sm-text26", m.text26, function (d) { m.text26 = sanitize(d.innerHTML); }, { html: true });
    t26.addEventListener("beforeinput", penInput);
    t26.title = "Space 26: remarks, reports, reminders (typed in the pen colour)";
    box26.appendChild(t26);
    layer.appendChild(box26);

    // spaces 27-30 (Remote view: the red call reminders come first)
    const g = el("div", "sm-gbox");
    if (isRemote(strip)) {
      g.appendChild(renderReminders(strip, stripEl, m));
      if (strip.remote.dep) {
        const d = editable("sm-dep18 sm-blk", m.dep18, function (x) { m.dep18 = x.textContent.replace(/[^\d]/g, "").slice(0, 4); if (ui.hooks.onDepTime) ui.hooks.onDepTime(strip, m.dep18, stripEl); }, { placeholder: "    " });
        d.title = "Actual departure time (2 minutes after the clearance): the fix estimates, IC and PR times follow from it";
        layer.appendChild(d);
      }
    }
    const overs = m.misc.filter(function (c) { return def(c.id).over; });
    const hasH = m.misc.some(function (c) { return c.id === "H"; });
    m.misc.forEach(function (chip) { if (!(def(chip.id).over && hasH)) g.appendChild(renderChip(chip, strip, stripEl)); });
    layer.appendChild(g);
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
    Array.prototype.forEach.call(layer.querySelectorAll(".sm-circ, .sm-strike, .sm-ul"), function (n) { n.remove(); });
    const s = stripEl.getBoundingClientRect();
    if (!s.width) return;
    const aspect = s.width / s.height;
    const isCircle = function (k) { return k.indexOf("circ-") === 0; };
    m.ranges.forEach(function (rk) {
      const tel = targetEl(stripEl, rk.target); if (!tel) return;
      const rg = rangeFor(tel, rk.start, rk.end); if (!rg) return;
      const rects = rg.getClientRects();
      if (!rects.length) return;
      let padIdx = 0;
      if (isCircle(rk.kind)) m.ranges.forEach(function (o) { if (o !== rk && isCircle(o.kind) && o.seq < rk.seq && sameTarget(o.target, rk.target) && o.start < rk.end && rk.start < o.end) padIdx++; });
      // one box per visual line: rects that overlap vertically are merged
      const lines = [];
      Array.prototype.forEach.call(rects, function (r) {
        if (!r.width && !r.height) return;
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
      if (last && last !== "<br>" && last.c === r.c) { last.t += r.t; return; }
      out.push({ c: r.c, t: r.t });
    });
    return out.map(function (r) { return r === "<br>" ? r : '<span class="sm-' + r.c + '">' + escapeHtml(r.t) + "</span>"; }).join("");
  }
  function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  // Typed text goes into a span of the current pen colour, never nested in the other colour.
  function penInput(e) {
    if (e.inputType !== "insertText" && e.inputType !== "insertParagraph") return;
    const sel = window.getSelection(); if (!sel.rangeCount) return;
    e.preventDefault();
    const range = sel.getRangeAt(0); range.deleteContents();
    let node;
    if (e.inputType === "insertParagraph") node = el("br");
    else {
      const tn = range.startContainer.nodeType === 3 ? range.startContainer : null;
      const parentSpan = tn ? tn.parentNode : null;
      const inSpan = parentSpan && parentSpan.classList && (parentSpan.classList.contains("sm-red") || parentSpan.classList.contains("sm-blk"));
      if (inSpan && parentSpan.classList.contains("sm-" + ui.pen)) node = document.createTextNode(e.data);
      else {
        node = el("span", "sm-" + ui.pen, e.data);
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
    e.target.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // ---- Remote call reminders (space 27) ------------------------------------------------
  function renderReminders(strip, stripEl, m) {
    const box = el("div", "sm-rmd");
    const rows = strip.remote.reminders.map(function (x) { return { id: x.id, k: x.k, t: x.t, blank: x.t == null }; })
      .concat(m.rp.map(function (x) { return { id: x.iid, k: "RP", t: null, blank: true, rp: x }; }));
    rows.forEach(function (row) {
      const d = el("div", "sm-rmd-row sm-red" + (m.done[row.id] ? " is-done" : ""));
      d.dataset.rid = row.id;
      const k = el("span", "sm-rmd-k", row.k);
      k.title = (row.rp ? "Report passing — click when called (lines it through), shift-click to remove" : "Click when the call is made (lines it through)");
      k.addEventListener("click", function (e) {
        if (!selectedEl(stripEl)) return; // a click on an unselected strip just selects it
        e.stopPropagation();
        if (row.rp && e.shiftKey) { m.rp = m.rp.filter(function (x) { return x !== row.rp; }); apply(stripEl, strip); return; }
        m.done[row.id] = !m.done[row.id];
        d.classList.toggle("is-done", !!m.done[row.id]);
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
  function addRP() {
    if (!ui.strip || !isRemote(ui.strip)) return;
    const m = model(ui.strip);
    const item = { iid: "rp" + (++ui.seq) + Date.now().toString(36), t: "" };
    m.rp.push(item);
    apply(ui.stripEl, ui.strip);
    focusEnd(ui.stripEl.querySelector('.sm-rmd-t[data-rid="' + item.iid + '"]'));
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
    const list = d.where === "15" ? m.s15 : d.where === "26" ? m.items26 : m.misc;
    const i = list.findIndex(function (x) { return x.id === id && x.color === color; });
    if (i >= 0) { list.splice(i, 1); apply(stripEl, strip); return; }
    const item = { iid: "i" + (++ui.seq) + Date.now().toString(36), cid: "c" + ui.seq, id: id, color: color };
    if (d.where === "15") { if (color === "blk") item.text = d.seed; }
    else if (d.where === "26") item.text = d.seed;
    else { if (d.editable) item.text = d.seed; if (id === "H") item.hold = ""; }
    list.push(item);
    apply(stripEl, strip);
    // put the caret where the value goes
    let target = null;
    if (d.where === "15" && color === "blk") target = stripEl.querySelector('.sm-actual[data-iid="' + item.iid + '"]');
    else if (d.where === "26") target = stripEl.querySelector('.sm-item26[data-iid="' + item.iid + '"]');
    else if (id === "H") target = stripEl.querySelector('.sm-chip[data-cid="' + item.cid + '"] .sm-hold-text');
    else if (d.editable) target = stripEl.querySelector('.sm-chip[data-cid="' + item.cid + '"] .sm-chip-text');
    if (target) focusEnd(target);
  }

  // ---- text-range marks -------------------------------------------------------------
  function captureSelection() {
    const sel = window.getSelection();
    if (!ui.stripEl || !sel || !sel.rangeCount) { ui.sel = null; return; }
    const r = sel.getRangeAt(0);
    const a = r.startContainer, b = r.endContainer;
    const ea = a.nodeType === 3 ? a.parentNode : a, eb = b.nodeType === 3 ? b.parentNode : b;
    const cell = ea.closest ? ea.closest(".fps-cell, .sm-caret-text") : null;
    const cellB = eb.closest ? eb.closest(".fps-cell, .sm-caret-text") : null;
    if (!cell || cell !== cellB || !ui.stripEl.contains(cell)) { ui.sel = null; return; }
    if (!textNodesIn(cell).length) { ui.sel = null; return; }
    const pre = document.createRange(); pre.selectNodeContents(cell); pre.setEnd(r.startContainer, r.startOffset);
    const start = pre.toString().length;
    const end = start + r.toString().length;
    const target = cell.classList.contains("sm-caret-text") ? { caret: cell.dataset.id } : { cell: cell.dataset.f };
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
    const c = { id: "k" + (++ui.seq) + Date.now().toString(36), offset: off, color: ui.pen, text: "" };
    m.carets.push(c);
    apply(ui.stripEl, ui.strip);
    const box = ui.stripEl.querySelector('.sm-caret-text[data-id="' + c.id + '"]'); if (box) box.focus();
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

    const textSec = section("Highlighted text");
    const mk = function (label, title, fn) { const b = el("button", "btn btn-ghost sm-act", label); b.type = "button"; b.title = title; b.addEventListener("click", fn); textSec.appendChild(b); return b; };
    mk("◯ Circle", "Circle the highlighted text in the pen colour (again to remove; both colours may stack)", function () { applySelection("circ-" + ui.pen); });
    mk("— Strike", "Line the highlighted text through (black; again to remove)", function () { applySelection("strike"); });
    mk("_ Underline", "Underline the highlighted text in the pen colour (IAFDOF, TUX suffix, FRC in red)", function () { applySelection("ul-" + ui.pen); });

    const routeSec = section("Route (25)");
    const caret = el("button", "btn btn-ghost sm-act", "^ Amend"); caret.type = "button"; caret.title = "Click a spot in the route, then insert a ^ with the amendment under it";
    caret.addEventListener("click", insertCaret); routeSec.appendChild(caret);

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
    chipSec("Box 15 (red = preplan)", ["RLS", "SYD", "V"]);
    chipSec("Space 26", ["C", "67"]);
    chipSec("Spaces 27–30", ["DA", "H", "VR", "APCH", "Z", "VV", "TXT"]);

    const remSec = section("Remote (27)");
    remSec.classList.add("sm-remote-only");
    const rpWrap = el("div", "sm-chips");
    const rp = el("div", "sm-pal-chip", "RP");
    rp.title = "Report passing requested by the controller: adds RP at the bottom of the reminders with the minutes the aircraft is estimated to pass the point";
    rp.addEventListener("click", addRP);
    rpWrap.appendChild(rp); remSec.appendChild(rpWrap);
    remSec.appendChild(el("div", "sm-hint", "Click a reminder's letters when the call is made. Departure strips: type the actual departure time in space 18 (2 min after the clearance) and the estimates, IC and PR follow."));

    const misc = section(null);
    const clear = el("button", "btn btn-ghost sm-act sm-danger", "Clear strip"); clear.type = "button"; clear.title = "Remove every mark on this strip";
    clear.addEventListener("click", function () { if (!ui.strip) return; if (!confirm("Clear all marks on " + (ui.strip.spaces["3"] || "this strip") + "?")) return; ui.strip.markup = null; apply(ui.stripEl, ui.strip); });
    misc.appendChild(clear);
    misc.appendChild(el("div", "sm-hint", "Select a strip on the board to mark it up. Highlight text for circles, strikes and underlines."));
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
    window.addEventListener("resize", scheduleLayout);
    document.addEventListener("selectionchange", function () { if (ui.stripEl) captureSelection(); });
  }
  function activate(strip, slot) {
    ui.strip = strip; ui.slot = slot;
    ui.stripEl = slot ? slot.querySelector(".fps-strip") : null;
    if (!ui.stripEl) return deactivate();
    apply(ui.stripEl, strip);
    if (ui.rail) ui.rail.classList.remove("is-idle");
    setTimeout(scheduleLayout, 160);
  }
  function deactivate() {
    ui.strip = null; ui.slot = null; ui.stripEl = null; ui.sel = null;
    if (ui.rail) ui.rail.classList.add("is-idle");
  }
  function rebind(slot) { if (ui.strip && slot) { ui.slot = slot; ui.stripEl = slot.querySelector(".fps-strip"); apply(ui.stripEl, ui.strip); scheduleLayout(); } }
  function setView(v) { ui.view = v === "remote" ? "remote" : "controller"; if (ui.rail) ui.rail.classList.toggle("is-remote", ui.view === "remote"); }
  function configure(hooks) { Object.assign(ui.hooks, hooks || {}); }
  // Programmatic marks (used when a departure time recomputes a flight's estimates).
  function setStrike(strip, cell, on) {
    const m = model(strip);
    const has = m.ranges.findIndex(function (r) { return r.kind === "strike" && r.auto && r.target.cell === cell; });
    if (on && has < 0) m.ranges.push({ target: { cell: cell }, start: 0, end: 4, kind: "strike", seq: ++ui.seq, auto: true });
    if (!on && has >= 0) m.ranges.splice(has, 1);
  }

  root.StripMarkup = { attach: attach, activate: activate, deactivate: deactivate, apply: apply, rebind: rebind, reposition: scheduleLayout, toggleItem: toggleItem, setView: setView, configure: configure, model: model, setStrike: setStrike, setReminderTime: setReminderTime, PALETTE: PALETTE, _ui: ui };
})(typeof window !== "undefined" ? window : this);
