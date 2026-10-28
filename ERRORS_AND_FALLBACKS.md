# Hardware Degradation & Diagnostic Fallback Matrix

### Adapter Capability Probing
- Dynamic validation of maxBufferSize, maxStorageBufferBindingSize, and workgroup limits.
- Tiered fallback thresholds for integrated vs discrete GPU architectures.

### Device Lost Event Recovery
- Handled device.lost with exponential backoff re-acquisition loop.
- Restored scene state and memory caches seamlessly without page reload.

