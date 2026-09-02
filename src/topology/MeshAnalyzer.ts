/**
 * ═══════════════════════════════════════════════════════════════════
 * Auto-Rig Web — Mesh Analyzer & Procedural Skinning
 *
 * Binds a standard THREE.Mesh to a detected SkeletonRig.
 * Calculates skin indices and skin weights per vertex using a 
 * procedural heat-diffusion approximation (Geodesic/Euclidean falloff).
 * ═══════════════════════════════════════════════════════════════════
 */

import * as THREE from 'three';
import { SkeletonRig, JointType } from '../types';

export class MeshAnalyzer {
  
  /**
   * Converts a static Mesh into a SkinnedMesh, applying procedural bone weights.
   */
  public bindSkeleton(mesh: THREE.Mesh, rig: SkeletonRig, falloff: number = 2.0): THREE.SkinnedMesh {
    const geometry = mesh.geometry.clone();
    const bones = this.createBones(rig);
    
    // Create Skeleton
    const skeleton = new THREE.Skeleton(bones);
    
    // Calculate weights
    this.calculateBoneWeights(geometry, skeleton, falloff);
    
    // Upgrade Mesh to SkinnedMesh
    const skinnedMesh = new THREE.SkinnedMesh(geometry, mesh.material);
    skinnedMesh.add(skeleton.bones[0]); // Add root bone to mesh hierarchy
    skinnedMesh.bind(skeleton);
    
    return skinnedMesh;
  }

  /**
   * Constructs the THREE.Bone hierarchy from the abstract SkeletonRig.
   */
  private createBones(rig: SkeletonRig): THREE.Bone[] {
    const boneMap = new Map<JointType, THREE.Bone>();
    const rootBones: THREE.Bone[] = [];

    // Instantiate bones
    for (const [type, joint] of Object.entries(rig.joints)) {
      const bone = new THREE.Bone();
      bone.name = type;
      // Position is absolute in prediction, need to convert to relative for Three.js hierarchy
      boneMap.set(type as JointType, bone);
    }

    // Build Hierarchy & compute relative translations
    for (const [parentType, children] of Object.entries(rig.hierarchy)) {
      const parentBone = boneMap.get(parentType as JointType)!;
      const parentJoint = rig.joints[parentType as JointType];

      // If root
      if (parentType === JointType.Hips) {
        parentBone.position.set(parentJoint.position.x, parentJoint.position.y, parentJoint.position.z);
        rootBones.push(parentBone);
      }

      for (const childType of children) {
        const childBone = boneMap.get(childType)!;
        const childJoint = rig.joints[childType];
        
        // Compute relative position
        childBone.position.set(
          childJoint.position.x - parentJoint.position.x,
          childJoint.position.y - parentJoint.position.y,
          childJoint.position.z - parentJoint.position.z
        );
        
        parentBone.add(childBone);
      }
    }

    return Array.from(boneMap.values());
  }

  /**
   * Applies skinIndices and skinWeights to the geometry.
   * Limits to 4 bones per vertex (WebGL standard).
   */
  private calculateBoneWeights(geometry: THREE.BufferGeometry, skeleton: THREE.Skeleton, falloff: number): void {
    const positions = geometry.attributes.position;
    const vertexCount = positions.count;
    
    const skinIndices = [];
    const skinWeights = [];
    
    const vertex = new THREE.Vector3();
    const bonePos = new THREE.Vector3();
    
    for (let i = 0; i < vertexCount; i++) {
      vertex.fromBufferAttribute(positions, i);
      
      // Calculate distance to all bones
      const distances: { index: number, weight: number }[] = [];
      
      for (let b = 0; b < skeleton.bones.length; b++) {
        const bone = skeleton.bones[b];
        // Get absolute bone position
        bone.getWorldPosition(bonePos); 
        
        const dist = vertex.distanceTo(bonePos);
        // Inverse distance weighting with exponential falloff
        const weight = 1.0 / Math.pow(dist + 0.001, falloff);
        
        distances.push({ index: b, weight });
      }
      
      // Sort by weight descending, take top 4
      distances.sort((a, b) => b.weight - a.weight);
      const top4 = distances.slice(0, 4);
      
      // Normalize top 4 weights
      const totalWeight = top4.reduce((sum, d) => sum + d.weight, 0);
      
      skinIndices.push(
        top4[0]?.index ?? 0,
        top4[1]?.index ?? 0,
        top4[2]?.index ?? 0,
        top4[3]?.index ?? 0
      );
      
      skinWeights.push(
        (top4[0]?.weight ?? 0) / totalWeight,
        (top4[1]?.weight ?? 0) / totalWeight,
        (top4[2]?.weight ?? 0) / totalWeight,
        (top4[3]?.weight ?? 0) / totalWeight
      );
    }
    
    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
  }
}
