// fonts.js — pull the real font family out of the typography tokens, load it
// from Google Fonts, and build a usable CSS font stack for the preview.
//
// DESIGN.md files describe fonts loosely: sometimes a clean `fontFamily: Inter`
// on each role, sometimes one descriptive string at the top of `typography`,
// e.g. "JetBrains Mono (next/font/google; weights 400·500·700) → ui-monospace,
// SFMono-Regular, …". We extract the primary family name from either shape.

const GENERIC = new Set([
  'ui-sans-serif', 'system-ui', 'sans-serif', 'ui-serif', 'serif', 'ui-monospace',
  'monospace', '-apple-system', 'blinkmacsystemfont', 'cursive', 'fantasy', 'emoji', 'math',
  'ui-rounded',
]);

/** Reduce a descriptive font string to just its primary family name. */
function extractFamily(raw) {
  if (typeof raw !== 'string') return '';
  // Cut at the first descriptor boundary: "(", arrow, or comma.
  let name = raw.split(/\s*(?:\(|→|->|,|\/)/)[0];
  name = name.replace(/["']/g, '').trim();
  return name;
}

const isGeneric = (name) => GENERIC.has(name.toLowerCase());

/** Guess the generic category from the raw declaration so fallbacks make sense. */
function category(raw) {
  const s = String(raw).toLowerCase();
  if (/\bmono(space)?\b/.test(s)) return 'monospace';
  if (/\bserif\b/.test(s) && !/\bsans[-\s]?serif\b/.test(s)) return 'serif';
  return 'sans-serif';
}

// Single-quoted, not double: these stacks get interpolated into
// double-quoted HTML style="..." attributes throughout the renderer, and an
// embedded `"` there silently truncates the attribute (dropping every CSS
// property that follows, e.g. a button's height set after its font-family).
const FALLBACK = {
  monospace: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  serif: "ui-serif, Georgia, Cambria, 'Times New Roman', serif",
  'sans-serif': "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
};

/**
 * Build a CSS font stack from a (possibly descriptive) family declaration:
 * the primary family quoted if needed, plus a category-appropriate fallback.
 */
export function familyStack(raw) {
  const name = extractFamily(raw);
  const tail = FALLBACK[category(raw)];
  if (!name || isGeneric(name)) return tail;
  const quoted = /[^a-zA-Z0-9-]/.test(name) ? `'${name}'` : name;
  return `${quoted}, ${tail}`;
}

/**
 * Inspect a design's typography and return:
 *   families — clean, non-generic family names to request from Google Fonts
 *   stack    — a ready-to-use CSS `font-family` value (or null when nothing usable)
 */
export function resolveFont(design) {
  const typography = design.typography || {};
  const raws = [];

  if (typeof typography.fontFamily === 'string') raws.push(typography.fontFamily);
  for (const value of Object.values(typography)) {
    if (value && typeof value === 'object' && typeof value.fontFamily === 'string') {
      raws.push(value.fontFamily);
    }
  }
  if (!raws.length) return { families: [], stack: null };

  const primaryRaw = raws[0];
  const seen = new Set();
  const families = [];
  for (const raw of raws) {
    const name = extractFamily(raw);
    if (!name || isGeneric(name)) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    families.push(name);
  }

  if (!families.length) return { families: [], stack: null };

  return { families, stack: familyStack(primaryRaw) };
}

let linkEl = null;

/** Load the given families from Google Fonts (best-effort; safe to call repeatedly). */
export function loadGoogleFonts(families) {
  if (!families || !families.length) return;
  const spec = families
    .map((f) => 'family=' + encodeURIComponent(f).replace(/%20/g, '+') + ':wght@300;400;500;600;700;800')
    .join('&');
  const href = `https://fonts.googleapis.com/css2?${spec}&display=swap`;
  if (!linkEl) {
    linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    document.head.appendChild(linkEl);
  }
  if (linkEl.href !== href) linkEl.href = href;
}
