// render-preview.js — build a sample landing page styled entirely from the tokens.
import { typographyToCss, findComponent, tokensToCssVars } from './resolve.js';
import { resolveRoles } from './theme.js';
import { resolveFont } from './fonts.js';
import { backdropCss } from './backdrops.js';

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Pick a typography token by trying name substrings in order. */
function typo(design, patterns) {
  const names = Object.keys(design.typography).filter((n) => n !== 'fontFamily');
  for (const pat of patterns) {
    const hit = names.find((n) => n.toLowerCase().includes(pat));
    if (hit) return design.typography[hit];
  }
  return names.length ? design.typography[names[0]] : null;
}

const tStyle = (design, patterns) => typographyToCss(typo(design, patterns));

/** Inline style for a button, preferring a matching component definition. */
function buttonStyle(design, patterns, fallback) {
  const comp = findComponent(design, patterns);
  if (comp && comp.css) return comp.css;
  return fallback;
}

const radius = (design, key, fallback) =>
  design.rounded[key] != null ? `var(--rounded-${key.toLowerCase()})` : fallback;

/**
 * Render the sample landing page into `root` for the given design + mode.
 */
export function renderPreview(root, design, mode, backdrop = 'design') {
  const r = resolveRoles(design, mode);
  const font = resolveFont(design).stack;
  const stageBg = backdropCss(backdrop, r);

  const rMd = radius(design, 'md', radius(design, 'DEFAULT', '12px'));
  const rLg = radius(design, 'lg', rMd);
  const rPill = radius(design, 'full', '9999px');

  const heroTitle = tStyle(design, ['display', 'headline-xl', 'headline-lg', 'headline', 'title', 'heading']);
  const heroBody = tStyle(design, ['body-lg', 'body', 'body-md']);
  const eyebrow = tStyle(design, ['label', 'overline', 'caption', 'micro', 'row']);
  const cardTitle = tStyle(design, ['headline-md', 'title', 'headline', 'heading', 'label-lg']);
  const cardBody = tStyle(design, ['body-md', 'body', 'body-sm', 'row', 'caption']);

  // In a synthesized (non-native) theme the roles are derived neutrals + a
  // contrast-checked accent; component definitions carry the native palette and
  // would clash, so fall back to the role system for buttons in that mode.
  const synthetic = r.theme !== r.native;
  const primaryFallback = `background:${r.accent};color:${r.onAccent};border-radius:${rPill};padding:0 24px;height:48px`;
  const ghostFallback = `background:transparent;color:${r.text};border:1px solid ${r.border};border-radius:${rPill};padding:0 24px;height:48px`;
  const primaryBtn = synthetic
    ? primaryFallback
    : buttonStyle(design, ['button-primary', 'btn-primary', 'primary'], primaryFallback);
  const ghostBtn = synthetic
    ? ghostFallback
    : buttonStyle(design, ['button-ghost', 'ghost', 'button-secondary', 'secondary'], ghostFallback);

  const cards = [
    { t: 'Consistent by default', b: 'Every surface, radius, and type ramp comes straight from your tokens.' },
    { t: 'Agent-ready', b: 'A structured brief coding agents can read and apply without guessing.' },
    { t: 'Yours, everywhere', b: 'One DESIGN.md keeps new pages on-brand as your product grows.' },
  ]
    .map(
      (card) => `
      <article class="pv-card" style="background:${r.surface};color:${r.text};border:1px solid ${r.border};border-radius:${rLg}">
        <div class="pv-card-dot" style="background:${r.accent};border-radius:${rPill}"></div>
        <h3 style="${cardTitle};margin:0">${esc(card.t)}</h3>
        <p style="${cardBody};color:${r.muted};margin:0">${esc(card.b)}</p>
      </article>`
    )
    .join('');

  root.setAttribute(
    'style',
    `${tokensToCssVars(design)}\nbackground:${stageBg};color:${r.text};${font ? `font-family:${font};` : ''}`
  );

  root.innerHTML = `
    <div class="pv-page">
      <nav class="pv-nav" style="border-bottom:1px solid ${r.border}">
        <span class="pv-brand" style="${tStyle(design, ['headline-md', 'title', 'heading', 'label-lg']) || ''}">
          <span class="pv-brand-mark" style="background:${r.accent};border-radius:${rMd}"></span>
          ${esc(design.name)}
        </span>
        <span class="pv-nav-links" style="${eyebrow};color:${r.muted}">
          <span>Product</span><span>Docs</span><span>Pricing</span>
          <button class="pv-btn" style="${primaryBtn}">Get started</button>
        </span>
      </nav>

      <header class="pv-hero">
        <p class="pv-eyebrow" style="${eyebrow};color:${r.accent}">${esc(design.name)} design system</p>
        <h1 style="${heroTitle};margin:0;max-width:16ch">Design once. Ship it everywhere.</h1>
        <p style="${heroBody};color:${r.muted};margin:0;max-width:48ch">
          This page is rendered live from your DESIGN.md tokens — colors, type, spacing, radius,
          and components. Nothing here is hard-coded.
        </p>
        <div class="pv-cta-row">
          <button class="pv-btn" style="${primaryBtn}">Primary action</button>
          <button class="pv-btn" style="${ghostBtn}">Learn more</button>
        </div>
      </header>

      <section class="pv-cards">${cards}</section>

      <section class="pv-signup" style="background:${r.surface};border:1px solid ${r.border};border-radius:${rLg}">
        <div>
          <h3 style="${cardTitle};margin:0 0 4px">Stay in the loop</h3>
          <p style="${cardBody};color:${r.muted};margin:0">Drop your email — see how form controls inherit the tokens.</p>
        </div>
        <form class="pv-form" onsubmit="return false">
          <input class="pv-input" type="email" placeholder="you@example.com"
            style="background:${r.surface};color:${r.text};border:1px solid ${r.border};border-radius:${rPill};${cardBody}" />
          <button class="pv-btn" style="${primaryBtn}">Subscribe</button>
        </form>
      </section>

      <footer class="pv-footer" style="border-top:1px solid ${r.border};color:${r.muted};${eyebrow}">
        <span>© ${esc(design.name)}</span>
        <span>Rendered from DESIGN.md</span>
      </footer>
    </div>
  `;
}
