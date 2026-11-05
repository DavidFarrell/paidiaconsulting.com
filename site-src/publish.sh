#!/bin/sh
# Rebuild the site pages from Nikki's source (site-src/b4/) and copy them into the served root.
# Only the page files and assets/ are replaced; presentations/, oasis/, the Caddyfile and the
# Search Console file are never touched. Check the result locally before committing.
set -e
cd "$(dirname "$0")"
/usr/bin/python3 -I build/optimise.py --src b4 --out dist
cp dist/*.html ..
rsync -a --delete dist/assets/ ../assets/
echo "Published dist/ into the site root. Review with: git -C .. status"
