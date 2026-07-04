// app.js — orchestration: input handling, parsing, and driving the renderers.
import { parseDesign, DesignParseError } from './parse.js';
import { resolveFont, loadGoogleFonts } from './fonts.js';
import { detectTheme, resolveRoles } from './theme.js';
import { BACKDROPS, backdropCss } from './backdrops.js';
import { renderPreview, PRESETS } from './render-preview.js';
import { renderTokens, renderProse } from './render-tokens.js';
import { EXPORTS } from './exports.js';

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const EXAMPLES = [
  { file: 'vibemail-glass.md', name: 'VibeMail Glass' },
  { file: 'paws-and-paths.md', name: 'Paws & Paths' },
  { file: 'totality-festival.md', name: 'Totality Festival' },
  { file: 'ledger-bolt.md', name: 'Ledger Bolt' },
  { file: 'atelier-form.md', name: 'Atelier Form' },
];

const el = {
  intro: $('#intro'),
  result: $('#result'),
  dropzone: $('#dropzone'),
  fileInput: $('#file-input'),
  introError: $('#intro-error'),
  designName: $('#design-name'),
  fileName: $('#file-name'),
  previewRoot: $('#preview-root'),
  previewPane: $('.preview-pane'),
  split: $('.split'),
  paneResizer: $('#pane-resizer'),
  tokenPanel: $('#token-panel'),
  prosePanel: $('#prose-panel'),
  presetLabel: $('#preset-label'),
  backdropSwatch: $('#backdrop-swatch'),
  backdropLabel: $('#backdrop-label'),
  toast: $('#toast'),
};

let current = null; // { design, mode, backdrop, preset, presetW }
let toastTimer = null;

/* --------------------------------------------------------- accessible dd --- */

/**
 * Wire a `.dd` dropdown: click/keyboard open-close, arrow-key roving, Escape,
 * outside-click, focus return. `onOpen` (re)builds the menu; `onSelect(value)`
 * fires for the chosen `[data-value]` option.
 */
function setupDropdown(id, { onOpen, onSelect }) {
  const dd = document.getElementById(id);
  const btn = dd.querySelector('.dd-trigger');
  const menu = dd.querySelector('.dd-menu');
  let idx = -1;
  const items = () => [...menu.querySelectorAll('[data-value]')];
  const focusItem = (i) => {
    const its = items();
    if (!its.length) return;
    idx = (i + its.length) % its.length;
    its.forEach((n, j) => (n.tabIndex = j === idx ? 0 : -1));
    its[idx].focus();
  };
  const open = () => {
    if (onOpen) onOpen();
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    idx = -1;
    requestAnimationFrame(() => focusItem(Math.max(0, items().findIndex((n) => n.classList.contains('is-active')))));
  };
  const close = (returnFocus) => {
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (returnFocus) btn.focus();
  };
  btn.addEventListener('click', (e) => { e.stopPropagation(); menu.hidden ? open() : close(); });
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); menu.hidden ? open() : focusItem(idx + 1); }
  });
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(true); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); focusItem(idx + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusItem(idx - 1); }
    else if (e.key === 'Home') { e.preventDefault(); focusItem(0); }
    else if (e.key === 'End') { e.preventDefault(); focusItem(items().length - 1); }
  });
  menu.addEventListener('click', (e) => {
    const opt = e.target.closest('[data-value]');
    if (opt) { onSelect(opt.dataset.value); close(true); }
  });
  document.addEventListener('click', (e) => { if (!dd.contains(e.target)) close(false); });
  return { close };
}

const option = (value, label, { active = false, swatch = '', sub = '' } = {}) =>
  `<button class="dd-option${active ? ' is-active' : ''}" type="button" role="option"
    aria-selected="${active}" data-value="${esc(value)}" tabindex="-1">
    ${swatch ? `<span class="dd-swatch" style="background:${swatch}"></span>` : ''}
    <span>${esc(label)}${sub ? `<br><span class="dd-option-sub">${esc(sub)}</span>` : ''}</span>
  </button>`;

/** Copy text to the clipboard, falling back to execCommand off secure contexts. */
async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------- toast --- */

function showToast(msg) {
  el.toast.textContent = msg;
  el.toast.hidden = false;
  requestAnimationFrame(() => el.toast.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.toast.classList.remove('show');
    setTimeout(() => (el.toast.hidden = true), 250);
  }, 2000);
}

/* ---------------------------------------------------------- rendering --- */

function showError(msg) { el.introError.textContent = msg; el.introError.hidden = false; }
function clearError() { el.introError.hidden = true; }

function renderAll() {
  if (!current) return;
  renderPreview(el.previewRoot, current.design, current.mode, current.backdrop, current.preset);
  applyPresetWidths(); // reapply drag-resized columns (renderPreview rewrote the style)
  renderTokens(el.tokenPanel, current.design, resolveRoles(current.design, current.mode));
  renderProse(el.prosePanel, current.design);
}

/** Re-apply any drag-resized preset column widths onto the freshly-rendered root. */
function applyPresetWidths() {
  const w = current && current.presetW;
  if (!w) return;
  for (const [k, v] of Object.entries(w)) el.previewRoot.style.setProperty(k, v);
}

function loadDesign(raw, fileName) {
  let design;
  try {
    design = parseDesign(raw);
  } catch (err) {
    showError(err instanceof DesignParseError ? err.message : 'Unexpected error: ' + err.message);
    return;
  }
  clearError();
  const nativeMode = detectTheme(design);
  current = { design, mode: nativeMode, backdrop: 'design', preset: current?.preset || 'showcase' };
  loadGoogleFonts(resolveFont(design).families);

  el.designName.textContent = design.name;
  el.fileName.textContent = fileName || '';
  el.presetLabel.textContent = (PRESETS.find((p) => p.id === current.preset) || PRESETS[0]).name;
  setMode(nativeMode);

  el.intro.hidden = true;
  el.result.hidden = false;
}

function setMode(mode) {
  if (current) current.mode = mode;
  document.querySelectorAll('.toggle-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.mode === mode));
  el.previewPane.dataset.preview = mode; // canvas contrasts with the preview theme
  renderAll();
  updateBackdropTrigger();
}

/** Backdrop swatches depend on the theme, so recompute the trigger on changes. */
function updateBackdropTrigger() {
  if (!current) return;
  const roles = resolveRoles(current.design, current.mode);
  const cur = BACKDROPS.find((b) => b.id === current.backdrop) || BACKDROPS[0];
  el.backdropSwatch.style.background = backdropCss(cur.id, roles);
  el.backdropLabel.textContent = cur.name;
}

function reset() {
  const preset = current?.preset;
  current = preset ? { preset } : null;
  el.result.hidden = true;
  el.intro.hidden = false;
  el.fileInput.value = '';
  clearError();
}

function readFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => loadDesign(String(reader.result), file.name);
  reader.onerror = () => showError('Could not read that file.');
  reader.readAsText(file);
}

async function loadExampleFile(file) {
  const meta = EXAMPLES.find((e) => e.file === file) || EXAMPLES[0];
  try {
    const res = await fetch('examples/' + meta.file);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    loadDesign(await res.text(), meta.file + ' (example)');
  } catch (err) {
    showError('Could not load the example (' + err.message + '). Are you serving over http://?');
  }
}

// --- Dropdowns ------------------------------------------------------------

setupDropdown('example-dd', {
  onOpen: () => {
    $('#example-menu').innerHTML = EXAMPLES.map((e) => option(e.file, e.name)).join('');
  },
  onSelect: (file) => loadExampleFile(file),
});

setupDropdown('preset-dd', {
  onOpen: () => {
    $('#preset-menu').innerHTML = PRESETS.map((p) => option(p.id, p.name, { active: current?.preset === p.id })).join('');
  },
  onSelect: (id) => {
    if (!current) return;
    current.preset = id;
    current.presetW = {}; // reset column widths for the new layout
    el.presetLabel.textContent = (PRESETS.find((p) => p.id === id) || PRESETS[0]).name;
    renderPreview(el.previewRoot, current.design, current.mode, current.backdrop, id);
  },
});

setupDropdown('backdrop-dd', {
  onOpen: () => {
    const roles = resolveRoles(current.design, current.mode);
    $('#backdrop-menu').innerHTML = BACKDROPS.map((b) =>
      option(b.id, b.name, { active: current.backdrop === b.id, swatch: backdropCss(b.id, roles) })
    ).join('');
  },
  onSelect: (id) => {
    if (!current) return;
    current.backdrop = id;
    renderPreview(el.previewRoot, current.design, current.mode, id, current.preset);
    updateBackdropTrigger();
  },
});

setupDropdown('export-dd', {
  onOpen: () => {
    $('#export-menu').innerHTML = EXPORTS.map((e) => option(e.id, e.name, { sub: 'Copy to clipboard' })).join('');
  },
  onSelect: async (id) => {
    if (!current) return;
    const fmt = EXPORTS.find((e) => e.id === id);
    if (!fmt) return;
    const ok = await copyText(fmt.run(current.design));
    showToast(ok ? `Copied ${fmt.name} to clipboard` : 'Copy failed — clipboard blocked');
  },
});

// --- Wire up events -------------------------------------------------------

el.dropzone.addEventListener('click', () => el.fileInput.click());
el.dropzone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.fileInput.click(); }
});
el.fileInput.addEventListener('change', (e) => readFile(e.target.files[0]));

['dragenter', 'dragover'].forEach((ev) =>
  el.dropzone.addEventListener(ev, (e) => { e.preventDefault(); el.dropzone.classList.add('is-drag'); })
);
['dragleave', 'drop'].forEach((ev) =>
  el.dropzone.addEventListener(ev, (e) => { e.preventDefault(); el.dropzone.classList.remove('is-drag'); })
);
el.dropzone.addEventListener('drop', (e) => readFile(e.dataTransfer?.files?.[0]));

$('#load-example-2').addEventListener('click', () => loadExampleFile('vibemail-glass.md'));
$('#reset').addEventListener('click', reset);

document.querySelectorAll('.toggle-btn').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));

// Preview navigation: clicking a [data-nav] element activates it and reveals the
// matching [data-panel] within the same scope. Values are namespaced by a group
// prefix ("view:overview", "folder:inbox") so independent navs don't collide.
// One delegated listener on the persistent root survives every re-render.
const navGroup = (v) => (v.includes(':') ? v.slice(0, v.indexOf(':')) : v);
el.previewRoot.addEventListener('click', (e) => {
  const nav = e.target.closest('[data-nav]');
  if (!nav) return;
  const scope = nav.closest('[data-nav-scope]') || el.previewRoot;
  const grp = navGroup(nav.dataset.nav);
  scope.querySelectorAll('[data-nav]').forEach((n) => {
    if (navGroup(n.dataset.nav) === grp) n.classList.toggle('pv-active', n === nav);
  });
  if (nav.dataset.scroll) {
    scope.querySelector(nav.dataset.scroll)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  scope.querySelectorAll('[data-panel]').forEach((p) => {
    if (navGroup(p.dataset.panel) === grp) p.hidden = p.dataset.panel !== nav.dataset.nav;
  });
});

// --- Resizing -------------------------------------------------------------

/** Run a horizontal drag: onMove(ev) each mousemove until mouseup. */
function startDrag(handle, onMove) {
  handle.classList.add('is-dragging');
  document.body.style.userSelect = 'none';
  document.body.style.cursor = 'col-resize';
  const move = (ev) => onMove(ev);
  const up = () => {
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
    handle.classList.remove('is-dragging');
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', up);
}

// Token panel: drag its left edge to widen it (default width is the minimum).
el.paneResizer.addEventListener('mousedown', (e) => {
  e.preventDefault();
  const max = Math.round(window.innerWidth * 0.7);
  startDrag(el.paneResizer, (ev) => {
    const w = Math.min(Math.max(document.documentElement.clientWidth - ev.clientX, 400), max);
    el.split.style.setProperty('--token-w', w + 'px');
  });
});

// Preset columns: drag a .pv-resizer to widen the sidebar / list (default = min).
// Delegated on the persistent root; widths are stored so they survive re-render.
const RESIZE_VAR = { side: '--pv-side-w', list: '--pv-list-w', toc: '--pv-toc-w' };
el.previewRoot.addEventListener('mousedown', (e) => {
  const h = e.target.closest('.pv-resizer');
  if (!h) return;
  e.preventDefault();
  const varName = RESIZE_VAR[h.dataset.resize];
  if (!varName || !current) return;
  const min = parseInt(h.dataset.min, 10) || 150;
  const max = Math.round(el.previewRoot.clientWidth * 0.5);
  const startX = e.clientX;
  const startW = h.parentElement.getBoundingClientRect().width;
  startDrag(h, (ev) => {
    const w = Math.min(Math.max(startW + (ev.clientX - startX), min), max);
    el.previewRoot.style.setProperty(varName, w + 'px');
    current.presetW = current.presetW || {};
    current.presetW[varName] = w + 'px';
  });
});

// Token / Notes tabs
document.querySelectorAll('.tab-btn').forEach((btn) =>
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
    document.querySelectorAll('[data-tab-content]').forEach((c) => { c.hidden = c.dataset.tabContent !== tab; });
  })
);
