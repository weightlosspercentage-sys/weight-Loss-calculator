// Normalize rendered (React) header/footer links: trailing slashes + region localization.
// Runs on pages where the legacy React bundle replaces the static footer.
(function () {
  'use strict';
  var REGIONS = /^(uk|ca|au|nz|sg|ae|cn|ru|zh|es|fr|de|it|ja|ko|pt)$/;
  var TOOL_SEGS = /^(calculators|nutrition|compare|glossary|restaurants|privacy|terms|disclaimer|cookie-policy|contact|about)$/;

  // The legacy bundle's router prefixes region URLs with /uk/ (e.g. /ja/x -> /uk/ja/x).
  // Capture the server-provided path first and guard history state against that rewrite.
  var initialPath = location.pathname;
  var initRegion = (initialPath.match(/^\/(uk|ca|au|nz|sg|ae|cn|ru|zh|es|fr|de|it|ja|ko|pt)(\/|$)/) || [])[1];
  if (initRegion && initRegion !== 'uk' && typeof history !== 'undefined') {
    ['pushState', 'replaceState'].forEach(function (fn) {
      var orig = history[fn];
      history[fn] = function (state, title, url) {
        try {
          if (typeof url === 'string' && url.indexOf('/uk/') === 0) {
            if (url.indexOf('/uk/' + initRegion) === 0) url = url.slice(3); // /uk/ja/x -> /ja/x
            else url = '/' + initRegion + '/' + url.slice(4); // /uk/calculators -> /ja/calculators
            if (initialPath.charAt(initialPath.length - 1) === '/' && url.charAt(url.length - 1) !== '/') url += '/';
          }
        } catch (e) {}
        return orig.apply(history, arguments.length > 2 ? [state, title, url] : arguments);
      };
    });
  }

  var MONEY_RE = /^weight loss percentage calculator$/i;
  function moneyAnchor() {
    try {
      var footers = [].slice.call(document.querySelectorAll('footer,.static-footer')).filter(function (f) { return f.getBoundingClientRect().height > 0; });
      if (!footers.length) return;
      footers.forEach(function (f) {
        var seen = false, extras = [];
        [].slice.call(f.querySelectorAll('a')).forEach(function (a) {
          if (MONEY_RE.test((a.textContent || '').trim())) { if (seen) extras.push(a); else seen = true; }
        });
        if (seen) { extras.forEach(function (a) { if (a.parentNode) a.parentNode.removeChild(a); }); return; }
        var p = document.createElement('p');
        p.setAttribute('style', 'text-align:center;padding:12px 16px;font-size:13px;');
        p.appendChild(document.createTextNode('Use the free '));
        var a = document.createElement('a');
        a.setAttribute('href', '/');
        a.setAttribute('style', 'text-decoration:underline;');
        a.textContent = 'weight loss percentage calculator';
        p.appendChild(a);
        p.appendChild(document.createTextNode(' to track your progress.'));
        f.appendChild(p);
      });
    } catch (e) {}
  }

  // E-E-A-T strip guard: the bundle can drop the statically injected
  // #eeat-review section when it re-renders main content. Re-add a compact
  // reviewed-by + references line for site visitors.
  var EEAT = {
    en: ['Medically reviewed by', 'Dr. Rekha Kumar, M.D., M.S. — Lead Medical Reviewer', 'Evidence & references', 'MedlinePlus (NIH) — Weight control', 'NIH NIDDK — Weight management'],
    es: ['Revisado médicamente por', 'Dr. Rekha Kumar, M.D., M.S. — Revisora Médica Principal', 'Evidencia y referencias', 'MedlinePlus (NIH) — Control de peso', 'NIH NIDDK — Manejo del peso'],
    fr: ['Révisé sur le plan médical par', 'Dr Rekha Kumar, M.D., M.S. — Relectrice médicale principale', 'Preuves et références', 'MedlinePlus (NIH) — Contrôle du poids', 'NIH NIDDK — Gestion du poids'],
    de: ['Medizinisch geprüft von', 'Dr. Rekha Kumar, M.D., M.S. — Leitende medizinische Prüferin', 'Evidenz und Quellen', 'MedlinePlus (NIH) — Gewichtskontrolle', 'NIH NIDDK — Gewichtsmanagement'],
    it: ['Revisione medica a cura di', 'Dott.ssa Rekha Kumar, M.D., M.S. — Revisore medico capo', 'Evidenze e riferimenti', 'MedlinePlus (NIH) — Controllo del peso', 'NIH NIDDK — Gestione del peso'],
    pt: ['Revisão médica por', 'Dra. Rekha Kumar, M.D., M.S. — Revisora médica principal', 'Evidências e referências', 'MedlinePlus (NIH) — Controle de peso', 'NIH NIDDK — Manejo do peso'],
    ja: ['医学監修：', 'Dr. レカ・クマール（M.D., M.S.／チーフ・メディカルレビューア）', '根拠・参考文献', 'MedlinePlus (NIH) — 体重管理', 'NIH NIDDK — 体重管理'],
    ko: ['의학적 검토:', 'Dr. 레카 쿠마르(M.D., M.S.) — 수석 의학 검토자', '근거 및 참고 자료', 'MedlinePlus (NIH) — 체중 관리', 'NIH NIDDK — 체중 관리'],
    zh: ['医学审核：', 'Rekha Kumar 博士（M.D., M.S.，首席医学审核）', '证据与参考', 'MedlinePlus (NIH) — 体重控制', 'NIH NIDDK — 体重管理'],
    ru: ['Медицинская проверка:', 'Д-р Рекха Кумар, M.D., M.S. — ведущий медицинский редактор', 'Данные и источники', 'MedlinePlus (NIH) — Контроль веса', 'NIH NIDDK — Управление весом']
  };
  function eeatGuard() {
    try {
      if (document.getElementById('eeat-review')) return;
      var lang = (initialPath.match(/^\/(es|fr|de|it|pt|ja|ko|zh|cn|ru)(\/|$)/) || [])[1];
      if (lang === 'cn') lang = 'zh';
      var t = EEAT[lang] || EEAT.en;
      var main = [].slice.call(document.querySelectorAll('main,#main-content,.static-main')).filter(function (m) { return m.getBoundingClientRect().height > 0; })[0];
      var host = main || document.querySelector('footer,.static-footer') || document.body;
      if (!host) return;
      var sec = document.createElement('section');
      sec.id = 'eeat-review';
      sec.setAttribute('style', 'margin:16px auto 8px;padding:12px 16px;border:1px solid #e5e7eb;border-radius:10px;font-size:13px;line-height:1.55;max-width:900px');
      var p1 = document.createElement('p');
      var b = document.createElement('strong'); b.textContent = t[0] + ' '; p1.appendChild(b);
      var a1 = document.createElement('a'); a1.setAttribute('href', '/authors/dr-rekha-kumar/'); a1.setAttribute('style', 'text-decoration:underline'); a1.textContent = t[1];
      p1.appendChild(a1);
      var p2 = document.createElement('p'); p2.setAttribute('style', 'margin:6px 0 0');
      var b2 = document.createElement('strong'); b2.textContent = t[2] + ': '; p2.appendChild(b2);
      [['https://medlineplus.gov/weightcontrol.html', t[3]], ['https://www.niddk.nih.gov/health-information/weight-management', t[4]]].forEach(function (r, i) {
        if (i) p2.appendChild(document.createTextNode(' · '));
        var a = document.createElement('a'); a.setAttribute('href', r[0]); a.setAttribute('rel', 'noopener'); a.setAttribute('target', '_blank'); a.textContent = r[1];
        p2.appendChild(a);
      });
      sec.appendChild(p1); sec.appendChild(p2);
      host.appendChild(sec);
    } catch (e) {}
  }

  function normalize() {
    try {
      var regionMatch = initialPath.match(/^\/(uk|ca|au|nz|sg|ae|cn|ru|zh|es|fr|de|it|ja|ko|pt)\//);
      document.querySelectorAll('footer a[href], nav a[href]').forEach(function (a) {
        var href = a.getAttribute('href');
        if (!href || href.charAt(0) !== '/' || href.indexOf('//') === 0) return;
        var q = href.search(/[#?]/);
        var path = q === -1 ? href : href.slice(0, q);
        var suffix = q === -1 ? '' : href.slice(q);
        if (!path || /\.(png|jpe?g|gif|svg|webp|ico|css|js|xml|txt|json|webmanifest|pdf)$/i.test(path)) return;
        var isFlagLink = /[\u{1F1E6}-\u{1F1FF}\u{1F3F4}]/u.test(a.textContent);
        var changed = false;
        if (regionMatch) {
          var r = regionMatch[1];
          var wrongRegion = path.match(/^\/(uk|ca|au|nz|sg|ae|cn|ru|zh|es|fr|de|it|ja|ko|pt)\/(.*)/);
          if (wrongRegion && wrongRegion[1] !== r && !isFlagLink && TOOL_SEGS.test(wrongRegion[2].split('/')[0])) {
            path = '/' + r + '/' + wrongRegion[2];
            changed = true;
          } else {
            var seg = path.match(/^\/(calculators|nutrition|compare|glossary|contact|about|privacy|terms|disclaimer|cookie-policy)(\/|$)/);
            var deepResto = /^\/restaurants\//.test(path);
            if ((seg || deepResto) && path.indexOf('/' + r + '/') !== 0) {
              path = '/' + r + path;
              changed = true;
            }
          }
        }
        if (path.length > 1 && path.charAt(path.length - 1) !== '/') {
          path += '/';
          changed = true;
        }
        if (changed) a.setAttribute('href', path + suffix);
      });
    } catch (e) {}
    moneyAnchor();
    eeatGuard();
  }
  function start() {
    normalize();
    if (typeof MutationObserver !== 'undefined' && document.body) {
      var pending = false;
      var obs = new MutationObserver(function () {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () { pending = false; normalize(); });
      });
      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () { obs.disconnect(); }, 15000);
    }
    setTimeout(normalize, 1500);
    setTimeout(normalize, 4000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  /* localized-title guard */
  // The bundle sets document.title from its English route metadata on mount,
  // which clobbers localized titles. Restore the server-rendered title once.
  (function () {
    var original = document.title;
    var head = document.head;
    var titleEl = document.querySelector('title');
    if (!original || !head || !titleEl) return;
    var restored = false;
    var mo = new MutationObserver(function () {
      if (restored) return;
      if (document.title !== original) {
        restored = true;
        mo.disconnect();
        document.title = original;
      }
    });
    mo.observe(titleEl, { childList: true, subtree: true, characterData: true });
    // bundle may also finish mounting after our own defer pass
    setTimeout(function () { if (!restored && document.title !== original) { restored = true; mo.disconnect(); document.title = original; } }, 3000);
  })();

})();
