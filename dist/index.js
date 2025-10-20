"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Application {
    constructor(config) {
        this.config = config;
    }
    start() {
        console.log('🚀 Starting DevTracker...');
        console.log('📦 App: ' + this.config.name);
        console.log('📌 Version: ' + this.config.version);
        console.log('🌍 Environment: ' + this.config.environment);
        console.log('🔌 Port: ' + this.config.port);
        console.log('✅ Application initialized successfully!\n');
    }
    getConfig() {
        return { ...this.config };
    }
}
const config = {
    name: 'DevTracker',
    version: '1.0.0',
    port: 3000,
    environment: 'development'
};
const app = new Application(config);
app.start();
exports.default = app;
//# sourceMappingURL=index.js.map