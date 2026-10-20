import { Vertex } from './Vertex';
import { Bone } from './Bone';
import { pointToSegmentDistance } from './Distance';
import { HeatDiffusion } from './HeatDiffusion';

export interface BoundedSkinInfluence {
    indices: number[];
    weights: number[];
}

export class WeightSolver {
    static solve(vertices: Vertex[], bones: Bone[], radius: number = 1.0): Map<number, number[]> {
        const weights = new Map<number, number[]>();
        for (const v of vertices) {
            const vWeights: number[] = [];
            let sum = 0;
            for (const b of bones) {
                const dist = pointToSegmentDistance(v.position, b.head, b.tail);
                const w = HeatDiffusion.calculateWeights(dist, radius);
                vWeights.push(w);
                sum += w;
            }
            // Normalize
            if (sum > 0) {
                for (let i = 0; i < vWeights.length; i++) {
                    vWeights[i] /= sum;
                }
            }
            weights.set(v.id, vWeights);
        }
        return weights;
    }

    /**
     * Solves skinning weights clamped to a maximum number of influences (default 4 for GPU skinning shaders).
     * Renormalizes the top influences so their sum equals exactly 1.0.
     */
    static solveBounded(
        vertices: Vertex[],
        bones: Bone[],
        radius: number = 1.0,
        maxInfluences: number = 4
    ): Map<number, BoundedSkinInfluence> {
        const result = new Map<number, BoundedSkinInfluence>();

        for (const v of vertices) {
            const candidates: { index: number; weight: number }[] = [];

            for (let bIdx = 0; bIdx < bones.length; bIdx++) {
                const b = bones[bIdx];
                const dist = pointToSegmentDistance(v.position, b.head, b.tail);
                const w = HeatDiffusion.calculateWeights(dist, radius);
                candidates.push({ index: bIdx, weight: w });
            }

            // Sort descending by weight
            candidates.sort((a, b) => b.weight - a.weight);

            // Take top maxInfluences
            const top = candidates.slice(0, maxInfluences);
            const sum = top.reduce((acc, c) => acc + c.weight, 0);

            const indices: number[] = [];
            const weights: number[] = [];

            for (let i = 0; i < maxInfluences; i++) {
                if (i < top.length && sum > 0) {
                    indices.push(top[i].index);
                    weights.push(top[i].weight / sum);
                } else {
                    indices.push(0);
                    weights.push(0);
                }
            }

            result.set(v.id, { indices, weights });
        }

        return result;
    }
}
