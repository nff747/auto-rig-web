import * as THREE from 'three';
import { SkeletonRig, JointType } from '../types';

export class MeshAnalyzer {
  public bindSkeletonWithWeights(mesh: THREE.Mesh, rig: SkeletonRig, skinIndicesArr: Uint16Array, skinWeightsArr: Float32Array): THREE.SkinnedMesh {
    const geometry = mesh.geometry.clone();
    const bones = this.createBones(rig);
    
    const skeleton = new THREE.Skeleton(bones);
    
    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndicesArr, 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeightsArr, 4));
    
    const skinnedMesh = new THREE.SkinnedMesh(geometry, mesh.material);
    skinnedMesh.add(skeleton.bones[0]); 
    skinnedMesh.bind(skeleton);
    
    return skinnedMesh;
  }

  private createBones(rig: SkeletonRig): THREE.Bone[] {
    const boneMap = new Map<JointType, THREE.Bone>();
    const rootBones: THREE.Bone[] = [];

    for (const [type, joint] of Object.entries(rig.joints)) {
      const bone = new THREE.Bone();
      bone.name = type;
      boneMap.set(type as JointType, bone);
    }

    for (const [parentType, children] of Object.entries(rig.hierarchy)) {
      const parentBone = boneMap.get(parentType as JointType)!;
      const parentJoint = rig.joints[parentType as JointType];

      if (parentType === JointType.Hips) {
        parentBone.position.set(parentJoint.position.x, parentJoint.position.y, parentJoint.position.z);
        rootBones.push(parentBone);
      }

      for (const childType of children) {
        const childBone = boneMap.get(childType)!;
        const childJoint = rig.joints[childType];
        
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
}
