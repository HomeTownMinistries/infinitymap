# InfinityMap.org

The website for **The Infinity Map** — a comprehensive life & legacy planning system from HomeTown Ministries International.

> "Because love plans ahead."

## Structure

- `index.html` — the entire site (single static page, no build step)
- `assets/` — logo, mark, favicon, and cover art
- `netlify/functions/deliver-pdf.js` — serverless function that personalizes each Essentials/Legacy PDF at download time (fills the "Prepared For" field, stamps traceable order metadata). See `HANDOFF.md` for the Stripe setup this requires.

## Deployment

This repo is deployed via [Netlify](https://www.netlify.com/) at [infinitymap.org](https://infinitymap.org). Pushing to `main` publishes the site automatically once the Netlify site is linked to this repository (Site configuration → Build & deploy → Link repository). No build command is needed for the static pages; the publish directory is the repo root. Netlify detects `netlify.toml` + `package.json` and installs the function's dependencies (`stripe`, `pdf-lib`) automatically as part of each deploy.
