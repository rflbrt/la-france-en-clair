// Décrit une page statique par chiffre, à partir des données et des calculs du site. Rien n'est écrit à la main.
var SITE = "https://statpublique.netlify.app";
// Formulations recherchées et définitions, reprises des fiches de l'Insee (lien affiché sur chaque page).
var D_CHOMEUR = "Un chômeur au sens du BIT est une personne de 15 ans ou plus qui, à la fois, est sans emploi durant une semaine donnée, est disponible pour prendre un emploi dans les deux semaines, et a cherché activement un emploi au cours des quatre dernières semaines ou en a trouvé un qui commence dans moins de trois mois.";
var U_CHOMEUR = "https://www.insee.fr/fr/metadonnees/definition/c1129";
var SEO = {
  chomage: { t: "Taux de chômage en France", q: "Qu'est-ce que le taux de chômage ?", d: "Le taux de chômage rapporte le nombre de chômeurs à la population active, c'est-à-dire aux personnes en emploi ou au chômage. " + D_CHOMEUR, u: U_CHOMEUR },
  chomeurs: { t: "Nombre de chômeurs en France", q: "Qui est compté comme chômeur ?", d: D_CHOMEUR, u: U_CHOMEUR },
  dette: { t: "Dette publique de la France", q: "Qu'est-ce que la dette publique ?", d: "La dette publique au sens de Maastricht est la dette brute de l'ensemble des administrations publiques, sans compter ce qu'elles se doivent entre elles. Les critères de Maastricht retiennent une référence de 60 % du PIB.", u: "https://www.insee.fr/fr/metadonnees/definition/c1091" },
  deficit: { t: "Déficit public de la France", q: "Qu'est-ce que le déficit public ?", d: "Le déficit public au sens de Maastricht correspond au besoin de financement des administrations publiques : ce qu'elles dépensent au-delà de leurs recettes sur une année. Les critères de Maastricht retiennent une référence de 3 % du PIB.", u: "https://www.insee.fr/fr/statistiques/3303528?sommaire=3353488" },
  pib: { t: "PIB de la France", q: "Qu'est-ce que le PIB ?", d: "Le produit intérieur brut (PIB) vise à mesurer la richesse créée par tous les agents, privés et publics, sur le territoire national pendant une période donnée.", u: "https://www.insee.fr/fr/metadonnees/definition/c1365" },
  croissance: { t: "Croissance économique en France", q: "Qu'est-ce que la croissance économique ?", d: "La croissance économique est l'évolution du PIB en volume, c'est-à-dire hors effet des prix.", u: "https://www.insee.fr/fr/metadonnees/definition/c1365" },
  inflation: { t: "Inflation en France", q: "Qu'est-ce que l'inflation ?", d: "L'inflation est une hausse générale et durable des prix, qui fait perdre du pouvoir d'achat à la monnaie. L'indice des prix à la consommation en donne une mesure partielle, car il ne couvre que la consommation des ménages. Ce n'est pas un indice du coût de la vie.", u: "https://www.insee.fr/fr/metadonnees/definition/c1473" },
  immigres: { t: "Nombre d'immigrés en France", q: "Qui est considéré comme immigré ?", d: "Un immigré est une personne née étrangère à l'étranger et résidant en France. Cette qualité est permanente, même après l'acquisition de la nationalité française. Population immigrée et population étrangère ne se recouvrent donc que partiellement.", u: "https://www.insee.fr/fr/metadonnees/definition/c1328" },
  pauvrete: { t: "Taux de pauvreté en France", q: "Qu'est-ce que le taux de pauvreté ?", d: "Une personne est considérée comme pauvre lorsque le niveau de vie de son ménage est inférieur au seuil de pauvreté, fixé par convention à 60 % du niveau de vie médian de la population.", u: "https://www.insee.fr/fr/metadonnees/definition/c1653" },
  fecondite: { t: "Taux de fécondité en France", q: "Que mesure la fécondité ?", d: "L'indicateur conjoncturel de fécondité est la somme des taux de fécondité par âge observés une année donnée. Il s'exprime en nombre d'enfants par femme et ne décrit pas le comportement d'une génération réelle.", u: "https://www.insee.fr/fr/metadonnees/definition/c1963" },
  population: { t: "Population de la France" },
  naissances: { t: "Nombre de naissances en France" },
  deces: { t: "Nombre de décès en France" },
  etrangers: { t: "Nombre d'étrangers en France" },
  emploi: { t: "Nombre de salariés du privé en France" }
};
function slug(s) { return plainText(s).replace(/ /g, "-"); }
function baseName(i) { return i.n.replace(", comparaison européenne", "").replace(", série longue", ""); }
function isEu(i) { return /comparaison européenne/.test(i.n); }
// « 8,3 % de la population active » : un complément en minuscule suit le chiffre, une phrase reste à part.
function summary(i, value, when, sub) {
  var tail = when ? " (" + when.charAt(0).toLowerCase() + when.slice(1) + ")" : "", first = sub.charAt(0);
  if (first && first === first.toLowerCase() && first !== first.toUpperCase()) return baseName(i) + " : " + value + " " + sub.replace(/\.$/, "") + tail + ".";
  return baseName(i) + " : " + value + tail + "." + (sub ? " " + sub : "");
}
function pageTitle(i) { if (SEO[i.key]) return SEO[i.key].t; return isEu(i) ? baseName(i) + " : France et Union européenne" : baseName(i) + " en France"; }
function figure(i) { var h = headline(i); return h.f + (h.u && h.f.indexOf(h.u) < 0 ? " " + h.u : ""); }
function lineOf(i) { return i.views && i.views[0] && (i.head || i.views[0].lines[0]); }
function groupOf(theme, key) {
  var found = null;
  (THEMES[theme].groups || []).forEach(function (g) { if (g.keys.some(function (k) { return k.split("|")[0] === key; })) found = g; });
  return found;
}
function atDistance(d, years) {
  var last = d[d.length - 1], aim = periodTime(last[0]) - years, best = null;
  var gap = 0.3;
  d.forEach(function (p) { var g = Math.abs(periodTime(p[0]) - aim); if (g < gap) { gap = g; best = p; } });
  return best;
}
function evolution(i, view, d) {
  if (!d || d.length < 2) return [];
  var last = d[d.length - 1], out = [];
  [[1, "En un an"], [5, "En cinq ans"], [10, "En dix ans"]].forEach(function (x) {
    var p = atDistance(d, x[0]);
    if (!p) return;
    var points = view.unit === "%" || view.unit.indexOf("%") === 0 || i.signed, diff = last[1] - p[1];
    if (points) out.push([x[1], signed(diff, view.dec) + (view.unit.indexOf("%") === 0 ? " point" + (Math.abs(diff) >= 2 ? "s" : "") : ""), periodLabel(p[0])]);
    else if (p[1] > 0 && last[1] > 0) out.push([x[1], signed((last[1] / p[1] - 1) * 100, 1) + " %", periodLabel(p[0])]);
  });
  return out;
}
function history12(d) {
  var byYear = {}, years;
  d.forEach(function (p) { byYear[p[0].slice(0, 4)] = p; });
  years = Object.keys(byYear).sort().reverse().slice(0, 12);
  return years.map(function (y) { return byYear[y]; });
}
var all = [];
Object.keys(THEMES).forEach(function (theme) {
  THEMES[theme].items.forEach(function (i) {
    if (i.tool) return;
    var h = headline(i);
    if (!h.f || h.f === "–") return;
    all.push({ i: i, theme: theme, slug: slug(i.n), title: pageTitle(i) });
  });
});
var bySlug = {};
all.forEach(function (p) { if (bySlug[p.slug]) throw new Error("Deux pages pour " + p.slug); bySlug[p.slug] = p; });
var byKey = {};
all.forEach(function (p) { byKey[p.i.key] = p; });
function url(p) { return SITE + "/chiffres/" + p.slug + "/"; }
function link(p) { return '<a href="/chiffres/' + p.slug + '/">' + esc(p.title) + "</a>"; }

var pages = all.map(function (p) {
  var i = p.i, h = headline(i), group = groupOf(p.theme, i.key), when = h.w || "", value = figure(i), src = i.o || "Insee", srcUrl = sourceUrl(i);
  var view = i.views && i.views[0], line = lineOf(i), data = line ? lineData(line) : null, body = "";
  var sub = String(typeof i.s === "function" ? i.s(lastOf) : i.s || "").trim();
  body += '<nav class="crumbs" aria-label="Fil d\'Ariane"><a href="/">Accueil</a> › <a href="/chiffres/">Tous les chiffres</a> › <a href="/chiffres/#' + theme_id(p.theme) + '">' + esc(THEMES[p.theme].title) + "</a></nav>";
  body += "<h1>" + esc(p.title) + "</h1>";
  body += '<div class="chiffre"><strong>' + nb(value) + "</strong><span>" + nb(when) + "</span></div>";
  body += '<p class="lede">' + nb(summary(i, value, when, sub)) + "</p>";
  var seo = SEO[i.key];
  if (seo && seo.d) body += "<h2>" + esc(seo.q) + "</h2><p>" + nb(seo.d) + ' <a href="' + esc(seo.u) + '" rel="noopener">Définition de l\'Insee</a>.</p>';
  if (group && group.note) body += "<h2>À savoir</h2><p>" + esc(group.note) + "</p>";
  var ev = view && data ? evolution(i, view, data) : [];
  if (ev.length) {
    body += "<h2>Évolution</h2><ul>" + ev.map(function (x) { return "<li>" + esc(x[0]) + " : <b>" + nb(x[1]) + "</b> (depuis " + nb(x[2].charAt(0).toLowerCase() + x[2].slice(1)) + ")</li>"; }).join("") + "</ul><p class=\"note\">Calcul de StatPublique à partir des chiffres de la source.</p>";
  }
  if (view && data && data.length) {
    var rows = history12(data);
    body += "<h2>Derniers chiffres</h2><div class=\"table\"><table><thead><tr><th scope=\"col\">Période</th><th scope=\"col\">" + esc(line.name || baseName(i)) + "</th></tr></thead><tbody>" + rows.map(function (r) { return "<tr><td>" + nb(periodLabel(r[0])) + "</td><td>" + nb(withUnit(r[1], view.unit, view.dec)) + "</td></tr>"; }).join("") + "</tbody></table></div><p class=\"note\">Dernière valeur connue de chaque année.</p>";
  }
  var detail = [];
  (i.views || []).forEach(function (v) {
    v.lines.forEach(function (l) {
      if (l === line) return;
      var d = lineData(l);
      if (d.length) detail.push("<tr><td>" + esc((i.views.length > 1 ? v.label + " : " : "") + l.name) + "</td><td>" + nb(withUnit(d[d.length - 1][1], v.unit, v.dec)) + "</td><td>" + nb(periodLabel(d[d.length - 1][0])) + "</td></tr>");
    });
  });
  if (detail.length) body += "<h2>Dans le détail</h2><div class=\"table\"><table><thead><tr><th scope=\"col\">Chiffre</th><th scope=\"col\">Valeur</th><th scope=\"col\">Période</th></tr></thead><tbody>" + detail.join("") + "</tbody></table></div>";
  if (i.staticRows) body += "<h2>Dans le détail</h2><div class=\"table\"><table><tbody>" + i.staticRows.map(function (r) { return "<tr><td>" + esc(r[0]) + "</td><td>" + nb(r[2]) + "</td></tr>"; }).join("") + "</tbody></table></div>";
  body += "<h2>Source</h2><p>" + esc(src) + " : <a href=\"" + esc(srcUrl) + "\" rel=\"noopener\">voir les données d'origine</a>. Chiffres publics repris tels quels, sauf les calculs signalés.</p>";
  body += '<p><a class="cta" href="/#' + p.theme + '">Voir le graphique et comparer ce chiffre</a></p>';
  var extra = { dette: ["dette-par-habitant", "Dette publique par habitant en France"], population: ["dette-par-habitant", "Dette publique par habitant en France"], pib: ["pib-par-habitant", "PIB par habitant en France"], chomage: ["population-active", "Population active en France"], chomeurs: ["population-active", "Population active en France"] }[i.key];
  var near = all.filter(function (x) { return x !== p && (group ? groupOf(x.theme, x.i.key) === group : x.theme === p.theme); }).slice(0, 6);
  if (near.length || extra) body += "<h2>Chiffres liés</h2><ul>" + (extra ? '<li><a href="/chiffres/' + extra[0] + '/">' + esc(extra[1]) + "</a></li>" : "") + near.map(function (x) { return "<li>" + link(x) + "</li>"; }).join("") + "</ul>";
  var desc = summary(i, value, when, sub) + " Source : " + src + (data && data.length > 1 ? ". Évolution et historique sur StatPublique." : ". Détails sur StatPublique.");
  desc = desc.replace(/\s+/g, " ").replace(/[  ]/g, " ");
  var ld = [{
    "@context": "https://schema.org", "@type": "Dataset", name: p.title, description: desc, url: url(p), inLanguage: "fr",
    spatialCoverage: { "@type": "Place", name: "France" },
    creator: { "@type": "Organization", name: src }, isBasedOn: srcUrl,
    temporalCoverage: data && data.length ? data[0][0].slice(0, 4) + "/" + data[data.length - 1][0].slice(0, 4) : undefined
  }, {
    "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE + "/" },
      { "@type": "ListItem", position: 2, name: "Tous les chiffres", item: SITE + "/chiffres/" },
      { "@type": "ListItem", position: 3, name: p.title, item: url(p) }
    ]
  }];
  return { path: "chiffres/" + p.slug + "/index.html", url: "/chiffres/" + p.slug + "/", title: (isEu(i) ? p.title : p.title + " : " + value + (when && data ? " (" + when.charAt(0).toLowerCase() + when.slice(1) + ")" : "")).replace(/[  ]/g, " ") + " | StatPublique", desc: desc, body: body, ld: ld };
});
function theme_id(t) { return "theme-" + t; }
// Chiffres très recherchés que le site calcule à partir de deux séries.
function seriesOf(key) { var i = itemByKey(key.split(".")[0]), v = i.views[+key.split(".")[1]]; return lineData(v.lines[+key.split(".")[2]]); }
function lastPerYear(d) { var o = {}; d.forEach(function (p) { o[p[0].slice(0, 4)] = p; }); return o; }
function computed(c) {
  var rows = c.rows(), last = rows[rows.length - 1], first = rows[0];
  var value = c.fmt(last[1]), when = periodLabel(last[0]), lower = when.charAt(0).toLowerCase() + when.slice(1);
  var body = '<nav class="crumbs" aria-label="Fil d\'Ariane"><a href="/">Accueil</a> › <a href="/chiffres/">Tous les chiffres</a> › <a href="/chiffres/#theme-calcules">Chiffres calculés</a></nav><h1>' + esc(c.t) + "</h1>";
  body += '<div class="chiffre"><strong>' + nb(value) + "</strong><span>" + nb(when) + "</span></div>";
  body += '<p class="lede">' + nb(c.t + " : " + value + " (" + lower + "). " + c.how) + "</p>";
  body += "<h2>" + esc(c.q) + "</h2><p>" + nb(c.d) + "</p>";
  var hist = rows.slice(-12).reverse();
  body += "<h2>Derniers chiffres</h2><div class=\"table\"><table><thead><tr><th scope=\"col\">Période</th><th scope=\"col\">" + esc(c.col) + "</th></tr></thead><tbody>" + hist.map(function (r) { return "<tr><td>" + nb(periodLabel(r[0])) + "</td><td>" + nb(c.fmt(r[1])) + "</td></tr>"; }).join("") + "</tbody></table></div>";
  var inv = rows.filter(function (r) { return +r[0].slice(0, 4) === +last[0].slice(0, 4) - 10; })[0];
  if (inv && inv[1] > 0) body += "<h2>Évolution</h2><p>Depuis " + nb(periodLabel(inv[0]).toLowerCase()) + " : <b>" + nb(signed((last[1] / inv[1] - 1) * 100, 1) + " %") + "</b>" + (c.fmt === euro ? ", sans correction de l'inflation" : "") + ".</p>";
  body += "<h2>Source</h2><p>Calcul de StatPublique à partir des chiffres publiés par l'Insee : " + c.links.map(function (k) { return link(byKey[k]); }).join(", ") + ".</p>";
  var desc = (c.t + " : " + value + " (" + lower + "). " + c.how + " Source : Insee. Historique sur StatPublique.").replace(/[\u00a0\u202f]/g, " ");
  var url0 = SITE + "/chiffres/" + c.slug + "/";
  return { path: "chiffres/" + c.slug + "/index.html", url: "/chiffres/" + c.slug + "/", name: c.t, value: value, when: when, title: (c.t + " : " + value + " (" + lower + ")").replace(/[\u00a0\u202f]/g, " ") + " | StatPublique", desc: desc, body: body, ld: [
    { "@context": "https://schema.org", "@type": "Dataset", name: c.t, description: desc, url: url0, inLanguage: "fr", spatialCoverage: { "@type": "Place", name: "France" }, creator: { "@type": "Organization", name: "StatPublique" }, temporalCoverage: first[0].slice(0, 4) + "/" + last[0].slice(0, 4) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Accueil", item: SITE + "/" }, { "@type": "ListItem", position: 2, name: "Tous les chiffres", item: SITE + "/chiffres/" }, { "@type": "ListItem", position: 3, name: c.t, item: url0 }] }
  ] };
}
function perHead(key, popYear) {
  var a = seriesOf(key), pop = lastPerYear(seriesOf("population.0.0"));
  return a.filter(function (p) { return pop[p[0].slice(0, 4)]; }).map(function (p) { return [p[0], p[1] * 1e9 / (pop[p[0].slice(0, 4)][1] * 1e6)]; });
}
var euro = function (v) { return num(v, 0) + " €"; };
var COMPUTED = [
  { slug: "dette-par-habitant", t: "Dette publique par habitant en France", col: "Dette par habitant", fmt: euro, how: "Dette publique divisée par le nombre d'habitants.", q: "Comment se calcule la dette par habitant ?", d: "On divise la dette publique au sens de Maastricht par la population de la même année. Ce chiffre donne un ordre de grandeur : ce n'est pas une somme que chaque habitant devrait rembourser.", links: ["dette", "population"], rows: function () { return perHead("dette.0.0").filter(function (p) { return /Q4$/.test(p[0]) || p === perHead("dette.0.0").slice(-1)[0] || p[0] === seriesOf("dette.0.0").slice(-1)[0][0]; }); } },
  { slug: "pib-par-habitant", t: "PIB par habitant en France", col: "PIB par habitant", fmt: euro, how: "PIB annuel divisé par le nombre d'habitants.", q: "Comment se calcule le PIB par habitant ?", d: "On divise le PIB de l'année par la population de la même année. Le résultat est en euros courants : il ne tient pas compte de la hausse des prix et ne dit rien de la répartition des revenus.", links: ["pib", "population"], rows: function () { return perHead("pib.0.0"); } },
  { slug: "population-active", t: "Population active en France", col: "Population active", fmt: function (v) { return num(v, 2) + " millions"; }, how: "Nombre de chômeurs divisé par le taux de chômage.", q: "Qu'est-ce que la population active ?", d: "La population active regroupe les personnes en emploi et les chômeurs. Ce chiffre est une estimation de StatPublique, obtenue à partir du nombre de chômeurs et du taux de chômage, tous deux publiés par l'Insee.", links: ["chomeurs", "chomage"], rows: function () { var rate = {}; seriesOf("chomage.0.0").forEach(function (p) { rate[p[0]] = p[1]; }); var d = seriesOf("chomeurs.0.0").filter(function (p) { return rate[p[0]]; }).map(function (p) { return [p[0], p[1] / rate[p[0]] * 100]; }); return d.filter(function (p, n) { return /Q4$/.test(p[0]) || n === d.length - 1; }); } }
].map(computed);
pages = pages.concat(COMPUTED);
var cat = '<nav class="crumbs" aria-label="Fil d\'Ariane"><a href="/">Accueil</a> › Tous les chiffres</nav><h1>Tous les chiffres sur la France</h1><p class="lede">Les statistiques publiques présentées sur StatPublique : la dernière valeur de chaque chiffre, avec sa source et son historique.</p>';
Object.keys(THEMES).forEach(function (t) {
  var list = all.filter(function (p) { return p.theme === t; });
  if (!list.length) return;
  cat += '<h2 id="' + theme_id(t) + '">' + esc(THEMES[t].title) + "</h2><ul>" + list.map(function (p) { return "<li>" + link(p) + " : " + nb(figure(p.i)) + (headline(p.i).w ? " <span class=\"note\">(" + nb(headline(p.i).w) + ")</span>" : "") + "</li>"; }).join("") + "</ul>";
});
cat += '<h2 id="theme-calcules">Chiffres calculés</h2><ul>' + COMPUTED.map(function (c) { return '<li><a href="' + c.url + '">' + esc(c.name) + "</a> : " + nb(c.value) + ' <span class="note">(' + nb(c.when) + ")</span></li>"; }).join("") + "</ul>";
pages.push({ path: "chiffres/index.html", url: "/chiffres/", title: "Tous les chiffres sur la France : dette, emploi, prix, population | StatPublique", desc: "Dette, chômage, inflation, population, retraites, immigration : tous les chiffres publics sur la France, avec leur dernière valeur, leur source et leur historique.", body: cat, ld: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Tous les chiffres sur la France", url: SITE + "/chiffres/", inLanguage: "fr" }] });
print(JSON.stringify(pages));
