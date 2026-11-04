var INSEE = "https://www.insee.fr/fr/statistiques/";
var API = "https://api.insee.fr/series/BDM/data/SERIES_BDM/";
var extractedOn = SAVED_ON; // SAVED_ON est dans data.js, écrit par scripts/maj_donnees.py

// Une ligne de graphique : soit une série de l'API (id), soit un historique publié sur une page Insee (pts).
// x : multiplicateur, tf : calcul (sum4 = somme sur 4 périodes, qoq = évolution sur une période, yoy4 = évolution sur 4 périodes, share = part dans la série of).
function L(id, name, o) { var l = { id: id, name: name }; for (var k in o) l[k] = o[k]; return l; }
function P(key, name, o) { var l = { pts: HIST[key], name: name }; for (var k in o) l[k] = o[k]; return l; }
function V(label, lines, unit, dec) { return { label: label, lines: lines, unit: unit, dec: dec }; }

// Champs d'une tuile : n nom, u unité, dec décimales, s phrase (texte ou fonction), d variation affichée, url page Insee, o origine,
// c largeur, h haute, dark foncée, spark petite courbe, views graphiques, rows barres comparées (lignes de views), f et w valeur et période fixes (sans série)
var PCT = "%";
var THEMES = {
  finances: {
    title: "Finances publiques",
    items: [
      { key: "dette", n: "Dette publique", u: "Md €", dec: 1, url: "2830301", c: "w6", h: 1, dark: 1, spark: 1,
        s: function (g) { return "Soit " + num(g("010777608"), 1) + " % du PIB et environ " + num(Math.round(g("010777616") * 1e9 / g("001641586") / 1000) * 1000, 0) + " € par habitant (calcul de ce site)."; },
        views: [V("En milliards d'euros", [L("010777616", "Dette publique")], "Md €", 1), V("En % du PIB", [L("010777608", "Dette publique")], "%", 1)] },
      { key: "taux", n: "Taux d'emprunt à 10 ans", u: PCT, dec: 2, o: "Eurostat", href: "https://ec.europa.eu/eurostat/databrowser/view/irt_lt_mcby_a/default/table?lang=fr", ds: "irt_lt_mcby_a", wp: "Moyenne ", c: "w6", h: 1, spark: 1, s: "Rendement moyen des emprunts d'État à long terme sur l'année.", views: [V("France et UE", [L("ES_taux_FR", "France"), L("ES_taux_EU", "UE à 27")], "%", 2)] },
      { key: "deficit", n: "Déficit public", f: "5,1 %", w: "2025", url: "8997691", s: "du PIB, soit 152,5 Md €.", views: [V("En % du PIB", [P("deficit", "Déficit public")], "%", 1)] },
      { key: "depenses", n: "Dépenses publiques", f: "57,3 %", w: "2025", url: "8997691", s: "du PIB, soit 1 714,2 Md €.", views: [V("En % du PIB", [P("depenses", "Dépenses publiques")], "%", 1)] },
      { key: "recettes", n: "Recettes publiques", f: "52,2 %", w: "2025", url: "8997691", s: "du PIB, soit 1 561,7 Md €.", views: [V("En % du PIB", [P("recettes", "Recettes publiques")], "%", 1)] },
      { key: "po", n: "Prélèvements obligatoires", f: "43,6 %", w: "2025", url: "8997691", s: "du PIB : impôts et cotisations.", views: [V("En % du PIB", [P("po", "Prélèvements obligatoires")], "%", 1)] },
      { key: "interets", n: "Charge d'intérêts", u: "Md €", dec: 1, url: "2830301", s: "Ce que coûte la dette, sur les 4 derniers trimestres (calcul de ce site).",
        views: [V("Sur 4 trimestres", [L("011794584", "Charge d'intérêts", { tf: "sum4", x: 1e-3 })], "Md €", 1)] }
    ]
  },
  activite: {
    title: "Activité",
    items: [
      { key: "pib", n: "PIB", u: "Md €", dec: 1, url: "2830547", c: "w6", h: 1, dark: 1, spark: 1, s: "La richesse produite en un an.",
        views: [V("En milliards d'euros", [L("011779992", "PIB", { x: 1e-3 })], "Md €", 1), V("Évolution en volume", [L("011779995", "Évolution du PIB")], "%", 1)] },
      { key: "croissance", n: "Croissance", u: PCT, dec: 1, signed: 1, url: "2830547", s: "Évolution du PIB sur un trimestre.", views: [V("Sur un trimestre", [L("011794844", "Croissance")], "%", 1)] },
      { key: "climat", n: "Climat des affaires", dec: 1, url: "2107840", s: "Sa moyenne de long terme est de 100.", d: { n: 1, kind: "pt", word: "en un mois" }, views: [V("Tous secteurs", [L("001565530", "Climat des affaires")], "", 1)] },
      { key: "emploi", n: "Emploi salarié privé", u: "M", dec: 1, url: "2107840", s: "salariés dans le secteur privé.", d: { n: 4, kind: "pct", word: "en un an" }, views: [V("En millions", [L("001796854", "Emploi salarié privé", { x: 1e-3 })], "M", 2)] },
      { key: "creations", n: "Créations d'entreprises", dec: 0, url: "9078876", s: "en un mois.", d: { n: 12, kind: "pct", word: "en un an" }, views: [V("Par mois", [L("010755538", "Créations d'entreprises")], "", 0)] },
      { key: "defaillances", n: "Défaillances d'entreprises", dec: 0, url: "2109644", s: "sur douze mois.", d: { n: 12, kind: "pct", word: "en un an" }, views: [V("Sur douze mois", [L("001656101", "Défaillances")], "", 0)] },
      { key: "conso", n: "Consommation des ménages", u: PCT, dec: 1, signed: 1, url: "2830547", s: "en volume, sur un trimestre (calcul de ce site).", views: [V("Sur un trimestre", [L("011794864", "Consommation", { tf: "qoq" })], "%", 1), V("En milliards d'euros", [L("011794864", "Consommation", { x: 1e-3 })], "Md €", 1)] },
      { key: "fbcf", n: "Investissement", u: PCT, dec: 1, signed: 1, url: "2830547", s: "en volume, sur un trimestre (calcul de ce site).", views: [V("Sur un trimestre", [L("011794884", "Investissement", { tf: "qoq" })], "%", 1), V("En milliards d'euros", [L("011794884", "Investissement", { x: 1e-3 })], "Md €", 1)] }
    ]
  },
  menages: {
    title: "Vie des ménages",
    items: [
      { key: "inflation", n: "Inflation", u: PCT, dec: 1, url: "2107840", c: "w6", h: 1, dark: 1, spark: 1, s: "Évolution des prix sur un an. Le dernier mois est une estimation provisoire.", d: { n: 1, kind: "pt", word: "en un mois" },
        views: [V("Sur un an", [L("011814632", "Inflation")], "%", 1)] },
      { key: "chomage", n: "Chômage", u: PCT, dec: 1, url: "2107840", c: "w6", h: 1, rows: 1, rowsView: 1, s: "de la population active.",
        views: [V("Ensemble", [L("001688527", "Chômage")], "%", 1), V("Par âge", [L("001688537", "15-24 ans"), L("001688529", "25-49 ans"), L("001688531", "50 ans ou plus")], "%", 1), V("Par sexe", [L("001688535", "Hommes"), L("001688533", "Femmes")], "%", 1)] },
      { key: "chomeurs", n: "Nombre de chômeurs", u: "M", dec: 1, url: "2107840", s: "au sens du BIT.", d: { n: 1, kind: "k", word: "en un trimestre" }, views: [V("En millions", [L("011818555", "Chômeurs", { x: 1e-3 })], "M", 2)] },
      { key: "tauxemploi", n: "Taux d'emploi", u: PCT, dec: 1, url: "2107840", s: "des 15-64 ans.", d: { n: 4, kind: "pt", word: "en un an" }, views: [V("15-64 ans", [L("011818676", "Taux d'emploi")], "%", 1)] },
      { key: "achat", n: "Pouvoir d'achat", u: PCT, dec: 1, signed: 1, url: "2830547", s: "de l'ensemble des ménages, sur un trimestre (calcul de ce site).", views: [V("Sur un trimestre", [L("011818868", "Pouvoir d'achat", { tf: "qoq" })], "%", 1)] },
      { key: "epargne", n: "Épargne des ménages", u: PCT, dec: 1, url: "2830547", s: "du revenu disponible (calcul de ce site).", views: [V("Part du revenu", [L("011794755", "Épargne", { tf: "share", of: "011794746" })], "%", 1)] },
      { key: "confiance", n: "Confiance des ménages", dec: 0, url: "2107840", s: "Sa moyenne de long terme est de 100.", d: { n: 1, kind: "pt", word: "en un mois" }, views: [V("Indicateur", [L("001587668", "Confiance")], "", 0)] },
      { key: "logement", n: "Prix des logements anciens", u: PCT, dec: 1, signed: 1, url: "2830547", s: "sur un an (calcul de ce site).", views: [V("Sur un an", [L("010567118", "Prix", { tf: "yoy4" })], "%", 1), V("Indice", [L("010567118", "Prix (100 en 2015)")], "", 1)] },
      { key: "salaire", n: "Salaire net moyen", f: "2 797 €", w: "2025", url: "9087193", c: "w6", s: "par mois en équivalent temps plein, secteur privé. Le graphique suit le salaire médian, seul historique publié.",
        staticRows: [["Cadres", 4711, "4 711 €"], ["Prof. intermédiaires", 2681, "2 681 €"], ["Ouvriers", 2092, "2 092 €"], ["Employés", 1979, "1 979 €"]],
        views: [V("Salaire médian, indice 100 en 1996", [P("salaire", "Salaire médian")], "", 1)] },
      { key: "niveau", n: "Niveau de vie médian", f: "2 228 €", w: "2024, métropole", url: "9019316", s: "par mois. Le seuil de pauvreté, à 60 % de ce montant, est de 1 337 €.", views: [V("Indice 100 en 2008", [P("niveau", "Niveau de vie médian")], "", 1)] },
      { key: "pauvrete", n: "Taux de pauvreté", f: "15,4 %", w: "2024, métropole", url: "9019316", c: "w6", s: "9,8 millions de personnes.",
        staticRows: [["Chômeurs", 36.1, "36,1 %"], ["Moins de 18 ans", 22.4, "22,4 %"], ["Retraités", 10.4, "10,4 %"], ["Personnes en emploi", 8.5, "8,5 %"]],
        views: [V("Ensemble", [P("pauvrete", "Taux de pauvreté")], "%", 1)] }
    ]
  },
  population: {
    title: "Population",
    items: [
      { key: "population", n: "Population", wp: "1er janvier ", u: "M", dec: 1, url: "8719824", c: "w6", h: 1, dark: 1, spark: 1, s: "d'habitants au 1er janvier.", d: { n: 1, kind: "pct", word: "en un an" }, views: [V("En millions", [L("001641586", "Population", { x: 1e-6 })], "M", 2)] },
      { key: "ages", n: "60 ans ou plus", wp: "1er janvier ", u: PCT, dec: 1, url: "8719824", c: "w6", h: 1, rows: 1, s: "Part de la population par âge (calcul de ce site).", views: [V("Par âge", [L("001686817", "60 ans ou plus", { tf: "share", of: "001641586" }), L("001686814", "20-59 ans", { tf: "share", of: "001641586" }), L("001686816", "Moins de 20 ans", { tf: "share", of: "001641586" })], "%", 1)] },
      { key: "naissances", n: "Naissances", dec: 0, url: "8719824", s: "sur l'année, chiffre provisoire.", d: { n: 1, kind: "pct", word: "en un an" }, views: [V("Par an", [L("001641590", "Naissances")], "", 0)] },
      { key: "deces", n: "Décès", dec: 0, url: "8719824", s: "sur l'année, chiffre provisoire.", d: { n: 1, kind: "pct", word: "en un an" }, views: [V("Par an", [L("001641592", "Décès")], "", 0)] },
      { key: "soldenat", n: "Solde naturel", dec: 0, signed: 1, url: "8719824", s: "Naissances moins décès, selon le bilan démographique.", views: [V("Par an", [L("001641585", "Solde naturel")], "", 0)] },
      { key: "soldemig", n: "Solde migratoire", dec: 0, signed: 1, url: "8719824", s: "Arrivées moins départs, estimation.", views: [V("Par an", [L("001641597", "Solde migratoire")], "", 0)] },
      { key: "fecondite", n: "Fécondité", dec: 2, url: "8719824", s: "enfant par femme.", views: [V("Par femme", [L("001686832", "Fécondité", { x: 0.01 })], "", 2)] },
      { key: "ev", n: "Espérance de vie à la naissance", u: "ans", dec: 1, url: "8719824", c: "w6", rows: 1, s: "pour les femmes.", views: [V("En années", [L("001686961", "Femmes"), L("001686956", "Hommes")], "ans", 1)] }
    ]
  },
  retraites: {
    title: "Retraites",
    items: [
      { key: "pension", n: "Pension moyenne", f: "1 752 €", u: "bruts par mois", w: "Fin 2024", o: "Drees", href: "https://drees.solidarites-sante.gouv.fr/sites/default/files/2026-10/RR2026%20-%20Fiche%2005%20-%20Le%20niveau%20des%20pensions.pdf", c: "w6", h: 1, dark: 1, spark: 1, s: "Pension de droit direct, retraités vivant en France, soit 1 626 € nets.",
        staticRows: [["Hommes", 2186, "2 186 €"], ["Femmes", 1383, "1 383 €"]],
        views: [V("Ensemble", [P("pension", "Pension moyenne")], "€", 0), V("Par sexe", [P("pensionH", "Hommes"), P("pensionF", "Femmes")], "€", 0)] },
      { key: "pauvreret", n: "Pauvreté des retraités", f: "10,4 %", w: "2024, métropole", url: "3565856", c: "w6", s: "1,6 million de personnes.", views: [V("Retraités", [P("pauvreret", "Pauvreté des retraités")], "%", 1)] },
      { key: "ecartpen", n: "Écart femmes-hommes", f: "36,7 %", w: "Fin 2024", o: "Drees", href: "https://drees.solidarites-sante.gouv.fr/sites/default/files/2026-10/RR2026%20-%20Fiche%2005%20-%20Le%20niveau%20des%20pensions.pdf", c: "w6", s: "Droit direct, et 24,7 % avec le droit dérivé (calcul de ce site).", views: [V("Écart", [P("ecartdir", "Droit direct"), P("ecartder", "Avec droit dérivé")], "%", 1)] }
    ]
  }
};

// Chiffres complémentaires, classés par catégorie.
THEMES.finances.items.push(
  { key: "soldeetat", n: "Solde du budget de l'État", u: "Md €", dec: 1, signed: 1, url: "2830301", s: "cumulé depuis le début de l'année.", views: [V("Cumul depuis janvier", [L("001717255", "Solde", { x: 1e-3 })], "Md €", 1)] },
  { key: "dettenr", n: "Dette publique détenue à l'étranger", f: "58,4 %", w: "30 juin 2026", o: "Banque de France", href: "https://www.banque-france.fr/fr/statistiques/credit/emission-et-detention-de-titres-francais-2026-q2", c: "w4", s: "des titres de long terme des administrations publiques, détenus par des non-résidents." }
);
THEMES.activite.items.push(
  { key: "soldeext", n: "Solde extérieur", u: "Md €", dec: 1, signed: 1, url: "2830547", c: "w6", spark: 1, s: "biens et services, sur les 4 derniers trimestres (calcul de ce site).", views: [V("Sur 4 trimestres", [L("011794880", "Solde extérieur", { tf: "sum4", x: 1e-3 })], "Md €", 1)] },
  { key: "partindustrie", n: "Poids de l'industrie", u: PCT, dec: 1, url: "2830547", s: "de la valeur ajoutée de l'économie (calcul de ce site).", views: [V("Part de la valeur ajoutée", [L("011794110", "Industrie", { tf: "share", of: "011794118" })], "%", 1)] },
  { key: "ipi", n: "Production industrielle", dec: 1, url: "2830547", s: "Moyenne annuelle, indice 100 en 2021.", d: { n: 1, kind: "pct", word: "en un an" }, views: [V("Indice 100 en 2021", [L("010768655", "Production manufacturière")], "", 1)] },
  { key: "nucleaire", n: "Part du nucléaire", u: PCT, dec: 1, url: "2830547", s: "de la consommation d'énergie primaire (calcul de ce site).", views: [V("Part de l'énergie primaire", [L("010760756", "Nucléaire", { tf: "share", of: "010760755" })], "%", 1)] },
  { key: "enr", n: "Énergies renouvelables", u: PCT, dec: 1, url: "2830547", s: "de la consommation finale brute d'énergie.", views: [V("Part de la consommation", [L("010596107", "Énergies renouvelables")], "%", 1)] }
);
THEMES.menages.items.push(
  { key: "smic", n: "Smic horaire brut", u: "€", dec: 2, url: "2830547", s: "Montant en vigueur.", views: [V("Brut par heure", [L("000822484", "Smic horaire brut")], "€", 2)] },
  { key: "gazole", n: "Prix du gazole", u: "€", dec: 2, url: "2830547", s: "le litre, en moyenne en métropole.", d: { n: 12, kind: "pct", word: "en un an" }, views: [V("Le litre", [L("000442588", "Gazole"), L("000849411", "Sans plomb 95")], "€", 2)] },
  { key: "baguette", n: "Prix de la baguette", u: "€", dec: 2, url: "2830547", s: "le kilo, en moyenne en métropole.", d: { n: 12, kind: "pct", word: "en un an" }, views: [V("Le kilo", [L("000442423", "Baguette")], "€", 2)] },
  { key: "irl", n: "Indice de référence des loyers", u: PCT, dec: 2, signed: 1, url: "2830547", s: "sur un an : il sert de plafond à la révision de la plupart des loyers du privé.", views: [V("Sur un an", [L("001515334", "IRL")], "%", 2)] },
  { key: "medecins", n: "Médecins", dec: 0, url: "2107840", s: "généralistes et spécialistes.", views: [V("Nombre", [L("010761309", "Médecins")], "", 0)] },
  { key: "generalistes", n: "Densité de généralistes", dec: 0, url: "2107840", s: "pour 100 000 habitants.", views: [V("Pour 100 000 habitants", [L("010761075", "Généralistes"), L("010761426", "Spécialistes")], "", 0)] },
  { key: "patr10", n: "Patrimoine des mieux dotés", f: "48 %", u: "aux 10 % du haut", w: "Début 2024", url: "8672665", c: "w6", s: "du patrimoine brut des ménages est détenu par les 10 % les mieux dotés.", staticRows: [["1 % les mieux dotés", 15, "15 %"], ["5 % les mieux dotés", 34, "34 %"], ["10 % les mieux dotés", 48, "48 %"], ["50 % les moins dotés", 7, "7 %"]] },
  { key: "seuilspat", n: "Combien possèdent les ménages", f: "205 100 €", u: "médiane", w: "Début 2024", url: "2388851", c: "w6", s: "de patrimoine brut : la moitié des ménages possède plus, l'autre moins.", staticRows: [["Seuil des 1 % du haut", 3020900, "3 020 900 €"], ["Seuil des 10 % du haut", 857700, "857 700 €"], ["Médiane", 205100, "205 100 €"], ["Seuil des 10 % du bas", 6200, "6 200 €"]] },
  { key: "smicnet", n: "Smic net mensuel", u: "€", dec: 0, url: "1375188", s: "pour 35 heures par semaine, après CSG et CRDS.", views: [V("Net par mois", [L("000879878", "Smic net")], "€", 0)] },
  { key: "rsa", n: "Allocataires du RSA", f: "1,84 M", w: "Fin 2025, provisoire", o: "Drees", href: "https://drees.solidarites-sante.gouv.fr/communique-de-presse-jeux-de-donnees/jeux-de-donnees/260227-suivi-mensuel-prestations-de-solidarite", s: "foyers, stable en un an (+0,2 %)." },
  { key: "minima", n: "Allocataires de minima sociaux", f: "4,25 M", w: "Fin 2024", o: "Drees", href: "https://drees.solidarites-sante.gouv.fr/communique-de-presse/communique-de-presse/251204-nombre-allocataires-minima-sociaux", s: "soit 1,3 % de plus en un an." }
);
THEMES.population.items.push(
  { key: "immigres", n: "Immigrés", f: "7,97", u: "M", w: "2025, provisoire", url: "2381757", c: "w6", spark: 1, s: "soit 11,6 % de la population. Rupture de série en 2024 : la méthode a changé.", views: [V("En millions", [P("immigres", "Immigrés")], "M", 2), V("Part de la population", [P("immigresPart", "Immigrés")], "%", 1)] },
  { key: "etrangers", n: "Étrangers", f: "6,30", u: "M", w: "2025, provisoire", url: "2381757", c: "w6", spark: 1, s: "soit 9,1 % de la population. Rupture de série en 2024.", views: [V("En millions", [P("etrangers", "Étrangers")], "M", 2), V("Part de la population", [P("etrangersPart", "Étrangers")], "%", 1)] },
  { key: "entrees", n: "Immigrés entrés en France", f: "313 000", w: "2024", url: "8998082", s: "sur l'année.", views: [V("Entrées", [P("entrees", "Entrées")], "", 0)] },
  { key: "occupation", n: "Occupation des prisons", u: PCT, dec: 1, url: "2107840", s: "au 31 décembre. Au-dessus de 100 %, il y a plus de détenus que de places.", views: [V("Taux d'occupation", [L("001779317", "Taux d'occupation")], "%", 1)] },
  { key: "homenr", n: "Homicides enregistrés", f: "975", w: "2025", o: "Ministère de l'Intérieur", href: "https://statistiques.interieur.gouv.fr/ssmsi/files/ssmsi/2026-07/Ins%C3%A9curit%C3%A9%20et%20d%C3%A9linquance%20en%202025%20-%20Bilan%20statistique%20-%20%C3%A9dition%202026%20-%20SSMSI.pdf", s: "victimes, coups mortels inclus. Stable en un an.", views: [V("Par an", [P("homEnr", "Homicides"), P("tentHom", "Tentatives")], "", 0)] },
  { key: "cambriolages", n: "Cambriolages de logements", f: "211 600", w: "2025", o: "Ministère de l'Intérieur", href: "https://statistiques.interieur.gouv.fr/ssmsi/files/ssmsi/2026-07/Ins%C3%A9curit%C3%A9%20et%20d%C3%A9linquance%20en%202025%20-%20Bilan%20statistique%20-%20%C3%A9dition%202026%20-%20SSMSI.pdf", s: "enregistrés, soit 3 % de moins en un an.", views: [V("Par an", [P("camb", "Cambriolages")], "", 0)] },
  { key: "violphys", n: "Violences physiques", f: "472 400", w: "2025", o: "Ministère de l'Intérieur", href: "https://statistiques.interieur.gouv.fr/ssmsi/files/ssmsi/2026-07/Ins%C3%A9curit%C3%A9%20et%20d%C3%A9linquance%20en%202025%20-%20Bilan%20statistique%20-%20%C3%A9dition%202026%20-%20SSMSI.pdf", s: "victimes enregistrées, soit 5 % de plus en un an.", views: [V("Ensemble", [P("violPhys", "Ensemble")], "", 0), V("Famille ou non", [P("violFam", "Dans la famille"), P("violHors", "Hors famille")], "", 0)] },
  { key: "violsex", n: "Violences sexuelles", f: "132 100", w: "2025", o: "Ministère de l'Intérieur", href: "https://statistiques.interieur.gouv.fr/ssmsi/files/ssmsi/2026-07/Ins%C3%A9curit%C3%A9%20et%20d%C3%A9linquance%20en%202025%20-%20Bilan%20statistique%20-%20%C3%A9dition%202026%20-%20SSMSI.pdf", s: "victimes enregistrées, soit 8 % de plus en un an.", views: [V("Par an", [P("violSex", "Violences sexuelles"), P("viols", "Viols et tentatives")], "", 0)] },
  { key: "trafic", n: "Trafic de stupéfiants", f: "57 100", w: "2025", o: "Ministère de l'Intérieur", href: "https://statistiques.interieur.gouv.fr/ssmsi/files/ssmsi/2026-07/Ins%C3%A9curit%C3%A9%20et%20d%C3%A9linquance%20en%202025%20-%20Bilan%20statistique%20-%20%C3%A9dition%202026%20-%20SSMSI.pdf", s: "personnes mises en cause, soit 9 % de plus en un an.", views: [V("Par an", [P("trafic", "Trafic")], "", 0)] },
  { key: "escroqueries", n: "Escroqueries", f: "448 300", w: "2025", o: "Ministère de l'Intérieur", href: "https://statistiques.interieur.gouv.fr/ssmsi/files/ssmsi/2026-07/Ins%C3%A9curit%C3%A9%20et%20d%C3%A9linquance%20en%202025%20-%20Bilan%20statistique%20-%20%C3%A9dition%202026%20-%20SSMSI.pdf", s: "victimes enregistrées, soit 7 % de plus en un an.", views: [V("Par an", [P("escro", "Escroqueries")], "", 0)] }
);
THEMES.retraites.items.push(
  { key: "retraitesdep", n: "Dépenses de retraite", f: "13,5 %", u: "du PIB", w: "2024", o: "Drees", href: "https://drees.solidarites-sante.gouv.fr/sites/default/files/2026-10/RR2026%20-%20Fiche%2010%20-%20Les%20masses%20financi%C3%A8res%20relatives%20aux%20pensions%20de%20retraite.pdf", c: "w6", s: "soit 395 Md €. Fin 2024, on compte 17,3 M de retraités." }
);

// Eurostat : la France, et la moyenne de l'Union européenne quand elle existe.
var ES = {"dette": ["gov_10dd_edpt1", "na_item=GD&sector=S13&unit=PC_GDP"], "deficit": ["gov_10dd_edpt1", "na_item=B9&sector=S13&unit=PC_GDP"], "cprot": ["gov_10a_exp", "cofog99=GF10&na_item=TE&sector=S13&unit=PC_GDP"], "csante": ["gov_10a_exp", "cofog99=GF07&na_item=TE&sector=S13&unit=PC_GDP"], "cserv": ["gov_10a_exp", "cofog99=GF01&na_item=TE&sector=S13&unit=PC_GDP"], "cedu": ["gov_10a_exp", "cofog99=GF09&na_item=TE&sector=S13&unit=PC_GDP"], "ceco": ["gov_10a_exp", "cofog99=GF04&na_item=TE&sector=S13&unit=PC_GDP"], "cdef": ["gov_10a_exp", "cofog99=GF02&na_item=TE&sector=S13&unit=PC_GDP"], "pibhab": ["tec00114", ""], "elec": ["nrg_pc_204", "siec=E7000&nrg_cons=KWH2500-4999&unit=KWH&tax=I_TAX&currency=EUR"], "chom": ["une_rt_a", "age=Y15-74&sex=T&unit=PC_ACT"], "permis": ["migr_resfirst", "citizen=TOTAL&reason=TOTAL&duration=TOTAL&unit=PER"], "ordres": ["migr_eiord", "citizen=TOTAL&sex=T&age=TOTAL&unit=PER"], "retours": ["migr_eirtn", "citizen=TOTAL&sex=T&age=TOTAL&c_dest=TOTAL&unit=PER"], "asile": ["migr_asyappctza", "citizen=TOTAL&sex=T&age=TOTAL&applicant=TOTAL&unit=PER"], "asile1": ["migr_asyappctza", "citizen=TOTAL&sex=T&age=TOTAL&applicant=FRST&unit=PER"], "emp5564": ["lfsi_emp_a", "age=Y55-64&sex=T&indic_em=EMP_LFS&unit=PC_POP"], "taux": ["irt_lt_mcby_a", "int_rt=MCBY"]};
var ES_API = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/", ES_VIEW = "https://ec.europa.eu/eurostat/databrowser/view/";
function E(o) {
  var fr = "ES_" + o.id + "_FR", eu = "ES_" + o.id + "_EU", x = o.x ? { x: o.x } : {}, lines = [L(fr, "France", x)];
  if (DATA[eu] && DATA[eu].length) lines.push(L(eu, "UE à 27", x));
  var unit = o.u === PCT ? "%" : (o.u || "");
  return { key: o.key, n: o.n, u: o.u, dec: o.dec, signed: o.signed, o: "Eurostat", href: ES_VIEW + ES[o.id][0] + "/default/table?lang=fr", ds: ES[o.id][0], c: o.c, spark: o.spark,
    s: function (g) {
      var v = g(eu) * (o.x || 1);
      return isNaN(v) || !o.cmp ? o.s : o.s + " UE à 27 : " + (o.signed ? signed(v, o.dec) : num(v, o.dec)) + (unit ? " " + unit : "") + ".";
    },
    views: [V(o.label, lines, unit, o.dec)] };
}
var EUROSTAT = {
  finances: [
    E({ key: "esdette", id: "dette", n: "Dette, comparaison européenne", u: PCT, dec: 1, s: "du PIB.", cmp: 1, label: "En % du PIB", c: "w6", spark: 1 }),
    E({ key: "esdeficit", id: "deficit", n: "Solde public, comparaison européenne", u: PCT, dec: 1, signed: 1, s: "du PIB. Négatif : un déficit.", cmp: 1, label: "En % du PIB", c: "w4" }),
    E({ key: "esdefense", id: "cdef", n: "Dépenses de défense", u: PCT, dec: 1, s: "du PIB, toutes administrations.", cmp: 1, label: "En % du PIB", c: "w4" }),
    { key: "esfonctions", n: "Où va la dépense publique", u: "% du PIB, protection sociale", dec: 1, o: "Eurostat", href: ES_VIEW + "gov_10a_exp/default/table?lang=fr", ds: "gov_10a_exp", c: "w6", rows: 1, s: "Principales fonctions, toutes administrations.",
      views: [V("France", [L("ES_cprot_FR", "Protection sociale"), L("ES_csante_FR", "Santé"), L("ES_cserv_FR", "Services généraux"), L("ES_cedu_FR", "Éducation"), L("ES_ceco_FR", "Économie"), L("ES_cdef_FR", "Défense")], "%", 1),
        V("Protection sociale, France et UE", [L("ES_cprot_FR", "France"), L("ES_cprot_EU", "UE à 27")], "%", 1),
        V("Santé, France et UE", [L("ES_csante_FR", "France"), L("ES_csante_EU", "UE à 27")], "%", 1),
        V("Éducation, France et UE", [L("ES_cedu_FR", "France"), L("ES_cedu_EU", "UE à 27")], "%", 1)] }
  ],
  activite: [
    E({ key: "espibhab", id: "pibhab", n: "PIB par habitant, comparaison européenne", dec: 0, s: "en pouvoir d'achat. 100 correspond à la moyenne de l'UE.", label: "Base 100 pour l'UE à 27", c: "w6" })
  ],
  menages: [
    E({ key: "eselec", id: "elec", n: "Prix de l'électricité", u: "€", dec: 3, s: "le kWh, taxes comprises, pour une consommation moyenne.", cmp: 1, label: "Le kWh", c: "w4" }),
    E({ key: "eschom", id: "chom", n: "Chômage, comparaison européenne", u: PCT, dec: 1, s: "des 15-74 ans actifs.", cmp: 1, label: "Taux de chômage", c: "w6" })
  ],
  population: [
    { key: "esasile", n: "Demandes d'asile", dec: 0, o: "Eurostat", href: ES_VIEW + "migr_asyappctza/default/table?lang=fr", ds: "migr_asyappctza", s: "toutes demandes, sur l'année. Voir aussi les premières demandes dans l'historique.", views: [V("Par an", [L("ES_asile_FR", "Toutes demandes"), L("ES_asile1_FR", "Premières demandes")], "", 0)] },
    E({ key: "espermis", id: "permis", n: "Premiers titres de séjour", dec: 0, s: "délivrés sur l'année, hors citoyens de l'UE.", label: "Par an", c: "w6", spark: 1 }),
    { key: "esordres", n: "Ordres de quitter le territoire", dec: 0, o: "Eurostat", href: ES_VIEW + "migr_eiord/default/table?lang=fr", ds: "migr_eiord", s: "prononcés sur l'année. L'historique les compare aux départs.", views: [V("Par an", [L("ES_ordres_FR", "Ordres"), L("ES_retours_FR", "Départs")], "", 0)] }
  ],
  retraites: [
    E({ key: "esemp", id: "emp5564", n: "Emploi des 55-64 ans", u: PCT, dec: 1, s: "de cette tranche d'âge travaille.", cmp: 1, label: "Taux d'emploi", c: "w6" })
  ]
};
Object.keys(EUROSTAT).forEach(function (t) { EUROSTAT[t].forEach(function (i) { THEMES[t].items.push(i); }); });
THEMES.finances.groups = [{"title": "Dette et déficit", "note": "Le déficit est ce qui manque sur une année. La dette est le total accumulé. Le budget de l'État n'est qu'une partie des comptes publics, qui comprennent aussi la Sécurité sociale et les collectivités.", "keys": ["dette", "taux", "deficit", "interets", "soldeetat", "dettenr|", "esdeficit|w6", "esdette"]}, {"title": "Dépenses et recettes", "note": "Les dépenses et les recettes couvrent l'État, la Sécurité sociale et les collectivités.", "keys": ["depenses|w4", "recettes|w4", "po|w4", "esfonctions", "esdefense|w6"]}];
THEMES.activite.groups = [{"title": "Croissance et entreprises", "note": "Le PIB mesure ce qui est produit dans le pays sur une période.", "keys": ["pib", "croissance", "climat", "emploi", "creations", "defaillances", "conso", "fbcf", "espibhab|"]}, {"title": "Industrie et commerce extérieur", "note": "Le solde extérieur compare ce que la France vend et achète à l'étranger, biens et services compris.", "keys": ["soldeext", "partindustrie", "ipi"]}, {"title": "Énergie", "note": "L'énergie primaire est celle des ressources, avant transformation. La consommation finale est celle des utilisateurs.", "keys": ["nucleaire|w6", "enr|w6"]}];
THEMES.menages.groups = [{"title": "Prix et pouvoir d'achat", "note": "L'inflation mesure la hausse moyenne des prix. Elle peut ralentir alors que les prix continuent de monter.", "keys": ["inflation", "achat", "epargne", "confiance", "gazole", "baguette|w6", "eselec|w6", "sommehier"]}, {"title": "Emploi et salaires", "note": "Le taux de chômage au sens du BIT n'est pas le nombre d'inscrits à France Travail.", "keys": ["chomage", "chomeurs", "tauxemploi", "salaire", "smic", "smicnet", "eschom"]}, {"title": "Patrimoine, revenus et pauvreté", "note": "Le patrimoine est ce qu'un ménage possède, le revenu ce qu'il gagne chaque année. Le patrimoine brut ne déduit pas les dettes. Seule la moitié des 10 % les mieux dotés en patrimoine fait partie des 10 % aux plus hauts revenus.", "keys": ["patr10", "seuilspat", "niveau|w6", "pauvrete", "rsa|w6", "minima|w6"]}, {"title": "Logement", "note": "L'indice de référence des loyers plafonne la révision de la plupart des loyers du privé.", "keys": ["logement|w6", "irl|w6"]}, {"title": "Santé", "note": "La densité de médecins rapporte leur nombre à la population. Elle ne dit rien de leur répartition sur le territoire.", "keys": ["medecins|w6", "generalistes|w6"]}];
THEMES.population.groups = [{"title": "Démographie", "note": "Le solde naturel compare les naissances et les décès. Le solde migratoire compare les arrivées et les départs.", "keys": ["population", "ages", "naissances", "deces", "soldenat", "soldemig", "fecondite|w6", "ev"]}, {"title": "Immigration", "note": "Un immigré est né étranger à l'étranger, et le reste même s'il devient français. Un étranger n'a pas la nationalité française, même s'il est né en France. Les deux chiffres ne se recouvrent pas.", "keys": ["immigres|w4", "etrangers|w4", "entrees|w4", "espermis", "esasile", "esordres"]}, {"title": "Sécurité et justice", "note": "Les chiffres enregistrés par la police et la gendarmerie mesurent les faits constatés, pas tous ceux commis : une partie n'est jamais signalée.", "keys": ["homenr", "cambriolages", "violphys", "violsex", "trafic|w4", "escroqueries|w4", "occupation|w4"]}];
var PRICE_ID = "010605954";
function priceYear(y) {
  var d = DATA[PRICE_ID] || [];
  for (var i = 0; i < d.length; i++) if (d[i][0] === String(y)) return d[i][1];
  return NaN;
}
function parseNumber(s) {
  var v = parseFloat(String(s).replace(/[\s  ]/g, "").replace(",", "."));
  return isFinite(v) ? v : NaN;
}
// Écart, évolution et multiplicateur entre deux valeurs. Pour un taux en %, seul l'écart en points a du sens.
function gapCells(a, b, unit, dec) {
  var isRate = unit === "%", u = unit ? " " + unit : "", cells = [];
  if (isRate) {
    var pts = b - a;
    cells.push(["Écart", signed(pts, dec) + " point" + (Math.abs(pts) >= 2 ? "s" : "")]);
    return cells;
  }
  cells.push(["Écart", signed(b - a, dec) + u]);
  if (a > 0 && b > 0) {
    cells.push(["Évolution", signed((b / a - 1) * 100, 1) + " %"]);
    cells.push(["Multiplié par", "× " + num(b / a, 2)]);
  }
  return cells;
}
function cellsHtml(cells) {
  return cells.map(function (c) { return "<span><small>" + esc(c[0]) + "</small><b>" + nb(c[1]) + "</b></span>"; }).join("");
}
function drawPicked() {
  var box = chart.el.querySelector(".picked"), view = chart.item.views[chart.view], dec = view.dec, unit = view.unit, u = unit ? " " + unit : "", g = chart.geo;
  var count = {};
  g.lines.forEach(function (l) { l.shown.forEach(function (p) { count[p[0]] = 1; }); });
  if (Object.keys(count).length < 2) { box.hidden = true; return; }
  box.hidden = false;
  var valueAt = function (l, p) { var f = l.shown.filter(function (q) { return q[0] === p; })[0]; return f ? f[1] : undefined; };
  var pick = chart.pick;
  if (pick.length < 2 && chart.reserve) { chart.reserve = 0; drawChart(); return; }
  if (!pick.length) { box.innerHTML = "Cliquez sur deux points de la courbe pour les comparer."; return; }
  if (pick.length === 1) {
    var vals = g.lines.map(function (l) { var v = valueAt(l, pick[0]); return v === undefined ? "" : (g.lines.length > 1 ? esc(l.name) + " : " : "") + nb(num(v, dec) + u); }).filter(Boolean).join(" · ");
    box.innerHTML = "<b>" + nb(periodLabel(pick[0])) + "</b> " + vals + ". Cliquez sur un second point.";
    return;
  }
  var a = pick[0], b = pick[1];
  if (periodTime(a) > periodTime(b)) { var swap = a; a = b; b = swap; }
  var rows = g.lines.map(function (l) {
    var va = valueAt(l, a), vb = valueAt(l, b), name = g.lines.length > 1 ? '<span class="pick-name">' + esc(l.name) + "</span>" : "";
    if (va === undefined || vb === undefined) return '<div class="pick-row">' + name + '<span class="pick-values">Pas de chiffre à l\'une de ces dates.</span></div>';
    return '<div class="pick-row">' + name + '<span class="pick-values">' + nb(num(va, dec) + u) + " → " + nb(num(vb, dec) + u) + '</span><div class="cmp-cells">' + cellsHtml(gapCells(va, vb, unit, dec)) + "</div></div>";
  }).join("");
  // Pour une somme en euros, on rappelle ce qu'ont fait les prix
  var note = "", ya = a.slice(0, 4), yb = b.slice(0, 4), pa = priceYear(ya), pb = priceYear(yb);
  if (/€/.test(unit) && ya !== yb && pa > 0 && pb > 0) {
    var rise = (pb / pa - 1) * 100, about = /^\d{4}$/.test(a) && /^\d{4}$/.test(b) ? "" : "environ ";
    var txt = "Prix : " + signed(rise, 1) + " %" + (about ? " environ" : "") + ".";
    if (g.lines.length === 1) {
      var v1 = valueAt(g.lines[0], a), v2 = valueAt(g.lines[0], b);
      if (v1 > 0 && v2 > 0) txt += " Inflation retirée : " + signed(((v2 / v1) / (pb / pa) - 1) * 100, 1) + " %.";
    }
    note = '<p class="pick-note">' + txt + "</p>";
  }
  var title = nb(periodLabel(a)) + " → " + nb(periodLabel(b));
  var card = document.createElement("div");
  card.className = "pick-card";
  card.innerHTML = '<div class="pick-head"><b>' + title + '</b><button type="button" class="pick-clear" data-clear aria-label="Effacer la comparaison">×</button></div>' + rows + note;
  chart.el.querySelector(".plot").appendChild(card);
  motion(card, POP, { duration: 280 });
  // Sur téléphone, la carte prend toute la largeur : on lui garde une place au-dessus de la courbe
  if (g.W < 480) {
    var need = card.offsetHeight + 8;
    if (need !== chart.reserve) { chart.reserve = need; drawChart(); return; }
    card.style.left = "0"; card.style.top = "0";
  } else placeCard(card);
  box.innerHTML = 'Cliquez ailleurs sur la courbe pour recommencer.<span class="vh">' + card.textContent.replace("×", " ") + "</span>";
}
// La carte se pose près de la zone choisie, là où elle cache le moins la courbe.
function placeCard(card) {
  var g = chart.geo, w = card.offsetWidth, h = card.offsetHeight;
  var xa = g.X(periodTime(chart.pick[0])), xb = g.X(periodTime(chart.pick[1]));
  var clamp = function (x) { return Math.max(0, Math.min(x, g.W - w)); };
  var xs = [clamp((xa + xb) / 2 - w / 2), clamp(g.left + 6), clamp(g.right - w - 6)], ys = [g.top + 4, Math.max(g.top + 4, g.base - h - 4)], best = null;
  xs.forEach(function (x) {
    ys.forEach(function (y) {
      var score = 0;
      g.lines.forEach(function (l) {
        l.shown.forEach(function (p) {
          var px = g.X(periodTime(p[0])), py = g.Y(p[1]);
          if (px >= x && px <= x + w && py >= y && py <= y + h) score += chart.pick.indexOf(p[0]) >= 0 ? 1000 : 1;
        });
      });
      if (!best || score < best.score) best = { score: score, x: x, y: y };
    });
  });
  card.style.left = best.x + "px";
  card.style.top = best.y + "px";
}
function nearestPeriod(px) {
  var g = chart.geo;
  if (px < g.left - 6 || px > g.right + 6) return null;
  var t = g.start + (px - g.left) / ((g.right - g.left) || 1) * (g.end - g.start), best = null;
  g.lines.forEach(function (l) { l.shown.forEach(function (p) { var dt = Math.abs(periodTime(p[0]) - t); if (!best || dt < best.dt) best = { dt: dt, p: p[0] }; }); });
  return best && best.p;
}
function pickPeriod(p) {
  if (!p) return;
  if (chart.pick.length >= 2) chart.pick = [p];
  else if (chart.pick[0] !== p) chart.pick.push(p);
  drawChart();
  if (chart.pick.length === 2) hideCursor(); else showCursor(p);
}
var prixTool = { s: "100", y: "2015" };
function prixResult() {
  var d = (DATA[PRICE_ID] || []).filter(function (p) { return +p[0] >= 2002; }), last = d[d.length - 1], s = parseNumber(prixTool.s);
  if (isNaN(s) || !last || !(priceYear(prixTool.y) > 0)) return '<p class="tool-hint">Tapez un nombre pour voir le résultat.</p>';
  var ratio = last[1] / priceYear(prixTool.y);
  return '<p class="tool-result"><b>' + nb(num(s * ratio, 2) + " €") + '</b></p><p class="tool-hint">' + nb(num(s, 2) + " € de " + prixTool.y + " valent autant que " + num(s * ratio, 2) + " € de " + last[0]) + ". Les prix ont été multipliés par " + num(ratio, 2) + ". Source : Insee.</p>";
}
function prixToolHtml() {
  var years = (DATA[PRICE_ID] || []).filter(function (p) { return +p[0] >= 2002; }).slice(0, -1).reverse();
  return '<section class="t w12 tool" data-key="sommehier"><div><h4>Une somme d\'hier en euros d\'aujourd\'hui</h4><p>Ce qu\'il faudrait aujourd\'hui pour acheter la même chose, avec les prix moyens.</p></div>' +
    '<div class="tool-fields"><label><span>Somme en €</span><input type="text" inputmode="decimal" autocomplete="off" data-f="s" value="' + esc(prixTool.s) + '"></label><label><span>En quelle année</span><select data-f="y">' +
    years.map(function (p) { return '<option value="' + p[0] + '"' + (p[0] === prixTool.y ? " selected" : "") + ">" + p[0] + "</option>"; }).join("") + '</select></label></div><div class="tool-out" aria-live="polite">' + prixResult() + "</div></section>";
}
var ESSENTIEL = [["dette", "w6 h2"], ["croissance", ""], ["inflation", ""], ["chomage", ""], ["population", ""]];

// --- Outils
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
function nb(s) { return esc(s).replace(/ (?=[\d€%M‰]|Md|du PIB)/g, "&nbsp;").replace(/(\d)e trimestre/g, "$1<sup>e</sup> trimestre").replace(/1er /g, "1<sup>er</sup> "); }
function num(v, dec) { return v.toLocaleString("fr-FR", { minimumFractionDigits: dec, maximumFractionDigits: dec }).replace(/[\u202f\u00a0]/g, "\u00a0").replace(/-/, "−"); }
function signed(v, dec) { return (v > 0 ? "+" : "") + num(v, dec); }
function withUnit(v, unit, dec) { return num(v, dec) + (unit ? " " + unit : ""); }
var MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
function periodTime(p) {
  var m = /^(\d{4})(?:-(Q|B|S)?(\d+))?$/.exec(p);
  if (!m[3]) return +m[1];
  if (m[2] === "S") return +m[1] + (m[3] - 1) / 2;
  if (m[2] === "Q") return +m[1] + (m[3] - 1) / 4;
  if (m[2] === "B") return +m[1] + (m[3] - 1) / 6;
  return +m[1] + (m[3] - 1) / 12;
}
function periodLabel(p) {
  var m = /^(\d{4})(?:-(Q|B|S)?(\d+))?$/.exec(p);
  if (!m[3]) return m[1];
  if (m[2] === "S") return (m[3] === "1" ? "1er" : m[3] + "e") + " semestre " + m[1];
  if (m[2] === "Q") return (m[3] === "1" ? "1er" : m[3] + "e") + " trimestre " + m[1];
  if (m[2] === "B") return "Bimestre " + m[3] + " de " + m[1];
  var t = MONTHS[m[3] - 1];
  return t.charAt(0).toUpperCase() + t.slice(1) + " " + m[1];
}

// --- Données : la copie enregistrée s'affiche tout de suite, l'API de l'Insee la met à jour
function lineData(l) {
  if (l.pts) return l.pts.map(function (p) { return [p[0], p[1]]; });
  var o = (DATA[l.id] || []).map(function (p) { return [p[0], p[1] * (l.x || 1)]; }), i, out = [];
  if (l.tf === "sum4") { for (i = 3; i < o.length; i++) out.push([o[i][0], o[i][1] + o[i - 1][1] + o[i - 2][1] + o[i - 3][1]]); return out; }
  if (l.tf === "sum12") { for (i = 11; i < o.length; i++) { var t12 = 0; for (var j = 0; j < 12; j++) t12 += o[i - j][1]; out.push([o[i][0], t12]); } return out; }
  if (l.tf === "qoq") { for (i = 1; i < o.length; i++) if (o[i - 1][1]) out.push([o[i][0], (o[i][1] / o[i - 1][1] - 1) * 100]); return out; }
  if (l.tf === "yoy4") { for (i = 4; i < o.length; i++) if (o[i - 4][1]) out.push([o[i][0], (o[i][1] / o[i - 4][1] - 1) * 100]); return out; }
  if (l.tf === "share") {
    var base = {}; (DATA[l.of] || []).forEach(function (p) { base[p[0]] = p[1]; });
    return o.filter(function (p) { return base[p[0]]; }).map(function (p) { return [p[0], p[1] / base[p[0]] * 100]; });
  }
  return o;
}
function lastOf(id) { var d = DATA[id]; return d && d.length ? d[d.length - 1][1] : NaN; }
function allIds() {
  var ids = {};
  Object.keys(THEMES).forEach(function (k) {
    THEMES[k].items.forEach(function (i) {
      (i.views || []).forEach(function (v) { v.lines.forEach(function (l) { if (l.id && l.id.indexOf("ES_") !== 0) ids[l.id] = 1; if (l.of) ids[l.of] = 1; }); });
    });
  });
  ids[PRICE_ID] = 1;
  return Object.keys(ids);
}
function mergeXml(text) {
  var doc = new DOMParser().parseFromString(text, "application/xml"), count = 0;
  Array.prototype.forEach.call(doc.getElementsByTagNameNS("*", "Series"), function (s) {
    var id = s.getAttribute("IDBANK"), cur = {};
    if (s.getAttribute("LAST_UPDATE")) UPD[id] = s.getAttribute("LAST_UPDATE");
    (DATA[id] || []).forEach(function (p) { cur[p[0]] = p[1]; });
    Array.prototype.forEach.call(s.getElementsByTagNameNS("*", "Obs"), function (o) {
      var v = o.getAttribute("OBS_VALUE");
      if (v !== null && v !== "NaN") { if (cur[o.getAttribute("TIME_PERIOD")] !== +v) dataDirty = true; cur[o.getAttribute("TIME_PERIOD")] = +v; count++; }
    });
    DATA[id] = Object.keys(cur).sort(function (a, b) { return periodTime(a) - periodTime(b); }).map(function (p) { return [p, cur[p]]; });
  });
  return count;
}
function fetchSeries(ids, last) {
  var calls = [], i;
  for (i = 0; i < ids.length; i += 40) {
    calls.push(fetch(API + ids.slice(i, i + 40).join("+") + (last ? "?lastNObservations=" + last : ""), { headers: { Accept: "application/xml" } })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(mergeXml));
  }
  return Promise.all(calls);
}
function setStatus(ok) {
  var el = document.getElementById("live");
  if (ok) {
    var d = new Date();
    extractedOn = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    el.dataset.state = "on";
    el.textContent = "Connecté à l'Insee : chiffres vérifiés aujourd'hui à " + String(d.getHours()).padStart(2, "0") + " h " + String(d.getMinutes()).padStart(2, "0") + ".";
  } else {
    el.dataset.state = "off";
    el.textContent = "Connexion à l'Insee impossible : chiffres enregistrés le " + SAVED_ON + ".";
  }
}
function refresh() {
  return fetchSeries(allIds(), 12).then(function () { if (dataDirty) { dataDirty = false; renderAll(); } else if (playReady) renderFeed(); setStatus(true); }, function () { setStatus(false); });
}
// Eurostat publie moins souvent : une lecture à l'ouverture suffit. En cas d'échec, la copie enregistrée reste affichée.
function refreshEurostat() {
  var ids = Object.keys(ES), pos = 0, changed = false;
  function one(id) {
    var q = ES[id];
    return fetch(ES_API + q[0] + "?" + (q[1] ? q[1] + "&" : "") + "geo=FR&geo=EU27_2020&format=JSON&lang=fr").then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) {
      if (j.updated) { UPD["ES_" + id + "_FR"] = j.updated.slice(0, 10); UPD["ES_" + id + "_EU"] = j.updated.slice(0, 10); }
      var stride = {}, st = 1;
      for (var n = j.id.length - 1; n >= 0; n--) { stride[j.id[n]] = st; st *= j.size[n]; }
      var geo = j.dimension.geo.category.index, time = j.dimension.time.category.index;
      Object.keys(geo).forEach(function (g) {
        var pts = [];
        Object.keys(time).forEach(function (t) {
          var v = j.value[geo[g] * stride.geo + time[t] * stride.time];
          if (v !== undefined && v !== null) pts.push([t, v]);
        });
        if (pts.length) {
          pts.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
          var slot = "ES_" + id + (g === "FR" ? "_FR" : "_EU");
          if (JSON.stringify(DATA[slot]) !== JSON.stringify(pts)) changed = true;
          DATA[slot] = pts;
        }
      });
    }).catch(function () {});
  }
  function worker() { return pos < ids.length ? one(ids[pos++]).then(worker) : Promise.resolve(); }
  return Promise.all([worker(), worker(), worker(), worker()]).then(function () { if (changed) renderAll(); else if (playReady) renderFeed(); });
}

// --- Tuiles
function itemByKey(key) {
  var found = null;
  Object.keys(THEMES).forEach(function (k) { THEMES[k].items.forEach(function (i) { if (i.key === key) found = i; }); });
  return found;
}
function headline(i) {
  if (i.f) return { f: i.f, u: i.u, w: i.w };
  var line = i.head || i.views[0].lines[0], d = lineData(line), p = d[d.length - 1];
  if (!p) return { f: "–", u: i.u, w: "" };
  var fig = i.signed ? signed(p[1], i.dec) : num(p[1], i.dec);
  return { f: i.u === PCT ? fig + "\u00a0%" : fig, u: i.u === PCT ? "" : i.u, w: (i.wp || "") + periodLabel(p[0]), v: p[1], data: d };
}
function deltaText(i, h) {
  if (!i.d || !h.data || h.data.length <= i.d.n) return "";
  var cur = h.v, prev = h.data[h.data.length - 1 - i.d.n][1], diff = cur - prev, txt;
  if (i.d.kind === "pct") txt = signed((cur / prev - 1) * 100, 1) + " %";
  else if (i.d.kind === "k") txt = signed(diff * 1000, 0) + " millier" + (Math.abs(diff * 1000) >= 2 ? "s" : "");
  else { var pts = Math.abs(diff) < 0.05 ? 0 : diff; txt = signed(pts, 1) + " point" + (Math.abs(pts) >= 2 ? "s" : ""); }
  return txt + " " + i.d.word;
}
function vizRows(i) {
  var rows;
  if (i.staticRows) rows = i.staticRows;
  else if (i.rows) {
    var view = i.views[i.rowsView || 0], u = view.unit, dec = view.dec;
    rows = view.lines.map(function (l) { var d = lineData(l), p = d[d.length - 1]; return [l.name, p ? p[1] : 0, p ? withUnit(p[1], u, dec) : "–"]; });
  } else return "";
  var max = Math.max.apply(null, rows.map(function (r) { return r[1]; }));
  return '<div class="rows">' + rows.map(function (r) {
    return "<div><span>" + esc(r[0]) + '</span><span class="bar"><i style="width:' + (r[1] / max * 100).toFixed(1) + '%"></i></span><b>' + nb(r[2]) + "</b></div>";
  }).join("") + "</div>";
}
function spark(i) {
  var d = i.views[0].lines[0], pts = lineData(d);
  if (pts.length > 80) pts = pts.slice(-80);
  if (pts.length < 2) return "";
  var ys = pts.map(function (p) { return p[1]; }), lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys), W = 400, H = 72;
  var path = pts.map(function (p, n) { return (n / (pts.length - 1) * W).toFixed(1) + "," + (H - 4 - (p[1] - lo) / ((hi - lo) || 1) * (H - 8)).toFixed(1); }).join(" ");
  return '<svg class="spark" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" aria-hidden="true"><polyline points="' + path + '" fill="none" stroke="var(--tile-a)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/></svg>';
}
function sourceUrl(i) {
  if (i.href) return i.href;
  var l = i.head || (i.views && i.views[0].lines[0]);
  return l && l.id ? INSEE + "serie/" + l.id : INSEE + i.url;
}
function tile(i, cls, isHome) {
  var h = headline(i), s = typeof i.s === "function" ? i.s(lastOf) : i.s, can = !!i.views;
  var c = cls !== undefined ? cls : (i.c || "") + (i.h ? " h2" : ""), compact = isHome && !/h2/.test(c);
  var delta = deltaText(i, h);
  return '<article class="t ' + c + (can ? " can" : "") + '" data-key="' + i.key + '">' +
    '<span class="k"><a class="k-link" href="/chiffres/' + plainText(i.n).replace(/ /g, "-") + '/">' + esc(i.n) + '</a></span><span class="v">' + nb(h.f) + (h.u && h.f.indexOf(h.u) < 0 ? " <small>" + esc(h.u) + "</small>" : "") + "</span>" +
    (s ? '<span class="s">' + nb(s) + "</span>" : "") + (delta ? '<span class="p">' + nb(delta) + "</span>" : "") +
    (i.spark && can && !compact ? spark(i) : "") + (compact ? "" : vizRows(i)) +
    '<span class="foot-t"><a class="src" href="' + sourceUrl(i) + '">' + esc(i.o || "Insee") + ", " + nb(h.w.charAt(0).toLowerCase() + h.w.slice(1)) + "</a>" +
    (can ? '<button class="more" type="button" aria-expanded="false">Historique <svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></button>' : "") + "</span></article>";
}

// --- Graphique d'historique, ouvert dans la tuile
var COLORS = ["#111111", "#767676", "#A67C00", "#1F5FBF", "#B0306A"];
var chart = null;
function niceTicks(lo, hi) {
  var span = (hi - lo) || Math.abs(hi) || 1, step = Math.pow(10, Math.floor(Math.log10(span / 4))), e = span / 4 / step;
  step *= e >= 5 ? 10 : e >= 2 ? 5 : e >= 1 ? 2 : 1;
  var out = [], v = Math.floor(lo / step) * step;
  do { out.push(+v.toFixed(6)); v += step; } while (v < hi + step * .999);
  return { ticks: out, step: step };
}
function chartSummary(item, view, lines) {
  return "Évolution de " + item.n + ", " + view.label + ". " + lines.map(function (l) {
    var a = l.shown[0], b = l.shown[l.shown.length - 1];
    return a ? l.name + " : " + withUnit(a[1], view.unit, view.dec) + " en " + periodLabel(a[0]) + ", " + withUnit(b[1], view.unit, view.dec) + " en " + periodLabel(b[0]) : "";
  }).join(". ");
}
function drawChart() {
  if (!chart) return;
  var box = chart.el.querySelector(".plot"), view = chart.item.views[chart.view], W = Math.max(200, box.clientWidth), reserve = W < 480 ? chart.reserve || 0 : 0, H = (W < 480 ? 300 : 340) + reserve;
  var lines = view.lines.map(function (l) { return { name: l.name, data: lineData(l) }; }), first = Infinity, end = -Infinity;
  lines.forEach(function (l) { l.data.forEach(function (p) { var t = periodTime(p[0]); first = Math.min(first, t); end = Math.max(end, t); }); });
  var start = chart.range ? Math.max(first, end - chart.range) : first;
  lines.forEach(function (l) { l.shown = l.data.filter(function (p) { return periodTime(p[0]) >= start; }); });
  var vals = [];
  lines.forEach(function (l) { l.shown.forEach(function (p) { vals.push(p[1]); }); });
  var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), axis = niceTicks(lo, hi);
  lo = axis.ticks[0]; hi = axis.ticks[axis.ticks.length - 1];
  var labelDec = axis.step < 0.1 ? 2 : axis.step < 1 ? 1 : 0;
  if (view.dec === 3) labelDec = 3;
  var left = 14 + Math.max.apply(null, axis.ticks.map(function (t) { return num(t, labelDec).length; })) * 7, right = lines.length > 1 && W >= 560 ? 130 : 18, top = 14 + reserve, bottom = 26;
  var X = function (t) { return left + (end === start ? 0.5 : (t - start) / (end - start)) * (W - left - right); };
  var Y = function (v) { return H - bottom - (v - lo) / ((hi - lo) || 1) * (H - top - bottom); };
  var svg = '<svg width="' + W + '" height="' + H + '" role="img" aria-label="' + esc(chartSummary(chart.item, view, lines)) + '">';
  axis.ticks.forEach(function (t) {
    svg += '<line x1="' + left + '" x2="' + (W - right) + '" y1="' + Y(t) + '" y2="' + Y(t) + '" stroke="' + (t === 0 ? "var(--tile-c)" : "var(--tile-track)") + '"/><text x="' + (left - 8) + '" y="' + (Y(t) + 4) + '" text-anchor="end">' + num(t, labelDec) + "</text>";
  });
  var yrs = end - start, stepY = yrs > 40 ? 10 : yrs > 20 ? 5 : yrs > 8 ? 2 : 1, y0 = Math.ceil(start / stepY) * stepY;
  var plotW = W - left - right;
  [1, 2, 5, 10, 20, 50].forEach(function (s) { if (s > stepY && yrs / stepY * 42 > plotW) { stepY = s; y0 = Math.ceil(start / s) * s; } });
  for (var y = y0; y <= end + 0.001; y += stepY) svg += '<text x="' + X(y) + '" y="' + (H - 8) + '" text-anchor="middle">' + y + "</text>";
  var labels = [];
  lines.forEach(function (l, n) {
    var d = "", prevT = null;
    l.shown.forEach(function (p) {
      var t = periodTime(p[0]);
      d += (prevT === null || t - prevT > 1.01 ? "M" : "L") + X(t).toFixed(1) + " " + Y(p[1]).toFixed(1);
      prevT = t;
    });
    svg += '<path d="' + d + '" fill="none" stroke="' + COLORS[n] + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    if (l.shown.length <= 16) l.shown.forEach(function (p) { svg += '<circle cx="' + X(periodTime(p[0])) + '" cy="' + Y(p[1]) + '" r="4" fill="' + COLORS[n] + '" stroke="var(--tile)" stroke-width="2"/>'; });
    var last = l.shown[l.shown.length - 1];
    if (last) {
      svg += '<circle cx="' + X(periodTime(last[0])) + '" cy="' + Y(last[1]) + '" r="4" fill="' + COLORS[n] + '" stroke="var(--tile)" stroke-width="2"/>';
      if (lines.length > 1 && right > 20) labels.push({ x: X(periodTime(last[0])) + 10, y: Y(last[1]) + 4, name: l.name });
    }
  });
  labels.sort(function (a, b) { return a.y - b.y; }).forEach(function (t, n) {
    if (n && t.y - labels[n - 1].y < 15) t.y = labels[n - 1].y + 15;
    svg += '<text class="strong" x="' + t.x + '" y="' + t.y + '">' + esc(t.name) + "</text>";
  });
  var shownPeriods = {};
  lines.forEach(function (l) { l.shown.forEach(function (p) { shownPeriods[p[0]] = 1; }); });
  chart.pick = (chart.pick || []).filter(function (p) { return shownPeriods[p]; });
  if (chart.pick.length === 2) {
    var xa = X(periodTime(chart.pick[0])), xb = X(periodTime(chart.pick[1]));
    svg += '<rect class="pick-band" x="' + Math.min(xa, xb) + '" y="' + top + '" width="' + Math.abs(xb - xa) + '" height="' + (H - top - bottom) + '"/>';
  }
  chart.pick.forEach(function (p) {
    var x = X(periodTime(p));
    svg += '<line class="pick-line" x1="' + x + '" x2="' + x + '" y1="' + top + '" y2="' + (H - bottom) + '"/>';
    lines.forEach(function (l) { l.shown.forEach(function (q) { if (q[0] === p) svg += '<circle class="pick-dot" cx="' + x + '" cy="' + Y(q[1]) + '" r="6"/>'; }); });
  });
  svg += '<line class="cross" x1="0" x2="0" y1="' + top + '" y2="' + (H - bottom) + '" stroke="var(--tile-muted)" visibility="hidden"/></svg>';
  box.innerHTML = svg + '<div class="tt" hidden></div>';
  chart.geo = { X: X, Y: Y, left: left, right: W - right, top: top, base: H - bottom, lines: lines, start: start, end: end, W: W };
  drawPicked();
  var toCmp = chart.el.querySelector(".to-compare"), cmpKey = chart.item.key + "." + chart.view + ".0";
  cmpCatalog();
  toCmp.hidden = !cmpByKey[cmpKey];
  if (cmpByKey[cmpKey]) toCmp.setAttribute("href", "#comparer=" + cmpKey + (cmpIsMoney(cmpByKey[cmpKey]) ? "&prix=1" : ""));
  var legend = chart.el.querySelector(".chart-legend");
  legend.innerHTML = lines.length > 1 ? lines.map(function (l, n) { return '<span style="--dot:' + COLORS[n] + '">' + esc(l.name) + "</span>"; }).join("") : "";
  var rowsEl = chart.el.querySelector(".chart-table");
  var periods = {};
  lines.forEach(function (l) { l.shown.forEach(function (p) { periods[p[0]] = 1; }); });
  var list = Object.keys(periods).sort(function (a, b) { return periodTime(b) - periodTime(a); });
  rowsEl.innerHTML = "<thead><tr><th scope=\"col\">Période</th>" + lines.map(function (l) { return '<th scope="col">' + esc(l.name) + "</th>"; }).join("") + "</tr></thead><tbody>" +
    list.map(function (p) {
      return "<tr><td>" + periodLabel(p) + "</td>" + lines.map(function (l) { var f = l.shown.filter(function (q) { return q[0] === p; })[0]; return "<td>" + (f ? nb(withUnit(f[1], view.unit, view.dec)) : "–") + "</td>"; }).join("") + "</tr>";
    }).join("") + "</tbody>";
}
function plotX(e) { return e.clientX - chart.el.querySelector(".plot").getBoundingClientRect().left; }
function chartMove(e) {
  if (!chart || !chart.geo) return;
  var p = nearestPeriod(plotX(e));
  if (p) showCursor(p); else hideCursor();
}
function hideCursor() {
  var box = chart.el.querySelector(".plot"), c = box.querySelector(".cross"), tt = box.querySelector(".tt");
  if (c) c.setAttribute("visibility", "hidden");
  if (tt) tt.hidden = true;
}
function showCursor(period) {
  var box = chart.el.querySelector(".plot"), g = chart.geo, cross = box.querySelector(".cross"), tt = box.querySelector(".tt");
  chart.cursor = period;
  var view = chart.item.views[chart.view], x = g.X(periodTime(period));
  cross.setAttribute("x1", x); cross.setAttribute("x2", x); cross.setAttribute("visibility", "visible");
  tt.hidden = false;
  tt.innerHTML = "<b>" + periodLabel(period) + "</b>" + g.lines.map(function (l) {
    var f = l.shown.filter(function (q) { return q[0] === period; })[0];
    return f ? "<span>" + (g.lines.length > 1 ? esc(l.name) + " : " : "") + nb(withUnit(f[1], view.unit, view.dec)) + "</span>" : "";
  }).join("");
  var w = tt.offsetWidth;
  tt.style.left = Math.max(0, Math.min(x + 12, g.W - w)) + "px";
  tt.style.top = "8px";
}
function chartKey(e) {
  if (!chart || !chart.geo) return;
  var seen = {};
  chart.geo.lines.forEach(function (l) { l.shown.forEach(function (p) { seen[p[0]] = 1; }); });
  var list = Object.keys(seen).sort(function (a, b) { return periodTime(a) - periodTime(b); }), n = list.indexOf(chart.cursor);
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
    n = n < 0 ? list.length - 1 : Math.max(0, Math.min(list.length - 1, n + (e.key === "ArrowLeft" ? -1 : 1)));
    showCursor(list[n]);
  } else if ((e.key === "Enter" || e.key === " ") && chart.cursor) {
    e.preventDefault();
    pickPeriod(chart.cursor);
    chart.el.querySelector(".plot").focus();
  }
}

var RANGES = [[5, "5 ans"], [10, "10 ans"], [20, "20 ans"], [0, "Tout"]];
function closeChart() {
  if (!chart) return;
  var t = chart.tile;
  t.classList.remove("open");
  var b = t.querySelector(".more");
  if (b) { b.setAttribute("aria-expanded", "false"); b.firstChild.textContent = "Historique "; }
  var back = t.querySelector(".back"); if (back) back.remove();
  chart.el.remove();
  chart = null;
}
// Le bouton de retour reste visible sous les onglets quand on descend dans le graphique.
function placeBack() {
  var back = chart && chart.tile.querySelector(".back"), tabs = document.querySelector(".tabs");
  if (!back) return;
  back.style.top = (getComputedStyle(tabs).position === "sticky" ? tabs.offsetHeight + 16 : 8) + "px";
}
function backToFigures() {
  if (!chart) return;
  var t = chart.tile, more = t.querySelector(".more");
  closeChart();
  t.scrollIntoView({ block: "center" });
  motion(t, POP, { duration: 280 });
  if (more) more.focus({ preventScroll: true });
}
function openChart(t) {
  var i = itemByKey(t.dataset.key);
  closeChart();
  t.classList.add("open");
  var moreBtn = t.querySelector(".more");
  moreBtn.setAttribute("aria-expanded", "true");
  moreBtn.firstChild.textContent = "Fermer ";
  t.insertAdjacentHTML("afterbegin", '<button type="button" class="back" data-back><svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg>Retour aux chiffres</button>');
  var hasApi = i.views.some(function (v) { return v.lines.some(function (l) { return l.id && l.id.indexOf("ES_") !== 0; }); });
  var el = document.createElement("div");
  el.className = "history";
  var span = 0;
  i.views[0].lines.forEach(function (l) { var d = lineData(l); if (d.length) span = Math.max(span, periodTime(d[d.length - 1][0]) - periodTime(d[0][0])); });
  el.innerHTML = '<div class="chart-bar"><div class="seg" data-group="view">' + i.views.map(function (v, n) { return '<button type="button" data-view="' + n + '" aria-pressed="' + (n === 0) + '">' + esc(v.label) + "</button>"; }).join("") + "</div>" +
    '<div class="seg" data-group="range">' + RANGES.filter(function (r) { return !r[0] || r[0] < span; }).map(function (r) { return '<button type="button" data-range="' + r[0] + '" aria-pressed="' + (r[0] === 0) + '">' + r[1] + "</button>"; }).join("") + "</div></div>" +
    '<div class="picked" aria-live="polite"></div><div class="plot" tabindex="0" aria-label="Graphique. Flèches gauche et droite pour parcourir, Entrée pour choisir un point à comparer."></div><div class="legend chart-legend"></div>' +
    '<a class="to-compare" href="#comparer">Comparer ce chiffre <svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></a>' +
    '<p class="chart-note">' + (i.ds ? "Source : Eurostat, jeu de données " + esc(i.ds) + ". Lu à l'ouverture du site. UE à 27 : Union européenne à 27 pays." : hasApi ? "Source : Insee, BDM, extraction du " + extractedOn + "." : "Source : " + esc(i.o || "Insee") + ", page indiquée sur la tuile. Mise à jour à la main.") + "</p>" +
    '<details class="chart-values"><summary>Voir les valeurs</summary><div class="scroll"><table class="chart-table"></table></div></details>';
  t.appendChild(el);
  chart = { tile: t, el: el, item: i, view: 0, range: 0, pick: [] };
  placeBack();
  el.addEventListener("click", function (e) {
    e.stopPropagation();
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.clear !== undefined) { chart.pick = []; drawChart(); return; }
    var group = b.parentNode;
    Array.prototype.forEach.call(group.children, function (c) { c.setAttribute("aria-pressed", String(c === b)); });
    if (b.dataset.view !== undefined) chart.view = +b.dataset.view;
    if (b.dataset.range !== undefined) chart.range = +b.dataset.range;
    drawChart();
  });
  var plot = el.querySelector(".plot");
  var moveFrame = perFrame(chartMove);
  plot.addEventListener("pointermove", moveFrame);
  plot.addEventListener("pointerdown", chartMove);
  plot.addEventListener("click", function (e) { if (!e.target.closest("button")) pickPeriod(nearestPeriod(plotX(e))); });
  plot.addEventListener("keydown", chartKey);
  plot.addEventListener("pointerleave", function () { moveFrame.cancel(); var c = plot.querySelector(".cross"), tt = plot.querySelector(".tt"); if (c) c.setAttribute("visibility", "hidden"); if (tt) tt.hidden = true; });
  drawChart();
  motion(el, RISE, { duration: 380 });
  motionLines(plot);
  t.scrollIntoView({ block: "nearest" });
  // L'ouverture recharge toute la série pour tenir compte des révisions de l'Insee
  var ids = {};
  i.views.forEach(function (v) { v.lines.forEach(function (l) { if (l.id && l.id.indexOf("ES_") !== 0) ids[l.id] = 1; if (l.of) ids[l.of] = 1; }); });
  if (Object.keys(ids).length) fetchSeries(Object.keys(ids)).then(function () { if (dataDirty && chart && chart.item === i) drawChart(); }, function () {});
}

// --- Comparer : mettre plusieurs chiffres sur la même ligne de départ
var CMP_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"], CMP_MAX = 4, CMP_PRICE = "#767676";
var CMP_PRESETS = [
  { t: "Retraites, Smic et prix", ids: ["pension.0.0", "smic.0.0"], de: "2015", prix: 1 },
  { t: "Logement et prix", ids: ["logement.1.0"], de: "2015", prix: 1 },
  { t: "Dette et richesse produite", ids: ["dette.0.0", "pib.0.0"], de: "2000" },
  { t: "Gazole, baguette et prix", ids: ["gazole.0.0", "baguette.0.0"], de: "2010", prix: 1 },
  { t: "Naissances et décès", ids: ["naissances.0.0", "deces.0.0"], de: "2005" },
  { t: "Dette : France et Europe", ids: ["esdette.0.0", "esdette.0.1"], de: "2005" },
  { t: "Chômage : France et Europe", ids: ["eschom.0.0", "eschom.0.1"], de: "2005" },
  { t: "Électricité : France et Europe", ids: ["eselec.0.0", "eselec.0.1"], de: "2010" },
  { t: "Médecins et population", ids: ["medecins.0.0", "population.0.0"], de: "2012" }
];
var dataDirty = false;
var cmp = { ids: [], slots: {}, de: null, a: null, mode: "index", real: false, prix: false, view: "evolution", dated: [], dreal: false, started: false, animate: true, cursor: null, result: null };
var cmpList = null, cmpByKey = {}, cmpAnnual = {};
function cmpCatalog() {
  if (cmpList) return cmpList;
  cmpList = [];
  var seen = {};
  Object.keys(THEMES).forEach(function (theme) {
    THEMES[theme].items.forEach(function (item) {
      (item.views || []).forEach(function (view, v) {
        view.lines.forEach(function (line, n) {
          var sig = line.id ? line.id + "|" + (line.tf || "") + "|" + (line.of || "") : "h" + item.key + v + n;
          if (seen[sig]) return;
          seen[sig] = 1;
          var name = item.n;
          var inName = words(line.name).every(function (w) { return words(item.n).indexOf(w) >= 0; });
          if (view.lines.length > 1 && !inName) name += " : " + line.name;
          else if (item.views.length > 1 && v > 0) name += " (" + view.label.toLowerCase() + ")";
          name = name.replace(", comparaison européenne", "").replace(", série longue", "");
          var e = { key: item.key + "." + v + "." + n, item: item, theme: theme, line: line, unit: view.unit, dec: view.dec, n: name, index: { name: words(name), related: words((RELATED[item.key] || "") + " " + (GROUP_OF[item.key] || "")), themeWords: words(THEMES[theme].title), text: [] } };
          if (cmpYears(e).length >= 3) { cmpList.push(e); cmpByKey[e.key] = e; }
        });
      });
    });
  });
  return cmpList;
}
// Chaque chiffre est ramené à la moyenne de l'année. Une année incomplète n'est pas comptée.
function cmpValues(e) {
  if (cmpAnnual[e.key]) return cmpAnnual[e.key];
  var sum = {}, count = {}, need = {}, out = {};
  lineData(e.line).forEach(function (p) {
    var y = p[0].slice(0, 4), m = /-(Q|S|B)?\d+$/.exec(p[0]);
    sum[y] = (sum[y] || 0) + p[1];
    count[y] = (count[y] || 0) + 1;
    need[y] = !m ? 1 : m[1] === "Q" ? 4 : m[1] === "S" ? 2 : m[1] === "B" ? 6 : 12;
  });
  Object.keys(sum).forEach(function (y) { if (count[y] === need[y]) out[y] = sum[y] / count[y]; });
  cmpAnnual[e.key] = out;
  return out;
}
function cmpYears(e) { return Object.keys(cmpValues(e)).sort(); }
function cmpPriceOf(y) { var v = priceYear(y); return v > 0 ? v : undefined; }
function cmpShort(s) { return s.length > 22 ? s.slice(0, 21).trim() + "…" : s; }
function cmpIsMoney(e) { return /€/.test(e.unit); }
function cmpSlot(id) {
  if (cmp.slots[id] === undefined) {
    var used = cmp.ids.map(function (k) { return cmp.slots[k]; });
    for (var n = 0; n < CMP_MAX; n++) if (used.indexOf(n) < 0) { cmp.slots[id] = n; break; }
  }
  return cmp.slots[id];
}
function cmpCompute() {
  cmpCatalog();
  var sel = cmp.ids.map(function (k) { return cmpByKey[k]; }).filter(Boolean), r = { sel: sel, series: [], dropped: [], years: [] };
  if (!sel.length) return r;
  r.allRate = sel.every(function (e) { return e.unit === "%"; });
  r.sameUnit = sel.every(function (e) { return e.unit === sel[0].unit; });
  r.anyMoney = sel.some(cmpIsMoney);
  r.mode = r.allRate ? "values" : (cmp.mode === "values" && r.sameUnit ? "values" : "index");
  r.real = cmp.real && r.anyMoney;
  r.prix = cmp.prix && r.mode === "index" && !r.real;
  var usable = sel.map(function (e) {
    var vals = {}, src = cmpValues(e);
    Object.keys(src).forEach(function (y) {
      if (r.real && cmpIsMoney(e)) { if (cmpPriceOf(y)) vals[y] = src[y] / cmpPriceOf(y); }
      else vals[y] = src[y];
    });
    return { e: e, vals: vals };
  });
  if (r.mode === "index") {
    usable = usable.filter(function (u) {
      var ok = Object.keys(u.vals).every(function (y) { return u.vals[y] > 0; });
      if (!ok) r.dropped.push(u.e);
      return ok;
    });
  }
  if (!usable.length) return r;
  var years = Object.keys(usable[0].vals);
  usable.slice(1).forEach(function (u) { years = years.filter(function (y) { return u.vals[y] !== undefined; }); });
  if (r.prix || r.real) years = years.filter(cmpPriceOf);
  years.sort();
  r.years = years;
  if (years.length < 2) return r;
  var last = years[years.length - 1];
  var to = years.indexOf(cmp.a) >= 0 ? cmp.a : last;
  var from = years.indexOf(cmp.de) >= 0 ? cmp.de : null;
  if (!from && cmp.de) years.forEach(function (y) { if (!from && y >= cmp.de) from = y; });
  if (!from || from === last) from = from === last ? years[years.length - 2] : years[0];
  if (from >= to) { if (to === years[0]) to = years[1]; from = years[years.indexOf(to) - 1]; }
  r.from = from; r.to = to;
  r.shown = years.filter(function (y) { return y >= from && y <= to; });
  r.series = usable.map(function (u) {
    var e = u.e, realise = r.real && cmpIsMoney(e), scale = realise ? cmpPriceOf(to) : 1;
    var a = u.vals[from] * scale, b = u.vals[to] * scale, rate = e.unit === "%", pos = a > 0 && b > 0;
    return { key: e.key, n: e.n, e: e, unit: e.unit, dec: e.dec, rate: rate, a: a, b: b, color: CMP_COLORS[cmpSlot(e.key)], realise: realise,
      pct: pos ? (b / a - 1) * 100 : null, mult: pos ? b / a : null, diff: b - a,
      pts: r.shown.map(function (y) { var v = u.vals[y] * scale; return [+y, r.mode === "index" ? v / a * 100 : v, v]; }) };
  });
  if (r.prix) {
    var pa = cmpPriceOf(from), pb = cmpPriceOf(to);
    r.series.push({ key: "prix", n: "Prix à la consommation", unit: "", dec: 1, a: pa, b: pb, color: CMP_PRICE, ref: 1, pct: (pb / pa - 1) * 100, mult: pb / pa, diff: pb - pa,
      pts: r.shown.map(function (y) { return [+y, cmpPriceOf(y) / pa * 100, cmpPriceOf(y)]; }) });
  }
  var score = function (s) { return r.mode === "values" && s.rate ? s.diff : s.pct === null ? -Infinity : s.pct; };
  r.rank = r.series.slice().sort(function (x, y) { return score(y) - score(x); });
  r.score = score;
  return r;
}
function cmpGain(s, r) {
  if (r.mode === "values" && s.rate) { var p = Math.abs(s.diff) < .05 ? 0 : s.diff; return signed(p, 1) + " point" + (Math.abs(p) >= 1.95 ? "s" : ""); }
  return s.pct === null ? "–" : signed(s.pct, 1) + " %";
}
function cmpArticle(n) { return n.charAt(0).toUpperCase() + n.slice(1); }
function cmpVerdict(r) {
  if (!r.series || !r.series.length || !r.rank) return "";
  var top = r.rank[0], low = r.rank[r.rank.length - 1], span = "De " + r.from + " à " + r.to;
  if (r.rank.length === 1) return '<p class="cmp-big">' + nb(top.n) + " : <b>" + nb(cmpGain(top, r)) + "</b></p><p>" + span + (top.mult && !top.rate ? ", soit une valeur multipliée par " + nb(num(top.mult, 2)) : "") + ".</p>";
  var verb = r.score(top) > 0 ? "a le plus augmenté" : "a le moins baissé", sub = span + ". ";
  var gap = r.score(top) - r.score(low);
  if (isFinite(gap)) sub += "L'écart avec " + nb(low.n) + " (" + nb(cmpGain(low, r)) + ") est de " + nb(num(gap, 1)) + " point" + (gap >= 2 ? "s" : "") + ".";
  return '<p class="cmp-big">' + nb(top.n) + " " + verb + "&nbsp;: <b>" + nb(cmpGain(top, r)) + "</b></p><p>" + sub + "</p>";
}
function cmpRankHtml(r) {
  if (!r.rank) return "";
  var scores = r.rank.map(r.score).filter(isFinite), hi = Math.max.apply(null, scores.concat(0)), lo = Math.min.apply(null, scores.concat(0)), span = (hi - lo) || 1;
  return r.rank.map(function (s, n) {
    var v = r.score(s), start = isFinite(v) ? (Math.min(v, 0) - lo) / span * 100 : 0, width = isFinite(v) ? Math.max(Math.abs(v) / span * 100, .6) : 0, u = s.unit;
    var from = s.ref ? "Base 100 en " + r.from + " → " + nb(num(s.b / s.a * 100, 1)) : nb(withUnit(s.a, u, s.dec)) + " → " + nb(withUnit(s.b, u, s.dec));
    var meta = s.ref ? [] : [s.rate ? (r.mode === "values" ? "" : signed(s.diff, 1) + " point" + (Math.abs(s.diff) >= 2 ? "s" : "")) : "Écart " + signed(s.diff, s.dec) + (u ? " " + u : "")];
    if (s.mult && !s.rate) meta.push("× " + num(s.mult, 2));
    return '<li><span class="cmp-rank">' + (n + 1) + '</span><div class="cmp-rank-body"><div class="cmp-rank-top"><span class="cmp-rank-name"><i class="cmp-dot' + (s.ref ? " ref" : "") + '" style="--dot:' + s.color + '"></i>' + esc(s.n) + "</span><b>" + nb(cmpGain(s, r)) + '</b></div><div class="cmp-bar"><i style="left:' + start.toFixed(1) + "%;width:" + width.toFixed(1) + "%;background:" + s.color + '"></i></div><p>' + from + (s.realise ? " (euros de " + r.to + ")" : "") + "</p>" + (meta.filter(Boolean).length ? "<p>" + nb(meta.filter(Boolean).join(" · ")) + "</p>" : "") + "</div></li>";
  }).join("");
}
function cmpDraw() {
  var r = cmp.result, box = document.getElementById("cmp-plot");
  if (!box) return;
  if (!r || !r.series.length) { box.innerHTML = ""; return; }
  var W = Math.max(260, box.clientWidth), H = W < 480 ? 290 : 400, vals = [];
  r.series.forEach(function (s) { s.pts.forEach(function (p) { vals.push(p[1]); }); });
  if (r.mode === "index") vals.push(100);
  var axis = niceTicks(Math.min.apply(null, vals), Math.max.apply(null, vals)), lo = axis.ticks[0], hi = axis.ticks[axis.ticks.length - 1];
  var labelDec = axis.step < .1 ? 2 : axis.step < 1 ? 1 : 0, labels = W >= 640;
  var left = 14 + Math.max.apply(null, axis.ticks.map(function (t) { return num(t, labelDec).length; })) * 7, right = labels ? 170 : 16, top = 14, bottom = 26;
  var y0 = +r.from, y1 = +r.to;
  var X = function (y) { return left + (y - y0) / ((y1 - y0) || 1) * (W - left - right); }, Y = function (v) { return H - bottom - (v - lo) / ((hi - lo) || 1) * (H - top - bottom); };
  var svg = '<svg width="' + W + '" height="' + H + '" role="img" aria-label="' + esc(r.rank.map(function (s) { return s.n + " : " + cmpGain(s, r); }).join(". ")) + '">';
  axis.ticks.forEach(function (t) { svg += '<line x1="' + left + '" x2="' + (W - right) + '" y1="' + Y(t) + '" y2="' + Y(t) + '" stroke="var(--tile-track)"/><text x="' + (left - 8) + '" y="' + (Y(t) + 4) + '" text-anchor="end">' + num(t, labelDec) + "</text>"; });
  if (r.mode === "index") svg += '<line x1="' + left + '" x2="' + (W - right) + '" y1="' + Y(100) + '" y2="' + Y(100) + '" stroke="var(--ink)" stroke-width="1"/>';
  var span = y1 - y0, step = 1;
  [1, 2, 5, 10, 20, 50].forEach(function (s) { if (step === 1 && span / s * 42 <= W - left - right) step = s; else if (step !== 1 && s < step) step = s; });
  step = [1, 2, 5, 10, 20, 50].filter(function (s) { return span / s * 42 <= W - left - right; })[0] || 50;
  for (var y = Math.ceil(y0 / step) * step; y <= y1; y += step) svg += '<text x="' + X(y) + '" y="' + (H - 8) + '" text-anchor="middle">' + y + "</text>";
  var ends = [];
  r.series.forEach(function (s) {
    var d = s.pts.map(function (p, n) { return (n ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1); }).join("");
    svg += s.ref ? '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="2" stroke-dasharray="5 5"/>'
      : '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
    var p = s.pts[s.pts.length - 1];
    svg += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="4" fill="' + s.color + '" stroke="var(--tile)" stroke-width="2"/>';
    ends.push({ y: Y(p[1]) + 4, t: cmpShort(s.n), full: s.n, g: cmpGain(s, r) });
  });
  if (labels) {
    ends.sort(function (a, b) { return a.y - b.y; });
    ends.forEach(function (t, n) { if (n && t.y - ends[n - 1].y < 30) t.y = ends[n - 1].y + 30; });
    var over = ends.length ? ends[ends.length - 1].y + 14 - (H - bottom) : 0;
    if (over > 0) ends.forEach(function (t) { t.y -= over; });
    ends.forEach(function (t) { svg += '<text class="strong" x="' + (W - right + 10) + '" y="' + t.y + '"><title>' + esc(t.full) + "</title>" + esc(t.t) + '</text><text x="' + (W - right + 10) + '" y="' + (t.y + 14) + '">' + nb(t.g).replace(/&nbsp;/g, " ") + "</text>"; });
  }
  svg += '<g class="cmp-cursor" visibility="hidden"><line y1="' + top + '" y2="' + (H - bottom) + '" stroke="var(--tile-muted)"/>' + r.series.map(function (s) { return '<circle r="5" fill="' + s.color + '" stroke="var(--tile)" stroke-width="2"/>'; }).join("") + "</g></svg>";
  box.innerHTML = svg + '<div class="tt" hidden></div>';
  r.geo = { X: X, Y: Y, W: W, left: left, right: W - right };
  if (cmp.animate) motionLines(box);
  cmp.animate = false;
}
function cmpShow(year) {
  var r = cmp.result, box = document.getElementById("cmp-plot");
  if (!r || !r.geo) return;
  var g = box.querySelector(".cmp-cursor"), tt = box.querySelector(".tt"), x = r.geo.X(year);
  cmp.cursor = year;
  g.setAttribute("visibility", "visible");
  g.querySelector("line").setAttribute("x1", x); g.querySelector("line").setAttribute("x2", x);
  var dots = g.querySelectorAll("circle"), rows = [];
  r.series.forEach(function (s, n) {
    var p = s.pts.filter(function (q) { return q[0] === year; })[0];
    if (!p) { dots[n].setAttribute("visibility", "hidden"); return; }
    dots[n].setAttribute("visibility", "visible"); dots[n].setAttribute("cx", x); dots[n].setAttribute("cy", r.geo.Y(p[1]));
    rows.push({ v: p[1], h: '<span><i class="cmp-dot' + (s.ref ? " ref" : "") + '" style="--dot:' + s.color + '"></i>' + esc(cmpShort(s.n)) + " : " + nb(r.mode === "index" ? num(p[1], 1) : withUnit(p[1], s.unit, s.dec)) + "</span>" });
  });
  rows.sort(function (a, b) { return b.v - a.v; });
  tt.innerHTML = "<b>" + year + "</b>" + rows.map(function (o) { return o.h; }).join("");
  tt.hidden = false;
  tt.style.top = "8px";
  tt.style.left = Math.max(0, Math.min(x + 12, r.geo.W - tt.offsetWidth)) + "px";
}
function cmpHide() {
  var box = document.getElementById("cmp-plot"), g = box.querySelector(".cmp-cursor"), tt = box.querySelector(".tt");
  if (g) g.setAttribute("visibility", "hidden");
  if (tt) tt.hidden = true;
}
function cmpTable(r) {
  if (!r.series.length || !r.shown) return "";
  return '<thead><tr><th scope="col">Année</th>' + r.series.map(function (s) { return '<th scope="col">' + esc(s.n) + "</th>"; }).join("") + "</tr></thead><tbody>" + r.shown.slice().reverse().map(function (y) {
    return "<tr><td>" + y + "</td>" + r.series.map(function (s) { var p = s.pts.filter(function (q) { return q[0] === +y; })[0]; return "<td>" + (p ? nb(s.ref ? num(p[1], 1) : withUnit(p[2], s.unit, s.dec)) : "–") + "</td>"; }).join("") + "</tr>";
  }).join("") + "</tbody>";
}
function cmpHash() {
  if (cmp.view === "dates") return "#comparer=" + cmp.dated.map(function (d) { return d.key + "@" + d.p; }).join(",") + "&vue=dates" + (cmp.dreal ? "&reel=1" : "");
  if (!cmp.ids.length) return "#comparer";
  var h = "#comparer=" + cmp.ids.join(",");
  if (cmp.result && cmp.result.from) h += "&de=" + cmp.result.from + "&a=" + cmp.result.to;
  if (cmp.prix) h += "&prix=1";
  if (cmp.real) h += "&reel=1";
  if (cmp.mode === "values") h += "&val=1";
  return h;
}
function cmpReadHash(name) {
  var m = /^comparer=([^&]*)(.*)$/.exec(name);
  if (!m) return false;
  cmpCatalog();
  var get = function (k) { var x = new RegExp("&" + k + "=([^&]*)").exec(m[2]); return x ? x[1] : null; };
  if (get("vue") === "dates") {
    cmp.view = "dates"; cmp.dated = []; cmp.dreal = !!get("reel");
    m[1].split(",").forEach(function (x) { var s = x.split("@"); if (cmpByKey[s[0]] && cmp.dated.length < CMP_MAX) dtAdd(s[0], s[1]); });
    if (cmp.started) cmpPresets();
    return true;
  }
  cmp.view = "evolution";
  if (cmp.started) cmpPresets();
  cmp.ids = []; cmp.slots = {};
  m[1].split(",").forEach(function (k) { if (cmpByKey[k] && cmp.ids.length < CMP_MAX && cmp.ids.indexOf(k) < 0) { cmp.ids.push(k); cmpSlot(k); } });
  cmp.de = get("de"); cmp.a = get("a"); cmp.prix = !!get("prix"); cmp.real = !!get("reel"); cmp.mode = get("val") ? "values" : "index";
  cmp.animate = true;
  return true;
}
function cmpApplyPreset(p) {
  cmp.ids = []; cmp.slots = {};
  cmpCatalog();
  p.ids.forEach(function (k) { if (cmpByKey[k]) { cmp.ids.push(k); cmpSlot(k); } });
  cmp.de = p.de; cmp.a = null; cmp.prix = !!p.prix; cmp.real = false; cmp.mode = "index"; cmp.animate = true;
}
// Comparer les chiffres eux-mêmes : chacun à la date qu'on choisit
var CMP_DATED = [
  { t: "Pension de 2015 et Smic net de 2023", pts: [["pension.0.0", "2015"], ["smicnet.0.0", "2023"]] },
  { t: "Smic net : 2010 et aujourd'hui", pts: [["smicnet.0.0", "2010"], ["smicnet.0.0", "last"]] },
  { t: "Baguette : 2010 et aujourd'hui", pts: [["baguette.0.0", "2010"], ["baguette.0.0", "last"]] },
  { t: "Gazole : 2010 et aujourd'hui", pts: [["gazole.0.0", "2010"], ["gazole.0.0", "last"]] },
  { t: "Dette : 2000 et aujourd'hui", pts: [["dette.0.0", "2000"], ["dette.0.0", "last"]] },
  { t: "Population : 1990 et aujourd'hui", pts: [["population.0.0", "1990"], ["population.0.0", "last"]] }
];
function dtPeriods(e) { return lineData(e.line).map(function (p) { return p[0]; }); }
function dtResolve(e, want) {
  var list = dtPeriods(e), last = list[list.length - 1];
  if (!want || want === "last") return last;
  if (list.indexOf(want) >= 0) return want;
  var year = list.filter(function (p) { return p.slice(0, 4) === String(want).slice(0, 4); });
  if (year.length) return year[year.length - 1];
  return list.filter(function (p) { return p >= want; })[0] || last;
}
function dtFine(e) { return dtPeriods(e).some(function (p) { return p.length > 4; }); }
// À l'année, tout est comparable : un chiffre mensuel ou trimestriel devient sa moyenne de l'année.
function dtNorm(d, e) {
  if (d.p === dtResolve(e, "last")) return;
  var ys = cmpYears(e), y = d.p.slice(0, 4);
  if (ys.indexOf(y) >= 0) { d.p = y; return; }
  var before = ys.filter(function (x) { return x <= y; });
  d.p = before.length ? before[before.length - 1] : ys[0];
}
function dtValue(d, e) {
  var v = cmpValues(e)[d.p];
  if (v !== undefined) return v;
  var raw = lineData(e.line).filter(function (q) { return q[0] === d.p; })[0];
  return raw ? raw[1] : NaN;
}
function dtOptions(e) {
  var last = dtResolve(e, "last"), years = cmpYears(e).slice().reverse(), list = [], fine = dtFine(e);
  if (last.length > 4) list.push({ p: last, t: periodLabel(last) + " (dernier chiffre)" });
  years.forEach(function (y) { list.push({ p: y, t: y + (fine ? " (moyenne)" : "") }); });
  if (!list.some(function (o) { return o.p === last; })) list.unshift({ p: last, t: last });
  return list;
}
function dtAdd(key, want) {
  var used = cmp.dated.map(function (d) { return d.slot; }), slot = 0;
  while (used.indexOf(slot) >= 0) slot++;
  cmp.dated.push({ key: key, p: dtResolve(cmpByKey[key], want), slot: slot });
}
function dtPreset(n) { cmp.dated = []; cmpCatalog(); CMP_DATED[n].pts.forEach(function (x) { if (cmpByKey[x[0]]) dtAdd(x[0], x[1]); }); }
function dtBasis(e) {
  var u = e.item.u;
  return u && u !== e.unit && u !== PCT && u !== "M" && u !== "Md €" && !/^\d/.test(u) ? u : e.item.views[0] === e.item.views[e.key.split(".")[1]] && e.item.views.length === 1 ? e.item.views[0].label : e.item.views[e.key.split(".")[1]].label;
}
function dtCoef(p) {
  var d = DATA[PRICE_ID] || [], last = d.length ? d[d.length - 1] : null;
  if (!last) return 1;
  return last[1] / (priceYear(p.slice(0, 4)) || last[1]);
}
function updateDated() {
  cmpCatalog();
  var pts = cmp.dated.filter(function (d) { return cmpByKey[d.key]; }).map(function (d) {
    var e = cmpByKey[d.key];
    dtNorm(d, e);
    var real = cmp.dreal && cmpIsMoney(e);
    return { d: d, e: e, v: dtValue(d, e) * (real ? dtCoef(d.p) : 1), color: CMP_COLORS[d.slot], label: e.n.replace(" : France", "") + " (" + periodLabel(d.p).toLowerCase() + ")" };
  });
  var focus = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.dp : null;
  var same = pts.length > 1 && pts.every(function (x) { return x.e.unit === pts[0].e.unit; });
  document.getElementById("cmp-dated").innerHTML = pts.map(function (x, n) {
    var list = dtOptions(x.e), scale = x.d.p.length > 4 ? " · dernier chiffre" : dtFine(x.e) ? " · moyenne de l'année" : "";
    return '<article class="dt-card"><div class="dt-top"><span class="dt-name"><i class="cmp-dot" style="--dot:' + x.color + '"></i>' + esc(x.e.n) + '</span><button type="button" class="pick-clear" data-dremove="' + n + '" aria-label="Retirer ' + esc(x.e.n) + '">×</button></div><p class="dt-basis">' + esc(dtBasis(x.e) + scale) + '</p><label class="dt-date"><span>Date</span><select data-dp="' + n + '">' +
      list.map(function (o) { return '<option value="' + o.p + '"' + (o.p === x.d.p ? " selected" : "") + ">" + esc(o.t) + "</option>"; }).join("") + '</select></label><p class="dt-value">' + nb(withUnit(x.v, x.e.unit, x.e.dec)) + "</p></article>";
  }).join("");
  if (focus !== null && document.querySelector('[data-dp="' + focus + '"]')) document.querySelector('[data-dp="' + focus + '"]').focus();
  var res = document.getElementById("cmp-dresult"), html = "";
  if (pts.length >= 2 && same) {
    var sorted = pts.slice().sort(function (x, y) { return y.v - x.v; }), top = sorted[0], unit = top.e.unit, rate = unit === "%", positive = sorted.every(function (x) { return x.v > 0; });
    var chart = positive ? '<div class="dt-chart" role="img" aria-label="' + esc(sorted.map(function (x) { return x.label + " : " + withUnit(x.v, x.e.unit, x.e.dec); }).join(". ")) + '">' + sorted.map(function (x) {
      var w = x.v / top.v * 100;
      return '<div class="dt-row"><span class="dt-row-name"><i class="cmp-dot" style="--dot:' + x.color + '"></i>' + nb(x.label) + '</span><div class="dt-track"><i style="width:' + w.toFixed(1) + "%;background:" + x.color + '"></i>' + (w < 99.9 ? '<em style="width:' + (100 - w).toFixed(1) + '%"></em>' : "") + '</div><b>' + nb(withUnit(x.v, x.e.unit, x.e.dec)) + "</b></div>";
    }).join("") + "</div>" : "";
    html = chart + sorted.slice(1).map(function (o, n) {
      var round = function (v) { return +v.toFixed(o.e.dec); }, gap = round(round(top.v) - round(o.v)), same = gap === 0;
      if (same) return '<div class="dt-line"><p class="' + (n ? "dt-sub" : "cmp-big") + '">' + nb(top.label) + " et " + nb(o.label) + " sont au même niveau.</p></div>";
      var amount = rate ? num(gap, o.e.dec) + " point" + (gap >= 2 ? "s" : "") : withUnit(gap, unit, o.e.dec);
      var facts = !rate && positive ? [["En pourcentage", "+" + num((top.v / o.v - 1) * 100, 1) + " %"], ["Multiplié par", "× " + num(top.v / o.v, 2)]] : [];
      return '<div class="dt-line"><p class="' + (n ? "dt-sub" : "cmp-big") + '">' + nb(top.label) + " dépasse " + nb(o.label) + " de <b>" + nb(amount) + "</b></p>" + (facts.length ? '<div class="cmp-cells">' + cellsHtml(facts) + "</div>" : "") + "</div>";
    }).join("");
  } else if (pts.length >= 2) {
    html = '<p class="dt-warn">Ces chiffres n\'ont pas la même unité (' + pts.map(function (x) { return x.e.unit || "nombre"; }).filter(function (u, n, l) { return l.indexOf(u) === n; }).join(", ") + "). Ils sont côte à côte, mais un écart n'aurait pas de sens.</p>";
  } else if (pts.length === 1) {
    html = '<p class="dt-warn">Ajoutez un second chiffre, ou le même à une autre date.</p>';
  } else {
    html = '<p class="dt-warn">Ajoutez un premier chiffre, ou partez d\'une idée ci-dessus.</p>';
  }
  res.innerHTML = html;
  motionBars(res);
  var money = pts.some(function (x) { return cmpIsMoney(x.e); }), bt = document.getElementById("cmp-dreal");
  var coefLast = (DATA[PRICE_ID] || [["?"]]).slice(-1)[0][0];
  bt.hidden = !money;
  bt.setAttribute("aria-pressed", String(!!cmp.dreal));
  bt.textContent = "Tout en euros de " + coefLast;
  var notes = [], bases = {};
  if (pts.some(function (x) { return dtFine(x.e); })) notes.push("Une année correspond à la moyenne de ses mois ou trimestres. Seul le dernier chiffre publié est proposé au mois.");
  pts.forEach(function (x) { if (cmpIsMoney(x.e)) bases[dtBasis(x.e).toLowerCase()] = 1; });
  if (same && Object.keys(bases).length > 1) notes.push("Attention : ces montants ne se mesurent pas de la même façon (" + Object.keys(bases).join(", ") + ").");
  if (money && pts.length > 1 && !cmp.dreal && pts.some(function (x) { return x.d.p.slice(0, 4) !== pts[0].d.p.slice(0, 4); })) notes.push("Ces montants sont en euros de leur époque. Pour tenir compte des prix, utilisez « Tout en euros de " + coefLast + " ».");
  if (cmp.dreal && money) notes.push("Montants convertis avec le coefficient de l'Insee, connu jusqu'en " + coefLast + ". Une date plus récente n'est pas convertie.");
  if (pts.some(function (x) { return /^(pension|derive)\./.test(x.e.key); })) notes.push("Pension : montant au 31 décembre, selon la Drees, qui juge fragiles les valeurs de 2018 et 2019.");
  var src = {};
  pts.forEach(function (x) { src[x.e.item.o || "Insee"] = 1; });
  if (cmp.dreal && money) src.Insee = 1;
  if (pts.length) notes.push("Sources : " + Object.keys(src).join(", ") + ".");
  document.getElementById("cmp-dnotes").innerHTML = notes.map(function (n) { return "<p>" + nb(n) + "</p>"; }).join("");
  var input = document.getElementById("cmp-q"), full = cmp.dated.length >= CMP_MAX;
  input.disabled = full;
  input.placeholder = full ? CMP_MAX + " chiffres au maximum" : "Ajouter un chiffre…";
  document.querySelectorAll("#cmp-presets button").forEach(function (b) {
    var p = CMP_DATED[+b.dataset.preset];
    b.setAttribute("aria-pressed", String(!!p && p.pts.length === cmp.dated.length && p.pts.every(function (x, n) { var d = cmp.dated[n], e = cmpByKey[x[0]]; if (!d || !e || d.key !== x[0]) return false; var t = { p: dtResolve(e, x[1]) }; dtNorm(t, e); return d.p === t.p; })));
  });
  cmpSyncHash();
}
function cmpPresets() {
  var list = cmp.view === "dates" ? CMP_DATED : CMP_PRESETS;
  document.getElementById("cmp-presets").innerHTML = list.map(function (p, n) { return '<button type="button" data-preset="' + n + '" aria-pressed="false">' + esc(p.t) + "</button>"; }).join("");
}
function cmpSetView(v) {
  cmp.view = v;
  if (v === "dates" && !cmp.dated.length) {
    cmpCatalog();
    cmp.ids.forEach(function (k) { if (cmp.dated.length < CMP_MAX && cmpByKey[k]) dtAdd(k, "last"); });
  }
  if (v === "evolution") cmp.animate = true;
  cmpPresets();
}
function cmpOptions(list, chosen) {
  return list.map(function (y) { return '<option value="' + y + '"' + (y === chosen ? " selected" : "") + ">" + y + "</option>"; }).join("");
}
function updateCompare() {
  if (!cmp.started) { cmp.started = true; cmpPresets(); }
  var dated = cmp.view === "dates";
  document.querySelectorAll("#cmp-view button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.view === cmp.view)); });
  document.getElementById("cmp-lede").textContent = dated ? "Choisissez une date pour chaque chiffre et voyez la différence entre les valeurs." : "Mettez plusieurs chiffres sur la même ligne de départ et voyez lequel a le plus bougé.";
  document.getElementById("cmp-dwrap").hidden = !dated;
  if (dated) {
    ["cmp-chips", "cmp-controls", "cmp-result", "cmp-empty"].forEach(function (id) { document.getElementById(id).hidden = true; });
    updateDated();
    return;
  }
  document.getElementById("cmp-chips").hidden = false;
  var r = cmp.result = cmpCompute();
  document.getElementById("cmp-chips").innerHTML = r.sel.map(function (e) {
    return '<span class="cmp-chip"><i class="cmp-dot" style="--dot:' + CMP_COLORS[cmpSlot(e.key)] + '"></i>' + esc(e.n) + '<button type="button" data-remove="' + e.key + '" aria-label="Retirer ' + esc(e.n) + '">×</button></span>';
  }).join("");
  var input = document.getElementById("cmp-q"), full = r.sel.length >= CMP_MAX;
  input.disabled = full;
  input.placeholder = full ? CMP_MAX + " chiffres au maximum" : r.sel.length ? "Ajouter un chiffre…" : "Choisissez un chiffre : Smic, dette, loyers…";
  document.querySelectorAll("#cmp-presets button").forEach(function (b) {
    var p = CMP_PRESETS[+b.dataset.preset];
    b.setAttribute("aria-pressed", String(p.ids.join() === cmp.ids.join() && !!p.prix === cmp.prix));
  });
  var ok = r.series.length > 0, last = r.years[r.years.length - 1];
  document.getElementById("cmp-result").hidden = !ok;
  document.getElementById("cmp-controls").hidden = !ok;
  var empty = document.getElementById("cmp-empty");
  if (!ok) {
    empty.hidden = false;
    empty.textContent = !r.sel.length ? "Ajoutez un premier chiffre, ou partez d'une idée ci-dessus." :
      r.dropped.length === r.sel.length ? "Ce chiffre passe par zéro ou sous zéro : on ne peut pas le ramener à une base 100. Essayez-le avec un autre taux." :
      "Ces chiffres n'ont pas assez d'années en commun pour être comparés. Retirez-en un.";
    cmpSyncHash();
    return;
  }
  empty.hidden = true;
  document.getElementById("cmp-de").innerHTML = cmpOptions(r.years.slice(0, -1), r.from);
  document.getElementById("cmp-a").innerHTML = cmpOptions(r.years.slice(1), r.to);
  document.querySelectorAll("#cmp-quick button").forEach(function (b) {
    var n = +b.dataset.years, target = n ? String(+last - n) : r.years[0], pick = null;
    r.years.forEach(function (y) { if (!pick && y >= target) pick = y; });
    b.dataset.from = pick;
    b.hidden = n > 0 && +last - +r.years[0] <= n;
    b.setAttribute("aria-pressed", String(pick === r.from && r.to === last));
  });
  var modes = document.getElementById("cmp-mode");
  modes.hidden = r.allRate || !r.sameUnit;
  modes.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.mode === r.mode)); });
  var tReal = document.getElementById("cmp-real"), tPrix = document.getElementById("cmp-prix");
  tReal.hidden = !r.anyMoney; tReal.setAttribute("aria-pressed", String(r.real));
  tPrix.hidden = r.mode !== "index" || r.real; tPrix.setAttribute("aria-pressed", String(r.prix));
  document.getElementById("cmp-verdict").innerHTML = cmpVerdict(r);
  document.getElementById("cmp-rank").innerHTML = cmpRankHtml(r);
  document.getElementById("cmp-axis").textContent = r.mode === "index" ? "Base 100 en " + r.from + " : tout part de 100. À 120, le chiffre a augmenté de 20 %." : r.sel.length && r.sel[0].unit ? "Valeurs en " + (r.sel[0].unit === "%" ? "pourcentage" : r.sel[0].unit) + (r.real ? ", euros de " + r.to : "") + "." : "Valeurs.";
  document.getElementById("cmp-legend").innerHTML = r.series.length > 1 ? r.series.map(function (s) { return '<span class="' + (s.ref ? "ref" : "") + '" style="--dot:' + s.color + '">' + esc(s.n) + "</span>"; }).join("") : "";
  document.getElementById("cmp-table").innerHTML = cmpTable(r);
  var notes = [];
  if (r.dropped.length) notes.push(r.dropped.map(function (e) { return e.n; }).join(", ") + " : passe par zéro ou sous zéro, donc absent du calcul en base 100.");
  var ends = r.sel.filter(function (e) { var y = cmpYears(e); return y.length && y[y.length - 1] < r.years[r.years.length - 1]; });
  var stop = r.sel.filter(function (e) { var y = cmpYears(e); return y.length && y[y.length - 1] === r.years[r.years.length - 1]; });
  if (stop.length && stop.length < r.sel.length && r.to === last) notes.push("La comparaison s'arrête en " + last + " : c'est la dernière année connue de " + stop[0].n + ".");
  if (r.sel.some(function (e) { return e.unit === "%"; }) && r.mode === "index") notes.push("Pour un taux, l'évolution est relative : passer de 10 % à 8 % fait −20 %, soit −2 points.");
  if (r.real) notes.push("Inflation retirée : les montants en euros sont exprimés en euros de " + r.to + " (coefficient de l'Insee, connu jusqu'en " + (DATA[PRICE_ID] || [["?"]]).slice(-1)[0][0] + ").");
  if (r.sel.some(function (e) { return /^(pension|derive)\./.test(e.key); })) notes.push("Pension : montant au 31 décembre, selon la Drees, qui juge fragiles les valeurs de 2018 et 2019. Elle change aussi avec le renouvellement des retraités.");
  notes.push("Chaque chiffre est la moyenne de l'année : seules les années complètes comptent. Une moyenne peut changer parce que la population change, pas seulement parce que chaque montant change. Évoluer ensemble ne veut pas dire que l'un explique l'autre.");
  var src = {};
  r.sel.forEach(function (e) { src[e.item.o || "Insee"] = 1; });
  if (r.prix || r.real) src.Insee = 1;
  notes.push("Sources : " + Object.keys(src).join(", ") + ".");
  document.getElementById("cmp-notes").innerHTML = notes.map(function (n) { return "<p>" + nb(n) + "</p>"; }).join("");
  cmpDraw();
  motionBars(document.getElementById("cmp-rank"));
  cmpSyncHash();
}
function cmpSyncHash() {
  if (document.querySelector('[data-panel="comparer"]').hidden) return;
  try { history.replaceState(null, "", cmpHash()); } catch (err) {}
}
function cmpPickerList(query) {
  var list = cmpCatalog().filter(function (e) { return cmp.view === "dates" || cmp.ids.indexOf(e.key) < 0; });
  var all = words(query), tokens = all.filter(function (t) { return !STOP[t]; });
  if (!tokens.length) return list;
  return list.map(function (e, n) {
    var total = 0, okAll = tokens.every(function (t) { var s = tokenScore(t, e.index); total += s; return s > 0; });
    return okAll ? { e: e, s: total, n: n } : null;
  }).filter(Boolean).sort(function (a, b) { return b.s - a.s || a.n - b.n; }).map(function (x) { return x.e; });
}
var cmpFound = [], cmpActive = -1;
function cmpOpenList() {
  var box = document.getElementById("cmp-list"), input = document.getElementById("cmp-q"), q = input.value;
  cmpFound = cmpPickerList(q);
  cmpActive = -1;
  var theme = null, html = "";
  cmpFound.forEach(function (e, n) {
    if (!words(q).length && e.theme !== theme) { theme = e.theme; html += '<p class="cmp-group">' + esc(THEMES[theme].title) + "</p>"; }
    var ys = cmpYears(e);
    html += '<div class="result" id="cmp-r' + n + '" role="option" aria-selected="false" data-n="' + n + '"><span class="result-name">' + esc(e.n) + '</span><span class="result-meta">' + esc(THEMES[e.theme].title) + " · " + ys[0] + "–" + ys[ys.length - 1] + "</span></div>";
  });
  box.innerHTML = html || '<p class="no-result">Aucun chiffre trouvé. Essayez un autre mot.</p>';
  if (box.hidden) motion(box, POP, { duration: 200 });
  box.hidden = false;
  input.setAttribute("aria-expanded", "true");
}
function cmpCloseList() {
  var input = document.getElementById("cmp-q");
  document.getElementById("cmp-list").hidden = true;
  input.setAttribute("aria-expanded", "false");
  input.removeAttribute("aria-activedescendant");
}
function cmpAdd(e) {
  if (cmp.view === "dates") { if (cmp.dated.length < CMP_MAX) dtAdd(e.key, "last"); }
  else {
    if (cmp.ids.length >= CMP_MAX) return;
    cmp.ids.push(e.key); cmpSlot(e.key); cmp.animate = true;
  }
  var input = document.getElementById("cmp-q");
  input.value = "";
  cmpCloseList();
  updateCompare();
  if (!input.disabled) input.focus();
}
function initCompare() {
  var panel = document.querySelector('[data-panel="comparer"]'), input = document.getElementById("cmp-q"), box = document.getElementById("cmp-list"), plot = document.getElementById("cmp-plot");
  panel.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.view) { cmpSetView(b.dataset.view); updateCompare(); motionList(panel.querySelectorAll("#cmp-presets button, .dt-card"), 10); return; }
    if (b.dataset.preset !== undefined) { if (cmp.view === "dates") dtPreset(+b.dataset.preset); else cmpApplyPreset(CMP_PRESETS[+b.dataset.preset]); updateCompare(); return; }
    if (b.dataset.dremove !== undefined) { cmp.dated.splice(+b.dataset.dremove, 1); updateCompare(); input.focus(); return; }
    if (b.id === "cmp-dreal") { cmp.dreal = !cmp.dreal; updateCompare(); return; }
    if (b.dataset.remove) { cmp.ids = cmp.ids.filter(function (k) { return k !== b.dataset.remove; }); delete cmp.slots[b.dataset.remove]; updateCompare(); input.focus(); return; }
    if (b.dataset.from) { cmp.de = b.dataset.from; cmp.a = null; cmp.animate = true; updateCompare(); return; }
    if (b.dataset.mode) { cmp.mode = b.dataset.mode; cmp.animate = true; updateCompare(); return; }
    if (b.id === "cmp-real") { cmp.real = !cmp.real; cmp.animate = true; updateCompare(); return; }
    if (b.id === "cmp-prix") { cmp.prix = !cmp.prix; cmp.animate = true; updateCompare(); return; }
    if (b.id === "cmp-copy" || b.id === "cmp-dcopy") {
      var url = location.href, done = function (t) { b.textContent = t; setTimeout(function () { b.textContent = "Copier le lien"; }, 2000); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { done("Lien copié"); }, function () { done("Copiez l'adresse de la page"); });
      else done("Copiez l'adresse de la page");
    }
  });
  panel.addEventListener("change", function (e) {
    if (e.target.dataset.dp !== undefined) { cmp.dated[+e.target.dataset.dp].p = e.target.value; updateCompare(); return; }
    if (e.target.id === "cmp-de") { cmp.de = e.target.value; cmp.animate = true; updateCompare(); document.getElementById("cmp-de").focus(); }
    if (e.target.id === "cmp-a") { cmp.a = e.target.value; cmp.animate = true; updateCompare(); document.getElementById("cmp-a").focus(); }
  });
  input.addEventListener("click", cmpOpenList);
  input.addEventListener("input", cmpOpenList);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { cmpCloseList(); return; }
    if (box.hidden && e.key === "ArrowDown") { e.preventDefault(); cmpOpenList(); return; }
    if (box.hidden || !cmpFound.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      cmpActive = (cmpActive + (e.key === "ArrowDown" ? 1 : -1) + cmpFound.length) % cmpFound.length;
      box.querySelectorAll(".result").forEach(function (el, n) { el.classList.toggle("on", n === cmpActive); el.setAttribute("aria-selected", String(n === cmpActive)); });
      var on = document.getElementById("cmp-r" + cmpActive);
      if (on) { on.scrollIntoView({ block: "nearest" }); input.setAttribute("aria-activedescendant", on.id); }
    } else if (e.key === "Enter") { e.preventDefault(); cmpAdd(cmpFound[Math.max(cmpActive, 0)]); }
  });
  box.addEventListener("mousedown", function (e) { e.preventDefault(); });
  box.addEventListener("click", function (e) { var o = e.target.closest(".result"); if (o) cmpAdd(cmpFound[+o.dataset.n]); });
  input.addEventListener("blur", function () { setTimeout(cmpCloseList, 120); });
  var yearAt = function (e) {
    var r = cmp.result;
    if (!r || !r.geo) return null;
    var px = e.clientX - plot.getBoundingClientRect().left, best = null;
    r.shown.forEach(function (y) { var d = Math.abs(r.geo.X(+y) - px); if (!best || d < best.d) best = { d: d, y: +y }; });
    return px < r.geo.left - 8 || px > r.geo.right + 8 ? null : best && best.y;
  };
  var cmpFrame = perFrame(function (e) { var y = yearAt(e); if (y) cmpShow(y); else cmpHide(); });
  plot.addEventListener("pointermove", cmpFrame);
  plot.addEventListener("pointerdown", function (e) { var y = yearAt(e); if (y) cmpShow(y); });
  plot.addEventListener("pointerleave", function () { cmpFrame.cancel(); cmpHide(); });
  plot.addEventListener("keydown", function (e) {
    var r = cmp.result;
    if (!r || !r.shown || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    e.preventDefault();
    var ys = r.shown.map(Number), n = ys.indexOf(cmp.cursor);
    n = n < 0 ? ys.length - 1 : Math.max(0, Math.min(ys.length - 1, n + (e.key === "ArrowLeft" ? -1 : 1)));
    cmpShow(ys[n]);
  });
}

// --- Sources
var ORGS = [
  { id: "insee", n: "Insee", w: "Prix, emploi, population, comptes de la nation. La source principale, lue en direct.", u: "https://www.insee.fr" },
  { id: "eurostat", n: "Eurostat", w: "L'office statistique européen, pour comparer la France à l'Union européenne.", u: "https://ec.europa.eu/eurostat" },
  { id: "interieur", n: "Ministère de l'Intérieur", w: "Délinquance enregistrée.", u: "https://www.interieur.gouv.fr" },
  { id: "drees", n: "Drees", w: "Le service statistique des ministères sociaux : retraites et minima sociaux.", u: "https://drees.solidarites-sante.gouv.fr" },
  { id: "bdf", n: "Banque de France", w: "Qui détient la dette française.", u: "https://www.banque-france.fr" }
];
function orgOf(i) {
  var o = i.o || "Insee";
  if (/Drees/.test(o)) return "drees";
  if (/Eurostat/.test(o)) return "eurostat";
  if (/Intérieur/.test(o)) return "interieur";
  if (/Banque de France/.test(o)) return "bdf";
  return "insee";
}
var srcFilter = { org: "", q: "" };
function isLive(i) { return (i.views || []).some(function (v) { return v.lines.some(function (l) { return l.id; }); }); }
function renderOrgs() {
  var counts = {};
  Object.keys(THEMES).forEach(function (t) { THEMES[t].items.forEach(function (i) { var k = orgOf(i); counts[k] = (counts[k] || 0) + 1; }); });
  document.getElementById("src-orgs").innerHTML = ORGS.filter(function (o) { return counts[o.id]; }).map(function (o) {
    var c = counts[o.id];
    return '<article class="src-org' + (srcFilter.org === o.id ? " on" : "") + '"><h4>' + esc(o.n) + "</h4><p>" + esc(o.w) + '</p><div class="src-org-foot"><button type="button" data-org="' + o.id + '" aria-pressed="' + (srcFilter.org === o.id) + '">Voir ' + (c > 1 ? "ses " + c + " chiffres" : "son chiffre") + '</button><a href="' + o.u + '" rel="noopener">Son site</a></div></article>';
  }).join("");
}
function renderSourceList() {
  var box = document.getElementById("src-list"), q = words(srcFilter.q), html = "", total = 0;
  Object.keys(THEMES).forEach(function (t) {
    var rows = THEMES[t].items.filter(function (i) {
      if (srcFilter.org && orgOf(i) !== srcFilter.org) return false;
      var hay = words(i.n + " " + (i.o || "Insee") + " " + THEMES[t].title);
      return q.every(function (w) { return hay.some(function (h) { return h.indexOf(w) === 0; }); });
    });
    if (!rows.length) return;
    total += rows.length;
    html += '<h4 class="src-theme">' + esc(THEMES[t].title) + "</h4>" + rows.map(function (i) {
      var h = headline(i);
      return '<div class="src-row"><button type="button" class="src-name" data-goto="' + i.key + '" data-theme="' + t + '">' + esc(i.n) + '</button><span class="src-val">' + nb(h.f + (h.u && h.f.indexOf(h.u) < 0 ? " " + h.u : "")) + '</span><span class="src-when">' + nb(h.w) + '</span><span class="src-state">' + (isLive(i) ? '<i class="on"></i>Connecté' : "<i></i>Mis à jour à la main") + '</span><a class="src" href="' + sourceUrl(i) + '" rel="noopener">' + esc(i.o || "Insee") + "</a></div>";
    }).join("");
  });
  box.innerHTML = html || '<p class="no-result">Aucun chiffre ne correspond.</p>';
  document.getElementById("src-count").textContent = total + (total > 1 ? " chiffres" : " chiffre");
  document.getElementById("src-reset").hidden = !srcFilter.org && !srcFilter.q;
}
function renderSources() { renderOrgs(); renderSourceList(); }
function initSources() {
  var panel = document.querySelector('[data-panel="sources"]');
  panel.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.org) { srcFilter.org = srcFilter.org === b.dataset.org ? "" : b.dataset.org; renderSources(); document.getElementById("src-all").scrollIntoView({ block: "start" }); return; }
    if (b.dataset.goto) { goToResult({ theme: b.dataset.theme, item: itemByKey(b.dataset.goto) }); return; }
    if (b.id === "src-reset") { srcFilter.org = ""; srcFilter.q = ""; document.getElementById("src-q").value = ""; renderSources(); }
  });
  document.getElementById("src-q").addEventListener("input", function (e) { srcFilter.q = e.target.value; renderSourceList(); });
}

// --- Fil des derniers chiffres : les dates viennent de l'Insee (LAST_UPDATE) et d'Eurostat (updated)
var FEED_ADDED = { date: "3 novembre 2026", keys: ["eselec", "patr10", "pension", "cambriolages", "salaire", "ue", "dettenr", "vacants", "esrd", "espens", "eshly65", "esprix", "classes", "rsa", "smicnet"] };
var feed = { view: "maj", all: false };
function feedThemeOf(key) {
  var found = null;
  Object.keys(THEMES).forEach(function (t) { THEMES[t].items.forEach(function (i) { if (i.key === key) found = t; }); });
  return found;
}
function feedDate(i) {
  var best = "";
  if (!i.views) return best;
  i.views[0].lines.forEach(function (l) { var d = l.id && UPD[l.id]; if (d && d > best) best = d; });
  return best;
}
function feedLabel(d) {
  var p = d.split("-");
  return (+p[2] === 1 ? "1er" : +p[2]) + " " + MONTHS[+p[1] - 1] + " " + p[0];
}
function feedDelta(i) {
  var line = i.head || i.views[0].lines[0], pts = lineData(line);
  if (pts.length < 2) return "";
  var a = pts[pts.length - 2][1], b = pts[pts.length - 1][1], unit = i.views[0].unit, arrow = b > a ? "↑ " : b < a ? "↓ " : "= ";
  if (unit === "%") { var d = Math.abs(b - a); return d < .05 ? "" : arrow + num(d, 1) + " point" + (d >= 2 ? "s" : ""); }
  if (a > 0 && b > 0) { var pc = Math.abs(b / a - 1) * 100; return pc < .05 ? "" : arrow + num(pc, 1) + " %"; }
  return "";
}
function feedCard(i, date, added) {
  var h = headline(i), t = feedThemeOf(i.key), fresh = date && (Date.now() - new Date(date).getTime()) < 7 * 864e5;
  return '<button type="button" class="feed-card" data-goto="' + i.key + '" data-theme="' + t + '"><span class="feed-top"><span class="feed-theme"><svg class="ic" aria-hidden="true"><use href="#i-' + t + '"/></svg>' + esc(THEMES[t].title) + "</span>" + (fresh && !added ? '<span class="feed-new">Nouveau</span>' : "") + '</span><span class="feed-name">' + esc(i.n) + '</span><span class="feed-val">' + nb(h.f) + (h.u && h.f.indexOf(h.u) < 0 ? " <small>" + esc(h.u) + "</small>" : "") + '</span><span class="feed-meta">' + (added ? nb(h.w) : (feedDelta(i) ? "<b>" + nb(feedDelta(i)) + "</b> · " : "") + nb(h.w)) + "</span>" + (date ? '<span class="feed-date">Mis à jour le ' + nb(feedLabel(date)) + "</span>" : "") + "</button>";
}
function renderFeed() {
  var box = document.getElementById("feed-list");
  if (!box) return;
  var html = "", limit = feed.all ? 40 : 8, total;
  var fromToggle = feed.animate;
  feed.animate = false;
  if (feed.view === "maj") {
    var rows = [];
    Object.keys(THEMES).forEach(function (t) { THEMES[t].items.forEach(function (i) { var d = feedDate(i); if (d) rows.push({ i: i, d: d }); }); });
    rows.sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : 0; });
    total = rows.length;
    html = rows.slice(0, limit).map(function (r) { return feedCard(r.i, r.d); }).join("");
  } else {
    var added = FEED_ADDED.keys.map(itemByKey).filter(Boolean);
    total = added.length;
    html = added.slice(0, limit).map(function (i) { return feedCard(i, "", true); }).join("");
  }
  box.innerHTML = html;
  if (fromToggle) motionList(box.children, 8);
  document.getElementById("feed-note").textContent = feed.view === "maj" ? "Dates données par l'Insee, par série, et par Eurostat, par tableau européen. Les chiffres mis à jour à la main n'apparaissent pas ici." : "Ajoutés au site le " + FEED_ADDED.date + ".";
  var more = document.getElementById("feed-more");
  more.hidden = total <= 8;
  more.textContent = feed.all ? "Voir moins" : "Voir plus";
  document.querySelectorAll("#feed-view button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.feed === feed.view)); });
}
function initFeed() {
  document.querySelector(".feed").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.feed) { feed.view = b.dataset.feed; feed.all = false; feed.animate = true; renderFeed(); return; }
    if (b.id === "feed-more") { feed.all = !feed.all; feed.animate = true; renderFeed(); return; }
    if (b.dataset.goto) {
      goToResult({ theme: b.dataset.theme, item: itemByKey(b.dataset.goto) });
      document.getElementById("stage").scrollIntoView();
    }
  });
}

// --- Plus ou moins ? Deux vrais chiffres, un seul est le plus haut.
var GAME_SAME = [["gazole.0.0", "gazole.0.1"], ["naissances.0.0", "deces.0.0"], ["recettes.0.0", "depenses.0.0"], ["pauvrete.0.0", "chomage.0.0"]];
var GAME_EU = ["esdette", "esdeficit", "eschom", "eselec", "esemp"];
var GAME_YEARS = ["chomage.0.0", "naissances.0.0", "deces.0.0", "gazole.0.0", "baguette.0.0", "deficit.0.0", "pib.0.0", "dette.0.0", "ev.0.0", "fecondite.0.0", "smic.0.0", "taux.0.0"];
var game = { q: null, streak: 0, best: 0, answered: false, last: "" };
function gameStore(v) {
  try {
    if (v !== undefined) localStorage.setItem("statpublique-record", String(v));
    return +localStorage.getItem("statpublique-record") || 0;
  } catch (err) { return 0; }
}
function gameFmt(e, v) { return withUnit(v, e.unit, e.dec); }
function gamePick(list) { return list[Math.floor(Math.random() * list.length)]; }
function gameCommon(a, b) {
  var vb = cmpValues(b), ys = cmpYears(a).filter(function (y) { return vb[y] !== undefined; });
  return ys.length ? ys[ys.length - 1] : null;
}
function gameMake() {
  cmpCatalog();
  for (var n = 0; n < 40; n++) {
    var type = Math.random(), q = null;
    if (type < .4) {
      var k = gamePick(GAME_EU), fr = cmpByKey[k + ".0.0"], eu = cmpByKey[k + ".0.1"];
      if (!fr || !eu) continue;
      var y = gameCommon(fr, eu);
      if (!y) continue;
      q = { sig: k, ask: fr.n.split(" : ")[0], a: { e: fr, y: y, t: "France", v: cmpValues(fr)[y] }, b: { e: eu, y: y, t: "Moyenne de l'Union européenne", v: cmpValues(eu)[y] }, sub: "en " + y };
    } else if (type < .8) {
      var e = cmpByKey[gamePick(GAME_YEARS)];
      if (!e) continue;
      var ys = cmpYears(e);
      if (ys.length < 6) continue;
      var y1 = gamePick(ys), y2 = gamePick(ys);
      if (Math.abs(+y1 - +y2) < 3) continue;
      if (y1 > y2) { var s = y1; y1 = y2; y2 = s; }
      q = { sig: e.key + y1 + y2, ask: e.n, a: { e: e, y: y1, t: "En " + y1, v: cmpValues(e)[y1] }, b: { e: e, y: y2, t: "En " + y2, v: cmpValues(e)[y2] }, sub: "" };
    } else {
      var p = gamePick(GAME_SAME), ea = cmpByKey[p[0]], eb = cmpByKey[p[1]];
      if (!ea || !eb || ea.unit !== eb.unit) continue;
      var yc = gameCommon(ea, eb);
      if (!yc) continue;
      q = { sig: p.join(), ask: "", a: { e: ea, y: yc, t: ea.n.replace(" : France", ""), v: cmpValues(ea)[yc] }, b: { e: eb, y: yc, t: eb.n.replace(" : France", ""), v: cmpValues(eb)[yc] }, sub: "en " + yc };
    }
    if (!q || q.sig === game.last) continue;
    var gap = Math.abs(q.a.v - q.b.v) / Math.max(Math.abs(q.a.v), Math.abs(q.b.v));
    if (!(gap >= .01) || (gap > 3)) continue;
    if (Math.random() < .5) { var sw = q.a; q.a = q.b; q.b = sw; }
    game.last = q.sig;
    return q;
  }
  return null;
}
function gameRender() {
  var box = document.getElementById("game");
  if (!game.q) game.q = gameMake();
  var q = game.q;
  if (!q) { box.innerHTML = '<p class="tool-hint">Le jeu revient dès que les chiffres sont chargés.</p>'; return; }
  var title = q.ask ? (q.sub ? q.ask + " " + q.sub + " : où le chiffre est-il le plus haut ?" : q.ask + " : quelle année donne le chiffre le plus haut ?") : "Quel chiffre est le plus haut " + q.sub + " ?";
  var card = function (s, n) {
    return '<button type="button" class="game-card" data-answer="' + n + '"><span class="game-name">' + esc(s.t) + '</span><span class="game-val" data-val="' + n + '" aria-hidden="true">?</span></button>';
  };
  box.innerHTML = '<p class="game-q">' + nb(title) + '</p><div class="game-cards">' + card(q.a, 0) + '<span class="game-or">ou</span>' + card(q.b, 1) + '</div><p class="game-result" id="game-result" aria-live="polite"></p>';
  game.answered = false;
  gameScore();
}
function gameScore() {
  document.getElementById("game-streak").textContent = game.streak;
  document.getElementById("game-best").textContent = game.best;
}
function gameCount(el, s) {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !window.requestAnimationFrame) { el.innerHTML = nb(gameFmt(s.e, s.v)); return; }
  var t0 = null, step = function (t) {
    if (!t0) t0 = t;
    var k = Math.min((t - t0) / 600, 1), eased = 1 - Math.pow(1 - k, 3);
    el.innerHTML = nb(gameFmt(s.e, s.v * eased));
    if (k < 1) requestAnimationFrame(step); else el.innerHTML = nb(gameFmt(s.e, s.v));
  };
  requestAnimationFrame(step);
  setTimeout(function () { el.innerHTML = nb(gameFmt(s.e, s.v)); }, 700);
}
function gameAnswer(n) {
  if (game.answered || !game.q) return;
  game.answered = true;
  var q = game.q, picks = [q.a, q.b], win = picks[0].v > picks[1].v ? 0 : 1, ok = n === win, box = document.getElementById("game");
  if (ok) { game.streak++; if (game.streak > game.best) { game.best = game.streak; gameStore(game.best); } } else game.streak = 0;
  box.querySelectorAll(".game-card").forEach(function (b) {
    var k = +b.dataset.answer;
    b.disabled = true;
    b.classList.add(k === win ? "win" : "lose");
    if (k === n) b.classList.add("picked");
    var v = b.querySelector(".game-val");
    v.removeAttribute("aria-hidden");
    v.classList.add("shown");
    gameCount(v, picks[k]);
  });
  var res = document.getElementById("game-result"), r = Math.max(picks[0].v, picks[1].v) / Math.min(picks[0].v, picks[1].v);
  var key = picks[0].e.item.key, theme = feedThemeOf(key);
  res.innerHTML = (ok ? "<b>Bien vu.</b> " : "<b>Raté.</b> ") + (picks[0].v > 0 && picks[1].v > 0 ? "Écart de " + nb(num((r - 1) * 100, 1)) + " %. " : "") +
    (picks[0].e.item.o || "Insee") + (picks[0].e.item.o === picks[1].e.item.o || !picks[1].e.item.o ? "" : ", " + picks[1].e.item.o) + '. <span class="game-next"><button type="button" class="cmp-toggle" data-goto="' + key + '" data-theme="' + theme + '">Voir ce chiffre</button><button type="button" class="game-go" id="game-next">Question suivante</button></span>';
  gameScore();
  var next = document.getElementById("game-next");
  if (next) next.focus({ preventScroll: true });
}
function initGame() {
  game.best = gameStore();
  document.querySelector(".play").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.answer !== undefined) { gameAnswer(+b.dataset.answer); return; }
    if (b.id === "game-next") { game.q = null; gameRender(); motion(document.getElementById("game"), RISE, { duration: 260 }); return; }
    if (b.id === "rnd-next") { rndRender(); motion(document.getElementById("rnd"), RISE, { duration: 260 }); motionLines(document.querySelector(".rnd-chart")); return; }
    if (b.dataset.goto) { goToResult({ theme: b.dataset.theme, item: itemByKey(b.dataset.goto) }); document.getElementById("stage").scrollIntoView(); }
  });
  gameRender();
}

// --- Votre année : ce qui a changé depuis
var YEAR_ITEMS = [
  { k: "population.0.0", t: "Population" },
  { k: "smic.0.0", t: "Smic horaire brut" },
  { k: "baguette.0.0", t: "Baguette, le kilo" },
  { k: "gazole.0.0", t: "Gazole, le litre" },
  { k: "ev.0.0", t: "Espérance de vie" },
  { k: "naissances.0.0", t: "Naissances par an" },
  { k: "dette.0.0", t: "Dette publique" },
  { k: "pib.0.0", t: "Richesse produite (PIB)" }
];
var yearState = { y: "1990" };
function yearRender() {
  var box = document.getElementById("year-cards");
  if (!box) return;
  cmpCatalog();
  var y = yearState.y, price = priceYear(y), d = DATA[PRICE_ID] || [], last = d[d.length - 1], cards = [];
  if (price > 0 && last) cards.push('<div class="year-card year-main"><span class="year-name">100 € de ' + y + '</span><b>' + nb(num(100 * last[1] / price, 0) + " €") + '</b><span class="year-meta">Ce qu\'il faudrait en ' + last[0] + " pour acheter la même chose. Les prix ont été multipliés par " + nb(num(last[1] / price, 2)) + ".</span></div>");
  YEAR_ITEMS.forEach(function (it) {
    var e = cmpByKey[it.k];
    if (!e) return;
    var vals = cmpValues(e), ys = cmpYears(e), end = ys[ys.length - 1], a = vals[y], b = vals[end];
    if (a === undefined || y >= end) return;
    var rate = e.unit === "%", ratio = a > 0 && b > 0 ? b / a : null;
    cards.push('<div class="year-card"><span class="year-name">' + esc(it.t) + "</span><b>" + (ratio && !rate ? nb("× " + num(ratio, ratio < 10 ? 2 : 1)) : nb(signed(b - a, e.dec))) + '</b><span class="year-meta">' + nb(withUnit(a, e.unit, e.dec)) + " en " + y + " → " + nb(withUnit(b, e.unit, e.dec)) + " en " + end + "</span></div>");
  });
  box.innerHTML = cards.join("");
  var note = YEAR_ITEMS.length + 1 - cards.length;
  document.getElementById("year-note").textContent = (note > 0 ? "Certains chiffres n'existent pas encore pour cette année : ils n'apparaissent pas. " : "") + "Montants d'avant 2002 convertis en euros par l'Insee. Sources : Insee, Eurostat.";
}
function initYear() {
  var sel = document.getElementById("year-pick"), d = DATA[PRICE_ID] || [], list = [];
  d.forEach(function (p) { if (+p[0] >= 1950 && +p[0] < +d[d.length - 1][0]) list.push(p[0]); });
  sel.innerHTML = list.reverse().map(function (y) { return '<option value="' + y + '"' + (y === yearState.y ? " selected" : "") + ">" + y + "</option>"; }).join("");
  sel.addEventListener("change", function () { yearState.y = sel.value; yearRender(); motionList(document.getElementById("year-cards").children, 9); });
  yearRender();
}

// --- Un chiffre au hasard
var rnd = { key: "" };
function rndRender() {
  var pool = [];
  Object.keys(THEMES).forEach(function (t) { THEMES[t].items.forEach(function (i) { if (i.views && i.key !== rnd.key && lineData(i.views[0].lines[0]).length >= 3) pool.push({ theme: t, item: i }); }); });
  var r = pool[Math.floor(Math.random() * pool.length)], h = headline(r.item);
  rnd.key = r.item.key;
  var view = r.item.views[0], pts = lineData(view.lines[0]), p0 = pts[Math.max(0, pts.length - 80)], p1 = pts[pts.length - 1], since = "";
  if (view.unit === "%") { var dp = Math.abs(p1[1] - p0[1]) < .05 ? 0 : p1[1] - p0[1]; since = signed(dp, 1) + " point" + (Math.abs(dp) >= 2 ? "s" : ""); }
  else if (p0[1] > 0 && p1[1] > 0) since = signed((p1[1] / p0[1] - 1) * 100, 1) + " %";
  else since = signed(p1[1] - p0[1], view.dec) + (view.unit ? " " + view.unit : "");
  var text = typeof r.item.s === "function" ? r.item.s(lastOf) : r.item.s || "";
  document.getElementById("rnd").innerHTML = '<span class="rnd-theme"><svg class="ic" aria-hidden="true"><use href="#i-' + r.theme + '"/></svg>' + esc(THEMES[r.theme].title) + '</span><span class="rnd-name">' + esc(r.item.n) + '</span><span class="rnd-val">' + nb(h.f) + (h.u && h.f.indexOf(h.u) < 0 ? " <small>" + esc(h.u) + "</small>" : "") + '</span><span class="rnd-meta">' + nb(h.w) + "</span>" + (text ? '<span class="rnd-text">' + nb(text) + "</span>" : "") + '<div class="rnd-chart">' + spark(r.item) + '</div><div class="rnd-since"><span>' + nb(periodLabel(p0[0])) + " → " + nb(periodLabel(p1[0])) + "</span><b>" + nb(since) + '</b></div><span class="game-next"><button type="button" class="game-go" id="rnd-next">Un autre</button><button type="button" class="cmp-toggle" data-goto="' + r.item.key + '" data-theme="' + r.theme + '">Voir ce chiffre</button></span>';
}
var playReady = false;
function initPlay() {
  initFeed();
  renderFeed();
  initGame();
  initYear();
  rndRender();
  initMotion();
  playReady = true;
}

// --- Animations : uniquement transform et opacity, que la carte graphique anime sans recalculer la page.
var MOTION_OK = !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) && !!document.body.animate;
var EASE = "cubic-bezier(.2,.8,.2,1)";
function motion(el, frames, opts) {
  if (!MOTION_OK || !el) return;
  var o = { duration: 340, easing: EASE, fill: "backwards", delay: 0 };
  for (var k in opts) o[k] = opts[k];
  try {
    var run = el.animate(frames, o);
    // Filet de sécurité : si le navigateur suspend l'animation, le contenu reste visible.
    setTimeout(function () { try { run.cancel(); } catch (err) {} }, o.duration + o.delay + 300);
  } catch (err) {}
}
var RISE = [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }];
var POP = [{ opacity: 0, transform: "translateY(-6px) scale(.985)" }, { opacity: 1, transform: "none" }];
function motionList(list, max) {
  var n = 0, h = window.innerHeight;
  Array.prototype.forEach.call(list, function (el) {
    if (n >= (max || 12)) return;
    var r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > h || !r.height) return;
    motion(el, RISE, { delay: n * 28 });
    n++;
  });
}
function motionBars(root) {
  if (!root) return;
  Array.prototype.forEach.call(root.querySelectorAll(".dt-track i, .dt-track em, .cmp-bar i"), function (el) {
    motion(el, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 520 });
  });
}
function motionLines(root) {
  if (!MOTION_OK || !root) return;
  Array.prototype.forEach.call(root.querySelectorAll("svg path"), function (p) {
    if (p.getAttribute("stroke-dasharray")) return;
    p.setAttribute("pathLength", "1");
    p.style.strokeDasharray = "1";
    motion(p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 620 });
    setTimeout(function () { p.style.strokeDasharray = ""; p.removeAttribute("pathLength"); }, 950);
  });
}
// Le survol suit l'écran, au rythme de son rafraîchissement.
function perFrame(fn) {
  var pending = null, last = null;
  var run = function (e) {
    last = e;
    if (pending === null) pending = requestAnimationFrame(function () { pending = null; if (last) fn(last); });
  };
  run.cancel = function () { last = null; };
  return run;
}
function initMotion() {
  if (!MOTION_OK || !window.IntersectionObserver) return;
  var seen = new IntersectionObserver(function (list) {
    list.forEach(function (x) {
      if (!x.isIntersecting) return;
      seen.unobserve(x.target);
      motion(x.target, RISE, { duration: 460 });
    });
  });
  document.querySelectorAll(".feed .sec-head, .feed-card, .play-card, .foot-panel").forEach(function (el) { seen.observe(el); });
}

// --- Rendu
var keys = Object.keys(THEMES);
function tabLink(k, title) { return '<a href="#' + k + '" data-tab="' + k + '"><svg class="ic" aria-hidden="true"><use href="#i-' + k + '"/></svg>' + esc(title) + "</a>"; }
function renderAll() {
  var typing = document.activeElement && document.activeElement.closest && document.activeElement.closest(".tool") ? document.activeElement.dataset.f : null;
  var openKey = chart ? { key: chart.tile.dataset.key, panel: chart.tile.closest("[data-panel]").dataset.panel, view: chart.view, range: chart.range, pick: chart.pick } : null;
  if (chart) { chart.el.remove(); chart = null; }
  document.getElementById("bento-essentiel").innerHTML = ESSENTIEL.map(function (e) { return tile(itemByKey(e[0]), e[1], true); }).join("");
  keys.forEach(function (k) {
    var t = THEMES[k], el = document.getElementById("bento-" + k);
    el.innerHTML = t.groups ? t.groups.map(function (g) {
      return '<section class="group"><h3>' + esc(g.title) + '</h3><p class="group-note">' + nb(g.note) + '</p><div class="bento">' + g.keys.map(function (key) { if (key === "sommehier") return prixToolHtml(); var p = key.split("|"); return tile(itemByKey(p[0]), p[1]); }).join("") + "</div></section>";
    }).join("") : t.items.map(function (i) { return tile(i); }).join("");
  });
  cmpAnnual = {};
  renderSources();
  if (playReady) { renderFeed(); yearRender(); }
  if (!document.querySelector('[data-panel="comparer"]').hidden) updateCompare();
  if (typing) document.querySelector('.tool [data-f="' + typing + '"]').focus();
  if (openKey) {
    var again = document.querySelector('[data-panel="' + openKey.panel + '"] [data-key="' + openKey.key + '"]');
    if (again) {
      openChart(again);
      var bs = chart.el.querySelectorAll(".seg button");
      Array.prototype.forEach.call(bs, function (b) {
        if (b.dataset.view !== undefined) b.setAttribute("aria-pressed", String(+b.dataset.view === openKey.view));
        if (b.dataset.range !== undefined) b.setAttribute("aria-pressed", String(+b.dataset.range === openKey.range));
      });
      chart.view = openKey.view; chart.range = openKey.range; chart.pick = openKey.pick;
      drawChart();
    }
  }
}
document.getElementById("tabs").innerHTML = tabLink("essentiel", "L'essentiel") + keys.map(function (k) { return tabLink(k, THEMES[k].title); }).join("");
initSources();
initCompare();
document.getElementById("panels").insertAdjacentHTML("beforeend", keys.map(function (k) {
  return '<section class="panel" data-panel="' + k + '" aria-label="' + esc(THEMES[k].title) + '" hidden><div class="' + (THEMES[k].groups ? "groups" : "bento") + '" id="bento-' + k + '"></div></section>';
}).join(""));
renderAll();
function prixChange(e) {
  var f = e.target.dataset && e.target.dataset.f;
  if (!f || !e.target.closest(".tool")) return;
  prixTool[f] = e.target.value;
  e.target.closest(".tool").querySelector(".tool-out").innerHTML = prixResult();
}
document.getElementById("panels").addEventListener("input", prixChange);
document.getElementById("panels").addEventListener("change", prixChange);

document.getElementById("panels").addEventListener("click", function (e) {
  if (e.target.closest("a")) return;
  var t = e.target.closest(".t.can");
  if (!t) return;
  if (chart && chart.tile === t) backToFigures(); else openChart(t);
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && chart && !(e.target.closest && e.target.closest(".search"))) backToFigures();
});
var resizeTimer;
window.addEventListener("resize", function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(function () { placeBack(); drawChart(); if (!document.querySelector('[data-panel="comparer"]').hidden) cmpDraw(); }, 120); });

// --- Navigation
var stage = document.getElementById("stage");
function isStuck() { return stage.getBoundingClientRect().top < -1; }
function backToStage() { if (isStuck()) window.scrollTo(0, window.scrollY + stage.getBoundingClientRect().top); }
function activate(name) {
  closeChart();
  document.querySelector(".hint").hidden = name === "comparer" || name === "sources";
  document.querySelectorAll(".nav a").forEach(function (l) {
    if (l.getAttribute("href") === "#" + name) l.setAttribute("aria-current", "page"); else l.removeAttribute("aria-current");
  });
  document.querySelectorAll("[data-panel]").forEach(function (p) { p.hidden = p.dataset.panel !== name; });
  document.querySelectorAll("[data-tab]").forEach(function (a) {
    if (a.dataset.tab === name) a.setAttribute("aria-current", "true");
    else a.removeAttribute("aria-current");
  });
}
function route() {
  var name = location.hash.slice(1);
  if (name === "sources") { activate("sources"); stage.scrollIntoView(); return; }
  if (name === "comparer" || name.indexOf("comparer=") === 0) {
    if (name !== "comparer" && decodeURIComponent(name) !== decodeURIComponent(cmpHash().slice(1))) cmpReadHash(decodeURIComponent(name));
    activate("comparer");
    updateCompare();
    stage.scrollIntoView();
    return;
  }
  if (name === "qui") { document.getElementById("qui").scrollIntoView(); return; }
  if (name === "chiffres") { stage.scrollIntoView(); return; }
  if (THEMES[name] || name === "essentiel") { activate(name); backToStage(); return; }
  activate("essentiel");
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);
document.querySelector(".nav").addEventListener("click", function (e) {
  var l = e.target.closest("a");
  if (l && l.getAttribute("aria-current")) { e.preventDefault(); stage.scrollIntoView(); }
});
document.getElementById("brand").addEventListener("click", function () { activate("essentiel"); window.scrollTo(0, 0); });

var tabsEl = document.getElementById("tabs");
tabsEl.addEventListener("click", function (e) {
  var a = e.target.closest("[data-tab]");
  if (a && a.getAttribute("aria-current") !== "true") activate(a.dataset.tab);
  if (a) backToStage();
});
route();

// --- Actualisation : à l'ouverture, puis toutes les 30 minutes
refresh();
setInterval(refresh, 30 * 60 * 1000);
refreshEurostat();

// --- Recherche
// Mots associés : ils font remonter un chiffre même si le mot tapé n'est pas dans son nom.
var RELATED = {
  esdette: "dette europe maastricht", esdeficit: "deficit budget europe", esdepenses: "budget europe etat", esdefense: "armee militaire", esfonctions: "budget protection sociale sante education armee", espibhab: "richesse niveau de vie europe croissance", esindustrie: "usines reindustrialisation desindustrialisation", esrd: "innovation recherche", esdepend: "souverainete independance energetique petrole gaz importations", eselec: "electricite facture energie pouvoir achat", esprix: "vie chere pouvoir achat europe", eschom: "travail emploi europe", eschomj: "travail jeunes emploi", ess80: "inegalites riches pauvres", esarope: "pauvrete precarite exclusion", eslits: "hopital sante", esfert: "enfants natalite naissances", esvie: "duree de vie mortalite", esasile: "immigration refugies", espermis: "immigration sejour", esordres: "immigration oqtf expulsions eloignement", esretours: "immigration oqtf expulsions eloignement", eshom: "meurtres securite insecurite", espens: "retraite dependance", esemp: "seniors travail retraite", eshly65: "retraite sante esperance", eshly0: "sante esperance",
  titres: "immigration sejour etudiants regroupement familial visa", eloignements: "immigration expulsions expulses oqtf reconduites", asile: "immigration refugies demandeurs ofpra", protection: "immigration asile refugies ofpra", naturalisations: "immigration nationalite droit du sol", ame: "immigration sante sans papiers", oqtf: "immigration expulsions eloignement", interpellations: "immigration clandestins irreguliers sans papiers", stocktitres: "immigration sejour",
  homenr: "meurtres assassinats securite insecurite crimes", cambriolages: "vols securite insecurite delinquance", violphys: "agressions securite insecurite delinquance", violsex: "viols agressions securite insecurite feminicides", trafic: "drogue narcotrafic securite cannabis", usage: "drogue cannabis securite", volsviol: "vols agressions securite insecurite delinquance", escroqueries: "arnaques fraude delinquance", etrmis: "immigration delinquance securite nationalite insecurite",
  defense: "armee militaire souverainete armement", ue: "europe union europeenne bruxelles souverainete contribution", soldeue: "europe union europeenne bruxelles souverainete contribution", dettenr: "dette etranger souverainete non residents creanciers",
  patr10: "riches ultra riches fortune milliardaires inegalites accaparement", seuilspat: "riches pauvres fortune milliardaires inegalites", heritage: "succession riches inegalites", dmtg: "heritage succession donation impot riches droits", ifi: "isf impot fortune riches", ifinul: "isf impot fortune riches", aides: "cadeaux entreprises exonerations cotisations subventions cice",
  smicnet: "salaire minimum pouvoir achat", partsmic: "salaire minimum", vacants: "logement immobilier", commences: "logement construction immobilier batiment", rsa: "assistanat aides sociales allocations", minima: "assistanat aides sociales allocations", fraudesoc: "assistanat fraude allocations cotisations", controlefisc: "fraude fiscale evasion impots", retraitesdep: "pension retraite", classes: "education ecole professeurs effectifs",
  immigres: "immigration migrants etrangers", etrangers: "immigration nationalite migrants", acquis: "naturalisation nationalite immigration", entrees: "immigration flux arrivees migrants", origines: "immigration afrique europe asie amerique maghreb", chomimm: "immigration immigres chomage emploi descendants", emploiimm: "immigration immigres emploi travail descendants",
  homicides: "meurtres assassinats securite insecurite crimes", violences: "agressions insecurite delinquance securite viols", miscause: "delinquance crimes delits justice insecurite", occupation: "prison surpopulation carcerale detenus justice", ecroues: "prison detenus justice", prevenus: "prison detention provisoire justice", institutions: "confiance police justice armee ecole hopital",
  soldeext: "souverainete balance commerciale deficit commercial importations exportations", commerce: "souverainete balance commerciale echanges", partindustrie: "souverainete reindustrialisation desindustrialisation usines", ipi: "souverainete reindustrialisation desindustrialisation usines", nucleaire: "souverainete energie centrales electricite", fossiles: "souverainete energie petrole gaz charbon climat", enr: "energie eolien solaire climat", apd: "aide international cooperation",
  soldeetat: "budget deficit etat", dettenego: "dette etat obligations", fonctionnaires: "fonctionnaires agents etat emploi public",
  smic: "salaire minimum pouvoir achat", gazole: "carburant essence diesel prix pouvoir achat", baguette: "pain prix pouvoir achat", irl: "loyers logement", logsociaux: "hlm logement", loyersoc: "hlm logement",
  neet: "jeunes chomage formation", ecartsal: "egalite femmes hommes salaires",
  medecins: "sante deserts medicaux docteurs", generalistes: "sante deserts medicaux docteurs", lits: "sante hopitaux", renoncement: "sante soins dentiste", sorties: "education decrochage ecole", pisa: "education ecole niveau maths lecture", eleves: "education ecole classes", enseignants: "education professeurs profs ecole",
  ges: "climat co2 pollution carbone ecologie", geshab: "climat co2 pollution carbone ecologie",
  dette: "maastricht emprunt etat endettement finances", taux: "emprunt interet oat obligation dette", deficit: "budget dette solde finances", depenses: "budget etat", recettes: "budget impots taxes", po: "impots taxes cotisations",
  interets: "dette emprunt taux", nette: "dette", porte: "dette etat securite sociale collectivites",
  pib: "richesse production croissance economie", croissance: "pib economie recession activite", climat: "entreprises moral conjoncture", emploi: "travail salaries entreprises", creations: "entrepreneurs startup societes", secteurs: "industrie batiment commerce services conjoncture", defaillances: "faillites liquidation entreprises", capacites: "industrie usines production",
  conso: "achats depenses menages", fbcf: "entreprises", exports: "commerce exterieur echanges", imports: "commerce exterieur echanges",
  inflation: "prix hausse vie chere cout ipc", chomage: "travail emploi jeunes bit", chomeurs: "chomage travail bit", longue: "chomage travail", tauxemploi: "travail chomage actifs", halo: "chomage travail", achat: "inflation prix revenu", epargne: "revenu argent", confiance: "moral opinion", logement: "immobilier maison appartement inflation prix",
  salaire: "paie revenu remuneration travail cadres ouvriers", niveau: "revenu pauvrete mediane", gini: "inegalites revenu pauvrete", pauvrete: "precarite revenu inegalites", ecart: "inegalites revenu riches pauvres",
  population: "habitants demographie francais", ages: "vieillissement seniors jeunes demographie", naissances: "bebes natalite demographie", deces: "mortalite morts demographie", soldenat: "naissances deces demographie", soldemig: "immigration emigration migrants demographie", fecondite: "enfants natalite naissances", agemeres: "maternite naissances enfants", mariages: "noces couples", infantile: "bebes deces mortalite", ev: "duree de vie mortalite", ev60: "duree de vie mortalite retraite",
  pension: "retraite retraites", pauvreret: "retraite pauvrete", retraites: "pension", derive: "retraite reversion", ecartpen: "retraite inegalites", minimum: "retraite aspa pauvrete"
};
var STOP = { l: 1, d: 1, le: 1, la: 1, les: 1, de: 1, du: 1, des: 1, un: 1, une: 1, et: 1, en: 1, au: 1, aux: 1, a: 1, sur: 1, pour: 1 };
function plainText(s) { return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }
function words(s) { return plainText(s).split(" ").filter(Boolean); }
function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  var row = [], i, j;
  for (j = 0; j <= b.length; j++) row[j] = j;
  for (i = 1; i <= a.length; i++) {
    var prev = row[0];
    row[0] = i;
    for (j = 1; j <= b.length; j++) {
      var cur = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
  }
  return row[b.length];
}
var searchIndex = [], GROUP_OF = {};
keys.forEach(function (t) { (THEMES[t].groups || []).forEach(function (g) { if (g.title.indexOf(",") < 0) g.keys.forEach(function (key) { GROUP_OF[key.split("|")[0]] = g.title; }); }); });
keys.forEach(function (k) {
  THEMES[k].items.forEach(function (i) {
    var sub = [GROUP_OF[i.key] || ""];
    (i.views || []).forEach(function (v) { v.lines.forEach(function (l) { sub.push(l.name); }); });
    (i.staticRows || []).forEach(function (r) { sub.push(r[0]); });
    searchIndex.push({ item: i, theme: k, name: words(i.n), related: words((RELATED[i.key] || "") + " " + sub.join(" ")), themeWords: words(THEMES[k].title), text: words(typeof i.s === "string" ? i.s : "") });
  });
});
searchIndex.push({ item: { key: "sommehier", tool: 1, n: "Une somme d'hier en euros d'aujourd'hui", f: "Calculer", w: "à vous de jouer" }, theme: "menages", name: words("somme hier euros aujourd hui"), related: words("inflation pouvoir achat prix valeur convertir calculer calculatrice"), themeWords: words("Vie des ménages"), text: [] });
function tokenScore(t, e) {
  var score = 0;
  e.name.forEach(function (w, n) { if (w === t || w === t + "s") score = Math.max(score, n === 0 ? 120 : 100); else if (w.indexOf(t) === 0) score = Math.max(score, n === 0 ? 90 : 80); });
  e.related.forEach(function (w) { if (w === t) score = Math.max(score, 50); else if (w.indexOf(t) === 0) score = Math.max(score, 40); });
  e.themeWords.forEach(function (w) { if (w.indexOf(t) === 0) score = Math.max(score, 30); });
  e.text.forEach(function (w) { if (t.length > 2 && w.indexOf(t) === 0) score = Math.max(score, 20); });
  if (!score && t.length >= 5) {
    var limit = t.length >= 8 ? 2 : 1;
    e.name.concat(e.related).forEach(function (w) { if (w.length >= 4 && editDistance(t, w) <= limit) score = Math.max(score, 15); });
  }
  return score;
}
function searchFor(query) {
  var all = words(query), tokens = all.filter(function (t) { return !STOP[t]; });
  if (!tokens.length) {
    // « de » peut être le début de « dette » : on cherche les noms qui commencent ainsi, sans les petits mots
    return all.length ? searchIndex.filter(function (e) {
      return all.every(function (t) { return e.name.some(function (w) { return !STOP[w] && w.indexOf(t) === 0; }); });
    }) : [];
  }
  return searchIndex.map(function (e, n) {
    var total = 0, all = tokens.every(function (t) { var s = tokenScore(t, e); total += s; return s > 0; });
    return all ? { e: e, score: total, n: n } : null;
  }).filter(Boolean).sort(function (a, b) { return b.score - a.score || a.n - b.n; }).map(function (r) { return r.e; });
}
function markName(name, query) {
  var tokens = words(query).filter(function (t) { return t.length > 1; });
  return name.split(/(\s+)/).map(function (w) {
    return tokens.some(function (t) { return plainText(w).indexOf(t) === 0; }) ? "<mark>" + esc(w) + "</mark>" : esc(w);
  }).join("");
}
var qInput = document.getElementById("q"), qBox = document.getElementById("q-results"), qFound = [], qActive = -1;
function closeResults() { qBox.hidden = true; qInput.setAttribute("aria-expanded", "false"); qInput.removeAttribute("aria-activedescendant"); qActive = -1; }
function highlightResult(n) {
  qActive = n;
  Array.prototype.forEach.call(qBox.children, function (el, i) { el.classList.toggle("on", i === n); el.setAttribute("aria-selected", String(i === n)); });
  if (n >= 0 && qBox.children[n]) { qInput.setAttribute("aria-activedescendant", qBox.children[n].id); qBox.children[n].scrollIntoView({ block: "nearest" }); }
  else qInput.removeAttribute("aria-activedescendant");
}
function renderResults() {
  var query = qInput.value;
  if (!words(query).length) { qFound = []; closeResults(); return; }
  qFound = searchFor(query);
  qBox.innerHTML = qFound.length ? qFound.map(function (r, n) {
    var h = headline(r.item), unit = h.u && h.f.indexOf(h.u) < 0 ? " " + h.u : "";
    return '<div class="result" id="q-r' + n + '" role="option" aria-selected="false" data-n="' + n + '"><svg class="ic" aria-hidden="true"><use href="#i-' + r.theme + '"/></svg><span class="result-name">' + markName(r.item.n, query) + '</span><span class="result-value">' + nb(h.f + unit) + '</span><span class="result-meta">' + esc(THEMES[r.theme].title) + " · " + nb(h.w) + "</span></div>";
  }).join("") : '<p class="no-result">Aucun chiffre trouvé. Essayez un autre mot, comme « prix » ou « emploi ».</p>';
  if (qBox.hidden) motion(qBox, POP, { duration: 200 });
  qBox.hidden = false;
  qInput.setAttribute("aria-expanded", "true");
  qActive = -1;
}
function goToResult(r) {
  closeResults();
  qInput.blur();
  activate(r.theme);
  try { history.replaceState(null, "", "#" + r.theme); } catch (err) {}
  var t = document.querySelector('[data-panel="' + r.theme + '"] [data-key="' + r.item.key + '"]');
  if (!t) return;
  if (r.item.views) openChart(t);
  if (r.item.tool) { var field = t.querySelector("input"); if (field) field.focus(); }
  t.scrollIntoView({ block: "start" });
  t.classList.add("found");
  setTimeout(function () { t.classList.remove("found"); }, 2000);
}
qInput.addEventListener("input", renderResults);
qInput.addEventListener("focus", function () { if (qInput.value) renderResults(); });
qInput.addEventListener("keydown", function (e) {
  if (e.key === "Escape") { closeResults(); return; }
  if (qBox.hidden || !qFound.length) return;
  if (e.key === "ArrowDown") { e.preventDefault(); highlightResult((qActive + 1) % qFound.length); }
  else if (e.key === "ArrowUp") { e.preventDefault(); highlightResult((qActive - 1 + qFound.length) % qFound.length); }
  else if (e.key === "Enter") { e.preventDefault(); goToResult(qFound[Math.max(qActive, 0)]); }
});
qBox.addEventListener("click", function (e) {
  var el = e.target.closest(".result");
  if (el) goToResult(qFound[+el.dataset.n]);
});
document.addEventListener("click", function (e) { if (!e.target.closest("#search")) closeResults(); });
initPlay();
