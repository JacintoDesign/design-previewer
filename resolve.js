// resolve.js — resolve "{group.token}" references and derive helpers used by both renderers.

const REF_RE = /^\{([a-zA-Z0-9]+)\.([a-zA-Z0-9-]+)\}$/;

/**
 * Resolve a single token value. If it is a "{group.token}" reference, look it up
 * in the design; otherwise return the literal unchanged. Typography references
 * resolve to the typography object (not a string).
 */
export function resolveRef(value, design, seen = new Set()) {
  if (typeof value !== 'string') return value;
  const m = value.match(REF_RE);
  if (!m) return value;

  const [, group, token] = m;
  const key = group + '.' + token;
  if (seen.has(key)) return value; // guard against cycles
  seen.add(key);

  const bucket = design[group];
  if (!bucket || !(token in bucket)) return value; // dangling ref → leave as-is
  return resolveRef(bucket[token], design, seen);
}

/** Pick the first available color role from a candidate list. */
export function pickColor(colors, candidates, fallback) {
  for (const name of candidates) {
    if (colors[name]) return colors[name];
  }
  return fallback;
}

/** Turn a typography token object into an inline CSS style string. */
export function typographyToCss(t) {
  if (!t || typeof t !== 'object') return '';
  const parts = [];
  if (t.fontFamily) parts.push(`font-family:${quoteFamily(t.fontFamily)}`);
  if (t.fontSize) parts.push(`font-size:${t.fontSize}`);
  if (t.fontWeight) parts.push(`font-weight:${t.fontWeight}`);
  if (t.lineHeight) parts.push(`line-height:${t.lineHeight}`);
  if (t.letterSpacing) parts.push(`letter-spacing:${t.letterSpacing}`);
  if (t.fontFeature) parts.push(`font-feature-settings:${t.fontFeature}`);
  if (t.fontVariation) parts.push(`font-variation-settings:${t.fontVariation}`);
  return parts.join(';');
}

function quoteFamily(family) {
  // Add quotes around multi-word families, keep generic fallback.
  const primary = /[^a-zA-Z0-9-]/.test(family) ? `"${family}"` : family;
  return `${primary}, system-ui, sans-serif`;
}

/** Collect every distinct fontFamily referenced in the typography tokens. */
export function collectFontFamilies(design) {
  const set = new Set();
  for (const t of Object.values(design.typography)) {
    if (t && t.fontFamily) set.add(t.fontFamily);
  }
  return [...set];
}

/**
 * Emit color / rounded / spacing tokens as CSS custom properties so the preview
 * DOM can consume them (e.g. var(--color-primary)).
 */
export function tokensToCssVars(design) {
  const lines = [];
  for (const [k, v] of Object.entries(design.colors)) lines.push(`--color-${k}: ${v};`);
  for (const [k, v] of Object.entries(design.rounded)) lines.push(`--rounded-${cssKey(k)}: ${v};`);
  for (const [k, v] of Object.entries(design.spacing)) lines.push(`--spacing-${cssKey(k)}: ${v};`);
  return lines.join('\n');
}

function cssKey(k) {
  return String(k).toLowerCase();
}

/**
 * Build a resolved component style object: every property with refs resolved,
 * and a ready-to-use inline CSS string (`css`) plus the raw typography token if any.
 */
export function resolveComponent(name, design) {
  const raw = design.components[name];
  if (!raw || typeof raw !== 'object') return null;

  const resolved = {};
  for (const [prop, val] of Object.entries(raw)) resolved[prop] = resolveRef(val, design);

  const decls = [];
  if (resolved.backgroundColor) decls.push(`background:${resolved.backgroundColor}`);
  if (resolved.textColor) decls.push(`color:${resolved.textColor}`);
  if (resolved.rounded) decls.push(`border-radius:${resolved.rounded}`);
  if (resolved.padding) decls.push(`padding:${resolved.padding}`);
  if (resolved.height) decls.push(`height:${resolved.height}`);
  if (resolved.width) decls.push(`width:${resolved.width}`);
  if (resolved.size) {
    decls.push(`width:${resolved.size}`);
    decls.push(`height:${resolved.size}`);
  }
  const typo = resolved.typography && typeof resolved.typography === 'object' ? resolved.typography : null;
  const typoCss = typographyToCss(typo);
  if (typoCss) decls.push(typoCss);

  return { name, resolved, css: decls.join(';'), typography: typo };
}

/** Find the first component whose name matches any of the given substrings. */
export function findComponent(design, patterns) {
  const names = Object.keys(design.components);
  for (const pat of patterns) {
    const hit = names.find((n) => n.toLowerCase().includes(pat));
    if (hit) return resolveComponent(hit, design);
  }
  return null;
}
