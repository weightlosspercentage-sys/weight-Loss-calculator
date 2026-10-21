/*
 * AdSense anchor placement for routes rendered by the legacy React bundle.
 *
 * Why this exists instead of editing page markup: createRoot(#root).render()
 * (assets/index-Ctp2HkQJ.js) *replaces* #root's children rather than hydrating
 * them, so any <ins> shipped in the static HTML is destroyed on mount, and
 * `html.has-react` CSS additionally hides `#root > *`. This script waits for the
 * bundle to mount, then inserts each unit as a block sibling of a content card.
 *
 * Invariant: an ad is never placed inside a form/fieldset, and never inside a
 * container that holds the calculator's own input controls.
 */
(function () {
  var LIMIT = 3;
  var path = location.pathname.replace(/\/+$/, '') || '/';

  // Never monetise trust pages. The zh/ru trees are NOT excluded: they are
  // indexable, self-canonicalised and listed in sitemap-international.xml, so
  // leaving them out cost them every direct placement.
  if (/(^|\/)(privacy|terms|contact|disclaimer|cookie-policy|accessibility)(\/|$)/i.test(path)) return;

  var CLIENT = 'ca-pub-7203223934454111';
  var TOP = '8714170901';
  var PRE_FOOTER = '9720699039';

  var isHome = path === '/' || /^\/(us|uk|ca|au|nz|cn|sg|ae)$/.test(path);
  var isNewborn = /\/calculators\/newborn-weight-loss$/i.test(path);
  // The 2C default placement: any calculator page that is not one of the two
  // routes with hand-picked anchors.
  var isDefaultCalc = !isHome && !isNewborn && /\/calculators\/[^/]/i.test(path);

  function hasControls(el) {
    return !!(el && el.querySelector && el.querySelector('input, select, textarea'));
  }

  function inForm(el) {
    var node = el;
    while (node && node !== document.body) {
      var tag = node.tagName;
      if (tag === 'FORM' || tag === 'FIELDSET') return true;
      node = node.parentElement;
    }
    return false;
  }

  // Climb a text anchor (<p>, <h2>) out to the card that wraps it, stopping the
  // moment an ancestor would pull us into the calculator's controls. Used only
  // for inline anchors; block anchors are already the right insertion point.
  function cardOf(el) {
    var best = el;
    var node = el;
    while (node.parentElement && node.parentElement !== document.body) {
      if (hasControls(node.parentElement) || inForm(node.parentElement)) break;
      best = node.parentElement;
      node = node.parentElement;
    }
    return best;
  }

  function adCount() {
    return document.querySelectorAll('ins.adsbygoogle').length;
  }

  function makeUnit(slot, minHeight) {
    var wrap = document.createElement('div');
    wrap.className = 'wl-ad';
    wrap.setAttribute('data-wl-ad', slot);
    wrap.setAttribute('data-wl-owned', '1');
    // overflow:hidden is what keeps the page from being widened: the unit is a
    // grid item's child, so a creative measured to the viewport would otherwise
    // set that item's min-content width and push the track past the container.
    wrap.style.cssText = 'margin:2rem 0;padding:0 1rem;box-sizing:border-box;min-width:0;max-width:100%;overflow:hidden;min-height:' + (minHeight + 18) + 'px';
    var label = document.createElement('p');
    label.textContent = 'Advertisement';
    label.style.cssText = 'margin:0 0 4px;font-size:10px;line-height:14px;letter-spacing:.08em;text-transform:uppercase;color:#475569;text-align:center';
    var ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.setAttribute('data-wl-owned', '1');
    ins.style.cssText = 'display:block;width:100%;min-height:' + minHeight + 'px';
    ins.setAttribute('data-ad-client', CLIENT);
    ins.setAttribute('data-ad-slot', slot);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    wrap.appendChild(label);
    wrap.appendChild(ins);
    return wrap;
  }

  // A grid/flex item's automatic minimum size is its min-content width, so a
  // creative sized to the viewport inside a padded card widens the track past
  // the container and the page scrolls sideways. Releasing min-width lets the
  // wrapper's own clamp work. Attributed on the live site at 390px: with only
  // this script blocked AdSense still injects 9 units and the page overflows
  // 0px, while with it running the page overflows 16px - the bleed is ours.
  function releaseAutoMinWidth(el) {
    for (var i = 0; el && i < 3; i++) {
      var parent = el.parentElement;
      if (!parent) break;
      var d = getComputedStyle(parent).display;
      if (d.indexOf('grid') === -1 && d.indexOf('flex') === -1) {
        el = parent;
        continue;
      }
      if (getComputedStyle(el).minWidth !== '0px') el.style.minWidth = '0';
      el = parent;
    }
  }

  // The client router owns only the routes compiled into the bundle, so a direct
  // load of e.g. /es/calculators/calorie-deficit/ replaces #root with the app's
  // own "404 / Page not found" view while the URL still answers HTTP 200 over a
  // complete committed page. AdSense forbids units on error pages, and measured
  // live this script was placing a 390x408 box under that message on 10 of 34
  // probed es paths. Detection is the h1 the view renders, not the status code.
  function isErrorView() {
    var root = document.getElementById('root') || document.body;
    var h1 = root.querySelector('h1');
    var head = (h1 && h1.textContent || '').trim();
    if (head === '404' || /^404\b/.test(head)) return true;
    var txt = (root.textContent || '').slice(0, 300);
    return /page not found/i.test(txt) && /go home/i.test(txt);
  }

  // Take back every unit we created, but only those AdSense has not begun work
  // on: a detached div behind a queued push is the loader's Error: no_div.
  function dropOwnUnits() {
    var mine = ownedWrappers();
    for (var i = mine.length - 1; i >= 0; i--) {
      if (mine[i].parentElement && !pushed(mine[i])) mine[i].parentElement.removeChild(mine[i]);
    }
  }

  function fill(ins) {
    if (!ins || ins.getAttribute('data-wl-filled') === '1') return;
    ins.setAttribute('data-wl-filled', '1');
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      // Auto Ads may have claimed this unit already; never push twice.
    }
  }

  function lazyFill(unit, ins) {
    if (typeof IntersectionObserver === 'undefined') {
      fill(ins);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        fill(ins);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '400px 0px' });
    io.observe(unit);
  }

  // anchor: the element whose position we key off. climb: true for inline anchors.
  function place(anchor, slot, position, climb) {
    if (!anchor || anchor.getAttribute('data-wl-placed') === '1') return;
    if (adCount() >= LIMIT) return;

    var card = climb ? cardOf(anchor) : anchor;
    if (!card.parentElement) return;
    if (inForm(card.parentElement)) return;
    if (card.querySelector('ins.adsbygoogle')) return;

    anchor.setAttribute('data-wl-placed', '1');
    var unit = makeUnit(slot, 280);
    card.parentElement.insertBefore(unit, position === 'before' ? card : card.nextSibling);
    releaseAutoMinWidth(unit.parentElement);
    lazyFill(unit, unit.querySelector('ins.adsbygoogle'));
  }

  function byHeading(re) {
    var heads = document.querySelectorAll('h1, h2, h3');
    for (var i = 0; i < heads.length; i++) {
      if (re.test((heads[i].textContent || '').trim())) return heads[i];
    }
    return null;
  }

  // The bundle's third unit sits in a `hidden lg:block` container, so desktop
  // sees 3 ads and mobile 2. Dharma1 and Dharma 2 are the placements that were
  // asked for: drop the viewport-hidden one and keep three on every viewport.
  // Remove only the ad's own wrapper, never the whole sidebar column, so the
  // sidebar's internal links survive.
  function dropHiddenSidebarAds() {
    var units = document.querySelectorAll('ins.adsbygoogle');
    for (var i = 0; i < units.length; i++) {
      var hidden = null;
      var node = units[i].parentElement;
      while (node && node !== document.body) {
        var cls = typeof node.className === 'string' ? node.className : '';
        if (/(^|\s)hidden(\s|$)/.test(cls) && /lg:block/.test(cls)) { hidden = node; break; }
        node = node.parentElement;
      }
      if (!hidden) continue;
      // At the lg breakpoint this wrapper is visible, so the bundle's Li can intersect it and
      // push it before we get here. Taking back a div AdSense is already working on is the
      // loader's Error: no_div, so a pushed sidebar unit is left in place and only spends part
      // of the budget instead of being detached mid-request.
      if (pushed(units[i])) continue;

      var wrapper = units[i].parentElement;
      var keepsSiblingContent = wrapper && Array.prototype.some.call(
        wrapper.children, function (c) { return c.tagName !== 'INS' && c.tagName !== 'P'; }
      );
      if (!wrapper || keepsSiblingContent || wrapper === hidden) wrapper = units[i];
      if (wrapper && wrapper.parentElement) wrapper.parentElement.removeChild(wrapper);
    }
  }

  function lastInputFreeBlock(main) {
    var last = null;
    for (var j = 0; j < main.children.length; j++) {
      var child = main.children[j];
      if (hasControls(child) || inForm(child)) break;
      if (child.querySelector && child.querySelector('ins.adsbygoogle')) continue;
      last = child;
    }
    return last || main.lastElementChild;
  }

  function ownedWrappers() {
    // Wrappers this script created, and nothing else. A committed or Astro-rendered
    // .ad-banner is a unit we did not place: its own inline script pushes it
    // (AdBanner.astro:83-88), so it can be filled while looking untouched to us.
    return document.querySelectorAll('[data-wl-owned].wl-ad');
  }

  // AdSense stamps a div once it has processed the push for it: data-adsbygoogle-status and
  // a child iframe. That is true however the push happened - our fill(), AdBanner.astro's
  // inline script, or the bundle's Li component - so it is the only signal that works for
  // units we did not create. data-wl-filled is ours alone and is checked as well, because
  // it is set at push time, before AdSense has had a chance to answer.
  function pushed(node) {
    var ins = node.matches && node.matches('ins.adsbygoogle') ? node : node.querySelector('ins.adsbygoogle');
    if (!ins) return false;
    return ins.hasAttribute('data-adsbygoogle-status') || ins.children.length > 0 ||
      ins.getAttribute('data-wl-filled') === '1';
  }

  // The bundle mounts its own ad component *after* the first placement pass, so
  // a count taken at insertion time cannot see it. Yielding is slot-specific:
  // 2C asks for TOP, so a bundle unit sitting in a different slot (its
  // in-article 8863033072) does not satisfy the brief and must not suppress our
  // placement — it only spends part of the 3-unit budget. Auto Ads units are
  // slot-less and deliberately not considered here.
  function foreignSlotTaken(slot) {
    return document.querySelectorAll('ins.adsbygoogle[data-ad-slot="' + slot + '"]:not([data-wl-owned])').length > 0;
  }

  function reconcile() {
    // 2C asks for the default unit once per page. If the bundle already supplies
    // that slot, it is the placement; drop ours rather than stacking a second.
    if (isDefaultCalc && foreignSlotTaken(TOP)) {
      var mine = document.querySelectorAll('.wl-ad[data-wl-owned]');
      for (var i = 0; i < mine.length; i++) {
        if (mine[i].parentElement && !pushed(mine[i])) mine[i].parentElement.removeChild(mine[i]);
      }
    }
    // Hard rule: never more than LIMIT ads in a view. Trim our own, last first, and never
    // a unit already pushed: the loader throws Error: no_div when the div its queued push
    // resolves to is !isConnected, and that throw happens inside adsbygoogle.js where our
    // try/catch cannot see it. So an unfilled unit is the only safe thing to take back.
    var all = document.querySelectorAll('ins.adsbygoogle');
    if (all.length <= LIMIT) return;
    var ours = ownedWrappers();
    for (var k = ours.length - 1; k >= 0 && document.querySelectorAll('ins.adsbygoogle').length > LIMIT; k--) {
      var orphaned = ours[k].parentElement === null;
      if (orphaned || pushed(ours[k])) continue;
      ours[k].parentElement.removeChild(ours[k]);
    }
  }

  function normalize() {
    if (isErrorView()) {
      dropOwnUnits();
      return;
    }

    dropHiddenSidebarAds();
    reconcile();

    if (isNewborn) {
      place(document.getElementById('quick-answer-snippet'), TOP, 'after', true);
      place(byHeading(/^Newborn Weight Loss Chart$/i), PRE_FOOTER, 'after', true);
      return;
    }

    if (isHome) {
      place(document.getElementById('calculator'), TOP, 'after', false);
      var faq = byHeading(/FAQ|Frequently Asked Questions/i);
      if (faq) place(faq.closest('section') || faq, PRE_FOOTER, 'before', false);
      return;
    }

    // Reusable default for every other calculator. Static pages such as
    // /calculators/calorie-deficit/ ship no bundle and so rendered zero ads.
    // Keyed off slot-tagged units only, never off adCount(): Auto Ads injects
    // slot-less <ins> nodes, and when one of those wins the race it must not
    // swallow the placement the brief asks for by name (BMI, TDEE, calorie
    // deficit). The per-view cap is still enforced by place() and reconcile().
    if (isDefaultCalc && !document.querySelector('ins.adsbygoogle[data-wl-owned]') && !foreignSlotTaken(TOP)) {
      var main = document.getElementById('main-content') || document.querySelector('main');
      if (main) place(lastInputFreeBlock(main), TOP, 'after', false);
    }
  }

  function start() {
    normalize();
    if (typeof MutationObserver !== 'undefined' && document.body) {
      var queued = false;
      var obs = new MutationObserver(function () {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () {
          queued = false;
          normalize();
        });
      });
      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () { obs.disconnect(); }, 15000);
    }
    setTimeout(normalize, 1500);
    setTimeout(normalize, 4000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
