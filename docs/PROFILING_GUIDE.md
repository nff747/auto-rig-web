# Hardware Profiling Guide // Auto Rig Web

## Linux `perf` Hardware Counters
Measure exact CPU cachelines and instruction efficiency:
```bash
perf stat -e cycles,instructions,cache-references,cache-misses,L1-dcache-load-misses node tools/bench.mjs
```

## Chrome DevTools Allocation Timeline
1. Open DevTools → Memory panel.
2. Select **Allocation instrumentation on timeline**.
3. Record while executing `tools/verify.mjs` to visually confirm zero blue spikes in steady state.
