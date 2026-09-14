/*
 * Stripmarking editor for strips on the bay board.
 *
 * With a strip selected (it stays enlarged), the controller marks it the way
 * SLP05 / the Aero Center Phraseology and Stripmarking Guide describe:
 *   - pen colour red (preplanned, coordination) or black (issued to the pilot)
 *   - highlight text -> circle it (red or black; both may stack, the second
 *     colour drawn as the larger circle) or line it through (always black)
 *   - click in the route (space 25) -> a caret ^ between two route elements
 *     with an amendment written under it (which can itself be circled)
 *   - space 26 is a free text box written in the current pen colour
 *   - spaces 27-30 take control-data chips (D-A, H-, VR, APCH, 67, Z, V, ...)
 *     dragged or clicked in from the palette; H- opens the holding box
 *     (fix, direction, radial/bearing/airway, turns, EFC)
 * Marks live on the strip object (strip.markup) so they survive drags and
 * re-renders, and are drawn as overlays positioned from the text itself.
 *
 *   StripMarkup.attach({ keepWithin })   once per page
 *   StripMarkup.activate(strip, slotEl)  when a board strip is selected
 *   StripMarkup.deactivate()
 *   StripMarkup.apply(stripEl, strip)    draw a strip's marks (board render)
 */
(function (root) {
  "use strict";

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  const PALETTE = [
    { id: "DA", label: "D-A", title: "Operating initials: yours and the receiver's (clearance / coordination complete)", editable: true },
    { id: "H", label: "H-", title: "Cleared to hold, holding instructions issued (opens the holding box)" },
    { id: "VR", label: "VR", title: "VOR approach (KGWO: VOR runway 5 circle to runway 23)" },
    { id: "APCH", label: "APCH", title: "Cleared approach (KVKS / 0M8)" },
    { id: "67", label: "67", title: "Block airspace coordinated with sector 67 (altitude follows)", editable: true, seed: "67 " },
    { id: "Z", label: "Z", title: "Tower jurisdiction" },
    { id: "V", label: "V", title: "Void time reached / cleared beyond the fix" },
    { id: "C", label: "C̸", title: "Pilot cancelled IFR" },
    { id: "RLS", label: "RLS", title: "Released" },
    { id: "SYD", label: "SYD", title: "Visual separation approved" },
    { id: "CTL", label: "CTL", title: "Control obtained" },
    { id: "E", label: "E", title: "Emergency (red)", red: true },
    { id: "TXT", label: "abc", title: "Free text", editable: true, seed: "" }
  ];
  const HOLD_PRESETS = [
    { name: "VKS", fix: "VKS", dir: "SW", ref: "195", turns: "LT" },
    { name: "MHZ", fix: "", dir: "NW", ref: "", turns: "" },
    { name: "SQS", fix: "", dir: "SW", ref: "256", turns: "LT" },
    { name: "DINKY", fix: "", dir: "NE", ref: "V18", turns: "" }
  ];
  const DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

  const ui = { pen: "red", strip: null, slot: null, stripEl: null, toolbar: null, hold: null, holdChip: null, sel: null, keepWithin: null, seq: 0 };

  function model(strip) {
    if (!strip.markup) strip.markup = { ranges: [], carets: [], text26: "", misc: [] };
    return strip.markup;
  }

  // ---- geometry helpers ------------------------------------------------
  function pct(stripEl, r) {
    const s = stripEl.getBoundingClientRect();
    return { left: (r.left - s.left) / s.width * 100, top: (r.top - s.top) / s.height * 100, width: r.width / s.width * 100, height: r.height / s.height * 100 };
  }
  function cellOf(stripEl, f) { return stripEl.querySelector('.fps-cell[data-f="' + f + '"]'); }
  function textNodeOf(node) {
    if (!node) return null;
    if (node.nodeType === 3) return node;
    for (let i = 0; i < node.childNodes.length; i++) { const t = textNodeOf(node.childNodes[i]); if (t) return t; }
    return null;
  }
  // The element whose text a mark refers to (a cell, or a caret's amendment box).
  function targetEl(stripEl, target) {
    if (target.cell) return cellOf(stripEl, target.cell);
    if (target.caret) return stripEl.querySelector('.sm-caret-text[data-id="' + target.caret + '"]');
    return null;
  }
  function textNodesIn(root) {
    const out = [];
    (function walk(n) { if (n.nodeType === 3) { out.push(n); return; } for (let i = 0; i < n.childNodes.length; i++) walk(n.childNodes[i]); })(root);
    return out;
  }
  // Character offset within the element's whole text -> (text node, offset).
  function pointAt(root, off) {
    const nodes = textNodesIn(root);
    let acc = 0;
    for (let i = 0; i < nodes.length; i++) {
      const len = nodes[i].nodeValue.length;
      if (off <= acc + len) return { node: nodes[i], offset: off - acc };
      acc += len;
    }
    const last = nodes[nodes.length - 1];
    return last ? { node: last, offset: last.nodeValue.length } : null;
  }
  function rangeFor(root, start, end) {
    const a = pointAt(root, start), b = pointAt(root, end);
    if (!a || !b) return null;
    const r = document.createRange();
    r.setStart(a.node, a.offset); r.setEnd(b.node, b.offset);
    return r;
  }
  function fullText(root) { return textNodesIn(root).map(function (n) { return n.nodeValue; }).join(""); }

  // ---- apply / layout -----------------------------------------------------
  // Draw a strip's marks. Overlays sit in .sm-layer; text boxes are live
  // elements that keep the model updated.
  function apply(stripEl, strip) {
    let layer = stripEl.querySelector(".sm-layer");
    if (layer) layer.remove();
    layer = el("div", "sm-layer");
    stripEl.appendChild(layer);
    stripEl.classList.add("sm-marked");
    const m = model(strip);
    // space 26 text box
    const t26 = el("div", "sm-text26 sm-edit");
    t26.contentEditable = "true"; t26.spellcheck = false;
    t26.innerHTML = m.text26 || "";
    t26.addEventListener("beforeinput", penInput);
    t26.addEventListener("input", function () { m.text26 = sanitize(t26.innerHTML); });
    t26.title = "Space 26: remarks, reports, reminders (typed in the pen colour)";
    layer.appendChild(t26);

    // spaces 27-30 chips
    const g = el("div", "sm-gbox");
    g.dataset.drop = "1";
    m.misc.forEach(function (chip) { g.appendChild(renderChip(chip, strip, stripEl)); });
    g.addEventListener("dragover", function (e) { if (e.dataTransfer.types.indexOf("text/sm-chip") !== -1) { e.preventDefault(); g.classList.add("sm-over"); } });
    g.addEventListener("dragleave", function () { g.classList.remove("sm-over"); });
    g.addEventListener("drop", function (e) {
      const id = e.dataTransfer.getData("text/sm-chip"); g.classList.remove("sm-over");
      if (!id) return; e.preventDefault(); addChip(strip, stripEl, id);
    });
    layer.appendChild(g);

    // carets and their amendment boxes
    m.carets.forEach(function (c) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "sm-caret sm-" + c.color); svg.setAttribute("viewBox", "0 0 10 20"); svg.dataset.id = c.id;
      const pl = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      pl.setAttribute("points", "1.2,19.5 5,0.8 8.8,19.5"); svg.appendChild(pl);
      svg.addEventListener("click", function (e) { e.stopPropagation(); if (confirm("Remove this route amendment?")) removeCaret(strip, stripEl, c.id); });
      layer.appendChild(svg);
      const box = el("div", "sm-caret-text sm-edit sm-" + c.color);
      box.dataset.id = c.id; box.contentEditable = "true"; box.spellcheck = false; box.textContent = c.text || "";
      box.addEventListener("input", function () { c.text = box.textContent; layoutMarks(stripEl, strip); });
      layer.appendChild(box);
    });
    layoutMarks(stripEl, strip);
  }

  // Rect-based overlays (circles, strikes, caret positions); safe to call often.
  function layoutMarks(stripEl, strip) {
    const layer = stripEl.querySelector(".sm-layer"); if (!layer) return;
    const m = model(strip);
    Array.prototype.forEach.call(layer.querySelectorAll(".sm-circ, .sm-strike"), function (n) { n.remove(); });
    const s = stripEl.getBoundingClientRect();
    if (!s.width) return;
    const aspect = s.width / s.height;
    // circles: the second colour over the same text is drawn larger
    m.ranges.forEach(function (rk) {
      const tel = targetEl(stripEl, rk.target); if (!tel) return;
      const rg = rangeFor(tel, rk.start, rk.end); if (!rg) return;
      const rects = rg.getClientRects();
      if (!rects.length) return;
      let padIdx = 0;
      if (rk.kind !== "strike") {
        m.ranges.forEach(function (o) { if (o !== rk && o.kind !== "strike" && o.seq < rk.seq && sameTarget(o.target, rk.target) && o.start < rk.end && rk.start < o.end) padIdx++; });
      }
      // union of the line boxes -> one box per line
      Array.prototype.forEach.call(rects, function (r) {
        const p = pct(stripEl, r);
        if (rk.kind === "strike") {
          const d = el("div", "sm-strike");
          d.style.left = p.left + "%"; d.style.width = p.width + "%"; d.style.top = (p.top + p.height / 2) + "%";
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
    // carets: apex between the two route elements, legs down through the text below
    m.carets.forEach(function (c) {
      const tel = targetEl(stripEl, { cell: "25" }); if (!tel) return;
      const rg = rangeFor(tel, c.offset, c.offset); if (!rg) return;
      const r = rg.getClientRects()[0];
      const svg = layer.querySelector('.sm-caret[data-id="' + c.id + '"]');
      const box = layer.querySelector('.sm-caret-text[data-id="' + c.id + '"]');
      if (!r || !svg || !box) return;
      const p = pct(stripEl, r);
      const w = 2.6, h = w * aspect * 0.95 * 2; // strip % units
      svg.style.left = (p.left - w / 2) + "%"; svg.style.top = (p.top - 0.6) + "%"; svg.style.width = w + "%"; svg.style.height = h + "%";
      box.style.left = (p.left - 6) + "%"; box.style.top = (p.top + h - 1) + "%"; box.style.width = "12%";
    });
  }
  function sameTarget(a, b) { return (a.cell || "") === (b.cell || "") && (a.caret || "") === (b.caret || ""); }

  // Flatten the editor's DOM to runs of {colour, text} and back to minimal HTML.
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
      if (last && last.c === r.c) { last.t += r.t; return; }
      out.push({ c: r.c, t: r.t });
    });
    return out.map(function (r) { return r === "<br>" ? r : '<span class="sm-' + r.c + '">' + escapeHtml(r.t) + "</span>"; }).join("");
  }
  function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  // Typed text goes into a span of the current pen colour.
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
          // never nest one colour inside another: split the span at the caret
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

  // ---- chips (27-30) ------------------------------------------------------
  function renderChip(chip, strip, stripEl) {
    const def = PALETTE.find(function (p) { return p.id === chip.id; }) || { label: chip.id };
    const d = el("div", "sm-chip sm-" + chip.color);
    d.dataset.cid = chip.cid;
    if (def.editable) {
      const t = el("span", "sm-chip-text sm-edit", chip.text != null ? chip.text : (def.seed != null ? def.seed : def.label));
      t.contentEditable = "true"; t.spellcheck = false;
      t.addEventListener("input", function () { chip.text = t.textContent; });
      d.appendChild(t);
    } else d.appendChild(el("span", "sm-chip-text", def.label));
    if (chip.id === "H") {
      const lines = el("span", "sm-hold-lines");
      const h = chip.hold || {};
      [h.fix, h.dir, h.ref, h.turns, h.efc].forEach(function (v) { if (v) lines.appendChild(el("span", null, v)); });
      d.appendChild(lines);
      d.addEventListener("click", function (e) { e.stopPropagation(); openHold(strip, stripEl, chip); });
      d.title = "Holding: click to edit; shift-click to remove";
    } else d.title = (def.title || def.label) + " — click to remove";
    d.addEventListener("click", function (e) {
      e.stopPropagation();
      if (chip.id === "H" && !e.shiftKey) return;
      if (e.target.isContentEditable && !e.shiftKey) return;
      const m = model(strip); const i = m.misc.indexOf(chip); if (i >= 0) m.misc.splice(i, 1);
      if (ui.holdChip === chip) closeHold();
      apply(stripEl, strip);
    });
    return d;
  }
  function addChip(strip, stripEl, id) {
    const def = PALETTE.find(function (p) { return p.id === id; }); if (!def) return;
    const m = model(strip);
    const chip = { cid: "c" + (++ui.seq) + Date.now().toString(36), id: id, color: def.red ? "red" : ui.pen };
    if (def.editable) chip.text = def.seed != null ? def.seed : def.label;
    if (id === "H") chip.hold = { fix: "", dir: "", ref: "", turns: "", efc: "" };
    m.misc.push(chip);
    apply(stripEl, strip);
    if (id === "H") openHold(strip, stripEl, chip);
    else if (def.editable) { const t = stripEl.querySelector('.sm-chip[data-cid="' + chip.cid + '"] .sm-chip-text'); if (t) { t.focus(); selectAllIn(t); } }
  }
  function selectAllIn(node) { const r = document.createRange(); r.selectNodeContents(node); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }

  // ---- holding box ---------------------------------------------------------
  function openHold(strip, stripEl, chip) {
    closeHold();
    ui.holdChip = chip;
    const box = el("div", "sm-hold sm-ui");
    box.appendChild(el("div", "sm-hold-title", "Holding instructions (H-)"));
    const presets = el("div", "sm-hold-presets");
    HOLD_PRESETS.forEach(function (p) {
      const b = el("button", "btn btn-ghost", p.name);
      b.type = "button";
      b.addEventListener("click", function () { chip.hold.fix = p.fix; chip.hold.dir = p.dir; chip.hold.ref = p.ref; chip.hold.turns = p.turns; fill(); commit(); });
      presets.appendChild(b);
    });
    box.appendChild(presets);
    const form = el("div", "sm-hold-form");
    const fields = {};
    function row(label, node, hint) { const r = el("label"); r.appendChild(el("span", null, label)); r.appendChild(node); if (hint) r.appendChild(el("small", null, hint)); form.appendChild(r); }
    fields.fix = el("input"); fields.fix.placeholder = "VKS"; row("Fix", fields.fix, "only when it is not the posted fix");
    fields.dir = el("select"); fields.dir.appendChild(el("option", null, "")); DIRS.forEach(function (d) { fields.dir.appendChild(el("option", null, d)); }); row("Direction", fields.dir, "hold northwest / southwest ...");
    fields.ref = el("input"); fields.ref.placeholder = "195 / 256 / V18"; row("Radial, bearing or airway", fields.ref, "blank = as published");
    fields.turns = el("select"); ["", "LT"].forEach(function (t) { fields.turns.appendChild(el("option", null, t)); }); row("Turns", fields.turns, "blank = right turns (standard)");
    fields.efc = el("input"); fields.efc.placeholder = "1247"; fields.efc.maxLength = 4; row("EFC", fields.efc, "blank = no delay expected");
    box.appendChild(form);
    const actions = el("div", "sm-hold-actions");
    const done = el("button", "btn", "Done"); done.type = "button"; done.addEventListener("click", function () { commit(); closeHold(); });
    const rm = el("button", "btn btn-ghost", "Remove H-"); rm.type = "button"; rm.addEventListener("click", function () { const m = model(strip); const i = m.misc.indexOf(chip); if (i >= 0) m.misc.splice(i, 1); closeHold(); apply(stripEl, strip); });
    actions.appendChild(done); actions.appendChild(rm);
    box.appendChild(actions);
    function fill() { fields.fix.value = chip.hold.fix || ""; fields.dir.value = chip.hold.dir || ""; fields.ref.value = chip.hold.ref || ""; fields.turns.value = chip.hold.turns || ""; fields.efc.value = chip.hold.efc || ""; }
    function commit() {
      chip.hold = { fix: fields.fix.value.trim().toUpperCase(), dir: fields.dir.value, ref: fields.ref.value.trim().toUpperCase(), turns: fields.turns.value, efc: fields.efc.value.trim() };
      apply(stripEl, strip);
    }
    Object.keys(fields).forEach(function (k) { fields[k].addEventListener("input", commit); fields[k].addEventListener("change", commit); });
    fill();
    document.body.appendChild(box);
    ui.hold = box;
    positionFloating();
  }
  function closeHold() { if (ui.hold) ui.hold.remove(); ui.hold = null; ui.holdChip = null; }

  // ---- toolbar --------------------------------------------------------------
  function buildToolbar() {
    const tb = el("div", "sm-toolbar sm-ui");
    tb.addEventListener("mousedown", function (e) { if (e.target.tagName !== "INPUT" && !e.target.isContentEditable) e.preventDefault(); }); // keep the text selection
    const pen = el("div", "sm-pen");
    const red = el("button", "sm-pen-btn sm-pen-red is-on", "Red"); red.type = "button"; red.title = "Preplanning, reminders, coordination circles, W's";
    const blk = el("button", "sm-pen-btn sm-pen-blk", "Black"); blk.type = "button"; blk.title = "Issued to the pilot, times, assigned altitudes";
    red.addEventListener("click", function () { ui.pen = "red"; red.classList.add("is-on"); blk.classList.remove("is-on"); });
    blk.addEventListener("click", function () { ui.pen = "blk"; blk.classList.add("is-on"); red.classList.remove("is-on"); });
    pen.appendChild(red); pen.appendChild(blk);
    tb.appendChild(pen);
    const acts = el("div", "sm-acts");
    const circ = el("button", "btn btn-ghost sm-act", "◯ Circle"); circ.type = "button"; circ.title = "Highlight text on the strip, then circle it in the pen colour (again to remove)";
    const strike = el("button", "btn btn-ghost sm-act", "— Strike"); strike.type = "button"; strike.title = "Highlight text, then line it through (always black; again to remove)";
    const caret = el("button", "btn btn-ghost sm-act", "^ Route"); caret.type = "button"; caret.title = "Click a spot in the route (space 25), then insert a ^ with an amendment under it";
    const clear = el("button", "btn btn-ghost sm-act", "Clear strip"); clear.type = "button"; clear.title = "Remove every mark on this strip";
    circ.addEventListener("click", function () { applySelection("circ-" + ui.pen); });
    strike.addEventListener("click", function () { applySelection("strike"); });
    caret.addEventListener("click", insertCaret);
    clear.addEventListener("click", function () { if (!ui.strip) return; if (!confirm("Clear all marks on " + (ui.strip.spaces["3"] || "this strip") + "?")) return; ui.strip.markup = null; closeHold(); apply(ui.stripEl, ui.strip); });
    [circ, strike, caret, clear].forEach(function (b) { acts.appendChild(b); });
    tb.appendChild(acts);
    const pal = el("div", "sm-palette");
    pal.appendChild(el("span", "sm-pal-label", "27–30:"));
    PALETTE.forEach(function (p) {
      const c = el("div", "sm-pal-chip" + (p.red ? " sm-red" : ""), p.label);
      c.title = (p.title || p.label) + " — drag into the right-hand column or click";
      c.draggable = true;
      c.addEventListener("dragstart", function (e) { e.dataTransfer.setData("text/sm-chip", p.id); e.dataTransfer.effectAllowed = "copy"; });
      c.addEventListener("click", function () { if (ui.strip) addChip(ui.strip, ui.stripEl, p.id); });
      pal.appendChild(c);
    });
    tb.appendChild(pal);
    const hint = el("div", "sm-hint", "Select text on the strip to circle or strike it · click in the route then ^ Route · type in space 26 · drop chips into 27–30");
    tb.appendChild(hint);
    return tb;
  }

  // The current selection, if it lies inside one cell (or one amendment box) of the active strip.
  function captureSelection() {
    const sel = window.getSelection();
    if (!ui.stripEl || !sel || !sel.rangeCount) { ui.sel = null; return; }
    const r = sel.getRangeAt(0);
    const a = r.startContainer, b = r.endContainer;
    const cell = (a.nodeType === 3 ? a.parentNode : a).closest ? (a.nodeType === 3 ? a.parentNode : a).closest(".fps-cell, .sm-caret-text") : null;
    const cellB = (b.nodeType === 3 ? b.parentNode : b).closest ? (b.nodeType === 3 ? b.parentNode : b).closest(".fps-cell, .sm-caret-text") : null;
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
    // snap to the nearest gap between route elements
    const text = fullText(tel);
    let off = s.start;
    let left = off; while (left > 0 && text[left - 1] !== " ") left--;
    let right = off; while (right < text.length && text[right] !== " ") right++;
    off = (off - left <= right - off) ? Math.max(0, left) : Math.min(text.length, right);
    if (off === 0 || off === text.length) { alert("The ^ must sit between two route elements."); return; }
    // between the two elements: put it on the space itself (rendered at the boundary)
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

  // ---- floating placement ----------------------------------------------------
  function positionFloating() {
    if (!ui.stripEl) return;
    const r = ui.stripEl.getBoundingClientRect();
    if (ui.toolbar) {
      const tb = ui.toolbar;
      tb.style.display = "";
      const h = tb.offsetHeight;
      let top = r.top - h - 8;
      if (top < 6) top = r.bottom + 8;
      tb.style.top = top + "px";
      tb.style.left = Math.max(6, Math.min(r.left, window.innerWidth - tb.offsetWidth - 6)) + "px";
    }
    if (ui.hold) {
      const hb = ui.hold;
      let left = r.right + 10;
      if (left + hb.offsetWidth > window.innerWidth - 6) left = Math.max(6, r.left - hb.offsetWidth - 10);
      hb.style.left = left + "px";
      hb.style.top = Math.max(6, Math.min(r.top, window.innerHeight - hb.offsetHeight - 6)) + "px";
    }
  }
  let raf = null;
  function schedulePosition() { if (raf) return; raf = requestAnimationFrame(function () { raf = null; positionFloating(); if (ui.strip && ui.stripEl) layoutMarks(ui.stripEl, ui.strip); }); }

  // ---- public ---------------------------------------------------------------
  function attach(opts) {
    opts = opts || {};
    ui.keepWithin = opts.keepWithin || null;
    if (!ui.toolbar) {
      ui.toolbar = buildToolbar();
      ui.toolbar.style.display = "none";
      document.body.appendChild(ui.toolbar);
      window.addEventListener("scroll", schedulePosition, true);
      window.addEventListener("resize", schedulePosition);
      document.addEventListener("selectionchange", function () { if (ui.stripEl) captureSelection(); });
    }
  }
  function activate(strip, slot) {
    ui.strip = strip; ui.slot = slot;
    ui.stripEl = slot ? slot.querySelector(".fps-strip") : null;
    if (!ui.stripEl) return deactivate();
    apply(ui.stripEl, strip);
    closeHold();
    if (ui.toolbar) ui.toolbar.style.display = "";
    // after the enlarge transition settles
    setTimeout(schedulePosition, 0); setTimeout(schedulePosition, 160);
  }
  function deactivate() {
    ui.strip = null; ui.slot = null; ui.stripEl = null; ui.sel = null;
    if (ui.toolbar) ui.toolbar.style.display = "none";
    closeHold();
  }
  // the board re-rendered: rebind to the selected slot
  function rebind(slot) { if (ui.strip && slot) { ui.slot = slot; ui.stripEl = slot.querySelector(".fps-strip"); apply(ui.stripEl, ui.strip); schedulePosition(); } }

  root.StripMarkup = { attach: attach, activate: activate, deactivate: deactivate, apply: apply, rebind: rebind, reposition: schedulePosition, PALETTE: PALETTE, HOLD_PRESETS: HOLD_PRESETS, _ui: ui };
})(typeof window !== "undefined" ? window : this);
