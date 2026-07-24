import { createNoise2D } from 'simplex-noise';
import type { Pattern } from './types';

function ridgedFbm(noise2D: (x: number, y: number) => number, x: number, y: number, octaves: number): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let prev = 1;
  let max = 0;
  for (let o = 0; o < octaves; o++) {
    let n = noise2D(x * freq, y * freq);
    n = 1 - Math.abs(n);
    n = n * n;
    sum += n * amp * prev;
    prev = n;
    max += amp;
    freq *= 2;
    amp *= 0.5;
  }
  return sum / max;
}

export const ridgeline: Pattern = {
  id: 'ridgeline',
  label: 'Ridgeline',
  defaultParams: { layers: 5, roughness: 60 },
  paramLabels: { layers: 'Layers', roughness: 'Roughness' },

  draw(ctx, width, height, params, rng, colors) {
    const noise2D = createNoise2D(rng);
    const layerCount = Math.max(2, Math.min(8, Math.round(params.layers)));
    const roughness = Math.max(0, Math.min(100, params.roughness)) / 100;

    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, colors.background[0]);
    sky.addColorStop(1, colors.background[1]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const samples = 56;
    for (let i = 0; i < layerCount; i++) {
      const t = i / (layerCount - 1 || 1);
      const baseline = height * (0.44 + t * 0.4);
      const amplitude = height * (0.05 + roughness * 0.15) * (1 - t * 0.3);
      const freq = 2 + t * 1.2;
      const yOffset = i * 41.3;

      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let s = 0; s <= samples; s++) {
        const x = (s / samples) * width;
        const n = ridgedFbm(noise2D, (x / width) * freq, yOffset, 4);
        const y = baseline - n * amplitude;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = colors.layers[Math.min(i, colors.layers.length - 1)];
      ctx.fill();
    }
  },
};
