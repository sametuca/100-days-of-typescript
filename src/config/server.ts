import config from './env';

export const SERVER_CONFIG = {
  PORT: config.server.port,
  HOST: config.server.host,
  NODE_ENV: config.app.env,
  API_PREFIX: config.server.apiPrefix
} as const;

export const CORS_CONFIG = {
  origin: config.cors.origin,
  credentials: config.cors.credentials
};