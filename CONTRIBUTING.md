# Contributing to Auto-Rig Web

Thank you for contributing to **Auto-Rig Web**, a browser-based, zero-click 3D humanoid mesh auto-rigging engine powered by ONNX Runtime Web and Web Workers.

## Development & Testing

```bash
npm install
npx vitest run
```

### Key Architectural Concepts

- **Web Worker Offloading**: All heavy computations (mesh normalization, voxelization, joint estimation, skin weighting) must execute inside `rigging.worker.ts` to keep the main UI thread at 60 FPS.
- **Vitruvian Fallback**: If an ONNX neural model is unavailable or encounters an error, the engine must gracefully fall back to the analytical anatomical joint estimator.

## How to Submit Changes

1. Fork the repo and create a feature branch (`git checkout -b feat/my-rig-improvement`).
2. Verify all tests pass with `npx vitest run`.
3. Submit a Pull Request.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
