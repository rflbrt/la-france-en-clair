// Décrit une page statique par chiffre, à partir des données et des calculs du site. Rien n'est écrit à la main.
var SITE = "https://statpublique.netlify.app";
function slug(s) { return plainText(s).replace(/ /g, "-"); }
function baseName(i) { return i.n.replace(", comparaison européenne", "").replace(", série longue", ""); }
function isEu(i) { return /comparaison européenne/.test(i.n); }
// « 8,3 % de la population active » : un complément en minuscule suit le chiffre, une phrase reste à part.
function summary(i, value, when, sub) {
  var tail = when ? " (" + when.charAt(0).toLowerCase() + when.slice(1) + ")" : "", first = sub.charAt(0);
  if (first && first === first.toLowerCase() && first !== first.toUpperCase()) return baseName(i) + " : " + value + " " + sub.replace(/\.$/, "") + tail + ".";
  return baseName(i) + " : " + value + tail + "." + (sub ? " " + sub : "");
}
function pageTitle(i) { return isEu(i) ? baseName(i) + " : France et Union européenne" : baseName(i) + " en France"; }
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
  var near = all.filter(function (x) { return x !== p && (group ? groupOf(x.theme, x.i.key) === group : x.theme === p.theme); }).slice(0, 6);
  if (near.length) body += "<h2>Chiffres liés</h2><ul>" + near.map(function (x) { return "<li>" + link(x) + "</li>"; }).join("") + "</ul>";
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
  return { path: "chiffres/" + p.slug + "/index.html", url: "/chiffres/" + p.slug + "/", title: (isEu(i) ? p.title : p.title + " : " + value).replace(/[  ]/g, " ") + " | StatPublique", desc: desc, body: body, ld: ld };
});
function theme_id(t) { return "theme-" + t; }
var cat = '<nav class="crumbs" aria-label="Fil d\'Ariane"><a href="/">Accueil</a> › Tous les chiffres</nav><h1>Tous les chiffres sur la France</h1><p class="lede">Les statistiques publiques présentées sur StatPublique : la dernière valeur de chaque chiffre, avec sa source et son historique.</p>';
Object.keys(THEMES).forEach(function (t) {
  var list = all.filter(function (p) { return p.theme === t; });
  if (!list.length) return;
  cat += '<h2 id="' + theme_id(t) + '">' + esc(THEMES[t].title) + "</h2><ul>" + list.map(function (p) { return "<li>" + link(p) + " : " + nb(figure(p.i)) + (headline(p.i).w ? " <span class=\"note\">(" + nb(headline(p.i).w) + ")</span>" : "") + "</li>"; }).join("") + "</ul>";
});
pages.push({ path: "chiffres/index.html", url: "/chiffres/", title: "Tous les chiffres sur la France : dette, emploi, prix, population | StatPublique", desc: "Dette, chômage, inflation, population, retraites, immigration : tous les chiffres publics sur la France, avec leur dernière valeur, leur source et leur historique.", body: cat, ld: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Tous les chiffres sur la France", url: SITE + "/chiffres/", inLanguage: "fr" }] });
print(JSON.stringify(pages));
