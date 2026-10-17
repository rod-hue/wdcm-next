#!/usr/bin/env python3
"""Build the WDCM Ghost theme (wdcm2) from the wdcm-next prototype.
   python3 theme/build.py  ->  theme/dist/wdcm2/ and theme/dist/wdcm2.zip
   Heavy media (films, frame sequences) stays on GitHub Pages; everything else ships in the theme."""
import os, re, shutil, sys, zipfile, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = os.path.join(ROOT, 'theme')
OUT = os.path.join(T, 'dist', 'wdcm2')
LEGACY = os.environ.get('WDCM_LEGACY', '')          # unpacked live wdcm theme, for legacy templates
MEDIA = 'https://rod-hue.github.io/wdcm-next/assets/'
VERSION = '2.0.1'

def read(p): return open(p, encoding='utf-8').read()
def write(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8').write(s)

def body_of(html):
    b = html[html.index('<body'):]
    b = b[b.index('>') + 1:]
    b = b[:b.index('<script src=')]                   # page scripts are re-added per template
    return b

def ghostify(s):
    s = s.replace('poster="assets/film/', 'poster="' + MEDIA + 'film/').replace('data-q="assets/film/', 'data-q="' + MEDIA + 'film/')
    s = re.sub(r'(src|href)="assets/([^"?]+)(\?v=[a-f0-9]+)?"', lambda m: '%s="{{asset "%s"}}"' % (m.group(1), m.group(2)), s)
    s = s.replace('href="./"', 'href="{{@site.url}}/"')
    s = s.replace('href="https://www.washingtondcmagazine.com/#/portal/signup" target="_blank" rel="noopener"', 'href="#/portal/signup" data-portal="signup"')
    s = re.sub(r'<footer class="foot">.*?</footer>', '{{> footer}}', s, flags=re.S)
    s = re.sub(r'<!-- SYSTEM BAR.*?</header>', '{{> header}}', s, flags=re.S)
    return s

def scripts(names):
    lib = ('<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>\n'
           '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>\n'
           '<script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"></script>\n')
    return lib + ''.join('<script src="{{asset "%s"}}"></script>\n' % n for n in names)

shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(OUT)

# ---------- assets (small files only) ----------
A = os.path.join(ROOT, 'assets')
for f in os.listdir(A):
    p = os.path.join(A, f)
    if os.path.isfile(p) and not f.startswith('.'):
        shutil.copy(p, os.path.join(OUT, 'assets', f) if os.path.isdir(os.path.join(OUT, 'assets')) else (os.makedirs(os.path.join(OUT, 'assets')) or os.path.join(OUT, 'assets', f)))
shutil.copy(os.path.join(T, 'theme.css'), os.path.join(OUT, 'assets', 'theme.css'))
shutil.copy(os.path.join(T, 'theme.js'), os.path.join(OUT, 'assets', 'theme.js'))

# ---------- partials ----------
for f in os.listdir(os.path.join(T, 'partials')):
    shutil.copy(os.path.join(T, 'partials', f), os.path.join(OUT, 'partials', f) if os.path.isdir(os.path.join(OUT, 'partials')) else (os.makedirs(os.path.join(OUT, 'partials')) or os.path.join(OUT, 'partials', f)))
idx = read(os.path.join(ROOT, 'index.html'))
hdr = idx[idx.index('<!-- SYSTEM BAR'):idx.index('</header>') + 9]
hdr = re.sub(r'(src|href)="assets/([^"?]+)(\?v=[a-f0-9]+)?"', lambda m: '%s="{{asset "%s"}}"' % (m.group(1), m.group(2)), hdr)
hdr = hdr.replace('href="./"', 'href="{{@site.url}}/"').replace('href="https://www.washingtondcmagazine.com/#/portal/signup" target="_blank" rel="noopener"', 'href="#/portal/signup" data-portal="signup"')
write(os.path.join(OUT, 'partials', 'header.hbs'), hdr)

# ---------- templates ----------
for f in ['default.hbs', 'page.hbs', 'tag.hbs', 'author.hbs', 'error.hbs', 'error-404.hbs']:
    shutil.copy(os.path.join(T, f), os.path.join(OUT, f))

home = ghostify(body_of(idx))
write(os.path.join(OUT, 'index.hbs'), '{{!< default}}\n{{!-- WDCM homepage: built from the wdcm-next prototype --}}\n' + home +
      '<div hidden aria-hidden="true"><section id="wdcm-scores"><div id="wdcm-sc-row"></div></section><div id="wdcm-games-promo"></div></div>\n' +
      scripts(['wdcm.js', 'fx.js', 'live.js', 'faces.js', 'fx2.js', 'theme.js']))

art = read(os.path.join(ROOT, 'article.html'))
post = ghostify(body_of(art))
post = post.replace('<header class="phero" id="phero"><div class="sk sk-lead"></div></header>',
    '<header class="phero" id="phero"><div class="ph-copy">{{#primary_tag}}<a class="tagpill" href="{{url}}">{{name}}</a>{{/primary_tag}}<h1>{{title}}</h1>{{#if custom_excerpt}}<p class="dek">{{custom_excerpt}}</p>{{/if}}</div></header>')
assert '<div class="gh-content" id="content"></div>' in post
post = post.replace('<div class="gh-content" id="content"></div>', '<div class="gh-content" id="content">{{content}}</div>')
schema = read(os.path.join(T, 'post-schema.hbs'))
write(os.path.join(OUT, 'post.hbs'), '{{!< default}}\n{{#post}}\n' + schema + '<script>window.WDCM_SLUG="{{slug}}";</script>\n' + post + '{{/post}}\n' +
      scripts(['article.js', 'fx.js', 'faces.js', 'fx2.js', 'theme.js']))

# ---------- legacy templates kept verbatim (routes + custom page template) ----------
if LEGACY:
    for f in ['sitemap-news.hbs', 'ads-txt.hbs', 'ads.txt', 'llms.txt', 'ai.txt']:
        if os.path.exists(os.path.join(LEGACY, f)): shutil.copy(os.path.join(LEGACY, f), os.path.join(OUT, f))
    # the CLSB politics page keeps its original design through a legacy layout
    leg = read(os.path.join(LEGACY, 'default.hbs')).replace('{{asset "css/style.css"}}', '{{asset "legacy/css/style.css"}}') \
        .replace('{{asset "js/main.js"}}', '{{asset "legacy/js/main.js"}}').replace('{{asset "js/dmv-rss.js"}}', '{{asset "legacy/js/dmv-rss.js"}}') \
        .replace('{{asset "js/animations.js"}}', '{{asset "legacy/js/animations.js"}}')
    write(os.path.join(OUT, 'legacy.hbs'), leg)
    clsb = read(os.path.join(LEGACY, 'page-clsb-politics.hbs')).replace('{{!< default}}', '{{!< legacy}}')
    write(os.path.join(OUT, 'page-clsb-politics.hbs'), clsb)
    for d in ['css', 'js']:
        shutil.copytree(os.path.join(LEGACY, 'assets', d), os.path.join(OUT, 'assets', 'legacy', d))
    for f in os.listdir(os.path.join(LEGACY, 'partials')):
        if not os.path.exists(os.path.join(OUT, 'partials', f)):
            shutil.copy(os.path.join(LEGACY, 'partials', f), os.path.join(OUT, 'partials', f))

pkg = {
    "name": "wdcm2", "description": "Washington DC Magazine, next-generation theme", "version": VERSION,
    "author": {"name": "Rodriquez Wright II", "email": "editor@washingtondcmagazine.com", "url": "https://washingtondcmagazine.com"},
    "engines": {"ghost": ">=5.0.0"}, "license": "UNLICENSED", "keywords": ["ghost-theme"],
    "config": {"posts_per_page": 18, "card_assets": True,
               "image_sizes": {"xs": {"width": 100}, "s": {"width": 400}, "m": {"width": 800}, "l": {"width": 1200}, "xl": {"width": 2000}},
               "custom": {}}
}
write(os.path.join(OUT, 'package.json'), json.dumps(pkg, indent=2))

z = os.path.join(T, 'dist', 'wdcm2.zip')
if os.path.exists(z): os.remove(z)
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for dp, dn, fn in os.walk(OUT):
        for f in fn:
            full = os.path.join(dp, f); zf.write(full, os.path.relpath(full, OUT))
print('built', OUT, os.path.getsize(z) // 1024, 'KB')
