import { patterns } from '../patterns/registry';
import { rngFromSeed } from './prng';
import { applyGrain } from './grain';
import type { PatternParams } from '../patterns/types';
import type { PatternColors } from '../color';

export interface ExportRequest {
  patternId: string;
  seed: string;
  params: PatternParams;
  colors: PatternColors;
  grain: boolean;
  width: number;
  height: number;
}

self.onmessage = (e: MessageEvent<ExportRequest>) => {
  const { patternId, seed, params, colors, grain, width, height } = e.data;
  const pattern = patterns[patternId];
  if (!pattern) {
    (self as unknown as Worker).postMessage({ error: `Unknown pattern: ${patternId}` });
    return;
  }

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    (self as unknown as Worker).postMessage({ error: 'Could not create 2D context' });
    return;
  }

  const rng = rngFromSeed(seed);
  pattern.draw(ctx, width, height, params, rng, colors);
  if (grain) {
    applyGrain(ctx, width, height, rng);
  }

  canvas.convertToBlob({ type: 'image/png' }).then((blob) => {
    (self as unknown as Worker).postMessage({ blob });
  });
};
