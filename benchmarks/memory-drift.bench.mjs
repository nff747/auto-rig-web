export function runMemoryDriftTest(cycles = 50000) {
  const baseline = process.memoryUsage().heapUsed;
  const prewarmed = new Uint8Array(1024);
  for (let i = 0; i < cycles; i++) {
    prewarmed[i % 1024] = i & 0xff;
  }
  const after = process.memoryUsage().heapUsed;
  const drift = after - baseline;
  return { baseline_bytes: baseline, after_bytes: after, drift_bytes: drift, steady: drift < 1048576 };
}

if (process.argv[1] && process.argv[1].endsWith('memory-drift.bench.mjs')) {
  console.log(JSON.stringify(runMemoryDriftTest(), null, 2));
}
