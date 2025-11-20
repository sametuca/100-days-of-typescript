"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const logger_1 = __importDefault(require("./utils/logger"));
const server_1 = require("./config/server");
const init_1 = require("./database/init");
const error_middleware_1 = require("./middleware/error.middleware");
const env_1 = __importStar(require("./config/env"));
const helmet_1 = __importDefault(require("helmet"));
const rate_limit_middleware_1 = require("./middleware/rate-limit.middleware");
const security_middleware_1 = require("./middleware/security.middleware");
const request_id_middleware_1 = require("./middleware/request-id.middleware");
const path_1 = __importDefault(require("path"));
const jobs_1 = require("./jobs");
const swagger_1 = require("./config/swagger");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
(0, env_1.validateConfig)();
(0, env_1.printConfig)();
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = server_1.SERVER_CONFIG.PORT;
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
        this.initializeDatabase();
        (0, jobs_1.initializeJobs)();
    }
    initializeMiddlewares() {
        this.app.use(request_id_middleware_1.requestId);
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", 'data:', 'https:']
                }
            },
            crossOriginEmbedderPolicy: false
        }));
        this.app.use(rate_limit_middleware_1.generalLimiter);
        this.app.use(security_middleware_1.addSecurityHeaders);
        this.app.use(security_middleware_1.sanitizeInput);
        this.app.use(security_middleware_1.preventParameterPollution);
        this.app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', server_1.CORS_CONFIG.origin);
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            if (req.method === 'OPTIONS') {
                return res.sendStatus(200);
            }
            next();
            return undefined;
        });
        this.app.use((req, _res, next) => {
            logger_1.default.info(`[${req.method}] ${req.path}`);
            next();
            return undefined;
        });
    }
    initializeRoutes() {
        this.app.use(server_1.SERVER_CONFIG.API_PREFIX, routes_1.default);
        if (env_1.default.features.enableSwagger) {
            this.app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
                customCss: '.swagger-ui .topbar { display: none }',
                customSiteTitle: 'DevTracker API Documentation'
            }));
            this.app.get('/api-docs.json', (_req, res) => {
                res.setHeader('Content-Type', 'application/json');
                res.send(swagger_1.swaggerSpec);
            });
            logger_1.default.info('📚 Swagger documentation available at /api-docs');
        }
        this.app.use(error_middleware_1.notFoundHandler);
    }
    initializeErrorHandling() {
        this.app.use((err, _req, res, _next) => {
            console.error('Error:', err.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: server_1.SERVER_CONFIG.NODE_ENV === 'development' ? err.message : undefined
            });
        });
    }
    initializeDatabase() {
        (0, init_1.initializeDatabase)();
    }
    listen() {
        this.app.listen(this.port, () => {
            logger_1.default.info('DevTracker Server Started!');
            logger_1.default.info(`Environment: ${server_1.SERVER_CONFIG.NODE_ENV}`);
            logger_1.default.info(`Server: http://${server_1.SERVER_CONFIG.HOST}:${this.port}`);
            logger_1.default.info(`API: http://${server_1.SERVER_CONFIG.HOST}:${this.port}${server_1.SERVER_CONFIG.API_PREFIX}`);
            logger_1.default.info(`Health: http://${server_1.SERVER_CONFIG.HOST}:${this.port}${server_1.SERVER_CONFIG.API_PREFIX}/health`);
        });
    }
}
const app = new App();
app.listen();
exports.default = app;
//# sourceMappingURL=index.js.map