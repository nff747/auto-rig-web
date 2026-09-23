export class Vec3 {
    constructor(public x: number, public y: number, public z: number) {}
    distanceTo(other: Vec3): number {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dz = this.z - other.z;
        return Math.sqrt(dx*dx + dy*dy + dz*dz);
    }
}
