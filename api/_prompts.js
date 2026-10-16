// The instructions we give Groq, plus the "forms" (JSON schemas) it must fill in.
// This is the file to read if you want to understand how the AI is controlled.

// ---------- Job 1: "Make the case" ----------

export const MAKE_CASE_INSTRUCTIONS = `You are making a study game called "Catch the AI" from a student's notes.

RULES (follow every one):
1. Use ONLY the student's notes. Never add facts, numbers, names or examples that are not in the notes. If the notes don't say it, don't write it.
2. Write 4 to 6 points. Each point has 1 or 2 short sentences in simple language. For each sentence, list 1 to 3 key terms in "bold" (copy them exactly as they appear in the sentence). Plain text only: never use markdown symbols such as *, #, _ or backticks.
3. Choose exactly 3 sentences to make wrong, each in a DIFFERENT point.
4. Fair mistakes only: each wrong version must clearly contradict a specific fact in the notes (for example: reverse a direction, swap cause and effect, or change a key term to a wrong one). Never a spelling trick, never a tiny wording change that keeps the same meaning, never something debatable.
5. For each mistake save: "point" and "sentence" (0-based positions of the sentence you changed), "original_text" (an exact copy of that correct sentence from "points"), "wrong_text" (the wrong version, written in the same style as the original), "correct_fact" (the true fact from the notes, in one sentence), "topic" (3 to 6 words), and "nudge" (a question that points toward the fact without giving it away).
6. For EVERY sentence give "why": one short line explaining why the correct version is right, based on the notes.

Work in this order: first write the CORRECT summary in "points" (every sentence true to the notes). Then pick 3 of those sentences and write their wrong versions in "mistakes". Never put a wrong sentence inside "points".`;

export const CASE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["points", "mistakes"],
  properties: {
    points: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["sentences"],
        properties: {
          sentences: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["text", "bold", "why"],
              properties: {
                text: { type: "string" },
                bold: { type: "array", items: { type: "string" } },
                why: { type: "string" },
              },
            },
          },
        },
      },
    },
    mistakes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["point", "sentence", "original_text", "wrong_text", "correct_fact", "topic", "nudge"],
        properties: {
          point: { type: "integer" },
          sentence: { type: "integer" },
          original_text: { type: "string" },
          wrong_text: { type: "string" },
          correct_fact: { type: "string" },
          topic: { type: "string" },
          nudge: { type: "string" },
        },
      },
    },
  },
};

// ---------- Job 2: "Check the fix" ----------

export const CHECK_FIX_INSTRUCTIONS = `You are checking a student's correction in a study game.
The student found a wrong sentence and typed what they think is correct.

RULES:
1. Compare the student's answer with the CORRECT FACT only. Do not use general knowledge.
2. Judge meaning, not wording. Spelling mistakes, short answers and different words are fine.
3. "correct" = the answer states the key idea of the correct fact.
   "close" = partly right, but missing or unclear on the key idea.
   "wrong" = contradicts the correct fact, repeats the wrong sentence, or is unrelated.
4. Reply only with the JSON verdict.`;

export const VERDICT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["verdict"],
  properties: {
    verdict: { type: "string", enum: ["correct", "close", "wrong"] },
  },
};
