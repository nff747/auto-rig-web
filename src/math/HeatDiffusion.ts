export class HeatDiffusion {
    static calculateWeights(distance: number, radius: number): number {
        if (distance > radius) return 0;
        return Math.pow(1 - (distance / radius), 2);
    }
}
