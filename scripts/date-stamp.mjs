// The date policy for JSON-LD: what may be claimed, and what must be deleted instead.
//
// Extracted from astro.config.mjs step 13 because the answer depends on whether this build
// can see real history, and Cloudflare Pages does a shallow clone: git log there returns one
// commit, so content-dates.mjs correctly refuses to trust it, and every page then falls into
// the no-evidence branch. That branch used to *apply* the frozen 2026-09-15 to any schema node
// lacking a dateModified - so the CI artifact, not the local one, was the one inventing dates.
// A claim with no evidence behind it is now deleted rather than substituted or injected.
//
// Kept out of the config so the two branches can be tested without a 17-minute build.

export const FROZEN_DATEMODIFIED = '2026-09-15';
// scripts/eeat-enrich.mjs:100 wrote this literal into every JSON-LD block it touched. The
// repository's first commit is 2026-05-26, so nothing in this tree backs a 2025-03-01
// publication. Matched as a literal, never as "any date", so a genuine datePublished is
// never overwritten.
export const FABRICATED_DATEPUBLISHED = '2025-03-01';
export const DATE_STAMPED_TYPES = ['WebApplication', 'SoftwareApplication', 'MedicalWebPage', 'FAQPage', 'HowTo'];

/**
 * Rewrite date claims in one page's JSON-LD.
 * @param {string} html
 * @param {{modified: string|null, published: string|null}} ev evidence for this exact file;
 *        null means "this build cannot know", which is not the same as "there is no date".
 * @returns {{html: string, datePublishedApplied: boolean, dateModifiedApplied: boolean,
 *            claimsDropped: boolean, warned: string|null}}
 */
export function applyDateClaims(html, ev) {
  let datePublishedApplied = false;
  let dateModifiedApplied = false;
  let claimsDropped = false;
  let warned = null;

  const out = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi, (block, inner) => {
    let data;
    try {
      data = JSON.parse(inner);
    } catch (err) {
      if (!warned) warned = err.message;
      return block;
    }
    let touched = false;
    const visit = (node) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) {
        for (const item of node) visit(item);
        return;
      }
      const t = node['@type'];
      const types = Array.isArray(t) ? t : [t];

      const pub = typeof node.datePublished === 'string' ? node.datePublished.slice(0, 10) : null;
      if (pub === FABRICATED_DATEPUBLISHED) {
        if (ev.published) {
          node.datePublished = ev.published;
          touched = true;
          datePublishedApplied = true;
        } else {
          delete node.datePublished;
          touched = true;
          claimsDropped = true;
        }
      }
      // re-read: the value above may be the one just corrected
      const pubNow = typeof node.datePublished === 'string' ? node.datePublished.slice(0, 10) : null;

      if (typeof node.dateModified === 'string') {
        if (node.dateModified.slice(0, 10) === FROZEN_DATEMODIFIED) {
          if (ev.modified && (!pubNow || ev.modified >= pubNow)) {
            node.dateModified = ev.modified;
            touched = true;
            dateModifiedApplied = true;
          } else {
            // Either no evidence, or the real date would sit before the page's own publication.
            delete node.dateModified;
            touched = true;
            claimsDropped = true;
          }
        }
      } else if (!node.dateModified && types.some((x) => DATE_STAMPED_TYPES.includes(x))) {
        // Only ever inject a date this build can back. The old fallback stamped the frozen
        // literal here, which is the fabrication that reaches production on a shallow clone.
        if (ev.modified && (!pubNow || ev.modified >= pubNow)) {
          node.dateModified = ev.modified;
          touched = true;
          dateModifiedApplied = true;
        }
      }

      for (const value of Object.values(node)) visit(value);
    };
    visit(data);
    if (!touched) return block;
    return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
  });

  return { html: out, datePublishedApplied, dateModifiedApplied, claimsDropped, warned };
}
