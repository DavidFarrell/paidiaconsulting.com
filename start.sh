#!/bin/sh
# Static site only: Caddy serves /app. (The files box and message bus
# sidecars were retired 27 Oct 2026.)
exec caddy run --config /app/Caddyfile --adapter caddyfile
