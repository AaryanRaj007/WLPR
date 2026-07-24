import './style.css';
import { patterns, patternList, defaultPatternId } from './patterns/registry';
import type { PatternParams } from './patterns/types';
import { renderToCanvas } from './engine/render';
import { randomSeed } from './engine/prng';
import { getPatternColors, palettes, defaultPaletteId, type Mode } from './color';
import { decodeHash, writeHash, type PersistedState } from './state/urlHash';
import { loadFromStorage, saveToStorage } from './state/persistence';
import { exportPng, downloadBlob } from './engine/export';

// ---------- static UI wiring (selection states, toggles) ----------

function selectOnce(groupSelector: string, itemSelector: string, onSelect?: (el: Element) => void) {
  const group = document.querySelector(groupSelector);
  if (!group) return;
  group.querySelectorAll(itemSelector).forEach((el) => {
    el.addEventListener('click', () => {
      group.querySelectorAll(itemSelector).forEach((sib) => {
        sib.classList.remove('is-selected');
        sib.setAttribute('aria-pressed', 'false');
      });
      el.classList.add('is-selected');
      el.setAttribute('aria-pressed', 'true');
      onSelect?.(el);
    });
  });
}

function selectSwatch(groupSelector: string, itemSelector: string, dataAttr: string, value: string) {
  const group = document.querySelector(groupSelector);
  if (!group) return;
  group.querySelectorAll(itemSelector).forEach((el) => {
    const match = (el as HTMLElement).dataset[dataAttr] === value;
    el.classList.toggle('is-selected', match);
    el.setAttribute('aria-pressed', String(match));
  });
}

selectOnce('#pattern-grid', '.pattern-swatch', (el) => {
  const id = (el as HTMLElement).dataset.pattern;
  if (id) selectPattern(id);
});
selectOnce('#palette-grid', '.palette-swatch', (el) => {
  const id = (el as HTMLElement).dataset.palette;
  if (id) {
    state.paletteId = id;
    renderAll();
  }
});

const modeDark = document.getElementById('mode-dark')!;
const modeLight = document.getElementById('mode-light')!;
function setMode(active: HTMLElement, inactive: HTMLElement) {
  active.classList.add('is-selected');
  active.setAttribute('aria-pressed', 'true');
  inactive.classList.remove('is-selected');
  inactive.setAttribute('aria-pressed', 'false');
}
modeDark.addEventListener('click', () => {
  setMode(modeDark, modeLight);
  state.mode = 'dark';
  renderAll();
});
modeLight.addEventListener('click', () => {
  setMode(modeLight, modeDark);
  state.mode = 'light';
  renderAll();
});

const grainToggle = document.getElementById('grain-toggle')!;
grainToggle.addEventListener('click', () => {
  const on = grainToggle.getAttribute('aria-checked') === 'true';
  grainToggle.setAttribute('aria-checked', String(!on));
  state.grain = !on;
  renderAll();
});

const invertToggle = document.getElementById('invert-toggle')!;
invertToggle.addEventListener('click', () => {
  const on = invertToggle.getAttribute('aria-checked') === 'true';
  invertToggle.setAttribute('aria-checked', String(!on));
  state.invert = !on;
  renderAll();
});

const customizeToggle = document.getElementById('customize-toggle')!;
const customizeBody = document.getElementById('customize-body')!;
customizeToggle.addEventListener('click', () => {
  const expanded = customizeToggle.getAttribute('aria-expanded') === 'true';
  customizeToggle.setAttribute('aria-expanded', String(!expanded));
  customizeBody.hidden = expanded;
});

// ---------- render engine wiring ----------

const desktopCanvas = document.getElementById('preview-desktop') as HTMLCanvasElement;
const phoneCanvas = document.getElementById('preview-phone') as HTMLCanvasElement;
const layersInput = document.querySelector<HTMLInputElement>('.field input[data-param="layers"]')!;
const roughnessInput = document.querySelector<HTMLInputElement>('.field input[data-param="roughness"]')!;
const seedInput = document.querySelector<HTMLInputElement>('.seed-input')!;
const shuffleBtn = document.getElementById('shuffle-btn')!;

// ---------- restore state: URL hash takes priority, then localStorage, then defaults ----------

const validPatternIds = new Set(patternList.map((p) => p.id));
const validPaletteIds = new Set(palettes.map((p) => p.id));

function sanitize(restored: Partial<PersistedState> | null): Partial<PersistedState> {
  if (!restored) return {};
  const clean: Partial<PersistedState> = {};
  if (restored.patternId && validPatternIds.has(restored.patternId)) clean.patternId = restored.patternId;
  if (restored.paletteId && validPaletteIds.has(restored.paletteId)) clean.paletteId = restored.paletteId;
  if (restored.mode === 'dark' || restored.mode === 'light') clean.mode = restored.mode;
  if (restored.seed) clean.seed = restored.seed;
  if (typeof restored.layers === 'number' && !Number.isNaN(restored.layers)) clean.layers = restored.layers;
  if (typeof restored.roughness === 'number' && !Number.isNaN(restored.roughness)) clean.roughness = restored.roughness;
  if (typeof restored.grain === 'boolean') clean.grain = restored.grain;
  if (typeof restored.invert === 'boolean') clean.invert = restored.invert;
  return clean;
}

const fromStorage = sanitize(loadFromStorage());
const fromHash = sanitize(decodeHash(location.hash));
const restored: Partial<PersistedState> = { ...fromStorage, ...fromHash };

const initialPatternId = restored.patternId ?? defaultPatternId;
const initialPattern = patterns[initialPatternId];

const state = {
  patternId: initialPatternId,
  paletteId: restored.paletteId ?? defaultPaletteId,
  mode: (restored.mode ?? 'dark') as Mode,
  seed: restored.seed ?? seedInput.value,
  params: {
    layers: restored.layers ?? initialPattern.defaultParams.layers,
    roughness: restored.roughness ?? initialPattern.defaultParams.roughness,
  } as PatternParams,
  grain: restored.grain ?? false,
  invert: restored.invert ?? false,
};

function renderAll() {
  const pattern = patterns[state.patternId];
  if (!pattern) return;
  const colors = getPatternColors(state.paletteId, Math.round(state.params.layers), state.mode, state.invert);
  renderToCanvas(desktopCanvas, pattern, state.seed, state.params, colors, state.grain);
  renderToCanvas(phoneCanvas, pattern, state.seed, state.params, colors, state.grain);

  const persisted: PersistedState = {
    patternId: state.patternId,
    paletteId: state.paletteId,
    mode: state.mode,
    seed: state.seed,
    layers: state.params.layers,
    roughness: state.params.roughness,
    grain: state.grain,
    invert: state.invert,
  };
  writeHash(persisted);
  saveToStorage(persisted);
}

function setFieldUi(pattern: (typeof patterns)[string]) {
  layersInput.value = String(state.params.layers);
  roughnessInput.value = String(state.params.roughness);
  const layersOut = layersInput.parentElement?.querySelector('.field-value');
  const roughnessOut = roughnessInput.parentElement?.querySelector('.field-value');
  const layersLabel = layersInput.parentElement?.querySelector('.field-label');
  const roughnessLabel = roughnessInput.parentElement?.querySelector('.field-label');
  if (layersOut) layersOut.textContent = layersInput.value;
  if (roughnessOut) roughnessOut.textContent = roughnessInput.value;
  if (layersLabel) layersLabel.textContent = pattern.paramLabels.layers;
  if (roughnessLabel) roughnessLabel.textContent = pattern.paramLabels.roughness;
}

function selectPattern(id: string) {
  const pattern = patterns[id];
  if (!pattern) return;
  state.patternId = id;
  state.params = { ...pattern.defaultParams };
  setFieldUi(pattern);
  renderAll();
}

layersInput.addEventListener('input', () => {
  state.params.layers = Number(layersInput.value);
  renderAll();
});

roughnessInput.addEventListener('input', () => {
  state.params.roughness = Number(roughnessInput.value);
  renderAll();
});

seedInput.addEventListener('input', () => {
  state.seed = seedInput.value || ' ';
  renderAll();
});

shuffleBtn.addEventListener('click', () => {
  state.seed = randomSeed();
  seedInput.value = state.seed;
  renderAll();
});

document.querySelectorAll<HTMLInputElement>('.field input[type="range"]').forEach((input) => {
  const output = input.parentElement?.querySelector('.field-value');
  if (!output) return;
  output.textContent = input.value;
  input.addEventListener('input', () => {
    output.textContent = input.value;
  });
});

// ---------- apply restored state to the DOM before first render ----------

seedInput.value = state.seed;
selectSwatch('#pattern-grid', '.pattern-swatch', 'pattern', state.patternId);
selectSwatch('#palette-grid', '.palette-swatch', 'palette', state.paletteId);
if (state.mode === 'light') {
  setMode(modeLight, modeDark);
} else {
  setMode(modeDark, modeLight);
}
grainToggle.setAttribute('aria-checked', String(state.grain));
invertToggle.setAttribute('aria-checked', String(state.invert));
setFieldUi(initialPattern);

renderAll();

// ---------- export ----------

const sizePresetSelect = document.getElementById('size-preset') as HTMLSelectElement;
const downloadBtn = document.getElementById('download-btn') as HTMLButtonElement;

function resolveExportSize(): { width: number; height: number } {
  const value = sizePresetSelect.value;
  if (value === 'match') {
    const dpr = window.devicePixelRatio || 1;
    return {
      width: Math.round(window.screen.width * dpr),
      height: Math.round(window.screen.height * dpr),
    };
  }
  const [w, h] = value.split('x').map(Number);
  return { width: w, height: h };
}

downloadBtn.addEventListener('click', async () => {
  const pattern = patterns[state.patternId];
  if (!pattern) return;

  const { width, height } = resolveExportSize();
  const colors = getPatternColors(state.paletteId, Math.round(state.params.layers), state.mode, state.invert);
  const originalLabel = downloadBtn.textContent;
  downloadBtn.disabled = true;
  downloadBtn.textContent = 'Exporting…';

  try {
    const blob = await exportPng({
      patternId: state.patternId,
      seed: state.seed,
      params: state.params,
      colors,
      grain: state.grain,
      width,
      height,
    });
    downloadBlob(blob, `wlpr-${state.patternId}-${state.seed}-${width}x${height}.png`);
  } catch (err) {
    console.error('Export failed', err);
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.textContent = originalLabel;
  }
});
