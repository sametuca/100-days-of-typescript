"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentTracker = void 0;
class DeploymentTracker {
    static getDeploymentInfo() {
        return {
            version: process.env.npm_package_version || '1.0.0',
            buildTime: process.env.BUILD_TIME || new Date().toISOString(),
            gitCommit: process.env.GIT_COMMIT || 'unknown',
            environment: process.env.NODE_ENV || 'development',
            deployedAt: process.env.DEPLOYED_AT || new Date().toISOString()
        };
    }
    static logDeployment() {
        const info = this.getDeploymentInfo();
        console.log('🚀 Deployment Info:');
        console.log(`   Version: ${info.version}`);
        console.log(`   Environment: ${info.environment}`);
        console.log(`   Git Commit: ${info.gitCommit}`);
        console.log(`   Build Time: ${info.buildTime}`);
        console.log(`   Deployed At: ${info.deployedAt}`);
    }
}
exports.DeploymentTracker = DeploymentTracker;
//# sourceMappingURL=deployment-info.js.map