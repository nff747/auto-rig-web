# Technical Evolution & Architecture Roadmap (2026-2027)

### WebGPU Subgroups & Multi-Draw Indirect
- Evaluating subgroup operations (subgroupAdd, subgroupShuffle) for faster reduction passes.
- Target 2.5x throughput gain on supported Vulkan and Metal backends.

### Zero-Copy Shared Memory Interop
- Off-thread compute dispatch via Web Worker SharedArrayBuffer synchronization.
- Sub-millisecond IPC transfer budget between physics/indexing and render loops.

