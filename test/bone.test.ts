import { describe, it, expect } from 'vitest';
import { Bone } from '../src/math/Bone';
import { Vec3 } from '../src/math/Vec3';

describe('Bone entity & hierarchy', () => {
    it('computes bone length and normalized direction vector', () => {
        const head = new Vec3(0, 0, 0);
        const tail = new Vec3(0, 10, 0);
        const bone = new Bone('Spine', head, tail);

        expect(bone.length()).toBe(10);
        expect(bone.getDirection()).toEqual(new Vec3(0, 1, 0));
        expect(bone.isRoot()).toBe(true);
        expect(bone.isLeaf()).toBe(true);
    });

    it('builds parent-child skeletal hierarchy correctly', () => {
        const root = new Bone('Root', new Vec3(0, 0, 0), new Vec3(0, 5, 0));
        const chest = new Bone('Chest', new Vec3(0, 5, 0), new Vec3(0, 10, 0));
        const head = new Bone('Head', new Vec3(0, 10, 0), new Vec3(0, 12, 0));

        root.addChild(chest);
        chest.addChild(head);

        expect(root.isRoot()).toBe(true);
        expect(root.isLeaf()).toBe(false);
        expect(chest.isRoot()).toBe(false);
        expect(chest.isLeaf()).toBe(false);
        expect(head.isRoot()).toBe(false);
        expect(head.isLeaf()).toBe(true);

        const descendants = root.getDescendants();
        expect(descendants.length).toBe(2);
        expect(descendants.map(b => b.name)).toEqual(['Chest', 'Head']);
    });

    it('safely removes child bone from parent hierarchy', () => {
        const root = new Bone('Root', new Vec3(0, 0, 0), new Vec3(0, 5, 0));
        const limb = new Bone('Limb', new Vec3(0, 5, 0), new Vec3(5, 5, 0));

        root.addChild(limb);
        expect(root.children.length).toBe(1);

        root.removeChild(limb);
        expect(root.children.length).toBe(0);
        expect(limb.parent).toBeNull();
        expect(limb.isRoot()).toBe(true);
    });
});
