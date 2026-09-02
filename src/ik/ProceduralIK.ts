/**
 * ═══════════════════════════════════════════════════════════════════
 * Auto-Rig Web — Procedural IK Solver
 *
 * Implements Inverse Kinematics chains (using CCDIK approximation)
 * for dynamic posing of the procedurally generated SkinnedMesh.
 * ═══════════════════════════════════════════════════════════════════
 */

import * as THREE from 'three';
import { IKTarget } from '../types';

export class ProceduralIK {
  private targets: Map<string, IKTarget> = new Map();
  private maxIterations: number;

  constructor(maxIterations: number = 15) {
    this.maxIterations = maxIterations;
  }

  /**
   * Adds an IK target effector.
   */
  public addTarget(target: IKTarget): void {
    this.targets.set(target.joint, target);
  }

  /**
   * Updates the skeleton hierarchy to satisfy IK constraints.
   * Implementation of Cyclic Coordinate Descent (CCDIK).
   */
  public solve(skeleton: THREE.Skeleton): void {
    if (this.targets.size === 0) return;

    for (const [jointName, target] of this.targets.entries()) {
      const effectorBone = skeleton.bones.find(b => b.name === jointName);
      if (!effectorBone) continue;

      this.solveChain(effectorBone, target.position, target.influence);
    }
  }

  /**
   * Resolves a single IK chain moving backwards from the effector to the root.
   */
  private solveChain(effector: THREE.Bone, targetPos: THREE.Vector3, influence: number): void {
    let currentBone: THREE.Bone | null = effector;
    
    // Build chain up to root or chain max length
    const chain: THREE.Bone[] = [];
    while (currentBone && currentBone.parent instanceof THREE.Bone) {
      chain.push(currentBone);
      currentBone = currentBone.parent;
    }

    const effectorWorld = new THREE.Vector3();
    const boneWorld = new THREE.Vector3();
    const q1 = new THREE.Quaternion();
    const q2 = new THREE.Quaternion();

    for (let iter = 0; iter < this.maxIterations; iter++) {
      for (let i = 1; i < chain.length; i++) {
        const bone = chain[i];
        
        bone.getWorldPosition(boneWorld);
        effector.getWorldPosition(effectorWorld);

        // Vector from bone to effector
        const vToEffector = effectorWorld.clone().sub(boneWorld).normalize();
        // Vector from bone to target
        const vToTarget = targetPos.clone().sub(boneWorld).normalize();

        // Calculate rotation required
        q1.setFromUnitVectors(vToEffector, vToTarget);
        
        // Apply influence
        q2.slerp(q1, influence);
        
        // Apply rotation in world space, convert back to local space
        const worldQuat = bone.getWorldQuaternion(new THREE.Quaternion());
        worldQuat.premultiply(q2);
        
        const parentWorldQuat = bone.parent!.getWorldQuaternion(new THREE.Quaternion());
        bone.quaternion.copy(parentWorldQuat.invert().multiply(worldQuat));
        bone.updateMatrixWorld(true);
      }
    }
  }
}
