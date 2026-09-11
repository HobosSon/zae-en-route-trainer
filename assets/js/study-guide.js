/*
 * CKT 1 Study Guide. Renders every Block 1 item from quiz.js data
 * (window.QUIZ_BANK / QUIZ_CATS) as a review list grouped by topic, with a
 * topic filter and a flashcard mode that hides answers until revealed.
 */
(function () {
  "use strict";

  const root = document.getElementById("guide");
  const BANK = (window.QUIZ_BANK || []).filter(function (q) { return q.block === 1; });
  const CATS = window.QUIZ_CATS || {};

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  const state = { cat: "all", flash: false };

  function renderControls() {
    const bar = el("div", "sg-controls");

    const catWrap = el("div", "quiz-field");
    catWrap.appendChild(el("label", null, "Topic"));
    const sel = el("select");
    const all = el("option", null, "All topics (" + BANK.length + ")");
    all.value = "all";
    sel.appendChild(all);
    Object.keys(CATS).forEach(function (k) {
      const n = BANK.filter(function (q) { return q.cat === k; }).length;
      if (!n) return;
      const o = el("option", null, CATS[k] + " (" + n + ")");
      o.value = k;
      if (state.cat === k) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", function () { state.cat = sel.value; render(); });
    catWrap.appendChild(sel);
    bar.appendChild(catWrap);

    const flash = el("label", "sg-toggle");
    const cb = el("input");
    cb.type = "checkbox";
    cb.checked = state.flash;
    cb.addEventListener("change", function () { state.flash = cb.checked; render(); });
    flash.appendChild(cb);
    flash.appendChild(document.createTextNode(" Flashcard mode (hide answers)"));
    bar.appendChild(flash);

    return bar;
  }

  function renderItem(q, n) {
    const card = el("article", "sg-card" + (state.flash ? " is-hidden" : ""));
    card.appendChild(el("p", "sg-q", n + ". " + q.q));

    const ans = el("div", "sg-answer");
    ans.appendChild(el("p", "sg-a", "Answer: " + q.choices[q.answer]));
    ans.appendChild(el("p", "sg-explain", q.explain));
    if (q.ref) ans.appendChild(el("p", "quiz-feedback__ref", "Ref: " + q.ref));
    card.appendChild(ans);

    if (state.flash) {
      const btn = el("button", "btn btn-ghost sg-reveal", "Show answer");
      btn.addEventListener("click", function () {
        card.classList.remove("is-hidden");
        btn.remove();
      });
      card.appendChild(btn);
    }
    return card;
  }

  function render() {
    root.innerHTML = "";
    root.appendChild(renderControls());

    const cats = state.cat === "all" ? Object.keys(CATS) : [state.cat];
    let n = 0;
    cats.forEach(function (k) {
      const items = BANK.filter(function (q) { return q.cat === k; });
      if (!items.length) return;
      const sec = el("section", "sg-section");
      sec.appendChild(el("h3", "sg-section__title", CATS[k]));
      items.forEach(function (q) { sec.appendChild(renderItem(q, ++n)); });
      root.appendChild(sec);
    });
  }

  if (!BANK.length) root.appendChild(el("p", "quiz-note", "Question bank failed to load."));
  else render();
})();
