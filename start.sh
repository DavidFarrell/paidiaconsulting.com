#!/bin/sh
# Runs the file-store API alongside Caddy in the one Railway service.
node /app/server/files-server.js &
exec caddy run --config /app/Caddyfile --adapter caddyfile
