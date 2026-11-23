# Operational Runbook // Auto Rig Web

## Quick Diagnostic Commands
```bash
# Verify integrity of test suites
node --test tests/*.test.mjs

# Execute throughput stress test
node benchmarks/throughput.bench.mjs

# Check memory heap retention
node benchmarks/memory-drift.bench.mjs
```

## Emergency Procedures
- If memory consumption exceeds the configured budget, inspect slab pooling in `types/buffers.d.ts`.
