/**
 * Hardware Micro-Benchmark Runner for Auto Rig Web
 * Measures P50/P99 latency and sustained throughput.
 * Run via: node tools/bench.mjs
 */

import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

console.log('\x1b[1m=== [Auto Rig Web] Hardware Micro-Benchmark Suite ===\x1b[0m\n');

const benchDir = join(process.cwd(), 'benchmarks');
try {
  const files = readdirSync(benchDir).filter(f => f.endsWith('.bench.mjs'));
  for (const f of files) {
    console.log(`Executing benchmark: ${f}`);
    const res = spawnSync('node', [join(benchDir, f)], { encoding: 'utf-8' });
    if (res.stdout) console.log(res.stdout);
    if (res.stderr) console.error(res.stderr);
  }
} catch (err) {
  console.error('Error executing benchmarks:', err.message);
}
