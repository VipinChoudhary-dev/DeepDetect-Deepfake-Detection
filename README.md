# DeepDetect

A public preview of DeepDetect, an educational site about image verification. The image detector is offline because its model needs a larger server than the free hosting available for this project. The Evidence and Privacy pages remain available, and the Assistant can run through a lightweight Vercel Function.

## Deploy on Vercel

1. Import this GitHub repository into Vercel. Keep **Root Directory** as the repository root. `vercel.json` selects the static `public/` folder; no build command or Python installation is needed.
2. In **Project Settings → Environment Variables**, set `GEMINI_API_KEY` to a new Gemini API key. Set `GEMINI_MODEL` to a model available to that key (the function defaults to `gemini-3.5-flash-lite`). Select Production and Preview if you want chat on both, then redeploy.
3. Open `/`, `/evidence/`, `/assistant/`, and `/privacy/`. Ask the assistant a simple question. Image scanning is intentionally offline.

The Gemini key belongs only in Vercel's server-side environment variables. Never commit it or put it into browser JavaScript. The function has input validation and basic per-instance throttling; provider quotas are recommended for a public site. Gemini usage follows the quotas and billing configured on your Google account.

## Files

- `public/`: static pages, styles, scripts, images, and interactive face visual
- `api/chat.js`: Vercel Function that calls Gemini without exposing the key
- `vercel.json`: static output configuration

Made by Vipin Choudhary.
