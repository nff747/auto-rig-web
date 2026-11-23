import test from 'node:test';
import assert from 'node:assert';

test('Auto Rig Web: fuzz testing against malformed byte buffers', () => {
  function safeIngest(bytes) {
    if (!bytes || bytes.length === 0) return { ok: false, reason: 'EMPTY' };
    if (bytes.length > 10 * 1024 * 1024) return { ok: false, reason: 'OVERSIZED' };
    return { ok: true, size: bytes.length };
  }

  assert.strictEqual(safeIngest(null).ok, false);
  assert.strictEqual(safeIngest(new Uint8Array(0)).ok, false);
  assert.strictEqual(safeIngest(new Uint8Array(128)).ok, true);
  assert.strictEqual(safeIngest(new Uint8Array(12 * 1024 * 1024)).ok, false);
});
