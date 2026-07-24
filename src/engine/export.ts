import type { PatternParams } from '../patterns/types';
import type { PatternColors } from '../color';

export interface ExportOptions {
  patternId: string;
  seed: string;
  params: PatternParams;
  colors: PatternColors;
  grain: boolean;
  width: number;
  height: number;
}

export function exportPng(opts: ExportOptions): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./exportWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<{ blob?: Blob; error?: string }>) => {
      worker.terminate();
      if (e.data.error || !e.data.blob) {
        reject(new Error(e.data.error ?? 'Export failed'));
      } else {
        resolve(e.data.blob);
      }
    };
    worker.onerror = (err) => {
      worker.terminate();
      reject(err);
    };
    worker.postMessage(opts);
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
