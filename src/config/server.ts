export const SERVER_CONFIG = {
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || 'localhost',
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_PREFIX: '/api/v1'
} as const;

export const CORS_CONFIG = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
};