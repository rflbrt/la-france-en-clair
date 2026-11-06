#!/usr/bin/env python3
"""Actualise data.js depuis les API publiques de l'Insee et d'Eurostat.

Reprend la logique de mergeXml() et refreshEurostat() dans app.js, sans navigateur.
Lancé chaque jour par .github/workflows/maj-donnees.yml.
Usage : python3 scripts/maj_donnees.py [dossier du site]

Sortie : 0 si tout va bien (data.js modifié ou non), 1 si la mise à jour est abandonnée.
En cas d'abandon, aucun fichier n'est modifié.
"""
import json
import re
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

INSEE_API = "https://api.insee.fr/series/BDM/data/SERIES_BDM/"
ES_API = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"
BATCH = 40
LAST_OBS = 12
MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août",
          "septembre", "octobre", "novembre", "décembre"]


def get(url, accept):
    """Télécharge une URL, avec trois essais en cas d'erreur passagère."""
    req = urllib.request.Request(url, headers={"Accept": accept, "User-Agent": "la-france-en-clair-maj/1.0"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except (urllib.error.URLError, TimeoutError) as err:
            if attempt == 2:
                raise
            print(f"  nouvel essai après : {err}", flush=True)
            time.sleep(10 * (attempt + 1))


def tag(el):
    return el.tag.rsplit("}", 1)[-1]


def merge_insee(xml, data, upd, meta=None):
    """Fusionne une réponse de l'Insee. Renvoie le nombre d'observations lues.
    meta reçoit l'intitulé officiel, la fréquence, l'unité et la zone de chaque série."""
    count = 0
    for s in ET.fromstring(xml).iter():
        if tag(s) != "Series":
            continue
        sid = s.get("IDBANK")
        if s.get("LAST_UPDATE"):
            upd[sid] = s.get("LAST_UPDATE")
        if meta is not None and s.get("TITLE_FR"):
            meta[sid] = {"t": s.get("TITLE_FR"), "f": s.get("FREQ", ""), "u": s.get("UNIT_MEASURE", ""), "m": s.get("UNIT_MULT", "0"), "z": s.get("REF_AREA", "")}
        cur = dict((p, v) for p, v in data.get(sid, []))
        for o in s.iter():
            if tag(o) != "Obs":
                continue
            v = o.get("OBS_VALUE")
            if v is not None and v != "NaN":
                cur[o.get("TIME_PERIOD")] = float(v)
                count += 1
        data[sid] = [[p, cur[p]] for p in sorted(cur)]
    return count


def merge_eurostat(es_id, j, data, upd):
    """Fusionne une réponse d'Eurostat. Lève ValueError si la série rétrécit anormalement."""
    stride, st = {}, 1
    for dim, size in zip(reversed(j["id"]), reversed(j["size"])):
        stride[dim] = st
        st *= size
    geo = j["dimension"]["geo"]["category"]["index"]
    times = j["dimension"]["time"]["category"]["index"]
    fresh = {}
    for g, gi in geo.items():
        pts = []
        for t, ti in times.items():
            v = j["value"].get(str(gi * stride["geo"] + ti * stride["time"]))
            if v is not None:
                pts.append([t, v])
        if pts:
            slot = f"ES_{es_id}_" + ("FR" if g == "FR" else "EU")
            if len(pts) * 2 < len(data.get(slot, [])):
                raise ValueError(f"{slot} passerait de {len(data[slot])} à {len(pts)} points")
            fresh[slot] = sorted(pts, key=lambda p: p[0])
    data.update(fresh)
    if j.get("updated"):
        upd[f"ES_{es_id}_FR"] = upd[f"ES_{es_id}_EU"] = j["updated"][:10]


def read_var(line):
    return json.loads(line.split(" = ", 1)[1].rstrip().rstrip(";"))


def write_var(name, value):
    return f"var {name} = " + json.dumps(value, ensure_ascii=False, separators=(",", ":")) + ";"


def main():
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
    data_path, index_path = root / "data.js", root / "index.html"
    lines = data_path.read_text(encoding="utf-8").split("\n")
    pos = {l.split(" ")[1]: n for n, l in enumerate(lines) if l.startswith("var ")}
    before_data, before_upd = read_var(lines[pos["DATA"]]), read_var(lines[pos["UPD"]])
    data, upd = json.loads(json.dumps(before_data)), dict(before_upd)
    before_meta = read_var(lines[pos["META"]]) if "META" in pos else {}
    meta = json.loads(json.dumps(before_meta))

    # Insee : tout ou rien, comme le navigateur
    ids = [k for k in data if k.isdigit()]
    total = 0
    try:
        for i in range(0, len(ids), BATCH):
            url = INSEE_API + "+".join(ids[i:i + BATCH]) + f"?lastNObservations={LAST_OBS}"
            total += merge_insee(get(url, "application/xml"), data, upd, meta)
    except Exception as err:
        print(f"ABANDON : Insee injoignable ou réponse illisible ({err}).")
        return 1
    if not total:
        print("ABANDON : l'Insee n'a renvoyé aucune observation.")
        return 1
    print(f"Insee : {len(ids)} séries, {total} observations lues.")

    # Eurostat : une série en échec garde sa copie, et sera retentée au prochain passage
    app = (root / "app.js").read_text(encoding="utf-8")
    es = json.loads(re.search(r"^var ES = (\{.*\});\s*$", app, re.M).group(1))
    failed = []
    for es_id, (dataset, query) in es.items():
        url = f"{ES_API}{dataset}?{query + '&' if query else ''}geo=FR&geo=EU27_2020&format=JSON&lang=fr"
        try:
            merge_eurostat(es_id, json.loads(get(url, "application/json")), data, upd)
        except Exception as err:
            failed.append(es_id)
            print(f"::warning::Eurostat {es_id} non actualisé : {err}")
    if len(failed) == len(es):
        print("ABANDON : Eurostat injoignable.")
        return 1
    print(f"Eurostat : {len(es) - len(failed)} sur {len(es)} actualisés.")

    if data == before_data and upd == before_upd and meta == before_meta:
        print("Aucun changement.")
        return 0

    changed = sorted(k for k in data if data[k] != before_data.get(k))
    print(f"Séries modifiées ({len(changed)}) : {', '.join(changed) or 'dates seulement'}")

    now = datetime.now(ZoneInfo("Europe/Paris"))
    lines[pos["DATA"]] = write_var("DATA", data)
    lines[pos["UPD"]] = write_var("UPD", upd)
    if "META" in pos:
        lines[pos["META"]] = write_var("META", meta)
    else:
        lines.insert(pos["UPD"] + 1, write_var("META", meta))
        pos = {l.split(" ")[1]: n for n, l in enumerate(lines) if l.startswith("var ")}
    lines[pos["SAVED_ON"]] = write_var("SAVED_ON", f"{now.day} {MONTHS[now.month - 1]} {now.year}")
    data_path.write_text("\n".join(lines), encoding="utf-8")

    # Le numéro de version force les navigateurs à recharger la nouvelle copie
    index = index_path.read_text(encoding="utf-8")
    index_path.write_text(re.sub(r"data\.js\?v=[^\"]+", f"data.js?v={now:%Y%m%d}", index), encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
