import type { Pattern } from './types';

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function parseRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const int = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function lerpColor(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

export const horizon: Pattern = {
  id: 'horizon',
  label: 'Horizon',
  defaultParams: { layers: 4, roughness: 50 },
  paramLabels: { layers: 'Bands', roughness: 'Softness' },

  draw(ctx, width, height, params, rng, colors) {
    const softness = 0.15 + (Math.max(0, Math.min(100, params.roughness)) / 100) * 0.35;
    const horizonY = height * (0.45 + (rng() - 0.5) * 0.1);

    const bandStops = [colors.background[0], colors.background[1], ...colors.layers].map(parseRgb);
    const stopCount = bandStops.length;

    const img = ctx.createImageData(width, height);
    const data = img.data;

    for (let y = 0; y < height; y++) {
      const ty = y / height;
      const f = ty * (stopCount - 1);
      const idx = Math.min(stopCount - 2, Math.floor(f));
      const localT = smoothstep(0, 1, f - idx);
      let rgb = lerpColor(bandStops[idx], bandStops[idx + 1], localT);

      const distFromHorizon = Math.abs(y - horizonY) / height;
      const glow = 1 - smoothstep(0, softness, distFromHorizon);
      if (glow > 0) {
        rgb = lerpColor(rgb, [255, 240, 210], glow * 0.3);
      }

      const rowStart = y * width * 4;
      for (let x = 0; x < width; x++) {
        const p = rowStart + x * 4;
        data[p] = rgb[0];
        data[p + 1] = rgb[1];
        data[p + 2] = rgb[2];
        data[p + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);
  },
};
