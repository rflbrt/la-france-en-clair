// Remplace le navigateur pour charger app.js hors du site, le temps de générer les pages statiques.
// Fonctionne avec Node (GitHub Actions) et avec jsc (Mac).
var print = typeof print === "function" ? print : function (s) { process.stdout.write(s + "\n"); };
function mk(id) {
  var store = {}, fn = function () { return mk(); };
  return new Proxy(fn, {
    get: function (t, p) {
      if (p === Symbol.toPrimitive) return function () { return ""; };
      if (p === "id") return id || "";
      if (p in store) return store[p];
      if (p === "hidden") return true;
      if (["value", "textContent", "innerHTML", "className", "placeholder", "hash", "search", "pathname", "href", "protocol"].indexOf(p) >= 0) return "";
      if (["length", "offsetWidth", "clientWidth", "offsetHeight", "clientHeight", "scrollY", "width", "height", "top", "left", "right", "bottom", "innerWidth", "innerHeight"].indexOf(p) >= 0) return 0;
      if (p === "dataset" || p === "style") { store[p] = {}; return store[p]; }
      if (p === "children" || p === "childNodes" || p === "options") return [];
      if (["querySelectorAll", "getElementsByTagNameNS", "getElementsByClassName", "getElementsByTagName"].indexOf(p) >= 0) return function () { return []; };
      if (p === "closest" || p === "matches") return function () { return null; };
      if (p === "getAttribute") return function () { return null; };
      if (p === "then") return undefined;
      return mk();
    },
    set: function (t, p, v) { store[p] = v; return true; }
  });
}
var els = {}, document = mk(), window = mk();
document.getElementById = function (i) { return els[i] || (els[i] = mk(i)); };
document.querySelector = function (q) { var k = "q:" + q; return els[k] || (els[k] = mk(k)); };
document.querySelectorAll = function () { return []; };
document.createElement = function () { return mk(); };
document.createElementNS = function () { return mk(); };
document.addEventListener = function () {};
window.addEventListener = function () {};
window.removeEventListener = function () {};
window.scrollTo = function () {};
window.matchMedia = function () { return { matches: false, addEventListener: function () {}, addListener: function () {} }; };
var location = { hash: "", search: "", pathname: "/", protocol: "https:", href: "https://x/" };
var history = { replaceState: function () {}, pushState: function () {} };
var navigator = { userAgent: "pages", language: "fr", clipboard: {}, share: null };
var localStorage = { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} };
var sessionStorage = localStorage;
var requestAnimationFrame = function () { return 0; }, cancelAnimationFrame = function () {};
var setTimeout = function () { return 0; }, clearTimeout = function () {}, setInterval = function () { return 0; }, clearInterval = function () {};
var NEVER = { then: function () { return NEVER; }, catch: function () { return NEVER; }, finally: function () { return NEVER; } };
var fetch = function () { return NEVER; };
var IntersectionObserver = function () { this.observe = function () {}; this.disconnect = function () {}; this.unobserve = function () {}; };
var ResizeObserver = IntersectionObserver, MutationObserver = IntersectionObserver;
var DOMParser = function () {};
var console = { log: function () {}, warn: function () {}, error: function () {} };
var getComputedStyle = function () { return { getPropertyValue: function () { return ""; } }; };
var performance = { now: function () { return 0; } };
var Image = function () {};
var matchMedia = window.matchMedia, addEventListener = window.addEventListener, removeEventListener = window.removeEventListener, scrollTo = window.scrollTo;
