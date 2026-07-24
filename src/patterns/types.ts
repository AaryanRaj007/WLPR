import type { RNG } from '../engine/prng';
import type { PatternColors } from '../color';

export interface PatternParams {
  layers: number;
  roughness: number; // 0-100
}

export type PatternCtx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export interface Pattern {
  id: string;
  label: string;
  defaultParams: PatternParams;
  paramLabels: { layers: string; roughness: string };
  draw(
    ctx: PatternCtx,
    width: number,
    height: number,
    params: PatternParams,
    rng: RNG,
    colors: PatternColors,
  ): void;
}
