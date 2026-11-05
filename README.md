# paidiaconsulting.com

**Working on this with Claude (or any AI assistant)? Read `CLAUDE.md` first.**

Company site, one Railway deployment. Static files served by Caddy.
Push to `main` on GitHub = auto-deploy (~90s). Built June 2026; redesigned
by Nikki in November 2026 (the October site is tag `october-2026-website`).

## What's here

| Path | What | Auth |
|------|------|------|
| `/`, `/about.html`, `/work.html`, `/learn.html`, `/course.html`, `/workshop.html`, `/book.html`, `/contact.html`, `/privacy.html` | Company site (Nikki's design) | public |
| `/presentations/` | Talk decks index | public link, noindex |
| `/oasis/` | Redirect to the Kindle web proxy on Railway | public, unlinked |
| `/google3aa5e6c347787cd4.html` | Search Console verification - do not delete | public |

## Editing the site pages

The site pages are **built**, not edited in place. Nikki's design as delivered lives in
`site-src/b4/`; `site-src/build/optimise.py` makes a faster copy that looks identical
(self-hosted font, per-page inlined CSS, main-photo preload, self-hosted GSAP, unused files
left out - details in `site-src/build/README.md`). To change a page, edit `site-src/b4/`
(or drop in Nikki's next version), then run `site-src/publish.sh`, which rebuilds and copies
the pages and `assets/` into the root. `site-src/` itself is never served.

The private file transfer box (`/files/`) and the Claude message bus
(`/msg/`) ran here as Node sidecars from June to October 2026. Both were
retired on 27 Oct 2026; their code is in git history before that date.

## Operations

- **Build**: Railpack (NOT Nixpacks - `nixpacks.toml` would be ignored).
  `railpack.json` runs `start.sh`, which execs Caddy.
- **Logs/debug**: `railway logs` (CLI must be linked: project
  paidiaconsulting.com).
- **Caddyfile**: blocks `/server/*`, `/site-src/*`, `/start.sh`, `/Caddyfile`,
  `/railpack.json`, `/README.md`, `/.gitignore` from being served;
  `X-Robots-Tag: noindex` on the private areas.

## SEO / favicon / Google Search Console

- **Favicons**: `favicon.ico` (16/32) at root, plus `assets/icons/favicon-{32,48,96}.png`
  and `apple-touch-icon.png`, declared in every page's `<head>` by the build (step
  `favicons`, sources in `site-src/build/vendor/logo/`). 48 and 96 exist because Google
  wants the search-result favicon to be a square multiple of 48px - smaller-only can get ignored.
- **Google Search Console**: the site is a verified URL-prefix property
  (`https://paidiaconsulting.com/`) under the **work** Google account
  `davidgerouvillefarrell@paidiaconsulting.com`. Manage at
  search.google.com/search-console. In Chrome this account lives behind the
  avatar switcher (personal `davidfarrell81@gmail.com` is the default and has
  NO property); work Google is also signed into Edge.
- **🛑 Do NOT delete `google3aa5e6c347787cd4.html`** at the repo root - it's
  the Search Console HTML-file verification token. Google re-checks it; removing
  it un-verifies the property.
- **If a change isn't showing in Google search** (favicon, title, snippet):
  it's almost always crawl lag, not a bug. Google shows its last *cached*
  crawl, which can trail the live site by days-to-weeks. To speed it up:
  Search Console -> URL inspection (paste the page URL) -> **Request indexing**.
  That queues a priority recrawl, usually picked up within a day or two.
  (History: favicon added 9 Jun 2026; 48/96 sizes + verification + reindex
  done 12 Jun 2026 after Rich flagged the generic grey globe in results.)
