# Error Taxonomy & Failure Mode Mitigations // Auto Rig Web

## 1. Known Failure States & Graceful Degradation

| Failure Mode | Trigger Precondition | Autonomous Circuit Action | Operator Resolution |
| :--- | :--- | :--- | :--- |
| **VRAM Pressure Spike** | System GPU memory exhaustion | Automatically shrink LoD ring buffer | Fall back to CPU SIMD kernel |
| **Buffer Length Mismatch** | Ingestion of malformed geometry | Reject payload with `0x101` code | Validate mesh index bounds |
| **Device Disconnect** | Browser tab suspend / GPU reset | Attempt clean context resurrection | Re-initialize `EngineContext` |

## 2. Invariant Safety
When an unrecoverable exception occurs, scratch buffers are immediately wiped to protect system stability.
