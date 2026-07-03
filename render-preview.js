// render-preview.js — sample surfaces styled entirely from the tokens.
// Layout presets share one styling context that also exposes the resolved roles
// as --pv-* custom properties, so the markup can lean on CSS classes (and thus
// hover/active states + click navigation) instead of only inline styles.
import { typographyToCss, findComponent, tokensToCssVars } from './resolve.js';
import { resolveRoles, firstSolidColor } from './theme.js';
import { resolveFont } from './fonts.js';
import { backdropCss } from './backdrops.js';

export const PRESETS = [
  { id: 'marketing', name: 'Marketing' },
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'app', name: 'App shell' },
  { id: 'settings', name: 'Settings' },
  { id: 'auth', name: 'Sign-in' },
  { id: 'article', name: 'Article' },
];

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* --------------------------------------------------------------- icons --- */

const IC = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>',
  inbox: '<path d="M3 12h5l2 3h4l2-3h5"/><path d="M5 5h14l2 7v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/>',
  star: '<path d="m12 3 2.7 5.5 6 .9-4.35 4.2 1 6L12 17.8 6.65 20.6l1-6L3.3 9.4l6-.9z"/>',
  send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  archive: '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M10 12h4"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.9 7.9 0 0 0 0-2l2-1.5-2-3.4-2.3 1a8 8 0 0 0-1.7-1l-.3-2.6H9.9l-.3 2.6a8 8 0 0 0-1.7 1l-2.3-1-2 3.4L5.6 11a7.9 7.9 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a8 8 0 0 0 1.7 1l.3 2.6h4.2l.3-2.6a8 8 0 0 0 1.7-1l2.3 1 2-3.4z"/>',
  chart: '<path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="7"/><rect x="12" y="6" width="3" height="11"/><rect x="17" y="13" width="3" height="4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5a3.5 3.5 0 0 1 0 7"/><path d="M21.5 20a6.5 6.5 0 0 0-5-6.3"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
  home: '<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  check: '<path d="m5 12 4 4 10-10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  palette: '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="8" r="1"/><circle cx="16" cy="10" r="1"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
};
const icon = (n, cls = 'pv-ic') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;

const initials = (name) => esc(name.replace(/[^a-zA-Z ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '•');

/* ------------------------------------------------------------- context --- */

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

function buildContext(design, mode) {
  const r = resolveRoles(design, mode);
  const rSm = radius(design, 'sm', radius(design, 'md', '8px'));
  const rMd = radius(design, 'md', radius(design, 'DEFAULT', '12px'));
  const rLg = radius(design, 'lg', rMd);
  const rPill = radius(design, 'full', '9999px');

  const synthetic = r.theme !== r.native;
  // Structural defaults sit *underneath* the resolved style so a component's own
  // values win, but buttons stay well-padded when a component omits padding/height
  // (e.g. a ghost button that only defines background + typography).
  const btnBase = `border-radius:${rPill};padding:0 22px;height:44px`;
  const primaryFallback = `background:${r.accent};color:${r.onAccent}`;
  const ghostFallback = `background:transparent;color:${r.text};border:1px solid ${r.border}`;
  const primaryBtn = `${btnBase};` +
    (synthetic ? primaryFallback : buttonStyle(design, ['button-primary', 'btn-primary', 'primary'], primaryFallback));
  const ghostBtn = `${btnBase};` +
    (synthetic ? ghostFallback : buttonStyle(design, ['button-ghost', 'ghost', 'button-secondary', 'secondary'], ghostFallback));

  const solidBg = (firstSolidColor(r.bg) || {}).str || (r.theme === 'dark' ? '#0e0f12' : '#ffffff');

  return {
    r, rSm, rMd, rLg, rPill,
    font: resolveFont(design).stack,
    surfaceSolid: `color-mix(in srgb, ${r.text} 10%, ${solidBg})`,
    name: esc(design.name),
    primaryBtn, ghostBtn,
    type: {
      hero: tS(design, ['display', 'headline-xl', 'headline-lg', 'headline', 'title', 'heading']),
      h2: tS(design, ['headline-md', 'headline', 'title', 'heading', 'label-lg']),
      h3: tS(design, ['title', 'heading', 'headline-sm', 'label-lg', 'label']),
      body: tS(design, ['body-md', 'body', 'body-sm', 'row']),
      bodyLg: tS(design, ['body-lg', 'body', 'body-md']),
      small: tS(design, ['caption', 'micro', 'label', 'body-sm', 'row']),
      eyebrow: tS(design, ['overline', 'label', 'micro', 'caption', 'row']),
    },
  };
}

/** The resolved roles + radii as stable --pv-* custom properties. */
function rootVars(c) {
  const r = c.r;
  return [
    `--pv-text:${r.text}`, `--pv-muted:${r.muted}`, `--pv-surface:${r.surface}`,
    `--pv-surface-solid:${c.surfaceSolid}`, `--pv-border:${r.border}`,
    `--pv-accent:${r.accent}`, `--pv-on-accent:${r.onAccent}`,
    `--pv-accent-soft:color-mix(in srgb, ${r.accent} 16%, transparent)`,
    `--pv-r-sm:${c.rSm}`, `--pv-r-md:${c.rMd}`, `--pv-r-lg:${c.rLg}`, `--pv-r-pill:${c.rPill}`,
  ].join(';');
}

/* ------------------------------------------------------------- helpers --- */

const navItem = (c, { ic, label, nav, active, count, scroll }) =>
  `<button class="pv-navitem${active ? ' pv-active' : ''}" type="button"${nav ? ` data-nav="${nav}"` : ''}${scroll ? ` data-scroll="${scroll}"` : ''}>
    ${ic ? icon(ic) : '<span class="pv-navdot"></span>'}
    <span class="pv-navitem-label" style="${c.type.body}">${esc(label)}</span>
    ${count != null ? `<span class="pv-navcount" style="${c.type.small}">${esc(count)}</span>` : ''}
  </button>`;

const avatar = (c, name) => `<span class="pv-avatar" style="${c.type.small}">${initials(name)}</span>`;

const field = (c, { label, value, placeholder, type = 'text' }) => `
  <label class="pv-field">
    <span class="pv-field-label" style="${c.type.small}">${esc(label)}</span>
    <input class="pv-input pv-glass" type="${type}" ${value ? `value="${esc(value)}"` : ''} placeholder="${esc(placeholder || '')}" style="${c.type.body}" />
  </label>`;

const toggle = (c, label, on) => `
  <div class="pv-toggle-row">
    <span style="${c.type.body}">${esc(label)}</span>
    <span class="pv-switch${on ? ' pv-on' : ''}" role="switch" aria-checked="${!!on}"><span class="pv-switch-knob"></span></span>
  </div>`;

/* ------------------------------------------------------------- layouts --- */

function marketing(c) {
  const links = ['Product', 'Solutions', 'Pricing', 'Docs'].map((l) => `<span>${l}</span>`).join('');
  const logos = ['Northwind', 'Globex', 'Umbrella', 'Initech', 'Hooli'].map((l) => `<span class="pv-logo" style="${c.type.body}">${l}</span>`).join('');
  const features = [
    { ic: 'bolt', t: 'Fast by default', b: 'Ship on-brand screens without hand-tuning a single value.' },
    { ic: 'palette', t: 'Themeable', b: 'Colors, type, radius and motion all trace back to your tokens.' },
    { ic: 'check', t: 'Agent-ready', b: 'A structured brief that coding agents can read and apply.' },
    { ic: 'users', t: 'Made to share', b: 'One file keeps every new surface consistent as you grow.' },
  ].map((f) => `
    <article class="pv-feature pv-card pv-glass">
      <span class="pv-feature-ic">${icon(f.ic, 'pv-ic-lg')}</span>
      <h3 style="${c.type.h3};margin:0">${f.t}</h3>
      <p class="pv-dim" style="${c.type.body};margin:0">${f.b}</p>
    </article>`).join('');
  const tiers = [
    { n: 'Starter', p: '$0', f: ['1 design file', 'Community support', 'Core presets'], hot: false },
    { n: 'Team', p: '$29', f: ['Unlimited files', 'Shared library', 'All presets & export'], hot: true },
    { n: 'Scale', p: '$99', f: ['SSO & roles', 'Audit log', 'Priority support'], hot: false },
  ].map((t) => `
    <div class="pv-tier pv-card pv-glass${t.hot ? ' pv-tier-hot' : ''}">
      ${t.hot ? `<span class="pv-badge" style="${c.type.small}">Popular</span>` : ''}
      <span style="${c.type.eyebrow};color:var(--pv-muted)">${t.n}</span>
      <div class="pv-price"><strong style="${c.type.hero};font-size:32px">${t.p}</strong><span class="pv-dim" style="${c.type.small}">/mo</span></div>
      <ul class="pv-tier-list">${t.f.map((x) => `<li style="${c.type.body}">${icon('check', 'pv-ic pv-ic-accent')}${x}</li>`).join('')}</ul>
      <button class="pv-btn pv-btn-block" style="${t.hot ? c.primaryBtn : c.ghostBtn}">Choose ${t.n}</button>
    </div>`).join('');

  return `<div class="pv-page">
    <nav class="pv-nav pv-glass">
      <span class="pv-brand" style="${c.type.h3}"><span class="pv-brand-mark"></span>${c.name}</span>
      <span class="pv-nav-links pv-dim" style="${c.type.body}">${links}</span>
      <span class="pv-nav-cta">
        <button class="pv-btn pv-btn-ghost" style="${c.ghostBtn}">Sign in</button>
        <button class="pv-btn" style="${c.primaryBtn}">Get started</button>
      </span>
    </nav>
    <header class="pv-hero">
      <span class="pv-pill pv-pill-soft" style="${c.type.small}">${icon('bolt', 'pv-ic')} New — live token preview</span>
      <h1 style="${c.type.hero};margin:0;max-width:15ch">Design once. Ship it everywhere.</h1>
      <p class="pv-dim" style="${c.type.bodyLg};margin:0;max-width:52ch">Every surface on this page is rendered live from your DESIGN.md — colors, type, spacing, radius, shadows, and components. Nothing is hard-coded.</p>
      <div class="pv-cta-row">
        <button class="pv-btn" style="${c.primaryBtn}">Start free</button>
        <button class="pv-btn pv-btn-ghost" style="${c.ghostBtn}">Book a demo</button>
      </div>
    </header>
    <div class="pv-logos">${logos}</div>
    <section class="pv-section">
      <p class="pv-eyebrow" style="${c.type.eyebrow};color:var(--pv-accent)">Why teams pick it</p>
      <h2 style="${c.type.h2};margin:0 0 6px">Everything traces back to your tokens</h2>
      <div class="pv-features">${features}</div>
    </section>
    <section class="pv-section pv-band pv-glass">
      ${[['4.2k', 'Design files'], ['98%', 'On-brand pages'], ['12min', 'Median setup'], ['30+', 'Token roles']].map(([v, k]) => `<div class="pv-stat-inline"><strong style="${c.type.hero};font-size:28px">${v}</strong><span class="pv-dim" style="${c.type.small}">${k}</span></div>`).join('')}
    </section>
    <section class="pv-section">
      <p class="pv-eyebrow" style="${c.type.eyebrow};color:var(--pv-accent)">Pricing</p>
      <h2 style="${c.type.h2};margin:0 0 14px">Simple, per-seat pricing</h2>
      <div class="pv-tiers">${tiers}</div>
    </section>
    <section class="pv-quote pv-card pv-glass">
      <p style="${c.type.h3};margin:0 0 12px">“We replaced a folder of screenshots with one DESIGN.md and every new screen just looks right.”</p>
      <div class="pv-quote-by">${avatar(c, 'Priya Rao')}<span><strong style="${c.type.body}">Priya Rao</strong><br><span class="pv-dim" style="${c.type.small}">Head of Design, Northwind</span></span></div>
    </section>
    <footer class="pv-footer-lg">
      <div class="pv-foot-col"><span class="pv-brand" style="${c.type.body}"><span class="pv-brand-mark"></span>${c.name}</span></div>
      ${[['Product', ['Overview', 'Pricing', 'Changelog']], ['Company', ['About', 'Careers', 'Blog']], ['Legal', ['Privacy', 'Terms']]].map(([h, items]) => `<div class="pv-foot-col"><span class="pv-eyebrow" style="${c.type.small};color:var(--pv-muted)">${h}</span>${items.map((i) => `<span class="pv-dim" style="${c.type.body}">${i}</span>`).join('')}</div>`).join('')}
    </footer>
  </div>`;
}

function dashboard(c) {
  const nav = [
    { ic: 'home', label: 'Overview', nav: 'view:overview', active: true },
    { ic: 'chart', label: 'Analytics', nav: 'view:analytics' },
    { ic: 'users', label: 'Customers', nav: 'view:customers' },
    { ic: 'card', label: 'Billing', nav: 'view:billing' },
  ].map((n) => navItem(c, n)).join('');
  const stats = [
    { k: 'Revenue', v: '$48.2k', d: '+12.4%', up: true },
    { k: 'Active users', v: '3,914', d: '+3.1%', up: true },
    { k: 'Churn', v: '1.8%', d: '−0.4%', up: true },
    { k: 'NPS', v: '61', d: '+5', up: true },
  ].map((s) => `<div class="pv-stat pv-card pv-glass"><span style="${c.type.small};color:var(--pv-muted)">${s.k}</span><strong style="${c.type.hero};font-size:26px">${s.v}</strong><span class="pv-delta" style="${c.type.small}">${icon('bolt', 'pv-ic')} ${s.d}</span></div>`).join('');
  const bars = [42, 66, 51, 80, 62, 91, 73, 58, 84].map((h) => `<span class="pv-bar" style="height:${h}%"></span>`).join('');
  const table = [
    ['Acme Inc.', 'Pro', 'Active', '$4,200'],
    ['Globex', 'Team', 'Active', '$1,900'],
    ['Initech', 'Free', 'Trial', '$0'],
    ['Umbrella', 'Pro', 'Past due', '$4,200'],
    ['Hooli', 'Team', 'Active', '$1,900'],
  ].map((row) => `<div class="pv-trow" style="${c.type.body}">
      <span class="pv-tcell-name">${avatar(c, row[0])}${esc(row[0])}</span>
      <span class="pv-dim">${row[1]}</span>
      <span class="pv-pill pv-pill-soft" style="${c.type.small}">${row[2]}</span>
      <span>${row[3]}</span>
    </div>`).join('');

  return `<div class="pv-app pv-app-dash" data-nav-scope>
    <aside class="pv-side pv-glass">
      <span class="pv-brand" style="${c.type.h3}"><span class="pv-brand-mark"></span>${c.name}</span>
      <nav class="pv-nav-col">${nav}</nav>
      <div class="pv-side-foot">${navItem(c, { ic: 'gear', label: 'Settings' })}<div class="pv-userchip">${avatar(c, 'Jordan Lee')}<span style="${c.type.small}"><strong>Jordan Lee</strong><br><span class="pv-dim">Owner</span></span></div></div>
    </aside>
    <main class="pv-main">
      <div class="pv-topbar">
        <div class="pv-search pv-glass"><span class="pv-ic-wrap">${icon('search')}</span><span class="pv-dim" style="${c.type.body}">Search…</span></div>
        <div class="pv-topbar-actions">
          <button class="pv-iconbtn" aria-label="Notifications">${icon('bell')}</button>
          <button class="pv-btn" style="${c.primaryBtn}">${icon('plus', 'pv-ic')} New report</button>
          ${avatar(c, 'Jordan Lee')}
        </div>
      </div>

      <div data-panel="view:overview">
        <div class="pv-view-head"><h1 style="${c.type.h2};margin:0">Overview</h1><span class="pv-dim" style="${c.type.small}">Last 30 days</span></div>
        <div class="pv-stats">${stats}</div>
        <section class="pv-panel pv-card pv-glass">
          <div class="pv-panel-head"><h3 style="${c.type.h3};margin:0">Revenue</h3><div class="pv-seg" style="${c.type.small}"><span class="pv-active">Weekly</span><span>Monthly</span></div></div>
          <div class="pv-chart">${bars}</div>
        </section>
        <section class="pv-panel pv-card pv-glass">
          <div class="pv-panel-head"><h3 style="${c.type.h3};margin:0">Customers</h3><span class="pv-dim" style="${c.type.small}">5 of 214</span></div>
          <div class="pv-table pv-table-4">${table}</div>
        </section>
      </div>
      <div data-panel="view:analytics" hidden>
        <div class="pv-view-head"><h1 style="${c.type.h2};margin:0">Analytics</h1></div>
        <section class="pv-panel pv-card pv-glass"><div class="pv-chart pv-chart-tall">${bars}${bars}</div></section>
      </div>
      <div data-panel="view:customers" hidden>
        <div class="pv-view-head"><h1 style="${c.type.h2};margin:0">Customers</h1></div>
        <section class="pv-panel pv-card pv-glass"><div class="pv-table pv-table-4">${table}${table}</div></section>
      </div>
      <div data-panel="view:billing" hidden>
        <div class="pv-view-head"><h1 style="${c.type.h2};margin:0">Billing</h1></div>
        <section class="pv-panel pv-card pv-glass"><div class="pv-stats">${stats}</div></section>
      </div>
    </main>
  </div>`;
}

function app(c) {
  const folders = [
    { ic: 'inbox', label: 'Inbox', nav: 'folder:inbox', active: true, count: 12 },
    { ic: 'star', label: 'Starred', nav: 'folder:starred', count: 3 },
    { ic: 'send', label: 'Sent', nav: 'folder:sent' },
    { ic: 'doc', label: 'Drafts', nav: 'folder:drafts', count: 1 },
    { ic: 'archive', label: 'Archive', nav: 'folder:archive' },
  ].map((f) => navItem(c, f)).join('');

  const mkRow = (m, active) => `<button class="pv-row pv-glass${active ? ' pv-active' : ''}${m.unread ? ' pv-unread' : ''}" type="button" data-nav="msg:${m.id}">
      <span class="pv-row-avatar">${avatar(c, m.s)}</span>
      <span class="pv-row-main">
        <span class="pv-row-top"><span style="${c.type.body}"><strong>${esc(m.s)}</strong></span>${m.unread ? '<span class="pv-dot"></span>' : ''}<span class="pv-dim pv-row-time" style="${c.type.small}">${m.time}</span></span>
        <span class="pv-row-subj" style="${c.type.body}">${esc(m.t)}</span>
        <span class="pv-row-prev pv-dim" style="${c.type.small}">${esc(m.p)}</span>
        ${m.label ? `<span class="pv-tag" style="${c.type.small}">${esc(m.label)}</span>` : ''}
      </span>
    </button>`;
  const inbox = [
    { id: '1', s: 'Priya Rao', t: 'Design review notes', p: 'Left a few comments on the token panel — mostly spacing.', time: '9:42a', unread: true, label: 'Design' },
    { id: '2', s: 'Deploy Bot', t: 'main → production ✓', p: 'Build 4821 finished in 2m 14s. No regressions.', time: '8:15a', unread: true },
    { id: '3', s: 'Marcus Lee', t: 'Re: onboarding copy', p: 'Ship it. The empty-state line reads much better now.', time: 'Yst', unread: false },
    { id: '4', s: 'Figma', t: 'Weekly digest', p: '3 files were updated in your team this week.', time: 'Mon', unread: false, label: 'Updates' },
  ];
  const sent = [
    { id: '1', s: 'To: Priya Rao', t: 'Re: Design review notes', p: 'Good calls — pushed the spacing fix just now.', time: '9:51a', unread: false },
    { id: '2', s: 'To: Team', t: 'Sprint plan', p: 'Locking scope for the token-export work.', time: 'Yst', unread: false },
  ];
  const listFor = (id, rows) => `<div class="pv-rows" data-panel="folder:${id}"${id === 'inbox' ? '' : ' hidden'}>${rows.map((m, i) => mkRow(m, id === 'inbox' && i === 0)).join('')}</div>`;

  const readPane = (title, from, body) => `<div class="pv-read-card" data-panel="msg:${from.id}"${from.id === '1' ? '' : ' hidden'}>
      <h2 style="${c.type.h2};font-size:22px;margin:0 0 6px">${esc(title)}</h2>
      <div class="pv-read-from">${avatar(c, from.s)}<span style="${c.type.small}"><strong>${esc(from.s)}</strong> · to me<br><span class="pv-dim">${from.time}</span></span></div>
      <div class="pv-read-body pv-card pv-glass" style="${c.type.body}">${body}</div>
    </div>`;

  return `<div class="pv-app pv-app-3" data-nav-scope>
    <aside class="pv-side pv-glass">
      <span class="pv-brand" style="${c.type.h3}"><span class="pv-brand-mark"></span>${c.name}</span>
      <button class="pv-btn pv-btn-block" style="${c.primaryBtn}">${icon('plus', 'pv-ic')} Compose</button>
      <nav class="pv-nav-col">${folders}</nav>
    </aside>
    <section class="pv-list pv-glass">
      <div class="pv-search pv-glass"><span class="pv-ic-wrap">${icon('search')}</span><span class="pv-dim" style="${c.type.body}">Search mail</span></div>
      ${listFor('inbox', inbox)}
      ${listFor('starred', inbox.filter((m) => m.unread))}
      ${listFor('sent', sent)}
      ${listFor('drafts', [{ id: 'd', s: 'Draft', t: 'Untitled', p: 'No recipients yet…', time: '—', unread: false }])}
      ${listFor('archive', sent)}
    </section>
    <section class="pv-read">
      <div class="pv-read-tools"><button class="pv-iconbtn" aria-label="Archive">${icon('archive')}</button><button class="pv-iconbtn" aria-label="Star">${icon('star')}</button></div>
      ${readPane('Design review notes', { id: '1', s: 'Priya Rao', time: '9:42am' }, `<p style="margin:0 0 10px">Left a few comments on the token panel — mostly spacing and the type ramp.</p><p style="margin:0">Everything here is rendered from the DESIGN.md tokens: the glass surfaces, the accent, the radii, and the mono/sans type. Click folders and messages to move around; pick a backdrop to see the panels lift.</p>`)}
      ${readPane('main → production ✓', { id: '2', s: 'Deploy Bot', time: '8:15am' }, `<p style="margin:0">Build 4821 finished in 2m 14s. No regressions detected across the smoke suite.</p>`)}
      ${readPane('Re: onboarding copy', { id: '3', s: 'Marcus Lee', time: 'Yesterday' }, `<p style="margin:0">Ship it. The empty-state line reads much better now.</p>`)}
      ${readPane('Weekly digest', { id: '4', s: 'Figma', time: 'Monday' }, `<p style="margin:0">3 files were updated in your team this week.</p>`)}
      <div class="pv-reply pv-card pv-glass"><input class="pv-input" placeholder="Reply…" style="${c.type.body}" /><button class="pv-btn" style="${c.primaryBtn}">${icon('send', 'pv-ic')} Send</button></div>
    </section>
  </div>`;
}

function settings(c) {
  const nav = [
    { ic: 'user', label: 'Account', nav: 'sec:account', active: true },
    { ic: 'palette', label: 'Appearance', nav: 'sec:appearance' },
    { ic: 'bell', label: 'Notifications', nav: 'sec:notify' },
    { ic: 'lock', label: 'Security', nav: 'sec:security' },
  ].map((n) => navItem(c, n)).join('');

  return `<div class="pv-app pv-app-settings" data-nav-scope>
    <aside class="pv-side pv-glass">
      <span class="pv-brand" style="${c.type.h3}"><span class="pv-brand-mark"></span>Settings</span>
      <nav class="pv-nav-col">${nav}</nav>
    </aside>
    <main class="pv-settings-main">
      <div class="pv-settings-panel" data-panel="sec:account">
        <h1 style="${c.type.h2};margin:0 0 4px">Account</h1>
        <p class="pv-dim" style="${c.type.body};margin:0 0 20px">Update your profile and workspace.</p>
        <section class="pv-card pv-glass pv-form-card">
          <div class="pv-form-row">${field(c, { label: 'First name', value: 'Jordan' })}${field(c, { label: 'Last name', value: 'Lee' })}</div>
          ${field(c, { label: 'Email', value: 'jordan@acme.co', type: 'email' })}
          <label class="pv-field"><span class="pv-field-label" style="${c.type.small}">Plan</span><span class="pv-select pv-glass" style="${c.type.body}">Team — $29/mo <span class="pv-caret">▾</span></span></label>
          <div class="pv-form-actions"><button class="pv-btn pv-btn-ghost" style="${c.ghostBtn}">Cancel</button><button class="pv-btn" style="${c.primaryBtn}">Save changes</button></div>
        </section>
      </div>
      <div class="pv-settings-panel" data-panel="sec:appearance" hidden>
        <h1 style="${c.type.h2};margin:0 0 4px">Appearance</h1>
        <p class="pv-dim" style="${c.type.body};margin:0 0 20px">Theme and density.</p>
        <section class="pv-card pv-glass pv-form-card">
          ${toggle(c, 'Dark mode', true)}${toggle(c, 'Reduce motion', false)}${toggle(c, 'High contrast', false)}
          <label class="pv-field"><span class="pv-field-label" style="${c.type.small}">Accent</span><div class="pv-swatch-row">${['', '', '', ''].map((_, i) => `<span class="pv-color-dot${i === 0 ? ' pv-active' : ''}"></span>`).join('')}</div></label>
        </section>
      </div>
      <div class="pv-settings-panel" data-panel="sec:notify" hidden>
        <h1 style="${c.type.h2};margin:0 0 4px">Notifications</h1>
        <p class="pv-dim" style="${c.type.body};margin:0 0 20px">Choose what reaches you.</p>
        <section class="pv-card pv-glass pv-form-card">
          ${toggle(c, 'Product updates', true)}${toggle(c, 'Comments & mentions', true)}${toggle(c, 'Weekly digest', false)}${toggle(c, 'Marketing', false)}
        </section>
      </div>
      <div class="pv-settings-panel" data-panel="sec:security" hidden>
        <h1 style="${c.type.h2};margin:0 0 4px">Security</h1>
        <p class="pv-dim" style="${c.type.body};margin:0 0 20px">Passwords and sessions.</p>
        <section class="pv-card pv-glass pv-form-card">
          ${field(c, { label: 'Current password', placeholder: '••••••••', type: 'password' })}
          ${field(c, { label: 'New password', placeholder: 'At least 12 characters', type: 'password' })}
          ${toggle(c, 'Two-factor authentication', true)}
          <div class="pv-form-actions"><button class="pv-btn" style="${c.primaryBtn}">Update password</button></div>
        </section>
      </div>
    </main>
  </div>`;
}

function auth(c) {
  return `<div class="pv-auth">
    <div class="pv-auth-card pv-card pv-glass">
      <span class="pv-brand pv-auth-brand" style="${c.type.h3}"><span class="pv-brand-mark"></span>${c.name}</span>
      <h1 style="${c.type.h2};margin:0 0 4px;text-align:center">Welcome back</h1>
      <p class="pv-dim" style="${c.type.body};margin:0 0 22px;text-align:center">Sign in to your workspace</p>
      ${field(c, { label: 'Email', placeholder: 'you@company.com', type: 'email' })}
      ${field(c, { label: 'Password', placeholder: '••••••••', type: 'password' })}
      <div class="pv-auth-row"><label class="pv-check"><span class="pv-checkbox pv-on">${icon('check', 'pv-ic')}</span><span style="${c.type.small}">Remember me</span></label><span class="pv-link" style="${c.type.small}">Forgot?</span></div>
      <button class="pv-btn pv-btn-block" style="${c.primaryBtn}">Sign in</button>
      <div class="pv-divider" style="${c.type.small}"><span>or</span></div>
      <button class="pv-btn pv-btn-block pv-btn-ghost" style="${c.ghostBtn}">${icon('user', 'pv-ic')} Continue with SSO</button>
      <p class="pv-dim pv-auth-foot" style="${c.type.small}">No account? <span class="pv-link">Create one</span></p>
    </div>
  </div>`;
}

function article(c) {
  const toc = [
    { label: 'Overview', s: '#pv-a1', active: true },
    { label: 'Design tokens', s: '#pv-a2' },
    { label: 'Using components', s: '#pv-a3' },
    { label: 'Exporting', s: '#pv-a4' },
  ].map((t) => navItem(c, { label: t.label, nav: 'toc', scroll: t.s, active: t.active })).join('');

  return `<div class="pv-article-wrap" data-nav-scope>
    <aside class="pv-toc">
      <span class="pv-eyebrow" style="${c.type.small};color:var(--pv-muted)">On this page</span>
      <nav class="pv-nav-col pv-toc-nav">${toc}</nav>
    </aside>
    <article class="pv-article">
      <span class="pv-pill pv-pill-soft" style="${c.type.small}">Guide</span>
      <h1 id="pv-a1" style="${c.type.hero};margin:12px 0 6px">Building with ${c.name}</h1>
      <p class="pv-dim pv-lead" style="${c.type.bodyLg}">A short tour of how the type scale, color roles, and components come together — every element here is styled from the tokens.</p>
      <p style="${c.type.body}">The body text uses your <em>body</em> role, while headings step through the display and title ramps. Inline <code class="pv-code">tokens</code> and links keep their own treatment.</p>
      <h2 id="pv-a2" style="${c.type.h2};margin:26px 0 8px">Design tokens</h2>
      <p style="${c.type.body}">Tokens are grouped into colors, typography, spacing, radius, shadows, and motion. References like <code class="pv-code">{colors.accent}</code> resolve to real values.</p>
      <blockquote class="pv-quote-block" style="${c.type.bodyLg}">“Keep the source of truth in one file and let every surface derive from it.”</blockquote>
      <ul class="pv-article-list" style="${c.type.body}">
        <li>${icon('check', 'pv-ic pv-ic-accent')} Colors map onto semantic roles automatically.</li>
        <li>${icon('check', 'pv-ic pv-ic-accent')} Fonts load from the typography tokens.</li>
        <li>${icon('check', 'pv-ic pv-ic-accent')} Radii and shadows carry through to components.</li>
      </ul>
      <h2 id="pv-a3" style="${c.type.h2};margin:26px 0 8px">Using components</h2>
      <p style="${c.type.body}">Component definitions become buttons, inputs, and cards. Here's a snippet:</p>
      <pre class="pv-pre" style="${c.type.small}"><code>button-primary:
  backgroundColor: "{colors.accent}"
  textColor: "{colors.on-accent}"
  rounded: "{rounded.sm}"</code></pre>
      <h2 id="pv-a4" style="${c.type.h2};margin:26px 0 8px">Exporting</h2>
      <p style="${c.type.body}">When you're happy, export the tokens as CSS variables, a Tailwind config, or JSON from the panel on the right.</p>
      <div class="pv-cta-row"><button class="pv-btn" style="${c.primaryBtn}">Get the starter</button><button class="pv-btn pv-btn-ghost" style="${c.ghostBtn}">Read the spec</button></div>
    </article>
  </div>`;
}

const LAYOUTS = { marketing, dashboard, app, settings, auth, article };

export function renderPreview(root, design, mode, backdrop = 'design', preset = 'marketing') {
  const c = buildContext(design, mode);
  const stageBg = backdropCss(backdrop, c.r);
  root.setAttribute(
    'style',
    `${tokensToCssVars(design)}\n${rootVars(c)};` +
      `background:${stageBg};color:${c.r.text};${c.font ? `font-family:${c.font};` : ''}`
  );
  const layout = LAYOUTS[preset] || LAYOUTS.marketing;
  root.innerHTML = layout(c, design);
}
