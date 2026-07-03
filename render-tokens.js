// render-tokens.js — the inspector panel (swatches, type scale, radii, spacing, components) + prose notes.
import { typographyToCss, resolveComponent } from './resolve.js';

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Heuristic: is this color light? Used to draw a readable border on swatches. */
function isLight(color) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!m) return false;
  let hex = m[1];
  if (hex.length === 3) hex = hex.split('').map((x) => x + x).join('');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.7;
}

function section(title, count, inner) {
  if (!inner) return '';
  return `<section class="tk-section">
    <h3 class="tk-heading">${esc(title)} <span class="tk-count">${count}</span></h3>
    ${inner}
  </section>`;
}

function renderColors(colors) {
  const entries = Object.entries(colors);
  if (!entries.length) return '';
  const chips = entries
    .map(
      ([name, val]) => `
      <div class="tk-swatch" title="${esc(name)}: ${esc(val)}">
        <span class="tk-chip" style="background:${esc(val)};${isLight(val) ? 'box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)' : ''}"></span>
        <span class="tk-swatch-meta">
          <code class="tk-name">${esc(name)}</code>
          <code class="tk-val">${esc(val)}</code>
        </span>
      </div>`
    )
    .join('');
  return section('Colors', entries.length, `<div class="tk-swatches">${chips}</div>`);
}

function renderTypography(typography) {
  const entries = Object.entries(typography);
  if (!entries.length) return '';
  const rows = entries
    .map(([name, t]) => {
      const size = (t && t.fontSize) || '';
      const family = (t && t.fontFamily) || '';
      return `<div class="tk-type-row">
        <div class="tk-type-meta"><code class="tk-name">${esc(name)}</code>
          <span class="tk-type-sub">${esc(family)}${size ? ' · ' + esc(size) : ''}</span></div>
        <div class="tk-type-sample" style="${typographyToCss(t)}">Ag</div>
      </div>`;
    })
    .join('');
  return section('Typography', entries.length, `<div class="tk-types">${rows}</div>`);
}

function renderRounded(rounded) {
  const entries = Object.entries(rounded);
  if (!entries.length) return '';
  const items = entries
    .map(
      ([name, val]) => `<div class="tk-radius">
        <span class="tk-radius-box" style="border-radius:${esc(val)}"></span>
        <code class="tk-name">${esc(name)}</code><code class="tk-val">${esc(val)}</code>
      </div>`
    )
    .join('');
  return section('Rounded', entries.length, `<div class="tk-radii">${items}</div>`);
}

function renderSpacing(spacing) {
  const entries = Object.entries(spacing);
  if (!entries.length) return '';
  const items = entries
    .map(
      ([name, val]) => `<div class="tk-space">
        <span class="tk-space-bar" style="width:${esc(String(val))}"></span>
        <code class="tk-name">${esc(name)}</code><code class="tk-val">${esc(val)}</code>
      </div>`
    )
    .join('');
  return section('Spacing', entries.length, `<div class="tk-spaces">${items}</div>`);
}

function renderComponents(design) {
  const names = Object.keys(design.components);
  if (!names.length) return '';
  const chips = names
    .map((name) => {
      const comp = resolveComponent(name, design);
      const style = comp && comp.css ? comp.css : '';
      const looksButton = /button|btn|chip|action/i.test(name);
      const label = looksButton ? name.replace(/[-_]/g, ' ') : name;
      return `<div class="tk-comp">
        <span class="tk-comp-preview" style="${style}">${esc(looksButton ? label : 'Ag')}</span>
        <code class="tk-name">${esc(name)}</code>
      </div>`;
    })
    .join('');
  return section('Components', names.length, `<div class="tk-comps">${chips}</div>`);
}

/** Render the full token inspector into `el`. */
export function renderTokens(el, design) {
  el.innerHTML =
    renderColors(design.colors) +
    renderTypography(design.typography) +
    renderRounded(design.rounded) +
    renderSpacing(design.spacing) +
    renderComponents(design) || '<p class="tk-empty">No tokens found.</p>';
}

/** Lightweight markdown → HTML for the prose "Notes" tab (headings, bold, lists, code). */
export function renderProse(el, design) {
  const md = design.body || '';
  if (!md.trim()) {
    el.innerHTML = '<p class="tk-empty">This DESIGN.md has no prose notes.</p>';
    return;
  }
  const lines = md.split('\n');
  let html = '';
  let inList = false;
  const inline = (s) =>
    esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  const closeList = () => {
    if (inList) { html += '</ul>'; inList = false; }
  };
  for (const line of lines) {
    const h = /^(#{2,4})\s+(.*)$/.exec(line);
    const li = /^\s*[-*]\s+(.*)$/.exec(line);
    if (h) {
      closeList();
      const level = h[1].length;
      html += `<h${level}>${inline(h[2])}</h${level}>`;
    } else if (li) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${inline(li[1])}</li>`;
    } else if (line.trim() === '') {
      closeList();
    } else {
      closeList();
      html += `<p>${inline(line)}</p>`;
    }
  }
  closeList();
  el.innerHTML = html;
}
