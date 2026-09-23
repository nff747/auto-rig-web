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
