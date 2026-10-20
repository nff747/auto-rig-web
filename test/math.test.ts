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

describe('Vec3 vector operations', () => {
    it('performs addition, subtraction, and scalar multiplication', () => {
        const a = new Vec3(1, 2, 3);
        const b = new Vec3(4, 5, 6);

        expect(a.add(b)).toEqual(new Vec3(5, 7, 9));
        expect(b.sub(a)).toEqual(new Vec3(3, 3, 3));
        expect(a.multiplyScalar(2)).toEqual(new Vec3(2, 4, 6));
    });

    it('computes dot product and vector length accurately', () => {
        const a = new Vec3(1, 0, 0);
        const b = new Vec3(0, 1, 0);
        expect(a.dot(b)).toBe(0); // Orthogonal
        expect(a.dot(a)).toBe(1);

        const v = new Vec3(3, 4, 0);
        expect(v.length()).toBe(5);
    });

    it('normalizes vector to unit length', () => {
        const v = new Vec3(0, 10, 0);
        const normalized = v.normalize();
        expect(normalized.x).toBe(0);
        expect(normalized.y).toBe(1);
        expect(normalized.z).toBe(0);
        expect(normalized.length()).toBeCloseTo(1.0);

        const zero = new Vec3(0, 0, 0);
        expect(zero.normalize()).toEqual(new Vec3(0, 0, 0));
    });

    it('computes cross product accurately', () => {
        const x = new Vec3(1, 0, 0);
        const y = new Vec3(0, 1, 0);
        const z = x.cross(y);
        expect(z).toEqual(new Vec3(0, 0, 1));
    });

    it('interpolates between vectors using lerp', () => {
        const start = new Vec3(0, 0, 0);
        const end = new Vec3(10, 20, 30);
        const mid = start.lerp(end, 0.5);
        expect(mid).toEqual(new Vec3(5, 10, 15));
    });
});
