// render-preview.js — build a sample landing page styled entirely from the tokens.
import {
  pickColor,
  typographyToCss,
  resolveComponent,
  findComponent,
  tokensToCssVars,
} from './resolve.js';

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Pick a typography token by trying name substrings in order. */
function typo(design, patterns) {
  const names = Object.keys(design.typography);
  for (const pat of patterns) {
    const hit = names.find((n) => n.toLowerCase().includes(pat));
    if (hit) return design.typography[hit];
  }
  return names.length ? design.typography[names[0]] : null;
}

const tStyle = (design, patterns) => typographyToCss(typo(design, patterns));

/** Compute the color roles that drive the sample page for a given theme mode. */
function roles(design, mode) {
  const c = design.colors;
  if (mode === 'inverse') {
    const bg = pickColor(c, ['inverse-surface', 'on-surface', 'on-background'], '#1b1b1b');
    const text = pickColor(c, ['inverse-on-surface', 'surface', 'background'], '#ffffff');
    return {
      bg,
      text,
      card: `color-mix(in srgb, ${text} 8%, transparent)`,
      cardText: text,
      muted: `color-mix(in srgb, ${text} 62%, transparent)`,
      border: `color-mix(in srgb, ${text} 18%, transparent)`,
      primary: pickColor(c, ['primary'], '#5b8def'),
      onPrimary: pickColor(c, ['on-primary'], '#ffffff'),
      secondary: pickColor(c, ['secondary', 'tertiary'], text),
    };
  }
  const bg = pickColor(c, ['background', 'surface', 'surface-container-lowest'], '#ffffff');
  const text = pickColor(c, ['on-background', 'on-surface'], '#111111');
  return {
    bg,
    text,
    card: pickColor(c, ['surface-container', 'surface-container-high', 'surface-variant', 'surface-container-low', 'surface'], bg),
    cardText: pickColor(c, ['on-surface', 'on-background'], text),
    muted: pickColor(c, ['on-surface-variant', 'outline'], text),
    border: pickColor(c, ['outline-variant', 'outline'], `color-mix(in srgb, ${text} 15%, transparent)`),
    primary: pickColor(c, ['primary'], '#5b8def'),
    onPrimary: pickColor(c, ['on-primary'], '#ffffff'),
    secondary: pickColor(c, ['secondary', 'tertiary'], text),
  };
}

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
export function renderPreview(root, design, mode) {
  const r = roles(design, mode);
  const rMd = radius(design, 'md', radius(design, 'DEFAULT', '12px'));
  const rLg = radius(design, 'lg', rMd);
  const rPill = radius(design, 'full', '9999px');

  const heroTitle = tStyle(design, ['display', 'headline-xl', 'headline-lg', 'headline', 'title']);
  const heroBody = tStyle(design, ['body-lg', 'body', 'body-md']);
  const eyebrow = tStyle(design, ['label', 'overline', 'caption']);
  const cardTitle = tStyle(design, ['headline-md', 'title', 'headline', 'label-lg']);
  const cardBody = tStyle(design, ['body-md', 'body', 'body-sm']);

  const primaryBtn = buttonStyle(
    design,
    ['button-primary', 'btn-primary', 'primary'],
    `background:${r.primary};color:${r.onPrimary};border-radius:${rPill};padding:0 24px;height:48px`
  );
  const ghostBtn = buttonStyle(
    design,
    ['button-ghost', 'ghost', 'button-secondary', 'secondary'],
    `background:transparent;color:${r.text};border:1px solid ${r.border};border-radius:${rPill};padding:0 24px;height:48px`
  );

  const cards = [
    { t: 'Consistent by default', b: 'Every surface, radius, and type ramp comes straight from your tokens.' },
    { t: 'Agent-ready', b: 'A structured brief coding agents can read and apply without guessing.' },
    { t: 'Yours, everywhere', b: 'One DESIGN.md keeps new pages on-brand as your product grows.' },
  ]
    .map(
      (card) => `
      <article class="pv-card" style="background:${r.card};color:${r.cardText};border:1px solid ${r.border};border-radius:${rLg}">
        <div class="pv-card-dot" style="background:${r.primary};border-radius:${rPill}"></div>
        <h3 style="${cardTitle};margin:0">${esc(card.t)}</h3>
        <p style="${cardBody};color:${r.muted};margin:0">${esc(card.b)}</p>
      </article>`
    )
    .join('');

  root.setAttribute(
    'style',
    `${tokensToCssVars(design)}\nbackground:${r.bg};color:${r.text};`
  );

  root.innerHTML = `
    <div class="pv-page">
      <nav class="pv-nav" style="border-bottom:1px solid ${r.border}">
        <span class="pv-brand" style="${tStyle(design, ['headline-md', 'title', 'label-lg']) || ''}">
          <span class="pv-brand-mark" style="background:${r.primary};border-radius:${rMd}"></span>
          ${esc(design.name)}
        </span>
        <span class="pv-nav-links" style="${eyebrow};color:${r.muted}">
          <span>Product</span><span>Docs</span><span>Pricing</span>
          <button class="pv-btn" style="${primaryBtn}">Get started</button>
        </span>
      </nav>

      <header class="pv-hero">
        <p class="pv-eyebrow" style="${eyebrow};color:${r.primary}">${esc(design.name)} design system</p>
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

      <section class="pv-signup" style="background:${r.card};border:1px solid ${r.border};border-radius:${rLg}">
        <div>
          <h3 style="${cardTitle};margin:0 0 4px">Stay in the loop</h3>
          <p style="${cardBody};color:${r.muted};margin:0">Drop your email — see how form controls inherit the tokens.</p>
        </div>
        <form class="pv-form" onsubmit="return false">
          <input class="pv-input" type="email" placeholder="you@example.com"
            style="background:${r.bg};color:${r.text};border:1px solid ${r.border};border-radius:${rPill};${cardBody}" />
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
