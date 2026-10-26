"""Builds the Paidia Consulting static site into ../paidia-site/ (or ../site/ when run from the shared folder).
Every page is a complete HTML document. Also writes _artifact-home.html (the home page without the document
wrapper) for publishing as a Claude artifact. Edit content.py and workshop.py, then run: python3 build.py"""
import pathlib
from content import PAGES

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent / ("site" if (HERE.parent / "site").exists() and not (HERE.parent / "paidia-site").exists() else "paidia-site")

NAV = [("index.html", "Home"), ("services.html", "Services"), ("work.html", "Our work"), ("workshop.html", "Workshop"), ("about.html", "About")]

def header(current):
    cur = ' aria-current="page"'
    NEW_TAG = '<span class="new" aria-label="new">New</span>'
    links = ""
    for h, t in NAV:
        extra = ' class="has-new"' if h == "workshop.html" else ""
        tag = NEW_TAG if h == "workshop.html" else ""
        links += f'<a href="{h}"{cur if h == current else ""}{extra}>{tag}{t}</a>'
    return f'''<a class="skip" href="#main">Skip to content</a>
<header class="site-header"><div class="wrap bar">
  <a class="brand" href="./" aria-label="Paidia Consulting home"><span class="brand-mark" aria-hidden="true"></span><span class="brand-name">paidia<small>Consulting</small></span></a>
  <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
  <nav class="nav" id="nav" aria-label="Main">{links}<a class="btn" href="contact.html">Contact us</a></nav>
</div></header>'''

FOOTER = '''<footer class="site-footer"><div class="wrap">
  <div class="foot-top">
    <div class="foot-brand">paidia<small>AI training, coaching and engineering. London.</small></div>
    <div class="foot-links"><a href="services.html">Services</a><a href="work.html">Our work</a><a href="workshop.html">Workshop</a><a href="course.html">Free course</a><a href="podcast.html">Podcast</a><a href="about.html">About</a><a href="contact.html">Contact</a><a href="https://paidiaconsulting.com/privacy.html">Privacy</a></div>
  </div>
  <div class="foot-bottom"><span>© 2026 Paidia Consulting Ltd, London, UK. <a href="mailto:info@paidiaconsulting.com">info@paidiaconsulting.com</a></span></div>
</div></footer>'''

HEAD = '''<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#fcfbf8">
<link rel="icon" href="assets/paidia-logo-paper.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Playfair+Display&family=Source+Sans+3:wght@400;600&display=swap">
<link rel="stylesheet" href="assets/site.css">'''

def page(fname, title, desc, body):
    inner = header(fname) + f'\n<main id="main">\n{body}\n</main>\n' + FOOTER + '\n<script src="assets/site.js"></script>'
    full = f'<!doctype html>\n<html lang="en-GB">\n<head>\n{HEAD.format(title=title, desc=desc)}\n</head>\n<body>\n{inner}\n</body>\n</html>\n'
    return full, inner

for fname, (title, desc, body) in PAGES.items():
    full, inner = page(fname, title, desc, body)
    (OUT / fname).write_text(full, encoding="utf-8")
    if fname == "index.html":
        keep = '\n'.join(l for l in HEAD.split('\n') if 'stylesheet' in l or 'preconnect' in l or 'rel="icon"' in l)
        (OUT / "_artifact-home.html").write_text(f'<title>{title}</title>\n<meta name="description" content="{desc}">\n{keep}\n{inner}\n', encoding="utf-8")
    print("wrote", fname)
# Old filename kept as a redirect so existing links do not break
(OUT / "expertise.html").write_text('<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=services.html"><title>Services | Paidia Consulting</title></head><body><a href="services.html">Services</a></body></html>\n', encoding="utf-8")
