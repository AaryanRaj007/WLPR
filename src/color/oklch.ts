import { formatHex } from 'culori';

export type Mode = 'light' | 'dark';

export function oklchHex(l: number, c: number, h: number): string {
  return formatHex({ mode: 'oklch', l, c, h }) ?? '#000000';
}

// A single monotonic light->dark ramp for a given hue/chroma. `mode` picks
// which brightness band the ramp is drawn from: a bright daylight range for
// 'light', a compressed low-light range (lower L, softer C) for 'dark'.
export function toneRamp(hue: number, chroma: number, count: number, mode: Mode): string[] {
  const stops: string[] = [];
  for (let i = 0; i < count; i++) {
    const f = count === 1 ? 0 : i / (count - 1);
    let l: number;
    let c = chroma;
    if (mode === 'light') {
      l = 0.94 - f * 0.72;
    } else {
      l = 0.42 - f * 0.32;
      c = chroma * 0.8;
    }
    stops.push(oklchHex(l, c, hue));
  }
  return stops;
}

export function accentColor(hue: number, chroma: number, mode: Mode): string {
  const c = Math.min(0.22, chroma * 1.8 + 0.05);
  const l = mode === 'dark' ? 0.78 : 0.38;
  return oklchHex(l, c, hue);
}

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3
    ? h.split('').map((ch) => ch + ch).join('')
    : h;
  const int = parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
