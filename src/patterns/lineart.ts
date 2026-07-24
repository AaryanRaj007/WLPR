import { createNoise2D } from 'simplex-noise';
import type { Pattern } from './types';
import { hexToRgba } from '../color';

export const lineart: Pattern = {
  id: 'lineart',
  label: 'Topographic Line Art',
  defaultParams: { layers: 5, roughness: 50 },
  paramLabels: { layers: 'Density', roughness: 'Curvature' },

  draw(ctx, width, height, params, rng, colors) {
    const noise2D = createNoise2D(rng);
    const density = Math.max(15, Math.min(80, Math.round(params.layers * 10)));
    const curvature = 0.5 + (Math.max(0, Math.min(100, params.roughness)) / 100) * 2.5;

    // Fill background
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, colors.background[0]);
    bg.addColorStop(1, colors.background[1]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const mainStroke = colors.mode === 'dark' ? '#ffffff' : '#111827';
    const accentStroke = colors.accent;

    // 1. Primary Topographic Horizontal Contour Lines
    const stepY = (height * 1.2) / density;
    const samples = 140;
    const stepX = width / samples;
    const startY = -height * 0.1;

    for (let i = 0; i < density; i++) {
      const baseY = startY + i * stepY;
      const isMajor = i % 5 === 0;
      const strokeColor = isMajor ? accentStroke : (colors.layers[i % colors.layers.length] || mainStroke);

      ctx.beginPath();
      ctx.lineWidth = isMajor ? 3.0 : 1.2;
      ctx.strokeStyle = strokeColor;
      ctx.globalAlpha = isMajor ? 0.9 : 0.45;

      for (let s = 0; s <= samples; s++) {
        const x = s * stepX;
        const n1 = noise2D(x * 0.0006, baseY * 0.0008);
        const n2 = noise2D(x * 0.0012 + 50, baseY * 0.0012 + 50);
        const elevation = (n1 * 0.75 + n2 * 0.25) * height * 0.15 * curvature;
        const y = baseY + elevation;

        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 2. Secondary Vertical Contour Cross Lines
    const vertDensity = Math.round(density * 0.6);
    const stepVertX = (width * 1.2) / vertDensity;
    const vertSamples = 100;
    const stepVertY = height / vertSamples;

    for (let i = 0; i < vertDensity; i++) {
      const baseX = -width * 0.1 + i * stepVertX;
      if (i % 3 !== 0) continue; // Only draw every 3rd vertical line for clean minimal line art

      ctx.beginPath();
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = hexToRgba(mainStroke, 0.2);
      ctx.globalAlpha = 0.25;

      for (let s = 0; s <= vertSamples; s++) {
        const y = s * stepVertY;
        const n = noise2D(baseX * 0.0008, y * 0.0006);
        const offset = n * width * 0.08 * curvature;
        const x = baseX + offset;

        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0;
  },
};
