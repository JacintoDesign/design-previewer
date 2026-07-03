// app.js — orchestration: input handling, parsing, and driving the renderers.
import { parseDesign, DesignParseError } from './parse.js';
import { resolveFont, loadGoogleFonts } from './fonts.js';
import { detectTheme, resolveRoles } from './theme.js';
import { BACKDROPS, backdropCss } from './backdrops.js';
import { renderPreview } from './render-preview.js';
import { renderTokens, renderProse } from './render-tokens.js';

const $ = (sel) => document.querySelector(sel);

const el = {
  intro: $('#intro'),
  result: $('#result'),
  dropzone: $('#dropzone'),
  fileInput: $('#file-input'),
  introError: $('#intro-error'),
  designName: $('#design-name'),
  fileName: $('#file-name'),
  previewRoot: $('#preview-root'),
  tokenPanel: $('#token-panel'),
  prosePanel: $('#prose-panel'),
  backdropSelect: $('#backdrop-select'),
  backdropBtn: $('#backdrop-btn'),
  backdropSwatch: $('#backdrop-swatch'),
  backdropLabel: $('#backdrop-label'),
  backdropMenu: $('#backdrop-menu'),
};

let current = null; // { design, mode, backdrop }

function showError(msg) {
  el.introError.textContent = msg;
  el.introError.hidden = false;
}

function clearError() {
  el.introError.hidden = true;
}

function renderAll() {
  if (!current) return;
  renderPreview(el.previewRoot, current.design, current.mode, current.backdrop);
  renderTokens(el.tokenPanel, current.design);
  renderProse(el.prosePanel, current.design);
}

/** Parse raw text and switch to the result view. */
function loadDesign(raw, fileName) {
  let design;
  try {
    design = parseDesign(raw);
  } catch (err) {
    if (err instanceof DesignParseError) showError(err.message);
    else showError('Unexpected error: ' + err.message);
    return;
  }
  clearError();

  // Default the toggle to whichever theme the palette natively describes.
  const nativeMode = detectTheme(design);
  current = { design, mode: nativeMode, backdrop: 'design' };
  loadGoogleFonts(resolveFont(design).families);

  el.designName.textContent = design.name;
  el.fileName.textContent = fileName || '';
  setMode(nativeMode);

  el.intro.hidden = true;
  el.result.hidden = false;
}

function setMode(mode) {
  if (current) current.mode = mode;
  document.querySelectorAll('.toggle-btn').forEach((b) =>
    b.classList.toggle('is-active', b.dataset.mode === mode)
  );
  renderAll();
  refreshBackdrops(); // swatches depend on the theme's colors
}

/* ------------------------------------------------------ backdrop menu --- */

/** Rebuild the backdrop swatches for the current design + theme. */
function refreshBackdrops() {
  if (!current) return;
  const roles = resolveRoles(current.design, current.mode);
  el.backdropMenu.innerHTML = BACKDROPS.map((b) => {
    const active = b.id === current.backdrop;
    return `<button class="backdrop-option${active ? ' is-active' : ''}" type="button"
      role="option" aria-selected="${active}" data-backdrop="${b.id}">
      <span class="backdrop-swatch" style="background:${backdropCss(b.id, roles)}"></span>
      <span>${b.name}</span>
    </button>`;
  }).join('');
  el.backdropMenu.querySelectorAll('.backdrop-option').forEach((btn) =>
    btn.addEventListener('click', () => selectBackdrop(btn.dataset.backdrop))
  );

  const cur = BACKDROPS.find((b) => b.id === current.backdrop) || BACKDROPS[0];
  el.backdropSwatch.style.background = backdropCss(cur.id, roles);
  el.backdropLabel.textContent = cur.name;
}

function selectBackdrop(id) {
  if (!current) return;
  current.backdrop = id;
  renderPreview(el.previewRoot, current.design, current.mode, id);
  refreshBackdrops();
  closeBackdropMenu();
}

function openBackdropMenu() {
  el.backdropMenu.hidden = false;
  el.backdropBtn.setAttribute('aria-expanded', 'true');
}
function closeBackdropMenu() {
  el.backdropMenu.hidden = true;
  el.backdropBtn.setAttribute('aria-expanded', 'false');
}

function reset() {
  current = null;
  closeBackdropMenu();
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

async function loadExample() {
  try {
    const res = await fetch('examples/atmospheric-glass.md');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    loadDesign(await res.text(), 'atmospheric-glass.md (example)');
  } catch (err) {
    showError('Could not load the example (' + err.message + '). Are you serving over http://?');
  }
}

// --- Wire up events -------------------------------------------------------

el.dropzone.addEventListener('click', () => el.fileInput.click());
el.dropzone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.fileInput.click(); }
});
el.fileInput.addEventListener('change', (e) => readFile(e.target.files[0]));

['dragenter', 'dragover'].forEach((ev) =>
  el.dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    el.dropzone.classList.add('is-drag');
  })
);
['dragleave', 'drop'].forEach((ev) =>
  el.dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    el.dropzone.classList.remove('is-drag');
  })
);
el.dropzone.addEventListener('drop', (e) => {
  const file = e.dataTransfer?.files?.[0];
  readFile(file);
});

$('#load-example').addEventListener('click', loadExample);
$('#load-example-2').addEventListener('click', loadExample);
$('#reset').addEventListener('click', reset);

document.querySelectorAll('.toggle-btn').forEach((b) =>
  b.addEventListener('click', () => setMode(b.dataset.mode))
);

// Backdrop dropdown
el.backdropBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  el.backdropMenu.hidden ? openBackdropMenu() : closeBackdropMenu();
});
document.addEventListener('click', (e) => {
  if (!el.backdropSelect.contains(e.target)) closeBackdropMenu();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeBackdropMenu();
});

// Token / Notes tabs
document.querySelectorAll('.tab-btn').forEach((btn) =>
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
    document.querySelectorAll('[data-tab-content]').forEach((c) => {
      c.hidden = c.dataset.tabContent !== tab;
    });
  })
);
