// Edge Computing Types
export interface EdgeRequest {
  method: string;
  url: string;
  headers: Headers;
  body?: ReadableStream | null;
  geo?: {
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  cf?: {
    colo: string; // Data center code
    asn: number;
    tlsVersion: string;
  };
}

export interface EdgeResponse {
  status: number;
  statusText?: string;
  headers: Headers;
  body?: BodyInit;
}

export interface EdgeContext {
  waitUntil: (promise: Promise<any>) => void;
  passThroughOnException: () => void;
  request: EdgeRequest;
  env: Record<string, any>;
}

export type EdgeHandler = (
  request: EdgeRequest,
  context: EdgeContext
) => Promise<EdgeResponse> | EdgeResponse;

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[];
  revalidate?: boolean;
  staleWhileRevalidate?: number;
}

export interface EdgeConfig {
  cache: {
    defaultTTL: number;
    maxTTL: number;
    staleWhileRevalidate: number;
  };
  geo: {
    enableRouting: boolean;
    defaultRegion: string;
  };
  optimization: {
    minifyHTML: boolean;
    minifyCSS: boolean;
    minifyJS: boolean;
    optimizeImages: boolean;
  };
  analytics: {
    enabled: boolean;
    sampleRate: number;
  };
  security: {
    rateLimitPerMinute: number;
    allowedOrigins: string[];
  };
}

export interface AnalyticsEvent {
  timestamp: number;
  type: string;
  path: string;
  method: string;
  status: number;
  duration: number;
  geo?: {
    country: string;
    city: string;
  };
  userAgent?: string;
  referer?: string;
}

export interface EdgeMetrics {
  totalRequests: number;
  avgDuration: number;
  statusCodes: Record<number, number>;
  topPaths: Array<{ item: string; count: number }>;
}

export interface GeoRule {
  countries?: string[];
  regions?: string[];
  continents?: string[];
  handler: (request: EdgeRequest) => Promise<EdgeResponse>;
}

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}
