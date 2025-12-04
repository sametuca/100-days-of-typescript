import { Request, Response } from 'express';
import { VersionManager } from '../versioning/version-manager';

export class VersionController {
  static getVersionInfo(_req: Request, res: Response): void {
    const versions = VersionManager.getSupportedVersions();
    const latest = VersionManager.getLatestVersion();
    
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

  static getVersionStatus(req: Request, res: Response): void {
    const version = req.params.version;
    const versionInfo = VersionManager.getSupportedVersions().find(v => v.version === version);
    
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