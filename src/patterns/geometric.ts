import type { Pattern } from './types';
import { hexToRgba } from '../color';

export const geometric: Pattern = {
  id: 'geometric',
  label: 'Connected Squares',
  defaultParams: { layers: 4, roughness: 45 },
  paramLabels: { layers: 'Grid Size', roughness: 'Rotation' },

  draw(ctx, width, height, params, _rng, colors) {
    const gridDensity = Math.max(3, Math.min(14, Math.round(params.layers * 1.5)));
    const rotationAngle = ((params.roughness / 100) * Math.PI) / 2; // 0 to 90 degrees rotation

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, colors.background[0]);
    bg.addColorStop(1, colors.background[1]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Calculate square size and grid spacing for exact corner-to-corner alignment
    const size = Math.max(width, height) / gridDensity;
    const stepX = size;
    const stepY = size;

    const cols = Math.ceil(width / stepX) + 4;
    const rows = Math.ceil(height / stepY) + 4;
    const startX = -size * 2;
    const startY = -size * 2;

    const strokeColor = colors.mode === 'dark' ? '#ffffff' : '#0f172a';
    const accentColor = colors.accent;

    ctx.save();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Center position for each square
        const cx = startX + c * stepX;
        const cy = startY + r * stepY;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotationAngle);

        const colorIndex = (r + c) % colors.layers.length;
        const layerColor = colors.layers[colorIndex] || strokeColor;

        // Draw ONLY one clean single layer square
        ctx.strokeStyle = hexToRgba(layerColor, 0.7);
        ctx.lineWidth = (r + c) % 2 === 0 ? 2.0 : 1.2;
        ctx.strokeRect(-size * 0.48, -size * 0.48, size * 0.96, size * 0.96);

        // Optional subtle tint fill for alternating squares
        if ((r + c) % 3 === 0) {
          ctx.fillStyle = hexToRgba(accentColor, 0.12);
          ctx.fillRect(-size * 0.48, -size * 0.48, size * 0.96, size * 0.96);
        }

        ctx.restore();
      }
    }

    ctx.restore();
  },
};
