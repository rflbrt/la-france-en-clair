// Assistant : comprend une question simple, répond avec le chiffre et ouvre la bonne page.
// Tout se passe dans le navigateur : aucune question n'est envoyée ailleurs, et aucune réponse n'est inventée.
(function () {
  // Du plus précis au plus général : la phrase la plus longue l'emporte.
  var ALIASES = {
    "smicnet.0.0": "smic net|smic mensuel|smic net mensuel",
    "smic.0.0": "smic|smic horaire|smic brut|salaire minimum",
    "pension.0.0": "pension|pensions|pension moyenne|retraite moyenne|retraite|retraites",
    "retraitesdep": "depenses de retraite|depense de retraite|cout des retraites",
    "pauvreret.0.0": "pauvrete des retraites",
    "ecartpen.0.0": "ecart de pension|ecart de pensions",
    "esemp.0.0": "emploi des seniors|emploi des 55 64 ans",
    "pauvrete.0.0": "pauvrete|taux de pauvrete|pauvres",
    "inflation.0.0": "inflation|hausse des prix|prix a la consommation|cout de la vie|vie chere",
    "dette.1.0": "dette en pourcentage du pib|dette en du pib|dette par rapport au pib",
    "dette.0.0": "dette|dette publique|dette de la france",
    "dettenr": "dette detenue a l etranger|dette a l etranger|dette etrangere",
    "deficit.0.0": "deficit|deficit public",
    "depenses.0.0": "depenses publiques|depense publique",
    "recettes.0.0": "recettes publiques|recettes",
    "po.0.0": "prelevements obligatoires|impots",
    "interets.0.0": "charge d interets|charge de la dette|interets",
    "taux.0.0": "taux d emprunt|taux d interet|taux a 10 ans|oat",
    "soldeetat.0.0": "budget de l etat|solde du budget",
    "pib.0.0": "pib|richesse produite",
    "espibhab.0.0": "pib par habitant",
    "croissance.0.0": "croissance",
    "emploi.0.0": "emploi salarie|emploi prive|nombre de salaries",
    "tauxemploi.0.0": "taux d emploi|emploi",
    "chomage.0.0": "chomage|taux de chomage",
    "chomeurs.0.0": "chomeurs|nombre de chomeurs",
    "gazole.0.1": "essence|sans plomb|sp95",
    "gazole.0.0": "gazole|diesel|carburant",
    "baguette.0.0": "baguette|pain",
    "eselec.0.0": "electricite|prix de l electricite",
    "population.0.0": "population|habitants|nombre d habitants",
    "ages.0.0": "60 ans ou plus|vieillissement",
    "naissances.0.0": "naissances|natalite|bebes",
    "deces.0.0": "deces|morts|mortalite",
    "soldemig.0.0": "solde migratoire",
    "soldenat.0.0": "solde naturel",
    "fecondite.0.0": "fecondite|enfants par femme",
    "ev.0.0": "esperance de vie",
    "immigres.0.0": "immigres|immigration|immigre",
    "etrangers.0.0": "etrangers|etranger",
    "entrees.0.0": "entrees d immigres|immigres entres|arrivees d immigres",
    "espermis.0.0": "titres de sejour|titre de sejour|premiers titres",
    "esasile.0.0": "demandes d asile|asile",
    "esordres.0.0": "oqtf|ordres de quitter|expulsions",
    "homenr.0.0": "homicides|meurtres|assassinats",
    "cambriolages.0.0": "cambriolages|cambriolage",
    "violphys.0.0": "violences physiques|agressions",
    "violsex.0.0": "violences sexuelles",
    "violsex.0.1": "viols",
    "trafic.0.0": "trafic de stupefiants|trafic de drogue|drogue",
    "escroqueries.0.0": "escroqueries|arnaques",
    "occupation.0.0": "prisons|prison|occupation des prisons|surpopulation carcerale",
    "salaire.0.0": "salaire|salaires|salaire moyen|salaire median",
    "niveau.0.0": "niveau de vie",
    "seuilspat": "patrimoine|patrimoine des menages",
    "patr10": "patrimoine des riches|plus riches|les riches",
    "rsa": "rsa",
    "minima": "minima sociaux",
    "medecins.0.0": "medecins|docteurs",
    "generalistes.0.0": "generalistes|densite de medecins|deserts medicaux",
    "irl.0.0": "loyers|loyer|irl",
    "logement.0.0": "prix de l immobilier|immobilier|prix des logements|logement",
    "climat.0.0": "climat des affaires",
    "confiance.0.0": "confiance des menages|moral des menages",
    "achat.0.0": "pouvoir d achat",
    "epargne.0.0": "epargne",
    "conso.0.0": "consommation",
    "fbcf.0.0": "investissement",
    "creations.0.0": "creations d entreprises|nouvelles entreprises",
    "defaillances.0.0": "defaillances|faillites",
    "soldeext.0.0": "solde exterieur|balance commerciale|commerce exterieur",
    "partindustrie.0.0": "poids de l industrie|part de l industrie|industrie",
    "ipi.0.0": "production industrielle",
    "nucleaire.0.0": "nucleaire",
    "enr.0.0": "renouvelables|energies renouvelables",
    "esdefense.0.0": "defense|armee|depenses militaires"
  };
  var EU_OF = { dette: "esdette", deficit: "esdeficit", chomage: "eschom", tauxemploi: "esemp", pib: "espibhab" };
  // Ces chiffres se lisent à une date : la moyenne d'une année n'aurait pas de sens.
  var AT_DATE = { dette: 1, interets: 1, soldeetat: 1, soldeext: 1, defaillances: 1, commences: 1, emploi: 1, chomeurs: 1, smic: 1, smicnet: 1, irl: 1, logement: 1 };
  var FILLER = {};
  ("quel quelle quels quelles est c etait etaient sont etait combien y a il ont elle elles je tu on me moi nous vous ma mon veux voudrais aimerais peux peut savoir donne donner dis dire montre montrer affiche afficher cherche trouve trouver voir prix chiffre chiffres nombre nombres taux montant montants valeur valeurs niveau part total moyen moyenne france francais francaise fr annee annees entre dans par ce cet cette ses son sa leur leurs que qui quoi comment s n qu se plus moins bien tres stp merci svp evolution evolue evoluer evolu bonjour salut ete fait faire avait aujourd hui maintenant actuel actuelle actuellement dernier derniere recent recente").split(" ").forEach(function (w) { FILLER[w] = 1; });
  var MONTH_WORDS = { janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12 };
  var QUALIFIERS = [[/\bhommes?\b/, "homme"], [/\bfemmes?\b/, "femme"], [/\b(jeunes|15 24 ans|moins de 25 ans)\b/, "15-24"], [/\b25 49 ans\b/, "25-49"], [/\b(seniors|50 ans ou plus|plus de 50 ans)\b/, "50 ans"]];
  var ALIAS_LIST = [];
  Object.keys(ALIASES).forEach(function (k) { ALIASES[k].split("|").forEach(function (a) { ALIAS_LIST.push([a, k]); }); });
  ALIAS_LIST.sort(function (a, b) { return b[0].length - a[0].length; });

  function themeOf(key) { var found = null; Object.keys(THEMES).forEach(function (t) { THEMES[t].items.forEach(function (i) { if (i.key === key) found = t; }); }); return found; }
  function entity(key) {
    cmpCatalog();
    var itemKey = key.split(".")[0], item = itemByKey(itemKey);
    if (!item) return null;
    var e = cmpByKey[key];
    if (!e && item.views && key.indexOf(".") > 0) {
      // La même série peut être rangée sous une autre tuile dans le catalogue.
      var s = key.split("."), line = item.views[+s[1]] && item.views[+s[1]].lines[+s[2]];
      if (line) e = cmpList.filter(function (c) { return c.line.id && c.line.id === line.id && (c.line.tf || "") === (line.tf || ""); })[0] || null;
      if (e) e = { key: e.key, item: item, theme: themeOf(itemKey), line: line, unit: item.views[+s[1]].unit, dec: item.views[+s[1]].dec, n: item.n };
    }
    if (!e && item.views) e = cmpList.filter(function (c) { return c.item === item; })[0] || null;
    return { key: e ? e.key : itemKey, item: item, theme: themeOf(itemKey), e: e, view: +(key.split(".")[1] || 0) };
  }
  function qualify(ent, text) {
    if (!ent.e) return ent;
    QUALIFIERS.forEach(function (q) {
      if (!q[0].test(text)) return;
      var hit = cmpList.filter(function (c) { return c.item === ent.item && plainText(c.line.name).indexOf(plainText(q[1])) >= 0; })[0];
      if (hit) { ent.e = hit; ent.key = hit.key; ent.view = +hit.key.split(".")[1]; }
    });
    return ent;
  }
  function stripQualifiers(s) { QUALIFIERS.forEach(function (q) { s = s.replace(new RegExp(q[0].source, "g"), " "); }); return s; }

  // --- Dates
  // À la voix, une année peut arriver en toutes lettres : « deux mille quinze ».
  var SPOKEN = { un: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10, onze: 11, douze: 12, treize: 13, quatorze: 14, quinze: 15, seize: 16, vingt: 20, trente: 30, quarante: 40, cinquante: 50, soixante: 60 };
  function spokenYears(text) {
    return text.replace(/\b(deux mille|mille neuf cent|dix neuf cent)((?: (?:et|un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingt|trente|quarante|cinquante|soixante))*)/g, function (_, head, tail) {
      var n = head === "deux mille" ? 2000 : 1900, t = tail.trim().split(" ").filter(function (w) { return w && w !== "et"; });
      for (var i = 0; i < t.length; i++) { if (t[i] === "quatre" && t[i + 1] === "vingt") { n += 80; i++; } else n += SPOKEN[t[i]]; }
      return " " + n + " ";
    });
  }
  function readDates(text) {
    var dates = [];
    function take(t, since) { dates.push(t); t.since = !!since; return " zd" + (dates.length - 1) + "z "; }
    function year(y) { return { y: y }; }
    text = text.replace(/\b(?:entre|de|du|depuis)\s+((?:19|20)\d\d)\s+(?:et|a|au|jusqu a|jusqu en)\s+((?:19|20)\d\d)\b/g, function (_, a, b) { var t = year(a); t.to = b; return take(t); });
    text = text.replace(/\b(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre)\s+((?:19|20)\d\d)\b/g, function (_, m, y) { var n = MONTH_WORDS[m]; return take({ y: y, p: y + "-" + (n < 10 ? "0" : "") + n }); });
    text = text.replace(/\b(1er|premier|1|2e|2eme|deuxieme|second|3e|3eme|troisieme|4e|4eme|quatrieme)\s+trimestre\s+((?:19|20)\d\d)\b/g, function (_, q, y) { return take({ y: y, p: y + "-Q" + (/^(1|p)/.test(q) ? 1 : /^(2|d|s)/.test(q) ? 2 : /^(3|t)/.test(q) ? 3 : 4) }); });
    text = text.replace(/\bt([1-4])\s+((?:19|20)\d\d)\b/g, function (_, q, y) { return take({ y: y, p: y + "-Q" + q }); });
    text = text.replace(/\bdepuis(?:\s+l\s+an|\s+l\s+annee)?\s+((?:19|20)\d\d)\b/g, function (_, y) { return take(year(y), true); });
    text = text.replace(/\b((?:19|20)\d\d)\b/g, function (_, y) { return take(year(y)); });
    text = text.replace(/\b(aujourd hui|maintenant|actuellement)\b/g, function () { return take({ last: 1 }); });
    return { text: text, dates: dates };
  }
  function datesIn(seg, dates) { var out = [], m, re = /zd(\d+)z/g; while ((m = re.exec(seg))) out.push(dates[+m[1]]); return out; }
  function pointOf(e, y) {
    var pts = lineData(e.line).filter(function (p) { return p[0].slice(0, 4) === y; });
    return pts.length ? pts[pts.length - 1] : null;
  }
  // La valeur à dire pour une date : exacte pour un mois, moyenne ou fin d'année pour une année.
  function valueAt(ent, t) {
    var e = ent.e, data = lineData(e.line), last = data[data.length - 1];
    if (t.last) return { v: last[1], label: periodLabel(last[0]), point: last[0] };
    if (t.p) {
      var exact = data.filter(function (p) { return p[0] === t.p; })[0];
      if (exact) return { v: exact[1], label: periodLabel(exact[0]), point: exact[0] };
      var inYear = pointOf(e, t.y);
      if (inYear && inYear[0].length === 4) return { v: inYear[1], label: t.y, point: inYear[0], coarse: 1 };
      return { missing: 1, first: data[0][0], last: last[0] };
    }
    var pt = pointOf(e, t.y);
    if (!pt) return { missing: 1, first: data[0][0], last: last[0] };
    if (pt[0].length === 4) return { v: pt[1], label: pt[0], point: pt[0] };
    var avg = cmpValues(e)[t.y];
    if (avg === undefined || AT_DATE[ent.item.key]) return { v: pt[1], label: periodLabel(pt[0]), point: pt[0] };
    return { v: avg, label: "moyenne de " + t.y, point: pt[0], pointV: pt[1], pointL: periodLabel(pt[0]) };
  }
  function fmt(ent, v) {
    var e = ent.e, s = ent.item.signed ? signed(v, e.dec) : num(v, e.dec);
    return s + (e.unit ? " " + e.unit : "");
  }
  function nameOf(ent) {
    if (!ent.e) return ent.item.n;
    var n = ent.e.n || ent.item.n;
    if (ent.key === "gazole.0.1") return "Prix de l'essence (sans plomb 95)";
    if (ent.item.key === "salaire") return "Salaire médian, indice 100 en 1996";
    var label = ent.item.views && ent.item.views[ent.view] && ent.item.views[ent.view].label;
    n = n.split(" (")[0];
    return label && /indice/i.test(label) ? n + ", " + label.toLowerCase() : n;
  }

  // --- Reconnaître un chiffre dans un morceau de phrase
  function matchAliases(seg) {
    var found = [], rest = " " + seg + " ";
    ALIAS_LIST.forEach(function (a) {
      var needle = " " + a[0] + " ", at;
      while ((at = rest.indexOf(needle)) >= 0) { found.push({ at: at, key: a[1] }); rest = rest.slice(0, at) + " " + "#".repeat(a[0].length) + " " + rest.slice(at + needle.length); }
    });
    found.sort(function (a, b) { return a.at - b.at; });
    return { keys: found.map(function (f) { return f.key; }), rest: rest.replace(/#+/g, " ") };
  }
  function meaningful(s) { return words(s).filter(function (w) { return !STOP[w] && !FILLER[w] && !/^zd\d+z$/.test(w); }); }
  // Sans expression connue : on cherche dans les noms et les mots associés. Jamais dans le seul thème.
  function fuzzy(tokens) {
    var rows = searchIndex.filter(function (x) { return !x.item.tool; }).map(function (x) {
      var total = 0, hits = 0, best = 0;
      tokens.forEach(function (t) {
        var s = tokenScore(t, { name: x.name, related: x.related, themeWords: [], text: [] });
        if (s) { hits++; total += s; best = Math.max(best, s); }
      });
      return { x: x, total: total, hits: hits, best: best };
    }).filter(function (r) { return r.hits === tokens.length; });
    rows.sort(function (a, b) { return b.hits - a.hits || b.total - a.total; });
    return rows;
  }
  // Une faute de frappe sur un mot connu : « inflaton » pour « inflation ».
  function typo(tokens) {
    var keys = [];
    tokens.forEach(function (t) {
      if (t.length < 5) return;
      var limit = t.length >= 8 ? 2 : 1, hit = {};
      ALIAS_LIST.forEach(function (a) { if (a[0].indexOf(" ") < 0 && Math.abs(a[0].length - t.length) <= limit && editDistance(t, a[0]) <= limit) hit[a[1]] = 1; });
      var k = Object.keys(hit);
      if (k.length === 1) keys.push(k[0]);
    });
    return keys.length === tokens.length ? keys : [];
  }

  // --- Lire la question
  function parse(raw) {
    var out = { raw: raw };
    var money = /(\d[\d\s.,]*)\s*(?:€|euros?\b).*?\b((?:19|20)\d\d)\b|\b((?:19|20)\d\d)\b.*?(\d[\d\s.,]*)\s*(?:€|euros?\b)/i.exec(raw);
    if (money) return { type: "money", amount: (money[1] || money[4]).replace(/\s/g, ""), year: money[2] || money[3] };
    var text = " " + spokenYears(plainText(raw)) + " ";
    if (!words(raw).length) return { type: "empty" };
    var askedEu = /\b(europe|europeen|europeenne|europeens|ue|union europeenne)\b/.test(text);
    var country = /\b(allemagne|italie|espagne|etats unis|usa|royaume uni|chine|japon|belgique|suisse|pays bas|portugal|paris|marseille|lyon|bretagne|corse|normandie)\b/.exec(text);
    if (country) return { type: "place", place: country[1] };
    var wantsCompare = /\b(compare|comparer|comparaison|compar|versus|vs|contre|par rapport|difference|ecart entre|plus haut|plus eleve|plus eleves|plus elevee|ou)\b/.test(text);
    var d = readDates(text), body = d.text;
    body = body.replace(/\b(comparer|compare|comparaison|compar|difference|ecart entre)\b/g, " ").replace(/\b(union europeenne|europeenne|europeens|europeen|europe|ue)\b/g, " ");
    var segs = body.split(/\s(?:et|avec|versus|vs|contre|par rapport a|par rapport au|par rapport aux|ou|face a)\s/);
    var ents = [], perEntity = [], loose = [], ignored = [], pending = null;
    segs.forEach(function (seg) {
      var dates = datesIn(seg, d.dates), a = matchAliases(seg), keys = a.keys.slice(), left = meaningful(stripQualifiers(a.rest));
      if (!keys.length && left.length) { keys = typo(left); if (keys.length) left = []; }
      if (!keys.length && left.length) {
        var rows = fuzzy(left);
        if (rows.length) {
          var top = rows[0], close = rows.filter(function (r) { return r.hits === top.hits && r.total === top.total; });
          if (close.length > 1 || top.best < 40) { if (!pending) pending = rows.slice(0, 3).map(function (r) { return r.x.item.key; }); return; }
          keys = [top.x.item.key + (top.x.item.views ? ".0.0" : "")];
          left = [];
        } else { ignored = ignored.concat(left); }
      } else if (left.length) { ignored = ignored.concat(left); }
      keys.forEach(function (k, n) {
        var ent = entity(k);
        if (!ent) return;
        ents.push(qualify(ent, seg));
        perEntity.push(n === keys.length - 1 ? dates : []);
      });
      if (!keys.length) {
        if (ents.length && /\b(hommes?|femmes?|jeunes|seniors|\d\d \d\d ans)\b/.test(seg)) {
          var prev = ents[ents.length - 1], copy = entity(prev.item.key + ".0.0");
          if (copy) { qualify(copy, seg); if (copy.key !== prev.key) { ents.push(copy); perEntity.push(dates); return; } }
        }
        loose = loose.concat(dates);
      }
    });
    if (pending && !ents.length) return { type: "choose", keys: pending };
    if (!ents.length) return { type: "none", ignored: ignored, raw: raw };
    out.ignored = ignored;
    if (askedEu) {
      var es = EU_OF[ents[0].item.key] || (ents[0].item.key.indexOf("es") === 0 ? ents[0].item.key : null);
      if (!es) { out.noEu = 1; }
      else {
        var fr = entity(es + ".0.0"), eu = entity(es + ".0.1");
        var when = perEntity[0].concat(loose)[0];
        if (fr && eu && eu.e && eu.e.key !== fr.e.key) return { type: "compare", ents: [fr, eu], de: when && when.y, a: when && when.to, ignored: ignored };
        ents = [fr]; perEntity = [perEntity[0]];
      }
    }
    // Un seul chiffre cité plusieurs fois : c'est une comparaison de deux dates.
    var distinct = [], allDates = [];
    ents.forEach(function (x, n) { if (!distinct.some(function (o) { return o.key === x.key; })) distinct.push(x); allDates = allDates.concat(perEntity[n]); });
    allDates = allDates.concat(loose);
    if (distinct.length === 1) {
      var ent = distinct[0];
      if (!ent.e) return { type: "fixed", ent: ent, asked: allDates[0] || null, ignored: ignored };
      if (allDates.length >= 2) return { type: "range", ent: ent, a: allDates[0], b: allDates[1], ignored: ignored };
      if (allDates[0] && allDates[0].to) return { type: "range", ent: ent, a: { y: allDates[0].y }, b: { y: allDates[0].to }, ignored: ignored };
      if (allDates[0] && allDates[0].since) return { type: "range", ent: ent, a: { y: allDates[0].y }, b: { last: 1 }, ignored: ignored };
      return { type: "value", ent: ent, when: allDates[0] || null, ignored: ignored };
    }
    // Plusieurs chiffres
    var noSeries = distinct.filter(function (x) { return !x.e; });
    if (noSeries.length) return { type: "fixedMany", ents: distinct, ignored: ignored };
    var ownDates = perEntity.filter(function (x) { return x.length; }).length, shared = allDates[0];
    if (allDates.length && !allDates.some(function (t) { return t.since || t.to; }) && (ownDates >= 2 || allDates.length >= 1)) {
      var picks = ents.map(function (x, n) { return { ent: x, t: perEntity[n][0] || null }; });
      var given = picks.filter(function (x) { return x.t; });
      if (given.length === 1 && picks[picks.length - 1].t) picks.forEach(function (x) { x.t = given[0].t; });
      else picks.forEach(function (x) { if (!x.t) x.t = { last: 1 }; });
      return { type: "dated", picks: picks.slice(0, CMP_MAX), ignored: ignored };
    }
    var list = distinct.slice(0, CMP_MAX), prix = false;
    var infl = list.filter(function (x) { return x.item.key === "inflation"; })[0];
    if (infl && list.some(function (x) { return x.e.unit !== "%"; })) { list = list.filter(function (x) { return x !== infl; }); prix = true; }
    return { type: "compare", ents: list, de: shared && shared.y, a: shared && shared.to, prix: prix, ignored: ignored, wants: wantsCompare };
  }

  // --- Agir et répondre
  function card(html) {
    var c = document.getElementById("ask-card");
    c.querySelector(".ask-card-body").innerHTML = html;
    if (c.hidden) { c.hidden = false; motion(c, RISE, { duration: 240 }); }
  }
  function panelMsg(html) { document.getElementById("ask-msg").innerHTML = html; }
  function closePanel() { if (hearing) hearing.abort(); document.getElementById("ask-panel").hidden = true; document.getElementById("ask-open").setAttribute("aria-expanded", "false"); }
  function sourceLine(ent) { return '<span class="ask-src">Source : ' + esc(ent.item.o || "Insee") + "</span>"; }
  function ignoredNote(p) {
    var bits = [];
    if (p.noEu) bits.push("Pas de comparaison européenne pour ce chiffre : voici la France.");
    if (p.ignored && p.ignored.length) bits.push("Je n'ai pas tenu compte de : " + p.ignored.join(", ") + ".");
    return bits.length ? '<span class="ask-note">' + esc(bits.join(" ")) + "</span>" : "";
  }
  function openEnt(ent, view) {
    goToResult({ theme: ent.theme, item: ent.item });
    if (view && chart) { var b = chart.el.querySelector('[data-view="' + view + '"]'); if (b) b.click(); }
  }
  function pick(period) { if (chart && period) { try { pickPeriod(period); } catch (err) {} } }
  function run(p) {
    if (p.type === "empty") return false;
    if (p.type === "none") { panelMsg('<p class="ask-miss">Ce chiffre n\'est pas sur le site. Je préfère ne rien inventer. Essayez par exemple « chômage » ou « dette ».</p>'); return false; }
    if (p.type === "place") { panelMsg('<p class="ask-miss">Le site ne couvre que la France entière, et l\'Union européenne pour certains chiffres. Rien sur ' + esc(p.place) + ".</p>"); return false; }
    if (p.type === "choose") {
      panelMsg('<p class="ask-miss">Vous pensez à l\'un de ces chiffres ?</p><div class="ask-chips">' + p.keys.map(function (k) { var i = itemByKey(k); return '<button type="button" class="ask-chip" data-q="' + esc(i.n) + '">' + esc(i.n) + "</button>"; }).join("") + "</div>");
      return false;
    }
    closePanel();
    if (p.type === "money") {
      var t = document.querySelector('[data-panel="menages"] [data-key="sommehier"]');
      var s = parseNumber(p.amount), price = priceYear(p.year), d = DATA[PRICE_ID] || [], last = d[d.length - 1];
      if (isNaN(s) || !(price > 0) || !last) { card('<b>Je n\'ai pas ce coefficient pour ' + esc(p.year) + ".</b>"); return true; }
      prixTool.s = String(p.amount); prixTool.y = p.year;
      renderAll();
      goToResult({ theme: "menages", item: { key: "sommehier", tool: 1 } });
      card("<b>" + nb(num(s, 2) + " € de " + p.year + " valent " + num(s * last[1] / price, 2) + " € de " + last[0]) + '.</b><span class="ask-src">Source : Insee</span>');
      return true;
    }
    if (p.type === "fixed" || p.type === "fixedMany") {
      var list = p.type === "fixed" ? [p.ent] : p.ents, first = list[0];
      var lines = list.map(function (x) { var h = headline(x.item); return "<b>" + nb(x.item.n + " : " + h.f + (h.u && h.f.indexOf(h.u) < 0 ? " " + h.u : "")) + "</b> <span>(" + nb(h.w) + ")</span>"; }).join("<br>");
      openEnt(first);
      var note = p.asked && p.asked.y && headline(first.item).w.indexOf(p.asked.y) < 0 ? '<span class="ask-note">Le site n\'a que ce chiffre, pas de valeur pour ' + esc(p.asked.y) + ".</span>" : p.type === "fixedMany" ? '<span class="ask-note">Comparaison impossible : au moins un de ces chiffres n\'a pas d\'historique.</span>' : "";
      card(lines + note + sourceLine(first) + ignoredNote(p));
      return true;
    }
    if (p.type === "value") {
      var ent = p.ent;
      openEnt(ent, ent.view);
      if (!p.when) {
        var h = ent.item.f && ent.view === 0 && !/\.0\.[1-9]/.test(ent.key) && ent.e.line === ent.item.views[0].lines[0] ? headline(ent.item) : null;
        var cur = valueAt(ent, { last: 1 });
        card("<b>" + nb(h ? ent.item.n : nameOf(ent)) + " : " + nb(h ? h.f + (h.u && h.f.indexOf(h.u) < 0 ? " " + h.u : "") : fmt(ent, cur.v)) + "</b> <span>(" + nb(h ? h.w : cur.label) + ")</span>" + sourceLine(ent) + ignoredNote(p));
        return true;
      }
      var r = valueAt(ent, p.when);
      if (r.missing) { card("<b>Pas de chiffre pour " + esc(p.when.p ? periodLabel(p.when.p) : p.when.y) + ".</b><span class=\"ask-note\">" + nb(nameOf(ent)) + " : premier chiffre " + nb(periodLabel(r.first)) + ", dernier " + nb(periodLabel(r.last)) + ".</span>" + sourceLine(ent)); return true; }
      pick(r.point);
      card("<b>" + nb(nameOf(ent)) + " : " + nb(fmt(ent, r.v)) + "</b> <span>(" + nb(r.label) + ")</span>" + (r.pointL ? '<span class="ask-note">Sur le graphique : ' + nb(r.pointL) + ", " + nb(fmt(ent, r.pointV)) + ".</span>" : "") + (r.coarse ? '<span class="ask-note">Ce chiffre n\'existe qu\'à l\'année.</span>' : "") + sourceLine(ent) + ignoredNote(p));
      return true;
    }
    if (p.type === "range") {
      var en = p.ent, data = lineData(en.e.line), last2 = data[data.length - 1];
      function pt(t) { if (t.last) return last2; if (t.p) { var x = data.filter(function (q) { return q[0] === t.p; })[0]; if (x) return x; } return pointOf(en.e, t.y); }
      var a = pt(p.a), b = pt(p.b);
      openEnt(en, en.view);
      if (!a || !b) { card("<b>Pas de chiffre pour " + esc(!a ? p.a.y : p.b.y) + ".</b><span class=\"ask-note\">" + nb(nameOf(en)) + " : premier chiffre " + nb(periodLabel(data[0][0])) + ", dernier " + nb(periodLabel(last2[0])) + ".</span>" + sourceLine(en)); return true; }
      if (a[0] > b[0]) { var tmp = a; a = b; b = tmp; }
      pick(a[0]); pick(b[0]);
      var rate = en.e.unit === "%", diff = b[1] - a[1], change = rate ? signed(diff, en.e.dec) + " point" + (Math.abs(diff) >= 2 ? "s" : "") : a[1] > 0 && b[1] > 0 ? signed((b[1] / a[1] - 1) * 100, 1) + " %" : signed(diff, en.e.dec);
      card("<b>" + nb(nameOf(en)) + " : " + nb(change) + "</b><span>" + nb(fmt(en, a[1])) + " (" + nb(periodLabel(a[0])) + ") → " + nb(fmt(en, b[1])) + " (" + nb(periodLabel(b[0])) + ")</span>" + sourceLine(en) + ignoredNote(p));
      return true;
    }
    if (p.type === "dated") {
      cmpCatalog();
      var hash = "comparer=" + p.picks.map(function (x) { var v = valueAt(x.ent, x.t); return x.ent.e.key + "@" + (x.t.last ? "last" : x.t.p && !v.missing ? x.t.p : x.t.y); }).join(",") + "&vue=dates";
      go(hash);
      var rows = cmp.dated.map(function (x) { var e = cmpByKey[x.key], ent2 = { e: e, item: e.item }; return "<li>" + nb(e.n) + " : <b>" + nb(fmt(ent2, dtValue(x, e))) + "</b> <span>(" + nb(x.p.length > 4 ? periodLabel(x.p) : x.p) + ")</span></li>"; }).join("");
      card('<ul class="ask-list">' + rows + "</ul>" + ignoredNote(p));
      return true;
    }
    if (p.type === "compare") {
      // Sans date demandée : les dix dernières années, plus parlantes qu'un siècle d'historique.
      var ends = p.ents.map(function (x) { var ys = cmpYears(x.e); return +ys[ys.length - 1]; }), autoDe = p.de ? null : Math.min.apply(null, ends) - 10;
      var q = "comparer=" + p.ents.map(function (x) { return x.e.key; }).join(",") + (p.de || autoDe ? "&de=" + (p.de || autoDe) : "") + (p.a ? "&a=" + p.a : "") + (p.prix ? "&prix=1" : "");
      go(q);
      var res = cmpCompute();
      if (!res.rank || res.years.length < 2) { card("<b>Pas assez d'années communes pour comparer ces chiffres.</b>" + ignoredNote(p)); return true; }
      var items = res.rank.map(function (s) { return "<li>" + nb(s.n) + " : <b>" + nb(cmpGain(s, res)) + "</b></li>"; }).join("");
      var late = p.de && res.from !== String(p.de) ? '<span class="ask-note">Première année commune : ' + res.from + ".</span>" : "";
      var dropped = res.dropped.length ? '<span class="ask-note">Non comparé, car certaines valeurs sont négatives : ' + esc(res.dropped.map(function (x) { return x.n; }).join(", ")) + ".</span>" : "";
      card("<b>De " + res.from + " à " + res.to + "</b>" + '<ul class="ask-list">' + items + "</ul>" + late + dropped + ignoredNote(p));
      return true;
    }
    return false;
  }
  function go(name) {
    cmpReadHash(name);
    try { history.replaceState(null, "", "#" + name); } catch (err) {}
    route();
  }

  // --- Interface
  var open = document.getElementById("ask-open"), panel = document.getElementById("ask-panel"), input = document.getElementById("ask-q");
  function show() {
    panel.hidden = false;
    open.setAttribute("aria-expanded", "true");
    motion(panel, POP, { duration: 200 });
    input.focus();
    input.select();
  }
  function submit(text, byVoice) {
    panelMsg("");
    var p = parse(text);
    if (run(p)) { var c = document.getElementById("ask-card"); c.dataset.q = text; }
    if (byVoice) sayAnswer();
  }

  // --- Voix : on parle au bouton micro, et la réponse est lue à voix haute dans ce cas seulement.
  var mic = document.getElementById("ask-mic"), hearing = null;
  function recognizer() { return window.SpeechRecognition || window.webkitSpeechRecognition; }
  function spokenText(s) {
    return s.replace(/\u00a0|\u202f/g, " ").replace(/Md €/g, "milliards d'euros").replace(/ M\b/g, " millions").replace(/€/g, "euros").replace(/%/g, "pour cent").replace(/‰/g, "pour mille").replace(/→/g, ", puis ").replace(/\+(?=\d)/g, "plus ").replace(/[−–](?=\d)/g, "moins ").replace(/×/g, "multiplié par ").replace(/\s+/g, " ").trim();
  }
  function say(text) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(spokenText(text));
    u.lang = "fr-FR";
    speechSynthesis.speak(u);
  }
  function hush() { if (window.speechSynthesis) speechSynthesis.cancel(); }
  function sayAnswer() {
    var c = document.getElementById("ask-card"), body = "";
    if (!c.hidden) {
      var copy = c.querySelector(".ask-card-body").cloneNode(true);
      Array.prototype.forEach.call(copy.querySelectorAll(".ask-src"), function (x) { x.remove(); });
      Array.prototype.forEach.call(copy.querySelectorAll("li, br, b, span"), function (x) { x.insertAdjacentText("afterend", ". "); });
      body = copy.textContent.replace(/(\.\s*)+/g, ". ").replace(/:\s*\./g, " :").replace(/\s*\.\s*\(/g, " (");
    } else {
      body = document.getElementById("ask-msg").textContent;
    }
    if (body) say(body);
  }
  function micState(on) {
    mic.classList.toggle("on", on);
    mic.setAttribute("aria-pressed", String(on));
    mic.setAttribute("aria-label", on ? "Arrêter d'écouter" : "Parler");
    input.placeholder = on ? "Je vous écoute…" : "Posez votre question";
  }
  function micHelp(code) {
    var local = location.protocol === "file:";
    if (code === "no-speech") return "Je n'ai rien entendu. Réessayez, ou écrivez votre question.";
    if (code === "audio-capture") return "Aucun micro détecté sur cet appareil.";
    if (code === "language-not-supported") return "Votre navigateur ne reconnaît pas le français à la voix.";
    if (local) return "Le micro est bloqué car le site est ouvert comme un simple fichier. Il faut l'ouvrir depuis une adresse web. (code : " + code + ")";
    if (code === "service-not-allowed") return "La reconnaissance vocale est désactivée. Sur Mac ou iPhone, activez Siri et la dictée dans les réglages, ou essayez Chrome. (code : " + code + ")";
    if (code === "not-allowed") return "Le micro est refusé. Autorisez-le pour ce site dans votre navigateur, puis réessayez. (code : " + code + ")";
    if (code === "network") return "Le service de reconnaissance vocale de votre navigateur ne répond pas. Essayez Chrome ou Safari. (code : " + code + ")";
    return "Le micro ne répond pas dans ce navigateur. Essayez Chrome ou Safari, ou écrivez votre question. (code : " + code + ")";
  }
  function listen() {
    var Rec = recognizer();
    if (!Rec) return;
    if (hearing) { hearing.stop(); return; }
    hush();
    panelMsg("");
    input.value = "";
    var r = new Rec(), heard = "", failed = false;
    r.lang = "fr-FR";
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;
    r.onresult = function (e) {
      var all = "";
      for (var i = 0; i < e.results.length; i++) all += e.results[i][0].transcript;
      input.value = all;
      heard = all;
    };
    // Certains navigateurs ne préviennent de rien : sans démarrage rapide, on le dit au lieu de rester muet.
    var watchdog = setTimeout(function () {
      if (hearing !== r) return;
      failed = true;
      try { r.abort(); } catch (err) {}
      hearing = null;
      micState(false);
      panelMsg('<p class="ask-miss">' + micHelp("timeout") + "</p>");
    }, 4000);
    r.onstart = function () { clearTimeout(watchdog); };
    r.onerror = function (e) {
      clearTimeout(watchdog);
      failed = true;
      var m = e.error === "aborted" ? "" : micHelp(e.error);
      if (m) panelMsg('<p class="ask-miss">' + m + "</p>");
    };
    r.onend = function () {
      clearTimeout(watchdog);
      hearing = null;
      micState(false);
      if (!failed && heard.trim()) submit(heard, true);
    };
    hearing = r;
    micState(true);
    try { r.start(); } catch (err) { clearTimeout(watchdog); hearing = null; micState(false); panelMsg('<p class="ask-miss">' + micHelp(err && err.name || "start") + "</p>"); }
  }
  if (!recognizer()) mic.hidden = true;
  mic.addEventListener("click", listen);
  open.addEventListener("click", function () { if (panel.hidden) show(); else closePanel(); });
  document.getElementById("ask-form").addEventListener("submit", function (e) { e.preventDefault(); submit(input.value); });
  panel.addEventListener("click", function (e) {
    var b = e.target.closest("[data-q]");
    if (b) { input.value = b.dataset.q; submit(b.dataset.q); }
  });
  panel.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.stopPropagation(); closePanel(); open.focus(); } });
  document.addEventListener("click", function (e) { if (!panel.hidden && !e.target.closest(".ask") && !e.target.closest("#ask-card")) closePanel(); });
  document.getElementById("ask-card").addEventListener("click", function (e) {
    var c = document.getElementById("ask-card");
    if (e.target.closest("[data-close]")) { c.hidden = true; hush(); }
    if (e.target.closest("[data-again]")) { c.hidden = true; hush(); window.scrollTo(0, 0); show(); }
  });
  window.askParse = parse;
  window.askSubmit = submit;
  window.askSpoken = spokenText;
})();
