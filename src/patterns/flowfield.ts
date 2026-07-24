import { createNoise2D } from 'simplex-noise';
import type { Pattern } from './types';
import { hexToRgba } from '../color';

export const flowfield: Pattern = {
  id: 'flowfield',
  label: 'Flow Field',
  defaultParams: { layers: 4, roughness: 55 },
  paramLabels: { layers: 'Density', roughness: 'Curliness' },

  draw(ctx, width, height, params, rng, colors) {
    ctx.fillStyle = colors.mode === 'dark' ? colors.layers[colors.layers.length - 1] : colors.background[0];
    ctx.fillRect(0, 0, width, height);

    const noise2D = createNoise2D(rng);
    const horizonY = height * 0.62;
    const curliness = 0.8 + (Math.max(0, Math.min(100, params.roughness)) / 100) * 1.8;
    const density = 90 + Math.round(params.layers * 35);
    const strokeStrong = hexToRgba(colors.accent, 0.55);
    const strokeSoft = hexToRgba(colors.accent, 0.16);
    const strokeFaint = hexToRgba(colors.accent, 0.14);

    ctx.strokeStyle = strokeStrong;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    for (let x = 0; x <= width; x += width / 40) {
      ctx.lineTo(x, horizonY + Math.sin(x * 0.01) * 2);
    }
    ctx.globalAlpha = 0.25;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Long sweeping diagonal lines through the upper calm space
    ctx.strokeStyle = strokeSoft;
    ctx.lineWidth = 1;
    const sweepCount = 7;
    for (let i = 0; i < sweepCount; i++) {
      let x = -width * 0.1 + rng() * width * 0.6;
      let y = rng() * height * 0.3;
      const angle = -0.35 - rng() * 0.25;
      ctx.beginPath();
      ctx.moveTo(x, y);
      const steps = 70;
      for (let s = 0; s < steps; s++) {
        const wobble = noise2D(x * 0.002, y * 0.002 + i * 50) * 0.15;
        x += Math.cos(angle + wobble) * width * 0.012;
        y += Math.sin(angle + wobble) * width * 0.012;
        if (y > horizonY + 40 || x > width + 40) break;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Dense tangled flow lines concentrated near the bottom horizon band
    ctx.strokeStyle = strokeFaint;
    const fieldScale = 0.003;
    const steps = 160;
    const stepSize = Math.max(width, height) * 0.0035;
    const bottomTop = horizonY - height * 0.08;
    const bottomHeight = height - bottomTop + height * 0.15;

    for (let p = 0; p < density; p++) {
      let x = rng() * width;
      let y = bottomTop + rng() * bottomHeight;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let s = 0; s < steps; s++) {
        const angle =
          noise2D(x * fieldScale, y * fieldScale) * Math.PI * curliness + Math.sin(s * 0.4 + p) * 0.8;
        x += Math.cos(angle) * stepSize;
        y += Math.sin(angle) * stepSize;
        if (x < -20 || x > width + 20 || y < bottomTop - 20 || y > height + 20) break;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  },
};
