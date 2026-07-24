import { createNoise2D } from 'simplex-noise';
import type { Pattern } from './types';

export const lineart: Pattern = {
  id: 'lineart',
  label: 'Topographic Line Art',
  defaultParams: { layers: 4, roughness: 45 },
  paramLabels: { layers: 'Line Count', roughness: 'Warp' },

  draw(ctx, width, height, params, rng, colors) {
    const noise2D = createNoise2D(rng);
    const lineCount = Math.max(10, Math.min(70, Math.round(params.layers * 8)));
    const warp = 0.5 + (Math.max(0, Math.min(100, params.roughness)) / 100) * 2.2;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, colors.background[0]);
    bg.addColorStop(1, colors.background[1]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const stepY = height / (lineCount + 1);
    const samples = 120;
    const stepX = width / samples;

    // Draw flowing topographic contour lines
    for (let i = 1; i <= lineCount; i++) {
      const baseY = stepY * i;
      const layerIndex = i % colors.layers.length;
      const strokeColor = colors.layers[layerIndex];
      const frequency = 0.0008;

      ctx.beginPath();
      ctx.lineWidth = i % 5 === 0 ? 3.5 : 1.5;
      ctx.strokeStyle = strokeColor;
      ctx.globalAlpha = i % 5 === 0 ? 0.85 : 0.45;

      for (let s = 0; s <= samples; s++) {
        const x = s * stepX;
        const n1 = noise2D(x * frequency, baseY * frequency * 1.5);
        const n2 = noise2D(x * frequency * 2 + 100, baseY * frequency * 2 + 100);
        const elevation = (n1 * 0.7 + n2 * 0.3) * height * 0.12 * warp;
        const y = baseY + elevation;

        if (s === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
  },
};
