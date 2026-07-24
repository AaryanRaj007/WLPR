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
}

export function getPatternColors(paletteId: string, layerCount: number, mode: Mode): PatternColors {
  const palette = palettes.find((p) => p.id === paletteId) ?? palettes[0];
  const ramp = toneRamp(palette.hue, palette.chroma, 2 + layerCount, mode);
  return {
    background: [ramp[0], ramp[1]],
    layers: ramp.slice(2),
    accent: accentColor(palette.hue, palette.chroma, mode),
    mode,
  };
}
