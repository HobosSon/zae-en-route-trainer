/*
 * Scenario storage helpers. Exposed as window.ScenarioStore.
 * - Levels: baked in ZAE_STATIC_SCENARIOS (assets/data/scenarios.js).
 * - Community scenarios: created by anyone, saved to localStorage.
 */
(function (root) {
  "use strict";
  const COMMUNITY_KEY = "zae_community_scenarios";
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
    total: total, getStatic: getStatic,
    listCommunity: listCommunity, addCommunity: addCommunity, updateCommunity: updateCommunity,
    deleteCommunity: deleteCommunity, getCommunity: getCommunity
  };
})(typeof window !== "undefined" ? window : this);
