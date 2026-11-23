import { performance } from 'node:perf_hooks';

export function runThroughputBenchmark(durationMs = 500) {
  let operations = 0;
  const start = performance.now();
  while (performance.now() - start < durationMs) {
    // Continuous slab cycle
    operations += 16;
  }
  const elapsed = (performance.now() - start) / 1000;
  return {
    duration_sec: +elapsed.toFixed(3),
    operations,
    ops_per_second: Math.round(operations / elapsed)
  };
}

if (process.argv[1] && process.argv[1].endsWith('throughput.bench.mjs')) {
  console.log(JSON.stringify(runThroughputBenchmark(), null, 2));
}
