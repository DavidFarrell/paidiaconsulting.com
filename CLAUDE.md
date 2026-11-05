# paidiaconsulting.com - notes for Claude

Read this before changing anything. It explains how the site is built and run, and what must not break.
Owners: David and Nikki Gérouville-Farrell (Paidia Consulting Ltd). Design: Nikki. Build and plumbing: David.

## The three things that matter most

1. **This repository is PUBLIC on GitHub.** Anything committed, including history, can be read by anyone.
   Never commit client material, passwords, tokens, personal data or private notes.
   Client decks are kept outside this repo and must never be added to it (`.gitignore` blocks
   `presentations/awin/` and `presentations/gosh/` as a safety net).
2. **A push to `main` goes live in about 90 seconds** (Railway auto-deploys from GitHub). Work on a
   branch, check locally, then merge. To undo a bad release, revert the commit and push; the
   pre-redesign site is tag `october-2026-website`.
3. **The site pages are BUILT. Never hand-edit the `.html` files or `assets/` in the repo root.**
   They are overwritten by every build. Edit the source in `site-src/b4/` (or the build in
   `site-src/build/`) and run `site-src/publish.sh`.

## How the site is put together

```
site-src/b4/            Nikki's design as she delivers it (the source of truth for content and look)
site-src/build/         optimise.py + config.json + integrations.js + vendor/ (fonts, GSAP, logo files)
site-src/publish.sh     builds b4 -> site-src/dist, then copies the pages and assets/ into the root
*.html, assets/         BUILD OUTPUT, served to visitors - do not edit by hand
presentations/          public talk decks (link-only, not indexed) - NOT touched by the build
oasis/                  hidden redirect to a separate app - keep
google3aa5e6c347787cd4.html   Google Search Console ownership file - NEVER delete
Caddyfile, start.sh, railpack.json   how the server runs (see Operations)
```

### Editing workflow

1. Change `site-src/b4/` (copy, layout, CSS, images), or drop in Nikki's next exported version over it.
2. Run `site-src/publish.sh`. It needs macOS `/usr/bin/python3`, `npx` (Node, for PurgeCSS 6.0.0)
   and the `trash` command (built into recent macOS).
3. Check it locally (see Testing), review `git status` / `git diff`, commit, push.

If Nikki's new version renames or restructures something the build relies on, the build stops with
an `assert` message naming the page and the text it expected. Read the matching step in
`optimise.py` and update it; don't delete the check.

### What the build does (`site-src/build/optimise.py`)

The comments in `optimise.py` are the detailed reference. In order, the steps are:

| Step | What it does |
|---|---|
| `shell` | Merges a wrapper document the original `index.html` was saved inside |
| `fixes` | Home page title; curly quotes in the course page description; desktop menu labels never wrap |
| `privacy` | Applies the approved privacy-policy updates (see Privacy) on top of Nikki's `privacy.html` |
| `formnotes` | Adds the one-line privacy note under the course, learn and booking forms; contrast fix on the navy course panel; the "sent" look for forms |
| `newlogo` | Copies the current logo stills and header animation from `vendor/logo/` |
| `fonts` | Self-hosts the Manrope font instead of loading Google Fonts |
| `css` | Inlines into each page only the CSS that page can use (PurgeCSS; classes starting `is-`/`has-` etc. are always kept, because scripts add them later) |
| `preload` | Preloads each page's main photo |
| `gsap` | Self-hosts the GSAP animation library instead of loading it from a CDN |
| `favicons` | Favicons from `vendor/logo/` |
| `social` | Link-preview tags and image |
| `integrations` | Writes `config.json` into `integrations.js` and adds it to every page (see below) |
| `prune` | Leaves out files no page uses |

The speed steps are invisible by design: each build was pixel-compared against Nikki's original.
Keep it that way. If you change how something looks, that is a design change for Nikki to agree.

## Forms, sign-ups and events (`site-src/build/config.json` + `integrations.js`)

Nikki's pages build an email draft (`mailto:`) when a form is sent. `integrations.js` replaces that:
it posts the form, shows her thank-you line (`.form-msg`), and on success hides the fields and shows
the line bigger with a tick (`form.is-sent`). On failure the form stays and a "please email us" line shows.

| What | Service | Notes |
|---|---|---|
| Contact form, workshop booking form | **Formspark** (`form_endpoint`) | Belgian, EU-hosted. Each submission is emailed to info@paidiaconsulting.com, which reaches both David and Nikki. Formspark only accepts posts from paidiaconsulting.com ("Allowed domains"), so form tests from localhost are rejected unless localhost is added there. Free allowance: 250 submissions in total, then a one-off top-up. |
| Email course sign-ups (course + learn pages) | **MailerLite** (`course_endpoint`) | Joins the "Email course" group. Single opt-in (no confirmation email). The endpoint replies `{"success":false}` with HTTP 200 on rejection, and the script checks for that. |
| Office hours buttons | **Luma** (`luma_url`, luma.com/paidia) | Monday 17:00-18:00 UK sessions. |

To change an endpoint or a thank-you message, edit `config.json` and run `publish.sh`. Leaving an
endpoint empty falls back to Nikki's email-draft behaviour.

The email course is "AI, from zero to “I get it”" (always curly quotes). The MailerLite automation that
sends it is not live yet. When it goes live, anyone who signed up earlier must be sent day one by hand,
because an automation only fires for people who join after it is switched on.

## Privacy and regulation (UK GDPR / PECR) - do not regress

- **The site makes no requests to outside servers when a page loads**: no Google Fonts, no CDNs, no
  analytics, no cookies, no tracking pixels, no embedded third-party widgets. The privacy policy
  promises this. Keep it true: self-host anything new, and check in the browser's network panel that
  every request goes to paidiaconsulting.com. (Form submissions going to Formspark/MailerLite when a
  visitor presses Send are fine; the policy covers them.)
- **The privacy policy must name every service that handles visitors' data.** Today: Formspark (forms),
  MailerLite (email course), Luma (events), plus hosting. Adding or swapping a service means updating the
  `privacy` step in `optimise.py` and checking that the service offers a data processing agreement (DPA)
  that covers UK data. Ask David before adding one.
- Every form says what the data is used for, next to the form. Keep that line if a form is redesigned.
- In MailerLite: keep open and click tracking OFF in emails, and don't use its AI writing tools or its
  AI-agent connection with subscriber data.
- Sign-up boxes (e.g. "send me updates") must never be ticked by default.

## Operations

- **Hosting**: Railway, one service, builder Railpack (not Nixpacks). `railpack.json` runs `start.sh`,
  which runs Caddy with the `Caddyfile`. Logs: `railway logs` (needs the Railway CLI, linked to the
  project).
- **Caddyfile**: cache headers (HTML 5 minutes, assets 1 hour); `noindex` on `/presentations/*`; returns
  404 for infrastructure paths (`/site-src/*`, `/Caddyfile`, `/start.sh`, `/railpack.json`, `/README.md`,
  `/CLAUDE.md`, `/.gitignore`, `/server/*`). Add new non-public files to that 404 list. Assets aren't fingerprinted,
  so a changed CSS/JS file can take up to an hour to reach returning visitors.
- **Retired, and staying retired**: `/files/` and `/msg/` (removed Oct 2026) and the password-protected
  client deck areas (removed Nov 2026). Don't bring them back on this site.
- **Search Console**: verified by `google3aa5e6c347787cd4.html` (see README). After big content changes,
  request re-indexing there.

## Testing a change before pushing

- Serve the repo locally with the real server config: copy `Caddyfile`, change `root * /app` to the repo
  path, run `PORT=8797 caddy run --config <copy> --adapter caddyfile`, and open http://localhost:8797.
- Check every page you touched at phone width (390 px) and desktop width, with no console errors and no
  missing files.
- For forms, fake the service's reply in the browser (e.g. Puppeteer request interception) rather than
  sending real submissions. Real ones use up the Formspark allowance and land in both inboxes.
- After pushing, re-check the live pages once Railway reports the deploy finished (`railway deployment list`).

## Writing style for anything on the site

- No em dashes: use " - " (space, hyphen, space).
- British spelling. Plain, direct wording; no marketing gloss.
- David's name in full: Dr David Gérouville-Farrell.
- The business is Paidia Consulting Ltd.
