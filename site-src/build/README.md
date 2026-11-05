# Build: site-src/b4 -> site-src/dist -> the served root

`optimise.py` makes a faster copy of Nikki's site without changing how it looks. It never edits `site-src/b4/`, so when Nikki sends a new version: drop it in there, run `site-src/publish.sh`, re-check.

```
../publish.sh                                                         # normal use: build + copy into the root
/usr/bin/python3 -I optimise.py --src ../b4 --out ../dist             # build only
/usr/bin/python3 -I optimise.py --src ../b4 --out ../dist --steps css # any subset, comma-separated
```

Needs `npx` (for PurgeCSS 6.0.0) and the `trash` command (the old output goes to the Bin).

| Step | What it does | Why it's invisible |
|---|---|---|
| `shell` | `index.html` was saved from an artifact viewer and had a second document wrapped round it. Merges the two: the shell's small `<style>` goes first in the real `<head>` | Same rules, same order |
| `fonts` | Self-hosts Manrope (`vendor/fonts/`, the exact woff2 files Google serves; latin + latin-ext) and inlines Google's own `@font-face` rules where the Google link was | Same font files, same rules |
| `css` | Each page gets only the CSS rules that can match it (page + all scripts as content, state classes safelisted), inlined in `<head>`; relative `url()`s rebased | Unused rules can't match anything |
| `preload` | Preloads the page's main photo (the `<img fetchpriority="high">`) from the top of `<head>`, with the same `srcset`/`sizes` | Only changes *when* it downloads |
| `gsap` | Serves GSAP 3.12.5 + ScrollTrigger from `assets/vendor/` instead of cdnjs | Same files |

## How each build is checked

1. Full-page screenshots of all 9 pages at 390 / 768 / 1440 px with reduced motion, pixel-diffed against the original (ImageMagick, 1% fuzz). Expected differences: only the workshop countdown clock.
2. Interaction states: menu open, scrolled header, FAQ open, form message, hover, section nav.
3. A spot check with animations on.
4. Speed: real Chrome through a byte-level throttling proxy (bad connection 700 kbps / 400 ms RTT / 6x CPU; slow 4G 1.6 Mbps / 150 ms / 4x), original vs build.

The check scripts (`shots.cjs`, `states.cjs`, `diff.sh`, `throttle-proxy.cjs`, `rt-proxy.cjs`) are in Claude's session scratch folder for now. Move them here if we keep this workflow.

## Fixed by the build (were in Nikki's original)

- The desktop menu pill wrapped "Our work" and "Contact us" onto two lines after scrolling (step `fixes`).
- There was no favicon (step `favicons`).

For the full list of steps (the table above covers only the speed steps), see `CLAUDE.md` at the repo root and the comments in `optimise.py`.
