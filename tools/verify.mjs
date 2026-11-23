/**
 * Deterministic Local Verification Suite for Auto Rig Web
 * Executes all test fixtures and assertions with zero external runner dependencies.
 * Run via: node tools/verify.mjs
 */

import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

console.log('\x1b[1m=== [Auto Rig Web] Local Verification Suite ===\x1b[0m\n');

const testsDir = join(process.cwd(), 'tests');
let passed = 0;
let failed = 0;

try {
  const files = readdirSync(testsDir).filter(f => f.endsWith('.test.mjs') || f.endsWith('.test.js'));
  console.log(`Found ${files.length} test suites to execute.\n`);

  for (const f of files) {
    const testPath = join(testsDir, f);
    process.stdout.write(`  • Running ${f} ... `);
    const res = spawnSync('node', ['--test', testPath], { encoding: 'utf-8' });
    if (res.status === 0) {
      console.log('\x1b[32m[PASS]\x1b[0m');
      passed++;
    } else {
      console.log('\x1b[31m[FAIL]\x1b[0m');
      if (res.stderr) console.error(res.stderr);
      failed++;
    }
  }
} catch (err) {
  console.error('Error scanning tests directory:', err.message);
}

console.log(`\n\x1b[1mVerification Summary: ${passed} passed, ${failed} failed.\x1b[0m`);
process.exit(failed === 0 ? 0 : 1);
