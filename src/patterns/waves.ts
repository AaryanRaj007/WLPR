import { createNoise2D } from 'simplex-noise';
import type { Pattern } from './types';
import { hexToRgba } from '../color';

export const waves: Pattern = {
  id: 'waves',
  label: 'Curved Waves',
  defaultParams: { layers: 4, roughness: 50 },
  paramLabels: { layers: 'Line Count', roughness: 'Wave Height' },

  draw(ctx, width, height, params, rng, colors) {
    const noise2D = createNoise2D(rng);
    const count = Math.max(3, Math.min(10, Math.round(params.layers)));
    const waveHeight = (params.roughness / 100) * height * 0.25;

    // Clean background
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, colors.background[0]);
    bg.addColorStop(1, colors.background[1]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Single unified stroke color based on accent/theme
    const strokeColor = colors.accent || (colors.mode === 'dark' ? '#38bdf8' : '#0284c7');

    // Confined strictly to lower portion of the screen (bottom ~35%)
    const baseY = height * 0.72;
    const samples = 140;
    const stepX = width / samples;

    for (let i = 0; i < count; i++) {
      const lineYOffset = (i - count / 2) * 18;
      const freq = 0.0018 + (i % 3) * 0.0004;
      const phase = i * 0.45;

      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = hexToRgba(strokeColor, 0.75 + (i / count) * 0.25);

      for (let s = 0; s <= samples; s++) {
        const x = s * stepX;
        const sineWave = Math.sin(x * freq + phase) * waveHeight * 0.5;
        const noiseWave = noise2D(x * 0.001 + i * 10, i * 20) * waveHeight * 0.5;
        const y = baseY + lineYOffset + sineWave + noiseWave;

        if (s === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
  },
};
