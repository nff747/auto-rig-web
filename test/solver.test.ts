import { describe, it, expect } from 'vitest';
import { WeightSolver } from '../src/math/WeightSolver';
import { Vertex } from '../src/math/Vertex';
import { Bone } from '../src/math/Bone';
import { Vec3 } from '../src/math/Vec3';

describe('WeightSolver', () => {
    it('solves weights', () => {
        const v = new Vertex(new Vec3(0, 0, 0), 0);
        const b = new Bone('root', new Vec3(0, 0, 0), new Vec3(0, 1, 0));
        const weights = WeightSolver.solve([v], [b]);
        expect(weights.get(0)?.[0]).toBe(1);
    });
});

    it('solves bounded weights clamped to max 4 influences and normalized to 1.0', () => {
        const v = new Vertex(new Vec3(0, 0, 0), 10);
        // Create 6 bones at varying distances
        const bones = [
            new Bone('b0', new Vec3(0, 0.1, 0), new Vec3(0, 0.2, 0)),
            new Bone('b1', new Vec3(0, 0.2, 0), new Vec3(0, 0.3, 0)),
            new Bone('b2', new Vec3(0, 0.3, 0), new Vec3(0, 0.4, 0)),
            new Bone('b3', new Vec3(0, 0.4, 0), new Vec3(0, 0.5, 0)),
            new Bone('b4', new Vec3(0, 2.0, 0), new Vec3(0, 2.1, 0)),
            new Bone('b5', new Vec3(0, 5.0, 0), new Vec3(0, 5.1, 0))
        ];

        const bounded = WeightSolver.solveBounded([v], bones, 2.0, 4);
        const influence = bounded.get(10);
        expect(influence).toBeDefined();
        expect(influence!.indices.length).toBe(4);
        expect(influence!.weights.length).toBe(4);

        // Sum of top 4 weights must be 1.0
        const totalWeight = influence!.weights.reduce((a, b) => a + b, 0);
        expect(totalWeight).toBeCloseTo(1.0);

        // Indices should prioritize closest bones (b0, b1, b2, b3)
        expect(influence!.indices[0]).toBe(0);
        expect(influence!.weights[0]).toBeGreaterThan(influence!.weights[1]);
    });
