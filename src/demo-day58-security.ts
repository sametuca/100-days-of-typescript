import * as crypto from 'crypto';
import { 
  OAuth2Provider, 
  MFAManager, 
  APIKeyManager, 
  RateLimiter,
  AuditLogger 
} from './security';

async function demonstrateSecurity() {
  console.log('=== Day 58: Advanced Security & OAuth2 Demo ===\n');

  // Generate RSA key pair for OAuth2
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  // 1. OAuth2 Provider
  console.log('1. OAuth2 Authorization Flow');
  console.log('-----------------------------');

  const oauth2 = new OAuth2Provider({
    issuer: 'https://auth.example.com',
    authorizationEndpoint: '/oauth/authorize',
    tokenEndpoint: '/oauth/token',
    publicKey,
    privateKey,
    accessTokenTTL: 3600,
    refreshTokenTTL: 86400
  });

  const authCode = oauth2.generateAuthorizationCode(
    'client_123',
    'user_456',
    ['read', 'write'],
    'https://app.example.com/callback'
  );

  console.log(`✓ Authorization code generated: ${authCode.slice(0, 20)}...`);

  const tokenResponse = await oauth2.exchangeCodeForToken(
    authCode,
    'client_123',
    'https://app.example.com/callback'
  );

  if (tokenResponse) {
    console.log(`✓ Access token issued (expires in ${tokenResponse.expires_in}s)`);
    console.log(`✓ Refresh token issued`);
    console.log(`✓ Scope: ${tokenResponse.scope}`);

    const payload = oauth2.verifyAccessToken(tokenResponse.access_token);
    console.log(`✓ Token verified for user: ${payload?.sub}`);
  }

  console.log();

  // 2. Multi-Factor Authentication
  console.log('2. Multi-Factor Authentication (MFA)');
  console.log('------------------------------------');

  const mfa = new MFAManager();
  const secret = mfa.generateSecret('user@example.com', 'MyApp');

  console.log(`✓ MFA secret generated`);
  console.log(`✓ QR Code: ${secret.qrCode.slice(0, 50)}...`);
  console.log(`✓ Backup codes: ${secret.backupCodes.length} codes generated`);
  console.log(`  Examples: ${secret.backupCodes.slice(0, 2).join(', ')}`);

  // Simulate TOTP generation
  const testToken = '123456';
  const isValid = mfa.verifyTOTP(secret.secret, testToken);
  console.log(`✓ TOTP validation test: ${isValid ? 'Valid' : 'Invalid (expected)'}`);

  // SMS and Email MFA
  const smsCode = await mfa.sendSMSCode('+1234567890');
  console.log(`✓ SMS code sent: ${smsCode}`);

  const emailCode = await mfa.sendEmailCode('user@example.com');
  console.log(`✓ Email code sent: ${emailCode}`);

  console.log();

  // 3. API Key Management
  console.log('3. API Key Management');
  console.log('---------------------');

  const apiKeyManager = new APIKeyManager();
  
  const apiKey1 = apiKeyManager.generateAPIKey(
    'user_123',
    'Production API Key',
    ['users:read', 'users:write', 'tasks:read']
  );

  console.log(`✓ API key created: ${apiKey1.key.slice(0, 30)}...`);
  console.log(`✓ Permissions: ${apiKey1.permissions.join(', ')}`);

  const validation = apiKeyManager.validateAPIKey(apiKey1.key);
  console.log(`✓ Key validation: ${validation ? 'Valid' : 'Invalid'}`);
  console.log(`✓ User ID: ${validation?.userId}`);

  apiKeyManager.generateAPIKey(
    'user_123',
    'Development API Key',
    ['users:read', 'tasks:read']
  );

  console.log(`✓ Second API key created for same user`);

  const userKeys = apiKeyManager.listUserKeys('user_123');
  console.log(`✓ User has ${userKeys.length} active API keys`);

  console.log();

  // 4. Rate Limiting
  console.log('4. Rate Limiting');
  console.log('----------------');

  const rateLimiter = new RateLimiter();

  for (let i = 1; i <= 5; i++) {
    const result = await rateLimiter.checkLimit('user_123', 3, 60000);
    console.log(`Request ${i}: ${result.allowed ? '✓ Allowed' : '✗ Blocked'} (${result.remaining} remaining)`);
    
    if (!result.allowed) {
      console.log(`  Retry after: ${Math.ceil(result.retryAfter / 1000)}s`);
    }
  }

  console.log();

  // 5. Audit Logging
  console.log('5. Audit Logging');
  console.log('----------------');

  const auditLogger = new AuditLogger();

  auditLogger.logAuthentication('user_123', true, '192.168.1.1');
  console.log('✓ Login event logged');

  auditLogger.logAPICall('user_123', '/api/users', 'GET', 200);
  console.log('✓ API call logged');

  auditLogger.logDataAccess('user_123', 'sensitive_data', 'read');
  console.log('✓ Data access logged');

  auditLogger.logSecurityEvent('suspicious_activity', 'high', {
    reason: 'Multiple failed login attempts',
    ip: '192.168.1.100'
  });
  console.log('✓ Security event logged');

  const logs = auditLogger.queryLogs({ userId: 'user_123' });
  console.log(`✓ Found ${logs.length} audit logs for user`);

  console.log();

  // Summary
  console.log('Security Summary');
  console.log('================');
  console.log('✅ OAuth2 Provider: Authorization & Token Management');
  console.log('✅ MFA: TOTP, SMS, Email verification');
  console.log('✅ API Keys: Generation, Validation, Management');
  console.log('✅ Rate Limiting: Request throttling & protection');
  console.log('✅ Audit Logging: Comprehensive security tracking');
}

demonstrateSecurity().catch(console.error);
