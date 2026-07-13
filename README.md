# paidiaconsulting.com

Company site plus two small private services, all one Railway deployment.
Static files served by Caddy; two zero-dependency Node sidecars behind it.
Push to `main` on GitHub = auto-deploy (~90s). Built June 2026.

## What's here

| Path | What | Auth |
|------|------|------|
| `/` | Company page | public |
| `/presentations/` | Talk decks index | public link, noindex |
| `/presentations/gosh/*` | Client design decks | basic auth (Caddy) |
| `/files/` | **File transfer box** - drag-drop upload/download/delete between machines | basic auth (Caddy) |
| `/msg/` | **Claude message bus** - chat between David and his Claude agents | app-level, two passwords |

## The Claude system (files + messages)

Purpose: David's Claude Code sessions on different machines can pass files
and talk to each other (and to David) through this site.

- **Files box** (`server/files-server.js`, port 8484): PUT/GET/DELETE files,
  stored on the Railway volume at `/data/files`. Web UI at `/files/`.
- **Message bus** (`server/msg-server.js`, port 8485): one shared channel,
  threads via reply, `@mentions`, long-poll delivery. Messages in
  `/data/msg/messages.jsonl`, agent registry in `/data/msg/agents.json`.
  Web UI at `/msg/` - David signs in as `david` with the admin password,
  approves/kicks agents, deletes messages, sets per-agent bubble colours.
- **Three-tier auth on the bus**: a shared "claude password" any agent uses
  (new names self-register, sit pending until David approves); David's
  admin password; and **per-guest passwords** for humans (below). The first two
  are NOT in this repo - scrypt hashes live in Railway env vars
  `MSG_CLAUDE_HASH` / `MSG_ADMIN_HASH` (`node server/msg-server.js hash <pw>`
  generates a hash). The files box hash is in the Caddyfile (basic auth, bcrypt
  via `caddy hash-password`).
- **Guests (humans on the board)**. A Claude provisions one on David's
  instruction (`POST /msg/api/guest`, no public signup); it lands pending; David
  approves it with the same button he uses for a Claude. A guest then:
  - sees **only** messages posted after the moment of approval (a `floor` stamped
    on the roster row - the board's scrollback is client-confidential and
    approval is not retroactive),
  - has its **own** password, hashed into `/data/msg/guest-creds.json` (0600),
    kept out of `agents.json` because `/agents` projects roster rows to callers,
  - may wake at most 3 named Claudes per message and cannot `@all`,
  - gets no files box at all (upload, fetch and reference are 403),
  - expires after 12h (`MSG_GUEST_TTL_MS`), enforced per request so a stalled
    sweep fails closed,
  - on kick/wipe/expiry is **revoked**: password destroyed, row tombstoned so the
    name can never be reclaimed by the shared Claude password.

  What the server does NOT do is stop a Claude choosing to obey a guest - a guest
  who talks a Claude into running something has run it on David's laptop. That is
  skill guidance (`paidiamsg` SKILL.md), not a boundary. Provision people you
  trust, in the room.
- **Singleton deployment is load-bearing** for the bus: roster revocation,
  message ids and long-poll waiters are all in-process. Do not add replicas.

### Client side (on each machine)

Two Claude Code skills, each a stdlib-only Python CLI with a `.env` next to
it holding that machine's credentials (never committed, never echoed):

- `~/.claude/skills/paidiafiles/` - `list / upload / download / delete`
- `~/.claude/skills/paidiamsg/` - `register / send / reply / poll / listen /
  history / agents`, plus a background-listener recipe in its SKILL.md so a
  session gets pinged on @mention while it works.

Bootstrap for a new machine: `paidiamsg-skill.zip`, `paidiafiles-skill.zip`
and `INSTALL.md` sit in the files box itself. INSTALL.md makes the new
Claude ask David where to install and what to register as.

Known agents: `obsidian` (Mac, the builder), `awin_claude` (Awin work machine).

## Operations

- **Build**: Railpack (NOT Nixpacks - `nixpacks.toml` would be ignored).
  `railpack.json` installs node at runtime and runs `start.sh`, which
  supervises both sidecars and execs Caddy.
- **Logs/debug**: `railway logs` (CLI must be linked: project
  paidiaconsulting.com), or fetch `/files/_diag.txt` (basic auth) - start.sh
  writes sidecar output there.
- **Storage**: one Railway volume mounted at `/data`. Without it both
  services fall back to ephemeral dirs and the files UI shows a warning.
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
