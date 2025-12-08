import dotenv from 'dotenv';
dotenv.config();

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    
    throw new Error(`Environment variable ${key} is not defined`);
  }
  
  return value;
}



function getNumberEnv(key: string, defaultValue?: number): number {
  const value = process.env[key];
  
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not defined`);
  }
  

  const numValue = parseInt(value, 10);

  if (isNaN(numValue)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  
  return numValue;
}

function getBooleanEnv(key: string, defaultValue?: boolean): boolean {
  const value = process.env[key];
  
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not defined`);
  }
  
  return value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes';
}

export const config = {
  

  app: {
    env: getEnv('NODE_ENV', 'development'),
    
    isDevelopment: getEnv('NODE_ENV', 'development') === 'development',
    isProduction: getEnv('NODE_ENV', 'development') === 'production',
    isTest: getEnv('NODE_ENV', 'development') === 'test',
    
    name: getEnv('APP_NAME', 'DevTracker'),
    
    version: getEnv('APP_VERSION', '1.0.0')
  },
  

  server: {
    port: getNumberEnv('PORT', 3000),
    
    host: getEnv('HOST', 'localhost'),
    
    apiPrefix: getEnv('API_PREFIX', '/api/v1')
  },
  

  database: {
    path: getEnv('DB_PATH', './data/devtracker.db'),
    
    verbose: getBooleanEnv('DB_VERBOSE', false),
    
    // MySQL configuration
    host: getEnv('DB_HOST', 'localhost'),
    port: getNumberEnv('DB_PORT', 3306),
    user: getEnv('DB_USER', 'root'),
    password: getEnv('DB_PASSWORD', ''),
    name: getEnv('DB_NAME', 'devtracker')
  },
  

  cors: {
    origin: getEnv('CORS_ORIGIN', '*'),
    
    credentials: true
  },
  

  logging: {
    level: getEnv('LOG_LEVEL', 'debug'),
    
    dir: getEnv('LOG_DIR', './logs')
  },
  
  jwt: {
    secret: getEnv('JWT_SECRET', 'change-this-secret'),
    
    expiresIn: getEnv('JWT_EXPIRES_IN', '7d'),
    
    refreshSecret: getEnv('JWT_REFRESH_SECRET', 'change-this-refresh-secret'),
    
    refreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '30d')
  },
  
  security: {
    bcryptRounds: getNumberEnv('BCRYPT_ROUNDS', 10),
    
    rateLimit: {
      windowMs: getNumberEnv('RATE_LIMIT_WINDOW', 900000), // 15 dakika
      
      max: getNumberEnv('RATE_LIMIT_MAX', 100)
    }
  },
  

  features: {

    enableApiDocs: getBooleanEnv('ENABLE_API_DOCS', true),

    enableSwagger: getBooleanEnv('ENABLE_SWAGGER', true)
  },
  

  email: {
    host: getEnv('EMAIL_HOST', 'smtp.gmail.com'),
    port: getNumberEnv('EMAIL_PORT', 587),
    user: getEnv('EMAIL_USER', ''),
    password: getEnv('EMAIL_PASSWORD', ''),
    from: getEnv('EMAIL_FROM', 'noreply@devtracker.com')
  }
};


export function validateConfig(): void {
  console.log(' Validating configuration...');
  
  if (config.app.isProduction) {
    
    if (config.jwt.secret === 'change-this-secret') {
      throw new Error('JWT_SECRET must be changed in production!');
    }
    
    if (config.jwt.refreshSecret === 'change-this-refresh-secret') {
      throw new Error('JWT_REFRESH_SECRET must be changed in production!');
    }
    
    if (config.cors.origin === '*') {
      console.warn(' Warning: CORS_ORIGIN is set to * in production. Consider restricting it.');
    }
  }
  
  console.log('✅ Configuration validated');
}



export function printConfig(): void {
  if (!config.app.isDevelopment) {
    return;
  }
  console.log('\n📋 Configuration:');
  console.log('─────────────────────────────────────');
  console.log(`Environment: ${config.app.env}`);
  console.log(`App Name: ${config.app.name}`);
  console.log(`Version: ${config.app.version}`);
  console.log(`Port: ${config.server.port}`);
  console.log(`Host: ${config.server.host}`);
  console.log(`API Prefix: ${config.server.apiPrefix}`);
  console.log(`Database: ${config.database.path}`);
  console.log(`Log Level: ${config.logging.level}`);
  console.log(`CORS Origin: ${config.cors.origin}`);
  console.log('─────────────────────────────────────\n');
}

export default config;