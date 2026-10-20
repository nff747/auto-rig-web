import { Vec3 } from './Vec3';
import { Vertex } from './Vertex';

export class BoundingBox {
    constructor(
        public min: Vec3 = new Vec3(Infinity, Infinity, Infinity),
        public max: Vec3 = new Vec3(-Infinity, -Infinity, -Infinity)
    ) {}

    static fromVertices(vertices: Vertex[]): BoundingBox {
        const box = new BoundingBox();
        for (const v of vertices) {
            box.expandByPoint(v.position);
        }
        return box;
    }

    static fromPoints(points: Vec3[]): BoundingBox {
        const box = new BoundingBox();
        for (const p of points) {
            box.expandByPoint(p);
        }
        return box;
    }

    expandByPoint(p: Vec3): void {
        this.min.x = Math.min(this.min.x, p.x);
        this.min.y = Math.min(this.min.y, p.y);
        this.min.z = Math.min(this.min.z, p.z);

        this.max.x = Math.max(this.max.x, p.x);
        this.max.y = Math.max(this.max.y, p.y);
        this.max.z = Math.max(this.max.z, p.z);
    }

    getCenter(): Vec3 {
        return new Vec3(
            (this.min.x + this.max.x) * 0.5,
            (this.min.y + this.max.y) * 0.5,
            (this.min.z + this.max.z) * 0.5
        );
    }

    getSize(): Vec3 {
        return new Vec3(
            Math.max(0, this.max.x - this.min.x),
            Math.max(0, this.max.y - this.min.y),
            Math.max(0, this.max.z - this.min.z)
        );
    }

    containsPoint(p: Vec3): boolean {
        return (
            p.x >= this.min.x && p.x <= this.max.x &&
            p.y >= this.min.y && p.y <= this.max.y &&
            p.z >= this.min.z && p.z <= this.max.z
        );
    }
}
