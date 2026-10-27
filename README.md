# paidiaconsulting.com

Company site, one Railway deployment. Static files served by Caddy.
Push to `main` on GitHub = auto-deploy (~90s). Built June 2026.

## What's here

| Path | What | Auth |
|------|------|------|
| `/` | Company page | public |
| `/presentations/` | Talk decks index | public link, noindex |
| `/presentations/gosh/*`, `/presentations/awin/*` | Client design decks | basic auth (Caddy) |

The private file transfer box (`/files/`) and the Claude message bus
(`/msg/`) ran here as Node sidecars from June to October 2026. Both were
retired on 27 Oct 2026; their code is in git history before that date.

## Operations

- **Build**: Railpack (NOT Nixpacks - `nixpacks.toml` would be ignored).
  `railpack.json` runs `start.sh`, which execs Caddy.
- **Logs/debug**: `railway logs` (CLI must be linked: project
  paidiaconsulting.com).
- **Caddyfile**: blocks `/server/*`, `/start.sh`, `/Caddyfile`,
  `/railpack.json` from being served; `X-Robots-Tag: noindex` on the
  private areas.

## SEO / favicon / Google Search Console

- **Favicons**: `favicon.ico` (16/32) at root, plus
  `assets/images/favicon-{32,48,96,180}.png`, all declared in the `<head>`
  of `index.html`. 48 and 96 exist because Google wants the search-result
  favicon to be a square multiple of 48px - smaller-only can get ignored.
  Regenerate from the 180 source: `sips -z 48 48 favicon-180.png --out favicon-48.png`.
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
