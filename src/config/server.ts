// ============================================
// SERVER CONFIGURATION
// ============================================
// Artık .env dosyasından geliyor

// Config'i import et
import config from './env';

// SERVER_CONFIG = config.server'dan al
export const SERVER_CONFIG = {
  PORT: config.server.port,
  HOST: config.server.host,
  NODE_ENV: config.app.env,
  API_PREFIX: config.server.apiPrefix
} as const;

// CORS_CONFIG = config.cors'tan al
export const CORS_CONFIG = {
  origin: config.cors.origin,
  credentials: config.cors.credentials
};