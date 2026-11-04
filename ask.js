// Assistant : comprend une question simple, répond avec le chiffre et ouvre la bonne page.
// Tout se passe dans le navigateur : aucune question n'est envoyée ailleurs, et aucune réponse n'est inventée.
(function () {
  // Du plus précis au plus général : la phrase la plus longue l'emporte.
  var ALIASES = {
    "smicnet.0.0": "smicard|smicards|smic net|smics nets|smic mensuel|smic net mensuel",
    "smic.0.0": "smic|smic horaire|smic brut|salaire minimum|heures de smic|heure de smic",
    "pension.0.0": "pension|pensions|pension moyenne|retraite moyenne|retraite|retraites",
    "retraitesdep": "depenses de retraite|depense de retraite|cout des retraites",
    "pauvreret.0.0": "pauvrete des retraites",
    "ecartpen.0.0": "ecart de pension|ecart de pensions",
    "esemp.0.0": "emploi des seniors|emploi des 55 64 ans",
    "pauvrete.0.0": "pauvrete|taux de pauvrete|pauvres",
    "inflation.0.0": "inflation|hausse des prix|prix a la consommation|cout de la vie|vie chere",
    "dette.1.0": "dette en pourcentage du pib|dette en du pib|dette par rapport au pib",
    "dette.0.0": "dette|dette publique|dette de la france|dette de l etat",
    "dettenr": "dette detenue a l etranger|dette a l etranger|dette etrangere",
    "deficit.0.0": "deficit|deficit public|deficit de la france|deficit de l etat",
    "depenses.0.0": "depenses publiques|depense publique",
    "recettes.0.0": "recettes publiques|recettes",
    "po.0.0": "prelevements obligatoires|impots|impot|taxes|taxe",
    "interets.0.0": "charge d interets|charge de la dette|interets de la dette|interet de la dette|interets|interet",
    "taux.0.0": "taux d emprunt|taux d interet|taux a 10 ans|oat",
    "soldeetat.0.0": "budget de l etat|solde du budget",
    "pib.0.0": "pib|richesse produite|richesse de la france|produit interieur brut",
    "espibhab.0.0": "pib par habitant",
    "croissance.0.0": "croissance",
    "emploi.0.0": "emploi salarie|emploi prive|nombre de salaries|salaries|salarie",
    "tauxemploi.0.0": "taux d emploi|emploi",
    "chomage.0.0": "chomage|taux de chomage",
    "actifs.0.0": "population active|actifs|actif|nombre d actifs|travailleurs|gens qui travaillent",
    "chomeurs.0.0": "chomeurs|chomeur|nombre de chomeurs|personnes au chomage|gens au chomage|francais au chomage|nombre de personnes au chomage",
    "gazole.0.1": "essence|sans plomb|sp95|litre d essence|litres d essence",
    "gazole.0.0": "gazole|diesel|carburant|gasoil|litre de gazole|litres de gazole|litre de diesel|litres de diesel",
    "baguette.0.0": "baguette|baguettes|pain|kilo de pain|kilos de pain",
    "eselec.0.0": "electricite|prix de l electricite",
    "population.0.0": "population|habitants|habitant|nombre d habitants|personnes|gens|nombre de francais|combien de francais|les francais",
    "ages.0.0": "60 ans ou plus|vieillissement",
    "naissances.0.0": "naissances|naissance|natalite|bebes|bebe",
    "deces.0.0": "deces|morts|mort|mortalite",
    "soldemig.0.0": "solde migratoire",
    "soldenat.0.0": "solde naturel",
    "fecondite.0.0": "fecondite|enfants par femme",
    "ev.0.0": "esperance de vie",
    "immigres.0.0": "immigres|immigration|immigre|immigree|immigrees",
    "etrangers.0.0": "etrangers|etranger",
    "entrees.0.0": "entrees d immigres|immigres entres|arrivees d immigres",
    "espermis.0.0": "titres de sejour|titre de sejour|premiers titres",
    "esasile.0.0": "demandes d asile|asile",
    "esordres.0.0": "oqtf|ordres de quitter|expulsions",
    "homenr.0.0": "homicides|homicide|meurtres|meurtre|assassinats|assassinat",
    "cambriolages.0.0": "cambriolages|cambriolage|vols de logement",
    "violphys.0.0": "violences physiques|violence physique|agressions|agression",
    "violsex.0.0": "violences sexuelles",
    "violsex.0.1": "viols|viol",
    "trafic.0.0": "trafic de stupefiants|trafic de drogue|drogue",
    "escroqueries.0.0": "escroqueries|escroquerie|arnaques|arnaque",
    "occupation.0.0": "prisons|prison|occupation des prisons|surpopulation carcerale",
    "salaire.0.0": "salaire|salaires|salaire moyen|salaire median",
    "niveau.0.0": "niveau de vie",
    "seuilspat": "patrimoine|patrimoine des menages",
    "patr10": "patrimoine des riches|plus riches|les riches",
    "rsa": "rsa|allocataires du rsa|allocataire du rsa|beneficiaires du rsa|beneficiaire du rsa",
    "minima": "minima sociaux",
    "medecins.0.0": "medecins|medecin|docteurs|docteur",
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
  ("calcul calcule calculer coute coutent couter gagne gagnent pourquoi augmente augmentent augmentation hausse baisse si chaque tous toutes avec pour ca avoir obtenir represente representent peut etre quand quel quelle quels quelles est c etait etaient sont etait combien y a il ont elle elles je tu on me moi nous vous ma mon veux voudrais aimerais peux peut savoir donne donner dis dire montre montrer affiche afficher cherche trouve trouver voir prix chiffre chiffres nombre nombres taux montant montants valeur valeurs niveau part total moyen moyenne france francais francaise fr annee annees entre dans par ce cet cette ses son sa leur leurs que qui quoi comment s n qu se plus moins bien tres stp merci svp evolution evolue evoluer evolu bonjour salut ete fait faire avait aujourd hui maintenant actuel actuelle actuellement dernier derniere recent recente").split(" ").forEach(function (w) { FILLER[w] = 1; });
  var MONTH_WORDS = { janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12 };
  var QUALIFIERS = [[/\bhommes?\b/, "homme"], [/\bfemmes?\b/, "femme"], [/\b(jeunes|15 24 ans|moins de 25 ans)\b/, "15-24"], [/\b25 49 ans\b/, "25-49"], [/\b(seniors|50 ans ou plus|plus de 50 ans)\b/, "50 ans"]];
  var ALIAS_LIST = [];
  Object.keys(ALIASES).forEach(function (k) { ALIASES[k].split("|").forEach(function (a) { ALIAS_LIST.push([a, k]); }); });
  ALIAS_LIST.sort(function (a, b) { return b[0].length - a[0].length; });

  function themeOf(key) { var found = null; Object.keys(THEMES).forEach(function (t) { THEMES[t].items.forEach(function (i) { if (i.key === key) found = t; }); }); return found; }
  // Population active : chômeurs divisés par le taux de chômage. Elle n'a pas de page, mais elle sert aux calculs.
  var actifsEnt = null;
  function actifs() {
    if (actifsEnt) return actifsEnt;
    var rate = {};
    (DATA["001688527"] || []).forEach(function (p) { rate[p[0]] = p[1]; });
    var pts = (DATA["011818555"] || []).filter(function (p) { return rate[p[0]]; }).map(function (p) { return [p[0], p[1] * 1e-3 / rate[p[0]] * 100]; });
    var line = { pts: pts, name: "Population active" }, item = { key: "actifs", n: "Population active (calculée)", virtual: 1, views: [{ label: "", lines: [line], unit: "M", dec: 2 }], o: "Insee, chômeurs ÷ taux de chômage" };
    actifsEnt = { key: "actifs.0.0", item: item, theme: null, view: 0, virtual: 1, e: { key: "actifs.0.0", item: item, line: line, unit: "M", dec: 2, n: item.n } };
    return actifsEnt;
  }
  function entity(key) {
    cmpCatalog();
    if (key === "actifs.0.0") return actifs();
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
    var nowYear = new Date().getFullYear();
    text = text.replace(/\b(?:depuis|sur|en|ces|les|sur les|ces) (\d{1,2}) (?:dernieres? )?ans?\b|\b(?:depuis |sur |en )?(?:les |ces )?(\d{1,2}) dernieres annees\b/g, function (_, a, b) { return " depuis " + (nowYear - +(a || b)) + " "; });
    text = text.replace(/\bil y a (\d{1,2}) ans?\b/g, function (_, n) { return " en " + (nowYear - +n) + " "; });
    text = text.replace(/\b(?:l an dernier|l annee derniere|annee derniere)\b/g, function () { return " en " + (nowYear - 1) + " "; });
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

  // --- Calculs : tout est fait ici, à partir des chiffres du site, et chaque réponse montre son opération.
  // Seuls les vrais totaux se divisent entre eux : un taux ou un indice n'est pas un total.
  var CALC_TOTAL = { actifs: "count", dette: "money", pib: "money", interets: "money", soldeext: "money", conso: "money", fbcf: "money", population: "count", chomeurs: "count", emploi: "count", naissances: "count", deces: "count", soldenat: "count", soldemig: "count", medecins: "count", immigres: "count", etrangers: "count", entrees: "count", homenr: "count", cambriolages: "count", violphys: "count", violsex: "count", trafic: "count", escroqueries: "count", esasile: "count", espermis: "count", esordres: "count", defaillances: "count" };
  // Le taux de chômage ne se multiplie pas : le nombre de chômeurs existe. Conso et investissement ont une vue en euros, par trimestre.
  var CALC_SWAP = { chomage: "chomeurs.0.0", conso: "conso.1.0", fbcf: "fbcf.1.0" };
  var CALC_QUARTERLY = { conso: 1, fbcf: 1 };
  var CALC_OF_PIB = { depenses: 1, recettes: 1, po: 1, deficit: 1 };
  var CALC_SCALE = { "Md €": 1e9, "M": 1e6 };
  var CALC_POP = /^(?:un |une |chaque |le |la |les |l )*(habitants?|personnes?|francais|francaises?|tete)\s*$/;
  var CALC_DE = "(?:de la|de l|des|du|de|d)";
  var PRICE_BASE = { smic: "à l'heure", smicnet: "au mois", pension: "au mois", gazole: "au litre", baguette: "au kilo", eselec: "au kWh", seuilspat: "en patrimoine" };
  function calcBaseClash(a, b) {
    if (calcKind(a) !== "price" || calcKind(b) !== "price") return "";
    var x = PRICE_BASE[a.item.key], y = PRICE_BASE[b.item.key];
    return x && y && x !== y ? "« " + calcName(a) + " » se compte " + x + ", « " + calcName(b) + " » " + y + " : la comparaison serait fausse." : "";
  }
  function calcGrossNote(a, b) {
    var ks = [a.item.key, b.item.key];
    return ks.indexOf("pension") >= 0 && ks.indexOf("smicnet") >= 0 ? '<span class="ask-note">La pension est brute et le Smic est net : comparaison indicative.</span>' : "";
  }
  // Chiffres affichés sans historique : on lit la valeur écrite sur le site.
  var FIXED_KIND = { rsa: "count", minima: "count", retraitesdep: "money", seuilspat: "price" };

  function calcNumber(s) { return parseFloat(String(s).replace("virg", ".")); }
  function calcShown(v, max) {
    var abs = Math.abs(v), dec = max !== undefined ? max : abs >= 100 ? 1 : 2;
    return num(v, v === Math.round(v) && max === undefined ? 0 : dec);
  }
  function calcResolve(seg, loose) {
    var a = matchAliases(seg), keys = a.keys, left = meaningful(stripQualifiers(a.rest));
    if (!keys.length && left.length) { keys = typo(left); if (keys.length) left = []; }
    if (!keys.length && left.length && loose) {
      var rows = fuzzy(left);
      if (rows.length) {
        var close = rows.filter(function (r) { return r.total === rows[0].total; });
        if (close.length === 1 && rows[0].best >= 40) { keys = [rows[0].x.item.key + (rows[0].x.item.views ? ".0.0" : "")]; left = []; }
      }
    }
    if (keys.length !== 1) return null;
    var ent = entity(keys[0]);
    if (!ent) return null;
    ent = qualify(ent, seg);
    ent.left = left;
    return ent;
  }
  function calcSwap(ent) {
    var k = ent.item.key, to = CALC_SWAP[k];
    if (!to || !ent.e || ent.e.unit !== "%" || ent.key !== k + ".0.0") return ent;
    var n = entity(to);
    if (!n || !n.e) return ent;
    n.left = ent.left;
    n.swapped = ent;
    return n;
  }
  function calcKind(ent) {
    if (ent.literal) return ent.kind;
    if (!ent.e) return FIXED_KIND[ent.item.key] || "fixed";
    var k = ent.item.key, u = ent.e.unit;
    if (u === "%") return CALC_OF_PIB[k] ? "money" : "rate";
    if (CALC_TOTAL[k]) return CALC_TOTAL[k];
    if (u === "€") return "price";
    return u ? "other" : "index";
  }
  // Valeur d'un chiffre à une date, en vraies unités (euros, personnes) pour les totaux.
  function calcPoint(ent, t) {
    if (ent.literal) return { v: ent.v, label: "", kind: ent.kind, point: null, literal: 1 };
    if (!ent.e) return calcFixedPoint(ent, t);
    var data = lineData(ent.e.line), last = data[data.length - 1], k = ent.item.key, kind = calcKind(ent), pt, i;
    t = t || { last: 1 };
    if (t.last) pt = last;
    else {
      pt = t.p ? data.filter(function (x) { return x[0] === t.p; })[0] : null;
      if (!pt) pt = pointOf(ent.e, t.to || t.y);
    }
    var miss = { missing: 1, first: data[0][0], last: last[0], ent: ent };
    if (!pt) return miss;
    var v = pt[1], label = periodLabel(pt[0]);
    if (CALC_QUARTERLY[k] && kind === "money") {
      i = data.indexOf(pt);
      if (i < 3) return miss;
      v = data[i][1] + data[i - 1][1] + data[i - 2][1] + data[i - 3][1];
      label = "4 trimestres jusqu'au " + label.toLowerCase();
    }
    if (kind === "money" && ent.e.unit === "%") {
      var y = pt[0].slice(0, 4), pib = entity("pib.0.0"), base = pib && pib.e ? pointOf(pib.e, y) : null;
      if (!base) return miss;
      return { v: v / 100 * base[1] * 1e9, label: y, pct: v, pibV: base[1], kind: kind, point: pt[0] };
    }
    if (kind === "money" || kind === "count") v *= CALC_SCALE[ent.e.unit] || 1;
    return { v: v, label: label, kind: kind, point: pt[0] };
  }
  function calcFixedPoint(ent, t) {
    var h = headline(ent.item), kind = calcKind(ent), w = h.w || "", y = (/((?:19|20)\d\d)/.exec(w) || [])[1] || "";
    if (t && !t.last && t.y && t.y !== y) return { missing: 1, fixedOnly: 1, ent: ent, w: w };
    var n = parseNumber(String(h.f).replace(/[^\d,.\s-]/g, "").trim()), mult = /\bM\b/.test(h.f) ? 1e6 : 1;
    if (isNaN(n)) return { missing: 1, fixedOnly: 1, ent: ent, w: w };
    if (ent.item.key === "retraitesdep") {
      var pib = entity("pib.0.0"), base = pib && pib.e ? pointOf(pib.e, y) : null;
      if (!base) return { missing: 1, fixedOnly: 1, ent: ent, w: w };
      return { v: n / 100 * base[1] * 1e9, label: y, pct: n, pibV: base[1], kind: kind, point: y };
    }
    return { v: n * mult, label: w, kind: kind, point: y || "0000" };
  }
  // Sans date demandée, deux chiffres sont lus la même année si possible : dernière année commune.
  function calcPair(a, b, when) {
    var ra = calcPoint(a, when), rb = calcPoint(b, when);
    if (!when && !ra.missing && !rb.missing && !ra.literal && !rb.literal && ra.point.slice(0, 4) !== rb.point.slice(0, 4)) {
      var y = String(Math.min(+ra.point.slice(0, 4), +rb.point.slice(0, 4))), ta = calcPoint(a, { y: y }), tb = calcPoint(b, { y: y });
      if (!ta.missing && !tb.missing) { ra = ta; rb = tb; }
    }
    return { a: ra, b: rb, differ: !ra.missing && !rb.missing && !ra.literal && !rb.literal && ra.point.slice(0, 4) !== rb.point.slice(0, 4) };
  }
  function calcShort(n) { return num(n, n % 1 === 0 ? 0 : (n * 10) % 1 === 0 ? 1 : 2); }
  function calcFmt(kind, v, ent) {
    var a = Math.abs(v);
    if (kind === "money") return a >= 1e9 ? num(v / 1e9, v % 1e9 === 0 ? 0 : a >= 1e11 ? 1 : 2) + " Md €" : a >= 1e6 ? num(v / 1e6, v % 1e6 === 0 ? 0 : 1) + " M €" : num(v, a >= 1000 || v % 1 === 0 ? 0 : 2) + " €";
    if (kind === "count") return a >= 1e9 ? num(v / 1e9, 2) + " milliards" : a >= 1e6 ? num(v / 1e6, v % 1e6 === 0 ? 0 : 2) + " million" + (a >= 2e6 ? "s" : "") : num(v, a >= 100 || v === Math.round(v) ? 0 : 1);
    if (kind === "price") return num(v, a >= 100 ? 2 : Math.max(2, ent && ent.e ? ent.e.dec : 2)) + " €";
    var dec = ent && ent.e ? Math.min(ent.e.dec + 1, 3) : 2, u = ent && ent.e ? ent.e.unit : "";
    return num(v, dec) + (u ? " " + u : "");
  }
  function calcName(ent) { return ent.literal ? ent.n : nameOf(ent); }
  function calcSource(ents) {
    var seen = [];
    ents.forEach(function (x) { if (x.literal) return; var o = x.item.o || "Insee"; if (seen.indexOf(o) < 0) seen.push(o); });
    return '<span class="ask-src">Calcul de StatPublique.' + (seen.length ? " Source : " + esc(seen.join(", ")) : "") + "</span>";
  }
  function calcLine(ent, r) {
    if (ent.literal) return "";
    var text = calcName(ent) + " : " + calcFmt(r.kind, r.v, ent) + " (" + r.label + ")";
    if (r.pct !== undefined) text += ", soit " + num(r.pct, 1) + " % d'un PIB de " + num(r.pibV, 1) + " Md €";
    return '<span class="ask-note">' + nb(text) + ".</span>";
  }
  function calcMissing(r) {
    if (r.fixedOnly) return "<b>Le site n'a qu'une valeur pour ce chiffre.</b><span class=\"ask-note\">" + nb("« " + r.ent.item.n + " » : " + r.w + ".") + "</span>";
    return "<b>Pas de chiffre à cette date.</b><span class=\"ask-note\">" + nb(calcName(r.ent)) + " : premier chiffre " + nb(periodLabel(r.first)) + ", dernier " + nb(periodLabel(r.last)) + ".</span>";
  }
  function calcRefuse(reason) { return "<b>Ce calcul n'aurait pas de sens.</b><span class=\"ask-note\">" + nb(reason) + "</span>"; }
  function calcNoSeries(ent) { return "<b>Je ne peux pas encore calculer sur ce chiffre.</b><span class=\"ask-note\">" + nb("« " + ent.item.n + " » n'a pas d'historique sur le site.") + "</span>"; }
  function calcNotTotal(ent, what) {
    var hint = ent.item.key === "chomage" ? " Essayez plutôt « nombre de chômeurs »." : ent.item.key === "tauxemploi" ? " Essayez plutôt « emploi salarié »." : "";
    return calcRefuse("« " + calcName(ent) + " » n'est pas un total : " + what + " serait trompeur." + hint);
  }
  function calcSwapNote(ent) {
    if (!ent.swapped) return "";
    if (CALC_QUARTERLY[ent.item.key]) return '<span class="ask-note">Calculé sur le montant en euros, pas sur l\'évolution.</span>';
    return '<span class="ask-note">Calculé sur le nombre de personnes, pas sur le taux de ' + nb(num(lineData(ent.swapped.e.line).slice(-1)[0][1], 1)) + " %.</span>";
  }

  // Multiplier un chiffre : 50 % du PIB, le double du Smic, 3 fois la dette.
  function calcScale(p) {
    var ent = p.ent, kind = calcKind(ent);
    if (kind === "fixed") return { html: calcNoSeries(ent) };
    if (kind === "index") return { html: calcNotTotal(ent, "le multiplier") };
    if (ent.literal) return { html: "<b>" + nb(ent.n + " " + p.sign + " : " + calcFmt(ent.kind, ent.v * p.factor)) + "</b>" };
    var r = calcPoint(ent, p.when);
    if (r.missing) return { html: calcMissing(r) };
    var v = r.v * p.factor;
    return { ents: [ent], html: "<b>" + nb((p.whatif ? "Hypothèse : " : "") + calcName(ent) + " " + p.sign + " : " + calcFmt(r.kind, v, ent)) + "</b> <span>(" + nb(r.label) + ")</span>" + calcLine(ent, r) + calcSwapNote(ent) + (p.whatif ? '<span class="ask-note">Simple calcul à partir du dernier chiffre : ce n\'est pas une prévision.</span>' : ""), open: ent };
  }
  // Diviser deux chiffres : part, montant par habitant, nombre de fois.
  function calcRatio(p) {
    var a = p.a, b = p.b, ka = calcKind(a), kb = calcKind(b);
    if (a.item.key === b.item.key && a.key === b.key) return { html: calcRefuse("Ces deux chiffres sont le même.") };
    if (ka === "fixed" || kb === "fixed") return { html: calcNoSeries(ka === "fixed" ? a : b) };
    if (["money", "count", "price"].indexOf(ka) < 0) return { html: calcNotTotal(a, "le diviser") };
    if (["money", "count", "price"].indexOf(kb) < 0) return { html: calcNotTotal(b, "diviser par lui") };
    if (a.literal && b.literal) return { html: calcRefuse("Il me faut au moins un chiffre du site.") };
    if (ka === "price" && kb !== "price") return { html: calcRefuse("Un prix ou un salaire ne se divise pas par un total.") };
    if (ka === "count" && kb === "money") return { html: calcRefuse("Un nombre de personnes ne se divise pas par un montant en euros. Essayez dans l'autre sens.") };
    var pair = calcPair(a, b, p.when), ra = pair.a, rb = pair.b;
    if (ra.missing) return { html: calcMissing(ra) };
    if (rb.missing) return { html: calcMissing(rb) };
    if (!rb.v) return { html: calcRefuse("Le diviseur vaut zéro à cette date.") };
    var v = ra.v / rb.v, name = calcName(a), of = calcName(b), head;
    if (ka === "money" && kb === "count") head = name + (p.pop ? " par habitant" : " ÷ " + of) + " : " + num(v, Math.abs(v) >= 1000 ? 0 : 2) + " €";
    else if (ka === kb && ka !== "price" && !p.per) head = name + " en part de " + of + " : " + (Math.abs(v) < 0.00001 ? "moins de 0,001 %" : num(v * 100, Math.abs(v) >= 10 ? 0 : Math.abs(v) >= 0.01 ? 1 : 3) + " %");
    else if (ka === "count" && kb === "count") {
      var base = p.base || (Math.abs(v) >= 1 ? 1 : Math.abs(v) >= 0.01 ? 1000 : 100000);
      head = name + (p.pop ? " pour " + num(base, 0) + " habitant" + (base > 1 ? "s" : "") : base > 1 ? " pour " + num(base, 0) + " : " + of : " ÷ " + of) + " : " + num(v * base, Math.abs(v * base) >= 100 ? 0 : 1);
    } else if (CALC_UNITS[b.item.key]) head = (a.literal ? "Avec " + name : name) + " : " + (Math.abs(v) >= 1e6 ? calcFmt("count", v) + " de" : num(v, Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2)) + " " + CALC_UNITS[b.item.key];
    else head = name + " ÷ " + of + " : " + num(v, Math.abs(v) >= 100 ? 0 : 2) + " fois";
    var note = pair.differ ? '<span class="ask-note">Attention : les deux chiffres ne portent pas sur la même période.</span>' : "";
    return { ents: [a, b], html: "<b>" + nb(head) + "</b>" + calcLine(a, ra) + calcLine(b, rb) + note + calcGrossNote(a, b) + calcSwapNote(a) + calcSwapNote(b), open: a.literal ? b : a };
  }
  // Additionner ou soustraire : seulement des chiffres de même nature.
  function calcAdd(p) {
    var a = p.a, b = p.b, ka = calcKind(a), kb = calcKind(b), sub = p.op === "sub";
    if (ka !== kb || ["money", "count", "price", "rate"].indexOf(ka) < 0 || (ka === "rate" && a.e.unit !== b.e.unit)) return { html: calcRefuse("« " + calcName(a) + " » et « " + calcName(b) + " » ne se mesurent pas de la même façon.") };
    if (ka === "rate" && !sub) return { html: calcRefuse("Additionner deux taux ne donne pas un taux.") };
    if (calcBaseClash(a, b)) return { html: calcRefuse(calcBaseClash(a, b)) };
    var pair = calcPair(a, b, p.when), ra = pair.a, rb = pair.b;
    if (ra.missing) return { html: calcMissing(ra) };
    if (rb.missing) return { html: calcMissing(rb) };
    var v = sub ? ra.v - rb.v : ra.v + rb.v, shown = ka === "rate" ? signed(v, a.e.dec) + " point" + (Math.abs(v) >= 2 ? "s" : "") : calcFmt(ka, v, a);
    var note = pair.differ ? '<span class="ask-note">Attention : les deux chiffres ne portent pas sur la même période.</span>' : "";
    return { ents: [a, b], html: "<b>" + nb(calcName(a) + (sub ? " − " : " + ") + calcName(b) + " : " + shown) + "</b>" + calcLine(a, ra) + calcLine(b, rb) + note, open: a.literal ? b : a };
  }
  // Corrélation de Pearson sur les années communes. Sur des niveaux, deux chiffres qui montent avec le temps
  // paraissent toujours liés : on regarde donc aussi les variations d'une année sur l'autre.
  function pearson(x, y) {
    var n = x.length, mx = 0, my = 0, sxy = 0, sx = 0, sy = 0, i;
    for (i = 0; i < n; i++) { mx += x[i]; my += y[i]; }
    mx /= n; my /= n;
    for (i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sx += (x[i] - mx) * (x[i] - mx); sy += (y[i] - my) * (y[i] - my); }
    return sx > 0 && sy > 0 ? sxy / Math.sqrt(sx * sy) : null;
  }
  function corrWord(r) { var a = Math.abs(r); return a < 0.2 ? "quasi nul" : a < 0.4 ? "faible" : a < 0.7 ? "moyen" : a < 0.9 ? "fort" : "très fort"; }
  function calcCorr(p) {
    var a = p.a, b = p.b;
    if (!a.e || !b.e) return { html: calcNoSeries(!a.e ? a : b) };
    if (a.e.key === b.e.key) return { html: calcRefuse("Ces deux chiffres sont le même.") };
    var va = cmpValues(a.e), vb = cmpValues(b.e), from = p.from ? String(p.from) : "0", to = p.to ? String(p.to) : "9999";
    var years = Object.keys(va).filter(function (y) { return vb[y] !== undefined && y >= from && y <= to; }).sort();
    if (years.length < 5) return { html: "<b>Pas assez d'années communes.</b><span class=\"ask-note\">Il en faut au moins 5 pour parler de lien : ici " + years.length + ".</span>" };
    var xs = years.map(function (y) { return va[y]; }), ys = years.map(function (y) { return vb[y]; }), r = pearson(xs, ys);
    if (r === null) return { html: "<b>Calcul impossible : un des deux chiffres ne varie pas.</b>" };
    var dx = [], dy = [], i;
    for (i = 1; i < years.length; i++) if (+years[i] === +years[i - 1] + 1) { dx.push(xs[i] - xs[i - 1]); dy.push(ys[i] - ys[i - 1]); }
    var rd = dx.length >= 5 ? pearson(dx, dy) : null;
    var sense = Math.abs(r) < 0.2 ? "" : r > 0 ? " Ils montent et baissent plutôt ensemble." : " Quand l'un monte, l'autre baisse plutôt.";
    var html = "<b>" + nb("Lien " + corrWord(r) + " entre " + calcName(a) + " et " + calcName(b)) + "</b> <span>(" + nb("r = " + num(r, 2)) + ", " + years[0] + "–" + years[years.length - 1] + ", " + years.length + " années)</span>";
    html += '<span class="ask-note">' + nb("De −1 (opposés) à +1 (identiques)." + sense) + "</span>";
    if (rd !== null) html += '<span class="ask-note">' + nb("D'une année sur l'autre, le lien est " + corrWord(rd) + " (r = " + num(rd, 2) + ").") + "</span>";
    if (rd !== null && Math.abs(r) >= 0.7 && Math.abs(rd) < 0.4) html += '<span class="ask-note">Ce lien vient surtout du fait que les deux chiffres évoluent dans le temps.</span>';
    html += '<span class="ask-note">Un lien ne prouve pas que l\'un cause l\'autre.</span>';
    return { ents: [a, b], html: html, compare: a.virtual || b.virtual ? null : "comparer=" + a.e.key + "," + b.e.key + "&de=" + years[0] + "&a=" + years[years.length - 1], open: a.virtual ? b : a };
  }
  // Calcul simple tapé tel quel : 12 x 4, (100 + 20) / 3, 50 % de 300.
  function mathValue(s) {
    var i = 0;
    function space() { while (s[i] === " ") i++; }
    function atom() {
      space();
      if (s[i] === "-") { i++; return -atom(); }
      if (s[i] === "(") { i++; var v = sum(); space(); if (s[i] !== ")") throw 0; i++; return v; }
      var m = /^\d+(?:\.\d+)?/.exec(s.slice(i));
      if (!m) throw 0;
      i += m[0].length;
      return parseFloat(m[0]);
    }
    function prod() {
      var v = atom();
      for (;;) {
        space();
        if (s[i] === "*") { i++; v *= atom(); }
        else if (s[i] === "/") { i++; var d = atom(); if (d === 0) throw 1; v /= d; }
        else return v;
      }
    }
    function sum() {
      var v = prod();
      for (;;) {
        space();
        if (s[i] === "+") { i++; v += prod(); }
        else if (s[i] === "-") { i++; v -= prod(); }
        else return v;
      }
    }
    var out = sum();
    space();
    if (i !== s.length) throw 0;
    return out;
  }
  function parseMath(raw) {
    var t = raw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s*[?=!.]+\s*$/, "").replace(/^\s*(?:combien\s+(?:font|fait)|calcule[rz]?|calcul(?:\s+de)?|ca\s+fait\s+combien)\s+/, "").trim();
    var pc = /^(\d+(?:[.,]\d+)?)\s*(?:%|pour\s*cent)\s+d[e']\s*(\d[\d\s]*(?:[.,]\d+)?)$/.exec(t);
    if (pc) { var a = parseFloat(pc[1].replace(",", ".")), b = parseFloat(pc[2].replace(/\s/g, "").replace(",", ".")); return { type: "calc", op: "math", shown: num(a, a % 1 ? 2 : 0) + " % de " + num(b, b % 1 ? 2 : 0), v: a / 100 * b }; }
    var e = t.replace(/(\d)\s+(?=\d{3}\b)/g, "$1").replace(/(\d),(\d)/g, "$1.$2").replace(/\b(?:fois|x)\b/g, "*").replace(/×/g, "*").replace(/÷/g, "/").replace(/\bdivise\s+par\b/g, "/").replace(/\bplus\b/g, "+").replace(/\bmoins\b/g, "-");
    if (!/^[\d\s.+\-*/()]+$/.test(e) || !/\d\s*[+\-*/]\s*[\d(-]|\)\s*[+\-*/]/.test(e) || /^\s*(?:19|20)\d\d\s*-\s*(?:19|20)\d\d\s*$/.test(e)) return null;
    try { var v = mathValue(e); return { type: "calc", op: "math", shown: e.replace(/\*/g, "×").replace(/\//g, "÷").replace(/\./g, ",").replace(/\s+/g, " ").trim(), v: v }; }
    catch (err) { return err === 1 ? { type: "calc", op: "math", zero: 1 } : null; }
  }

  // --- Questions sur un seul chiffre dans le temps, hypothèses, seuils, montants libres.
  var CALC_FLOW = { naissances: 1, deces: 1, homenr: 1, cambriolages: 1, violphys: 1, violsex: 1, trafic: 1, escroqueries: 1, esasile: 1, espermis: 1, esordres: 1, entrees: 1, defaillances: 1, soldemig: 1, soldenat: 1, pib: 1, interets: 1, conso: 1, fbcf: 1, soldeext: 1, depenses: 1, recettes: 1, po: 1, deficit: 1, retraitesdep: 1 };
  var CALC_STOCK = { dette: "un stock, pas un flux", population: "un nombre de personnes à une date", chomeurs: "un nombre de personnes à une date", emploi: "un nombre de personnes à une date", immigres: "un nombre de personnes à une date", etrangers: "un nombre de personnes à une date", medecins: "un nombre de personnes à une date", actifs: "un nombre de personnes à une date" };
  var CALC_PER = { jour: 365, semaine: 365 / 7, mois: 12, heure: 8760, minute: 525600, seconde: 31536000 };
  // Ce qu'on achète avec un montant : le prix du site est au kilo, au litre ou à l'heure.
  var CALC_UNITS = { baguette: "kilos de baguette", gazole: "litres", eselec: "kWh", smic: "heures de Smic brut", smicnet: "Smic nets", pension: "pensions moyennes" };
  var CALC_SMIC_HOURS = 151.67;

  function calcLiteral(seg) {
    if (matchAliases(seg.replace(/\b(personnes?|gens|habitants?|francais)\b/g, " ")).keys.length) return null;
    var s = " " + seg.replace(/(\d) (?=\d{3}\b)/g, "$1") + " ";
    var m = /\s(\d+(?:virg\d+)?)\s+(milliards?|millions?|mille)?\s*(?:(?:d|de)\s+)?(euros?|personnes?|gens|habitants?|francais)?\s/.exec(s);
    if (!m || (!m[2] && !m[3])) return null;
    var mult = !m[2] ? 1 : /^milliard/.test(m[2]) ? 1e9 : /^million/.test(m[2]) ? 1e6 : 1e3;
    var v = calcNumber(m[1]) * mult, money = !m[3] || /^euro/.test(m[3]);
    return { literal: 1, v: v, kind: money ? "money" : "count", item: { key: "_", n: "" }, left: [], key: "_", n: calcFmt(money ? "money" : "count", v) };
  }
  function calcOperand(seg) { return calcLiteral(seg) || calcResolve(seg); }
  // Toute la série en vraies unités, pour chercher un record ou un seuil.
  function calcSeries(ent) {
    var kind = calcKind(ent), scale = kind === "money" || kind === "count" ? CALC_SCALE[ent.e.unit] || 1 : 1;
    return lineData(ent.e.line).map(function (p) { return [p[0], p[1] * scale]; });
  }
  function calcShownOf(ent, v) { var k = calcKind(ent); return k === "index" ? num(v, ent.e.dec) : k === "rate" ? num(v, ent.e.dec) + " %" : calcFmt(k, v, ent); }
  function calcInRange(p, a, b) { var y = p[0].slice(0, 4); return (!a || y >= String(a)) && (!b || y <= String(b)); }

  function calcExtreme(p) {
    var ent = p.ent;
    if (!ent.e) return { html: calcNoSeries(ent) };
    var d = calcSeries(ent).filter(function (x) { return calcInRange(x, p.from, p.to); });
    if (!d.length) return { html: "<b>Pas de chiffre sur cette période.</b>" };
    var best = d[0], sawEqual = 0;
    d.forEach(function (x) { if (p.low ? x[1] < best[1] : x[1] > best[1]) best = x; });
    d.forEach(function (x) { if (x[1] === best[1]) sawEqual++; });
    var now = d[d.length - 1];
    return { ents: [ent], open: ent, html: "<b>" + nb(calcName(ent) + " : " + (p.low ? "le plus bas" : "le plus haut") + " à " + calcShownOf(ent, best[1])) + "</b> <span>(" + nb(periodLabel(best[0])) + (sawEqual > 1 ? ", atteint " + sawEqual + " fois, ici la première" : "") + ")</span><span class=\"ask-note\">" + nb("Période couverte : " + periodLabel(d[0][0]) + " à " + periodLabel(now[0]) + ". Dernier chiffre : " + calcShownOf(ent, now[1]) + ".") + "</span>" };
  }
  function calcAverage(p) {
    var ent = p.ent;
    if (!ent.e) return { html: calcNoSeries(ent) };
    var vals = cmpValues(ent.e), years = Object.keys(vals).filter(function (y) { return (!p.from || y >= String(p.from)) && (!p.to || y <= String(p.to)); }).sort();
    if (!years.length) return { html: "<b>Pas de chiffre sur cette période.</b>" };
    var sum = 0, k = calcKind(ent), scale = k === "money" || k === "count" ? CALC_SCALE[ent.e.unit] || 1 : 1;
    years.forEach(function (y) { sum += vals[y]; });
    return { ents: [ent], open: ent, html: "<b>" + nb(calcName(ent) + " en moyenne : " + calcShownOf(ent, sum / years.length * scale)) + "</b> <span>(" + years[0] + "–" + years[years.length - 1] + ", " + years.length + " années)</span>" };
  }
  function calcCumul(p) {
    var ent = p.ent, k = ent.item.key;
    if (!ent.e) return { html: calcNoSeries(ent) };
    if (!CALC_FLOW[k]) return { html: calcRefuse("« " + calcName(ent) + " » ne s'additionne pas d'une année sur l'autre.") };
    var from = +p.from || 0, to = +p.to || 9999, sum = 0, used = [], kind = calcKind(ent);
    var years = {};
    lineData(ent.e.line).forEach(function (x) { years[x[0].slice(0, 4)] = 1; });
    Object.keys(years).sort().forEach(function (y) {
      if (+y < from || +y > to) return;
      var r = calcPoint(ent, { y: y });
      // Un chiffre sur quatre trimestres n'est complet qu'avec son 4e trimestre.
      if (r.missing || (/-Q[1-3]$/.test(r.point) && (ent.e.line.tf === "sum4" || CALC_QUARTERLY[k])) ) return;
      sum += r.v; used.push(y);
    });
    if (!used.length) return { html: "<b>Pas de chiffre sur cette période.</b>" };
    return { ents: [ent], open: ent, html: "<b>" + nb(calcName(ent) + " au total : " + calcFmt(kind === "rate" ? "other" : kind, sum, ent)) + "</b> <span>(" + used[0] + "–" + used[used.length - 1] + ", " + used.length + " années)</span>" };
  }
  function calcPerTime(p) {
    var ent = p.ent, k = ent.item.key, unit = p.unit, r;
    if (!ent.e && !FIXED_KIND[k]) return { html: calcNoSeries(ent) };
    r = calcPoint(ent, p.when);
    if (r.missing) return { html: calcMissing(r) };
    var v = r.v / CALC_PER[unit], kind = r.kind === "count" ? "count" : "money", word = " par " + unit, shown = kind === "money" ? (Math.abs(v) >= 1e6 ? calcFmt("money", v) : num(v, Math.abs(v) >= 100 ? 0 : 2) + " €") : num(v, Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 1 ? 1 : 3);
    var note = kind === "count" && Math.abs(v) < 1 ? '<span class="ask-note">' + nb("Soit environ 1 toutes les " + num(1 / Math.abs(v), 1) + " " + unit + "s.") + "</span>" : "";
    return { ents: [ent], open: ent, html: "<b>" + nb(calcName(ent) + word + " : " + shown) + "</b> <span>(" + nb(r.label) + ")</span>" + calcLine(ent, r) + note + '<span class="ask-note">Moyenne sur l\'année : la réalité varie selon les jours.</span>' };
  }
  function calcPayPeriod(p) {
    var r = calcPoint(p.ent, p.when);
    if (r.missing) return { html: calcMissing(r) };
    return { ents: [p.ent], open: p.ent, html: "<b>" + nb(calcName(p.ent) + " " + p.word + " : " + num(r.v * p.factor, 0) + " €") + "</b> <span>(" + nb(r.label) + ")</span>" + calcLine(p.ent, r) + (p.note ? '<span class="ask-note">' + nb(p.note) + "</span>" : "") };
  }
  function calcThreshold(p) {
    var ent = p.ent;
    if (!ent.e) return { html: calcNoSeries(ent) };
    var d = calcSeries(ent), kind = calcKind(ent), limit = p.limit;
    if (limit.native) limit = { v: limit.v * (kind === "money" || kind === "count" ? CALC_SCALE[ent.e.unit] || 1 : 1) };
    var shown = calcShownOf(ent, limit.v), first = null, now = d[d.length - 1], i, ok = function (x) { return p.below ? x[1] < limit.v : x[1] > limit.v; }, moves = [];
    for (i = 0; i < d.length; i++) { if (!first && ok(d[i])) first = d[i]; if (i && ok(d[i]) && !ok(d[i - 1])) moves.push(d[i]); }
    var word = p.below ? "sous " : "au-dessus de ";
    if (!first) return { ents: [ent], open: ent, html: "<b>" + nb(calcName(ent) + " : jamais passé " + word + shown) + "</b><span class=\"ask-note\">" + nb("Depuis " + periodLabel(d[0][0]) + ". Dernier chiffre : " + calcShownOf(ent, now[1]) + ".") + "</span>" };
    var note = "Dernier chiffre : " + calcShownOf(ent, now[1]) + " (" + periodLabel(now[0]) + ").";
    if (!moves.length) return { ents: [ent], open: ent, html: "<b>" + nb(calcName(ent) + " " + word + shown + " depuis le début des données") + "</b> <span>(" + nb(periodLabel(d[0][0])) + ")</span><span class=\"ask-note\">" + nb(note) + "</span>" };
    // « Depuis quand », ou un chiffre déjà sous le seuil au début : c'est le passage le plus récent qui répond.
    var latest = moves[moves.length - 1], useLast = p.since || ok(d[0]), hitPt = useLast ? latest : moves[0];
    if (!useLast && latest !== moves[0]) note = "Dernier passage : " + periodLabel(latest[0]) + ". " + note;
    return { ents: [ent], open: ent, html: "<b>" + nb(calcName(ent) + " " + word + shown + (useLast ? " : dernier passage" : " pour la première fois")) + "</b> <span>(" + nb(periodLabel(hitPt[0])) + ", " + nb(calcShownOf(ent, hitPt[1])) + ")</span><span class=\"ask-note\">" + nb(note) + "</span>" };
  }
  function calcNewValue(p) {
    var ent = p.ent, kind = calcKind(ent);
    if (kind === "fixed" || kind === "index") return { html: calcNotTotal(ent, "le changer") };
    var r = calcPoint(ent, null);
    if (r.missing) return { html: calcMissing(r) };
    if (!r.v) return { html: calcRefuse("Ce chiffre vaut zéro.") };
    var diff = p.v - r.v;
    return { ents: [ent], open: ent, html: "<b>" + nb(calcName(ent) + " à " + calcFmt(r.kind, p.v, ent) + " : " + signed(diff / Math.abs(r.v) * 100, 1) + " %") + "</b>" + calcLine(ent, r) + '<span class="ask-note">' + nb("Soit un écart de " + (diff > 0 ? "+" : "") + calcFmt(r.kind, diff, ent) + ".") + "</span>" };
  }
  function calcVsDate(p) {
    var ent = p.ent;
    if (!ent.e) return { html: calcNoSeries(ent) };
    var now = calcPoint(ent, null), then = calcPoint(ent, p.when);
    if (then.missing) return { html: calcMissing(then) };
    var up = now.v > then.v, same = now.v === then.v, yes = same ? false : p.less ? !up : up, kind = calcKind(ent);
    return { ents: [ent], open: ent, html: "<b>" + (same ? "Égal" : yes ? "Oui" : "Non") + nb(" : " + calcName(ent) + " à " + calcShownOf(ent, now.v) + " (" + now.label + "), contre " + calcShownOf(ent, then.v) + " (" + then.label + ")") + "</b>" + (kind === "rate" ? '<span class="ask-note">' + nb("Écart : " + signed(now.v - then.v, ent.e.dec) + " point" + (Math.abs(now.v - then.v) >= 2 ? "s" : "") + ".") + "</span>" : then.v ? '<span class="ask-note">' + nb("Écart : " + signed((now.v / then.v - 1) * 100, 1) + " %.") + "</span>" : "") };
  }
  function calcVersus(p) {
    var a = p.a, b = p.b, ka = calcKind(a), kb = calcKind(b);
    if (ka !== kb || ["money", "count", "price", "rate"].indexOf(ka) < 0) return { html: calcRefuse("« " + calcName(a) + " » et « " + calcName(b) + " » ne se mesurent pas de la même façon.") };
    if (calcBaseClash(a, b)) return { html: calcRefuse(calcBaseClash(a, b)) };
    var pair = calcPair(a, b, p.when), ra = pair.a, rb = pair.b;
    if (ra.missing) return { html: calcMissing(ra) };
    if (rb.missing) return { html: calcMissing(rb) };
    var up = ra.v > rb.v, same = ra.v === rb.v, yes = same ? false : p.less ? !up : up;
    return { ents: [a, b], open: a.literal ? b : a, html: "<b>" + (same ? "Égal" : yes ? "Oui" : "Non") + nb(" : " + calcName(a) + " à " + calcShownOf(a, ra.v) + ", " + calcName(b) + " à " + calcShownOf(b, rb.v)) + "</b>" + calcLine(a, ra) + calcLine(b, rb) + calcGrossNote(a, b) };
  }
  function calcTimesPop(p) {
    var pop = entity("population.0.0"), r = calcPoint(pop, p.when);
    if (r.missing) return { html: calcMissing(r) };
    return { ents: [pop], html: "<b>" + nb(calcFmt("money", p.v) + " par habitant × " + calcFmt("count", r.v) + " d'habitants : " + calcFmt("money", p.v * r.v)) + "</b>" + calcLine(pop, r) };
  }
  // Questions à un seul chiffre. Renvoie null si ce n'en est pas une.
  function calcSpecial(body, d, when, done) {
    var m, ent, span = d.dates.filter(function (t) { return t.y; }), from = span[0] && span[0].y, to = span[0] && span[0].to ? span[0].to : span[1] ? span[1].y : null, ranged = !!(span[0] && (span[0].to || span[0].since)) || span.length >= 2;
    var noMarks = body.replace(/\s*zd\d+z\s*/g, " ");
    function one(seg) { var x = calcResolve(seg, true); if (x) x.left = []; return x; }

    // Si chaque Français donne 100 euros ; 100 € par habitant
    m = /\b(?:chaque|tous les|toutes les|par) (?:habitants?|francais|francaises|personnes?)\b/.exec(noMarks);
    if (m) {
      var lit = calcLiteral(noMarks.replace(m[0], " "));
      if (lit && lit.kind === "money" && lit.v < 1e6) return done({ op: "timespop", v: lit.v, when: when });
    }
    // Si le Smic augmente de 10 %, si la dette baisse de 5 %
    m = /(.*?)\b(augmente\w*|monte\w*|hausse|grimpe\w*|progresse\w*|plus|baisse\w*|diminue\w*|chute\w*|recule\w*|perd\w*|moins)\b(?: de| d)? (\d+(?:virg\d+)?) pourcents?\b(.*)$/.exec(noMarks);
    if (m) {
      ent = one(m[1]) || one(m[4].replace(new RegExp("^\\s*" + CALC_DE + "\\s"), " "));
      if (ent) {
        var pc = calcNumber(m[3]), down = /^(baisse|diminue|chute|recule|perd|moins)/.test(m[2]);
        return done({ op: "scale", ent: calcSwap(ent), factor: 1 + (down ? -pc : pc) / 100, sign: (down ? "− " : "+ ") + calcShort(pc) + " %", when: when, whatif: 1 });
      }
    }
    m = /^(.*?)\b(double\w*|triple\w*)\b/.exec(noMarks);
    if (m && /\bsi\b/.test(noMarks) && (ent = one(m[1]))) return done({ op: "scale", ent: calcSwap(ent), factor: /^double/.test(m[2]) ? 2 : 3, sign: /^double/.test(m[2]) ? "× 2" : "× 3", when: when, whatif: 1 });
    // Si le Smic net passe à 2000 €
    m = /^(.*?)\b(?:passe\w*|passait|etait|montait|arrive\w*|tombe\w*)\s+(?:a|au|de)\s+(.+)$/.exec(noMarks);
    if (m && /\bsi\b/.test(noMarks) && (ent = one(m[1]))) {
      var aim = /(\d+(?:virg\d+)?)\s*(milliards?|millions?)?/.exec(m[2].replace(/(\d) (?=\d{3}\b)/g, "$1"));
      if (aim) {
        var k0 = calcKind(ent), base0 = k0 === "money" || k0 === "count" ? CALC_SCALE[ent.e && ent.e.unit] || 1 : 1;
        return done({ op: "newvalue", ent: calcSwap(ent), v: calcNumber(aim[1]) * (aim[2] ? (/^milliard/.test(aim[2]) ? 1e9 : 1e6) : base0) });
      }
    }
    // Par jour, par seconde ; Smic par an
    m = /^(.+?) (?:par|chaque|a la|au) (jour|semaine|mois|heure|minute|seconde|an|annee)\b/.exec(noMarks);
    if (m && (ent = calcResolve(m[1]))) {
      ent = calcSwap(ent);
      var k = ent.item.key, unitWord = m[2];
      if (k === "smic" && (unitWord === "mois" || unitWord === "an" || unitWord === "annee")) { var isMonth = unitWord === "mois"; return done({ op: "pay", ent: ent, factor: isMonth ? CALC_SMIC_HOURS : CALC_SMIC_HOURS * 12, word: isMonth ? "par mois" : "par an", when: when, note: "Brut, pour 35 heures par semaine (" + num(CALC_SMIC_HOURS, 2) + " heures par mois)." }); }
      if ((k === "smicnet" || k === "pension") && (unitWord === "an" || unitWord === "annee")) return done({ op: "pay", ent: ent, factor: 12, word: "par an", when: when, note: "Sur 12 mois." });
      if (unitWord !== "an" && unitWord !== "annee") {
        if (CALC_FLOW[k]) { ent.left = []; return done({ op: "pertime", ent: ent, unit: unitWord, when: when }); }
        if (CALC_STOCK[k]) return done({ op: "refuse", why: "« " + calcName(ent) + " » est " + CALC_STOCK[k] + " : le répartir par " + unitWord + " n'aurait pas de sens." });
      }
    }
    // Seuils : quand la dette a dépassé 3000 milliards
    if (/\b(quand|quelle annee|quelle date|a quel moment|depuis quand|en quelle annee)\b/.test(noMarks)) {
      m = /^(.*?)\b(depasse\w*|franchi\w*|atteint\w*|au dessus d\w*|superieur\w* a|plus de|sous|en dessous d\w*|inferieur\w* a|moins de|tombe\w*(?: sous| a)?)\s+(?:les |la |le |des |de |a )?(\d[\d ]*(?:virg\d+)?)\s*(milliards?|millions?|pourcents?|euros?)?/.exec(noMarks);
      if (m && (ent = one(m[1].replace(/\b(quand|quelle annee|quelle date|a quel moment|depuis|en quelle annee|que|est|a|ce|qu)\b/g, " ")))) {
        var below = /^(sous|en dessous|inferieur|moins|tombe)/.test(m[2]), raw0 = calcNumber(m[3].replace(/ /g, ""));
        var limit = m[4] && /milliard/.test(m[4]) ? { v: raw0 * 1e9 } : m[4] && /million/.test(m[4]) ? { v: raw0 * 1e6 } : m[4] && /euro/.test(m[4]) ? { v: raw0 } : { v: raw0, native: 1 };
        return done({ op: "threshold", ent: calcSwapFor(ent, m[4]), limit: limit, below: below, since: /\bdepuis quand\b/.test(noMarks) });
      }
    }
    // Records
    var lowWord = /\b(minimum|min|plus bas\w*|plus faible\w*|plus petit\w*|le moins de|la moins|moins eleve\w*|record bas)\b/.test(noMarks);
    var highWord = /\b(record|maximum|max|plus haut\w*|plus elev\w*|plus fort\w*|plus gros\w*|plus grand\w*|pic|sommet|le plus de|le plus)\b/.test(noMarks);
    if ((lowWord || highWord) && (/\b(record|maximum|minimum|max|min|pic|sommet)\b/.test(noMarks) || /\b(quand|annee|periode|moment|date|mois|trimestre|histoire)\b/.test(noMarks) || /\b(?:le|la|les|au|son|sa|ses) plus (?:haut|bas|elev|fort|faible|gros|grand|petit)|^\s*plus (?:haut|bas)\b/.test(noMarks))) {
      ent = one(noMarks.replace(/\b(record|maximum|minimum|max|min|pic|sommet|plus|moins|haut\w*|bas\w*|elev\w*|fort\w*|faible\w*|gros\w*|grand\w*|petit\w*|quand|quelle|annee|periode|moment|date|mois|trimestre|histoire|historique)\b/g, " "));
      if (ent) return done({ op: "extreme", ent: ent, low: lowWord, from: from, to: to });
    }
    // Moyennes
    if (/\b(moyenne|en moyenne|moyen)\b/.test(noMarks) && (ranged || /\ben moyenne\b/.test(noMarks))) {
      ent = one(noMarks.replace(/\b(en moyenne|moyenne|moyen|par an|chaque annee)\b/g, " "));
      if (ent) return done({ op: "average", ent: ent, from: from, to: to });
    }
    // Cumuls
    if (/\b(au total|en tout|cumul\w*|total|somme|additionne\w*)\b/.test(noMarks)) {
      ent = one(noMarks.replace(/\b(au total|en tout|cumul\w*|total|somme|additionne\w*)\b/g, " "));
      if (ent) return done({ op: "cumul", ent: ent, from: from, to: to });
    }
    return null;
  }
  // « sous 8 % » parle du taux de chômage ; « sous 3 millions » parle du nombre de chômeurs.
  function calcSwapFor(ent, unit) { return unit && !/pourcent/.test(unit) ? calcSwap(ent) : ent; }

  var FRACTIONS = [["trois quarts", 0.75, "× 3/4"], ["moitie", 0.5, "÷ 2"], ["quart", 0.25, "÷ 4"], ["tiers", 1 / 3, "÷ 3"], ["cinquieme", 0.2, "÷ 5"], ["dixieme", 0.1, "÷ 10"], ["centieme", 0.01, "÷ 100"], ["double", 2, "× 2"], ["triple", 3, "× 3"], ["quadruple", 4, "× 4"]];
  function parseCalc(raw) {
    var spokenPct = { cinq: 5, dix: 10, quinze: 15, vingt: 20, "vingt cinq": 25, trente: 30, quarante: 40, cinquante: 50, soixante: 60, "soixante dix": 70, "soixante quinze": 75, "quatre vingt": 80, "quatre vingt dix": 90, cent: 100 };
    var m, clean = raw.replace(/(\d)\s*[,.]\s*(\d)/g, "$1virg$2").replace(/\s*\/\s*/g, " sur ").replace(/%/g, " pourcent ").replace(/pour\s*cents?\b/gi, " pourcent ").replace(/€/g, " euros ");
    // « 2000 € » est un montant, pas l'année 2000.
    clean = clean.replace(/\b((?:19|20)\d)(\d)(\s*(?:euros?\b|milliards?\b|millions?\b))/gi, function (_, a, b, c) { return a.charAt(0) + " " + a.slice(1) + b + c; });
    clean = clean.replace(/\b(pass\w*|mont\w*|arriv\w*|tomb\w*|d[ée]pass\w*|plus de|moins de|sous|dessus de|dessous de)(\s+(?:à|a|au|de|les)?\s*)((?:19|20)\d)(\d)\b(?!\s*(?:et|à|a)\s)/gi, function (_, w, g, a, b) { return w + g + a.charAt(0) + " " + a.slice(1) + b; });
    var d = readDates(" " + spokenYears(plainText(clean)) + " "), body = d.text.replace(/\s+/g, " ");
    body = body.replace(/\b(quatre vingt dix|quatre vingt|soixante quinze|soixante dix|vingt cinq|cinq|dix|quinze|vingt|trente|quarante|cinquante|soixante|cent) pourcent/g, function (_, w) { return spokenPct[w] + " pourcent"; });
    var when = d.dates.length ? d.dates[0] : null;
    // Une année trop ancienne pour être reconnue ne doit pas passer pour « la dernière valeur ».
    var old = /\b(?:en|de|du|depuis) (1[0-8]\d\d)\b/.exec(body);
    if (old) { if (!when) when = { y: old[1] }; body = body.replace(old[0], " ").replace(/\s+/g, " "); }
    function done(o) {
      if (o.ent) o.ignored = o.ent.left || [];
      else if (o.a) o.ignored = (o.a.left || []).concat(o.b.left || []);
      o.ignored = (o.ignored || []).filter(function (w) { return ["calculer", "avoir", "obtenir", "represente", "representent", "fois", "grand", "grande", "gros", "grosse"].indexOf(w) < 0 && !/^\d/.test(w); });
      o.type = "calc";
      return o;
    }

    // Corrélation entre deux chiffres
    if (/\b(correlation|correlations|correle|correlee|correles|correlees|lien|liens|lie|liee|lies|liees|relation)\b/.test(body)) {
      var keys = matchAliases(body).keys, uniq = keys.filter(function (k, n) { return keys.indexOf(k) === n; });
      if (uniq.length >= 2) {
        var ca = entity(uniq[0]), cb = entity(uniq[1]);
        if (ca && cb) {
          var span = d.dates.filter(function (t) { return t.y; }), from = span[0] && span[0].y, to = span[0] && span[0].to ? span[0].to : span[1] ? span[1].y : null;
          ca.left = []; cb.left = [];
          return done({ op: "corr", a: qualify(ca, body), b: qualify(cb, body), from: from, to: to });
        }
      }
      if (/\b(correlation|correle|correlee|correles|correlees)\b/.test(body)) return { type: "calcno", why: "Dites-moi les deux chiffres, par exemple : « corrélation entre le chômage et l'inflation »." };
    }

    // Ce que chacun « doit », c'est la dette par habitant.
    if (/\b(?:combien\s+(?:doit|devons|dois|on doit)|doit chaque|part de dette)\b/.test(body) && !matchAliases(body).keys.filter(function (k) { return k !== "dette.0.0" && k !== "population.0.0"; }).length) body = " dette par habitant ";
    var special = calcSpecial(body, d, when, done);
    if (special) return special;

    // Un pourcentage ou une fraction d'un chiffre
    function scaled(factor, sign, rest) {
      var ent = calcResolve(rest, true) || calcLiteral(rest);
      if (!ent) return { type: "calcno", why: "Je n'ai pas trouvé ce chiffre sur le site. Essayez par exemple « 50 % du PIB »." };
      return done({ op: "scale", ent: ent.literal ? ent : calcSwap(ent), factor: factor, sign: sign, when: when });
    }
    m = new RegExp("(?:^|\\s)(\\d+(?:virg\\d+)?) pourcents? " + CALC_DE + " (.+)$").exec(body);
    if (m) { var pct = calcNumber(m[1]); return scaled(pct / 100, "× " + calcShort(pct) + " %", m[2]); }
    for (var f = 0; f < FRACTIONS.length; f++) {
      m = new RegExp("\\b" + FRACTIONS[f][0] + " " + CALC_DE + " (.+)$").exec(body);
      if (m) return scaled(FRACTIONS[f][1], FRACTIONS[f][2], m[1]);
    }
    m = /(?:^|\s)(\d+(?:virg\d+)?) fois (.+)$/.exec(body);
    if (m && !/combien/.test(body)) { var n1 = calcNumber(m[1]); return scaled(n1, "× " + calcShort(n1), m[2]); }
    m = /^(.+?) (?:multiplie|multipliee|multiplies|multipliees) par (\d+(?:virg\d+)?)\b/.exec(body);
    if (m) { var n2 = calcNumber(m[2]); return scaled(n2, "× " + calcShort(n2), m[1]); }
    m = /^(.+?) (?:divise|divisee|divises|divisees) par (\d+(?:virg\d+)?)\b/.exec(body);
    if (m) { var n3 = calcNumber(m[2]); if (n3) return scaled(1 / n3, "÷ " + calcShort(n3), m[1]); }

    // Une expression déjà connue garde sa réponse officielle : « PIB par habitant », « dette par rapport au PIB ».
    var whole = matchAliases(body);
    var known = whole.keys.length === 1 && whole.keys[0] !== "espibhab.0.0" && !calcLiteral(body.replace(/\b(?:par|sur) .*$/, " ")) && ALIAS_LIST.some(function (x) { return x[1] === whole.keys[0] && / par | sur | en pourcent/.test(" " + x[0] + " ") && (" " + body + " ").indexOf(" " + x[0] + " ") >= 0; });
    if (known) return { type: "value", ent: entity(whole.keys[0]), when: when, ignored: [] };

    function two(left, right, o) {
      var a = calcOperand(left), b = calcOperand(right);
      if (!a || !b) return null;
      // Deux taux se soustraient tels quels : « chômage moins inflation » donne un écart en points.
      var keep = o.op !== "ratio" && !a.literal && !b.literal && calcKind(a) === "rate" && calcKind(b) === "rate" && !CALC_QUARTERLY[a.item.key] && !CALC_QUARTERLY[b.item.key];
      o.a = keep || a.literal ? a : calcSwap(a); o.b = keep || b.literal ? b : calcSwap(b); o.when = when;
      return done(o);
    }
    var hit;
    // Oui ou non : la dette est-elle plus grande que le PIB ? Le chômage est-il plus haut qu'en 2010 ?
    var cmpWords = "(plus|moins) (?:grand\\w*|gros\\w*|elev\\w*|haut\\w*|fort\\w*|important\\w*|petit\\w*|bas\\w*|faible\\w*|cher\\w*)";
    m = new RegExp("^(.+?) " + cmpWords + " (?:que|qu) (.+)$").exec(body) || /^(.+?) (superieur\w*|inferieur\w*|depasse\w*) (?:a |au |aux |le |la |les |l )*(.+)$/.exec(body);
    if (m) {
      var lessWord = /^(moins|inferieur)/.test(m[2]) ? 1 : 0;
      // « moins grand » et « plus petit » disent la même chose.
      var smallWord = /\b(petit|bas|faible)/.test(m[0]);
      var less = smallWord ? !lessWord : !!lessWord;
      if (/^\s*(?:en\s+|au\s+)?zd\d+z\s*$/.test(m[3])) {
        var solo = calcResolve(m[1], true);
        if (solo && when) { solo.left = []; return done({ op: "vsdate", ent: solo, when: when, less: less }); }
      }
      if ((hit = two(m[1], m[3], { op: "versus", less: less }))) return hit;
    }
    // Combien de chômeurs pour 100 habitants
    m = /\bcombien (?:de |d )(.+?) (?:pour|par|sur) (\d[\d ]*) (?:habitants?|personnes?|francais|gens)\b/.exec(body);
    if (m) {
      var perWho = calcResolve(m[1]), perPop = entity("population.0.0");
      if (perWho) { perWho = calcSwap(perWho); perPop.left = []; return done({ op: "ratio", a: perWho, b: perPop, when: when, pop: 1, per: 1, base: calcNumber(m[2].replace(/ /g, "")) }); }
    }
    // Combien de baguettes avec un Smic ; combien de chômeurs pour un médecin ; 2000 € c'est combien de Smic nets
    m = /\bcombien (?:de |d )(.+?) (?:avec|pour|dans|en|contre) (.+)$/.exec(body);
    if (m) {
      var bought = calcOperand(m[1]);
      if (bought && calcKind(bought) === "count" && (hit = two(m[1], m[2], { op: "ratio", per: 1 }))) return hit;
      if ((hit = two(m[2], m[1], { op: "ratio", per: 1 }))) return hit;
    }
    // 3000 € par rapport au Smic net
    m = /^(.+?) par rapport (?:aux|au|a) (.+)$/.exec(body);
    if (m && (calcLiteral(m[1]) || calcLiteral(m[2])) && (hit = two(m[1], m[2], { op: "ratio", per: 1 }))) return hit;
    m = /^(.+?) (?:c est|ca fait|ca represente|represente|represent\w*|vaut|valent|font|fait) combien (?:de |d )(.+)$/.exec(body);
    if (m && (hit = two(m[1], m[2], { op: "ratio", per: 1 }))) return hit;
    m = /\brapport (?:entre|de|du|des|de la) (.+?) (?:et|avec|sur) (.+)$/.exec(body);
    if (m && (hit = two(m[1], m[2], { op: "ratio" }))) return hit;
    m = new RegExp("\\b(?:part|proportion|pourcentage) " + CALC_DE + " (.+?) (?:est|sont|etait|etaient) (.+)$").exec(body);
    if (m && (hit = two(m[2], m[1], { op: "ratio" }))) return hit;
    // Une part, un rapport
    m = new RegExp("\\b(?:part|proportion|pourcentage) " + CALC_DE + " (.+?) (?:dans|parmi|sur|par rapport aux|par rapport au|par rapport a) (.+)$").exec(body);
    if (m && (hit = two(m[1], m[2], { op: "ratio" }))) return hit;
    m = new RegExp("^(.+?) (?:en|c est quel|quel) (?:pourcentage|pourcent|pourcents|part) " + CALC_DE + " (.+)$").exec(body);
    if (m && (hit = two(m[1], m[2], { op: "ratio" }))) return hit;
    m = /^(.+?) (?:rapporte|rapportee|rapportes|rapportees) (?:aux|au|a) (.+)$/.exec(body) || /^(.+?) (?:divise|divisee|divises|divisees) par (.+)$/.exec(body) || /^(.+?) sur (.+)$/.exec(body);
    if (m && (hit = two(m[1], m[2], { op: "ratio" }))) return hit;
    if (/\bcombien de fois\b/.test(body) && whole.keys.length === 2) {
      // « Combien de fois le PIB dans la dette » : on divise la dette par le PIB.
      var inside = body.split(/\s(?:dans|entre dans)\s/), pair = body.split(/\s(?:que|par rapport a|par rapport au|et)\s/);
      if (inside.length === 2 && (hit = two(inside[1], inside[0], { op: "ratio", per: 1 }))) return hit;
      if (pair.length === 2 && (hit = two(pair[0], pair[1], { op: "ratio", per: 1 }))) return hit;
    }
    // Par habitant, par chômeur…
    m = /^(.+?) (?:par|pour chaque) (.+)$/.exec(body);
    if (m && !/^rapport\b/.test(m[2])) {
      var right = m[2].replace(/\s*zd\d+z\s*/g, " ").replace(/\s+(?:en|de|du|au|depuis)\s*$/, " ").trim(), popMatch = CALC_POP.test(right), left = calcOperand(m[1]);
      if (left && popMatch) {
        var pop = entity("population.0.0");
        pop.left = [];
        return done({ op: "ratio", a: left.literal ? left : calcSwap(left), b: pop, when: when, pop: 1, per: 1 });
      }
      if (left && (hit = two(m[1], m[2], { op: "ratio", per: 1 }))) return hit;
    }
    // Somme et différence
    m = /\b(?:somme|total|addition) (?:de la |de l |des |du |de |d )?(.+?) (?:et|avec|plus) (.+)$/.exec(body);
    if (m && (hit = two(m[1], m[2], { op: "add" }))) return hit;
    m = /\b(?:difference|ecart) (?:entre|de|du|des|de la) (.+?) (?:et|avec) (.+)$/.exec(body);
    if (m && (hit = two(m[1], m[2], { op: "sub" }))) return hit;
    m = /^(.+?) plus (.+)$/.exec(body);
    if (m && (hit = two(m[1], m[2], { op: "add" }))) return hit;
    m = /^(.+?) moins (.+)$/.exec(body);
    if (m && (hit = two(m[1], m[2], { op: "sub" }))) return hit;
    return null;
  }
  function runCalc(p) {
    if (p.op === "math") {
      if (p.zero) { card("<b>On ne peut pas diviser par zéro.</b>"); return true; }
      var a = Math.abs(p.v), shown = num(p.v, p.v === Math.round(p.v) ? 0 : a >= 100 ? 2 : 4).replace(/(,\d*?)0+$/, "$1").replace(/,$/, "");
      card("<b>" + nb(p.shown + " = " + shown) + "</b>");
      return true;
    }
    var OPS = { scale: calcScale, ratio: calcRatio, corr: calcCorr, extreme: calcExtreme, average: calcAverage, cumul: calcCumul, pertime: calcPerTime, pay: calcPayPeriod, threshold: calcThreshold, newvalue: calcNewValue, vsdate: calcVsDate, versus: calcVersus, timespop: calcTimesPop, add: calcAdd, sub: calcAdd };
    var out = p.op === "refuse" ? { html: calcRefuse(p.why) } : OPS[p.op](p);
    if (out.compare) go(out.compare);
    else if (out.open) openEnt(out.open, out.open.view);
    card(out.html + (out.ents ? calcSource(out.ents) : "") + ignoredNote(p));
    return true;
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
    var maths = parseMath(raw);
    if (maths) return maths;
    if (!askedEu) { var calc = parseCalc(raw); if (calc) return calc; }
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
    if (p.whyNote) bits.push("Je donne les chiffres, pas les causes : voici ce que je peux mesurer.");
    if (p.noEu) bits.push("Pas de comparaison européenne pour ce chiffre : voici la France.");
    if (p.ignored && p.ignored.length) bits.push("Je n'ai pas tenu compte de : " + p.ignored.join(", ") + ".");
    return bits.length ? '<span class="ask-note">' + esc(bits.join(" ")) + "</span>" : "";
  }
  function openEnt(ent, view) {
    if (ent.literal) return;
    if (ent.virtual) ent = entity("chomeurs.0.0");
    goToResult({ theme: ent.theme, item: ent.item });
    if (view && chart) { var b = chart.el.querySelector('[data-view="' + view + '"]'); if (b) b.click(); }
  }
  function pick(period) { if (chart && period) { try { pickPeriod(period); } catch (err) {} } }
  function run(p) {
    if (p.type === "empty") return false;
    if (p.type === "none") { panelMsg('<p class="ask-miss">Ce chiffre n\'est pas sur le site. Je préfère ne rien inventer. Essayez par exemple « chômage », « 50 % du PIB » ou « dette par habitant ».</p>'); return false; }
    if (p.type === "place") { panelMsg('<p class="ask-miss">Le site ne couvre que la France entière, et l\'Union européenne pour certains chiffres. Rien sur ' + esc(p.place) + ".</p>"); return false; }
    if (p.type === "choose") {
      panelMsg('<p class="ask-miss">Vous pensez à l\'un de ces chiffres ?</p><div class="ask-chips">' + p.keys.map(function (k) { var i = itemByKey(k); return '<button type="button" class="ask-chip" data-q="' + esc(i.n) + '">' + esc(i.n) + "</button>"; }).join("") + "</div>");
      return false;
    }
    if (p.type === "calcno") { panelMsg('<p class="ask-miss">' + esc(p.why) + "</p>"); return false; }
    closePanel();
    if (p.type === "calc") return runCalc(p);
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
      if (r.missing) { card("<b>Pas de chiffre pour " + esc(p.when.p ? periodLabel(p.when.p) : p.when.y) + ".</b><span class=\"ask-note\">" + nb(nameOf(ent)) + " : premier chiffre " + nb(periodLabel(r.first)) + ", dernier " + nb(periodLabel(r.last)) + "." + (p.when.y > r.last.slice(0, 4) ? " Le site publie des chiffres mesurés, pas des prévisions." : "") + "</span>" + sourceLine(ent)); return true; }
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
      var span = periodTime(b[0]) - periodTime(a[0]), yearly = !rate && a[1] > 0 && b[1] > 0 && span >= 2 ? '<span class="ask-note">' + nb("Soit " + signed((Math.pow(b[1] / a[1], 1 / span) - 1) * 100, 1) + " % par an en moyenne.") + "</span>" : "";
      card("<b>" + nb(nameOf(en)) + " : " + nb(change) + "</b><span>" + nb(fmt(en, a[1])) + " (" + nb(periodLabel(a[0])) + ") → " + nb(fmt(en, b[1])) + " (" + nb(periodLabel(b[0])) + ")</span>" + yearly + sourceLine(en) + ignoredNote(p));
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
    if (/^\s*pourquoi\b/i.test(text)) p.whyNote = 1;
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
