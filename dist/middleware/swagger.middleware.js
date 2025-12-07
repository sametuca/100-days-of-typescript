"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_config_1 = require("../config/swagger.config");
function setupSwagger(app) {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_config_1.swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'DevTracker API Documentation',
        customfavIcon: '/favicon.ico',
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
            syntaxHighlight: {
                activate: true,
                theme: 'monokai',
            },
        },
    }));
    app.get('/api-docs/openapi.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swagger_config_1.swaggerSpec);
    });
    console.log('📚 Swagger UI available at: /api-docs');
    console.log('📄 OpenAPI spec available at: /api-docs/openapi.json');
}
//# sourceMappingURL=swagger.middleware.js.map