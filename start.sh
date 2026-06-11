#!/bin/sh
# Runs the sidecar Node services alongside Caddy in the one Railway service.
# Sidecar output goes to /app/files/_diag.txt, which file_server exposes at
# /files/_diag.txt (behind basic auth) - our window into the container.
DIAG=/app/files/_diag.txt
{
  echo "boot: $(date -u +%FT%TZ)"
  echo "node: $(command -v node || echo MISSING)"
  node --version 2>&1
} > "$DIAG" 2>&1 || DIAG=/dev/null

run_loop() {
  while true; do
    node "$1" >> "$DIAG" 2>&1
    echo "$1 exited (code $?) - restarting in 2s" >> "$DIAG"
    sleep 2
  done
}

run_loop /app/server/files-server.js &
run_loop /app/server/msg-server.js &

exec caddy run --config /app/Caddyfile --adapter caddyfile
