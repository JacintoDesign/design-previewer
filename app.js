// app.js — orchestration: input handling, parsing, and driving the renderers.
import { parseDesign, DesignParseError } from './parse.js';
import { collectFontFamilies } from './resolve.js';
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
};

let current = null; // { design, mode }
let fontLink = null;

/** Load the Google Fonts referenced by the design (best-effort; ignored if unavailable). */
function loadFonts(design) {
  const families = collectFontFamilies(design);
  if (!families.length) return;
  const spec = families
    .map((f) => 'family=' + encodeURIComponent(f).replace(/%20/g, '+') + ':wght@300;400;500;600;700;800;900')
    .join('&');
  const href = `https://fonts.googleapis.com/css2?${spec}&display=swap`;
  if (!fontLink) {
    fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
  }
  fontLink.href = href;
}

function showError(msg) {
  el.introError.textContent = msg;
  el.introError.hidden = false;
}

function clearError() {
  el.introError.hidden = true;
}

function renderAll() {
  if (!current) return;
  renderPreview(el.previewRoot, current.design, current.mode);
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
  current = { design, mode: 'native' };
  loadFonts(design);

  el.designName.textContent = design.name;
  el.fileName.textContent = fileName || '';
  setMode('native');
  renderAll();

  el.intro.hidden = true;
  el.result.hidden = false;
}

function setMode(mode) {
  if (current) current.mode = mode;
  document.querySelectorAll('.toggle-btn').forEach((b) =>
    b.classList.toggle('is-active', b.dataset.mode === mode)
  );
  if (current) renderPreview(el.previewRoot, current.design, mode);
}

function reset() {
  current = null;
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
