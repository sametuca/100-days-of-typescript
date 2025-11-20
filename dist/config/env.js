"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.validateConfig = validateConfig;
exports.printConfig = printConfig;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getEnv(key, defaultValue) {
    const value = process.env[key];
    if (value === undefined) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error(`Environment variable ${key} is not defined`);
    }
    return value;
}
function getNumberEnv(key, defaultValue) {
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
function getBooleanEnv(key, defaultValue) {
    const value = process.env[key];
    if (value === undefined) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error(`Environment variable ${key} is not defined`);
    }
    return value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes';
}
exports.config = {
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
        verbose: getBooleanEnv('DB_VERBOSE', false)
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
            windowMs: getNumberEnv('RATE_LIMIT_WINDOW', 900000),
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
function validateConfig() {
    console.log(' Validating configuration...');
    if (exports.config.app.isProduction) {
        if (exports.config.jwt.secret === 'change-this-secret') {
            throw new Error('JWT_SECRET must be changed in production!');
        }
        if (exports.config.jwt.refreshSecret === 'change-this-refresh-secret') {
            throw new Error('JWT_REFRESH_SECRET must be changed in production!');
        }
        if (exports.config.cors.origin === '*') {
            console.warn(' Warning: CORS_ORIGIN is set to * in production. Consider restricting it.');
        }
    }
    console.log('✅ Configuration validated');
}
function printConfig() {
    if (!exports.config.app.isDevelopment) {
        return;
    }
    console.log('\n📋 Configuration:');
    console.log('─────────────────────────────────────');
    console.log(`Environment: ${exports.config.app.env}`);
    console.log(`App Name: ${exports.config.app.name}`);
    console.log(`Version: ${exports.config.app.version}`);
    console.log(`Port: ${exports.config.server.port}`);
    console.log(`Host: ${exports.config.server.host}`);
    console.log(`API Prefix: ${exports.config.server.apiPrefix}`);
    console.log(`Database: ${exports.config.database.path}`);
    console.log(`Log Level: ${exports.config.logging.level}`);
    console.log(`CORS Origin: ${exports.config.cors.origin}`);
    console.log('─────────────────────────────────────\n');
}
exports.default = exports.config;
//# sourceMappingURL=env.js.map