// Partagé par toutes les pages : bandeau de consentement, mesure d'audience, adresse de contact protégée.

// Pour activer la mesure d'audience, renseignez ici l'outil choisi, par exemple GoatCounter :
// var ANALYTICS = { src: "https://gc.zgo.at/count.js", attrs: { "data-goatcounter": "https://VOTRE-CODE.goatcounter.com/count" } };
// Tant que src est vide, aucun outil n'est chargé.
var ANALYTICS = { src: "https://gc.zgo.at/count.js", attrs: { "data-goatcounter": "https://rflbrt.goatcounter.com/count" } };

(function () {
  var KEY = "statpublique-consent", SIX_MONTHS = 183 * 24 * 3600 * 1000;

  function read() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || "null");
      return c && Date.now() - c.at < SIX_MONTHS ? c.choice : null;
    } catch (err) { return null; }
  }
  function save(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ choice: choice, at: Date.now() })); } catch (err) {}
  }
  function loadAnalytics() {
    if (!ANALYTICS.src || document.getElementById("analytics")) return;
    var s = document.createElement("script");
    s.id = "analytics"; s.async = true; s.src = ANALYTICS.src;
    Object.keys(ANALYTICS.attrs).forEach(function (k) { s.setAttribute(k, ANALYTICS.attrs[k]); });
    document.head.appendChild(s);
  }
  function showBanner() {
    if (document.getElementById("consent")) return;
    var b = document.createElement("section");
    b.id = "consent"; b.className = "consent"; b.setAttribute("aria-label", "Cookies et mesure d'audience");
    b.innerHTML = '<p>Acceptez-vous une mesure d\'audience pour nous aider à améliorer le site ? Aucune publicité, et vous pouvez changer d\'avis à tout moment. <a href="/confidentialite">En savoir plus</a></p>' +
      '<div><button type="button" data-choice="no">Refuser</button><button type="button" data-choice="yes">Accepter</button></div>';
    b.addEventListener("click", function (e) {
      var c = e.target.getAttribute("data-choice");
      if (!c) return;
      save(c);
      b.remove();
      // Un refus après un accord prend effet au rechargement, car un script déjà lancé ne peut pas être retiré.
      if (c === "yes") loadAnalytics();
      else if (document.getElementById("analytics")) location.reload();
    });
    document.body.appendChild(b);
  }

  // Sans outil de mesure, le site ne dépose rien : pas de bandeau ni de bouton « Cookies ».
  var choice = read();
  if (ANALYTICS.src) {
    if (choice === "yes") loadAnalytics();
    else if (choice === null) showBanner();
    document.querySelectorAll("[data-cookies]").forEach(function (el) { el.addEventListener("click", showBanner); });
  } else {
    document.querySelectorAll("[data-cookies]").forEach(function (el) { (el.closest("p") || el).hidden = true; });
  }

  // Compteur public du pied de page. Il passe par le site lui-même (voir netlify.toml) : le navigateur
  // ne contacte pas GoatCounter, même si le visiteur a refusé la mesure d'audience. Sans chiffre valide, il reste caché.
  var counter = document.getElementById("foot-count");
  function showCount(n) {
    var out = counter.querySelector("b"), label = counter.querySelector("span"), still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches, begin = null;
    function text(v) { return v.toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g, "\u00a0"); }
    label.textContent = n > 1 ? "visites comptées" : "visite comptée";
    counter.hidden = false;
    if (still || n < 2 || !window.requestAnimationFrame) { out.textContent = text(n); return; }
    (function step(t) {
      if (begin === null) begin = t;
      var p = Math.min((t - begin) / 900, 1), eased = 1 - Math.pow(1 - p, 3);
      out.textContent = text(Math.round(n * eased));
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  function loadCount() {
    if (!window.fetch) return;
    fetch("/compteur.json", { headers: { Accept: "application/json" } }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (d) {
      var digits = String(d && d.count).replace(/\D/g, "");
      if (digits && +digits > 0) showCount(+digits);
    }).catch(function () {});
  }
  // Un seul appel, et seulement quand le pied de page approche de l'écran.
  if (counter) {
    var footer = counter.closest(".foot");
    if (window.IntersectionObserver && footer) {
      var seen = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { seen.disconnect(); loadCount(); }
      }, { rootMargin: "300px" });
      seen.observe(footer);
    } else loadCount();
  }

  // L'adresse n'existe pas telle quelle dans le code de la page : les robots qui collectent les e-mails ne la trouvent pas.
  document.querySelectorAll("[data-mail-u]").forEach(function (el) {
    var addr = el.getAttribute("data-mail-u") + "@" + el.getAttribute("data-mail-d");
    var a = document.createElement("a");
    a.href = "mailto:" + addr; a.textContent = addr;
    el.replaceWith(a);
  });
})();
