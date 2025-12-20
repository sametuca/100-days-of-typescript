export class WasmBenchmark {
  async comparePerformance(
    wasmFn: () => any,
    jsFn: () => any,
    iterations: number = 100
  ): Promise<{
    wasm: number;
    js: number;
    speedup: number;
  }> {
    // Warm up
    wasmFn();
    jsFn();

    // Benchmark WASM
    const wasmStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      wasmFn();
    }
    const wasmTime = performance.now() - wasmStart;

    // Benchmark JavaScript
    const jsStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      jsFn();
    }
    const jsTime = performance.now() - jsStart;

    return {
      wasm: wasmTime,
      js: jsTime,
      speedup: jsTime / wasmTime
    };
  }

  formatResults(results: { wasm: number; js: number; speedup: number }): string {
    return `
WASM: ${results.wasm.toFixed(2)}ms
JS:   ${results.js.toFixed(2)}ms
Speedup: ${results.speedup.toFixed(2)}x
    `.trim();
  }

  async benchmarkFunction(
    fn: () => any,
    iterations: number = 1000
  ): Promise<{ avgTime: number; minTime: number; maxTime: number }> {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      fn();
      const end = performance.now();
      times.push(end - start);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    return { avgTime, minTime, maxTime };
  }
}
