import test from 'node:test';
import assert from 'node:assert';

test('Auto Rig Web: structured error code mapping', () => {
  const ERROR_CODES = {
    ERR_INVALID_BUFFER: 0x101,
    ERR_OUT_OF_BOUNDS: 0x102,
    ERR_DEVICE_LOST: 0x103,
    ERR_CIRCUIT_BROKEN: 0x104
  };

  function formatError(code, details) {
    return { code, hex: '0x' + code.toString(16).toUpperCase(), details };
  }

  const err = formatError(ERROR_CODES.ERR_INVALID_BUFFER, 'Buffer length mismatch');
  assert.strictEqual(err.code, 257);
  assert.strictEqual(err.hex, '0x101');
});
