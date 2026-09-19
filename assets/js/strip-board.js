/*
 * Strip bay board. Posts flight strips into the ZAE bays (VKS / MHZ / SQS)
 * the way a nonradar controller keeps them: strips in suspense (a departure
 * awaiting its clearance request, plus every posting that belongs to it)
 * stacked above the bay label, active postings below it, and within each
 * stack the earliest time at the bottom reading upward. A suspense flight is
 * kept together: its departure strip lowest, its postings directly above it. Any strip can be dragged to
 * any bay and any position. Shared by the generator page and scenarios.
 *
 *   const board = StripBoard.create(containerEl, { showNums, onSelect, onChange, renderOpts });
 *   renderOpts(strip) -> extra FPSStrip.render options for that strip (e.g. the Remote's data)
 *   board.setStrips(strips);   // auto-place (by type) and sort by estimate
 *   board.setShowNums(bool);   // toggle the field-number overlay in place
 *   board.getLayout();         // { VKS: { above: [uid..], below: [uid..] }, ... }
 *   board.getStrip(uid);
 *   board.toggleFlag(uid?);    // flag/unflag a strip (default: the selected one)
 *   board.getFlags();          // uids currently flagged
 *   board.deselect();          // clear the selection (also: click anywhere off a strip)
 * opts.keepSelectionWithin: selector for elements whose clicks must not
 * deselect (e.g. the panel showing the selected strip's details).
 * Flags: with a strip selected (clicked), F or Space toggles a red corner
 * flag on it. The flag lives on the strip object, so it survives drags.
 */
(function (root) {
  "use strict";

  const BAYS = ["VKS", "MHZ", "SQS"];
  const MIN_ROWS = 9;       // empty slots pad each bay to at least this many rows
  const LABEL = "__LABEL__";
  let uidSeq = 0;

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  // HHMM (as an integer) used to order strips bottom-to-top. En route and
  // arrival postings carry the center estimate in space 15; departures carry a
  // proposed time (P-time) in space 19. Anything without a time sinks to the top.
  function sortTime(strip) {
    const s = (strip && strip.spaces) || {};
    const norm = function (v) { return String(v == null ? "" : v).replace(/Ø/g, "0"); };
    let m = norm(s["15"]).match(/(\d{4})/);
    if (m) return parseInt(m[1], 10);
    m = norm(s["19"]).match(/P(\d{4})/);
    if (m) return parseInt(m[1], 10);
    const meta = (strip && strip.meta) || {};
    m = norm(meta.departureTime || meta.proposedTime || "").match(/(\d{4})/);
    if (m) return parseInt(m[1], 10);
    return 9999;
  }

  function create(container, opts) {
    opts = opts || {};
    const state = { bays: {}, byUid: {}, showNums: !!opts.showNums, selected: null };
    BAYS.forEach(function (b) { state.bays[b] = { above: [], below: [] }; });
    let drag = null; // uid being dragged

    function uidOf(strip) {
      if (!strip.uid) strip.uid = "s" + (++uidSeq);
      return strip.uid;
    }

    // ---- model -----------------------------------------------------------
    function setStrips(strips) {
      BAYS.forEach(function (b) { state.bays[b].above = []; state.bays[b].below = []; });
      state.byUid = {};
      state.selected = null;
      (strips || []).forEach(function (st) {
        const uid = uidOf(st);
        state.byUid[uid] = st;
        const bay = BAYS.indexOf(st.bay) >= 0 ? st.bay : BAYS[1];
        // generator marks suspense explicitly; fall back to type for older data
        const above = st.suspense != null ? !!st.suspense : st.type === "departure";
        (above ? state.bays[bay].above : state.bays[bay].below).push(uid);
      });
      // Above the header, order by the flight's proposed time so each suspense
      // flight stays together, departure strip lowest and its postings stacked
      // directly above it by estimate. Below, plain estimate order.
      function aboveKey(st) {
        const t = sortTime(st);
        // a suspense flight's postings carry no times: keep the flight's own order
        return [st.suspenseTime != null ? st.suspenseTime : t, st.type === "departure" ? -1 : (st.order != null ? st.order : t)];
      }
      BAYS.forEach(function (b) {
        const by = function (uid) { return sortTime(state.byUid[uid]); };
        state.bays[b].above.sort(function (a, c) {
          const ka = aboveKey(state.byUid[a]), kc = aboveKey(state.byUid[c]);
          return (ka[0] - kc[0]) || (ka[1] - kc[1]);
        });
        state.bays[b].below.sort(function (a, c) { return by(a) - by(c); });
      });
      render();
    }

    function removeUid(uid) {
      BAYS.forEach(function (b) {
        ["above", "below"].forEach(function (z) {
          const i = state.bays[b][z].indexOf(uid);
          if (i >= 0) state.bays[b][z].splice(i, 1);
        });
      });
    }

    // Linear bottom-to-top order of a bay: below stack, the label, above stack.
    function seqOf(bay) {
      const b = state.bays[bay];
      return b.below.concat([LABEL], b.above);
    }

    // Insert at linear position k (0 = very bottom). Positions at or below the
    // label go into the "below" stack; anything past it goes into "above".
    function insertAt(bay, k, uid) {
      const b = state.bays[bay];
      const nBelow = b.below.length;
      if (k <= nBelow) b.below.splice(k, 0, uid);
      else b.above.splice(k - nBelow - 1, 0, uid);
    }

    function rowsNeeded() {
      let rows = MIN_ROWS;
      BAYS.forEach(function (b) { rows = Math.max(rows, seqOf(b).length); });
      return rows;
    }

    function getLayout() {
      const out = {};
      BAYS.forEach(function (b) { out[b] = { above: state.bays[b].above.slice(), below: state.bays[b].below.slice() }; });
      return out;
    }

    // ---- drag & drop ------------------------------------------------------
    // Insertion index = how many posted items (strips + label, ignoring the one
    // being dragged) sit below the pointer. Columns are column-reverse, so the
    // first child is the bottom slot.
    function insertionIndex(col, y) {
      let k = 0;
      Array.prototype.forEach.call(col.querySelectorAll("[data-k]"), function (node) {
        if (node.classList.contains("is-dragging")) return;
        const r = node.getBoundingClientRect();
        if (r.top + r.height / 2 > y) k++;
      });
      return k;
    }

    function clearIndicators() {
      Array.prototype.forEach.call(container.querySelectorAll(".sb-drop-below, .sb-drop-here"), function (n) {
        n.classList.remove("sb-drop-below", "sb-drop-here");
      });
    }

    function showIndicator(col, k) {
      clearIndicators();
      // Items above the pointer (linear index >= k, skipping the dragged one).
      const items = Array.prototype.filter.call(col.querySelectorAll("[data-k]"), function (n) { return !n.classList.contains("is-dragging"); });
      if (k < items.length) items[k].classList.add("sb-drop-below");
      else {
        const empty = col.querySelector(".sb-empty");
        if (empty) empty.classList.add("sb-drop-here");
        else if (items.length) items[items.length - 1].classList.add("sb-drop-above");
      }
    }

    // ---- render -----------------------------------------------------------
    function render() {
      container.innerHTML = "";
      container.classList.add("sb-board");
      const rows = rowsNeeded();

      BAYS.forEach(function (bay) {
        const col = el("div", "sb-bay");
        col.dataset.bay = bay;
        const seq = seqOf(bay);

        seq.forEach(function (item, k) {
          if (item === LABEL) {
            const lab = el("div", "sb-slot sb-label sb-label--" + bay.toLowerCase(), bay);
            lab.dataset.k = k;
            col.appendChild(lab);
            return;
          }
          const st = state.byUid[item];
          const slot = el("div", "sb-slot sb-strip");
          slot.dataset.uid = item;
          slot.dataset.k = k;
          slot.dataset.type = st.type || "";
          slot.dataset.flight = st.flight != null ? String(st.flight) : "";
          slot.dataset.suspense = st.suspense ? "1" : "";
          slot.draggable = state.selected !== item; // the selected strip is being marked up, not dragged
          if (state.selected === item) slot.classList.add("is-selected");
          if (st.flagged) slot.classList.add("is-flagged");
          const ro = opts.renderOpts ? opts.renderOpts(st) : null;
          const stripEl = FPSStrip.render(st.spaces, Object.assign({ showNums: state.showNums }, ro || {}));
          slot.appendChild(stripEl);
          if (root.StripMarkup && st.markup) root.StripMarkup.apply(stripEl, st);

          slot.addEventListener("click", function () {
            if (state.selected === item) return; // clicks inside the selected strip are for marking
            const prev = state.selected;
            state.selected = item;
            Array.prototype.forEach.call(container.querySelectorAll(".sb-strip.is-selected"), function (n) { n.classList.remove("is-selected"); n.draggable = true; });
            slot.classList.add("is-selected");
            slot.draggable = false;
            clearPush();
            if (opts.onSelect) opts.onSelect(st, slot);
          });
          // enlarged strips share the space: push the selected one and the
          // hovered one apart while they would overlap
          slot.addEventListener("mouseenter", function () { if (state.selected && state.selected !== item) pushApart(slot); });
          slot.addEventListener("mouseleave", function () { if (state.selected !== item) clearPush(); });
          slot.addEventListener("dragstart", function (e) {
            drag = item;
            slot.classList.add("is-dragging");
            document.body.classList.add("sb-dragging");
            e.dataTransfer.effectAllowed = "move";
            try { e.dataTransfer.setData("text/plain", item); } catch (_) { /* older browsers */ }
          });
          slot.addEventListener("dragend", function () {
            drag = null;
            document.body.classList.remove("sb-dragging");
            clearIndicators();
            slot.classList.remove("is-dragging");
          });
          col.appendChild(slot);
        });

        for (let i = seq.length; i < rows; i++) col.appendChild(el("div", "sb-slot sb-empty"));

        col.addEventListener("dragover", function (e) {
          if (!drag) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          showIndicator(col, insertionIndex(col, e.clientY));
        });
        col.addEventListener("dragleave", function (e) {
          if (!col.contains(e.relatedTarget)) clearIndicators();
        });
        col.addEventListener("drop", function (e) {
          if (!drag) return;
          e.preventDefault();
          const uid = drag;
          const k = insertionIndex(col, e.clientY);
          removeUid(uid);
          insertAt(bay, k, uid);
          drag = null;
          document.body.classList.remove("sb-dragging");
          render();
          if (opts.onChange) opts.onChange(getLayout());
        });

        container.appendChild(col);
      });
      if (opts.onRender) opts.onRender(selectedSlot());
    }

    // ---- push-apart -------------------------------------------------------
    function scaleOf() { return window.matchMedia && window.matchMedia("(max-width: 640px)").matches ? 1.6 : 2.1; }
    // The rectangle a slot's strip covers once enlarged (before any push).
    function enlargedRect(slot) {
      const r = slot.getBoundingClientRect();
      const k = scaleOf();
      const bay = slot.parentNode;
      const first = bay === container.firstElementChild, last = bay === container.lastElementChild;
      const w = r.width * k, h = r.height * k;
      const x = first ? r.left : last ? r.right - w : r.left + r.width / 2 - w / 2;
      const y = r.top + r.height / 2 - h / 2;
      return { left: x, top: y, right: x + w, bottom: y + h, width: w, height: h };
    }
    function setPush(slot, x, y) {
      const el = slot.querySelector(".fps-strip");
      if (!el) return;
      el.style.setProperty("--px", x + "px");
      el.style.setProperty("--py", y + "px");
    }
    function clearPush() {
      Array.prototype.forEach.call(container.querySelectorAll(".fps-strip"), function (el) { el.style.removeProperty("--px"); el.style.removeProperty("--py"); });
      if (opts.onMove) opts.onMove();
    }
    function pushApart(hovered) {
      const sel = container.querySelector('.sb-strip[data-uid="' + state.selected + '"]');
      if (!sel || sel === hovered) return;
      const a = enlargedRect(sel), b = enlargedRect(hovered);
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox <= 0 || oy <= 0) return;
      const gap = 8;
      // push along the axis that needs the smaller move; each strip takes half
      if (oy <= ox) {
        const d = (oy + gap) / 2, sign = a.top <= b.top ? -1 : 1;
        setPush(sel, 0, sign * d); setPush(hovered, 0, -sign * d);
      } else {
        const d = (ox + gap) / 2, sign = a.left <= b.left ? -1 : 1;
        setPush(sel, sign * d, 0); setPush(hovered, -sign * d, 0);
      }
      if (opts.onMove) opts.onMove();
    }

    function toggleFlag(uid) {
      uid = uid || state.selected;
      const st = uid && state.byUid[uid];
      if (!st) return false;
      st.flagged = !st.flagged;
      const slot = container.querySelector('.sb-strip[data-uid="' + uid + '"]');
      if (slot) slot.classList.toggle("is-flagged", st.flagged);
      if (opts.onFlag) opts.onFlag(st, st.flagged);
      return st.flagged;
    }

    function deselect() {
      if (!state.selected) return;
      state.selected = null;
      Array.prototype.forEach.call(container.querySelectorAll(".sb-strip.is-selected"), function (n) { n.classList.remove("is-selected"); n.draggable = true; });
      clearPush();
      if (opts.onSelect) opts.onSelect(null);
    }

    // Clicking anywhere that is not a strip clears the selection.
    document.addEventListener("click", function (e) {
      if (!state.selected || !document.body.contains(container)) return;
      const t = e.target;
      if (!t || !t.closest) return;
      if (t.closest(".sb-strip")) return;
      if (opts.keepSelectionWithin && t.closest(opts.keepSelectionWithin)) return;
      deselect();
    });

    function selectedSlot() { return state.selected ? container.querySelector('.sb-strip[data-uid="' + state.selected + '"]') : null; }
    function stripEl(uid) { const s = container.querySelector('.sb-strip[data-uid="' + uid + '"]'); return s ? s.querySelector(".fps-strip") : null; }

    function getFlags() {
      return Object.keys(state.byUid).filter(function (u) { return state.byUid[u].flagged; });
    }

    // F or Space flags the selected strip. Ignored while typing in a field or
    // an editable blank strip, and once this board is gone from the page.
    document.addEventListener("keydown", function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (!state.selected || !document.body.contains(container)) return;
      const t = e.target;
      const tag = t && t.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || (t && t.isContentEditable)) return;
      if (e.key === "f" || e.key === "F" || e.key === " ") {
        e.preventDefault();
        toggleFlag();
      }
    });

    function setShowNums(v) { state.showNums = !!v; render(); }

    return {
      setStrips: setStrips,
      setShowNums: setShowNums,
      getLayout: getLayout,
      getStrip: function (uid) { return state.byUid[uid]; },
      toggleFlag: toggleFlag,
      getFlags: getFlags,
      deselect: deselect,
      selectedSlot: selectedSlot,
      stripEl: stripEl,
      render: render
    };
  }

  root.StripBoard = { create: create, sortTime: sortTime, BAYS: BAYS };
})(typeof window !== "undefined" ? window : this);
