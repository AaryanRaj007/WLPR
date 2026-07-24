export interface Palette {
  id: string;
  label: string;
  hue: number;
  chroma: number;
}

export const palettes: Palette[] = [
  { id: 'mono', label: 'Mono', hue: 0, chroma: 0 },
  { id: 'cream', label: 'Cream', hue: 82, chroma: 0.035 },
  { id: 'slate', label: 'Slate', hue: 250, chroma: 0.06 },
  { id: 'forest', label: 'Forest', hue: 150, chroma: 0.09 },
  { id: 'amber', label: 'Amber', hue: 55, chroma: 0.13 },
  { id: 'violet', label: 'Violet', hue: 305, chroma: 0.1 },
  { id: 'rust', label: 'Rust', hue: 25, chroma: 0.15 },
];

export const defaultPaletteId = 'mono';
