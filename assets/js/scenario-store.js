/*
 * Scenario storage helpers. Exposed as window.ScenarioStore.
 * - Static "levels": baked in ZAE_STATIC_SCENARIOS, optionally overlaid by a
 *   local authoring "staging" area (localStorage) so you can build/test before
 *   committing. Staging is per-browser and used only by the temp authoring tool.
 * - Community scenarios: created by anyone, saved to localStorage.
 */
(function (root) {
  "use strict";
  const COMMUNITY_KEY = "zae_community_scenarios";
  const STAGING_KEY = "zae_static_staging";
  const STATIC = (root.ZAE_STATIC_SCENARIOS || { total: 27, scenarios: [] });

  function readJSON(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function writeJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }

  // ---- static levels ----
  function total() { return STATIC.total || 27; }

  function getStaging() { return readJSON(STAGING_KEY, {}); }

  // slot is 1-based
  function getStatic(slot) {
    const baked = STATIC.scenarios ? STATIC.scenarios[slot - 1] : null;
    if (baked) return { source: "baked", slot: slot, scenario: baked };
    const staged = getStaging()[String(slot)];
    if (staged) return { source: "staged", slot: slot, scenario: staged };
    return null;
  }

  function setStaging(slot, scenario) {
    const st = getStaging();
    if (scenario) st[String(slot)] = scenario; else delete st[String(slot)];
    return writeJSON(STAGING_KEY, st);
  }

  // Merged static array for export (baked wins, staged fills gaps)
  function exportStatic() {
    const arr = [];
    for (let i = 1; i <= total(); i++) {
      const got = getStatic(i);
      arr.push(got ? got.scenario : null);
    }
    return JSON.stringify({ total: total(), scenarios: arr }, null, 2);
  }

  // ---- community ----
  function listCommunity() { return readJSON(COMMUNITY_KEY, []); }
  function addCommunity(scenario) {
    const list = listCommunity();
    scenario.id = "c" + Date.now() + Math.floor(Math.random() * 1000);
    scenario.createdAt = new Date().toISOString();
    list.push(scenario);
    return writeJSON(COMMUNITY_KEY, list) ? scenario : null;
  }
  function updateCommunity(id, scenario) {
    const list = listCommunity();
    const i = list.findIndex(function (s) { return s.id === id; });
    if (i < 0) return false;
    scenario.id = id; scenario.createdAt = list[i].createdAt;
    list[i] = scenario;
    return writeJSON(COMMUNITY_KEY, list);
  }
  function deleteCommunity(id) {
    const list = listCommunity().filter(function (s) { return s.id !== id; });
    return writeJSON(COMMUNITY_KEY, list);
  }
  function getCommunity(id) { return listCommunity().find(function (s) { return s.id === id; }) || null; }

  root.ScenarioStore = {
    total: total, getStatic: getStatic, setStaging: setStaging, getStaging: getStaging, exportStatic: exportStatic,
    listCommunity: listCommunity, addCommunity: addCommunity, updateCommunity: updateCommunity,
    deleteCommunity: deleteCommunity, getCommunity: getCommunity
  };
})(typeof window !== "undefined" ? window : this);
