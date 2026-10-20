# Catch the AI 🔍

**Prove you understood, not just memorised.**

A study app for students who want to check they really understand their notes, instead of copying AI answers.

1. **Learn:** paste your notes and the AI gives you a short, clean summary (4–6 points).
2. **Catch:** the same summary comes back with **3 hidden mistakes**. Tap the sentence you think is wrong and type the correct idea in your own words. Right fixes get a red **CAUGHT ✓** stamp. Stuck? Use a 💡 hint or Show answers.
3. **Review:** see what you found, every mistake next to the correct fact, and exactly what to revise. There's no marks number, just an honest label.

No login, and nothing is saved: each case lasts one session.

## How it works

- `index.html`, `style.css`, `app.js`: the four screens (Start, Learn, Catch, Review) in plain HTML, CSS and JavaScript, with no framework.
- `api/ai.js`: a Vercel serverless function. It's the only place that knows the Groq key. It has two jobs:
  - **make-case** turns your notes into the summary + 3 planted mistakes in one call, then double-checks the result (4–6 points, exactly 3 mistakes in different points, no stray symbols) and asks again once if something is off.
  - **check-fix** judges your correction by meaning, not exact words: correct, close, or wrong.
- `api/_prompts.js`: the instructions given to the AI and the JSON "forms" it must fill in. **Read this file to see how the AI is controlled**, including the rules that keep mistakes fair (one fact changed, wrong in real life, never self-contradicting).
- `confetti.js`: a small hand-written confetti effect.
- `sample-notes.js`: built-in Law of Demand notes for **Try an example** (sample data).

AI: [Groq](https://console.groq.com) running `openai/gpt-oss-120b` with strict JSON schema output.

## Run it on your computer

You need [Node.js](https://nodejs.org) (v22 or newer), a free [Groq API key](https://console.groq.com/keys) and a free [Vercel](https://vercel.com) account.

1. Copy `.env.example` to `.env.local` and put your key in it:
   ```
   GROQ_API_KEY=your-key-here
   ```
   `.env.local` is ignored by git, so your key never reaches GitHub.
2. In the project folder, run:
   ```
   npx vercel dev
   ```
   The first time, it asks you to log in and link the project.
3. Open http://localhost:3000, click **Try an example**, then **Learn**.

## Deploy

1. Run `npx vercel` to create a preview deployment.
2. In the Vercel project, open **Settings → Environment Variables** and add `GROQ_API_KEY`.
3. Run `npx vercel --prod`.

## Limits of this proof of concept

- Notes: up to 6,000 characters (about one chapter section) per case.
- Groq's free tier has a per-minute limit, so making many cases in a row may need a short wait.
- The answers live in the webpage's memory. It's a study tool, not an exam: cheating only cheats yourself.
