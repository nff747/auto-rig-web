/**
 * ═══════════════════════════════════════════════════════════════════
 * Auto-Rig Web — Main Rigging Engine
 *
 * Orchestrates the full pipeline:
 * 1. Mesh Topology ingestion
 * 2. ONNX Inference for Joint Detection
 * 3. Procedural Skinning (Weights & Indices)
 * 4. Inverse Kinematics setup
 * ═══════════════════════════════════════════════════════════════════
 */

import * as THREE from 'three';
import { ONNXJointDetector } from '../ai/ONNXJointDetector';
import { MeshAnalyzer } from '../topology/MeshAnalyzer';
import { ProceduralIK } from '../ik/ProceduralIK';
import { RiggingOptions, IKTarget } from '../types';

export class RiggingEngine {
  private detector: ONNXJointDetector;
  private analyzer: MeshAnalyzer;
  private ikSolver: ProceduralIK;
  
  private isInitialized = false;

  constructor(private options: RiggingOptions = {}) {
    this.detector = new ONNXJointDetector();
    this.analyzer = new MeshAnalyzer();
    this.ikSolver = new ProceduralIK(options.ikIterations ?? 15);
  }

  /**
   * Initializes the ONNX models and WebGL/WebGPU contexts.
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('[AutoRig] Initializing ML Engine...');
    await this.detector.init(this.options.modelPath || '/models/joint_estimator_v1.onnx');
    this.isInitialized = true;
    console.log('[AutoRig] Ready.');
  }

  /**
   * Automatically rigs a static mesh.
   */
  async autoRig(mesh: THREE.Mesh): Promise<THREE.SkinnedMesh> {
    if (!this.isInitialized) throw new Error('[AutoRig] Engine not initialized.');

    console.log('[AutoRig] Analyzing topology & detecting joints...');
    const rig = await this.detector.detectJoints(mesh.geometry);
    
    console.log('[AutoRig] Applying procedural skin weights...');
    const skinnedMesh = this.analyzer.bindSkeleton(mesh, rig, this.options.skinningFalloff);
    
    return skinnedMesh;
  }

  /**
   * Updates the IK constraints for the animation loop.
   * Call this inside your requestAnimationFrame.
   */
  updateIK(skeleton: THREE.Skeleton): void {
    this.ikSolver.solve(skeleton);
  }

  /**
   * Adds an effector target for Inverse Kinematics.
   */
  setIKTarget(target: IKTarget): void {
    this.ikSolver.addTarget(target);
  }
}
