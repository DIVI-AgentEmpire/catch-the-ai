---
doc: prd
status: approved
---

# Catch the AI: Product Requirements

A detective-style study app for college students: paste your notes, learn a clean summary, then prove you understood by catching 3 fair mistakes the AI hid in it.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

1. The student opens the app and sees the **Start screen**: the name, the tagline, a big notes box, "Try an example," and **Learn**.
2. They paste their notes (or tap **Try an example** to fill in the Law of Demand notes) and click **Learn**.
3. The **Learn screen** shows a short, accurate summary of *their* notes as 4–6 key points. They read it, then click **"I'm ready, test me."**
4. The **Catch screen** (the case file) shows the same content with **exactly 3 planted mistakes**, under the banner "3 mistakes are hidden here" and a counter "0 of 3 found."
5. The student taps a sentence they think is wrong and types the correct idea in their own words.
   - If it's a real mistake and the fix is correct, the sentence gets a red **CAUGHT ✓** stamp and the counter goes up.
   - If it's a real mistake but the fix is wrong or half right, they get feedback and try again.
   - If they tapped a correct sentence, they're told "look again" with a short reason why it's correct.
   - If they're stuck, they can use a **hint** or **Show answers**.
6. The round ends **automatically when all 3 are caught** (with confetti 🎉), or when the student presses **Show answers**.
7. The **Review screen** shows three simple numbers, an honest label, every mistake revealed with the correct fact, and what to revise.
8. **"🔍 Next case: paste your next chapter"** returns them to the Start screen for the next set of notes.

**Success:** the student finishes a round and the Review screen honestly shows what they understood, with no marks number.

## Screens and Layout
Four screens in one simple flow: **Start → Learn → Catch → Review → (Next case) → Start.** There are no menus, accounts, or settings.

- **Start:** the title "Catch the AI" with a magnifying glass icon and the tagline "Prove you understood, not just memorised." Below that, a big text box ("Paste your notes here"), a small **Try an example** button, and one **Learn** button.
- **Learn:** 4–6 summary points and, at the bottom, one button: **"I'm ready, test me."**
- **Catch:** a case-file look. At the top are the banner "3 mistakes are hidden here," the counter "X of 3 found," a **Hint** button and a **Show answers** button. Below them, the content is shown sentence by sentence, with each sentence tappable.
- **Review:** three numbers, the result label, the mistakes revealed, the "what to revise" list, and the **"🔍 Next case"** button.

All screens work on a laptop and a phone-sized screen (`scope.md > The POC Boundary`).

## Look and Feel
Source: `scope.md > Inspiration & Identity`.
- **Theme:** detective. The student is a detective catching the AI's lies. There's a magnifying glass icon, the Catch screen looks like a **case file**, and each found mistake gets a red **"CAUGHT ✓" stamp**.
- **Game moments:** the counter going up, and **confetti when all 3 are caught.** Rewards stay small. The fun comes from stamps and moments, not clutter.
- **Readability first:** the text area stays clean and easy to read, **even at night on a phone.** Use a comfortable text size and spacing, and no crowded screens, because "students read a lot and crowded screens make them tired."
- **Colors:** a warm, paper-like background, dark text, and **one strong accent color.** The red stamp is the game moment.
- **Tone:** friendly and encouraging. Feedback uses light emojis. The low-result message is Gen Z–style motivation.
- **Avoid:** messy symbols, long paragraphs, error codes, and confusing messages (the DIVI MIND formatting problems).

## Features and Behavior

### Notes Input (Start screen)
- The student can paste any study notes into the box.
- **Try an example** fills the box with sample Law of Demand notes.
  - [ ] Clicking **Try an example** fills the box with Law of Demand notes, and **Learn** becomes clickable.
  - [ ] With an empty box, **Learn** is disabled and the hint "Paste your notes first 📝" shows.

### Learn Summary
Source: `scope.md > The Core Loop` (step 1).
- The AI summarizes **only the student's notes** into **4–6 key points** in simple language. Each point is 1–2 sentences, and important terms are **bold**.
- The summary is accurate. Mistakes appear only on the Catch screen.
  - [ ] The summary shows 4–6 points, each 1–2 sentences, with bold key terms.
  - [ ] There are no stray symbols (like `**`, `#`, or `\n`), no long paragraphs, and no facts that aren't in the notes.
  - [ ] An **"I'm ready, test me"** button is at the bottom.

### Planting the Mistakes
Source: `scope.md > Notes Carried to the PRD`.
- The Catch content is the same summary with **exactly 3 sentences changed** to be wrong.
- **Fair mistakes:** each mistake **clearly contradicts the student's notes**. There's no trick wording, spelling games, or tiny word swaps that don't change the meaning.
- **Saved correct fact:** for each planted mistake, the app saves the correct fact from the notes and the topic it's about. All checking and the Review screen use these saved facts.
  - [ ] The Catch screen always has exactly 3 mistakes, and each one directly contradicts something in the notes.
  - [ ] All other sentences match the Learn summary.

### Catching Mistakes (Catch screen)
Source: `scope.md > The Core Loop` (step 2), `scope.md > The Unique Kernel`.
- The student taps a sentence and types a correction in their own words. **Corrections are judged on meaning, not exact words**, by comparing them with the saved correct fact.
- **Correct fix on a real mistake:** a red **CAUGHT ✓** stamp appears on the sentence and the counter goes up ("1 of 3 found").
- **Wrong fix on a real mistake** (e.g., "demand stays the same"): the message is "Right spot 👀 but that's not the correct fix. Check your notes and try again." The sentence stays open and doesn't count as found.
- **Half-right fix** (close but missing the key idea): the message is "Close! 🤏 What exactly changes?" and the student can complete it.
- **After 2 wrong attempts on the same sentence:** a small nudge appears (e.g., "Think about what happens to demand when price goes up").
- **Tapping a correct sentence:** the message is "This one is correct, look again," with a brief reason why it's correct. This counts as a wrong tap.
- **Hint:** tells the student which point (paragraph) has a mistake they haven't found yet. Each use is counted.
- **Show answers:** ends the round early. Unfound mistakes become "missed."
- **All 3 caught:** confetti 🎉, then the student goes on to Review.
  - [ ] Typing the correct idea in different words (e.g., "demand goes down") is accepted as **CAUGHT ✓**.
  - [ ] "Demand stays the same" on the price/demand mistake shows "Right spot 👀…" and isn't counted as found.
  - [ ] Tapping a correct sentence shows "This one is correct, look again" plus a reason, and the wrong-tap count goes up.
  - [ ] After 2 wrong fixes on one sentence, the nudge appears.
  - [ ] The counter shows the right "X of 3 found" at every step.
  - [ ] Catching the 3rd mistake triggers confetti and leads to Review.
  - [ ] **Show answers** ends the round, and unfound mistakes show as "missed" on Review.

### Review and Result
Source: `scope.md > The Core Loop` (step 3).
- **Three simple numbers** and **no marks number:** "Mistakes found: X of 3 · Wrong taps: Y · Hints used: Z." Wrong taps include wrong corrections.
- **Result label:**
  - **3 found, 0–1 wrong taps, no hints:** 👍😄 "Strong understanding"
  - **2 found, or 2 or more wrong taps, or any hints:** 🙂💪 "Getting there"
  - **0–1 found:** 📚 "Revise this chapter," plus a short Gen Z–style motivational line (e.g., "No cap, every topper started here 💯 Read it once more and come back stronger 🚀")
- **Every mistake revealed:** each of the 3 planted sentences is shown next to its correct fact, marked caught or missed.
- **What to revise:** for each mistake missed or gotten wrong, one simple line with the topic plus the correct fact from the notes. For example: "📌 Revise: how price affects demand. Your notes say: when price rises, demand falls." If everything was caught cleanly, it says "Nothing to revise, case closed 🕵️✅."
- **"🔍 Next case: paste your next chapter"** returns to an empty Start screen.
  - [ ] The three numbers match what happened in the round.
  - [ ] The label follows the rules above (e.g., 3 found + 1 hint → "Getting there").
  - [ ] There's no score out of 100 or marks anywhere.
  - [ ] Every planted mistake is shown with its correct fact.
  - [ ] The revise list includes only missed or wrongly answered mistakes, or "Nothing to revise, case closed 🕵️✅."
  - [ ] **Next case** goes back to an empty Start screen.

## States and Boundaries
- **First use:** an empty Start screen, with **Try an example** visible so anyone can test it quickly.
- **Empty notes:** **Learn** is disabled, with the hint "Paste your notes first 📝."
- **Notes too short** (fewer than about 4 sentences): the friendly message "This is too short to hide 3 mistakes 🔍 Paste a bit more, like a full paragraph or a few points." It also suggests **Try an example**. No error codes.
- **Waiting for the AI** *(assumption, accepted)*: a short friendly loading message (e.g., "Investigating your notes… 🔍") while the summary or case file is prepared, and while a correction is checked.
- **AI couldn't respond** *(assumption, accepted)*: a friendly "Something went wrong on our side, try again" message with a retry button. No error codes.
- **What persists:** nothing. Each case is one session. Refreshing or clicking **Next case** starts fresh (`scope.md > The POC Boundary`).

## Product Decisions
- **Notes only, no topic input:** the notes are the source of truth, so the AI can't invent "facts" (the DIVI MIND problem). (`scope.md`)
- **Judge meaning, not exact words:** "understanding matters, not memorised wording."
- **Wrong taps and wrong fixes are counted:** "careless guessing doesn't win."
- **Finding the spot isn't enough:** the fix must be correct to count as caught.
- **Save the correct fact when planting:** checking compares with the saved fact, not a fresh AI guess.
- **No marks number:** "marks don't show understanding." Use three numbers plus an honest, friendly label instead.
- **Friendly Gen Z motivation for low results:** "a low result pushes the student to learn again instead of feeling bad."
- **"2 or more" wrong taps counts as "several."**
- **Detective theme with a clean reading area:** fun stamps and confetti, but text that's easy to read at night.
- **Try an example button:** so anyone can test it quickly.
- **Short revise list (missed ones only):** "short and focused, not a long list."

## What We're Building
Start screen (notes box, Try an example, Learn, empty/short-notes messages) → Learn summary (4–6 clean points) → Catch screen (exactly 3 fair mistakes with saved correct facts, tap + type, meaning-based checking, all feedback messages, nudge, hint, Show answers, counter, CAUGHT ✓ stamp, confetti) → Review screen (three numbers, label + motivation, mistakes revealed, revise list, Next case). Detective look, readable on laptop and phone.

## Deferred From the POC
- **Typing just a topic:** no source of truth for now. (`scope.md > Later`)
- **Accounts and saved history:** each case is one session, and nothing is stored.
- **Deploying online:** optional for the hackathon. (Decide in `4-spec`.)
- **File/PDF upload:** pasting text is enough to prove the idea.

## Possible Later Enhancements
- Topic input with a trusted source.
- Saved progress across chapters ("cases solved").
- PDF upload.
- Difficulty levels (more or subtler mistakes).

## Non-Goals
- **No marks out of 100 or grades:** that's against the core idea.
- **No trick or wording-only mistakes:** mistakes must be fair and contradict the notes.
- **No facts beyond the student's notes:** this avoids invented wrong answers.
- **No login, profiles, or leaderboards:** not needed to prove the idea.

## Open Questions
- **Revise list, "got wrong":** does a mistake that was eventually caught after wrong fixes also go on the revise list? *(Learner accepted: yes.)*
- **Hint limit:** can the hint be used more than once per round? *(Learner accepted: yes, once for each unfound mistake.)*
- **Very long notes:** is there a maximum length? *(Decide in `4-spec`.)*
