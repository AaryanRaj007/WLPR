import type { Pattern } from './types';
import { hexToRgba } from '../color';

export const constellation: Pattern = {
  id: 'constellation',
  label: 'Constellation Mesh',
  defaultParams: { layers: 5, roughness: 45 },
  paramLabels: { layers: 'Star Count', roughness: 'Reach' },

  draw(ctx, width, height, params, rng, colors) {
    const starCount = Math.max(20, Math.min(100, Math.round(params.layers * 10)));
    const reachDistance = (width * 0.12) * (0.5 + (params.roughness / 100) * 1.2);

    // Deep space gradient
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, colors.background[0]);
    bg.addColorStop(1, colors.background[1]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Generate random dot nodes
    const dots: Array<{ x: number; y: number; size: number }> = [];
    for (let i = 0; i < starCount; i++) {
      dots.push({
        x: rng() * width,
        y: rng() * height,
        size: 1.5 + rng() * 2.0,
      });
    }

    const mainStroke = colors.mode === 'dark' ? '#ffffff' : '#0f172a';
    const accentStroke = colors.accent;

    // 1. Draw connecting vector lines between close dot nodes
    for (let i = 0; i < starCount; i++) {
      for (let j = i + 1; j < starCount; j++) {
        const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
        if (dist < reachDistance) {
          const alpha = (1 - dist / reachDistance) * 0.45;
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = (i + j) % 4 === 0 ? hexToRgba(accentStroke, alpha * 1.2) : hexToRgba(mainStroke, alpha);
          ctx.lineWidth = (i + j) % 5 === 0 ? 1.5 : 0.9;
          ctx.stroke();
        }
      }
    }

    // 2. Draw clean vector dots at node positions
    for (let i = 0; i < starCount; i++) {
      const dot = dots[i];
      const isAccent = i % 5 === 0;

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
      ctx.fillStyle = isAccent ? accentStroke : mainStroke;
      ctx.fill();
    }
  },
};
