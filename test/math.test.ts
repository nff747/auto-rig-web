import { describe, it, expect } from 'vitest';
import { Vec3 } from '../src/math/Vec3';
import { pointToSegmentDistance } from '../src/math/Distance';

describe('Distance', () => {
    it('calculates point to segment distance', () => {
        const p = new Vec3(0, 1, 0);
        const v = new Vec3(-1, 0, 0);
        const w = new Vec3(1, 0, 0);
        expect(pointToSegmentDistance(p, v, w)).toBe(1);
    });
});
