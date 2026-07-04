// resolve.js — resolve "{group.token}" references and derive the component /
// typography / css-var helpers shared by the renderers. Color-role mapping now
// lives in theme.js; font extraction in fonts.js.
import { familyStack } from './fonts.js';

const REF_RE = /^\{([a-zA-Z0-9]+)\.([a-zA-Z0-9-]+)\}$/;
const REF_RE_G = /\{([a-zA-Z0-9]+)\.([a-zA-Z0-9-]+)\}/g;

function lookupRef(group, token, design, seen) {
  const key = group + '.' + token;
  if (seen.has(key)) return undefined; // guard against cycles
  const bucket = design[group];
  if (!bucket || !(token in bucket)) return undefined; // dangling ref
  const next = new Set(seen);
  next.add(key);
  return resolveRef(bucket[token], design, next);
}

/**
 * Resolve a single token value. A value that is *entirely* one "{group.token}"
 * reference resolves to the referenced value as-is (which may be a non-string,
 * e.g. a typography object). A ref embedded inside a larger string (e.g. a
 * shorthand like "3px solid {colors.line}") is substituted inline wherever it
 * resolves to a string or number; anything else is left as a literal.
 */
export function resolveRef(value, design, seen = new Set()) {
  if (typeof value !== 'string') return value;
  const m = value.match(REF_RE);
  if (m) {
    const [, group, token] = m;
    const resolved = lookupRef(group, token, design, seen);
    return resolved === undefined ? value : resolved;
  }
  if (!value.includes('{')) return value;
  return value.replace(REF_RE_G, (match, group, token) => {
    const resolved = lookupRef(group, token, design, seen);
    return typeof resolved === 'string' || typeof resolved === 'number' ? String(resolved) : match;
  });
}

/** Turn a typography token object into an inline CSS style string. */
export function typographyToCss(t) {
  if (!t || typeof t !== 'object') return '';
  const parts = [];
  if (t.fontFamily) parts.push(`font-family:${familyStack(t.fontFamily)}`);
  if (t.fontSize) parts.push(`font-size:${t.fontSize}`);
  if (t.fontWeight) parts.push(`font-weight:${t.fontWeight}`);
  if (t.lineHeight) parts.push(`line-height:${t.lineHeight}`);
  if (t.letterSpacing) parts.push(`letter-spacing:${t.letterSpacing}`);
  if (t.fontFeature) parts.push(`font-feature-settings:${t.fontFeature}`);
  if (t.fontVariation) parts.push(`font-variation-settings:${t.fontVariation}`);
  return parts.join(';');
}

/**
 * Emit color / rounded / spacing tokens as CSS custom properties so the preview
 * DOM can consume them (e.g. var(--color-accent)).
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

function buildComponent(name, raw, design) {
  if (!raw || typeof raw !== 'object') return null;

  const resolved = {};
  for (const [prop, val] of Object.entries(raw)) resolved[prop] = resolveRef(val, design);

  const decls = [];
  if (resolved.backgroundColor) decls.push(`background:${resolved.backgroundColor}`);
  if (resolved.textColor) decls.push(`color:${resolved.textColor}`);
  if (resolved.border) decls.push(`border:${resolved.border}`);
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

// State-variant suffixes: `button-primary-hover` is a variant of `button-primary`.
const STATE_SUFFIX = /^(.*)-(hover|active|focus|focused|pressed|disabled|selected|checked|open|default)$/i;

/**
 * Build a resolved component style object: every property with refs resolved,
 * and a ready-to-use inline CSS string (`css`) plus the raw typography token if any.
 * A state variant (e.g. `button-primary-hover`) that has a matching base
 * component inherits the base's shape (radius, padding, height, type), with the
 * variant's own declarations overriding — so a partial variant that only sets a
 * color still looks like the button it belongs to.
 */
export function resolveComponent(name, design) {
  const raw = design.components[name];
  if (!raw || typeof raw !== 'object') return null;
  const m = STATE_SUFFIX.exec(name);
  const base = m && design.components[m[1]];
  const effective = base && typeof base === 'object' ? { ...base, ...raw } : raw;
  return buildComponent(name, effective, design);
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
