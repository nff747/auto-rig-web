import { describe, it, expect } from 'vitest';
import { Rig } from '../src/core/Rig';
import { Bone } from '../src/math/Bone';
import { Vec3 } from '../src/math/Vec3';

describe('Rig skeletal structure', () => {
    it('manages bones and identifies root nodes', () => {
        const rig = new Rig();
        const root = new Bone('Hips', new Vec3(0, 5, 0), new Vec3(0, 6, 0));
        const spine = new Bone('Spine', new Vec3(0, 6, 0), new Vec3(0, 8, 0));
        root.addChild(spine);

        rig.addBone(root);
        rig.addBone(spine);

        expect(rig.getBoneCount()).toBe(2);
        expect(rig.findBone('Hips')).toBe(root);
        expect(rig.findBone('Unknown')).toBeUndefined();
        expect(rig.getRootBones()).toEqual([root]);
    });

    it('validates healthy skeletal hierarchy', () => {
        const rig = new Rig();
        const root = new Bone('Root', new Vec3(0, 0, 0), new Vec3(0, 5, 0));
        const child = new Bone('Child', new Vec3(0, 5, 0), new Vec3(0, 10, 0));
        root.addChild(child);

        rig.addBone(root);
        rig.addBone(child);

        const status = rig.validateHierarchy();
        expect(status.isValid).toBe(true);
        expect(status.errors).toEqual([]);
    });

    it('catches duplicate bone names and zero length bones', () => {
        const rig = new Rig();
        const b1 = new Bone('Arm', new Vec3(0, 0, 0), new Vec3(0, 0, 0)); // zero length
        const b2 = new Bone('Arm', new Vec3(1, 0, 0), new Vec3(2, 0, 0)); // duplicate name

        rig.addBone(b1);
        rig.addBone(b2);

        const status = rig.validateHierarchy();
        expect(status.isValid).toBe(false);
        expect(status.errors.some(e => e.includes('Duplicate bone name'))).toBe(true);
        expect(status.errors.some(e => e.includes('Zero-length'))).toBe(true);
    });

    it('detects cyclic skeletal hierarchies', () => {
        const rig = new Rig();
        const a = new Bone('BoneA', new Vec3(0, 0, 0), new Vec3(0, 1, 0));
        const b = new Bone('BoneB', new Vec3(0, 1, 0), new Vec3(0, 2, 0));

        // Create cycle directly
        a.parent = b;
        b.parent = a;

        rig.addBone(a);
        rig.addBone(b);

        const status = rig.validateHierarchy();
        expect(status.isValid).toBe(false);
        expect(status.errors.some(e => e.includes('Cyclic skeletal dependency'))).toBe(true);
    });
});
