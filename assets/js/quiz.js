/*
 * CKT 1 Quiz controller. Requires quiz.js data (window.QUIZ_BANK / QUIZ_CATS); uses Block 1 items.
 * Flow: setup screen (category + length) -> question-by-question with instant
 * feedback and explanation -> results with review of missed items.
 */
(function () {
  "use strict";

  const root = document.getElementById("quiz");
  const BANK = (window.QUIZ_BANK || []).filter(function (q) { return q.block === 1; });
  const CATS = window.QUIZ_CATS || {};

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Build a quiz question with its choices shuffled but the correct index tracked.
  function prepare(item) {
    const order = shuffle(item.choices.map((_, i) => i));
    return {
      item: item,
      choices: order.map((i) => item.choices[i]),
      answerIndex: order.indexOf(item.answer)
    };
  }

  const state = { questions: [], idx: 0, answers: [], cat: "all", count: 10 };

  // Keyboard control: A-D or 1-4 pick an answer; Enter/Space advance once answered.
  // These track the live question so one document listener serves every screen.
  let kbChoices = null;   // array of choice buttons, or null when not on a question
  let kbAnswered = false; // has the current question been answered?
  let kbNext = null;      // the "Next" button once answered

  function keyToIndex(key) {
    const k = key.toLowerCase();
    if (k >= "a" && k <= "d") return k.charCodeAt(0) - 97; // a->0 .. d->3
    if (k >= "1" && k <= "4") return parseInt(k, 10) - 1;  // 1->0 .. 4->3
    return -1;
  }

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = e.target && e.target.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    if (!kbChoices) return;
    if (!kbAnswered) {
      const idx = keyToIndex(e.key);
      if (idx >= 0 && idx < kbChoices.length) {
        e.preventDefault();
        kbChoices[idx].click();
      }
    } else if (kbNext && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      kbNext.click();
    }
  });

  // ---------- Setup screen ----------
  function renderSetup() {
    kbChoices = null; kbNext = null;
    root.innerHTML = "";
    const card = el("div", "quiz-card");
    card.appendChild(el("h3", "quiz-card__title", "Set up your quiz"));

    // category
    const catWrap = el("div", "quiz-field");
    catWrap.appendChild(el("label", null, "Topic"));
    const catSel = el("select");
    const optAll = el("option", null, "All topics");
    optAll.value = "all";
    catSel.appendChild(optAll);
    Object.keys(CATS).forEach(function (k) {
      const n = BANK.filter((q) => q.cat === k).length;
      const o = el("option", null, CATS[k] + " (" + n + ")");
      o.value = k;
      catSel.appendChild(o);
    });
    catWrap.appendChild(catSel);
    card.appendChild(catWrap);

    // length
    const lenWrap = el("div", "quiz-field");
    lenWrap.appendChild(el("label", null, "Number of questions"));
    const lenSel = el("select");
    [5, 10, 15, 20].forEach(function (n) {
      const o = el("option", null, String(n));
      o.value = n;
      if (n === 10) o.selected = true;
      lenSel.appendChild(o);
    });
    const oAll = el("option", null, "All");
    oAll.value = "all";
    lenSel.appendChild(oAll);
    lenWrap.appendChild(lenSel);
    card.appendChild(lenWrap);

    const start = el("button", "btn", "Start quiz");
    start.addEventListener("click", function () {
      state.cat = catSel.value;
      const pool = state.cat === "all" ? BANK : BANK.filter((q) => q.cat === state.cat);
      const n = lenSel.value === "all" ? pool.length : Math.min(parseInt(lenSel.value, 10), pool.length);
      state.questions = shuffle(pool).slice(0, n).map(prepare);
      state.idx = 0;
      state.answers = [];
      renderQuestion();
    });
    card.appendChild(start);

    const meta = el("p", "quiz-note", BANK.length + " questions in the bank across " + Object.keys(CATS).length + " topics.");
    card.appendChild(meta);

    root.appendChild(card);
  }

  // ---------- Question screen ----------
  function renderQuestion() {
    kbChoices = null; kbAnswered = false; kbNext = null;
    root.innerHTML = "";
    const q = state.questions[state.idx];
    const total = state.questions.length;

    // progress
    const prog = el("div", "quiz-progress");
    const bar = el("div", "quiz-progress__bar");
    bar.style.width = ((state.idx) / total) * 100 + "%";
    prog.appendChild(bar);
    root.appendChild(prog);

    const head = el("div", "quiz-qhead");
    head.appendChild(el("span", "quiz-qnum", "Question " + (state.idx + 1) + " / " + total));
    head.appendChild(el("span", "quiz-qcat", CATS[q.item.cat] || ""));
    root.appendChild(head);

    const card = el("div", "quiz-card");
    card.appendChild(el("p", "quiz-question", q.item.q));

    const list = el("div", "quiz-choices");
    let answered = false;
    q.choices.forEach(function (choice, i) {
      const b = el("button", "quiz-choice");
      b.appendChild(el("span", "quiz-choice__key", String.fromCharCode(65 + i)));
      b.appendChild(el("span", "quiz-choice__text", choice));
      b.addEventListener("click", function () {
        if (answered) return;
        answered = true;
        kbAnswered = true;
        const correct = i === q.answerIndex;
        state.answers.push({ q: q, chosen: i, correct: correct });
        Array.prototype.forEach.call(list.children, function (child, ci) {
          child.disabled = true;
          if (ci === q.answerIndex) child.classList.add("is-correct");
          else if (ci === i) child.classList.add("is-wrong");
        });
        const fb = renderFeedback(q, correct);
        card.appendChild(fb);
        kbNext = fb.querySelector(".btn");
      });
      list.appendChild(b);
    });
    card.appendChild(list);
    card.appendChild(el("p", "quiz-kbd-hint", "Keys: A–D or 1–4 to answer · Enter for next"));
    root.appendChild(card);
    kbChoices = Array.prototype.slice.call(list.children);
  }

  function renderFeedback(q, correct) {
    const fb = el("div", "quiz-feedback " + (correct ? "ok" : "no"));
    fb.appendChild(el("div", "quiz-feedback__tag", correct ? "Correct" : "Incorrect"));
    fb.appendChild(el("p", "quiz-feedback__explain", q.item.explain));
    if (q.item.ref) fb.appendChild(el("p", "quiz-feedback__ref", "Ref: " + q.item.ref));
    const next = el("button", "btn", state.idx + 1 < state.questions.length ? "Next question" : "See results");
    next.addEventListener("click", function () {
      if (state.idx + 1 < state.questions.length) {
        state.idx++;
        renderQuestion();
      } else {
        renderResults();
      }
    });
    fb.appendChild(next);
    return fb;
  }

  // ---------- Results screen ----------
  function renderResults() {
    kbChoices = null; kbNext = null;
    root.innerHTML = "";
    const total = state.answers.length;
    const score = state.answers.filter((a) => a.correct).length;
    const pct = total ? Math.round((score / total) * 100) : 0;

    const card = el("div", "quiz-card quiz-result");
    card.appendChild(el("h3", "quiz-card__title", "Results"));
    const scoreEl = el("div", "quiz-score");
    scoreEl.appendChild(el("span", "quiz-score__pct " + (pct >= 70 ? "pass" : "fail"), pct + "%"));
    scoreEl.appendChild(el("span", "quiz-score__frac", score + " of " + total + " correct"));
    card.appendChild(scoreEl);
    card.appendChild(el("p", "quiz-note", pct >= 70 ? "Passing (70% or better)." : "Below the 70% passing mark — review the misses below."));

    const missed = state.answers.filter((a) => !a.correct);
    if (missed.length) {
      card.appendChild(el("h4", "quiz-review__title", "Review — missed questions"));
      missed.forEach(function (a) {
        const r = el("div", "quiz-review");
        r.appendChild(el("p", "quiz-review__q", a.q.item.q));
        r.appendChild(el("p", "quiz-review__ans", "Answer: " + a.q.choices[a.q.answerIndex]));
        r.appendChild(el("p", "quiz-review__explain", a.q.item.explain));
        if (a.q.item.ref) r.appendChild(el("p", "quiz-feedback__ref", "Ref: " + a.q.item.ref));
        card.appendChild(r);
      });
    } else {
      card.appendChild(el("p", "quiz-note", "Perfect score — every question correct."));
    }

    const row = el("div", "quiz-actions");
    const again = el("button", "btn", "New quiz");
    again.addEventListener("click", renderSetup);
    const retry = el("button", "btn btn-ghost", "Retry same topic");
    retry.addEventListener("click", function () {
      const pool = state.cat === "all" ? BANK : BANK.filter((q) => q.cat === state.cat);
      state.questions = shuffle(pool).slice(0, state.questions.length).map(prepare);
      state.idx = 0;
      state.answers = [];
      renderQuestion();
    });
    row.appendChild(again);
    row.appendChild(retry);
    card.appendChild(row);

    root.appendChild(card);
  }

  if (!BANK.length) {
    root.appendChild(el("p", "quiz-note", "Question bank failed to load."));
  } else {
    renderSetup();
  }
})();
