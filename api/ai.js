// The serverless function: the only place that knows the Groq key.
// POST /api/ai  { action: "make-case", notes }
//              { action: "check-fix", correctFact, wrongSentence, answer }

import { MAKE_CASE_INSTRUCTIONS, CASE_SCHEMA, CHECK_FIX_INSTRUCTIONS, VERDICT_SCHEMA } from "./_prompts.js";

// `vercel dev` doesn't pass .env.local to this function, so on your laptop we read it ourselves.
// Once deployed, Vercel provides GROQ_API_KEY and this does nothing.
if (!process.env.GROQ_API_KEY) {
  try { process.loadEnvFile(".env.local"); } catch { /* no file: running on Vercel */ }
}
if (!process.env.GROQ_API_KEY) console.error("GROQ_API_KEY is missing: add it to .env.local");

const GROQ_URL ="https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b";
const MAX_NOTES = 6000;
const MAX_ANSWER = 500;

async function askGroq(instructions, userText, schemaName, schema) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      max_completion_tokens: 8000,
      reasoning_effort: "low",
      messages: [
        { role: "system", content: instructions },
        { role: "user", content: userText },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: schemaName, strict: true, schema },
      },
    }),
  });
  if (!response.ok) {
    throw new Error(`Groq ${response.status}: ${await response.text()}`);
  }
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

const same = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

// If the AI copied the right sentence but counted its position wrong, fix the position.
function fixPositions(c) {
  for (const m of c?.mistakes || []) {
    if (same(c.points?.[m.point]?.sentences?.[m.sentence]?.text ?? "", m.original_text)) continue;
    c.points.forEach((p, pi) => p.sentences.forEach((s, si) => {
      if (same(s.text, m.original_text)) { m.point = pi; m.sentence = si; }
    }));
  }
  return c;
}

// Double-check the AI's case file. Returns a problem description, or null if it's fine.
export function findCaseProblem(c) {
  if (!c || !Array.isArray(c.points) || !Array.isArray(c.mistakes)) return "missing points or mistakes";
  if (c.points.length < 4 || c.points.length > 6) return `has ${c.points.length} points`;
  for (const p of c.points) {
    if (!Array.isArray(p.sentences) || p.sentences.length === 0) return "a point has no sentences";
    for (const s of p.sentences) {
      if (!s.text || !s.text.trim()) return "empty sentence";
      if (/[*#]/.test(s.text + s.why)) return "markdown symbols";
    }
  }
  if (c.mistakes.length !== 3) return `has ${c.mistakes.length} mistakes`;
  const usedPoints = new Set();
  for (const m of c.mistakes) {
    const original = c.points[m.point]?.sentences[m.sentence];
    if (!original) return "mistake points at a sentence that doesn't exist";
    if (same(original.text, m.wrong_text)) return "wrong sentence was put inside the correct summary";
    if (!same(original.text, m.original_text)) return "mistake position doesn't match its original sentence";
    if (usedPoints.has(m.point)) return "two mistakes in the same point";
    usedPoints.add(m.point);
    if (!m.wrong_text || m.wrong_text.trim() === original.text.trim()) return "wrong_text is the same as the original";
    if (/[*#]/.test(m.wrong_text + m.correct_fact)) return "markdown symbols";
  }
  return null;
}

async function makeCase(notes) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const c = fixPositions(await askGroq(MAKE_CASE_INSTRUCTIONS, notes, "case_file", CASE_SCHEMA));
      const problem = findCaseProblem(c);
      if (!problem) return c;
      console.error(`make-case attempt ${attempt} invalid: ${problem}`);
    } catch (err) {
      console.error(`make-case attempt ${attempt} failed:`, err.message);
    }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Please use the app 🙂" });
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

  if (body.action === "make-case") {
    const notes = String(body.notes || "").trim();
    if (!notes || notes.length > MAX_NOTES) {
      return res.status(400).json({ error: "Please paste between a paragraph and 6,000 characters of notes." });
    }
    const c = await makeCase(notes);
    if (!c) return res.status(500).json({ error: "confused" });
    return res.status(200).json(c);
  }

  if (body.action === "check-fix") {
    const answer = String(body.answer || "").trim();
    if (!answer || answer.length > MAX_ANSWER || !body.correctFact) {
      return res.status(400).json({ error: "Type your fix in a sentence or two (up to 500 characters)." });
    }
    const question = `CORRECT FACT: ${body.correctFact}\nWRONG SENTENCE: ${body.wrongSentence || ""}\nSTUDENT'S ANSWER: ${answer}`;
    try {
      const { verdict } = await askGroq(CHECK_FIX_INSTRUCTIONS, question, "verdict", VERDICT_SCHEMA);
      return res.status(200).json({ verdict });
    } catch (err) {
      console.error("check-fix failed:", err.message);
      return res.status(500).json({ error: "server" });
    }
  }

  return res.status(400).json({ error: "Unknown action" });
}
