import { formatHex } from 'culori';

export type Mode = 'light' | 'dark';

export function oklchHex(l: number, c: number, h: number): string {
  return formatHex({ mode: 'oklch', l, c, h }) ?? '#000000';
}

export function toneRamp(
  hue: number,
  chroma: number,
  count: number,
  mode: Mode,
  customRange?: { light: [number, number]; dark: [number, number] },
): string[] {
  const stops: string[] = [];
  const [maxL, minL] = customRange
    ? mode === 'light'
      ? customRange.light
      : customRange.dark
    : mode === 'light'
      ? [0.94, 0.22]
      : [0.42, 0.10];

  for (let i = 0; i < count; i++) {
    const f = count === 1 ? 0 : i / (count - 1);
    const l = maxL - f * (maxL - minL);
    const c = mode === 'dark' ? chroma * 0.8 : chroma;
    stops.push(oklchHex(l, c, hue));
  }
  return stops;
}

export function accentColor(
  hue: number,
  chroma: number,
  mode: Mode,
  customRange?: { light: [number, number]; dark: [number, number] },
): string {
  const c = Math.min(0.22, chroma * 1.8 + 0.05);
  let l = mode === 'dark' ? 0.78 : 0.38;
  if (customRange) {
    const [, minL] = mode === 'light' ? customRange.light : customRange.dark;
    l = minL * 0.95;
  }
  return oklchHex(l, c, hue);
}

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((ch) => ch + ch).join('') : h;
  const int = parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
