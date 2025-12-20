// WebAssembly Types
export interface WasmModule {
  exports: Record<string, any>;
  memory?: any; // WebAssembly.Memory
}

export interface WasmConfig {
  module: string;
  memory?: {
    initial: number;
    maximum?: number;
    shared?: boolean;
  };
  imports?: Record<string, any>;
}

export interface WasmPerformanceMetrics {
  loadTime: number;
  executeTime: number;
  memoryUsage: number;
}
