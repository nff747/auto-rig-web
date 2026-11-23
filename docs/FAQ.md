# Frequently Asked Questions // Auto Rig Web

### Q: Why does this engine avoid runtime heap allocations?
**A:** In high-frequency 60 FPS graphics and real-time audio/inference pipelines, garbage collection pauses cause dropped frames. By maintaining a fixed slab arena, frame pacing remains locked.

### Q: Does this require external cloud servers?
**A:** No. `auto-rig-web` is engineered to operate 100% locally in browser memory or native runtimes.
