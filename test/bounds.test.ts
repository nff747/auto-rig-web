import { describe, it, expect } from 'vitest';
import { BoundingBox } from '../src/math/Bounds';
import { Vec3 } from '../src/math/Vec3';
import { Vertex } from '../src/math/Vertex';

describe('BoundingBox calculation', () => {
    it('computes tight bounding box from point cloud and vertices', () => {
        const vertices = [
            new Vertex(new Vec3(-2, 0, 1), 0),
            new Vertex(new Vec3(4, 10, -3), 1),
            new Vertex(new Vec3(1, -5, 2), 2)
        ];

        const bbox = BoundingBox.fromVertices(vertices);
        expect(bbox.min).toEqual(new Vec3(-2, -5, -3));
        expect(bbox.max).toEqual(new Vec3(4, 10, 2));

        const size = bbox.getSize();
        expect(size).toEqual(new Vec3(6, 15, 5));

        const center = bbox.getCenter();
        expect(center).toEqual(new Vec3(1, 2.5, -0.5));
    });

    it('tests point containment inside bounding box', () => {
        const bbox = BoundingBox.fromPoints([
            new Vec3(0, 0, 0),
            new Vec3(10, 10, 10)
        ]);

        expect(bbox.containsPoint(new Vec3(5, 5, 5))).toBe(true);
        expect(bbox.containsPoint(new Vec3(11, 5, 5))).toBe(false);
        expect(bbox.containsPoint(new Vec3(-1, 5, 5))).toBe(false);
    });
});
