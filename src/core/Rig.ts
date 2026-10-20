import { Bone } from '../math/Bone';

export class Rig {
    constructor(public bones: Bone[] = []) {}

    addBone(bone: Bone): void {
        this.bones.push(bone);
    }

    findBone(name: string): Bone | undefined {
        return this.bones.find(b => b.name === name);
    }

    getRootBones(): Bone[] {
        return this.bones.filter(b => b.isRoot());
    }

    getBoneCount(): number {
        return this.bones.length;
    }

    validateHierarchy(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        const names = new Set<string>();

        for (const b of this.bones) {
            if (names.has(b.name)) {
                errors.push(`Duplicate bone name detected: "${b.name}"`);
            }
            names.add(b.name);

            if (b.length() <= 0) {
                errors.push(`Zero-length degenerate bone: "${b.name}"`);
            }

            // Cycle check
            let curr = b.parent;
            const visited = new Set<Bone>([b]);
            while (curr) {
                if (visited.has(curr)) {
                    errors.push(`Cyclic skeletal dependency detected involving bone "${b.name}"`);
                    break;
                }
                visited.add(curr);
                curr = curr.parent;
            }
        }

        if (this.bones.length > 0 && this.getRootBones().length === 0) {
            errors.push('No root bone found in non-empty skeletal rig (all bones have parents)');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
