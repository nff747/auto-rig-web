import { Vec3 } from './Vec3';
export function pointToSegmentDistance(p: Vec3, v: Vec3, w: Vec3): number {
    const l2 = v.distanceTo(w) ** 2;
    if (l2 === 0) return p.distanceTo(v);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y) + (p.z - v.z) * (w.z - v.z)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projection = new Vec3(v.x + t * (w.x - v.x), v.y + t * (w.y - v.y), v.z + t * (w.z - v.z));
    return p.distanceTo(projection);
}
