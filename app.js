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

$("test-btn").addEventListener("click", () => showScreen("catch"));

updateLearnButton();
