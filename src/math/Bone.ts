import { Vec3 } from './Vec3';

export class Bone {
    public parent: Bone | null = null;
    public children: Bone[] = [];

    constructor(
        public name: string,
        public head: Vec3,
        public tail: Vec3
    ) {}

    length(): number {
        return this.head.distanceTo(this.tail);
    }

    getDirection(): Vec3 {
        return this.tail.sub(this.head).normalize();
    }

    addChild(child: Bone): void {
        if (child.parent) {
            child.parent.removeChild(child);
        }
        child.parent = this;
        this.children.push(child);
    }

    removeChild(child: Bone): void {
        const idx = this.children.indexOf(child);
        if (idx !== -1) {
            this.children.splice(idx, 1);
            child.parent = null;
        }
    }

    isRoot(): boolean {
        return this.parent === null;
    }

    isLeaf(): boolean {
        return this.children.length === 0;
    }

    getDescendants(): Bone[] {
        const list: Bone[] = [];
        const queue: Bone[] = [...this.children];
        while (queue.length > 0) {
            const curr = queue.shift()!;
            list.push(curr);
            for (const c of curr.children) {
                queue.push(c);
            }
        }
        return list;
    }
}
