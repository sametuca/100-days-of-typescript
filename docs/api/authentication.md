# Authentication Guide

DevTracker API uses JWT (JSON Web Tokens) for authentication. This guide explains how to authenticate and manage your API access.

## Authentication Methods

### 1. JWT Bearer Token (Recommended)

The primary authentication method for user requests.

**Header Format:**
```
Authorization: Bearer <your_jwt_token>
```

**Example:**
```bash
curl -X GET https://api.devtracker.com/api/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. API Key

For service-to-service communication and automation.

**Header Format:**
```
X-API-Key: <your_api_key>
```

**Example:**
```bash
curl -X GET https://api.devtracker.com/api/tasks \
  -H "X-API-Key: dt_live_abc123xyz789"
```

## Getting Started

### 1. Register an Account

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "username": "johndoe",
      "name": "John Doe",
      "role": "developer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

### 3. Verify Token

```bash
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "role": "developer",
    "organizationId": "org-uuid"
  }
}
```

## Token Management

### Token Lifetime

- Access tokens expire after **7 days**
- Refresh tokens expire after **30 days**

### Token Refresh

```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "new_access_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": "7d"
  }
}
```

### Logout

```bash
POST /api/auth/logout
Authorization: Bearer <token>
```

## Security Best Practices

### 1. Store Tokens Securely

- ✅ Store in httpOnly cookies (web)
- ✅ Use secure storage (mobile apps)
- ❌ Never store in localStorage
- ❌ Never commit tokens to version control

### 2. Token Rotation

Implement token rotation for long-running applications:

```typescript
async function refreshAccessToken() {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: storedRefreshToken })
  });
  
  const { token, refreshToken } = await response.json();
  // Update stored tokens
  storeTokens(token, refreshToken);
}
```

### 3. Handle Token Expiration

```typescript
async function apiCall(url: string, options: RequestInit) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (response.status === 401) {
    // Token expired, refresh it
    await refreshAccessToken();
    
    // Retry request with new token
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${newAccessToken}`
      }
    });
  }
  
  return response;
}
```

## API Keys

### Creating API Keys

```bash
POST /api/auth/api-keys
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Production Server",
  "scopes": ["tasks:read", "tasks:write"],
  "expiresIn": "never"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "key-id",
    "key": "dt_live_abc123xyz789",
    "name": "Production Server",
    "scopes": ["tasks:read", "tasks:write"],
    "createdAt": "2025-12-02T10:00:00Z"
  }
}
```

### Using API Keys

```bash
curl -X GET https://api.devtracker.com/api/tasks \
  -H "X-API-Key: dt_live_abc123xyz789"
```

### Managing API Keys

**List API Keys:**
```bash
GET /api/auth/api-keys
Authorization: Bearer <token>
```

**Revoke API Key:**
```bash
DELETE /api/auth/api-keys/:keyId
Authorization: Bearer <token>
```

## Rate Limiting

Authentication affects rate limiting:

- **Unauthenticated**: 100 requests / 15 minutes
- **Authenticated (JWT)**: 1000 requests / 15 minutes
- **API Key**: Custom limits based on plan

## Error Responses

### 401 Unauthorized

```json
{
  "status": "error",
  "message": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

**Common Causes:**
- Missing Authorization header
- Invalid token
- Expired token

### 403 Forbidden

```json
{
  "status": "error",
  "message": "Insufficient permissions",
  "code": "FORBIDDEN"
}
```

**Common Causes:**
- Insufficient role/permissions
- API key lacks required scopes
- Organization access denied

## OAuth 2.0 (Coming Soon)

Future support for OAuth 2.0 providers:
- Google
- GitHub
- Microsoft
- Custom SAML/SSO

## Support

For authentication issues:
- Check [API Status](https://status.devtracker.com)
- Review [Common Issues](./troubleshooting.md)
- Contact support@devtracker.com
