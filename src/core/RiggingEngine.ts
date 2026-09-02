import * as THREE from 'three';
import { MeshAnalyzer } from '../topology/MeshAnalyzer';
import { ProceduralIK } from '../ik/ProceduralIK';
import { RiggingOptions, IKTarget, SkeletonRig } from '../types';

export class RiggingEngine {
  private analyzer: MeshAnalyzer;
  private ikSolver: ProceduralIK;
  private worker: Worker | null = null;
  private isInitialized = false;
  private msgIdCounter = 0;
  private pendingRequests = new Map<number, { resolve: Function, reject: Function }>();

  constructor(private options: RiggingOptions = {}) {
    this.analyzer = new MeshAnalyzer();
    this.ikSolver = new ProceduralIK(options.ikIterations ?? 15);
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    // Fallback URL resolving for both Vite and plain build output
    const workerUrl = new URL(
      // Vite and modern bundlers
      // @ts-ignore
      import.meta.env ? '../worker/rigging.worker.ts' : './worker/rigging.worker.js', 
      import.meta.url
    );
    this.worker = new Worker(workerUrl, { type: 'module' });
    
    this.worker.onmessage = (e) => this.handleWorkerMessage(e);
    this.worker.onerror = (e) => {
      console.error('[AutoRig] Worker error:', e);
    };

    console.log('[AutoRig] Initializing ML Engine in Worker...');
    
    await this.postWorkerMessage('INIT', {
      modelPath: this.options.modelPath || '/models/joint_estimator_v1.onnx'
    });

    this.isInitialized = true;
    console.log('[AutoRig] Ready.');
  }

  private handleWorkerMessage(e: MessageEvent) {
    const { type, payload, msgId } = e.data;
    const req = this.pendingRequests.get(msgId);
    
    if (type === 'ERROR') {
      if (req) {
        req.reject(new Error(payload));
        this.pendingRequests.delete(msgId);
      } else {
        console.error('[AutoRig] Worker error:', payload);
      }
    } else {
      if (req) {
        req.resolve(payload);
        this.pendingRequests.delete(msgId);
      }
    }
  }

  private postWorkerMessage(type: string, payload: any, transfers: Transferable[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      const msgId = ++this.msgIdCounter;
      this.pendingRequests.set(msgId, { resolve, reject });
      this.worker!.postMessage({ type, payload, msgId }, transfers);
    });
  }

  async autoRig(mesh: THREE.Mesh): Promise<THREE.SkinnedMesh> {
    if (!this.isInitialized || !this.worker) throw new Error('[AutoRig] Engine not initialized.');

    console.log('[AutoRig] Analyzing topology & detecting joints in Worker...');
    
    const geometry = mesh.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const vertexCount = positions.length / 3;

    // Use SharedArrayBuffer to avoid copies if supported, otherwise fallback to copying to ArrayBuffer and transferring
    let posBuffer: ArrayBuffer | SharedArrayBuffer;
    let indicesBuffer: ArrayBuffer | SharedArrayBuffer;
    let weightsBuffer: ArrayBuffer | SharedArrayBuffer;

    if (typeof SharedArrayBuffer !== 'undefined') {
      posBuffer = new SharedArrayBuffer(positions.length * Float32Array.BYTES_PER_ELEMENT);
      new Float32Array(posBuffer).set(positions);
      
      indicesBuffer = new SharedArrayBuffer(vertexCount * 4 * Uint16Array.BYTES_PER_ELEMENT);
      weightsBuffer = new SharedArrayBuffer(vertexCount * 4 * Float32Array.BYTES_PER_ELEMENT);
      
      const payload = await this.postWorkerMessage('RIG', {
        posBuffer,
        indicesBuffer,
        weightsBuffer,
        falloff: this.options.skinningFalloff ?? 2.0
      });
      
      const rig = payload.rig as SkeletonRig;
      console.log('[AutoRig] Applying procedural skin weights...');
      return this.analyzer.bindSkeletonWithWeights(mesh, rig, new Uint16Array(indicesBuffer), new Float32Array(weightsBuffer));
      
    } else {
      throw new Error('[AutoRig] SharedArrayBuffer is required for zero-copy transfers.');
    }
  }

  updateIK(skeleton: THREE.Skeleton): void {
    this.ikSolver.solve(skeleton);
  }

  setIKTarget(target: IKTarget): void {
    this.ikSolver.addTarget(target);
  }
}
