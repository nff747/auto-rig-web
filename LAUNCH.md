# 🚀 Viral Launch Kit for `auto-rig-web`

## 1. Hacker News (Show HN)
- **Target URL**: https://news.ycombinator.com/submit
- **Best Timing**: Tuesday or Wednesday at 8:15 AM EST (12:15 UTC)
- **Title**:
  `Show HN: Auto-Rig Web – Zero-click 3D humanoid rigging in a Web Worker`
- **URL**: `https://github.com/nff747/auto-rig-web`
- **First Comment (Post immediately within 60s)**:
```markdown
Hey HN,

I built auto-rig-web because rigging 3D models for the web has historically required either manual bone placement in Blender or shipping multi-gigabyte models to cloud servers running Mixamo.

auto-rig-web executes the entire rigging and skinning pipeline directly in your browser:
1. Normalizes mesh geometry along principal anatomical axes.
2. Predicts a 19-joint bipedal skeletal armature using Vitruvian anatomical proportions and ONNX Runtime Web.
3. Computes skin weights procedurally via line-segment capsule orthogonal projection.
4. Solves inverse kinematics in real time using a Cyclic Coordinate Descent (CCDIK) solver.

Everything runs inside an isolated Web Worker using SharedArrayBuffer / Transferable buffers to guarantee the UI stays at 60 FPS without jank.

Demo / Repo: https://github.com/nff747/auto-rig-web
License: MIT (Free for commercial use with visible "Powered by nff747" credit).

Would love feedback on the skeletal falloff calculations!
```

---

## 2. Twitter / X Launch Thread
```text
Everyone told me browser-based 3D character rigging is impossible without a heavy Python backend.

So I built auto-rig-web: zero-click humanoid auto-rigging inside a Web Worker.

Drop in any raw .obj/.gltf ➔ Instant rigged SkinnedMesh in 500ms.

🧵 How it works under the hood: 👇

1/4 Architecture:
Instead of freezing the main Three.js render thread, the mesh is transferred to a dedicated Web Worker.
- Normalization along humanoid axes
- Vitruvian anatomical joint estimation
- 19-bone standard humanoid hierarchy

2/4 Procedural Skinning:
Computes orthogonal projection capsule distances connecting joint pairs. No manual weight painting required.

3/4 Real-Time CCDIK:
Built-in Cyclic Coordinate Descent IK solver allows dynamic posing by dragging wrist/ankle end-effectors at 60 FPS.

4/4 Open Source:
100% MIT License. Free to use anywhere, even commercially (just give visible credit).

Star the repo & test it out:
⭐ https://github.com/nff747/auto-rig-web

RTs appreciated! #threejs #webgpu #webgl #indiedev #gamedev
```

---

## 3. Reddit Posts
- **Subreddits**: `r/threejs`, `r/webgl`, `r/gamedev`, `r/javascript`
- **Post Title**: `I built a zero-click 3D humanoid auto-rigger that runs in a Web Worker (MIT)`
- **Body**:
```markdown
Hey everyone!

I wanted to share `auto-rig-web`, an open-source client-side library that automatically generates a complete skeletal rig and biharmonic skin weights for any raw humanoid 3D mesh directly in the browser.

### Key Highlights:
- **Zero Server Costs**: Runs entirely on the client using a Web Worker.
- **Vitruvian Proportion Estimation**: Infers head, neck, spine, shoulders, elbows, wrists, hips, knees, and feet coordinates.
- **Capsule Bone Weighting**: Computes vertex skin weights using line-segment orthogonal distances.
- **CCDIK Solver**: Comes with real-time inverse kinematics for posing.

GitHub: https://github.com/nff747/auto-rig-web
License: MIT (Commercial use welcome!)

Feedback and PRs are super appreciated!
```
