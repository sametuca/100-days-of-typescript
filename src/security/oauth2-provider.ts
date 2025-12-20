import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

export interface OAuth2Config {
  issuer: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  publicKey: string;
  privateKey: string;
  accessTokenTTL: number;
  refreshTokenTTL: number;
}

interface AuthCodeData {
  clientId: string;
  userId: string;
  scope: string[];
  redirectUri: string;
  expiresAt: number;
  used: boolean;
}

interface RefreshTokenData {
  userId: string;
  scope: string[];
  expiresAt: number;
  used: boolean;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface TokenPayload {
  sub: string;
  scope: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
}

export class OAuth2Provider {
  private authCodes: Map<string, AuthCodeData> = new Map();
  private refreshTokens: Map<string, RefreshTokenData> = new Map();

  constructor(private config: OAuth2Config) {}

  generateAuthorizationCode(
    clientId: string,
    userId: string,
    scope: string[],
    redirectUri: string
  ): string {
    const code = crypto.randomBytes(32).toString('hex');
    
    this.authCodes.set(code, {
      clientId,
      userId,
      scope,
      redirectUri,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      used: false
    });

    return code;
  }

  async exchangeCodeForToken(
    code: string,
    clientId: string,
    redirectUri: string
  ): Promise<TokenResponse | null> {
    const authCode = this.authCodes.get(code);

    if (!authCode) return null;
    if (authCode.used) return null;
    if (authCode.expiresAt < Date.now()) return null;
    if (authCode.clientId !== clientId) return null;
    if (authCode.redirectUri !== redirectUri) return null;

    // Mark as used
    authCode.used = true;

    // Generate tokens
    const accessToken = this.generateAccessToken(authCode.userId, authCode.scope);
    const refreshToken = this.generateRefreshToken(authCode.userId, authCode.scope);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: this.config.accessTokenTTL,
      scope: authCode.scope.join(' ')
    };
  }

  generateAccessToken(userId: string, scope: string[]): string {
    const payload = {
      sub: userId,
      scope: scope.join(' '),
      iss: this.config.issuer,
      aud: 'api',
      exp: Math.floor(Date.now() / 1000) + this.config.accessTokenTTL,
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, this.config.privateKey, { algorithm: 'RS256' });
  }

  generateRefreshToken(userId: string, scope: string[]): string {
    const token = crypto.randomBytes(32).toString('hex');
    
    this.refreshTokens.set(token, {
      userId,
      scope,
      expiresAt: Date.now() + this.config.refreshTokenTTL * 1000,
      used: false
    });

    return token;
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenResponse | null> {
    const tokenData = this.refreshTokens.get(refreshToken);

    if (!tokenData) return null;
    if (tokenData.used) return null;
    if (tokenData.expiresAt < Date.now()) return null;

    // Rotate refresh token
    tokenData.used = true;
    const newRefreshToken = this.generateRefreshToken(tokenData.userId, tokenData.scope);

    const accessToken = this.generateAccessToken(tokenData.userId, tokenData.scope);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
      token_type: 'Bearer',
      expires_in: this.config.accessTokenTTL,
      scope: tokenData.scope.join(' ')
    };
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const payload = jwt.verify(token, this.config.publicKey, {
        algorithms: ['RS256'],
        issuer: this.config.issuer
      });

      return payload as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  revokeRefreshToken(token: string): boolean {
    const tokenData = this.refreshTokens.get(token);
    if (!tokenData) return false;
    
    tokenData.used = true;
    return true;
  }
}
