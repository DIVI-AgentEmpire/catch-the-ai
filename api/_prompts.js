// The instructions we give Groq, plus the "forms" (JSON schemas) it must fill in.
// This is the file to read if you want to understand how the AI is controlled.

// ---------- Job 1: "Make the case" ----------

export const MAKE_CASE_INSTRUCTIONS = `You are making a study game called "Catch the AI" from a student's notes.

RULES (follow every one):
1. Use ONLY the student's notes. Never add facts, numbers, names or examples that are not in the notes. If the notes don't say it, don't write it.
2. Write 4 to 6 points. Each point has 1 or 2 short sentences in simple language. For each sentence, list 1 to 3 key terms in "bold" (copy them exactly as they appear in the sentence). Plain text only: never use markdown symbols such as *, #, _ or backticks.
3. Choose exactly 3 sentences to make wrong, each in a DIFFERENT point and each about a DIFFERENT fact or concept. Never plant two mistakes on the same idea, even in different points or worded differently. (Bad: one mistake says plants make food at night and another says photosynthesis needs darkness, because both test whether photosynthesis needs light. Good: one mistake about light, one about the gas plants take in, one about where food is made.)
4. Fair mistakes only: each wrong version must clearly contradict a specific fact in the notes (for example: reverse a direction, swap cause and effect, or change a key term to a wrong one). Never a spelling trick, never a tiny wording change that keeps the same meaning, never something debatable.
   Change exactly ONE fact per mistake. Keep the rest of the sentence exactly as the original, so the student only has to spot and fix one thing. (Bad: "Giffen goods are normal goods where demand falls when price rises" changes two facts. Good: "Giffen goods are inferior goods where demand falls when price rises" changes one.)
   Swapping two terms counts as ONE fact when it tests one relationship (for example, swapping which change causes a "shift" and which causes a "movement along" the curve).
   The wrong version must be wrong in real life too, not only different from the notes. Never swap one valid example for another valid example. (Bad: changing "fruits like apples or mangoes" to "fruits like apples or bananas", because bananas are also fruits. Good: change the main claim instead, such as "vegetables like apples or mangoes".) Prefer changing the main claim of a sentence over changing its examples.
   Never plant a mistake that another sentence in the notes partly supports. (Bad: if the notes say a tool "helps fix the price", don't write that its purpose is "to find the price".)
   Best mistakes flip one clear fact into its opposite: expensive to cheap, outsiders to insiders, compulsory to optional, rises to falls.
   A wrong sentence must never contradict itself. Change only one part, so the sentence still reads naturally and the student has to think to spot it. (Bad: "water boils at 100 degrees and water boils at 50 degrees", which argues with itself. Good: "water boils at 50 degrees". When a sentence states a rule and its reverse, change both halves together or change only one half and remove nothing, so the two halves still agree with each other.)
   The wrong sentence must read as naturally as the original, like something a textbook could say. Never squeeze words from two different ideas into one odd phrase. (Bad: "plants make food from sunlight in the dark", which mixes two ideas. Good: "plants make food from moonlight".)
   Before you finish, check that your 3 mistakes test 3 different ideas, and check each wrong version: could someone who knows the subject, or another line in the notes, argue that it is also true? If yes, choose a different change.
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
4. If there is a HINT QUESTION, the student may be answering it. Read the answer together with the question: if a short answer (even one word) gives the right answer to the question and that matches the correct fact, it is "correct".
5. Reply only with the JSON verdict.`;

export const VERDICT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["verdict"],
  properties: {
    verdict: { type: "string", enum: ["correct", "close", "wrong"] },
  },
};
