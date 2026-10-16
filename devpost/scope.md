---
doc: scope
status: approved
---

# Catch the AI

A study app where you prove you understood your own notes by catching 3 mistakes the AI hid in them.

## The Unique Kernel
The AI is **confidently wrong on purpose**, and you can only win if you actually understand the material. Corrections are judged on **meaning, not exact wording**, and **wrong taps count against you**, so neither memorised phrasing nor careless guessing gets you through. "Marks show what you scored, not what you understood." This shows what you understood.

## Who It's For
A college student like the learner (a B.Com student) studying at home. They've just read a chapter and want to check they really understood it before the exam, often the night before, on their phone or laptop. Today they might ask an AI for answers and copy them without understanding.

## The Core Loop
1. **Learn:** paste your notes, and the AI teaches a short, clear summary of them.
2. **Catch:** click "Test me." The same content appears sentence by sentence, under a banner that says "3 mistakes are hidden here." Tap a sentence you think is wrong and type the correct idea in your own words. If you're right, it turns green and the counter goes up ("1 of 3 found"). If you tap a correct sentence, it says "This one is correct, look again" and briefly explains why. A hint button tells you which paragraph has a mistake.
3. **Review:** your score (including wrong taps), every mistake revealed with the correct fact, and what to revise.

They come back with the next chapter's notes.

## Inspiration & Identity
It should feel like a game. The best moment is catching the AI being confidently wrong, and it should make you feel proud. It should also be honest: the result shows understanding, not memorisation. It needs to be comfortable on a phone as well as a laptop.

## Why This Matters to the Learner
"In exams we memorise without knowing why a concept exists or how to use it. Even toppers forget it when life needs it." They noticed AI makes it easy to copy answers without understanding, and they want a tool where "you can only pass if you really understand the concept." They're also carrying a lesson from their earlier app, DIVI MIND, which gave wrong answers and had formatting problems.

## What "Working" Looks Like
The one-minute demo: paste a short note on the Law of Demand → click **Learn** → short clear summary → click **Test me** → banner "3 mistakes are hidden here" → tap "when price rises, demand rises," type "demand falls" → it turns green, "1 of 3 found" → tap a correct sentence by mistake → "This one is correct, look again" → finish → **Review** screen with the score, every mistake explained, and what to revise.

**"Oh, that's cool" moment:** catching the AI being confidently wrong, then seeing the Review screen explain everything.

## The POC Boundary
- Input is **pasted notes only**. The notes are the source of truth for the summary, the planted mistakes, and checking corrections.
- Learn summary → Catch screen (exactly 3 mistakes, banner, tap and type a correction, meaning-based checking, counter, "look again" feedback with an explanation, paragraph hint) → Review screen (score, wrong taps, mistakes with correct facts, what to revise).
- Works on a laptop and a phone-sized screen.
- One session at a time, with nothing saved between visits.

## Later
- Typing just a topic instead of pasting notes.
- Accounts and saved history or progress.
- Deploying it online (optional for the hackathon).
- File/PDF upload.

## Explicitly Cut
- **Topic-only input (for now):** with no source of truth, the AI could invent wrong "facts," which is the DIVI MIND problem. It's on the Later list.
- **Login and saving:** not needed to prove the kernel in a one-minute demo.

## Notes Carried to the PRD
- **Fair mistakes:** each planted mistake must clearly contradict the student's notes. No trick wording.
- **Saved correct fact:** when the AI plants a mistake, it also saves the correct fact from the notes. Checking compares the student's correction with that saved fact. This avoids the DIVI MIND wrong-answer problem.
