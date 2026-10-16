---
doc: spec
status: approved
---

# Catch the AI: Technical Spec

## How This Works, In Plain Language
Catch the AI has **two pieces**:

1. **The webpage:** plain HTML (the structure), CSS (the look), and JavaScript (the behavior). It shows the four screens (Start, Learn, Catch, Review), runs the game (counter, wrong taps, hints, labels, revise list), and keeps everything for the current case in its memory. Nothing is saved: refresh, and it's a new case.
2. **One serverless function:** a small program on Vercel that runs only when the webpage asks it something. It holds the secret **Groq API key** (the password to your Groq account), so the key is never visible in the webpage. It does two jobs:
   - **"Make the case":** sends your notes to Groq with strict instructions (use **only** these notes, write 4–6 clean points with no markdown symbols, then choose 3 sentences to make clearly wrong and save the correct fact for each). Groq answers in **JSON**, a filled-in form with fixed boxes, so the app always knows where each piece goes.
   - **"Check the fix":** sends the student's correction plus the **saved correct fact**. Groq answers with one word: `correct`, `close`, or `wrong`.

The AI is used only for those two jobs. All counting, scoring and labels are plain code, so they're always exactly right.

**Why this shape:** it's the smallest setup that keeps the API key secret and the AI under control. A database, login or framework wouldn't help prove the idea. They'd only add work and things that can break. The DIVI MIND lessons are built in: **the notes are the only source of truth** (no answering from memory), and **JSON instead of free text** (no stray `**` symbols).

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. **Start screen:** the student pastes notes (or clicks **Try an example**, which fills in the built-in Law of Demand sample). The webpage checks for an empty box, fewer than 4 sentences, or more than 6,000 characters before calling anything.
2. **Click Learn:** the webpage sends the notes to the serverless function with the action "make the case." The function sends them to Groq with the case instructions. Groq returns JSON: the summary points (split into sentences), the 3 mistakes, and the saved facts. The function **double-checks** it (exactly 3 mistakes, 4–6 points, valid positions). If it's broken, the function asks Groq once more, and if it fails again, the webpage shows a friendly error.
3. **Learn screen:** the webpage shows the **correct** summary points, with bold terms.
4. **"I'm ready, test me":** the webpage shows the **same points**, with the 3 planted wrong sentences swapped in. No new AI call is needed because everything came back in step 2.
5. **Tap a sentence:**
   - **Not a mistake:** the webpage shows "This one is correct, look again" plus the short reason that was saved in step 2. Wrong taps +1. No AI call.
   - **A real mistake:** a correction box opens. The student types a fix and the webpage sends it, with the saved correct fact, to the function's "check the fix" action. Groq returns `correct`, `close`, or `wrong`, and the webpage shows CAUGHT ✓, "Close! 🤏…", or "Right spot 👀…". After 2 non-correct attempts on that sentence, it shows the saved nudge.
6. **Hint:** the webpage highlights the point that has an unfound mistake (no AI). **Show answers:** ends the round.
7. **All 3 caught:** confetti, then the Review screen, built entirely by webpage code from what happened in the round.
8. **Next case:** clears memory and returns to an empty Start screen.

## Stack
- **HTML, CSS and plain JavaScript, with no framework.** *Learner choice:* "Simpler is better for this deadline." *Tradeoff accepted:* if the app grew to many screens, a framework like Next.js would organize it better.
- **Vercel serverless function in Node.js (JavaScript).** *Learner choice:* familiar from DIVI MIND, and it keeps the Groq key secret. It uses Node's built-in `fetch`, so no extra packages are needed. Docs: [Vercel Functions](https://vercel.com/docs/functions).
- **Groq for the AI.** *Learner choice:* familiar and fast. Model: **`openai/gpt-oss-120b`** with **strict structured outputs (JSON schema)**. *Recommended by the agent, accepted.* **Unverified:** sources disagree on which Groq models support strict JSON schema. **Build step 1 verifies this with a real call.** Fallback: `response_format: { type: "json_object" }` (JSON mode) on the same or another current model, relying on our own double-check. Docs: [Structured outputs](https://console.groq.com/docs/structured-outputs), [Models](https://console.groq.com/docs/models).
- **No database (Supabase isn't used).** *Learner choice:* "nothing is saved and there's no login."
- **Node.js v24** (already installed) and **git** (installed).

## Where It Runs and How Someone Tries It
- **Requirements:** Node.js (installed), a free Vercel account, a Groq API key.
- **Secret key:** put it in `.env.local` as `GROQ_API_KEY=...`. That file is ignored by git, so it never reaches GitHub. `.env.example` (committed) shows the name with no value.
- **Test on your laptop:** in the project folder, run `npx vercel dev`. The first time, it asks you to log in and link the project. Then open **http://localhost:3000**. This runs the webpage and the serverless function together, just like on Vercel. Docs: [vercel dev](https://vercel.com/docs/cli/dev).
- **Demo recording:** record the local app (or the live link) following the 1-minute demo in `scope.md > What "Working" Looks Like`.
- **Submission:** a **short demo video** and a **public GitHub repository** are both required.
- **Optional deploy (learner wants it):** run `npx vercel` to create a preview, then add `GROQ_API_KEY` in the Vercel project's **Settings → Environment Variables**, then run `npx vercel --prod`. Docs: [Environment variables](https://vercel.com/docs/environment-variables). A live link is a bonus. It doesn't replace the video.

## Look and Feel
From `prd.md > Look and Feel`.
- **Background:** warm paper (about `#f6f1e7`), with cards in a lighter cream (`#fffdf8`).
- **Text:** dark ink (`#22201c`). The body text is large and comfortable (about 18px on phones, line height about 1.6), with a max text width of about 680px.
- **One strong accent:** detective red (about `#b3261e`) for the CAUGHT ✓ stamp, the banner, and the main buttons. Green appears only as a gentle tint on caught sentences.
- **Fonts:** a **typewriter-style** font for headings, the banner and stamps (e.g., Google Font *Special Elite*, falling back to `Courier New`), and a very readable font for all reading text (e.g., *Atkinson Hyperlegible*, falling back to the system font). If the fonts can't load, the system fonts are used.
- **Case file:** the Catch screen sits in a card with a folder "tab" reading "CASE FILE," and the sentences have light spacing between them so each one is easy to tap on a phone.
- **Stamp:** red bordered text "CAUGHT ✓," slightly rotated, with a quick stamp-in animation.
- **Confetti:** a small hand-written effect (about 30 lines of JavaScript) when all 3 are caught. No library.
- **Magnifying glass 🔍** in the title.
- **Copy tone:** friendly, light emojis, Gen Z motivation on low results. Never error codes.
- **Avoid:** crowded screens, long paragraphs, any raw `**` or `#` symbols.

## Components

### Start Screen (`index.html`, `app.js`)
Shows the notes box, **Try an example**, and **Learn**. It checks the input before calling the AI:
- empty → Learn disabled, plus "Paste your notes first 📝"
- fewer than 4 sentences (counted by splitting on `.`, `!`, `?`) → "This is too short to hide 3 mistakes 🔍 Paste a bit more, like a full paragraph or a few points." plus a pointer to Try an example
- more than 6,000 characters → "That's a lot of notes 📚 Paste one chapter section at a time (up to 6,000 characters)."

PRD ref: `prd.md > Notes Input (Start screen)`, `prd.md > States and Boundaries`.

### Sample Notes (`sample-notes.js`)
The built-in Law of Demand notes used by **Try an example**. This is clearly labelled **sample data**.
PRD ref: `prd.md > Notes Input (Start screen)`.

### Learn Screen (`index.html`, `app.js`)
Shows the correct summary points from the case data, each point as a short paragraph, with `bold` terms wrapped in `<strong>` by the code (never raw `**`). Includes the **I'm ready, test me** button.
PRD ref: `prd.md > Learn Summary`.

### Catch Screen (`index.html`, `app.js`)
Shows the case file: the banner, the "X of 3 found" counter, **Hint**, **Show answers**, and every sentence as a tappable item. The 3 mistake sentences show their wrong version. It handles all the tap and fix outcomes in `prd.md > Catching Mistakes (Catch screen)`:
- tapping a non-mistake → "This one is correct, look again" + `why`, wrong taps +1
- tapping a mistake → inline correction box → **Check the Fix** → stamp, "Close! 🤏 What exactly changes?", or "Right spot 👀 but that's not the correct fix. Check your notes and try again."
- `wrong` verdict → wrong taps +1. `close` isn't counted as a wrong tap. After 2 non-correct attempts on the same sentence, the saved `nudge` is shown.
- **Hint** → highlights the point holding the next unfound mistake that hasn't been hinted. Hints used +1. It's disabled once every unfound mistake has been hinted.
- **Show answers** → unfound mistakes become "missed," then Review.
- 3rd catch → confetti → Review (after a short pause).

PRD ref: `prd.md > Catching Mistakes (Catch screen)`.

### Review Screen (`index.html`, `app.js`)
Built entirely from the round's data, with no AI:
- "Mistakes found: X of 3 · Wrong taps: Y · Hints used: Z"
- Label rules, checked in this order:
  1. 0–1 found → 📚 "Revise this chapter" + a random line from a small list of Gen Z motivation lines
  2. 3 found and wrong taps ≤ 1 and hints = 0 → 👍😄 "Strong understanding"
  3. otherwise → 🙂💪 "Getting there"
- All 3 mistakes: the wrong sentence → its correct fact, marked **caught** or **missed**.
- What to revise: one line for each mistake that was **missed or had at least one `wrong` fix** ("📌 Revise: {topic}. Your notes say: {correct fact}"). If there are none → "Nothing to revise, case closed 🕵️✅."
- **🔍 Next case: paste your next chapter** → reset.

PRD ref: `prd.md > Review and Result`.

### Serverless Function (`api/ai.js`)
One endpoint: `POST /api/ai`. It reads `GROQ_API_KEY` from the environment and handles two actions:
- `{ "action": "make-case", "notes": "..." }` → calls Groq with the **Make the Case Instructions** and the case JSON schema, **validates** the result, retries once if invalid, and returns the case JSON.
- `{ "action": "check-fix", "correctFact": "...", "wrongSentence": "...", "answer": "..." }` → calls Groq with the **Check the Fix Instructions** and returns `{ "verdict": "correct" | "close" | "wrong" }`.
- Any failure → `{ "error": "friendly" }` with HTTP 500. The webpage shows its own friendly message. Real error details go only to the server log.

It also rechecks the input length on the server: 6,000 characters for notes and 500 for an answer.
PRD ref: `prd.md > Planting the Mistakes`, `prd.md > Catching Mistakes (Catch screen)`.

### AI Instructions (`api/_prompts.js`)
**This is the file the learner most wants to understand.** It's kept separate so the instructions are easy to read and adjust. (The `_` at the start tells Vercel it isn't a webpage address.)

#### Make the Case Instructions
Rules the instructions must state clearly:
1. **Use ONLY the student's notes.** Never add facts, numbers, names or examples that aren't in the notes. If the notes don't say it, don't write it.
2. Write **4–6 points**, each **1–2 short sentences** in simple language. Mark 1–3 key terms per point in the `bold` list. **Plain text only, with no markdown symbols** (`*`, `#`, `_`, backticks).
3. Choose **exactly 3 sentences** in **3 different points** to make wrong.
4. **Fair mistakes:** each wrong version must **clearly contradict a specific fact in the notes** (e.g., reverse a direction, swap a cause and effect, change a key term to a wrong one). It must not be a spelling trick, a tiny wording change that keeps the same meaning, or something debatable.
5. For each mistake, save: `correct_fact` (from the notes, in one sentence), `topic` (3–6 words), and `nudge` (a question that points toward the fact without giving it away).
6. For **every** sentence, give `why`: one short line on why the correct version is right, based on the notes.

#### Check the Fix Instructions
1. Compare the student's answer with the **saved correct fact only**, not with general knowledge.
2. Judge **meaning, not wording**. Spelling mistakes and different words are fine.
3. `correct` = the answer states the key idea of the correct fact. `close` = partly right but missing or unclear on the key idea. `wrong` = contradicts the fact, repeats the mistake, or is unrelated.
4. Reply only with the JSON verdict.

Both calls use **low temperature** (about 0.2). Temperature is the AI's "creativity" dial, and turning it down makes answers more consistent.
PRD ref: `prd.md > Planting the Mistakes`, `prd.md > Learn Summary`, `prd.md > Product Decisions`.

### Confetti (`confetti.js`)
A small hand-written effect: colored paper pieces falling for about 2 seconds.
PRD ref: `prd.md > Look and Feel`.

## Data Model
Everything lives **in the webpage's memory** (a JavaScript object). Nothing is stored anywhere. If the page is refreshed or **Next case** is clicked, it's gone. This is intended (`prd.md > States and Boundaries`).

**Case data** (returned by "make the case"):
```json
{
  "points": [
    { "sentences": [
        { "text": "When price rises, quantity demanded falls.",
          "bold": ["price", "quantity demanded"],
          "why": "Your notes say demand moves opposite to price." }
    ] }
  ],
  "mistakes": [
    { "point": 0, "sentence": 0,
      "original_text": "When price rises, quantity demanded falls.",
      "wrong_text": "When price rises, quantity demanded also rises.",
      "correct_fact": "When price rises, quantity demanded falls.",
      "topic": "how price affects demand",
      "nudge": "Think about what happens to demand when price goes up." }
  ]
}
```
`points` is the **correct** summary. On the Catch screen, the webpage swaps in `wrong_text` at each mistake's position.

**Round data** (webpage only): `found` (which mistakes are caught), `attempts` (non-correct tries per mistake), `hadWrongFix` (per mistake), `wrongTaps`, `hintsUsed`, `hinted` (which mistakes have been hinted), `missed`.

**Validation in `api/ai.js`:** 4–6 points; every sentence has text; exactly 3 mistakes; each `point`/`sentence` position exists; the 3 mistakes are in different points; `original_text` matches the sentence at that position; `wrong_text` differs from the original sentence; no `*` or `#` characters in any text.

## File Structure
```
catch-the-ai/
├── index.html          # All four screens (Start, Learn, Catch, Review); only one is shown at a time
├── style.css           # Detective look: paper background, red accent, stamp, case file, phone-friendly
├── app.js              # Screen switching, input checks, game logic, Review building, calls to /api/ai
├── sample-notes.js     # SAMPLE DATA: Law of Demand notes for "Try an example"
├── confetti.js         # Small hand-written confetti effect
├── api/
│   ├── ai.js           # Serverless function: holds the Groq key, "make-case" + "check-fix", validation
│   └── _prompts.js     # The instructions to Groq + JSON schemas (the learning focus)
├── package.json        # Project name + "type": "module" (no extra packages)
├── .env.example        # GROQ_API_KEY= (no real value; safe to commit)
├── .env.local          # Your real key (git-ignored, never committed)
├── .gitignore          # Already ignores the learner profile and .env files
├── README.md           # What it is, how to run it locally, how to deploy
└── devpost/            # Devpost learning workspace (plans)
```

## External Services and Dependencies

### Groq API
- **Endpoint:** `POST https://api.groq.com/openai/v1/chat/completions`
- **Auth:** header `Authorization: Bearer $GROQ_API_KEY`
- **Payload (shape):**
  ```json
  { "model": "openai/gpt-oss-120b",
    "temperature": 0.2, "max_completion_tokens": 8000, "reasoning_effort": "low",
    "messages": [ { "role": "system", "content": "<instructions>" },
                  { "role": "user", "content": "<notes or fix details>" } ],
    "response_format": { "type": "json_schema",
      "json_schema": { "name": "case_file", "strict": true, "schema": { } } } }
  ```
- **Response:** `choices[0].message.content` is a JSON **string**. Parse it with `JSON.parse`, then validate it.
- **Strict schema rule:** every object needs `"additionalProperties": false` and all of its fields listed in `"required"`.
- **Cost and limits:** Groq has a free tier with rate limits per minute and per day. **Not verified for this model; check at build step 1.** [Rate limits](https://console.groq.com/docs/rate-limits).
- **Docs:** [Structured outputs](https://console.groq.com/docs/structured-outputs) · [Models](https://console.groq.com/docs/models) · [API reference](https://console.groq.com/docs/api-reference)

### Vercel
- Hosts the static files and runs `api/ai.js` as a function. Free hobby plan. The `GROQ_API_KEY` environment variable is set in project settings.
- **Docs:** [Functions](https://vercel.com/docs/functions) · [vercel dev](https://vercel.com/docs/cli/dev) · [Environment variables](https://vercel.com/docs/environment-variables)

### Google Fonts (optional)
*Special Elite* and *Atkinson Hyperlegible*, via a `<link>` tag. If they're offline or blocked, the system fonts are used.

## Important Failure Modes
- **The AI returns broken JSON, the wrong number of mistakes, or markdown symbols** → the function catches it with validation and asks Groq once more. If it fails again, the user sees "Our detective got confused 🕵️ Try again," with a retry button.
- **Groq is slow, down, or rate-limited** → a loading message ("Investigating your notes… 🔍" or "Checking your fix… 🔍"). On failure: "Something went wrong on our side, try again 🙏," with a retry button. No error codes.
- **A planted mistake isn't fair** (too subtle, or not in the notes) → prevented by the instructions and checked by testing with the sample notes plus a second set of notes during the build. If needed, the instructions get tightened.
- **The check-fix judgment is too strict or too loose** → tested with known answers ("demand goes down" → correct, "demand stays the same" → wrong, a half answer → close) and the instructions adjusted.

## What Was Simplified and Why
- **Answers live in the webpage's memory** instead of being hidden on a server. *Learner choice:* "Cheating only cheats yourself… it's a study tool, not an exam." Fully hiding them would need a database or session storage on the server.
- **No database or login:** nothing needs to be saved for the proof of concept.
- **No framework:** four screens in plain HTML/CSS/JS are easier to read and debug.
- **One AI call makes the whole case** (summary + mistakes + facts + reasons + nudges) instead of separate calls. It's faster, and the Catch content always matches the Learn summary.
- **Hand-written confetti and a sentence counter** instead of libraries.
- **Built-in sample notes** for Try an example (labelled sample data). The real kernel (planting and checking on the student's notes) is never faked.

## Decisions and Open Issues

**Learner decisions**
- Groq for the AI and Vercel for hosting. No Supabase. (Familiar tools, and nothing is saved.)
- Plain HTML/CSS/JS plus one Vercel serverless function. ("Simpler is better for this deadline.")
- Answers stay in the webpage. Hiding them is later.
- Notes limit of 6,000 characters.
- Test locally first with `vercel dev`, then deploy (optional).

**Derived implementation details (agent, following those decisions)**
- `openai/gpt-oss-120b` with strict JSON schema, at temperature 0.2. Fallback is JSON mode.
- A `close` verdict isn't counted as a wrong tap. Both `close` and `wrong` count toward the 2-attempt nudge.
- The "too short" check counts sentences by punctuation (fewer than 4).
- A hint highlights one unfound mistake's point per press.

**The learner's one unknown:** *"How the instructions to Groq are written: how we tell the AI to use only my notes, plant exactly 3 fair mistakes, and judge 'close' vs 'correct' fairly."*
- **What clarified it so far:** the rules are written out under **AI Instructions** above. Each rule maps to a DIVI MIND problem (answering from memory → "ONLY the notes," raw `**` → JSON plus "no markdown symbols") or to a PRD requirement (fair mistakes, meaning-based checking).
- **How it'll be learned during the build:** a dedicated build step where the learner reads `api/_prompts.js` rule by rule, then runs the agreed tests: the sample notes plus one of their own B.Com notes for fair mistakes, and the four known answers for check-fix. If a result is wrong, the learner decides which rule to tighten. **Evidence:** those test results recorded in the build checklist.

**Open (verify early in the build)**
- Does `openai/gpt-oss-120b` support strict `json_schema` on Groq today, and what are its free-tier limits? (Build step 1.)

**Carried from `prd.md > Open Questions`:** all resolved. The revise list includes mistakes with a wrong fix, the hint can be used once per unfound mistake, and the notes limit is 6,000 characters.
