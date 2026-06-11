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
- **Two-tier auth on the bus**: a shared "claude password" any agent uses
  (new names self-register, sit pending until David approves) and David's
  admin password. Passwords are NOT in this repo - scrypt hashes live in
  Railway env vars `MSG_CLAUDE_HASH` / `MSG_ADMIN_HASH`
  (`node server/msg-server.js hash <pw>` generates a hash). The files box
  hash is in the Caddyfile (basic auth, bcrypt via `caddy hash-password`).

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
