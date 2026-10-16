---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn for slices 1–3 (very short explanations, 2–3 lines); fast for slices 4–5

## Slices

- [x] **1. Paste notes, click Learn, and read an AI summary of your own notes**
  Becomes usable: The Start screen (notes box, Try an example, empty / too-short / too-long checks) and the Learn screen showing 4–6 clean points with bold terms, made by a real Groq call through the serverless function. A case file (summary + 3 planted mistakes + saved facts) already comes back with the response, but only the summary is shown.
  Why now: This is the biggest risk. We don't yet know if `openai/gpt-oss-120b` supports strict JSON schema on Groq, and the whole app depends on that one "make the case" call. It also sets up the project (files, package.json, .env.example, the detective look) so every later step has somewhere to land.
  PRD ref: `prd.md > The Core Journey` (steps 1–3), `prd.md > Notes Input (Start screen)`, `prd.md > Learn Summary`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components` (Start Screen, Sample Notes, Learn Screen, Serverless Function, AI Instructions), `spec.md > Data Model`, `spec.md > External Services and Dependencies`, `spec.md > Look and Feel`, `spec.md > File Structure`
  Build: Create the files from the spec's file structure. Write `api/_prompts.js` (Make the Case Instructions + strict schema) and `api/ai.js` ("make-case" action, validation, one retry, length checks, friendly errors). Add Start + Learn screens with input checks, the loading message, and the friendly error with retry. Apply the paper/ink/red look and fonts. If strict schema fails, switch to the JSON-mode fallback and record it under Revisions.
  Verify (mechanical): Run a small Node script that calls `api/ai.js` directly with the sample notes and confirm the returned case passes validation (4–6 points, exactly 3 mistakes in different points, no `*` or `#`). Start `npx vercel dev`, load the page, and confirm `POST /api/ai` returns a case for the sample notes.
  Learner check: Run `npx vercel dev`, open http://localhost:3000, click Try an example, then Learn. You should see "Investigating your notes… 🔍", then 4–6 short points with bold terms and no `**` symbols. Also try an empty box and a two-sentence note to see the friendly messages.
  Commit: `Add Start and Learn screens with Groq make-case function`

- [x] **2. Catch the AI: tap a sentence, fix the mistake, get it stamped**
  Becomes usable: Clicking "I'm ready, test me" opens the case file with the banner, "0 of 3 found," and every sentence tappable, with the 3 wrong versions swapped in. Tapping a correct sentence shows "look again" + the reason (wrong taps +1). Tapping a mistake opens a correction box. Check the Fix asks Groq and shows CAUGHT ✓ (stamp + counter up), "Close! 🤏…", or "Right spot 👀…", with the nudge after 2 non-correct tries.
  Why now: This is the unique kernel, where the AI is confidently wrong and you must understand the material to win. It comes right after the summary works, so we find out early whether catching feels right.
  PRD ref: `prd.md > Catching Mistakes (Catch screen)`, `prd.md > Planting the Mistakes`, `prd.md > The Core Journey` (steps 4–5)
  Spec ref: `spec.md > Components` (Catch Screen, Serverless Function "check-fix", AI Instructions > Check the Fix Instructions), `spec.md > Data Model` (round data), `spec.md > Look and Feel` (case file, stamp)
  Build: Add the "check-fix" action and its schema/instructions. Build the Catch screen with round data (found, attempts, hadWrongFix, wrongTaps), the inline correction box, the "Checking your fix… 🔍" loading state, the three verdict messages, the nudge, the CAUGHT ✓ stamp animation, and the counter.
  Verify (mechanical): Run a Node script calling "check-fix" with the price/demand fact and confirm "demand goes down" → correct and "demand stays the same" → wrong. In `vercel dev`, confirm the Catch page renders 3 swapped sentences and that `POST /api/ai` with check-fix returns a verdict.
  Learner check: With the example notes, click "I'm ready, test me." Tap a sentence you think is correct and you should see "This one is correct, look again" with a reason. Find a planted mistake, type the fix in your own words, and watch for the red CAUGHT ✓ stamp and "1 of 3 found." Try a wrong fix twice to see the nudge.
  Commit: `Add Catch screen with tap, fix checking, and CAUGHT stamp`

- [ ] **3. Test and tune the AI instructions on your own notes**
  Becomes usable: Instructions you've read and tested yourself. The mistakes are fair on both the sample notes and one of your B.Com notes, and "correct / close / wrong" is judged fairly on known answers.
  Why now: Your stated unknown is how the instructions to Groq work. Now that make-case and check-fix both exist, this is the moment to see them fail or pass on real notes and tighten them before we build the rest on top.
  PRD ref: `prd.md > Planting the Mistakes`, `prd.md > Catching Mistakes (Catch screen)` (acceptance criteria), `prd.md > Product Decisions`
  Spec ref: `spec.md > Components` (AI Instructions), `spec.md > Important Failure Modes`, `spec.md > Decisions and Open Issues` (the learner's one unknown)
  Build: Walk through `api/_prompts.js` rule by rule. Run make-case on the sample notes and one of your notes, and judge each planted mistake: does it clearly contradict your notes? Run check-fix on the four known answers (correct in other words, wrong, half answer, repeat of the mistake). You decide which rule to tighten if a result is off, then re-run.
  Verify (mechanical): A small test script runs both note sets through make-case (all pass validation) and the four check-fix answers (verdicts match what's expected). The results are recorded under Revisions or Hands-on Checkpoints as evidence.
  Learner check: Paste one of your own B.Com notes into the app, click Learn and then Test me. For each of the 3 mistakes, say whether it's fair: does it clearly contradict your notes, without trick wording?
  Commit: `Tune AI instructions after testing on real notes`

- [ ] **4. Finish the round: hints, Show answers, confetti, and the Review screen**
  Becomes usable: The whole journey end to end. Hint highlights the point with an unfound mistake. Show answers ends the round. The 3rd catch fires confetti and leads to Review, which shows the three numbers, the honest label (+ Gen Z line for low results), every mistake with its correct fact (caught/missed), the revise list, and Next case back to an empty Start screen.
  Why now: Everything on Review is plain code built from the round data, so it needs the Catch screen (and tuned instructions) underneath it. It's low risk, so it goes after the risky parts.
  PRD ref: `prd.md > Catching Mistakes (Catch screen)` (Hint, Show answers, all 3 caught), `prd.md > Review and Result`, `prd.md > The Core Journey` (steps 6–8)
  Spec ref: `spec.md > Components` (Catch Screen, Review Screen, Confetti), `spec.md > Data Model` (round data), `spec.md > Look and Feel`
  Build: Add hint logic (hinted list, one per unfound mistake, disabled when used up), Show answers → missed, a hand-written `confetti.js`, a Review screen with label rules in the spec's order, the revise list from missed or hadWrongFix, and the Next case reset.
  Verify (mechanical): A Node check runs the label and revise-list functions on sample round data (3 found + 1 hint → "Getting there", 1 found → "Revise this chapter", 3 clean → "Strong understanding", nothing to revise → "case closed"). In `vercel dev`, confirm the page loads with no console errors.
  Learner check: Play a full round with the example notes. Use one hint and catch all 3, and you should see confetti, then Review saying "Getting there" with hints 1. Click Next case, then play again and press Show answers early. The missed mistakes should be listed under "What to revise."
  Commit: `Add hints, Show answers, confetti, and Review screen`

- [ ] **5. Ready to share: phone layout, friendly failures, and README**
  Becomes usable: The app is comfortable on a phone-sized screen. If Groq fails or the key is missing, you see a friendly message with a retry button (never an error code). A README explains what it is and how to run and deploy it.
  Why now: Polish and safety nets come last, once the screens they wrap are final. The README describes the finished app for the GitHub repo in `6-ship`.
  PRD ref: `prd.md > Screens and Layout` (laptop and phone), `prd.md > States and Boundaries` (waiting, AI couldn't respond), `prd.md > Look and Feel`
  Spec ref: `spec.md > Important Failure Modes`, `spec.md > Look and Feel`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > File Structure` (README.md)
  Build: Check and fix the layout at about 375px wide (tap targets, text size, no sideways scrolling). Make sure every failure path (network down, bad key, broken JSON after retry) shows the friendly message + retry. Write README.md.
  Verify (mechanical): Run the function with an invalid key and confirm it returns `{ "error": ... }` with HTTP 500 and no details leak. Grep the webpage for raw error codes. Confirm the CSS has a phone media query and nothing is wider than the screen.
  Learner check: On your phone (or the browser's phone view, F12 → device icon), play a round and check that it's easy to read and tap. Then stop your internet for a moment, click Learn, and confirm you get a friendly "try again" message.
  Commit: `Polish phone layout, friendly errors, and add README`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 2 (the first time you can actually catch the AI), feeding into the slice 3 instruction tuning. Learner played the example round: mistakes fair; CAUGHT stamp, counter, look again and nudge all work. No changes requested; repeat-tap rule kept.
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [what actually happened; real document/test/code references; unfinished work if interrupted]
Route and stops: [actual paths and symbols; guided stops completed, or reference-only route]
Edit outcome: [tried/kept/reverted/declined/not applicable; verification if changed]
Reflection: [offered/answered/declined/already covered — personal answer belongs only in the ignored profile]
Activity mode: [live app and editor, explicit static fallback, focused alternative, prior practice, or recap]

## Revisions

- Confirmed `openai/gpt-oss-120b` supports strict `json_schema` on Groq, so the JSON-mode fallback isn't needed. The build found this model "thinks" before answering, so the first test ran out of answer space; Groq calls now send `max_completion_tokens: 8000` and `reasoning_effort: "low"` (about 4 s per case).
- Added `original_text` to each mistake (an exact copy of the correct sentence), plus a "work in this order" rule. In the first real call the AI put a wrong sentence inside the correct summary; the double-check now rejects that, and fixes a miscounted position when the copied sentence is found elsewhere.
- `api/ai.js` now loads `.env.local` itself when `GROQ_API_KEY` isn't set. Under `vercel dev` (CLI 64.3.1, Windows) the function saw the key as undefined, so Groq answered 401 and the page showed "detective got confused." Deployed Vercel still provides the key through project settings.
- A correct sentence counts as a wrong tap only the first time it's tapped; after that it's greyed out. The PRD didn't say what happens on repeat taps, and counting every tap would punish one guess several times.
