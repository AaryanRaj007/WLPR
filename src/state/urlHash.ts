export interface PersistedState {
  patternId: string;
  paletteId: string;
  mode: 'dark' | 'light';
  seed: string;
  layers: number;
  roughness: number;
  grain: boolean;
}

export function encodeState(s: PersistedState): string {
  const params = new URLSearchParams({
    p: s.patternId,
    pal: s.paletteId,
    m: s.mode,
    s: s.seed,
    l: String(s.layers),
    r: String(s.roughness),
    g: s.grain ? '1' : '0',
  });
  return params.toString();
}

export function decodeHash(hash: string): Partial<PersistedState> | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw) return null;
  const params = new URLSearchParams(raw);
  const patternId = params.get('p');
  if (!patternId) return null;

  const result: Partial<PersistedState> = { patternId };
  const paletteId = params.get('pal');
  const mode = params.get('m');
  const seed = params.get('s');
  if (paletteId) result.paletteId = paletteId;
  if (mode === 'dark' || mode === 'light') result.mode = mode;
  if (seed) result.seed = seed;
  if (params.has('l')) result.layers = Number(params.get('l'));
  if (params.has('r')) result.roughness = Number(params.get('r'));
  if (params.has('g')) result.grain = params.get('g') === '1';
  return result;
}

export function writeHash(s: PersistedState): void {
  const encoded = encodeState(s);
  history.replaceState(null, '', '#' + encoded);
}
