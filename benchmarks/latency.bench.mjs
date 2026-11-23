import { performance } from 'node:perf_hooks';

export function runLatencyBenchmark(iterations = 100000) {
  const samples = [];
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    // In-memory hot evaluation
    const val = (i * 1664525 + 1013904223) >>> 0;
    const t1 = performance.now();
    if (i % 1000 === 0) samples.push(t1 - t0);
  }
  samples.sort((a, b) => a - b);
  const p50 = samples[Math.floor(samples.length * 0.5)];
  const p99 = samples[Math.floor(samples.length * 0.99)];
  return { p50_ms: p50, p99_ms: p99, samples_recorded: samples.length };
}

if (process.argv[1] && process.argv[1].endsWith('latency.bench.mjs')) {
  console.log(JSON.stringify(runLatencyBenchmark(), null, 2));
}
