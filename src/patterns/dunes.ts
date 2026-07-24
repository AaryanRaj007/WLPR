import { createNoise2D } from 'simplex-noise';
import type { Pattern } from './types';

export const dunes: Pattern = {
  id: 'dunes',
  label: 'Dunes',
  defaultParams: { layers: 4, roughness: 35 },
  paramLabels: { layers: 'Layers', roughness: 'Warp' },

  draw(ctx, width, height, params, rng, colors) {
    const noise2D = createNoise2D(rng);
    const layerCount = Math.max(2, Math.min(6, Math.round(params.layers)));
    const warp = 0.6 + (Math.max(0, Math.min(100, params.roughness)) / 100) * 1.4;

    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, colors.background[0]);
    sky.addColorStop(1, colors.background[1]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const samples = 72;
    for (let i = 0; i < layerCount; i++) {
      const t = i / (layerCount - 1 || 1);
      const baseline = height * (0.55 + t * 0.3);
      const amplitude = height * 0.025 * (1 - t * 0.2);
      const yOffset = i * 63.1;

      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let s = 0; s <= samples; s++) {
        const x = (s / samples) * width;
        const warpX = x + noise2D(x * 0.0007, yOffset + 100) * 140 * warp;
        const n = noise2D(warpX * 0.0009, yOffset);
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
