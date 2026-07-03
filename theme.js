// theme.js — vocabulary-agnostic color intelligence.
//
// A DESIGN.md may name its colors anything: Material 3 (`surface`, `on-surface`,
// `primary`), a bespoke set (`accent`, `navy`, `glass-1`, `text-primary`), or
// something in between. This module maps whatever it finds onto the handful of
// semantic roles the preview actually needs — bg, surface, text, muted, border,
// accent, onAccent — using prioritized alias lists first and color heuristics as
// a fallback, so the preview is themed by the real tokens rather than defaults.

/* ---------------------------------------------------------------- parsing --- */

const NAMED = {
  white: { r: 255, g: 255, b: 255, a: 1 },
  black: { r: 0, g: 0, b: 0, a: 1 },
  transparent: { r: 0, g: 0, b: 0, a: 0 },
};

/** Parse a hex / rgb() / rgba() / a few named colors into {r,g,b,a}, or null. */
export function parseColor(input) {
  if (typeof input !== 'string') return null;
  const str = input.trim().toLowerCase();
  if (NAMED[str]) return NAMED[str];

  const hex = /^#([0-9a-f]{3,8})$/i.exec(str);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = h.split('').map((x) => x + x).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    };
  }

  const rgb = /^rgba?\(([^)]+)\)$/.exec(str);
  if (rgb) {
    const parts = rgb[1].split(/[,/\s]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const chan = (v) => (v.includes('%') ? Math.round((parseFloat(v) / 100) * 255) : parseFloat(v));
    return {
      r: chan(parts[0]),
      g: chan(parts[1]),
      b: chan(parts[2]),
      a: parts[3] != null ? parseFloat(parts[3]) : 1,
    };
  }
  return null;
}

/** Extract the first solid color out of a value (handles gradients). */
export function firstSolidColor(value) {
  if (typeof value !== 'string') return null;
  const direct = parseColor(value);
  if (direct) return { color: direct, str: value };
  const m = value.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/);
  if (m) {
    const c = parseColor(m[0]);
    if (c) return { color: c, str: m[0] };
  }
  return null;
}

/* ------------------------------------------------------------- measures --- */

const srgb = (c) => {
  const x = c / 255;
  return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
};

/** WCAG relative luminance 0..1. */
export function luminance(rgb) {
  if (!rgb) return 0;
  return 0.2126 * srgb(rgb.r) + 0.7152 * srgb(rgb.g) + 0.0722 * srgb(rgb.b);
}

/** HSL-style saturation 0..1. */
export function saturation(rgb) {
  if (!rgb) return 0;
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === min) return 0;
  const l = (max + min) / 2;
  return (max - min) / (1 - Math.abs(2 * l - 1) || 1);
}

/** True when a color reads as light (used for on-color contrast + theme guess). */
export function isLight(value) {
  const solid = firstSolidColor(value);
  return solid ? luminance(solid.color) > 0.5 : false;
}

/** Best-contrast ink (black or white) to place on top of the given color. */
function contrastInk(value) {
  return isLight(value) ? '#111111' : '#ffffff';
}

/* ------------------------------------------------------ contrast clamp --- */

/** WCAG contrast ratio between two parsed colors. */
function contrastRatio(a, b) {
  const hi = Math.max(luminance(a), luminance(b));
  const lo = Math.min(luminance(a), luminance(b));
  return (hi + 0.05) / (lo + 0.05);
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s, l };
}

function hslToRgb({ h, s, l }) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}

const toHex = ({ r, g, b }) => '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');

/**
 * Ensure `color` reads against `bg`. If it already meets the target contrast it
 * is returned untouched; otherwise its lightness is walked (hue/chroma kept)
 * just far enough to pass. Achromatic accents (white/black) flip toward the
 * readable end — which is exactly what a light/dark inversion should do.
 * Returns { color, changed }.
 */
function ensureContrast(colorValue, bgValue, target = 3) {
  const c = firstSolidColor(colorValue);
  const b = firstSolidColor(bgValue);
  if (!c || !b) return { color: colorValue, changed: false };
  if (contrastRatio(c.color, b.color) >= target) return { color: colorValue, changed: false };

  const darken = luminance(b.color) > 0.4; // light background → darken the accent
  const hsl = rgbToHsl(c.color);
  for (let i = 0; i < 50; i++) {
    hsl.l = darken ? Math.max(0, hsl.l - 0.02) : Math.min(1, hsl.l + 0.02);
    const rgb = hslToRgb(hsl);
    if (contrastRatio(rgb, b.color) >= target) return { color: toHex(rgb), changed: true };
    if (hsl.l <= 0 || hsl.l >= 1) break;
  }
  return { color: toHex(hslToRgb(hsl)), changed: true };
}

/* --------------------------------------------------------------- lookup --- */

/** First color whose (lowercased) key exactly equals one of the aliases. */
function pickAlias(colors, aliases) {
  const map = new Map(Object.keys(colors).map((k) => [k.toLowerCase(), k]));
  for (const alias of aliases) {
    const key = map.get(alias);
    if (key && colors[key]) return { key, value: colors[key] };
  }
  return null;
}

/** Most vivid non-neutral solid color — the accent when nothing is named. */
function mostSaturated(colors) {
  let best = null, bestSat = 0.22; // require some real chroma
  for (const value of Object.values(colors)) {
    const solid = firstSolidColor(value);
    if (!solid) continue;
    const lum = luminance(solid.color);
    if (lum < 0.05 || lum > 0.95) continue; // skip near-black / near-white
    const sat = saturation(solid.color);
    if (sat > bestSat) { bestSat = sat; best = value; }
  }
  return best;
}

/** Neutral (low-chroma) solid colors, sorted dark → light. */
function neutrals(colors) {
  return Object.values(colors)
    .map((v) => firstSolidColor(v))
    .filter((s) => s && s.color.a > 0.6 && saturation(s.color) < 0.25)
    .sort((a, b) => luminance(a.color) - luminance(b.color));
}

const BG_ALIASES = ['background', 'bg', 'canvas', 'page', 'body', 'base', 'surface-base',
  'surface-container-lowest', 'surface-dim', 'surface', 'navy-deep', 'navy', 'ink-0', 'base-0'];
const SURFACE_ALIASES = ['surface-container', 'surface-container-high', 'surface-container-low',
  'card', 'panel', 'glass-1', 'glass-2', 'glass-0', 'surface-variant', 'surface', 'elevated',
  'navy-raised', 'bg-elevated', 'fill', 'surface-1'];
const TEXT_ALIASES = ['text-primary', 'on-background', 'on-surface', 'text', 'foreground', 'fg',
  'ink', 'copy', 'content', 'text-1', 'body-text', 'heading'];
const MUTED_ALIASES = ['text-secondary', 'text-muted', 'on-surface-variant', 'muted', 'text-faint',
  'text-body-ink', 'secondary-text', 'subtle', 'text-2', 'text-tertiary'];
const BORDER_ALIASES = ['border-default', 'border', 'outline', 'border-hairline', 'divider',
  'stroke', 'outline-variant', 'border-strong', 'border-1'];
const ACCENT_ALIASES = ['accent', 'primary', 'brand', 'accent-1', 'brand-primary', 'interactive',
  'link', 'cta', 'highlight'];
const ON_ACCENT_ALIASES = ['on-accent', 'on-primary', 'accent-contrast', 'on-brand', 'accent-foreground'];

/**
 * Detect whether the design's palette is natively a dark or light theme.
 */
export function detectTheme(design) {
  const colors = design.colors || {};
  const bg = pickAlias(colors, BG_ALIASES);
  if (bg) return isLight(bg.value) ? 'light' : 'dark';
  const ns = neutrals(colors);
  if (ns.length) {
    const avg = ns.reduce((s, n) => s + luminance(n.color), 0) / ns.length;
    return avg < 0.5 ? 'dark' : 'light';
  }
  return 'dark';
}

/**
 * Resolve the semantic roles that drive the preview for a given target mode.
 * When `mode` matches the design's native theme the real tokens are used;
 * otherwise a clean opposite theme is synthesized while keeping the accent.
 */
export function resolveRoles(design, mode) {
  const roles = computeRoles(design, mode);
  // Guarantee the accent reads against the background it renders on. Minimal
  // nudge: palettes that already pass are left exactly as-is.
  const acc = ensureContrast(roles.accent, roles.bg, 3);
  roles.accent = acc.color;
  if (acc.changed) roles.onAccent = contrastInk(acc.color);
  return roles;
}

function computeRoles(design, mode) {
  const colors = design.colors || {};
  const native = detectTheme(design);

  // Accent (brand) is constant across both themes.
  const accentPick = pickAlias(colors, ACCENT_ALIASES);
  const accent = (accentPick && accentPick.value) || mostSaturated(colors) || '#5b8def';
  const onAccentPick = pickAlias(colors, ON_ACCENT_ALIASES);
  const onAccent = (onAccentPick && onAccentPick.value) || contrastInk(accent);

  if (mode === native) {
    const bg = pickAlias(colors, BG_ALIASES);
    const text = pickAlias(colors, TEXT_ALIASES);
    const surface = pickAlias(colors, SURFACE_ALIASES);
    const muted = pickAlias(colors, MUTED_ALIASES);
    const border = pickAlias(colors, BORDER_ALIASES);

    const ns = neutrals(colors);
    const bgVal = (bg && bg.value) || (native === 'dark' ? ns[0]?.str : ns[ns.length - 1]?.str) || (native === 'dark' ? '#0e0f12' : '#ffffff');
    const textVal = (text && text.value) || (native === 'dark' ? '#f5f6f8' : '#141414');
    return {
      theme: native,
      native,
      bg: bgVal,
      surface: (surface && surface.value) || `color-mix(in srgb, ${textVal} 7%, transparent)`,
      text: textVal,
      muted: (muted && muted.value) || `color-mix(in srgb, ${textVal} 60%, transparent)`,
      border: (border && border.value) || `color-mix(in srgb, ${textVal} 16%, transparent)`,
      accent,
      onAccent,
    };
  }

  // Opposite of native: synthesize a clean neutral theme, keep the accent.
  return synthesize(mode, accent, onAccent);
}

/** A tasteful neutral light/dark theme carrying the design's accent. */
function synthesize(mode, accent, onAccent) {
  if (mode === 'light') {
    return {
      theme: 'light', native: 'dark',
      bg: '#ffffff', surface: '#f5f6f8', text: '#16181d',
      muted: 'color-mix(in srgb, #16181d 55%, transparent)',
      border: 'color-mix(in srgb, #16181d 14%, transparent)',
      accent, onAccent,
    };
  }
  return {
    theme: 'dark', native: 'light',
    bg: '#0e0f12', surface: 'color-mix(in srgb, #ffffff 6%, transparent)', text: '#f5f6f8',
    muted: 'color-mix(in srgb, #f5f6f8 58%, transparent)',
    border: 'color-mix(in srgb, #f5f6f8 15%, transparent)',
    accent, onAccent,
  };
}
