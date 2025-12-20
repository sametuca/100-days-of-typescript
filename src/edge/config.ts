import { EdgeConfig } from './types';

export const defaultEdgeConfig: EdgeConfig = {
  cache: {
    defaultTTL: 3600,
    maxTTL: 86400,
    staleWhileRevalidate: 300
  },
  geo: {
    enableRouting: true,
    defaultRegion: 'us-east-1'
  },
  optimization: {
    minifyHTML: true,
    minifyCSS: true,
    minifyJS: true,
    optimizeImages: true
  },
  analytics: {
    enabled: true,
    sampleRate: 1.0
  },
  security: {
    rateLimitPerMinute: 100,
    allowedOrigins: ['*']
  }
};

export class EdgeConfigManager {
  private config: EdgeConfig;

  constructor(config: Partial<EdgeConfig> = {}) {
    this.config = {
      ...defaultEdgeConfig,
      ...config,
      cache: { ...defaultEdgeConfig.cache, ...config.cache },
      geo: { ...defaultEdgeConfig.geo, ...config.geo },
      optimization: { ...defaultEdgeConfig.optimization, ...config.optimization },
      analytics: { ...defaultEdgeConfig.analytics, ...config.analytics },
      security: { ...defaultEdgeConfig.security, ...config.security }
    };
  }

  get(): EdgeConfig {
    return this.config;
  }

  update(config: Partial<EdgeConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      cache: { ...this.config.cache, ...config.cache },
      geo: { ...this.config.geo, ...config.geo },
      optimization: { ...this.config.optimization, ...config.optimization },
      analytics: { ...this.config.analytics, ...config.analytics },
      security: { ...this.config.security, ...config.security }
    };
  }
}
