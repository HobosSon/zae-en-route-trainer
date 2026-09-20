/*
 * Practice Scenarios controller. Level-select for 27 static "levels",
 * a Community tab (user-created, saved to localStorage), a player on the bay
 * board (Controller / Remote toggle, stripmarking), and the scenario builder
 * (used for Community scenarios and, via the authoring tool, for
 * staging/exporting the static levels).
 *
 * Scenarios are built from the Remote's strips: each strip is the printed
 * strip (every space, including the shared remarks in 26 such as FRC) plus
 * the Remote-only data — initial contact time or ON FREQUENCY, the
 * departure clearance request time and sequence number, an altitude request,
 * KVKS weather. The Controller's strips are the same strips without that
 * data; the red space-27 reminders are derived from the strip type and the
 * Remote data (ZAERemote.decorateAuthored), never typed in.
 * Requires zae.js, remote.js, fps-strip.js, strip-board.js, strip-markup.js,
 * scenario-board.js, scenario-store.js.
 */
(function () {
  "use strict";
  const el = FPSStrip.el;
  const app = document.getElementById("app");
  const S = window.ScenarioStore;

  function clear() { app.innerHTML = ""; if (window.StripMarkup) StripMarkup.detach(); } // the marking rail belongs to the board only
  function btn(label, cls, fn) { const b = el("button", "btn " + (cls || ""), label); b.addEventListener("click", fn); return b; }

  const ALTIM_SITES = ["KMLU", "KVKS", "KJAN", "KGWO"];
  const STATIC_FIELDS = ["4", "5", "20", "24", "25"]; // shared per-plane data copied by callsign
  function isAirport(x) { x = (x || "").trim().toUpperCase(); return x === "0M8" || /^K[A-Z0-9]{3}$/.test(x); }
  // Determine strip type + dep/arr arrow from the posted fix (19) and next fix (21).
  function lastAirportOf(route) { const t = (route || "").toUpperCase().split(/[\s./]+/).filter(Boolean); for (let i = t.length - 1; i >= 0; i--) if (isAirport(t[i])) return { apt: t[i], before: t[i - 1] || null }; return null; }
  function detectFromFixes(f19, f21, f11, f12, f25) {
    const posted = (f19 || "").trim().split(/\s+/)[0].toUpperCase();
    const next = (f21 || "").trim().split(/\s+/)[0].toUpperCase();
    // KMLU arrivals: the last strip posts STUEE with MLU next (the airport is only in the route,
    // possibly followed by an estimate): an arrival when the route ends at KMLU and 21 is the fix before it
    const ra = lastAirportOf(f25);
    if (ra && ra.apt === "KMLU" && next && next === ra.before && posted !== "KMLU") return { type: "arrival", arrow: "↓" };
    if (isAirport(posted)) return { type: "departure", arrow: "↑" };
    // KMLU only: its departure strip carries the airport and P-time in 11/12 with STUEE posted.
    // Any other airport in 11 (0M8, KVKS, ... with the P-time) is the strip after the departure strip.
    if ((f11 || "").trim().toUpperCase() === "KMLU" && /^P\s*\d/i.test((f12 || "").trim())) return { type: "departure", arrow: "↑" };
    if (isAirport(next)) return { type: "arrival", arrow: "↓" };
    return { type: "enroute", arrow: "" };
  }

  // ---------------- Share links ----------------
  // A community scenario packed into the page's hash (#share=…) reproduces it
  // anywhere: the receiver can play it or save it to their own Community tab.
  function encodeShare(sc) {
    const data = { title: sc.title, description: sc.description, startTime: sc.startTime, atis: sc.atis, altimeters: sc.altimeters, strips: sc.strips };
    const json = JSON.stringify(data);
    const b64 = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return location.origin + location.pathname + "#share=" + b64;
  }
  function decodeShare(hash) {
    const m = /^#share=([A-Za-z0-9_-]+)$/.exec(hash || ""); if (!m) return null;
    try {
      let b64 = m[1].replace(/-/g, "+").replace(/_/g, "/"); while (b64.length % 4) b64 += "=";
      const sc = JSON.parse(decodeURIComponent(escape(atob(b64))));
      if (!sc || !Array.isArray(sc.strips)) return null;
      return sc;
    } catch (e) { return null; }
  }
  function copyText(txt, b, done) {
    const flash = function () { const old = b.textContent; b.textContent = done || "Copied"; setTimeout(function () { b.textContent = old; }, 1400); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(flash, function () { prompt("Copy this link:", txt); });
    else prompt("Copy this link:", txt);
  }
  function renderShared(sc) {
    clear();
    const intro = el("div", "sc-intro");
    intro.appendChild(el("h2", "sc-title", "Shared scenario: " + (sc.title || "Untitled scenario")));
    if (sc.description) intro.appendChild(el("p", "sc-desc", sc.description));
    intro.appendChild(el("p", null, sc.strips.length + " strips, from a share link. Play it here or save a copy to your Community tab."));
    const row = el("div", "cc-actions");
    row.appendChild(btn("Play", "", function () { play(sc, "community", function () { renderShared(sc); }); }));
    row.appendChild(btn("Save to Community", "btn-ghost", function () { S.addCommunity(sc); history.replaceState(null, "", location.pathname); currentTab = "community"; renderGrid(); }));
    row.appendChild(btn("Back to scenarios", "btn-ghost", function () { history.replaceState(null, "", location.pathname); renderGrid(); }));
    intro.appendChild(row);
    app.appendChild(intro);
  }

  // ---------------- Level select ----------------
  let currentTab = "levels";
  let authorMode = false;

  function renderGrid() {
    clear();
    const tabs = el("div", "sc-tabs");
    const tLevels = btn("Levels", "tab" + (currentTab === "levels" ? " tab-active" : ""), function () { currentTab = "levels"; renderGrid(); });
    const tComm = btn("Community", "tab" + (currentTab === "community" ? " tab-active" : ""), function () { currentTab = "community"; renderGrid(); });
    tabs.appendChild(tLevels); tabs.appendChild(tComm);
    app.appendChild(tabs);

    if (currentTab === "levels") renderLevels();
    else renderCommunity();
  }

  function renderLevels() {
    const intro = el("div", "sc-intro");
    intro.appendChild(el("p", null, "Select a scenario to practice."));
    // temporary authoring toggle
    const authRow = el("div", "author-row");
    const authToggle = el("label", "toggle");
    const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = authorMode;
    cb.addEventListener("change", function () { authorMode = cb.checked; renderGrid(); });
    authToggle.appendChild(cb); authToggle.appendChild(document.createTextNode(" Author static levels (temporary)"));
    authRow.appendChild(authToggle);
    if (authorMode) authRow.appendChild(btn("Export static JSON", "btn-ghost", exportStatic));
    intro.appendChild(authRow);
    app.appendChild(intro);

    const grid = el("div", "level-grid");
    const total = S.total();
    for (let i = 1; i <= total; i++) {
      const got = S.getStatic(i);
      const tile = el("div", "level-tile" + (got ? "" : " locked"));
      tile.appendChild(el("span", "level-num", String(i)));
      if (got) {
        tile.appendChild(el("span", "level-title", got.scenario.title || ("Scenario " + i)));
        tile.appendChild(el("span", "level-meta", (got.scenario.strips ? got.scenario.strips.length : 0) + " strips" + (got.source === "staged" ? " · staged" : "")));
        tile.addEventListener("click", function () { play(got.scenario, "levels"); });
      } else {
        tile.appendChild(el("span", "level-title", "Locked"));
        tile.appendChild(el("span", "level-meta", "Coming soon"));
      }
      if (authorMode) {
        const a = btn(got ? "Edit" : "Author", "btn-ghost btn-xs", function (e) {
          e.stopPropagation();
          editScenario({ mode: "static", slot: i, existing: got ? got.scenario : null });
        });
        tile.appendChild(a);
      }
      grid.appendChild(tile);
    }
    app.appendChild(grid);
  }

  function renderCommunity() {
    const intro = el("div", "sc-intro");
    intro.appendChild(el("p", null, "Scenarios created by you, saved in this browser. Build your own traffic problems and come back to them; Share link copies a link that reproduces a scenario for anyone."));
    intro.appendChild(btn("+ Create scenario", "", function () { editScenario({ mode: "community" }); }));
    app.appendChild(intro);

    const list = S.listCommunity();
    if (!list.length) {
      app.appendChild(el("div", "empty-state", "No community scenarios yet. Create one to get started."));
      return;
    }
    const wrap = el("div", "community-list");
    list.slice().reverse().forEach(function (sc) {
      const card = el("div", "community-card");
      const info = el("div", "cc-info");
      info.appendChild(el("h3", null, sc.title || "Untitled scenario"));
      if (sc.description) info.appendChild(el("p", "cc-desc", sc.description));
      info.appendChild(el("p", null, (sc.strips ? sc.strips.length : 0) + " strips"));
      card.appendChild(info);
      const actions = el("div", "cc-actions");
      actions.appendChild(btn("Play", "", function () { play(sc, "community"); }));
      actions.appendChild(btn("Edit", "btn-ghost", function () { editScenario({ mode: "community", existing: sc }); }));
      const share = btn("Share link", "btn-ghost", function () { copyText(encodeShare(sc), share, "Link copied"); });
      share.title = "Copy a link that reproduces this scenario anywhere (it carries the whole scenario, so it is long)";
      actions.appendChild(share);
      actions.appendChild(btn("Delete", "btn-ghost btn-danger", function () {
        if (confirm("Delete \"" + (sc.title || "this scenario") + "\"?")) { S.deleteCommunity(sc.id); renderGrid(); }
      }));
      card.appendChild(actions);
      wrap.appendChild(card);
    });
    app.appendChild(wrap);
  }

  // ---------------- Player ----------------
  // Working copies of the saved strips on the bay board, with the Remote's
  // data derived from the saved fields.
  function normType(t) { return t === "proposal" ? "departure" : (t || "enroute"); }
  function buildPlayable(scenario) {
    const strips = JSON.parse(JSON.stringify(scenario.strips || [])).map(function (st) { st.type = normType(st.type); st.spaces = st.spaces || {}; return st; });
    const flights = ZAERemote.decorateAuthored(strips, { atis: scenario.atis || null });
    ScenarioBoard.prepare(strips, flights);
    return { strips: strips, flights: flights };
  }
  function playDetails(strip) {
    const box = el("div", "answer-key");
    const dl = el("dl");
    const row = function (k, v) { if (v == null || v === "") return; dl.appendChild(el("dt", null, k)); dl.appendChild(el("dd", null, v)); };
    const sp = strip.spaces || {};
    row("Strip type", normType(strip.type));
    row("Bay", strip.bay ? strip.bay + " bay" + (strip.suspense ? " (in suspense)" : "") : null);
    row("Posted fix", sp["19"]);
    row("Route (space 25)", sp["25"]);
    row("Remarks (space 26, both views)", sp["26"]);
    if (strip.remote && strip.remote.lines26.length) row("Remote data (space 26)", strip.remote.lines26.join(" · "));
    if (strip.remote && strip.remote.reminders.length) row("Remote reminders (space 27)", strip.remote.reminders.map(function (r) { return r.k + " " + (r.t == null ? "__" : r.t); }).join(" · "));
    box.appendChild(dl);
    box.appendChild(el("div", "note", "Authored scenario: no conflict-engine answer key. Work the strips, mark them up, and compare with your instructor's solution."));
    return box;
  }
  function play(scenario, backTab, backFn) {
    clear();
    currentTab = backTab || currentTab;
    const head = el("div", "sc-head");
    head.appendChild(btn(backFn ? "← Back to builder" : "← Back", "btn-ghost", backFn || renderGrid));
    const nums = el("label", "toggle");
    const cb = document.createElement("input"); cb.type = "checkbox";
    let sb = null;
    cb.addEventListener("change", function () { if (sb) sb.setShowNums(cb.checked); });
    nums.appendChild(cb); nums.appendChild(document.createTextNode(" Field numbers"));
    head.appendChild(nums);
    app.appendChild(head);

    app.appendChild(el("h2", "sc-title", scenario.title || "Scenario"));
    if (scenario.description) app.appendChild(el("p", "sc-desc", scenario.description));

    // start time + altimeters info bar
    const hasAltim = scenario.altimeters && Object.keys(scenario.altimeters).length;
    if (scenario.startTime || hasAltim) {
      const bar = el("div", "sc-infobar");
      if (scenario.startTime) {
        const t = el("div", "sc-info-item");
        t.appendChild(el("span", "sc-info-lbl", "START"));
        t.appendChild(el("span", "sc-info-val", FPSStrip.slashZero(scenario.startTime) + "Z"));
        bar.appendChild(t);
      }
      if (hasAltim) {
        ["KMLU", "KVKS", "KJAN", "KGWO"].forEach(function (site) {
          if (!scenario.altimeters[site]) return;
          const a = el("div", "sc-info-item");
          a.appendChild(el("span", "sc-info-lbl", site + " ALT"));
          a.appendChild(el("span", "sc-info-val", FPSStrip.slashZero(scenario.altimeters[site])));
          bar.appendChild(a);
        });
      }
      app.appendChild(bar);
    }

    const boardWrap = el("div", "play-board");
    app.appendChild(boardWrap);
    const built = buildPlayable(scenario);
    if (!built.strips.length) { boardWrap.appendChild(el("div", "empty-state", "This scenario has no strips yet.")); return; }
    sb = ScenarioBoard.create(boardWrap, {
      strips: built.strips, flights: built.flights, view: "controller", showNums: cb.checked,
      bar: [el("span", null, scenario.title || "Scenario"), el("span", "rules", built.flights.length + " aircraft · " + built.strips.length + " strips" + (scenario.startTime ? " · start " + FPSStrip.slashZero(scenario.startTime) + "Z" : "") + (scenario.atis ? " · ATIS " + (ZAERemote.atisWord(scenario.atis) || scenario.atis) : ""))],
      renderDetails: playDetails
    });
  }

  // ---------------- Editor ----------------
  function editScenario(opts) {
    clear();
    const existing = opts.existing || null;
    const head = el("div", "sc-head");
    head.appendChild(btn("← Cancel", "btn-ghost", renderGrid));
    const label = opts.mode === "static" ? ("Static level " + opts.slot) : (existing ? "Edit community scenario" : "New community scenario");
    head.appendChild(el("span", "editor-label", label));
    app.appendChild(head);

    const form = el("div", "editor");
    const titleIn = document.createElement("input"); titleIn.type = "text"; titleIn.className = "editor-input"; titleIn.placeholder = "Scenario title"; titleIn.value = existing ? (existing.title || "") : "";
    const descIn = document.createElement("textarea"); descIn.className = "editor-input"; descIn.placeholder = "Description / instructions (optional)"; descIn.rows = 4; descIn.value = existing ? (existing.description || "") : "";
    form.appendChild(fieldWrap("Title", titleIn));
    form.appendChild(fieldWrap("Description", descIn));

    // Altimeters, scenario start time (Zulu) and the current ATIS in one grid:
    //   KMLU | KGWO | start time
    //   KVKS | KJAN | ATIS
    const startIn = document.createElement("input");
    startIn.type = "text"; startIn.className = "editor-input editor-input-sm"; startIn.placeholder = "e.g. 1200"; startIn.maxLength = 4;
    startIn.value = existing && existing.startTime ? existing.startTime : "";
    // current ATIS (KGWO arrivals not yet on frequency check on with it)
    const atisIn = document.createElement("input");
    atisIn.type = "text"; atisIn.className = "editor-input editor-input-sm"; atisIn.placeholder = "T (Tango)"; atisIn.maxLength = 1;
    atisIn.value = existing && existing.atis ? existing.atis : "";
    atisIn.title = "Current ATIS letter. KGWO arrival Remote strips show “IC HHMM WITH <letter>” and “ATIS <letter>”; aircraft already on frequency have it.";
    atisIn.addEventListener("input", function () { atisIn.value = atisIn.value.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 1); stripsWrap.dataset.atis = atisIn.value; refreshAll(); });

    const altInputs = {};
    ALTIM_SITES.forEach(function (site) {
      const inp = document.createElement("input");
      inp.type = "text"; inp.className = "editor-input editor-input-sm"; inp.placeholder = "2992"; inp.maxLength = 4;
      inp.value = existing && existing.altimeters ? (existing.altimeters[site] || "") : "";
      altInputs[site] = inp;
    });
    const altGrid = el("div", "altim-grid");
    // DOM order is the Tab order (MLU, GWO, VKS, JAN, start time, ATIS); the grid placement keeps the layout
    const cell = function (label, inp, col, row) { const w = el("div", "editor-field"); w.style.gridColumn = String(col); w.style.gridRow = String(row); w.appendChild(el("label", "editor-flabel", label)); w.appendChild(inp); altGrid.appendChild(w); };
    cell("KMLU altimeter", altInputs.KMLU, 1, 1); cell("KGWO altimeter", altInputs.KGWO, 2, 1);
    cell("KVKS altimeter", altInputs.KVKS, 1, 2); cell("KJAN altimeter", altInputs.KJAN, 2, 2);
    cell("Scenario start time (Zulu)", startIn, 3, 1); cell("Current ATIS (KGWO)", atisIn, 3, 2);
    form.appendChild(fieldWrap("Altimeters", altGrid));

    const stripsWrap = el("div", "editor-strips");
    stripsWrap.dataset.atis = atisIn.value;
    form.appendChild(stripsWrap);

    function addStripEditor(st) {
      const block = el("div", "editor-strip");
      const bar = el("div", "editor-strip-bar");
      const typeSel = document.createElement("select"); typeSel.className = "editor-type";
      ["", "departure", "enroute", "arrival"].forEach(function (t) {
        const o = document.createElement("option"); o.value = t; o.textContent = t ? t : "(type)"; typeSel.appendChild(o);
      });
      if (st && st.type) typeSel.value = normType(st.type);
      bar.appendChild(el("span", "editor-strip-n", "Strip"));
      bar.appendChild(typeSel);
      bar.appendChild(btn("Remove", "btn-ghost btn-xs btn-danger", function () { block.remove(); renumber(); }));
      block.appendChild(bar);
      const stripEl = FPSStrip.render(st ? st.spaces : null, { editable: true, showNums: true });
      // space 10 is always the sector: fixed at 66, not typed
      const c10 = stripEl.querySelector('.fps-cell[data-f="10"]');
      if (c10) { c10.textContent = "66"; c10.setAttribute("contenteditable", "false"); c10.classList.add("editor-cell-fixed"); }
      block.appendChild(stripEl);
      block._typeSel = typeSel;
      block._strip = stripEl;
      // Remote-only data (space 26 on the Remote's strip); the reminders derive from it
      const rf = Object.assign({ onFreq: false, ic: "", reqClnc: "", depSeq: "", altReq: { alt: "", t: "" }, vksWx: "", frc: false, iafdof: "" }, st && st.remoteFields ? st.remoteFields : {});
      if (!rf.altReq) rf.altReq = { alt: "", t: "" };
      block._rf = rf;
      const rpanel = el("div", "editor-remote");
      block.appendChild(rpanel);
      block._refresh = function () { renderRemotePanel(block, rpanel, stripsWrap); };

      function cellOf(f) { return stripEl.querySelector('.fps-cell[data-f="' + f + '"]'); }
      function valOf(f) { const c = cellOf(f); return c ? c.textContent.trim() : ""; }
      function setCell(f, v) { const c = cellOf(f); if (c && !c.textContent.trim()) c.textContent = v; }

      // next fix outside ZAE (MLU, HEZ, MCB, GCV ... KHEZ) -> the next center's identifier in space 30
      function autoCenter() {
        const nx = valOf("21").toUpperCase().split(/\s+/)[0];
        const nav = window.ZAE && ZAE.NAVAIDS[nx];
        let owner = nav && /^Z/.test(nav.owner) ? nav.owner : null;
        if (!owner && nx === "KHEZ") owner = "ZHU";
        const c30 = cellOf("30");
        if (!c30) return;
        if (owner) { if (!c30.textContent.trim() || c30.dataset.auto === "1") { c30.textContent = owner; c30.dataset.auto = "1"; } }
        else if (c30.dataset.auto === "1") { c30.textContent = ""; delete c30.dataset.auto; }
      }
      // auto-detect strip type + dep/arr arrow from posted/next fix
      function applyArrow() {
        const d = detectFromFixes(valOf("19"), valOf("21"), valOf("11"), valOf("12"), valOf("25"));
        typeSel.value = d.type;
        const arrowCell = cellOf("16");
        if (arrowCell) arrowCell.textContent = d.arrow;
        if (typeof plusHint === "function") plusHint(); // the "+" placeholder in 23 follows the detected type
      }
      // autofill shared static data when this callsign matches another strip
      function autofill() {
        const cs = valOf("3").toUpperCase();
        if (!cs) return;
        const blocks = [].slice.call(stripsWrap.querySelectorAll(".editor-strip"));
        for (let i = 0; i < blocks.length; i++) {
          const other = blocks[i];
          if (other === block) continue;
          const oc = other._strip.querySelector('.fps-cell[data-f="3"]');
          if (oc && oc.textContent.trim().toUpperCase() === cs) {
            STATIC_FIELDS.forEach(function (f) {
              const src = other._strip.querySelector('.fps-cell[data-f="' + f + '"]');
              if (src && src.textContent.trim()) setCell(f, src.textContent.trim());
            });
            break;
          }
        }
      }
      stripEl.addEventListener("input", function (e) {
        const cell = e.target.closest && e.target.closest('.fps-cell[contenteditable]');
        if (!cell) return;
        const f = cell.dataset.f;
        if (f === "3") autofill();
        if (f === "19" || f === "21" || f === "11" || f === "12" || f === "25") applyArrow();
        if (f === "21") autoCenter();
        if (f === "30") delete cell.dataset.auto; // typed by hand: leave it alone from now on
        refreshAll();
      });
      const plusHint = function () { plusHints(); };
      typeSel.addEventListener("change", function () {
        const arrowCell = cellOf("16");
        if (arrowCell) arrowCell.textContent = typeSel.value === "departure" ? "↑" : typeSel.value === "arrival" ? "↓" : "";
        refreshAll();
      });

      stripsWrap.appendChild(block);
      renumber();
      refreshAll();
    }
    function renumber() {
      stripsWrap.querySelectorAll(".editor-strip-n").forEach(function (n, i) { n.textContent = "Strip #" + (i + 1); });
    }
    // Plus-time placeholders: every strip in suspense (a departure strip and the
    // other strips of that callsign) gets a "+" in 23, where the Remote's strip
    // prints the plus time to the next fix; a KMLU departure strip also gets one
    // in 14a for its plus time to STUEE. A lone "+" is dropped when played.
    function plusHints() {
      const blocks = [].slice.call(stripsWrap.querySelectorAll(".editor-strip"));
      const depCs = {};
      blocks.forEach(function (b) { if (blockType(b) === "departure" && blockCs(b)) depCs[blockCs(b)] = true; });
      blocks.forEach(function (b) {
        const type = blockType(b), sp = blockSpaces(b);
        const inSuspense = type === "departure" || !!depCs[blockCs(b)];
        const kmluDep = type === "departure" && String(sp["11"] || "").trim().toUpperCase() === "KMLU";
        const hint = function (f, on) {
          const c = b.querySelector('.fps-cell[data-f="' + f + '"]'); if (!c) return;
          if (on) { if (!c.textContent.trim()) c.textContent = "+"; }
          else if (c.textContent.trim() === "+") c.textContent = "";
        };
        hint("23", inSuspense); hint("14a", kmluDep);
      });
    }
    function refreshAll() { plusHints(); stripsWrap.querySelectorAll(".editor-strip").forEach(function (b) { if (b._refresh) b._refresh(); }); }
    if (existing && existing.strips && existing.strips.length) existing.strips.forEach(addStripEditor);
    else addStripEditor(null);

    form.appendChild(btn("+ Add strip", "btn-ghost", function () {
      addStripEditor(null);
      const blocks = stripsWrap.querySelectorAll(".editor-strip");
      const cs = blocks.length ? blocks[blocks.length - 1].querySelector('.fps-cell[data-f="3"]') : null;
      if (cs) { cs.focus(); cs.scrollIntoView({ block: "center" }); }
    }));

    const saveRow = el("div", "editor-save-row");
    const msg = el("span", "editor-msg");
    function collect() {
      const strips = [];
      stripsWrap.querySelectorAll(".editor-strip").forEach(function (block) {
        const spaces = FPSStrip.readEditable(block.querySelector(".fps-strip"));
        if (Object.keys(spaces).length) strips.push({ type: block._typeSel.value || "enroute", spaces: spaces, remoteFields: cleanFields(block._rf) });
      });
      const altimeters = {};
      ALTIM_SITES.forEach(function (site) { const v = altInputs[site].value.trim(); if (v) altimeters[site] = v; });
      return {
        title: titleIn.value.trim() || "Untitled scenario",
        description: descIn.value.trim(),
        startTime: startIn.value.trim(),
        atis: atisIn.value.trim().toUpperCase(),
        altimeters: altimeters,
        strips: strips
      };
    }

    saveRow.appendChild(btn("← Cancel", "btn-ghost", renderGrid));
    saveRow.appendChild(btn("Preview on the board", "btn-ghost", function () {
      const sc = collect();
      if (!sc.strips.length) { msg.textContent = "Add at least one strip with data."; return; }
      play(sc, currentTab, function () { editScenario({ mode: opts.mode, slot: opts.slot, existing: existing ? Object.assign({}, sc, { id: existing.id }) : sc, isDraft: true }); });
    }));
    if (opts.mode === "community") {
      saveRow.appendChild(btn("Save scenario", "", function () {
        const sc = collect();
        if (!sc.strips.length) { msg.textContent = "Add at least one strip with data."; return; }
        if (existing && existing.id) S.updateCommunity(existing.id, sc); else S.addCommunity(sc);
        currentTab = "community"; renderGrid();
      }));
    } else {
      saveRow.appendChild(btn("Save to slot " + opts.slot, "", function () {
        const sc = collect();
        S.setStaging(opts.slot, sc.strips.length ? sc : null);
        msg.textContent = "Saved to staging slot " + opts.slot + ". Use \"Export static JSON\" to bake it in.";
      }));
      saveRow.appendChild(btn("Export static JSON", "btn-ghost", exportStatic));
    }
    saveRow.appendChild(msg);
    form.appendChild(saveRow);
    app.appendChild(form);
  }

  // ---- the Remote-data panel under an editor strip ----
  function blockSpaces(block) { return FPSStrip.readEditable(block._strip); }
  function blockType(block) { return block._typeSel.value || "enroute"; }
  function blockCs(block) { return (blockSpaces(block)["3"] || "").toUpperCase(); }
  // the flight's first strip: its departure strip, else the earliest center estimate
  function isFirstOfFlight(block, stripsWrap) {
    const cs = blockCs(block); if (!cs) return true;
    const sib = [].slice.call(stripsWrap.querySelectorAll(".editor-strip")).filter(function (b) { return blockCs(b) === cs; });
    if (sib.some(function (b) { return blockType(b) === "departure"; })) return blockType(block) === "departure";
    let first = null, best = Infinity;
    sib.forEach(function (b) { const t = ZAERemote.stripEst({ type: blockType(b), spaces: blockSpaces(b) }); const v = t == null ? 9998 : t; if (v < best) { best = v; first = b; } });
    return first === block;
  }
  function cleanFields(rf) {
    const out = {};
    if (rf.onFreq) out.onFreq = true;
    if (rf.ic) out.ic = rf.ic;
    if (rf.reqClnc) out.reqClnc = rf.reqClnc;
    if (rf.depSeq) out.depSeq = rf.depSeq;
    if (rf.altReq && (rf.altReq.alt || rf.altReq.t)) out.altReq = { alt: rf.altReq.alt || "", t: rf.altReq.t || "" };
    if (rf.vksWx === "yes" || rf.vksWx === "no" || rf.vksWx === true || rf.vksWx === false) out.vksWx = rf.vksWx === true || rf.vksWx === "yes";
    if (rf.frc) out.frc = true;
    if (rf.iafdof) out.iafdof = rf.iafdof;
    return out;
  }
  function timeInput(value, placeholder, onInput) {
    const inp = document.createElement("input");
    inp.type = "text"; inp.className = "editor-input editor-input-xs"; inp.maxLength = 4; inp.placeholder = placeholder || "HHMM"; inp.value = value || "";
    inp.addEventListener("input", function () { onInput(inp.value.replace(/\D/g, "").slice(0, 4)); });
    return inp;
  }
  function renderRemotePanel(block, panel, stripsWrap) {
    const rf = block._rf, type = blockType(block), sp = blockSpaces(block);
    const first = isFirstOfFlight(block, stripsWrap);
    panel.innerHTML = "";
    const head = el("div", "editor-remote-head");
    head.appendChild(el("span", "editor-flabel", "Remote data (space 26 on the Remote's strip)"));
    head.appendChild(el("span", "editor-remote-note", "Space 26 on the strip above = remarks both views show (FRC, …). A departure flight's plus time may be typed in 23 as printed on the Remote's strip; the Controller's strip carries it under space 14."));
    panel.appendChild(head);
    const row = el("div", "editor-remote-row");
    const field = function (label, node) { const w = el("label", "editor-remote-field"); w.appendChild(el("span", "editor-flabel", label)); w.appendChild(node); row.appendChild(w); return w; };
    const refresh = function () { preview(); };
    if (type === "departure") {
      const P = ZAERemote.fromHHMM(ZAERemote.pTime({ spaces: sp }));
      field("Request clearance", timeInput(rf.reqClnc, P != null ? ZAERemote.toHHMM(P - ZAERemote.REQ_BEFORE_P) + " (P−5)" : "P−5", function (v) { rf.reqClnc = v; refresh(); }));
      const seq = document.createElement("input"); seq.type = "number"; seq.min = "1"; seq.max = "9"; seq.className = "editor-input editor-input-xs"; seq.placeholder = "—"; seq.value = rf.depSeq || "";
      seq.addEventListener("input", function () { rf.depSeq = seq.value; refresh(); });
      field("Departure #", seq).title = "Same airport, same request time: the order the requests are made (DEPARTURE #1, #2, …)";
      const frcLab = el("label", "toggle"); const frc = document.createElement("input"); frc.type = "checkbox"; frc.checked = !!rf.frc;
      frc.addEventListener("change", function () {
        rf.frc = frc.checked;
        const c26 = block.querySelector('.fps-cell[data-f="26"]');
        if (c26) { // FRC is written first in space 26 (shown on the strip here, as it will be in play)
          const cur = c26.textContent.replace(/^\s*FRC\b\s*/i, "").trim();
          c26.textContent = frc.checked ? "FRC" + (cur ? " " + cur : "") : cur;
        }
        refresh();
      });
      frcLab.appendChild(frc); frcLab.appendChild(document.createTextNode(" FRC"));
      field("Full route clearance", frcLab).title = "FRC is written first in space 26 on both the Remote's and the Controller's strips: the clearance must state every part of the route in space 25";
    } else if (first && String(sp["17"] || "").trim()) {
      row.appendChild(el("span", "editor-remote-note", "Pilot estimate in space 17: on frequency at the start (ON FREQUENCY on the Remote's strip; the controller checks the altitude as level during the problem)."));
    } else if (first) {
      const w = el("div", "editor-remote-radios");
      const mk = function (label, checked, fn) { const l = el("label", "toggle"); const r = document.createElement("input"); r.type = "radio"; r.name = "ic-" + (block._rid || (block._rid = Math.random().toString(36).slice(2))); r.checked = checked; r.addEventListener("change", function () { if (r.checked) fn(); }); l.appendChild(r); l.appendChild(document.createTextNode(" " + label)); w.appendChild(l); return r; };
      mk("Initial contact at", !rf.onFreq, function () { rf.onFreq = false; block._refresh(); });
      const ic = timeInput(rf.ic, "HHMM", function (v) { rf.ic = v; refresh(); });
      ic.disabled = !!rf.onFreq; w.appendChild(ic);
      mk("On frequency at the start", !!rf.onFreq, function () { rf.onFreq = true; block._refresh(); });
      field("Contact", w);
    } else {
      row.appendChild(el("span", "editor-remote-note", "Not the flight's first strip: contact data is on its first strip (same callsign)."));
    }
    const ar = el("div", "editor-remote-inline");
    const alt = document.createElement("input"); alt.type = "text"; alt.className = "editor-input editor-input-xs"; alt.placeholder = "alt (130)"; alt.maxLength = 3; alt.value = rf.altReq.alt || "";
    alt.addEventListener("input", function () { rf.altReq.alt = alt.value.replace(/\D/g, "").slice(0, 3); refresh(); });
    ar.appendChild(alt); ar.appendChild(document.createTextNode(" at "));
    ar.appendChild(timeInput(rf.altReq.t, "HHMM", function (v) { rf.altReq.t = v; refresh(); }));
    field("Altitude request", ar).title = "Uncommon: the pilot asks for a different altitude at this time";
    if (first && type === "enroute") {
      field("APREQ IAFDOF at", timeInput(rf.iafdof, "HHMM", function (v) { rf.iafdof = v; refresh(); })).title = "The adjacent facility APREQs an altitude inappropriate for direction of flight at this time: APREQ IAFDOF HHMM in 26, RQ mm in 27";
    }
    const dest = (sp["21"] || "").toUpperCase().trim(), route = (sp["25"] || "").toUpperCase().split(/[\s./]+/).filter(Boolean);
    let routeApt = null; for (let i = route.length - 1; i >= 0; i--) if (isAirport(route[i])) { routeApt = route[i]; break; }
    if (type !== "departure" && first && (dest === "KVKS" || routeApt === "KVKS")) {
      const sel = document.createElement("select"); sel.className = "editor-type";
      [["no", "REQ KVKS WX"], ["yes", "HAS KVKS WX"]].forEach(function (o) { const e = document.createElement("option"); e.value = o[0]; e.textContent = o[1]; sel.appendChild(e); });
      if (rf.vksWx == null || rf.vksWx === "") rf.vksWx = "no";
      sel.value = rf.vksWx === true || rf.vksWx === "yes" ? "yes" : "no";
      sel.addEventListener("change", function () { rf.vksWx = sel.value; refresh(); });
      field("KVKS weather", sel);
    }
    panel.appendChild(row);
    const pv = el("div", "editor-remote-preview");
    panel.appendChild(pv);
    function preview() {
      // derive exactly as the player will, from this block's strip and its siblings
      const strips = [].slice.call(stripsWrap.querySelectorAll(".editor-strip")).map(function (b) { return { type: blockType(b), spaces: blockSpaces(b), remoteFields: cleanFields(b._rf), _b: b }; });
      try { ZAERemote.decorateAuthored(strips, { atis: stripsWrap.dataset.atis || null }); } catch (e) { pv.textContent = ""; return; }
      const me = strips.filter(function (s) { return s._b === block; })[0];
      if (!me || !me.remote) { pv.textContent = ""; return; }
      pv.innerHTML = "";
      pv.appendChild(el("span", "editor-flabel", "Remote strip → "));
      pv.appendChild(el("span", null, "26: " + (me.remote.lines26.length ? me.remote.lines26.join(" · ") : "—") + "   27: " + (me.remote.reminders.length ? me.remote.reminders.map(function (r) { return r.k + " " + (r.t == null ? "__" : r.t); }).join(" · ") : "—")));
    }
    preview();
  }

  function fieldWrap(labelText, inputEl) {
    const w = el("div", "editor-field");
    w.appendChild(el("label", "editor-flabel", labelText));
    w.appendChild(inputEl);
    return w;
  }

  function exportStatic() {
    clear();
    app.appendChild(btn("← Back", "btn-ghost", renderGrid));
    app.appendChild(el("h2", "sc-title", "Export static scenarios"));
    app.appendChild(el("p", "sc-desc", "Copy this into assets/data/scenarios.js (replace the window.ZAE_STATIC_SCENARIOS assignment) and commit to bake these in for everyone."));
    const ta = document.createElement("textarea");
    ta.className = "export-box"; ta.rows = 20; ta.readOnly = true;
    ta.value = "window.ZAE_STATIC_SCENARIOS = " + S.exportStatic() + ";";
    app.appendChild(ta);
    const row = el("div", "editor-save-row");
    row.appendChild(btn("Copy to clipboard", "", function () {
      ta.select();
      try { navigator.clipboard.writeText(ta.value); } catch (e) { document.execCommand("copy"); }
    }));
    app.appendChild(row);
  }

  const shared = decodeShare(location.hash);
  if (shared) renderShared(shared); else renderGrid();
  window.addEventListener("hashchange", function () { const sc = decodeShare(location.hash); if (sc) renderShared(sc); });
})();
