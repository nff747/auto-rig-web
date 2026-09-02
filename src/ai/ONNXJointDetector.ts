/**
 * ═══════════════════════════════════════════════════════════════════
 * Auto-Rig Web — ONNX Joint Detector
 *
 * Wraps onnxruntime-web to process static 3D meshes.
 * Voxelizes the input geometry into a 3D tensor and runs inference
 * to predict 3D joint coordinates (keypoints) in local space.
 * ═══════════════════════════════════════════════════════════════════
 */

import * as ort from 'onnxruntime-web';
import * as THREE from 'three';
import { Joint, JointType, SkeletonRig } from '../types';

export class ONNXJointDetector {
  private session: ort.InferenceSession | null = null;
  
  /**
   * Initializes the ONNX Runtime Web session.
   * Uses WebGL or WebGPU execution providers for acceleration.
   */
  async init(modelPath: string): Promise<void> {
    try {
      ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';
      
      this.session = await ort.InferenceSession.create(modelPath, {
        executionProviders: ['webgpu', 'webgl', 'wasm']
      });
      console.log(`[AutoRig] ONNX Model loaded. Backend: ${this.session.handler?.executionProvider}`);
    } catch (err) {
      throw new Error(`[AutoRig] Failed to load ONNX model: ${err}`);
    }
  }

  /**
   * Predicts joint locations from a Three.js BufferGeometry.
   */
  async detectJoints(geometry: THREE.BufferGeometry): Promise<SkeletonRig> {
    if (!this.session) throw new Error('[AutoRig] Model not initialized.');

    // 1. Voxelize/Downsample mesh into a 64x64x64 occupancy grid tensor
    const tensor = this.meshToTensor(geometry, 64);
    
    // 2. Run inference
    const feeds: Record<string, ort.Tensor> = { input_tensor: tensor };
    const results = await this.session.run(feeds);
    
    // 3. Extract coordinates from output tensor (shape: [1, NUM_JOINTS, 3])
    const keypoints = results.output_keypoints.data as Float32Array;
    const confidences = results.output_confidences.data as Float32Array;

    return this.constructSkeleton(keypoints, confidences);
  }

  /**
   * Converts a generic Float32Array of keypoints into the SkeletonRig hierarchy.
   */
  private constructSkeleton(keypoints: Float32Array, confidences: Float32Array): SkeletonRig {
    const joints = {} as Record<JointType, Joint>;
    const types = Object.values(JointType);
    
    for (let i = 0; i < types.length; i++) {
      joints[types[i]] = {
        type: types[i],
        position: {
          x: keypoints[i * 3 + 0],
          y: keypoints[i * 3 + 1],
          z: keypoints[i * 3 + 2]
        },
        confidence: confidences[i]
      };
    }

    // Standard Biped Hierarchy
    const hierarchy: Record<JointType, JointType[]> = {
      [JointType.Hips]: [JointType.Spine, JointType.LeftUpLeg, JointType.RightUpLeg],
      [JointType.Spine]: [JointType.Chest],
      [JointType.Chest]: [JointType.Neck, JointType.LeftShoulder, JointType.RightShoulder],
      [JointType.Neck]: [JointType.Head],
      [JointType.Head]: [],
      [JointType.LeftShoulder]: [JointType.LeftArm],
      [JointType.LeftArm]: [JointType.LeftForeArm],
      [JointType.LeftForeArm]: [JointType.LeftHand],
      [JointType.LeftHand]: [],
      [JointType.RightShoulder]: [JointType.RightArm],
      [JointType.RightArm]: [JointType.RightForeArm],
      [JointType.RightForeArm]: [JointType.RightHand],
      [JointType.RightHand]: [],
      [JointType.LeftUpLeg]: [JointType.LeftLeg],
      [JointType.LeftLeg]: [JointType.LeftFoot],
      [JointType.LeftFoot]: [],
      [JointType.RightUpLeg]: [JointType.RightLeg],
      [JointType.RightLeg]: [JointType.RightFoot],
      [JointType.RightFoot]: []
    };

    return { joints, hierarchy };
  }

  /**
   * Creates a 3D occupancy grid from mesh vertices.
   * Note: In a production scenario, this involves bounding box normalization 
   * and spatial hashing. Simplified here for architectural scaffolding.
   */
  private meshToTensor(geometry: THREE.BufferGeometry, resolution: number): ort.Tensor {
    const positions = geometry.attributes.position.array;
    // ... Voxelization logic ...
    const grid = new Float32Array(1 * 1 * resolution * resolution * resolution);
    return new ort.Tensor('float32', grid, [1, 1, resolution, resolution, resolution]);
  }
}
