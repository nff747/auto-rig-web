import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { RiggingEngine } from '../src/core/RiggingEngine';
import { JointType } from '../src/types';

class MockWorker {
  onmessage: any;
  onerror: any;
  postMessage(data: any, transfers?: any) {
    if (data.type === 'INIT') {
      setTimeout(() => {
        if (this.onmessage) this.onmessage({ data: { type: 'INIT_DONE', msgId: data.msgId } });
      }, 10);
    } else if (data.type === 'RIG') {
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage({
            data: {
              type: 'RIG_DONE',
              msgId: data.msgId,
              payload: {
                rig: { 
                  joints: {
                    [JointType.Hips]: { type: JointType.Hips, position: { x: 0, y: 0, z: 0 }, confidence: 1 }
                  }, 
                  hierarchy: {
                    [JointType.Hips]: []
                  } 
                }
              }
            }
          });
        }
      }, 10);
    }
  }
}

describe('RiggingEngine', () => {
  beforeEach(() => {
    // @ts-ignore
    global.Worker = MockWorker;
  });

  it('should initialize and run autoRig', async () => {
    const engine = new RiggingEngine();
    await engine.init();

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([0, 0, 0, 1, 1, 1]);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());

    const skinnedMesh = await engine.autoRig(mesh);
    
    expect(skinnedMesh).toBeInstanceOf(THREE.SkinnedMesh);
    expect(skinnedMesh.geometry.getAttribute('skinIndex')).toBeDefined();
    expect(skinnedMesh.geometry.getAttribute('skinWeight')).toBeDefined();
    
    // Check that one bone was added
    expect(skinnedMesh.skeleton.bones.length).toBe(1);
    expect(skinnedMesh.skeleton.bones[0].name).toBe(JointType.Hips);
  });
});
