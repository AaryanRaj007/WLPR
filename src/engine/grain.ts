import type { RNG } from './prng';

const TILE_SIZE = 128;

type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

function createTile(size: number): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(size, size);
  }
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  return c;
}

export function applyGrain(ctx: Ctx2D, width: number, height: number, rng: RNG, opacity = 0.05): void {
  const tile = createTile(TILE_SIZE);
  const tileCtx = tile.getContext('2d') as Ctx2D | null;
  if (!tileCtx) return;

  const imgData = tileCtx.createImageData(TILE_SIZE, TILE_SIZE);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const v = Math.floor(rng() * 255);
    imgData.data[i] = v;
    imgData.data[i + 1] = v;
    imgData.data[i + 2] = v;
    imgData.data[i + 3] = 255;
  }
  tileCtx.putImageData(imgData, 0, 0);

  const pattern = ctx.createPattern(tile as CanvasImageSource, 'repeat');
  if (!pattern) return;

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = opacity;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}
