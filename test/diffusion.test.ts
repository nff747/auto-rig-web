import { describe, it, expect } from 'vitest';
import { HeatDiffusion } from '../src/math/HeatDiffusion';

describe('HeatDiffusion', () => {
    it('calculates weight correctly', () => {
        expect(HeatDiffusion.calculateWeights(0, 1)).toBe(1);
        expect(HeatDiffusion.calculateWeights(1, 1)).toBe(0);
        expect(HeatDiffusion.calculateWeights(0.5, 1)).toBe(0.25);
    });
});
