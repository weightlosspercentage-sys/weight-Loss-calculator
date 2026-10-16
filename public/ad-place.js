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

  // Never monetise trust pages, or the thin locales pruned from the deploy.
  if (/(^|\/)(privacy|terms|contact|disclaimer)(\/|$)/i.test(path)) return;
  if (/^\/(zh|ru)(\/|$)/i.test(path)) return;

  var CLIENT = 'ca-pub-7203223934454111';
  var TOP = '8714170901';
  var PRE_FOOTER = '9720699039';

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
    wrap.style.cssText = 'margin:2rem 0;padding:0 1rem;box-sizing:border-box;min-height:' + (minHeight + 18) + 'px';
    var label = document.createElement('p');
    label.textContent = 'Advertisement';
    label.style.cssText = 'margin:0 0 4px;font-size:10px;line-height:14px;letter-spacing:.08em;text-transform:uppercase;color:#94a3b8;text-align:center';
    var ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.cssText = 'display:block;width:100%;min-height:' + minHeight + 'px';
    ins.setAttribute('data-ad-client', CLIENT);
    ins.setAttribute('data-ad-slot', slot);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    wrap.appendChild(label);
    wrap.appendChild(ins);
    return wrap;
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

  function normalize() {
    dropHiddenSidebarAds();

    var isHome = path === '/' || /^\/(us|uk|ca|au|nz|cn|sg|ae)$/.test(path);
    var isNewborn = /\/calculators\/newborn-weight-loss$/i.test(path);

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
    if (/\/calculators\/[^/]/i.test(path) && adCount() < 1) {
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
