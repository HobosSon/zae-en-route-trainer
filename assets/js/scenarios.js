/*
 * Practice Scenarios controller. Level-select for 27 static "levels",
 * a Community tab (user-created, saved to localStorage), a read-only player,
 * and a scenario editor (used for Community scenarios and, via the temporary
 * authoring tool, for staging/exporting the static levels).
 * Requires fps-strip.js, scenario-store.js.
 */
(function () {
  "use strict";
  const el = FPSStrip.el;
  const app = document.getElementById("app");
  const S = window.ScenarioStore;

  function clear() { app.innerHTML = ""; }
  function btn(label, cls, fn) { const b = el("button", "btn " + (cls || ""), label); b.addEventListener("click", fn); return b; }

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
    intro.appendChild(el("p", null, "Select a scenario to practice. Levels unlock as they are added."));
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
    intro.appendChild(el("p", null, "Scenarios created by you, saved in this browser. Build your own traffic problems and come back to them."));
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
      info.appendChild(el("p", null, (sc.description || "") + "  ·  " + (sc.strips ? sc.strips.length : 0) + " strips"));
      card.appendChild(info);
      const actions = el("div", "cc-actions");
      actions.appendChild(btn("Play", "", function () { play(sc, "community"); }));
      actions.appendChild(btn("Edit", "btn-ghost", function () { editScenario({ mode: "community", existing: sc }); }));
      actions.appendChild(btn("Delete", "btn-ghost btn-danger", function () {
        if (confirm("Delete \"" + (sc.title || "this scenario") + "\"?")) { S.deleteCommunity(sc.id); renderGrid(); }
      }));
      card.appendChild(actions);
      wrap.appendChild(card);
    });
    app.appendChild(wrap);
  }

  // ---------------- Player ----------------
  function play(scenario, backTab) {
    clear();
    currentTab = backTab || currentTab;
    const head = el("div", "sc-head");
    head.appendChild(btn("← Back", "btn-ghost", renderGrid));
    const nums = el("label", "toggle");
    const cb = document.createElement("input"); cb.type = "checkbox";
    const stripsWrap = el("div", "play-strips");
    function drawStrips() {
      stripsWrap.innerHTML = "";
      (scenario.strips || []).forEach(function (st, i) {
        const card = el("div", "strip-card");
        const tag = el("div", "strip-tag");
        tag.appendChild(el("span", null, "#" + (i + 1)));
        if (st.type) tag.appendChild(el("span", "badge", st.type));
        if (st.spaces && st.spaces["3"]) tag.appendChild(el("span", null, st.spaces["3"] + " · " + (st.spaces["4"] || "")));
        card.appendChild(tag);
        card.appendChild(FPSStrip.render(st.spaces || {}, { showNums: cb.checked }));
        stripsWrap.appendChild(card);
      });
    }
    cb.addEventListener("change", drawStrips);
    nums.appendChild(cb); nums.appendChild(document.createTextNode(" Field numbers"));
    head.appendChild(nums);
    app.appendChild(head);

    app.appendChild(el("h2", "sc-title", scenario.title || "Scenario"));
    if (scenario.description) app.appendChild(el("p", "sc-desc", scenario.description));
    app.appendChild(stripsWrap);
    drawStrips();
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
    const descIn = document.createElement("textarea"); descIn.className = "editor-input"; descIn.placeholder = "Description / instructions (optional)"; descIn.rows = 2; descIn.value = existing ? (existing.description || "") : "";
    form.appendChild(fieldWrap("Title", titleIn));
    form.appendChild(fieldWrap("Description", descIn));

    const stripsWrap = el("div", "editor-strips");
    form.appendChild(stripsWrap);

    function addStripEditor(st) {
      const block = el("div", "editor-strip");
      const bar = el("div", "editor-strip-bar");
      const typeSel = document.createElement("select"); typeSel.className = "editor-type";
      ["", "proposal", "departure", "enroute", "arrival"].forEach(function (t) {
        const o = document.createElement("option"); o.value = t; o.textContent = t ? t : "(type)"; typeSel.appendChild(o);
      });
      if (st && st.type) typeSel.value = st.type;
      bar.appendChild(el("span", "editor-strip-n", "Strip"));
      bar.appendChild(typeSel);
      bar.appendChild(btn("Remove", "btn-ghost btn-xs btn-danger", function () { block.remove(); renumber(); }));
      block.appendChild(bar);
      block.appendChild(FPSStrip.render(st ? st.spaces : null, { editable: true, showNums: true }));
      block._typeSel = typeSel;
      stripsWrap.appendChild(block);
      renumber();
    }
    function renumber() {
      stripsWrap.querySelectorAll(".editor-strip-n").forEach(function (n, i) { n.textContent = "Strip #" + (i + 1); });
    }
    if (existing && existing.strips && existing.strips.length) existing.strips.forEach(addStripEditor);
    else addStripEditor(null);

    form.appendChild(btn("+ Add strip", "btn-ghost", function () { addStripEditor(null); }));

    const saveRow = el("div", "editor-save-row");
    const msg = el("span", "editor-msg");
    function collect() {
      const strips = [];
      stripsWrap.querySelectorAll(".editor-strip").forEach(function (block) {
        const spaces = FPSStrip.readEditable(block.querySelector(".fps-strip"));
        if (Object.keys(spaces).length) strips.push({ type: block._typeSel.value || "enroute", spaces: spaces });
      });
      return { title: titleIn.value.trim() || "Untitled scenario", description: descIn.value.trim(), strips: strips };
    }

    if (opts.mode === "community") {
      saveRow.appendChild(btn("Save scenario", "", function () {
        const sc = collect();
        if (!sc.strips.length) { msg.textContent = "Add at least one strip with data."; return; }
        if (existing) S.updateCommunity(existing.id, sc); else S.addCommunity(sc);
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

  renderGrid();
})();
