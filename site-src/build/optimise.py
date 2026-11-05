"""Build "B4 optimised/" from Nikki's untouched "B4 unzipped/".

Re-run from scratch whenever Nikki sends a new version: it never edits the source folder.
Every step is meant to be visually invisible; each one is checked with full-page pixel diffs
against the source (see README / Performance audit).

usage: python3 -I optimise.py [--steps fonts,shell]
"""
import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
SRC = PROJECT / "B4 unzipped"
OUT = PROJECT / "B4 optimised"
VENDOR = Path(__file__).resolve().parent / "vendor"

ALL_STEPS = ["shell", "fixes", "fonts", "css", "preload", "gsap", "favicons", "social", "integrations", "prune"]


def fresh_copy():
    if OUT.exists():
        subprocess.run(["trash", str(OUT)], check=True)
    shutil.copytree(SRC, OUT)


def pages():
    return sorted(OUT.glob("*.html"))


# --- Step: self-host Manrope ------------------------------------------------
# Google served the same variable woff2 for every weight; we keep its latin and latin-ext
# @font-face rules verbatim (weights, unicode-range, font-display) and only point them at
# our own copies. Cyrillic, Greek and Vietnamese subsets are dropped: no page uses them.

GOOGLE_LINKS = re.compile(r'<link[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>\s*')
FONT_FILES = {"latin": "manrope-latin.woff2", "latin-ext": "manrope-latin-ext.woff2"}


def font_face_css():
    css = (VENDOR / "fonts" / "google-manrope.css").read_text()
    rules = []
    for subset, body in re.findall(r"/\* (\S+) \*/\s*@font-face \{(.*?)\}", css, re.S):
        if subset not in FONT_FILES:
            continue
        body = re.sub(r"url\(\S+?\)", f"url(assets/fonts/{FONT_FILES[subset]})", body)
        body = " ".join(line.strip() for line in body.strip().splitlines())
        rules.append("@font-face{" + body + "}")
    assert len(rules) == 10, f"expected 5 weights x 2 subsets, got {len(rules)}"
    return "".join(rules)


def step_fonts():
    (OUT / "assets" / "fonts").mkdir(exist_ok=True)
    for name in FONT_FILES.values():
        shutil.copy2(VENDOR / "fonts" / name, OUT / "assets" / "fonts" / name)
    head = (
        '<link rel="preload" href="assets/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin>\n'
        "<style>" + font_face_css() + "</style>\n"
    )
    for page in pages():
        html = page.read_text()
        links = GOOGLE_LINKS.findall(html)
        assert len(links) == 3, f"{page.name}: expected 3 Google Fonts links, found {len(links)}"
        # The @font-face block goes exactly where the Google stylesheet link was, so the
        # cascade order relative to site.min.css is unchanged.
        first = GOOGLE_LINKS.search(html).start()
        html = GOOGLE_LINKS.sub("", html)
        html = html[:first] + head + html[first:]
        page.write_text(html)


# --- Step: per-page CSS, inlined ---------------------------------------------
# One 152 KB stylesheet serves all nine pages, and fetching it costs a round trip before
# anything can paint. Each page gets only the rules that can match it, inlined in <head>.
# PurgeCSS is fed the page AND every script, so classes that JavaScript adds later
# (is-playing, wm-playing, open...) are kept; state-class prefixes are safelisted on top.
# @keyframes, @font-face and custom properties are never removed.

PURGECSS = ["npx", "-y", "purgecss@6.0.0"]
STYLESHEET_LINK = '<link rel="stylesheet" href="assets/site.min.css">'
# "greedy" keeps any selector that mentions a state class anywhere (e.g. .site-header.is-scrolled).
# The CLI's --safelist only takes exact names, so the patterns go in a config file.
PURGE_CONFIG = """module.exports = {
  css: [%(css)s],
  content: [%(page)s, %(js)s],
  output: %(out)s,
  safelist: { greedy: [/(^|\\s|\\.)is-/, /(^|\\s|\\.)has-/, /wm-/, /ws-/, /^js$/, /^no-tr$/, /^on$/, /^open$/, /^in$/] },
};
"""
CSS_URL = re.compile(r"url\((['\"]?)([^)'\"]+)\1\)")


def purge_for(page, tmp):
    cfg = tmp / "purgecss.config.cjs"
    cfg.write_text(PURGE_CONFIG % {
        "css": repr(str(OUT / "assets" / "site.min.css")),
        "page": repr(str(page)),
        "js": repr(str(OUT / "assets" / "*.js")),
        "out": repr(str(tmp)),
    })
    subprocess.run(PURGECSS + ["--config", str(cfg)], check=True, capture_output=True, cwd=tmp)
    return (tmp / "site.min.css").read_text()


def rebase_urls(css):
    """The stylesheet lived in assets/; once inlined, its relative url()s must be rebased."""
    import posixpath

    def fix(m):
        q, u = m.group(1), m.group(2)
        if re.match(r"^(data:|https?:|/|#)", u):
            return m.group(0)
        return f"url({q}{posixpath.normpath(posixpath.join('assets', u))}{q})"

    return CSS_URL.sub(fix, css)


def step_css():
    import tempfile
    for page in pages():
        html = page.read_text()
        assert html.count(STYLESHEET_LINK) == 1, f"{page.name}: stylesheet link not found once"
        with tempfile.TemporaryDirectory() as d:
            css = rebase_urls(purge_for(page, Path(d)))
        html = html.replace(STYLESHEET_LINK, "<style>" + css.replace("</style", "<\\/style") + "</style>")
        page.write_text(html)


# --- Step: announce the main photo early ------------------------------------
# Inlining the CSS makes the HTML longer, so the browser reaches the page's main photo later.
# Nikki already marks that photo fetchpriority="high"; this step also preloads it from the top of
# <head> (as her home page already does for its hero), with the same srcset/sizes so the browser
# picks the same file and never downloads it twice.

HIGH_IMG = re.compile(r'<img\b[^>]*\bfetchpriority="high"[^>]*>')


def attr(tag, name):
    m = re.search(rf'\b{name}="([^"]*)"', tag)
    return m.group(1) if m else None


def step_preload():
    for page in pages():
        html = page.read_text()
        m = HIGH_IMG.search(html)
        if not m:
            continue
        srcset = attr(m.group(0), "srcset")
        if srcset and f'imagesrcset="{srcset}"' in html:
            continue  # already preloaded (home page hero)
        link = f'<link rel="preload" as="image" href="{attr(m.group(0), "src")}"'
        if srcset:
            link += f' imagesrcset="{srcset}" imagesizes="{attr(m.group(0), "sizes") or "100vw"}"'
        link += ' fetchpriority="high">\n'
        anchor = re.search(r'<link rel="preload"|<style>|<link rel="stylesheet"', html)
        html = html[:anchor.start()] + link + html[anchor.start():]
        page.write_text(html)
        print("  preloaded main photo on", page.name)


# --- Step: one document, not two (index.html) ---------------------------------
# B4's index.html was saved from an artifact viewer, so the real page sits inside a second
# <!doctype><html><head>...<body> shell. Browsers cope by pushing the real <head> into <body>.
# We keep the shell's small <style> (it applied first, so it goes first in the real <head>) and
# drop the duplicate tags, so the cascade - and the rendering - stay the same.

SHELL = re.compile(r'^<!doctype html><html><head>.*?(<style>.*?</style>)</head><body>\s*(?=<!doctype html>)', re.S | re.I)


def step_shell():
    for page in pages():
        html = page.read_text()
        m = SHELL.match(html)
        if not m:
            continue
        shell_style = m.group(1)
        html = html[m.end():]
        assert html.rstrip().endswith("</html>\n</body></html>") or html.rstrip().endswith("</body></html>"), page.name
        html = re.sub(r"\s*</body></html>\s*$", "\n", html)
        vp = re.search(r'<meta name="viewport"[^>]*>\n', html)
        html = html[:vp.end()] + shell_style + "\n" + html[vp.end():]
        page.write_text(html)
        print("  merged the artifact shell in", page.name)


# --- Step: host GSAP ourselves (index.html) ---------------------------------------
# Same GSAP 3.12.5 files the page loaded from cdnjs, served from our own origin, so a slow
# phone does not have to open a connection to a third server.

def step_gsap():
    dest = OUT / "assets" / "vendor"
    dest.mkdir(parents=True, exist_ok=True)
    for name in ("gsap.min.js", "ScrollTrigger.min.js"):
        shutil.copy2(VENDOR / "gsap" / name, dest / name)
    for page in pages():
        html = page.read_text()
        new = html.replace("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/", "assets/vendor/")
        if new != html:
            page.write_text(new)
            print("  self-hosted GSAP in", page.name)


# --- Step: leave out files nothing refers to ------------------------------------
# Run last. The zip ships unminified twins of every script, the full stylesheet (now inlined),
# spare logo variants and so on. A file is kept if its path, its path inside assets/, or even
# just its file name appears anywhere in the built HTML, CSS or JS - deliberately generous, so
# a script that builds a file name from parts still finds its file. Only the build output is
# touched; the source folder keeps everything.

def step_prune():
    # Start from the pages and follow only the scripts/stylesheets they actually load, so comments
    # inside unused files (the unminified twins mention each other) can't keep each other alive.
    corpus, seen = "", set()
    queue = sorted(OUT.glob("*.html"))
    while queue:
        f = queue.pop()
        if f in seen:
            continue
        seen.add(f)
        text = f.read_text(errors="ignore")
        corpus += text
        for ref in re.findall(r'["\'(]([^"\'()\s]+\.(?:js|css))', text):
            target = (OUT / ref.lstrip("/")).resolve()
            if target.is_file() and target not in seen:
                queue.append(target)
    dropped = []
    for f in sorted((OUT / "assets").rglob("*")):
        if not f.is_file():
            continue
        rel = f.relative_to(OUT).as_posix()
        if f.suffix in (".js", ".css") and rel not in corpus:
            pass  # scripts/styles must be referenced by full path to stay
        elif rel in corpus or rel[len("assets/"):] in corpus or f.name in corpus:
            continue
        f.unlink()
        dropped.append(rel)
    print(f"  left out {len(dropped)} unreferenced files:", ", ".join(dropped))


# --- Step: square favicons for Google ------------------------------------------
# Nikki's pages use the 298x256 logo WebP as the tab icon. Google's search results want a square
# icon in a multiple of 48 px or they may show a grey globe (it happened in June 2026). This makes
# square PNGs of that same artwork, centred on a transparent square (the Apple touch icon gets the
# page's cream background, since iOS fills transparency with black), and declares them next to
# Nikki's own icon link. Needs ImageMagick (`magick`).

ICON_SRC = "assets/brand/fox-logo-2.webp"
ICON_BG = "#fdf5f0"  # the pages' theme-color


def step_favicons():
    src = OUT / ICON_SRC
    icons = OUT / "assets" / "icons"
    icons.mkdir(exist_ok=True)
    for size in (32, 48, 96):
        subprocess.run(["magick", str(src), "-strip", "-define", "png:exclude-chunks=date,time", "-resize", f"{size}x{size}", "-background", "none",
                        "-gravity", "center", "-extent", f"{size}x{size}", str(icons / f"favicon-{size}.png")], check=True)
    subprocess.run(["magick", str(src), "-strip", "-define", "png:exclude-chunks=date,time", "-resize", "160x160", "-background", ICON_BG, "-gravity", "center",
                    "-extent", "180x180", "-flatten", str(icons / "apple-touch-icon.png")], check=True)
    links = ('<link rel="icon" type="image/png" sizes="32x32" href="assets/icons/favicon-32.png">\n'
             '<link rel="icon" type="image/png" sizes="48x48" href="assets/icons/favicon-48.png">\n'
             '<link rel="icon" type="image/png" sizes="96x96" href="assets/icons/favicon-96.png">\n'
             '<link rel="apple-touch-icon" sizes="180x180" href="assets/icons/apple-touch-icon.png">\n')
    own = f'<link rel="icon" href="{ICON_SRC}">'
    for page in pages():
        html = page.read_text()
        assert html.count(own) == 1, f"{page.name}: Nikki's icon link not found once"
        page.write_text(html.replace(own, own + "\n" + links.rstrip("\n")))


# --- Step: forms, Luma, booking (only when config.json says so) -----------------
# build/config.json holds the form-service endpoint, the Luma link and the booking link. With all
# of them empty this step changes nothing, so the site keeps Nikki's email-draft behaviour.
# Otherwise it writes assets/integrations.js (from build/integrations.js, with the settings filled
# in) and loads it after site.min.js on every page.

CONFIG_FILE = Path(__file__).resolve().parent / "config.json"


def step_integrations():
    import json
    cfg = json.loads(CONFIG_FILE.read_text()) if CONFIG_FILE.exists() else {}
    keys = ("form_endpoint", "course_endpoint", "luma_url", "booking_url")
    if not any(cfg.get(k) for k in keys):
        print("  nothing configured in config.json - forms stay as email drafts")
        return
    settings = {k: cfg.get(k, "") for k in keys}
    for k in ("course_field_names", "course_extra_fields", "course_no_cors"):
        settings[k] = cfg.get(k) or ({} if k != "course_no_cors" else False)
    settings["messages"] = cfg.get("messages", {})
    js = (Path(__file__).resolve().parent / "integrations.js").read_text()
    assert "/*CONFIG*/{}" in js
    js = js.replace("/*CONFIG*/{}", json.dumps(settings, ensure_ascii=False))
    (OUT / "assets" / "integrations.js").write_text(js)
    tag = '<script src="assets/site.min.js"></script>'
    for page in pages():
        html = page.read_text()
        assert html.count(tag) == 1, f"{page.name}: site.min.js tag not found once"
        page.write_text(html.replace(tag, tag + '\n<script src="assets/integrations.js" defer></script>'))
    print("  integrations on:", ", ".join(k for k in keys if cfg.get(k)))


# --- Step: small fixes to Nikki's pages ----------------------------------------
# Content fixes agreed with David, applied on top of her source so her files stay as delivered.

HOME_TITLE = "Paidia Consulting | AI consultancy"


# The course page's description used straight quotes inside the attribute, which ended it at
# "AI, from zero to ". Curly quotes keep the whole sentence (David, 5 Nov).
COURSE_DESC_BROKEN = 'content="AI, from zero to "I get it": a free'
COURSE_DESC_FIXED = 'content="AI, from zero to “I get it”: a free'

# Desktop menu: when the header slides back in after scrolling up, the pill can be briefly narrower
# than its contents, and "Our work" / "Contact us" broke onto two lines (the pill grew taller and
# stayed that way). Menu labels never wrap on desktop; nothing else changes. Appended to the
# stylesheet before the css step, so it is inlined like the rest.
MENU_NOWRAP_CSS = "\n@media (min-width:901px){.site-header .nav a{white-space:nowrap}}\n"


def step_fixes():
    home = OUT / "index.html"
    html = home.read_text()
    if "<title>B4</title>" in html:
        home.write_text(html.replace("<title>B4</title>", f"<title>{HOME_TITLE}</title>", 1))
        print("  home page title:", HOME_TITLE)
    course = OUT / "course.html"
    html = course.read_text()
    if COURSE_DESC_BROKEN in html:
        course.write_text(html.replace(COURSE_DESC_BROKEN, COURSE_DESC_FIXED, 1))
        print("  course page description: curly quotes round “I get it”")
    css = OUT / "assets" / "site.min.css"
    if ".site-header .nav a{white-space:nowrap}" not in css.read_text():
        with css.open("a") as f:
            f.write(MENU_NOWRAP_CSS)
        print("  desktop menu labels: no line breaks")


# --- Step: link previews (LinkedIn, WhatsApp, Slack...) -------------------------
# Neither the old nor the new site had Open Graph tags, so shared links showed no picture.
# One 1200x630 JPEG (the home hero still, centre crop) plus each page's own title and description.

SITE_URL = "https://paidiaconsulting.com/"


def step_social():
    img = OUT / "assets" / "social-card.jpg"
    subprocess.run(["magick", str(OUT / "assets" / "hero" / "highlands-still.webp"), "-resize", "1200x630^",
                    "-gravity", "center", "-extent", "1200x630", "-quality", "82", "-strip", str(img)], check=True)
    for page in pages():
        html = page.read_text()
        if 'property="og:' in html:
            continue
        title = re.search(r"<title>(.*?)</title>", html, re.S).group(1).strip()
        desc_m = re.search(r'<meta name="description" content="([^"]*)"', html)
        desc = desc_m.group(1) if desc_m else ""
        url = SITE_URL + ("" if page.name == "index.html" else page.name)
        tags = (f'<meta property="og:type" content="website">\n'
                f'<meta property="og:site_name" content="Paidia Consulting">\n'
                f'<meta property="og:title" content="{title}">\n'
                f'<meta property="og:description" content="{desc}">\n'
                f'<meta property="og:url" content="{url}">\n'
                f'<meta property="og:image" content="{SITE_URL}assets/social-card.jpg">\n'
                f'<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
                f'<meta name="twitter:card" content="summary_large_image">\n')
        anchor = re.search(r'<meta name="theme-color"[^>]*>\n', html)
        html = html[:anchor.end()] + tags + html[anchor.end():]
        page.write_text(html)


STEPS = {"shell": step_shell, "fixes": step_fixes, "fonts": step_fonts, "css": step_css, "preload": step_preload,
         "gsap": step_gsap, "favicons": step_favicons, "social": step_social, "integrations": step_integrations,
         "prune": step_prune}


def main():
    global SRC, OUT
    ap = argparse.ArgumentParser()
    ap.add_argument("--steps", default=",".join(ALL_STEPS))
    ap.add_argument("--src", type=Path, default=SRC, help="Nikki's site as delivered (never modified)")
    ap.add_argument("--out", type=Path, default=OUT, help="where the optimised copy is written (replaced)")
    args = ap.parse_args()
    SRC, OUT = args.src.resolve(), args.out.resolve()
    steps = [s for s in args.steps.split(",") if s]
    unknown = [s for s in steps if s not in STEPS]
    if unknown:
        sys.exit(f"unknown steps: {unknown}")
    fresh_copy()
    for s in steps:
        STEPS[s]()
        print("applied", s)
    print("built", OUT)


if __name__ == "__main__":
    main()
