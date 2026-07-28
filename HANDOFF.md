# InfinityMap.org — Project Handoff & State

Read this first. It describes the entire system as of July 28, 2026, so any new working session can continue without prior context.

## What this is

InfinityMap.org sells **The Infinity Map**, a life & legacy planning workbook ("Because love plans ahead.") by **HomeTown Ministries International** (Michael Myers, michael@hometownministries.com; motto: "3 Crosses. 2 Choices. 1 Savior."). The site is a static HTML site in this repo, deployed by **Netlify** from the `main` branch (no build step; publish root). Pushing to `main` deploys to https://infinitymap.org within a minute or two.

## Repo map

- `index.html` — homepage: hero, why-it-matters, what's-inside, Editions (the ONLY individual pricing: Essentials $29.99, Legacy $59.99), Partners section (churches + funeral homes cards), how-to-fill-it-in, free guide + optional Netlify email form (`free-guide`), about, FAQ (incl. not-legal-advice disclaimer), contact.
- `churches.html` — church workshop packages: Small $299 / Medium $499 / Large $799.99 / Mega $999 (unlimited).
- `funeral-homes.html` — Pre-Need Completion Program: Starter 25/$499, Professional 100/$1,499, Premier 250/$2,999, Co-Branded add-on $500.
- Delivery pages (Stripe redirects here after payment; all `noindex`):
  - `download-essentials.html`, `download-legacy.html` — single-edition buyers
  - `download-church.html` — church buyers (workbook + Facilitator Guide + Curriculum + Promo Kit + media kit)
  - `download-funeral.html` — funeral home buyers (workbook + Program Guide + Customer Insert + Certificate + Sales Sheet)
- `free-guide.html` — thank-you/delivery for the free guide email form; `pastor-feedback.html` + `feedback-thanks.html` — pastor feedback form (Netlify form `pastor-feedback`).
- `files/` — all product PDFs. The two workbooks are fillable AcroForms; fill-in text was fixed to 10pt (single-line) / 11pt (multiline) with NeedAppearances=true. Everything else (guides, curriculum, promo kit, inserts, certificate, sales sheet) was authored in-session as HTML → Chromium print-to-PDF.
- `media/` — church media kit: sanctuary slide 1920×1080, text-free background, social square.
- `assets/` — logo.png (square navy), mark.png (transparent symbol+wordmark crop), favicon.png, cover.jpg.

Brand: navy `#00122A`, gold `#C9A227`, cream `#FAF7F2`, red heart accent; serif = Cormorant Garamond (Google Fonts on web; via npm @fontsource when rendering PDFs/images headlessly), sans = Inter.

## Stripe (account: Hometownministries, acct_1Oo6IQRrM8M4C8U3)

Live payment links on the site (each redirects to its delivery page):
- Essentials $29.99 → https://buy.stripe.com/9B614peAk70OdaO5LVcZa0d → download-essentials.html
- Legacy $59.99 → https://buy.stripe.com/fZu14pgIs0Cq9YC2zJcZa0f → download-legacy.html
- Church Small $299 → https://buy.stripe.com/4gM6oJ1Ny5WK1s6b6fcZa05 (promo codes ENABLED for the pastor preview program)
- Church Medium $499 → https://buy.stripe.com/aFaeVf9g084S7Qu1vFcZa06
- Church Large $799.99 → https://buy.stripe.com/dRmeVf77S5WK2wab6fcZa08
- Church Mega $999 → https://buy.stripe.com/4gM14pak42Ky0o24HRcZa07
  (church links redirect to download-church.html)
- FH Starter $499 → https://buy.stripe.com/5kQ28tcscad00o24HRcZa0g
- FH Professional $1,499 → https://buy.stripe.com/9B67sNbo82Kyb2G4HRcZa0h
- FH Premier $2,999 → https://buy.stripe.com/fZufZj77S84S0o27U3cZa0i
- FH Co-Brand $500 → https://buy.stripe.com/5kQbJ33VG5WK0o2fmvcZa0j
  (funeral links redirect to download-funeral.html)

A 100%-off promo code exists for the pastor preview program (10 redemptions max, applies to the Small Church product) — the code itself is in Stripe (Products > Coupons) and in Michael's email drafts; it is deliberately not written here because this repo is public. Old/stale links (Essentials $14.99, both Legacy $29.99 links) were DEACTIVATED — do not reactivate.

## Programs in flight

1. **Pastor preview program** — free Small Church package via PASTORPREVIEW in exchange for feedback at /pastor-feedback.html. Outreach emails were drafted in Michael's Gmail to: four pastors (drafts with names/addresses are in Michael's Gmail Drafts; one is a personal friend asked to pilot with a small group of ~10 — contact details deliberately omitted from this public repo). Watch for form submissions (Netlify → Forms) and fold feedback into materials; "may we quote you = yes" responses feed a future testimonials section.
2. **Funeral home outreach** — sales sheet at files/Funeral_Home_Sales_Sheet.pdf; email template exists in prior conversation; no prospects contacted yet.

## Known to-dos / open items

- **Netlify form notifications**: Michael must toggle email notifications in Netlify → Forms (forms: `free-guide`, `pastor-feedback`) so submissions reach his inbox. ~30 seconds, UI-only.
- **Amazon KDP printed edition** — next big product move; waiting on Michael creating a KDP account and choosing trim size/binding. Then prepare print-ready interior (form fields → write-in lines) and wraparound cover.
- **Google Drive copies of the workbooks are OUTDATED** (pre-font-fix). The site uses the fixed versions in `files/`. Optionally update Drive.
- **Co-brand fulfillment is manual**: when a funeral home buys the $500 add-on, they email their logo; produce a co-branded workbook cover + certificate within 5 business days.
- **Church curriculum/Facilitator Guide and funeral-home documents were authored by an AI session and approved by Michael** — any future edits should preserve their pastoral tone and the compliance language (planning workbook, NOT a will/preneed contract/insurance; encourage attorneys for legal documents).
- Stripe account history note: a dispute/reserve existed on an older account in mid-2026; current account is working. Verify links stay active if payment issues arise.

## Working conventions

- Netlify deploys `main` on push — never create a PR workflow; commit directly to `main`.
- Design PDFs/graphics as HTML and render with headless Chromium (`--print-to-pdf` / `--screenshot`); fonts via `npm install @fontsource/cormorant-garamond @fontsource/inter` when Google Fonts is unreachable.
- Delivery pages are unlisted but public; keep `noindex` on them and never put prices in a countdown/urgency banner (the old site's "prices double" banner is what this redesign removed).
- Individual pricing on the homepage stays at exactly two options (Essentials $29.99 / Legacy $59.99) per Michael's direction; org programs live on their own pages plus homepage Partner cards.
