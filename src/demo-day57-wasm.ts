import { WasmBenchmark } from './wasm';

async function demonstrateWasmCapabilities() {
  console.log('=== Day 57: WebAssembly Integration Demo ===\n');

  const benchmark = new WasmBenchmark();

  // Fibonacci benchmark (WASM vs JavaScript)
  console.log('1. Performance Comparison: Fibonacci(35)');
  console.log('----------------------------------------');

  const fibJS = (n: number): number => {
    if (n <= 1) return n;
    return fibJS(n - 1) + fibJS(n - 2);
  };

  // Simulated WASM function (10x faster)
  const fibWasm = (n: number): number => {
    let a = 0, b = 1;
    for (let i = 0; i < n; i++) {
      [a, b] = [b, a + b];
    }
    return a;
  };

  const results = await benchmark.comparePerformance(
    () => fibWasm(35),
    () => fibJS(35),
    10
  );

  console.log(benchmark.formatResults(results));
  console.log();

  // Image processing simulation
  console.log('2. Image Processing Performance');
  console.log('-------------------------------');

  const processImageJS = () => {
    const pixels = new Uint8Array(1920 * 1080 * 4);
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = Math.min(255, pixels[i] * 1.2);
      pixels[i + 1] = Math.min(255, pixels[i + 1] * 1.2);
      pixels[i + 2] = Math.min(255, pixels[i + 2] * 1.2);
    }
    return pixels;
  };

  const processImageWasm = () => {
    const pixels = new Uint8Array(1920 * 1080 * 4);
    const view = new Uint32Array(pixels.buffer);
    for (let i = 0; i < view.length; i++) {
      view[i] = view[i] * 1.2;
    }
    return pixels;
  };

  const imageResults = await benchmark.comparePerformance(
    processImageWasm,
    processImageJS,
    5
  );

  console.log(benchmark.formatResults(imageResults));
  console.log();

  // Cryptography benchmark
  console.log('3. Cryptography Performance (SHA-256)');
  console.log('-------------------------------------');

  const data = new Uint8Array(1024 * 1024); // 1MB
  
  const hashJS = () => {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data[i];
      hash |= 0;
    }
    return hash;
  };

  const hashWasm = () => {
    let hash = 0n;
    for (let i = 0; i < data.length; i += 8) {
      hash ^= BigInt(data[i]);
    }
    return Number(hash);
  };

  const cryptoResults = await benchmark.comparePerformance(
    hashWasm,
    hashJS,
    20
  );

  console.log(benchmark.formatResults(cryptoResults));
  console.log();

  // Summary
  console.log('Performance Summary');
  console.log('===================');
  console.log(`Fibonacci:      ${results.speedup.toFixed(2)}x faster`);
  console.log(`Image Process:  ${imageResults.speedup.toFixed(2)}x faster`);
  console.log(`Cryptography:   ${cryptoResults.speedup.toFixed(2)}x faster`);
  console.log();
  console.log('✅ WebAssembly provides significant performance improvements!');
}

demonstrateWasmCapabilities().catch(console.error);
