// Everything the webpage does: screen switching, input checks, calling /api/ai, and the game.

const MAX_NOTES = 6000;
const $ = (id) => document.getElementById(id);

// Memory for the current case. Nothing is saved: refresh = new case.
let caseData = null;
let lastAction = null; // what "Try again" should repeat

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => (s.hidden = s.id !== id));
  window.scrollTo(0, 0);
}

// ---------- Start screen ----------

function countSentences(text) {
  return text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
}

// Returns a friendly message if the notes can't be used yet, or "" if they're fine.
function checkNotes(text) {
  const t = text.trim();
  if (!t) return "Paste your notes first 📝";
  if (t.length > MAX_NOTES) return `That's a lot of notes 📚 Paste one chapter section at a time (up to 6,000 characters). You have ${t.length.toLocaleString()}.`;
  if (countSentences(t) < 4) return "This is too short to hide 3 mistakes 🔍 Paste a bit more, like a full paragraph or a few points. Or tap Try an example.";
  return "";
}

function updateLearnButton() {
  const text = $("notes").value;
  const problem = checkNotes(text);
  // Empty box → simply disabled. Other problems are explained right away.
  $("learn-btn").disabled = problem !== "";
  $("notes-message").textContent = text.trim() ? problem : "Paste your notes first 📝";
}

$("notes").addEventListener("input", updateLearnButton);

$("example-btn").addEventListener("click", () => {
  $("notes").value = window.SAMPLE_NOTES;
  updateLearnButton();
});

$("learn-btn").addEventListener("click", makeCase);

// ---------- Talking to the serverless function ----------

async function callAI(payload) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({ error: "server" }));
  if (!response.ok || data.error) throw new Error(data.error || "server");
  return data;
}

function showWaiting(text) {
  $("waiting-text").textContent = text;
  $("retry-btn").hidden = true;
  $("back-btn").hidden = true;
  showScreen("waiting");
}

function showError(kind) {
  $("waiting-text").textContent =
    kind === "confused"
      ? "Our detective got confused 🕵️ Try again."
      : "Something went wrong on our side, try again 🙏";
  $("retry-btn").hidden = false;
  $("back-btn").hidden = false;
}

$("retry-btn").addEventListener("click", () => lastAction && lastAction());
$("back-btn").addEventListener("click", () => showScreen("start"));

async function makeCase() {
  lastAction = makeCase;
  showWaiting("Investigating your notes… 🔍");
  try {
    caseData = await callAI({ action: "make-case", notes: $("notes").value.trim() });
    renderLearn();
    showScreen("learn");
  } catch (err) {
    showError(err.message);
  }
}

// ---------- Learn screen ----------

function escapeHTML(s) {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}

// Turns a sentence into safe HTML with its key terms in <strong>.
function withBold(text, terms) {
  let html = escapeHTML(text);
  const sorted = [...(terms || [])].filter(Boolean).sort((a, b) => b.length - a.length);
  for (const term of sorted) {
    const safe = escapeHTML(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Only bold text that isn't already inside a <strong> tag.
    html = html.replace(new RegExp(`(?![^<]*</strong>)(${safe})`, "i"), "<strong>$1</strong>");
  }
  return html;
}

function renderLearn() {
  $("summary").innerHTML = caseData.points
    .map((p) => `<p>${p.sentences.map((s) => withBold(s.text, s.bold)).join(" ")}</p>`)
    .join("");
}

$("test-btn").addEventListener("click", startRound);

// ---------- Catch screen ----------

// Memory for the current round. Each list has one entry per mistake (0, 1, 2).
let round = null;

function startRound() {
  round = {
    found: [false, false, false],
    attempts: [0, 0, 0], // non-correct fixes per mistake (for the nudge)
    hadWrongFix: [false, false, false],
    wrongTaps: 0,
    hintsUsed: 0,
    hinted: [],
    missed: [],
    checkedSentences: new Set(), // correct sentences already tapped ("p-s")
    over: false,
  };
  renderCatch();
  updateTools();
  showScreen("catch");
}

// Which mistake (0–2) sits at this point/sentence, or -1 if the sentence is correct.
function mistakeAt(p, s) {
  return caseData.mistakes.findIndex((m) => m.point === p && m.sentence === s);
}

function renderCatch() {
  $("found-count").textContent = round.found.filter(Boolean).length;
  $("round-message").hidden = true;
  $("case-body").innerHTML = caseData.points
    .map((point, p) => {
      const sentences = point.sentences
        .map((s, si) => {
          const m = mistakeAt(p, si);
          // On the Catch screen, the planted wrong version replaces the correct sentence.
          const text = m === -1 ? s.text : caseData.mistakes[m].wrong_text;
          return `<button class="sentence" data-p="${p}" data-s="${si}"><span class="wrong-text">${withBold(text, s.bold)}</span></button>
                  <div class="feedback" id="fb-${p}-${si}" aria-live="polite"></div>`;
        })
        .join("");
      return `<div class="point" id="point-${p}">${sentences}</div>`;
    })
    .join("");
}

$("case-body").addEventListener("click", (e) => {
  const btn = e.target.closest(".sentence");
  if (btn) return tapSentence(btn, Number(btn.dataset.p), Number(btn.dataset.s));
  if (e.target.closest(".check-btn")) return checkFix(Number(e.target.closest(".check-btn").dataset.m));
  if (e.target.closest(".cancel-btn")) return closeFixBox();
});

function closeFixBox() {
  document.querySelectorAll(".fix-box").forEach((box) => box.remove());
  document.querySelectorAll(".sentence.open").forEach((b) => b.classList.remove("open"));
}

function tapSentence(btn, p, s) {
  const m = mistakeAt(p, s);
  const fb = $(`fb-${p}-${s}`);

  if (m === -1) {
    // A correct sentence: count the wrong tap once, explain why it's right.
    const key = `${p}-${s}`;
    if (round.checkedSentences.has(key)) return;
    round.checkedSentences.add(key);
    round.wrongTaps++;
    btn.classList.add("checked");
    fb.innerHTML = `<div>This one is correct, look again 👀</div><div class="why">${escapeHTML(caseData.points[p].sentences[s].why)}</div>`;
    return;
  }

  // A real mistake: open the correction box under it.
  if (btn.classList.contains("open")) return;
  closeFixBox();
  btn.classList.add("open");
  fb.insertAdjacentHTML(
    "afterend",
    `<div class="fix-box" id="fix-${m}">
       <label for="fix-input-${m}" class="visually-hidden">Your correction</label>
       <textarea id="fix-input-${m}" maxlength="500" placeholder="What's the correct idea? Use your own words."></textarea>
       <div class="row">
         <button class="primary check-btn" data-m="${m}">Check the Fix</button>
         <button class="secondary cancel-btn">Cancel</button>
       </div>
     </div>`
  );
  $(`fix-input-${m}`).focus();
}

async function checkFix(m) {
  const input = $(`fix-input-${m}`);
  const answer = input.value.trim();
  const mistake = caseData.mistakes[m];
  const fb = $(`fb-${mistake.point}-${mistake.sentence}`);
  if (!answer) {
    fb.textContent = "Type your fix first ✍️";
    return;
  }

  const checkBtn = document.querySelector(`#fix-${m} .check-btn`);
  checkBtn.disabled = true;
  fb.textContent = "Checking your fix… 🔍";

  const thisRound = round;
  let verdict;
  try {
    ({ verdict } = await callAI({
      action: "check-fix",
      correctFact: mistake.correct_fact,
      wrongSentence: mistake.wrong_text,
      // Once the 💡 hint is on screen, a short answer to its question can be the whole fix.
      hintQuestion: round.attempts[m] >= 2 ? mistake.nudge : "",
      answer,
    }));
  } catch {
    fb.textContent = "Something went wrong on our side, try again 🙏";
    checkBtn.disabled = false;
    return;
  }
  // The round ended (Show answers / Next case) while we were waiting: ignore the answer.
  if (thisRound !== round || round.over) return;

  if (verdict === "correct") return markCaught(m);

  round.attempts[m]++;
  let message;
  if (verdict === "close") {
    message = "Close! 🤏 What exactly changes?";
  } else {
    round.wrongTaps++;
    round.hadWrongFix[m] = true;
    message = "Right spot 👀 but that's not the correct fix. Check your notes and try again.";
  }
  const nudge = round.attempts[m] >= 2 ? `<div class="nudge">💡 ${escapeHTML(mistake.nudge)}</div>` : "";
  fb.innerHTML = `<div>${message}</div>${nudge}`;
  checkBtn.disabled = false;
  input.focus();
}

function markCaught(m) {
  const mistake = caseData.mistakes[m];
  round.found[m] = true;
  closeFixBox();
  const btn = document.querySelector(`.sentence[data-p="${mistake.point}"][data-s="${mistake.sentence}"]`);
  btn.classList.add("caught");
  btn.disabled = true;
  btn.insertAdjacentHTML("beforeend", `<span class="stamp">CAUGHT ✓</span>`);
  $(`fb-${mistake.point}-${mistake.sentence}`).innerHTML = `<div class="fact">✅ Your notes say: ${escapeHTML(mistake.correct_fact)}</div>`;
  clearHint(mistake.point);

  const foundCount = round.found.filter(Boolean).length;
  $("found-count").textContent = foundCount;
  updateTools();
  if (foundCount === 3) {
    round.over = true;
    $("hint-btn").disabled = true;
    $("show-btn").disabled = true;
    $("round-message").textContent = "All 3 caught! 🎉 Case closed.";
    $("round-message").hidden = false;
    window.confetti();
    const thisRound = round;
    setTimeout(() => round === thisRound && showReview(), 2200);
  }
}

// ---------- Hint and Show answers ----------

// The next mistake a hint can point at: not found yet and not hinted yet.
function nextHint() {
  return [0, 1, 2].find((m) => !round.found[m] && !round.hinted.includes(m));
}

function updateTools() {
  $("hint-btn").disabled = round.over || nextHint() === undefined;
  $("show-btn").disabled = round.over;
}

$("hint-btn").addEventListener("click", () => {
  const m = nextHint();
  if (m === undefined) return;
  round.hinted.push(m);
  round.hintsUsed++;
  const point = $(`point-${caseData.mistakes[m].point}`);
  point.classList.add("hinted");
  point.insertAdjacentHTML("afterbegin", `<div class="hint-tag">💡 A mistake is hiding in this point</div>`);
  point.scrollIntoView({ behavior: "smooth", block: "center" });
  updateTools();
});

function clearHint(p) {
  $(`point-${p}`).classList.remove("hinted");
  $(`point-${p}`).querySelector(".hint-tag")?.remove();
}

$("show-btn").addEventListener("click", () => {
  round.over = true;
  showReview();
});

// ---------- Review screen ----------

const MOTIVATION = [
  "No cap, every topper started here 💯 Read it once more and come back stronger 🚀",
  "Not your day, but it's a plot twist, not the ending 📖✨ Revise and run it back 🔁",
  "Lowkey this is how learning works 🧠 One more read and you'll catch them all 🕵️",
];

// The result label, checked in the spec's order.
function resultLabel(r) {
  const found = r.found.filter(Boolean).length;
  if (found <= 1) return { emoji: "📚", text: "Revise this chapter", low: true };
  if (found === 3 && r.wrongTaps <= 1 && r.hintsUsed === 0) return { emoji: "👍😄", text: "Strong understanding" };
  return { emoji: "🙂💪", text: "Getting there" };
}

// Mistakes to revise: missed, or caught only after at least one wrong fix.
function reviseList(r, mistakes) {
  return mistakes.filter((_, i) => !r.found[i] || r.hadWrongFix[i]);
}

function showReview() {
  round.over = true;
  round.missed = [0, 1, 2].filter((m) => !round.found[m]);
  const found = 3 - round.missed.length;
  $("review-numbers").textContent = `Mistakes found: ${found} of 3 · Wrong taps: ${round.wrongTaps} · Hints used: ${round.hintsUsed}`;

  const label = resultLabel(round);
  const line = MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)];
  $("review-label").innerHTML = `<p class="label">${label.emoji} ${label.text}</p>` + (label.low ? `<p class="motivation">${line}</p>` : "");

  $("review-mistakes").innerHTML = caseData.mistakes
    .map((m, i) => {
      const status = round.found[i] ? `<span class="tag caught-tag">CAUGHT ✓</span>` : `<span class="tag missed-tag">MISSED</span>`;
      return `<div class="reveal card">${status}
                <p class="wrong">❌ ${escapeHTML(m.wrong_text)}</p>
                <p class="right">✅ ${escapeHTML(m.correct_fact)}</p>
              </div>`;
    })
    .join("");

  const revise = reviseList(round, caseData.mistakes);
  $("review-revise").innerHTML = revise.length
    ? revise.map((m) => `<p>📌 Revise: ${escapeHTML(m.topic)}. Your notes say: ${escapeHTML(m.correct_fact)}</p>`).join("")
    : `<p>Nothing to revise, case closed 🕵️✅</p>`;

  showScreen("review");
}

$("next-btn").addEventListener("click", () => {
  caseData = null;
  round = null;
  $("notes").value = "";
  updateLearnButton();
  showScreen("start");
});

updateLearnButton();
