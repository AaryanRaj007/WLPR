import type { Pattern } from './types';
import { ridgeline } from './ridgeline';
import { horizon } from './horizon';
import { flowfield } from './flowfield';
import { dunes } from './dunes';

export const patternList: Pattern[] = [ridgeline, horizon, flowfield, dunes];

export const patterns: Record<string, Pattern> = Object.fromEntries(patternList.map((p) => [p.id, p]));

export const defaultPatternId = ridgeline.id;
