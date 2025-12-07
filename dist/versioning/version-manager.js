"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionMiddleware = exports.VersionManager = void 0;
class VersionManager {
    static getSupportedVersions() {
        return this.supportedVersions;
    }
    static isVersionSupported(version) {
        return this.supportedVersions.some(v => v.version === version);
    }
    static getLatestVersion() {
        return this.supportedVersions[this.supportedVersions.length - 1].version;
    }
    static deprecateVersion(version, deprecationDate, sunsetDate) {
        const versionInfo = this.supportedVersions.find(v => v.version === version);
        if (versionInfo) {
            versionInfo.deprecated = true;
            versionInfo.deprecationDate = deprecationDate;
            versionInfo.sunsetDate = sunsetDate;
        }
    }
}
exports.VersionManager = VersionManager;
VersionManager.supportedVersions = [
    { version: 'v1', deprecated: false },
    { version: 'v2', deprecated: false }
];
const versionMiddleware = (req, res, next) => {
    let version = req.path.match(/\/v(\d+)\//)?.[0]?.replace(/\//g, '') ||
        req.headers['api-version'] ||
        VersionManager.getLatestVersion();
    if (!VersionManager.isVersionSupported(version)) {
        return res.status(400).json({
            error: 'Unsupported API version',
            supportedVersions: VersionManager.getSupportedVersions().map(v => v.version)
        });
    }
    req.apiVersion = version;
    const versionInfo = VersionManager.getSupportedVersions().find(v => v.version === version);
    if (versionInfo?.deprecated) {
        res.set('Deprecation', versionInfo.deprecationDate?.toISOString() || 'true');
        if (versionInfo.sunsetDate) {
            res.set('Sunset', versionInfo.sunsetDate.toISOString());
        }
    }
    next();
};
exports.versionMiddleware = versionMiddleware;
//# sourceMappingURL=version-manager.js.map