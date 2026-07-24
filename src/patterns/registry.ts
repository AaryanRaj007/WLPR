import type { Pattern } from './types';
import { ridgeline } from './ridgeline';
import { horizon } from './horizon';
import { flowfield } from './flowfield';
import { dunes } from './dunes';
import { lineart } from './lineart';
import { geometric } from './geometric';
import { waves } from './waves';

export const patternList: Pattern[] = [waves, geometric, lineart, ridgeline, horizon, flowfield, dunes];

export const patterns: Record<string, Pattern> = Object.fromEntries(patternList.map((p) => [p.id, p]));

export const defaultPatternId = ridgeline.id;
