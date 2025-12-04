import { Request, Response, NextFunction } from 'express';

export interface ApiVersion {
  version: string;
  deprecated?: boolean;
  deprecationDate?: Date;
  sunsetDate?: Date;
}

export class VersionManager {
  private static supportedVersions: ApiVersion[] = [
    { version: 'v1', deprecated: false },
    { version: 'v2', deprecated: false }
  ];

  static getSupportedVersions(): ApiVersion[] {
    return this.supportedVersions;
  }

  static isVersionSupported(version: string): boolean {
    return this.supportedVersions.some(v => v.version === version);
  }

  static getLatestVersion(): string {
    return this.supportedVersions[this.supportedVersions.length - 1].version;
  }

  static deprecateVersion(version: string, deprecationDate: Date, sunsetDate: Date): void {
    const versionInfo = this.supportedVersions.find(v => v.version === version);
    if (versionInfo) {
      versionInfo.deprecated = true;
      versionInfo.deprecationDate = deprecationDate;
      versionInfo.sunsetDate = sunsetDate;
    }
  }
}

export const versionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Extract version from URL path (/api/v1/...) or header
  let version = req.path.match(/\/v(\d+)\//)?.[0]?.replace(/\//g, '') || 
                req.headers['api-version'] as string ||
                VersionManager.getLatestVersion();

  if (!VersionManager.isVersionSupported(version)) {
    return res.status(400).json({
      error: 'Unsupported API version',
      supportedVersions: VersionManager.getSupportedVersions().map(v => v.version)
    });
  }

  // Add version info to request
  (req as any).apiVersion = version;

  // Add deprecation headers if needed
  const versionInfo = VersionManager.getSupportedVersions().find(v => v.version === version);
  if (versionInfo?.deprecated) {
    res.set('Deprecation', versionInfo.deprecationDate?.toISOString() || 'true');
    if (versionInfo.sunsetDate) {
      res.set('Sunset', versionInfo.sunsetDate.toISOString());
    }
  }

  next();
};