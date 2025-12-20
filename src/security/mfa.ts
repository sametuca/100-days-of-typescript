import * as crypto from 'crypto';

interface MFASecret {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export class MFAManager {
  generateSecret(userId: string, appName: string): MFASecret {
    const secret = this.generateBase32Secret(32);
    const qrCode = `otpauth://totp/${appName}:${userId}?secret=${secret}&issuer=${appName}`;

    return {
      secret,
      qrCode,
      backupCodes: this.generateBackupCodes()
    };
  }

  verifyTOTP(secret: string, token: string, window: number = 2): boolean {
    const currentTime = Math.floor(Date.now() / 1000 / 30);

    for (let i = -window; i <= window; i++) {
      const testToken = this.generateTOTP(secret, currentTime + i);
      if (testToken === token) {
        return true;
      }
    }

    return false;
  }

  private generateTOTP(secret: string, timeStep: number): string {
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(timeStep));

    const decodedSecret = this.base32Decode(secret);
    const hmac = crypto.createHmac('sha1', decodedSecret);
    hmac.update(buffer);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0x0f;
    const code = (
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff)
    ) % 1000000;

    return code.toString().padStart(6, '0');
  }

  private generateBase32Secret(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < length; i++) {
      secret += chars[crypto.randomInt(0, chars.length)];
    }
    return secret;
  }

  private base32Decode(secret: string): Buffer {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    
    for (const char of secret.toUpperCase()) {
      const index = chars.indexOf(char);
      if (index === -1) continue;
      bits += index.toString(2).padStart(5, '0');
    }

    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.slice(i, i + 8), 2));
    }

    return Buffer.from(bytes);
  }

  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
  }

  async sendSMSCode(phoneNumber: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`SMS Code for ${phoneNumber}: ${code}`);
    return code;
  }

  async sendEmailCode(email: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Email Code for ${email}: ${code}`);
    return code;
  }
}
