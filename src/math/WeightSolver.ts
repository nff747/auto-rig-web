import { Vertex } from './Vertex';
import { Bone } from './Bone';
import { pointToSegmentDistance } from './Distance';
import { HeatDiffusion } from './HeatDiffusion';

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
}
