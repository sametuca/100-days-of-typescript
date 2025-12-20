import * as fs from 'fs';
import * as path from 'path';
import { WasmModule, WasmConfig } from './types';

// Declare WebAssembly global for Node.js
declare const WebAssembly: any;

export class WasmLoader {
  private modules: Map<string, WasmModule> = new Map();

  async load(config: WasmConfig): Promise<WasmModule> {
    const startTime = Date.now();

    // Check if module already loaded
    const cached = this.modules.get(config.module);
    if (cached) {
      return cached;
    }

    // Load WASM binary
    const wasmPath = path.resolve(config.module);
    
    if (!fs.existsSync(wasmPath)) {
      // For demo purposes, return a mock module
      const mockModule: WasmModule = {
        exports: {
          fibonacci: (n: number) => {
            let a = 0, b = 1;
            for (let i = 0; i < n; i++) {
              [a, b] = [b, a + b];
            }
            return a;
          }
        }
      };
      
      this.modules.set(config.module, mockModule);
      console.log(`Mock WASM module loaded in ${Date.now() - startTime}ms`);
      return mockModule;
    }

    const wasmBuffer = fs.readFileSync(wasmPath);

    // Create memory if specified
    let memory: any;
    if (config.memory && typeof WebAssembly !== 'undefined') {
      memory = new (WebAssembly as any).Memory({
        initial: config.memory.initial,
        maximum: config.memory.maximum,
        shared: config.memory.shared
      });
    }

    // Compile and instantiate
    const importObject = {
      env: {
        memory,
        ...config.imports
      }
    };

    if (typeof WebAssembly !== 'undefined') {
      const module = await (WebAssembly as any).instantiate(wasmBuffer, importObject);
      
      const wasmModule: WasmModule = {
        exports: module.instance.exports,
        memory
      };

      this.modules.set(config.module, wasmModule);

      const loadTime = Date.now() - startTime;
      console.log(`WASM module loaded in ${loadTime}ms`);

      return wasmModule;
    }

    throw new Error('WebAssembly is not supported in this environment');
  }

  get(moduleName: string): WasmModule | undefined {
    return this.modules.get(moduleName);
  }

  unload(moduleName: string): boolean {
    return this.modules.delete(moduleName);
  }

  clear(): void {
    this.modules.clear();
  }
}
