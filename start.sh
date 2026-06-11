#!/bin/sh
# Runs the file-store API alongside Caddy in the one Railway service.
# Node output goes to /app/files/_diag.txt, which file_server exposes at
# /files/_diag.txt (behind the same basic auth) - our only window into the
# container since the Railway CLI isn't authenticated.
DIAG=/app/files/_diag.txt
{
  echo "boot: $(date -u +%FT%TZ)"
  echo "node: $(command -v node || echo MISSING)"
  node --version 2>&1
} > "$DIAG" 2>&1 || DIAG=/dev/null

(
  while true; do
    node /app/server/files-server.js >> "$DIAG" 2>&1
    echo "files-server exited (code $?) - restarting in 2s" >> "$DIAG"
    sleep 2
  done
) &

exec caddy run --config /app/Caddyfile --adapter caddyfile
