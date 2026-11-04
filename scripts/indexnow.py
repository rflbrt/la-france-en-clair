#!/usr/bin/env python3
"""Signale à Bing et aux moteurs IndexNow les pages modifiées par le dernier enregistrement.

Usage : python3 scripts/indexnow.py [--dry-run]
Google n'utilise pas IndexNow : pour lui, c'est sitemap.xml qui compte.
"""
import json, subprocess, sys, urllib.request

HOST = "statpublique.netlify.app"
KEY = "48761b3e2e093ff8ee8286c1d938afaf"


def changed_urls():
    names = subprocess.run(["git", "diff", "--name-only", "HEAD~1", "HEAD"], capture_output=True, text=True, check=True).stdout.split()
    urls = []
    for name in names:
        if name == "index.html" or name == "data.js":
            urls.append(f"https://{HOST}/")
        elif name.startswith("chiffres/") and name.endswith("/index.html"):
            urls.append(f"https://{HOST}/{name[:-len('index.html')]}")
        elif name == "chiffres/index.html":
            urls.append(f"https://{HOST}/chiffres/")
    return sorted(set(urls))


def main():
    urls = changed_urls()
    if not urls:
        print("Aucune page à signaler.")
        return
    if "--dry-run" in sys.argv:
        print(len(urls), "pages :", *urls[:5], sep="\n")
        return
    body = json.dumps({"host": HOST, "key": KEY, "keyLocation": f"https://{HOST}/{KEY}.txt", "urlList": urls}).encode()
    req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body, headers={"Content-Type": "application/json; charset=utf-8", "User-Agent": "statpublique-indexnow/1.0"})
    with urllib.request.urlopen(req, timeout=30) as res:
        print("IndexNow :", res.status, "-", len(urls), "pages signalées.")


if __name__ == "__main__":
    main()
