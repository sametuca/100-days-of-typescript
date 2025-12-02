# Getting Started with DevTracker API

## Authentication

All API requests require authentication using JWT tokens.

### 1. Register a new account

```bash
curl -X POST https://api.devtracker.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

### 2. Login and get token

```bash
curl -X POST https://api.devtracker.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

Response:
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

### 3. Use token in requests

Include the token in the `Authorization` header:

```bash
curl -X GET https://api.devtracker.com/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Common Operations

### Create a Task

```bash
curl -X POST https://api.devtracker.com/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement new feature",
    "description": "Add user profile page",
    "status": "todo",
    "priority": "high",
    "tags": ["frontend", "ui"]
  }'
```

### List Tasks with Filters

```bash
curl -X GET "https://api.devtracker.com/api/tasks?status=in_progress&priority=high&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Task Status

```bash
curl -X PUT https://api.devtracker.com/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "done"
  }'
```

### Delete Task

```bash
curl -X DELETE https://api.devtracker.com/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Rate Limiting

API requests are rate limited to:
- 100 requests per 15 minutes per IP for unauthenticated requests
- 1000 requests per 15 minutes per user for authenticated requests

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Total allowed requests
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Timestamp when limit resets

## Error Handling

All errors follow a consistent format:

```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error"
    }
  ]
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_SERVER_ERROR`: Server error

## Pagination

List endpoints support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field and order (e.g., "createdAt:desc")

Example:
```bash
curl "https://api.devtracker.com/api/tasks?page=2&limit=50&sort=dueDate:asc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response includes pagination metadata:
```json
{
  "status": "success",
  "data": {
    "tasks": [...],
    "meta": {
      "total": 150,
      "page": 2,
      "limit": 50,
      "totalPages": 3
    }
  }
}
```

## SDKs and Client Libraries

Official SDKs are available for:

- **TypeScript/JavaScript**: `npm install devtracker-client`
- **Python**: `pip install devtracker-client`
- **Java**: Maven/Gradle (see documentation)

### TypeScript Example

```typescript
import { DevTrackerClient } from 'devtracker-client';

const client = new DevTrackerClient({
  baseURL: 'https://api.devtracker.com',
  token: 'YOUR_TOKEN',
});

// Create a task
const task = await client.tasks.create({
  title: 'New task',
  status: 'todo',
  priority: 'high',
});

// List tasks
const tasks = await client.tasks.list({
  status: 'in_progress',
  page: 1,
  limit: 20,
});

// Update task
await client.tasks.update(task.id, {
  status: 'done',
});

// Delete task
await client.tasks.delete(task.id);
```

### Python Example

```python
from devtracker_client import DevTrackerClient

client = DevTrackerClient(
    base_url='https://api.devtracker.com',
    token='YOUR_TOKEN'
)

# Create a task
task = client.tasks.create(
    title='New task',
    status='todo',
    priority='high'
)

# List tasks
tasks = client.tasks.list(
    status='in_progress',
    page=1,
    limit=20
)

# Update task
client.tasks.update(task.id, status='done')

# Delete task
client.tasks.delete(task.id)
```

## Next Steps

- Explore the [Interactive API Documentation](/api-docs)
- Read the [Authentication Guide](./authentication.md)
- Learn about [Webhooks](./webhooks.md)
- Check out [Rate Limiting](./rate-limiting.md)
- View [API Examples](./examples.md)
