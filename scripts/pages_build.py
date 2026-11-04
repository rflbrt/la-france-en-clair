#!/usr/bin/env python3
"""Génère une page statique par chiffre (chiffres/) et le plan du site, à partir de data.js et app.js.

Usage : python3 scripts/pages_build.py [dossier du site]
Utilise Node, ou jsc sur Mac. Une page inchangée garde sa date dans le plan du site.
"""
import json, os, re, shutil, subprocess, sys, tempfile
from datetime import date
from pathlib import Path

SITE = "https://statpublique.netlify.app"
JSC = "/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc"


def run_engine(root):
    parts = [root / "scripts/pages_stub.js", root / "data.js", root / "app.js", root / "scripts/pages_gen.js"]
    with tempfile.TemporaryDirectory() as tmp:
        script = Path(tmp) / "pages.js"
        script.write_text("\n;\n".join(p.read_text(encoding="utf-8") for p in parts), encoding="utf-8")
        engine = shutil.which(os.environ.get("NODE_BIN", "node")) or (JSC if os.path.exists(JSC) else None)
        if not engine:
            sys.exit("ABANDON : ni Node ni jsc.")
        out = subprocess.run([engine, str(script)], capture_output=True, text=True, timeout=180)
    if out.returncode:
        sys.exit("ABANDON : génération impossible.\n" + out.stderr[-2000:] + out.stdout[-500:])
    return json.loads(out.stdout.strip().splitlines()[-1])


def attr(s):
    return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;")


def shell(root):
    """L'en-tête et le pied de page viennent de cgu.html : une seule source pour tout le site."""
    cgu = (root / "cgu.html").read_text(encoding="utf-8")
    head = re.search(r'<header class="head">.*?</header>', cgu, re.S).group(0)
    foot = re.search(r'<footer class="foot">.*?</footer>', cgu, re.S).group(0)
    css = re.search(r'style\.css\?v=([^"]+)', cgu).group(1)
    js = re.search(r'site\.js\?v=([^"]+)', cgu).group(1)
    def fix(block):
        block = re.sub(r'href="index\.html(#[^"]*)?"', lambda m: 'href="/%s"' % (m.group(1) or ""), block)
        return re.sub(r'href="(confidentialite|cgu)\.html"', r'href="/\1.html"', block)
    return fix(head), fix(foot), css, js


def render(p, head, foot, css, js):
    ld = "".join('<script type="application/ld+json">%s</script>\n' % json.dumps(x, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c") for x in p["ld"])
    url = SITE + p["url"]
    t, d = attr(p["title"]), attr(p["desc"])
    return f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
<title>{t}</title>
<meta name="description" content="{d}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="StatPublique">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#FFFFFF">
<link rel="stylesheet" href="/style.css?v={css}">
<script src="/site.js?v={js}" defer></script>
{ld}</head>
<body>

{head}

<main class="in doc"><article class="paper chiffre-page">
{p["body"]}
</article></main>

{foot}
</body>
</html>
"""


def main():
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    pages = run_engine(root)
    if len(pages) < 40:
        sys.exit("ABANDON : seulement %d pages, c'est anormal." % len(pages))
    head, foot, css, js = shell(root)
    sitemap = root / "sitemap.xml"
    old = dict(re.findall(r"<loc>([^<]+)</loc><lastmod>([^<]+)</lastmod>", sitemap.read_text(encoding="utf-8"))) if sitemap.exists() else {}
    today = date.today().isoformat()
    keep, dates, changed = set(), {}, 0
    for p in pages:
        path = root / p["path"]
        html = render(p, head, foot, css, js)
        same = path.exists() and path.read_text(encoding="utf-8") == html
        if not same:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(html, encoding="utf-8")
            changed += 1
        keep.add(path.parent)
        dates[SITE + p["url"]] = old.get(SITE + p["url"], today) if same else today
    # Un chiffre retiré du site perd sa page.
    for d in (root / "chiffres").iterdir():
        if d.is_dir() and d not in keep:
            shutil.rmtree(d)
    urls = [(SITE + "/", old.get(SITE + "/", today)), (SITE + "/confidentialite.html", old.get(SITE + "/confidentialite.html", today)), (SITE + "/cgu.html", old.get(SITE + "/cgu.html", today))]
    urls += sorted(dates.items(), key=lambda x: (x[0].count("/"), x[0]))
    body = "".join(f"  <url><loc>{u}</loc><lastmod>{d}</lastmod></url>\n" for u, d in urls)
    sitemap.write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "</urlset>\n", encoding="utf-8")
    print(f"{len(pages)} pages, {changed} modifiées.")


if __name__ == "__main__":
    main()
