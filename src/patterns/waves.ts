import { createNoise2D } from 'simplex-noise';
import type { Pattern } from './types';

export const waves: Pattern = {
  id: 'waves',
  label: 'Curved Waves',
  defaultParams: { layers: 5, roughness: 45 },
  paramLabels: { layers: 'Line Density', roughness: 'Curvature' },

  draw(ctx, width, height, params, rng, colors) {
    const noise2D = createNoise2D(rng);
    const lineCount = Math.max(12, Math.min(70, Math.round(params.layers * 8)));
    const curvature = 0.4 + (Math.max(0, Math.min(100, params.roughness)) / 100) * 2.2;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, colors.background[0]);
    bg.addColorStop(1, colors.background[1]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const stepY = (height * 1.1) / (lineCount + 1);
    const startY = -height * 0.05;
    const samples = 160;
    const stepX = width / samples;

    const accentColor = colors.accent;
    const mainStroke = colors.mode === 'dark' ? '#ffffff' : '#0f172a';

    // Draw multiple smooth thin curved lines flowing left to right
    for (let i = 1; i <= lineCount; i++) {
      const baseY = startY + i * stepY;
      const isAccent = i % 4 === 0;
      const colorIndex = i % colors.layers.length;
      const strokeColor = isAccent ? accentColor : (colors.layers[colorIndex] || mainStroke);

      ctx.beginPath();
      ctx.lineWidth = isAccent ? 2.2 : 1.2;
      ctx.strokeStyle = strokeColor;
      ctx.globalAlpha = isAccent ? 0.85 : 0.4 + (i / lineCount) * 0.35;

      for (let s = 0; s <= samples; s++) {
        const x = s * stepX;
        const progress = s / samples; // 0 to 1

        // Smooth wave modulation combining sine harmonic waves + noise
        const freq1 = 0.0015;
        const freq2 = 0.003;
        const wave1 = Math.sin(x * freq1 + i * 0.25) * height * 0.08 * curvature;
        const wave2 = Math.cos(x * freq2 - i * 0.15) * height * 0.04 * curvature;
        const noiseVal = noise2D(x * 0.0008, baseY * 0.0008) * height * 0.06 * curvature;

        // Envelope shape to pinch waves slightly at edges for aesthetic look
        const envelope = Math.sin(progress * Math.PI);
        const y = baseY + (wave1 + wave2 + noiseVal) * envelope;

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
