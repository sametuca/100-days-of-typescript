# Day 49: API Gateway & Request Routing

## 📋 Genel Bakış

49. günde, basit API Gateway'i gelişmiş bir gateway sistemine dönüştürdük. Sistem load balancing, circuit breaker pattern, retry logic ve comprehensive monitoring özellikleri içeriyor.

## 🚀 Özellikler

### API Gateway Core

- **Intelligent Routing**: Path-based routing to microservices
- **Load Balancing**: Multiple algorithms (Round Robin, Least Connections, Random)
- **Circuit Breaker**: Prevent cascading failures with automatic recovery
- **Retry Logic**: Exponential backoff with jitter
- **Health Aggregation**: Unified health status across all services
- **Metrics Tracking**: Comprehensive gateway performance metrics

### Load Balancing Algorithms

#### Round Robin
- Distributes requests evenly across service instances
- Simple and fair distribution
- Best for homogeneous service instances

#### Least Connections
- Routes to the instance with fewest active connections
- Optimal for varying request processing times
- Better resource utilization

#### Random
- Random selection among healthy instances
- Simple and stateless
- Good for testing and development

### Circuit Breaker Pattern

**States**:
- **CLOSED**: Normal operation, requests flow through
- **OPEN**: Too many failures, requests blocked
- **HALF_OPEN**: Testing if service recovered

**Configuration**:
```typescript
{
  failureThreshold: 5,      // Failures before opening
  resetTimeout: 30000,      // Time before testing (ms)
  halfOpenRequests: 3       // Test requests in half-open
}
```

### Retry Logic

- **Exponential Backoff**: Increasing delays between retries
- **Configurable Attempts**: Set max retry attempts
- **Status Code Filtering**: Retry only specific HTTP errors
- **Jitter**: Prevent thundering herd

## 🔧 API Endpoints

### Gateway Management (Admin Only)

```
GET    /api/gateway-admin/routes                          - List all routes
GET    /api/gateway-admin/health                          - Gateway health
GET    /api/gateway-admin/metrics                         - Gateway metrics
GET    /api/gateway-admin/circuit-breakers                - Circuit breaker status
POST   /api/gateway-admin/circuit-breakers/:service/reset - Reset circuit breaker
POST   /api/gateway-admin/circuit-breakers/reset-all      - Reset all breakers
GET    /api/gateway-admin/load-balancers                  - Load balancer stats
POST   /api/gateway-admin/load-balancers/:service/:algo/reset - Reset load balancer
POST   /api/gateway-admin/load-balancers/reset-all        - Reset all balancers
```

## 📊 Kullanım Örnekleri

### Get Gateway Health

```bash
curl http://localhost:3000/api/gateway-admin/health \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": [
      {
        "name": "user-service",
        "status": "up",
        "instances": 3,
        "healthyInstances": 3
      }
    ],
    "circuitBreakers": {
      "user-service": "CLOSED",
      "task-service": "CLOSED"
    },
    "uptime": 3600
  }
}
```

### Get Circuit Breaker Status

```bash
curl http://localhost:3000/api/gateway-admin/circuit-breakers \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user-service": {
      "state": "CLOSED",
      "failureCount": 0,
      "successCount": 1250,
      "totalRequests": 1250,
      "failureRate": 0
    }
  }
}
```

### Get Load Balancer Statistics

```bash
curl http://localhost:3000/api/gateway-admin/load-balancers \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user-service:round-robin": {
      "algorithm": "round-robin",
      "totalRequests": 1500,
      "serviceInstances": [
        {
          "serviceId": "user-1",
          "host": "localhost",
          "port": 3001,
          "requestCount": 500,
          "activeConnections": 5,
          "averageResponseTime": 45,
          "healthy": true
        }
      ]
    }
  }
}
```

### Reset Circuit Breaker

```bash
curl -X POST http://localhost:3000/api/gateway-admin/circuit-breakers/user-service/reset \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Client Requests                 │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         API Gateway Service             │
│  ┌────────────────────────────────────┐ │
│  │   Route Matching                   │ │
│  └────────────┬───────────────────────┘ │
│               │                          │
│  ┌────────────▼───────────────────────┐ │
│  │   Load Balancer                    │ │
│  │   - Round Robin                    │ │
│  │   - Least Connections              │ │
│  │   - Random                         │ │
│  └────────────┬───────────────────────┘ │
│               │                          │
│  ┌────────────▼───────────────────────┐ │
│  │   Circuit Breaker                  │ │
│  │   - CLOSED / OPEN / HALF_OPEN      │ │
│  └────────────┬───────────────────────┘ │
│               │                          │
│  ┌────────────▼───────────────────────┐ │
│  │   Retry Logic                      │ │
│  │   - Exponential Backoff            │ │
│  └────────────┬───────────────────────┘ │
└───────────────┼─────────────────────────┘
                │
    ┌───────────┼───────────┐
    │           │           │
┌───▼───┐   ┌───▼───┐   ┌───▼───┐
│ User  │   │ Task  │   │ Notif │
│Service│   │Service│   │Service│
└───────┘   └───────┘   └───────┘
```

## 📁 Dosya Yapısı

```
src/
├── types/
│   └── gateway.types.ts              # Gateway type definitions
├── services/
│   ├── gateway.service.ts            # Main gateway service
│   ├── circuit-breaker.service.ts    # Circuit breaker implementation
│   └── load-balancer.service.ts      # Load balancer algorithms
├── controllers/
│   └── gateway.controller.ts         # Gateway management endpoints
└── routes/
    └── gateway.routes.ts             # Gateway API routes
```

## ⚙️ Configuration

### Default Route Configuration

```typescript
{
  path: '/users/*',
  service: 'user-service',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  loadBalancer: { algorithm: 'round-robin' },
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 30000,
    halfOpenRequests: 3
  },
  retry: {
    maxAttempts: 3,
    initialDelay: 100,
    maxDelay: 2000,
    backoffMultiplier: 2
  },
  timeout: 5000
}
```

## 🎯 Performance Benefits

### Circuit Breaker
- **Fail Fast**: Immediate error response when service is down
- **Automatic Recovery**: Self-healing when service recovers
- **Prevent Cascading**: Stops failures from spreading

### Load Balancing
- **Better Distribution**: Even load across instances
- **Higher Throughput**: Utilize all available resources
- **Fault Tolerance**: Automatic failover to healthy instances

### Retry Logic
- **Transient Failures**: Automatically recover from temporary issues
- **Exponential Backoff**: Prevent overwhelming failing services
- **Configurable**: Fine-tune for different scenarios

## 📈 Metrics

Gateway tracks comprehensive metrics:

- **Total Requests**: All requests processed
- **Success/Failure Rate**: Request outcome statistics
- **Average Response Time**: Performance tracking
- **Requests Per Second**: Throughput measurement
- **Circuit Breaker Trips**: Failure detection count
- **Retry Attempts**: Retry logic usage

## 🔒 Security

- **Admin-Only Access**: Gateway management requires admin role
- **JWT Authentication**: Secure token-based auth
- **Service Isolation**: Circuit breakers prevent cascading failures
- **Request Validation**: Input validation before routing

## 🚨 Monitoring & Alerts

### Circuit Breaker States

Monitor circuit breaker states to detect service issues:
- **OPEN**: Service is failing, investigate immediately
- **HALF_OPEN**: Service recovering, monitor closely
- **CLOSED**: Normal operation

### Load Balancer Health

Track instance health and distribution:
- Uneven distribution may indicate issues
- High active connections suggest overload
- Response time spikes indicate performance problems

## 📝 Best Practices

1. **Configure Thresholds**: Set appropriate failure thresholds for each service
2. **Monitor Metrics**: Regularly check gateway health and metrics
3. **Test Failover**: Verify circuit breaker and retry logic work correctly
4. **Tune Timeouts**: Adjust timeouts based on service characteristics
5. **Load Test**: Verify load balancing distributes requests evenly

## 🔍 Troubleshooting

### Circuit Breaker Always Open
- Check service health
- Review failure threshold settings
- Verify network connectivity

### Uneven Load Distribution
- Verify all instances are healthy
- Check load balancer algorithm selection
- Review instance response times

### High Retry Rate
- Investigate root cause of failures
- Adjust retry configuration
- Consider increasing timeout values

## 🎓 Öğrenilenler

- API Gateway patterns ve best practices
- Circuit Breaker pattern implementation
- Load balancing algorithms (Round Robin, Least Connections)
- Retry logic with exponential backoff
- Service health monitoring ve aggregation
- Microservices resilience patterns
