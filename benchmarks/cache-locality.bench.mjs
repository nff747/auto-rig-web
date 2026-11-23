export function evaluateCacheStride(size = 65536) {
  const arr = new Int32Array(size);
  let sequentialSum = 0;
  const t0 = performance.now();
  for (let i = 0; i < size; i++) sequentialSum += arr[i];
  const tSequential = performance.now() - t0;

  let stridedSum = 0;
  const t1 = performance.now();
  for (let i = 0; i < size; i += 16) stridedSum += arr[i];
  const tStrided = performance.now() - t1;

  return { sequential_ms: +tSequential.toFixed(4), strided_ms: +tStrided.toFixed(4), ratio: +(tSequential / (tStrided || 0.0001)).toFixed(2) };
}

if (process.argv[1] && process.argv[1].endsWith('cache-locality.bench.mjs')) {
  console.log(JSON.stringify(evaluateCacheStride(), null, 2));
}
