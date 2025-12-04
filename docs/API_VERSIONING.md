# API Versioning Guide

## Overview
DevTracker API supports multiple versions to ensure backward compatibility while allowing for new features and improvements.

## Supported Versions

### V1 (Legacy)
- **Status**: Active
- **Base URL**: `/api/v1/`
- **Format**: Simple response format
- **Deprecation**: Not deprecated

### V2 (Current)
- **Status**: Active  
- **Base URL**: `/api/v2/`
- **Format**: Enhanced response with metadata
- **Features**: Improved error handling, request tracking

## Version Selection

### URL Path (Recommended)
```
GET /api/v1/tasks
GET /api/v2/tasks
```

### Header-based
```
GET /api/tasks
API-Version: v2
```

## Response Formats

### V1 Format
```json
{
  "success": true,
  "tasks": [...],
  "total": 10
}
```

### V2 Format
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 20
  },
  "meta": {
    "version": "v2",
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req-123"
  }
}
```

## Deprecation Policy

- **Notice Period**: 6 months advance notice
- **Support Period**: 6 months after deprecation
- **Sunset**: 12 months after deprecation

## Headers

### Deprecation Headers
```
Deprecation: true
Sunset: 2024-12-31T23:59:59Z
```

## Migration Guide

### V1 to V2
1. Update base URL from `/v1/` to `/v2/`
2. Update response parsing to handle new format
3. Use `data` field instead of direct properties
4. Handle enhanced error format