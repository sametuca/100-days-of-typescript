import * as crypto from 'crypto';

interface APIKeyData {
  hashedKey: string;
  userId: string;
  name: string;
  permissions: string[];
  createdAt: number;
  lastUsedAt: number | null;
  expiresAt: number | null;
  revokedAt: number | null;
}

interface APIKeyInfo {
  key: string;
  name: string;
  permissions: string[];
  createdAt: number;
  lastUsedAt?: number | null;
}

export class APIKeyManager {
  private keys: Map<string, APIKeyData> = new Map();

  generateAPIKey(
    userId: string,
    name: string,
    permissions: string[]
  ): APIKeyInfo {
    const prefix = 'sk_live';
    const randomPart = crypto.randomBytes(24).toString('hex');
    const key = `${prefix}_${randomPart}`;
    const hashedKey = this.hashKey(key);

    const keyData: APIKeyData = {
      hashedKey,
      userId,
      name,
      permissions,
      createdAt: Date.now(),
      lastUsedAt: null,
      expiresAt: null,
      revokedAt: null
    };

    this.keys.set(hashedKey, keyData);

    return {
      key,
      name,
      permissions,
      createdAt: keyData.createdAt
    };
  }

  validateAPIKey(key: string): APIKeyData | null {
    const hashedKey = this.hashKey(key);
    const keyData = this.keys.get(hashedKey);

    if (!keyData) return null;
    if (keyData.revokedAt) return null;
    if (keyData.expiresAt && keyData.expiresAt < Date.now()) return null;

    // Update last used
    keyData.lastUsedAt = Date.now();

    return keyData;
  }

  revokeAPIKey(key: string): boolean {
    const hashedKey = this.hashKey(key);
    const keyData = this.keys.get(hashedKey);

    if (!keyData) return false;

    keyData.revokedAt = Date.now();
    return true;
  }

  listUserKeys(userId: string): APIKeyInfo[] {
    const userKeys: APIKeyInfo[] = [];

    for (const [_, keyData] of this.keys) {
      if (keyData.userId === userId && !keyData.revokedAt) {
        userKeys.push({
          key: '****' + keyData.hashedKey.slice(-8),
          name: keyData.name,
          permissions: keyData.permissions,
          createdAt: keyData.createdAt,
          lastUsedAt: keyData.lastUsedAt
        });
      }
    }

    return userKeys;
  }

  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }
}
