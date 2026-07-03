// render-preview.js — sample surfaces styled entirely from the tokens.
// Three layout presets share one styling context so any DESIGN.md can be seen
// as a marketing page, an analytics dashboard, or a three-pane app shell.
import { typographyToCss, findComponent, tokensToCssVars } from './resolve.js';
import { resolveRoles, firstSolidColor } from './theme.js';
import { resolveFont } from './fonts.js';
import { backdropCss } from './backdrops.js';

export const PRESETS = [
  { id: 'marketing', name: 'Marketing' },
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'app', name: 'App shell' },
];

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Pick a typography token by trying name substrings in order. */
function pickTypo(design, patterns) {
  const names = Object.keys(design.typography).filter((n) => n !== 'fontFamily');
  for (const pat of patterns) {
    const hit = names.find((n) => n.toLowerCase().includes(pat));
    if (hit) return design.typography[hit];
  }
  return names.length ? design.typography[names[0]] : null;
}
const tS = (design, patterns) => typographyToCss(pickTypo(design, patterns));

function buttonStyle(design, patterns, fallback) {
  const comp = findComponent(design, patterns);
  return comp && comp.css ? comp.css : fallback;
}

const radius = (design, key, fallback) =>
  design.rounded[key] != null ? `var(--rounded-${key.toLowerCase()})` : fallback;

/** Everything a layout needs: resolved colors, radii, type styles, buttons. */
function buildContext(design, mode) {
  const r = resolveRoles(design, mode);
  const rSm = radius(design, 'sm', radius(design, 'md', '8px'));
  const rMd = radius(design, 'md', radius(design, 'DEFAULT', '12px'));
  const rLg = radius(design, 'lg', rMd);
  const rPill = radius(design, 'full', '9999px');

  const synthetic = r.theme !== r.native;
  const primaryBtn = synthetic
    ? `background:${r.accent};color:${r.onAccent};border-radius:${rPill};padding:0 22px;height:44px`
    : buttonStyle(design, ['button-primary', 'btn-primary', 'primary'],
        `background:${r.accent};color:${r.onAccent};border-radius:${rPill};padding:0 22px;height:44px`);
  const ghostBtn = synthetic
    ? `background:transparent;color:${r.text};border:1px solid ${r.border};border-radius:${rPill};padding:0 22px;height:44px`
    : buttonStyle(design, ['button-ghost', 'ghost', 'button-secondary', 'secondary'],
        `background:transparent;color:${r.text};border:1px solid ${r.border};border-radius:${rPill};padding:0 22px;height:44px`);

  const solidBg = (firstSolidColor(r.bg) || {}).str || (r.theme === 'dark' ? '#0e0f12' : '#ffffff');
  const surfaceSolid = `color-mix(in srgb, ${r.text} 10%, ${solidBg})`;

  return {
    r, rSm, rMd, rLg, rPill,
    font: resolveFont(design).stack,
    heroTitle: tS(design, ['display', 'headline-xl', 'headline-lg', 'headline', 'title', 'heading']),
    heroBody: tS(design, ['body-lg', 'body', 'body-md']),
    eyebrow: tS(design, ['label', 'overline', 'caption', 'micro', 'row']),
    cardTitle: tS(design, ['headline-md', 'title', 'headline', 'heading', 'label-lg']),
    cardBody: tS(design, ['body-md', 'body', 'body-sm', 'row', 'caption']),
    primaryBtn, ghostBtn, surfaceSolid,
    name: esc(design.name),
  };
}

/* ------------------------------------------------------------- layouts --- */

function marketing(c) {
  const r = c.r;
  const cards = [
    { t: 'Consistent by default', b: 'Every surface, radius, and type ramp comes straight from your tokens.' },
    { t: 'Agent-ready', b: 'A structured brief coding agents can read and apply without guessing.' },
    { t: 'Yours, everywhere', b: 'One DESIGN.md keeps new pages on-brand as your product grows.' },
  ].map((card) => `
    <article class="pv-card pv-glass" style="background:${r.surface};color:${r.text};border:1px solid ${r.border};border-radius:${c.rLg}">
      <div class="pv-card-dot" style="background:${r.accent};border-radius:${c.rPill}"></div>
      <h3 style="${c.cardTitle};margin:0">${esc(card.t)}</h3>
      <p style="${c.cardBody};color:${r.muted};margin:0">${esc(card.b)}</p>
    </article>`).join('');

  return `<div class="pv-page">
    <nav class="pv-nav" style="border-bottom:1px solid ${r.border}">
      <span class="pv-brand" style="${c.cardTitle}">
        <span class="pv-brand-mark" style="background:${r.accent};border-radius:${c.rMd}"></span>${c.name}
      </span>
      <span class="pv-nav-links" style="${c.eyebrow};color:${r.muted}">
        <span>Product</span><span>Docs</span><span>Pricing</span>
        <button class="pv-btn" style="${c.primaryBtn}">Get started</button>
      </span>
    </nav>
    <header class="pv-hero">
      <p class="pv-eyebrow" style="${c.eyebrow};color:${r.accent}">${c.name} design system</p>
      <h1 style="${c.heroTitle};margin:0;max-width:16ch">Design once. Ship it everywhere.</h1>
      <p style="${c.heroBody};color:${r.muted};margin:0;max-width:48ch">
        This page is rendered live from your DESIGN.md tokens — colors, type, spacing, radius,
        and components. Nothing here is hard-coded.
      </p>
      <div class="pv-cta-row">
        <button class="pv-btn" style="${c.primaryBtn}">Primary action</button>
        <button class="pv-btn" style="${c.ghostBtn}">Learn more</button>
      </div>
    </header>
    <section class="pv-cards">${cards}</section>
    <section class="pv-signup pv-glass" style="background:${r.surface};border:1px solid ${r.border};border-radius:${c.rLg}">
      <div>
        <h3 style="${c.cardTitle};margin:0 0 4px">Stay in the loop</h3>
        <p style="${c.cardBody};color:${r.muted};margin:0">Drop your email — see how form controls inherit the tokens.</p>
      </div>
      <form class="pv-form" onsubmit="return false">
        <input class="pv-input pv-glass" type="email" placeholder="you@example.com"
          style="background:${r.surface};color:${r.text};border:1px solid ${r.border};border-radius:${c.rPill};${c.cardBody}" />
        <button class="pv-btn" style="${c.primaryBtn}">Subscribe</button>
      </form>
    </section>
    <footer class="pv-footer" style="border-top:1px solid ${r.border};color:${r.muted};${c.eyebrow}">
      <span>© ${c.name}</span><span>Rendered from DESIGN.md</span>
    </footer>
  </div>`;
}

function navItem(c, label, active) {
  const r = c.r;
  const style = active
    ? `background:${r.accentSoft || `color-mix(in srgb, ${r.accent} 16%, transparent)`};color:${r.text};border-radius:${c.rSm}`
    : `color:${r.muted};border-radius:${c.rSm}`;
  const dot = active ? `background:${r.accent}` : `background:${r.border}`;
  return `<div class="pv-navitem" style="${style};${c.cardBody}">
    <span class="pv-navitem-dot" style="${dot};border-radius:${c.rPill}"></span>${esc(label)}</div>`;
}

function dashboard(c) {
  const r = c.r;
  const nav = ['Overview', 'Analytics', 'Customers', 'Billing', 'Settings']
    .map((n, i) => navItem(c, n, i === 0)).join('');
  const stats = [
    { k: 'Revenue', v: '$48.2k', d: '+12.4%' },
    { k: 'Active users', v: '3,914', d: '+3.1%' },
    { k: 'Churn', v: '1.8%', d: '−0.4%' },
  ].map((s) => `
    <div class="pv-stat pv-glass" style="background:${r.surface};border:1px solid ${r.border};border-radius:${c.rMd}">
      <span style="${c.eyebrow};color:${r.muted}">${esc(s.k)}</span>
      <strong style="${c.heroTitle};font-size:26px;color:${r.text}">${esc(s.v)}</strong>
      <span style="${c.cardBody};color:${r.accent}">${esc(s.d)}</span>
    </div>`).join('');
  const rows = [
    ['Acme Inc.', 'Pro', 'Active'],
    ['Globex', 'Team', 'Active'],
    ['Initech', 'Free', 'Trial'],
    ['Umbrella', 'Pro', 'Past due'],
  ].map((row) => `
    <div class="pv-trow" style="border-top:1px solid ${r.border};${c.cardBody};color:${r.text}">
      <span>${esc(row[0])}</span><span style="color:${r.muted}">${esc(row[1])}</span>
      <span class="pv-pill" style="background:color-mix(in srgb, ${r.accent} 16%, transparent);color:${r.accent};border-radius:${c.rPill}">${esc(row[2])}</span>
    </div>`).join('');

  return `<div class="pv-app">
    <aside class="pv-side pv-glass" style="background:${r.surface};border-right:1px solid ${r.border}">
      <span class="pv-brand" style="${c.cardTitle}">
        <span class="pv-brand-mark" style="background:${r.accent};border-radius:${c.rMd}"></span>${c.name}
      </span>
      <nav class="pv-nav-col">${nav}</nav>
    </aside>
    <main class="pv-main">
      <div class="pv-topbar">
        <h1 style="${c.cardTitle};margin:0">Overview</h1>
        <button class="pv-btn" style="${c.primaryBtn}">New report</button>
      </div>
      <div class="pv-stats">${stats}</div>
      <section class="pv-panel pv-glass" style="background:${r.surface};border:1px solid ${r.border};border-radius:${c.rMd}">
        <h3 style="${c.cardTitle};margin:0 0 4px">Customers</h3>
        <div class="pv-table">${rows}</div>
      </section>
    </main>
  </div>`;
}

function app(c) {
  const r = c.r;
  const folders = ['Inbox', 'Starred', 'Sent', 'Drafts', 'Archive']
    .map((n, i) => navItem(c, n, i === 0)).join('');
  const msgs = [
    { s: 'Priya Rao', t: 'Design review notes', p: 'Left a few comments on the token panel — mostly spacing…', unread: true, sel: true },
    { s: 'Deploy Bot', t: 'main → production ✓', p: 'Build 4821 finished in 2m 14s. No regressions detected.', unread: true },
    { s: 'Marcus Lee', t: 'Re: onboarding copy', p: 'Ship it. The empty-state line reads much better now.', unread: false },
    { s: 'Figma', t: 'Weekly digest', p: '3 files were updated in your team this week.', unread: false },
  ].map((m) => {
    const bg = m.sel
      ? `color-mix(in srgb, ${r.accent} 16%, transparent)`
      : m.unread ? r.surface : 'transparent';
    const border = m.sel ? r.accent : r.border;
    return `<div class="pv-row pv-glass" style="background:${bg};border:1px solid ${border};border-radius:${c.rMd}">
      <div class="pv-row-top">
        <span style="${c.cardBody};color:${r.text};font-weight:600">${esc(m.s)}</span>
        ${m.unread ? `<span class="pv-dot" style="background:${r.accent};border-radius:${c.rPill}"></span>` : ''}
        <span style="${c.eyebrow};color:${r.muted};margin-left:auto">9:4${'2'}a</span>
      </div>
      <div style="${c.cardBody};color:${r.text}">${esc(m.t)}</div>
      <div style="${c.cardBody};color:${r.muted};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(m.p)}</div>
    </div>`;
  }).join('');

  return `<div class="pv-app pv-app-3">
    <aside class="pv-side pv-glass" style="background:${r.surface};border-right:1px solid ${r.border}">
      <span class="pv-brand" style="${c.cardTitle}">
        <span class="pv-brand-mark" style="background:${r.accent};border-radius:${c.rMd}"></span>${c.name}
      </span>
      <button class="pv-btn" style="${c.primaryBtn};width:100%;margin:4px 0 8px">Compose</button>
      <nav class="pv-nav-col">${folders}</nav>
    </aside>
    <section class="pv-list" style="border-right:1px solid ${r.border}">
      <input class="pv-input pv-glass" placeholder="Search mail"
        style="background:${r.surface};color:${r.text};border:1px solid ${r.border};border-radius:${c.rSm};${c.cardBody};height:38px" />
      <div class="pv-rows">${msgs}</div>
    </section>
    <section class="pv-read">
      <h2 style="${c.heroTitle};font-size:22px;margin:0 0 6px;color:${r.text}">Design review notes</h2>
      <div class="pv-read-meta" style="${c.eyebrow};color:${r.muted}">Priya Rao · to me · 9:42am</div>
      <div class="pv-read-body pv-glass" style="background:${r.surface};border:1px solid ${r.border};border-radius:${c.rMd};color:${r.text};${c.cardBody}">
        <p style="margin:0 0 10px">Left a few comments on the token panel — mostly spacing and the type ramp.</p>
        <p style="margin:0">Everything here is rendered from the DESIGN.md tokens: the glass surfaces, the accent, the radii, and the mono/sans type. Pick a backdrop to see the panels lift.</p>
      </div>
      <div class="pv-cta-row" style="margin-top:16px">
        <button class="pv-btn" style="${c.primaryBtn}">Reply</button>
        <button class="pv-btn" style="${c.ghostBtn}">Forward</button>
      </div>
    </section>
  </div>`;
}

const LAYOUTS = { marketing, dashboard, app };

/**
 * Render a sample surface into `root` for the given design + mode + backdrop + preset.
 */
export function renderPreview(root, design, mode, backdrop = 'design', preset = 'marketing') {
  const c = buildContext(design, mode);
  const stageBg = backdropCss(backdrop, c.r);
  root.setAttribute(
    'style',
    `${tokensToCssVars(design)}\n--pv-surface-solid:${c.surfaceSolid};` +
      `background:${stageBg};color:${c.r.text};${c.font ? `font-family:${c.font};` : ''}`
  );
  const layout = LAYOUTS[preset] || LAYOUTS.marketing;
  root.innerHTML = layout(c, design);
}
