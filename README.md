<div align="center">

# 🤖 auto-rig-web

**Zero-Click, Browser-Local Character Rigging Pipeline**

[![License: MIT](https://img.shields.io/badge/License-MIT-FF0055.svg?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![ONNX Runtime](https://img.shields.io/badge/ONNX_WebGPU-005CED.svg?style=for-the-badge&logo=onnx&logoColor=white)]()
[![Three.js](https://img.shields.io/badge/Three.js-r170+-000000.svg?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)

*Upload a static `.gltf` mesh. Instantly get a fully rigged, IK-ready `SkinnedMesh`.*<br>
*No server-side processing. No manual bone placement. No weight painting.*

[The Problem](#the-problem-manual-rigging-is-a-bottleneck) · [Architecture & Workflow](#architecture) · [Tech Stack](#tech-stack) · [API Usage](#api-usage)

</div>

---

## The Problem: Manual Rigging is a Bottleneck

In interactive 3D web platforms (metaverses, configurators, UGC gaming), empowering users to upload custom avatars usually requires a massive compromise:
1. **Force manual rigging:** Users spend days in Blender placing bones and painting weights.
2. **Server-side pipelines:** Send meshes to a cloud service running Mixamo or Maya scripts (slow, expensive, high latency).

### The Solution
`auto-rig-web` shifts the entire pipeline to the client. Using a lightweight, browser-local ONNX vision model, it analyzes mesh topology, predicts joint locations, constructs a skeletal hierarchy, and computes biharmonic skin weights procedurally using Three.js—all within milliseconds.

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    auto-rig-web                            │
│                                                            │
│  1. Ingestion        2. AI Inference       3. Topology     │
│  ┌────────────┐      ┌─────────────┐       ┌────────────┐  │
│  │ Static     │      │ ONNX Runtime│       │ Procedural │  │
│  │ THREE.Mesh │─────>│ (WebGPU)    │──────>│ Skinning   │  │
│  └────────────┘      │ Joint Predict│      │ (Weights)  │  │
│                      └─────────────┘       └──────┬─────┘  │
│                                                   │        │
│  4. Output           5. Animation                 │        │
│  ┌────────────┐      ┌─────────────┐              │        │
│  │ SkinnedMesh│<─────│ CCDIK Solver│<─────────────┘        │
│  │ (Ready)    │      │ (Real-Time) │                       │
│  └────────────┘      └─────────────┘                       │
└────────────────────────────────────────────────────────────┘
```

1. **Voxelization & Tensor Prep:** The input geometry's vertices are mapped to a 3D occupancy grid tensor.
2. **ONNX Inference:** A quantized spatial CNN runs via `onnxruntime-web` (WebGPU accelerated) to predict 3D coordinates for a standard 19-joint bipedal hierarchy.
3. **Procedural Skinning:** Bones are instantiated. Skin indices and skin weights are computed per-vertex using inverse distance weighting with exponential falloff (approximating heat-diffusion/geodesic distance).
4. **IK Constraints:** A built-in Cyclic Coordinate Descent (CCDIK) solver allows instant dynamic posing by pulling end-effectors (e.g., wrists, ankles).

---

## Tech Stack

This library is engineered for performance at the edge:

*   **AI Inference:** `onnxruntime-web` leveraging the **WebGPU execution provider**. This allows complex spatial CNNs to run directly on the client's GPU without WebGL overhead or CPU blocking.
*   **3D Pipeline:** **Three.js** is used for matrix math, hierarchy construction, and upgrading standard `BufferGeometry` to skinning-ready buffers (`skinIndex`, `skinWeight`).
*   **Procedural Algorithms:** 
    *   *Weight Calculation:* Custom multi-threaded fallback algorithms for distance-based bone influence mapping.
    *   *Kinematics:* Integrated CCDIK solver to handle complex joint rotations avoiding gimbal lock via Quaternion slerp chains.

---

## API Usage

### 1. Installation

```bash
npm install auto-rig-web three onnxruntime-web
```

### 2. Auto-Rigging a Mesh

```typescript
import * as THREE from 'three';
import { RiggingEngine, JointType } from 'auto-rig-web';

// 1. Initialize the engine (loads the ONNX model via WebGPU)
const engine = new RiggingEngine({
  modelPath: '/models/joint_estimator_quantized.onnx',
  skinningFalloff: 2.5
});
await engine.init();

// 2. Load your static mesh (e.g., via GLTFLoader)
const staticMesh = myLoadedGltf.scene.children[0] as THREE.Mesh;

// 3. Boom. Rigged.
const skinnedMesh = await engine.autoRig(staticMesh);
scene.add(skinnedMesh);
```

### 3. Applying Inverse Kinematics (IK)

Once rigged, easily pose the character by moving targets.

```typescript
// Create a visual target (e.g., a red sphere to control the hand)
const handTarget = new THREE.Vector3(1, 1, 0);

// Assign the target to the IK Solver
engine.setIKTarget({
  joint: JointType.RightHand,
  position: handTarget,
  influence: 1.0 // 0.0 to 1.0 interpolation
});

// Update the solver in your render loop
function animate() {
  requestAnimationFrame(animate);
  
  // Solve IK chains for the current frame
  engine.updateIK(skinnedMesh.skeleton);
  
  renderer.render(scene, camera);
}
animate();
```

---

## License

[MIT](LICENSE) — iKi / Frozen Flame
