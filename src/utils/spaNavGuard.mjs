// SPA navigation guard: prevents the client-side React router from intercepting
// clicks to static routes it does not own. Without it, navigating from an
// SPA-mounted page (home, calculators hub, etc.) to a pre-rendered static page
// (restaurants, food calculators, etc.) via the nav renders the router's 404;
// a hard refresh then "fixes" it because the server serves the real HTML.
// The guard forces a full-page load for any target route that is not part of
// the client router's route table, and hard-reloads on popstate to unknown routes.

export const SPA_NAV_GUARD_MARKER = '__SPA_NAV_GUARD__';

// IMPORTANT: keep this list in sync with the client router's route table
// (TanStack Router routes compiled into assets/index-*.js). Routes listed here
// are handled by the SPA router; every other same-origin link gets a full
// page load. Dynamic routes use a "$" suffix (prefix match).
const SPA_ROUTES = [
  '/', '/about', '/calculators/',
  '/calculators/baby-weight-loss', '/calculators/bariatric-surgery-weight-loss',
  '/calculators/bmi', '/calculators/bmr', '/calculators/body-fat',
  '/calculators/calorie', '/calculators/dog-weight-loss', '/calculators/glp1-weight-loss',
  '/calculators/infant-weight-loss', '/calculators/keto', '/calculators/macro',
  '/calculators/newborn-weight-loss', '/calculators/peptide-dosage',
  '/calculators/postpartum-weight-loss', '/calculators/protein', '/calculators/tdee',
  '/calculators/water-intake', '/calculators/weight-loss',
  '/compare/', '/contact', '/disclaimer', '/glossary', '/privacy',
  '/restaurants/mcdonalds', '/restaurants/starbucks', '/restaurants/subway',
  '/terms', '/compare/$',
];

export const SPA_NAV_GUARD_SCRIPT = `
<!-- SPA-NAV-GUARD-START -->
<script>
(function () {
  if (window.__SPA_NAV_GUARD__) return;
  window.__SPA_NAV_GUARD__ = true;
  var SPA_ROUTES = ${JSON.stringify(SPA_ROUTES)};
  function normalize(p) {
    if (!p) return "/";
    if (p.length > 1 && p.charAt(p.length - 1) === "/") return p.slice(0, -1);
    return p;
  }
  function stripBase(p) {
    try {
      var b = window.__ROUTE_BASEPATH__ || "/";
      if (b && b !== "/" && p.indexOf(b) === 0) return p.slice(b.length - 1) || "/";
    } catch (e) {}
    return p;
  }
  function isSpaRoute(pathname) {
    var p = normalize(stripBase(pathname));
    for (var i = 0; i < SPA_ROUTES.length; i++) {
      var r = SPA_ROUTES[i];
      if (r === p) return true;
      if (r.slice(-1) === "$" && p.indexOf(r.slice(0, -1)) === 0) return true;
    }
    return false;
  }
  window.__isSpaRoute__ = isSpaRoute;
  document.addEventListener("click", function (ev) {
    try {
      if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      var t = ev.target;
      var anchor = null;
      while (t && t !== document.documentElement) {
        if (t.tagName === "A") { anchor = t; break; }
        t = t.parentElement;
      }
      if (!anchor || !anchor.href || anchor.getAttribute("target") === "_blank" || anchor.hasAttribute("download")) return;
      var u;
      try { u = new URL(anchor.href, window.location.origin); } catch (e) { return; }
      if (u.origin !== window.location.origin) return;
      if (isSpaRoute(u.pathname)) return;
      ev.stopImmediatePropagation();
      ev.preventDefault();
      window.location.assign(u.pathname + u.search + u.hash);
    } catch (e) {}
  }, true);
  window.addEventListener("popstate", function () {
    try {
      if (!isSpaRoute(window.location.pathname)) window.location.reload();
    } catch (e) {}
  });
})();
</script>
<!-- SPA-NAV-GUARD-END -->
`;
