/*
 * Strip bay board. Posts flight strips into the ZAE bays (VKS / MHZ / SQS)
 * the way a nonradar controller keeps them: strips in suspense (a departure
 * awaiting its clearance request, plus every posting that belongs to it)
 * stacked above the bay label, active postings below it, and within each
 * stack the earliest time at the bottom reading upward. A suspense flight is
 * kept together: its departure strip lowest, its postings directly above it. Any strip can be dragged to
 * any bay and any position. Shared by the generator page and scenarios.
 *
 *   const board = StripBoard.create(containerEl, { showNums, onSelect, onChange });
 *   board.setStrips(strips);   // auto-place (by type) and sort by estimate
 *   board.setShowNums(bool);   // toggle the field-number overlay in place
 *   board.getLayout();         // { VKS: { above: [uid..], below: [uid..] }, ... }
 *   board.getStrip(uid);
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
        return [st.suspenseTime != null ? st.suspenseTime : t, st.type === "departure" ? -1 : t];
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
          slot.draggable = true;
          if (state.selected === item) slot.classList.add("is-selected");
          slot.appendChild(FPSStrip.render(st.spaces, { showNums: state.showNums }));

          slot.addEventListener("click", function () {
            state.selected = item;
            Array.prototype.forEach.call(container.querySelectorAll(".sb-strip.is-selected"), function (n) { n.classList.remove("is-selected"); });
            slot.classList.add("is-selected");
            if (opts.onSelect) opts.onSelect(st);
          });
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
    }

    function setShowNums(v) { state.showNums = !!v; render(); }

    return {
      setStrips: setStrips,
      setShowNums: setShowNums,
      getLayout: getLayout,
      getStrip: function (uid) { return state.byUid[uid]; },
      render: render
    };
  }

  root.StripBoard = { create: create, sortTime: sortTime, BAYS: BAYS };
})(typeof window !== "undefined" ? window : this);
