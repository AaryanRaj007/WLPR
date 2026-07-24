import type { Pattern } from './types';
import { hexToRgba } from '../color';

export const geometric: Pattern = {
  id: 'geometric',
  label: 'Connected Squares',
  defaultParams: { layers: 4, roughness: 45 },
  paramLabels: { layers: 'Grid Size', roughness: 'Rotation' },

  draw(ctx, width, height, params, _rng, colors) {
    const gridDensity = Math.max(3, Math.min(12, Math.round(params.layers * 1.4)));
    const baseAngle = ((params.roughness / 100) * Math.PI) / 2; // 0 to 90 degrees

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, colors.background[0]);
    bg.addColorStop(1, colors.background[1]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Calculate square cell size so corners connect cleanly across the canvas
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
        // Position each cell center so corners touch
        const cx = startX + c * stepX;
        const cy = startY + r * stepY;

        ctx.save();
        ctx.translate(cx, cy);

        // Rotation based on position and user slider
        const distFromCenter = Math.hypot(cx - width / 2, cy - height / 2) / Math.max(width, height);
        const rotation = baseAngle + distFromCenter * 0.4;
        ctx.rotate(rotation);

        const colorIndex = (r + c) % colors.layers.length;
        const layerColor = colors.layers[colorIndex] || strokeColor;

        // Draw outer square
        ctx.strokeStyle = hexToRgba(layerColor, 0.75);
        ctx.lineWidth = (r + c) % 3 === 0 ? 2.5 : 1.2;
        ctx.strokeRect(-size * 0.45, -size * 0.45, size * 0.9, size * 0.9);

        // Fill subtle color in alternating squares
        if ((r + c) % 2 === 0) {
          ctx.fillStyle = hexToRgba(layerColor, 0.12);
          ctx.fillRect(-size * 0.45, -size * 0.45, size * 0.9, size * 0.9);
        }

        // Draw inner concentric connected square
        const innerSize = size * 0.55;
        ctx.strokeStyle = hexToRgba(accentColor, 0.6);
        ctx.lineWidth = 1.0;
        ctx.rotate(Math.PI / 4); // 45 degree offset for inner diamond touching outer corners
        ctx.strokeRect(-innerSize * 0.45, -innerSize * 0.45, innerSize * 0.9, innerSize * 0.9);

        // Draw tiny corner connection dot at vertices
        ctx.fillStyle = accentColor;
        const cornerOffset = size * 0.45;
        const corners = [
          [-cornerOffset, -cornerOffset],
          [cornerOffset, -cornerOffset],
          [cornerOffset, cornerOffset],
          [-cornerOffset, cornerOffset],
        ];

        for (const [kx, ky] of corners) {
          ctx.beginPath();
          ctx.arc(kx, ky, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    ctx.restore();
  },
};
