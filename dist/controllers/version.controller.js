"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionController = void 0;
const version_manager_1 = require("../versioning/version-manager");
class VersionController {
    static getVersionInfo(_req, res) {
        const versions = version_manager_1.VersionManager.getSupportedVersions();
        const latest = version_manager_1.VersionManager.getLatestVersion();
        res.json({
            success: true,
            data: {
                supportedVersions: versions,
                latestVersion: latest,
                deprecationPolicy: {
                    notice: "Deprecated versions will be supported for 6 months after deprecation",
                    sunsetPolicy: "APIs will be sunset 12 months after deprecation"
                }
            }
        });
    }
    static getVersionStatus(req, res) {
        const version = req.params.version;
        const versionInfo = version_manager_1.VersionManager.getSupportedVersions().find(v => v.version === version);
        if (!versionInfo) {
            return res.status(404).json({
                success: false,
                error: 'Version not found'
            });
        }
        res.json({
            success: true,
            data: {
                version: versionInfo.version,
                deprecated: versionInfo.deprecated || false,
                deprecationDate: versionInfo.deprecationDate,
                sunsetDate: versionInfo.sunsetDate,
                status: versionInfo.deprecated ? 'deprecated' : 'active'
            }
        });
    }
}
exports.VersionController = VersionController;
//# sourceMappingURL=version.controller.js.map