export enum JointType {
  Hips = 'Hips',
  Spine = 'Spine',
  Chest = 'Chest',
  Neck = 'Neck',
  Head = 'Head',
  LeftShoulder = 'LeftShoulder',
  LeftArm = 'LeftArm',
  LeftForeArm = 'LeftForeArm',
  LeftHand = 'LeftHand',
  RightShoulder = 'RightShoulder',
  RightArm = 'RightArm',
  RightForeArm = 'RightForeArm',
  RightHand = 'RightHand',
  LeftUpLeg = 'LeftUpLeg',
  LeftLeg = 'LeftLeg',
  LeftFoot = 'LeftFoot',
  RightUpLeg = 'RightUpLeg',
  RightLeg = 'RightLeg',
  RightFoot = 'RightFoot'
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Joint {
  type: JointType;
  position: Vector3D;
  confidence: number;
}

export interface SkeletonRig {
  joints: Record<JointType, Joint>;
  hierarchy: Record<JointType, JointType[]>;
}

export interface RiggingOptions {
  /** Path to the .onnx model file */
  modelPath?: string;
  /** Voxel resolution for point cloud downsampling */
  voxelResolution?: number;
  /** Maximum iterations for IK solver */
  ikIterations?: number;
  /** Falloff radius for procedural skin weights (biharmonic distance approx) */
  skinningFalloff?: number;
}

export interface IKTarget {
  joint: JointType;
  position: import('three').Vector3;
  influence: number;
}
