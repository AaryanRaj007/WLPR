import { rngFromSeed } from './prng';
import { applyGrain } from './grain';
import type { Pattern, PatternParams } from '../patterns/types';
import type { PatternColors } from '../color';

export function renderToCanvas(
  canvas: HTMLCanvasElement,
  pattern: Pattern,
  seed: string,
  params: PatternParams,
  colors: PatternColors,
  grain: boolean,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = canvas;
  const rng = rngFromSeed(seed);
  pattern.draw(ctx, width, height, params, rng, colors);
  if (grain) {
    applyGrain(ctx, width, height, rng);
  }
}
