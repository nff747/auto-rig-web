import * as THREE from 'three';
import { MeshAnalyzer } from '../topology/MeshAnalyzer';
import { ProceduralIK } from '../ik/ProceduralIK';
import { RiggingOptions, IKTarget, SkeletonRig } from '../types';

export class AutoRigger {
  private analyzer: MeshAnalyzer;
  private ikSolver: ProceduralIK;
  private worker: Worker | null = null;
  private isInitialized = false;
  private msgIdCounter = 0;
  private pendingRequests = new Map<number, { resolve: Function, reject: Function }>();
  private activeSkeleton?: THREE.Skeleton;

  constructor(private options: RiggingOptions = {}) {
    this.analyzer = new MeshAnalyzer();
    this.ikSolver = new ProceduralIK(options.ikIterations ?? 15);
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    // Fallback URL resolving for both Vite and plain build output
    const workerUrl = new URL(
      // @ts-ignore
      import.meta.env ? '../worker/rigWorker.ts' : './worker/rigWorker.js', 
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

  /**
   * Dual-Pipe Autonomous Auto-Rigging:
   * 1. If crossOriginIsolated & SharedArrayBuffer are available: zero-copy shared memory.
   * 2. Otherwise: zero-copy Transferable ArrayBuffers (works anywhere without COOP/COEP headers).
   */
  async rig(mesh: THREE.Mesh): Promise<THREE.SkinnedMesh> {
    if (!this.isInitialized || !this.worker) throw new Error('[AutoRig] Engine not initialized.');

    console.log('[AutoRig] Analyzing topology & detecting joints in Worker...');
    
    const geometry = mesh.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const vertexCount = positions.length / 3;

    const isSABSupported = typeof SharedArrayBuffer !== 'undefined' && 
      (typeof crossOriginIsolated !== 'undefined' ? crossOriginIsolated : false);

    if (isSABSupported) {
      // Tier 1: SharedArrayBuffer Zero-Copy
      const posBuffer = new SharedArrayBuffer(positions.length * Float32Array.BYTES_PER_ELEMENT);
      new Float32Array(posBuffer).set(positions);
      
      const indicesBuffer = new SharedArrayBuffer(vertexCount * 4 * Uint16Array.BYTES_PER_ELEMENT);
      const weightsBuffer = new SharedArrayBuffer(vertexCount * 4 * Float32Array.BYTES_PER_ELEMENT);
      
      const payload = await this.postWorkerMessage('RIG', {
        mode: 'SAB',
        posBuffer,
        indicesBuffer,
        weightsBuffer,
        falloff: this.options.skinningFalloff ?? 2.0
      });
      
      const rig = payload.rig as SkeletonRig;
      console.log('[AutoRig] Applying procedural skin weights (SAB mode)...');
      const skinnedMesh = this.analyzer.bindSkeletonWithWeights(
        mesh, 
        rig, 
        new Uint16Array(indicesBuffer), 
        new Float32Array(weightsBuffer)
      );
      this.activeSkeleton = skinnedMesh.skeleton;
      return skinnedMesh;
    } else {
      // Tier 2: Universal Transferable ArrayBuffer Zero-Copy (No CORS/Spectre headers required)
      const posBuffer = new Float32Array(positions).buffer;
      const indicesBuffer = new ArrayBuffer(vertexCount * 4 * Uint16Array.BYTES_PER_ELEMENT);
      const weightsBuffer = new ArrayBuffer(vertexCount * 4 * Float32Array.BYTES_PER_ELEMENT);

      const payload = await this.postWorkerMessage('RIG', {
        mode: 'TRANSFERABLE',
        posBuffer,
        indicesBuffer,
        weightsBuffer,
        falloff: this.options.skinningFalloff ?? 2.0
      }, [posBuffer, indicesBuffer, weightsBuffer]);

      const rig = payload.rig as SkeletonRig;
      const resultIndices = new Uint16Array(payload.indicesBuffer);
      const resultWeights = new Float32Array(payload.weightsBuffer);

      const skinnedMesh = this.analyzer.bindSkeletonWithWeights(mesh, rig, resultIndices, resultWeights);
      this.activeSkeleton = skinnedMesh.skeleton;
      return skinnedMesh;
    }
  }

  /**
   * Alias for rig(mesh) for backward compatibility.
   */
  async autoRig(mesh: THREE.Mesh): Promise<THREE.SkinnedMesh> {
    return this.rig(mesh);
  }

  animate(): void {
    if (this.activeSkeleton) {
      this.ikSolver.solve(this.activeSkeleton);
    }
  }

  setIKTarget(target: IKTarget): void {
    this.ikSolver.addTarget(target);
  }
}

export { AutoRigger as RiggingEngine };

