import type { Pattern } from './types';
import { hexToRgba } from '../color';

export const geometric: Pattern = {
  id: 'geometric',
  label: 'Geometric Minimal',
  defaultParams: { layers: 5, roughness: 40 },
  paramLabels: { layers: 'Shapes', roughness: 'Rotation' },

  draw(ctx, width, height, params, rng, colors) {
    const shapeCount = Math.max(3, Math.min(10, Math.round(params.layers)));
    const rotationAngle = (params.roughness / 100) * Math.PI * 0.5;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, colors.background[0]);
    bg.addColorStop(1, colors.background[1]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    // Center origin for composition
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    // 1. Draw central glowing sun / concentric circles
    const baseRadius = Math.min(width, height) * 0.22;
    for (let r = 3; r >= 1; r--) {
      const radius = baseRadius * (r / 3);
      ctx.beginPath();
      ctx.arc(centerX + (rng() - 0.5) * 80, centerY + (rng() - 0.5) * 60, radius, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(colors.layers[r % colors.layers.length] || colors.accent, 0.25 + r * 0.15);
      ctx.fill();
    }

    // 2. Draw overlapping geometric polygons / diagonal bands
    for (let i = 0; i < shapeCount; i++) {
      ctx.save();
      const x = width * (0.2 + rng() * 0.6);
      const y = height * (0.2 + rng() * 0.6);
      const size = Math.min(width, height) * (0.15 + rng() * 0.25);
      const angle = (rng() - 0.5) * rotationAngle + (i * Math.PI) / 6;

      ctx.translate(x, y);
      ctx.rotate(angle);

      const color = colors.layers[i % colors.layers.length] || colors.accent;
      ctx.fillStyle = hexToRgba(color, 0.35 + (i / shapeCount) * 0.4);
      ctx.strokeStyle = hexToRgba(colors.accent, 0.7);
      ctx.lineWidth = 2;

      const shapeType = i % 3;
      if (shapeType === 0) {
        // Rotated Rectangle / Band
        ctx.fillRect(-size * 0.5, -size * 0.25, size, size * 0.5);
        ctx.strokeRect(-size * 0.5, -size * 0.25, size, size * 0.5);
      } else if (shapeType === 1) {
        // Triangle
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.5);
        ctx.lineTo(size * 0.5, size * 0.5);
        ctx.lineTo(-size * 0.5, size * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        // Arch / Semi-Circle
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.4, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    // 3. Draw fine geometric accent vector lines
    const lineCount = 4;
    ctx.strokeStyle = hexToRgba(colors.accent, 0.5);
    ctx.lineWidth = 1.5;
    for (let l = 0; l < lineCount; l++) {
      const startX = width * (0.1 + rng() * 0.8);
      const startY = height * (0.1 + rng() * 0.8);
      const endX = startX + (rng() - 0.5) * width * 0.4;
      const endY = startY + (rng() - 0.5) * height * 0.4;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Accent dot at end of line
      ctx.beginPath();
      ctx.arc(endX, endY, 4, 0, Math.PI * 2);
      ctx.fillStyle = colors.accent;
      ctx.fill();
    }

    ctx.restore();
  },
};
