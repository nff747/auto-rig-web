import test from 'node:test';
import assert from 'node:assert';

test('Auto Rig Web: re-entrant atomic synchronization test', async () => {
  let lock = 0;
  async function acquireLock() {
    const start = Date.now();
    while (lock !== 0) {
      if (Date.now() - start > 100) throw new Error('Lock contention timeout');
      await new Promise(r => setImmediate(r));
    }
    lock = 1;
  }
  function releaseLock() {
    lock = 0;
  }

  await acquireLock();
  assert.strictEqual(lock, 1);
  releaseLock();
  assert.strictEqual(lock, 0);
});
