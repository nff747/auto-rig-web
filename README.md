<div align="center">

<img src="assets/banner.jpg" width="800" alt="Project Banner">


# 🤖 auto-rig-web

**Zero-Click, Browser-Local Character Rigging Pipeline**

[![Powered by nff747](https://img.shields.io/badge/Powered%20by-nff747-111111?style=for-the-badge&logo=github&logoColor=white)](https://github.com/nff747)
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


## Live Demo

Try the interactive demo directly in your browser:
[![Edit auto-rig-web Demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/auto-rig-web-demo-placeholder)

<iframe src="https://codesandbox.io/embed/auto-rig-web-demo-placeholder?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="auto-rig-web-demo"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

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


### Skeleton Layout (19-Bones)

```text
       [Head]
         |
       [Neck]
         |
    --[Chest]--
   /     |     \
[L.Sh] [Spine] [R.Sh]
  |      |       |
[L.Arm] [Hips] [R.Arm]
  |     /    \    |
[L.FA] /      \ [R.FA]
  | [L.UpLeg] [R.UpLeg] |
[L.Hnd]  |      |   [R.Hnd]
      [L.Leg] [R.Leg]
         |      |
     [L.Foot] [R.Foot]
```

## Tech Stack

This library is engineered for performance at the edge:

*   **AI Inference:** `onnxruntime-web` leveraging the **WebGPU execution provider**. This allows complex spatial CNNs to run directly on the client's GPU without WebGL overhead or CPU blocking.
*   **3D Pipeline:** **Three.js** is used for matrix math, hierarchy construction, and upgrading standard `BufferGeometry` to skinning-ready buffers (`skinIndex`, `skinWeight`).
*   **Procedural Algorithms:** 
    *   *Weight Calculation:* Custom multi-threaded fallback algorithms for distance-based bone influence mapping.
    *   *Kinematics:* Integrated CCDIK solver to handle complex joint rotations avoiding gimbal lock via Quaternion slerp chains.

---


## API Reference

The primary export of `auto-rig-web` is the `AutoRigger` class.

### `AutoRigger`

```typescript
import { AutoRigger } from 'auto-rig-web';

const rigger = new AutoRigger({ skinningFalloff: 2.5 });
await rigger.init();
```

#### `AutoRigger.rig(mesh: THREE.Mesh): Promise<THREE.SkinnedMesh>`
Analyzes the input static mesh, predicts joint locations, constructs a skeleton, and calculates procedural skin weights. Returns an IK-ready `SkinnedMesh`.

#### `AutoRigger.setIKTarget(target: IKTarget): void`
Assigns a 3D target for a specific joint to pull towards.
```typescript
rigger.setIKTarget({ joint: JointType.LeftHand, position: new THREE.Vector3(1, 2, 0), influence: 1.0 });
```

#### `AutoRigger.animate(): void`
Solves the Inverse Kinematics chains for the current frame. Call this inside your requestAnimationFrame loop.


## Framework Integration

### React + Three.js (@react-three/fiber)
```jsx
import { useFrame } from '@react-three/fiber';
import { AutoRigger } from 'auto-rig-web';

const rigger = new AutoRigger();
// ... inside component ...
const riggedMesh = await rigger.rig(staticMesh);
useFrame(() => rigger.animate());
```

### Vue + Three.js (TresJS)
```vue
<script setup>
import { useRenderLoop } from '@tresjs/core';
import { AutoRigger } from 'auto-rig-web';

const rigger = new AutoRigger();
const riggedMesh = await rigger.rig(staticMesh);
useRenderLoop().onLoop(() => rigger.animate());
</script>
```

### Vanilla JS
```javascript
import { AutoRigger } from 'auto-rig-web';

const rigger = new AutoRigger();
await rigger.init();
const riggedMesh = await rigger.rig(mesh);

function animate() {
  requestAnimationFrame(animate);
  rigger.animate();
  renderer.render(scene, camera);
}
animate();
```

---

## License

[MIT](LICENSE) — iKi / Frozen Flame

---

## 📜 Open Source & Commercial Use (MIT)

This project is 100% open-source software under the **[MIT License](LICENSE)**.

### 💼 Commercial Use & Free Redistribution
You are explicitly permitted to use, modify, fork, integrate, package, and sell commercial products or SaaS built using this engine with **one visible attribution requirement**:
> **Attribution Requirement**: You must include a visible credit to **nff747** in your application (e.g., `Powered by nff747` linking to [https://github.com/nff747](https://github.com/nff747) in your application UI, footer, about modal, or documentation).

```html
<!-- Example visible footer attribution -->
<p>Powered by <a href="https://github.com/nff747" target="_blank">nff747</a></p>
```
