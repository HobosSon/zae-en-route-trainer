/*
 * Scenario storage helpers. Exposed as window.ScenarioStore.
 * - Levels: baked in ZAE_STATIC_SCENARIOS (assets/data/scenarios.js).
 * - Custom scenarios: created by anyone, saved to localStorage.
 */
(function (root) {
  "use strict";
  const CUSTOM_KEY = "zae_community_scenarios" /* key kept from the old Community tab so saved scenarios survive */;
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

  // slot is 1-based
  function getStatic(slot) {
    const baked = STATIC.scenarios ? STATIC.scenarios[slot - 1] : null;
    return baked ? { source: "baked", slot: slot, scenario: baked } : null;
  }

  // ---- custom ----
  function listCustom() { return readJSON(CUSTOM_KEY, []); }
  function addCustom(scenario) {
    const list = listCustom();
    scenario.id = "c" + Date.now() + Math.floor(Math.random() * 1000);
    scenario.createdAt = new Date().toISOString();
    list.push(scenario);
    return writeJSON(CUSTOM_KEY, list) ? scenario : null;
  }
  function updateCustom(id, scenario) {
    const list = listCustom();
    const i = list.findIndex(function (s) { return s.id === id; });
    if (i < 0) return false;
    scenario.id = id; scenario.createdAt = list[i].createdAt;
    list[i] = scenario;
    return writeJSON(CUSTOM_KEY, list);
  }
  function deleteCustom(id) {
    const list = listCustom().filter(function (s) { return s.id !== id; });
    return writeJSON(CUSTOM_KEY, list);
  }
  function getCustom(id) { return listCustom().find(function (s) { return s.id === id; }) || null; }

  root.ScenarioStore = {
    total: total, getStatic: getStatic,
    listCustom: listCustom, addCustom: addCustom, updateCustom: updateCustom,
    deleteCustom: deleteCustom, getCustom: getCustom
  };
})(typeof window !== "undefined" ? window : this);
