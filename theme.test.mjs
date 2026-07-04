// Unit tests for the pure logic modules. Run: `npm test` (node --test).
// These import theme/fonts/backdrops directly and never touch parse.js, so the
// CDN js-yaml import is not exercised here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseColor, luminance, saturation, detectTheme, resolveRoles, firstSolidColor, flattenColor, contrastRatio } from './theme.js';
import { resolveFont, familyStack } from './fonts.js';
import { backdropCss } from './backdrops.js';
import { toCssVars, toTailwind, toJson } from './exports.js';

// Fixtures: a custom-vocabulary dark palette + a Material-3 dark palette + a light one.
const vibemail = {
  colors: {
    accent: '#30d158', 'on-accent': '#06210f', navy: '#111111',
    canvas: 'radial-gradient(120% 120% at 80% -10%, #1e1e1e 0%, #111111 42%, #080808 100%)',
    'glass-1': 'rgba(255,255,255,0.08)', 'border-default': 'rgba(255,255,255,0.14)',
    'text-primary': '#fdfcfc', 'text-secondary': '#c8c9d4',
  },
  typography: { fontFamily: 'JetBrains Mono (next/font/google) → ui-monospace, monospace', body: { fontSize: '14px' } },
  rounded: { sm: '7px' },
};
const atmos = {
  colors: { background: '#0b1326', 'on-background': '#dae2fd', primary: '#ffffff', 'on-primary': '#2f3131', 'surface-container': '#171f33', outline: '#8e9192' },
  typography: { 'display-lg': { fontFamily: 'Inter', fontSize: '84px' } },
  rounded: {},
};
const lightish = { colors: { background: '#ffffff', 'on-background': '#111111', accent: '#2563eb' }, typography: {}, rounded: {} };

test('parseColor handles hex, shorthand, and rgba', () => {
  assert.deepEqual(parseColor('#fff'), { r: 255, g: 255, b: 255, a: 1 });
  assert.deepEqual(parseColor('#30d158'), { r: 48, g: 209, b: 88, a: 1 });
  assert.equal(parseColor('rgba(255,255,255,0.08)').a, 0.08);
  assert.equal(parseColor('not-a-color'), null);
});

test('luminance orders light above dark; saturation flags chroma', () => {
  assert.ok(luminance(parseColor('#ffffff')) > luminance(parseColor('#000000')));
  assert.ok(saturation(parseColor('#30d158')) > saturation(parseColor('#808080')));
});

test('firstSolidColor extracts a stop from a gradient', () => {
  assert.equal(firstSolidColor(vibemail.colors.canvas).str, '#1e1e1e');
});

test('detectTheme reads native brightness', () => {
  assert.equal(detectTheme(vibemail), 'dark');
  assert.equal(detectTheme(atmos), 'dark');
  assert.equal(detectTheme(lightish), 'light');
});

test('resolveRoles maps a custom vocabulary onto roles', () => {
  const r = resolveRoles(vibemail, 'dark');
  assert.equal(r.accent, '#30d158'); // brand green, not a default
  assert.equal(r.onAccent, '#06210f');
  assert.equal(r.text, '#fdfcfc');
  assert.match(r.bg, /radial-gradient/); // keeps the canvas gradient
});

test('accent is kept when it already passes contrast', () => {
  assert.equal(resolveRoles(vibemail, 'dark').accent, '#30d158');
});

test('accent is clamped (not invisible) in a synthesized light theme', () => {
  const r = resolveRoles(atmos, 'light'); // white accent over synthesized white bg
  assert.equal(r.bg, '#ffffff');
  assert.notEqual(r.accent.toLowerCase(), '#ffffff'); // must be darkened to read
  assert.equal(r.onAccent, '#ffffff'); // recomputed for the darkened fill
});

test('contrastRatio grades black-on-white at the WCAG maximum', () => {
  const r = contrastRatio(parseColor('#000000'), parseColor('#ffffff'));
  assert.ok(Math.abs(r - 21) < 0.01);
  // Order-independent.
  assert.equal(contrastRatio(parseColor('#fff'), parseColor('#000')).toFixed(2), '21.00');
});

test('flattenColor resolves hex, alpha, and one-level color-mix', () => {
  // Plain hex passes through.
  const hex = flattenColor('#3d6bff');
  assert.deepEqual({ r: hex.r, g: hex.g, b: hex.b }, { r: 61, g: 107, b: 255 });
  // Translucent black over a white backdrop lands mid-grey.
  const half = flattenColor('rgba(0,0,0,0.5)', { r: 255, g: 255, b: 255, a: 1 });
  assert.ok(Math.abs(half.r - 127.5) < 1 && Math.abs(half.g - 127.5) < 1);
  // A color-mix fade to transparent keeps its hue (premultiplied), composited on white.
  const mixed = flattenColor('color-mix(in srgb, #16181d 50%, transparent)', { r: 255, g: 255, b: 255, a: 1 });
  assert.ok(mixed.r > 130 && mixed.r < 150); // ~ halfway between #16 and #ff
});

test('resolveFont extracts the primary family from a descriptive string', () => {
  const f = resolveFont(vibemail);
  assert.deepEqual(f.families, ['JetBrains Mono']);
  assert.match(f.stack, /'JetBrains Mono'/);
  assert.match(f.stack, /monospace/);
});

test('resolveFont returns null stack when no typography', () => {
  assert.equal(resolveFont({ typography: {} }).stack, null);
});

test('familyStack picks a category-appropriate fallback', () => {
  assert.match(familyStack('Inter'), /sans-serif$/);
  assert.match(familyStack('JetBrains Mono → mono'), /monospace$/);
  assert.match(familyStack('Lora, serif'), /serif$/);
});

test('backdropCss builds theme-aware, accent-tinted backgrounds', () => {
  const r = resolveRoles(vibemail, 'dark');
  assert.equal(backdropCss('design', r), r.bg);
  assert.match(backdropCss('aurora', r), /radial-gradient/);
  assert.match(backdropCss('aurora', r), /#30d158/); // carries the accent
  assert.match(backdropCss('dots', r), /20px 20px/); // pattern size
  assert.equal(backdropCss('plain', r), '#1e1e1e'); // solid base from the gradient
});

test('toCssVars emits :root custom properties for each token group', () => {
  const css = toCssVars(vibemail);
  assert.match(css, /:root \{/);
  assert.match(css, /--color-accent: #30d158;/);
  assert.match(css, /--radius-sm: 7px;/);
  assert.match(css, /--font: 'JetBrains Mono'/);
});

test('toTailwind emits a valid config with token maps', () => {
  const out = toTailwind(vibemail);
  assert.match(out, /module\.exports = \{/);
  const marker = 'module.exports = ';
  const json = JSON.parse(out.slice(out.indexOf(marker) + marker.length).replace(/;\s*$/, ''));
  assert.equal(json.theme.extend.colors.accent, '#30d158');
  assert.equal(json.theme.extend.borderRadius.sm, '7px');
  assert.ok(Array.isArray(json.theme.extend.fontFamily.brand));
});

test('toJson round-trips the token sections', () => {
  const obj = JSON.parse(toJson(vibemail));
  assert.equal(obj.colors.accent, '#30d158');
  assert.equal(obj.rounded.sm, '7px');
});
