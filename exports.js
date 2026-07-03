// exports.js — turn a parsed design into copy-pasteable code for other tools.
import { resolveFont } from './fonts.js';

const kebab = (k) => String(k).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const isStr = (v) => typeof v === 'string' || typeof v === 'number';

/** Distinct fontSize values per typography role. */
function typeScale(design) {
  const out = {};
  for (const [name, t] of Object.entries(design.typography || {})) {
    if (t && typeof t === 'object' && t.fontSize) out[name] = String(t.fontSize);
  }
  return out;
}

/** CSS custom properties under :root. */
export function toCssVars(design) {
  const lines = [':root {'];
  const push = (prefix, obj) => {
    for (const [k, v] of Object.entries(obj || {})) {
      if (isStr(v)) lines.push(`  --${prefix}-${kebab(k)}: ${v};`);
    }
  };
  push('color', design.colors);
  push('radius', design.rounded);
  push('space', design.spacing);
  push('shadow', design.shadows);
  push('motion', design.motion);
  const font = resolveFont(design).stack;
  if (font) lines.push(`  --font: ${font};`);
  for (const [k, v] of Object.entries(typeScale(design))) lines.push(`  --text-${kebab(k)}: ${v};`);
  lines.push('}');
  return lines.join('\n');
}

/** A Tailwind theme.extend config. */
export function toTailwind(design) {
  const strMap = (obj) => Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => isStr(v)).map(([k, v]) => [kebab(k), String(v)]));
  const font = resolveFont(design).stack;
  const extend = {
    colors: strMap(design.colors),
    borderRadius: strMap(design.rounded),
    spacing: strMap(design.spacing),
    boxShadow: strMap(design.shadows),
    fontSize: typeScale(design),
  };
  if (font) extend.fontFamily = { brand: font.split(',').map((s) => s.replace(/["']/g, '').trim()) };
  const body = JSON.stringify({ theme: { extend } }, null, 2);
  return `/** @type {import('tailwindcss').Config} */\nmodule.exports = ${body};\n`;
}

/** The raw token sections as JSON. */
export function toJson(design) {
  const { colors, typography, rounded, spacing, shadows, motion, components } = design;
  return JSON.stringify(
    { name: design.name, colors, typography, rounded, spacing, shadows, motion, components },
    null,
    2
  );
}

export const EXPORTS = [
  { id: 'css', name: 'CSS variables', ext: 'css', run: toCssVars },
  { id: 'tailwind', name: 'Tailwind config', ext: 'js', run: toTailwind },
  { id: 'json', name: 'JSON tokens', ext: 'json', run: toJson },
];
