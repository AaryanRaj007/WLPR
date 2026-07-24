import { palettes } from './palettes';
import { toneRamp, accentColor, type Mode } from './oklch';

export type { Mode } from './oklch';
export { hexToRgba } from './oklch';
export { palettes, defaultPaletteId } from './palettes';

export interface PatternColors {
  background: [string, string];
  layers: string[];
  accent: string;
  mode: Mode;
  invert?: boolean;
}

export function getPatternColors(
  paletteId: string,
  layerCount: number,
  mode: Mode,
  invert: boolean = false,
): PatternColors {
  const palette = palettes.find((p) => p.id === paletteId) ?? palettes[0];
  const totalStops = 2 + layerCount;
  let ramp = toneRamp(palette.hue, palette.chroma, totalStops, mode, palette.lightnessRange);

  if (invert) {
    ramp = [...ramp].reverse();
  }

  return {
    background: [ramp[0], ramp[1]],
    layers: ramp.slice(2),
    accent: accentColor(palette.hue, palette.chroma, mode, palette.lightnessRange),
    mode,
    invert,
  };
}
