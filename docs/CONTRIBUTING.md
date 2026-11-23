# Contributing Guidelines // Auto Rig Web
Thank you for your interest in improving `auto-rig-web`.

## Engineering Invariants
1. **Zero Heap Drift:** Hot-loop routines must reuse pre-allocated array buffers and scratch slabs.
2. **Determinism:** Tests must pass reproducibly across POSIX and macOS environments.
3. **Attribution:** Preserve all Apache-2.0 author declarations naming `nff747`.

## PR Verification Workflow
```bash
npm test # or node --test tests/*.test.mjs
node benchmarks/latency.bench.mjs
```
