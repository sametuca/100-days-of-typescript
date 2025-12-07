"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceDiscovery = exports.apiGateway = exports.serviceClient = exports.serviceRegistry = exports.MicroserviceManager = void 0;
const service_registry_1 = require("./service-registry");
const env_1 = __importDefault(require("../config/env"));
const logger_1 = __importDefault(require("../utils/logger"));
class MicroserviceManager {
    static init() {
        service_registry_1.serviceRegistry.register({
            id: 'main-api-gateway',
            name: 'api-gateway',
            host: 'localhost',
            port: parseInt(env_1.default.server.port),
            health: 'healthy',
            metadata: {
                version: '1.0.0',
                type: 'gateway'
            }
        });
        logger_1.default.info('🔧 Microservice architecture initialized');
    }
    static registerService(id, name, host, port, metadata) {
        service_registry_1.serviceRegistry.register({
            id,
            name,
            host,
            port,
            health: 'healthy',
            metadata
        });
    }
}
exports.MicroserviceManager = MicroserviceManager;
var service_registry_2 = require("./service-registry");
Object.defineProperty(exports, "serviceRegistry", { enumerable: true, get: function () { return service_registry_2.serviceRegistry; } });
var service_client_1 = require("./service-client");
Object.defineProperty(exports, "serviceClient", { enumerable: true, get: function () { return service_client_1.serviceClient; } });
var api_gateway_1 = require("./api-gateway");
Object.defineProperty(exports, "apiGateway", { enumerable: true, get: function () { return __importDefault(api_gateway_1).default; } });
var service_discovery_1 = require("./service-discovery");
Object.defineProperty(exports, "serviceDiscovery", { enumerable: true, get: function () { return __importDefault(service_discovery_1).default; } });
//# sourceMappingURL=index.js.map