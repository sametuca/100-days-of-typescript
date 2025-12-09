# Microservices Setup Guide

## Prerequisites

1. **Consul** - Service Discovery
```bash
# Download and install Consul
# https://www.consul.io/downloads

# Run Consul in development mode
consul agent -dev
```

2. **Jaeger** - Distributed Tracing
```bash
# Run Jaeger with Docker
docker run -d --name jaeger \
  -p 5775:5775/udp \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 14268:14268 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

## Installation

```bash
# Install all dependencies
npm install

# Install gRPC dependencies
npm install @grpc/grpc-js @grpc/proto-loader

# Install service discovery
npm install consul uuid
npm install --save-dev @types/consul

# Install tracing
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
npm install @opentelemetry/exporter-jaeger @opentelemetry/resources
npm install @opentelemetry/semantic-conventions @opentelemetry/sdk-trace-base
npm install @opentelemetry/api

# Install API Gateway dependencies
npm install http-proxy-middleware rate-limiter-flexible
```

## Running Services

### 1. Start the Task Service (gRPC)
```bash
# Terminal 1
npm run dev:grpc

# Or with custom port
PORT=3001 GRPC_PORT=50051 npm run dev:grpc
```

### 2. Start the API Gateway
```bash
# Terminal 2
npm run dev:gateway

# Or with custom port
GATEWAY_PORT=8080 npm run dev:gateway
```

## Environment Variables

Create a `.env` file:

```env
# Service Configuration
SERVICE_NAME=task-service
SERVICE_HOST=localhost
PORT=3000
GRPC_PORT=50051

# Gateway Configuration
GATEWAY_PORT=8080

# Consul Configuration
CONSUL_HOST=localhost
CONSUL_PORT=8500

# Jaeger Configuration
JAEGER_ENDPOINT=http://localhost:14268/api/traces

# Database
DATABASE_URL=./data/tasks.db
```

## Testing gRPC Services

### Using the gRPC Client
```typescript
import { TaskGrpcClient } from './src/grpc/clients/task-grpc.client';

const client = new TaskGrpcClient('localhost:50051');

// Create task
const task = await client.createTask({
  title: 'Implement feature',
  description: 'Add new functionality',
  priority: 'high',
  status: 'todo',
  user_id: 1
});

console.log('Created task:', task);
```

### Using cURL via API Gateway
```bash
# Create task through gateway
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Task",
    "description": "Testing gateway",
    "priority": "high",
    "status": "todo"
  }'

# Get gateway metrics
curl http://localhost:8080/metrics
```

## Monitoring

### Consul UI
Open http://localhost:8500/ui to see registered services

### Jaeger UI
Open http://localhost:16686 to view distributed traces

### Service Health
```bash
# Check gateway health
curl http://localhost:8080/health

# Check service health
curl http://localhost:3000/health
```

## Circuit Breaker Usage

```typescript
import { ResilientServiceClient } from './src/patterns/circuit-breaker';

const client = new ResilientServiceClient('http://localhost:3000');

try {
  const data = await client.makeRequest('/api/tasks/1');
  console.log('Success:', data);
} catch (error) {
  console.error('Failed:', error.message);
}

// Check circuit state
console.log('Circuit state:', client.getCircuitState());
console.log('Metrics:', client.getMetrics());
```

## Testing

```bash
# Run all tests
npm test

# Run gRPC tests
npm test __tests__/grpc

# Run with coverage
npm run test:coverage
```

## Troubleshooting

### Consul not connecting
- Ensure Consul is running: `consul agent -dev`
- Check Consul UI at http://localhost:8500

### gRPC connection issues
- Verify gRPC server is running
- Check firewall settings for port 50051
- Ensure proto files are correctly compiled

### Tracing not working
- Verify Jaeger is running
- Check Jaeger endpoint in environment variables
- View traces at http://localhost:16686

### Circuit breaker opening frequently
- Check service health
- Review failure threshold configuration
- Monitor service logs for errors

## Production Deployment

### Docker Compose
```yaml
version: '3.8'

services:
  consul:
    image: consul:latest
    ports:
      - "8500:8500"
    command: agent -dev -client=0.0.0.0

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "14268:14268"

  task-service:
    build: .
    environment:
      - SERVICE_NAME=task-service
      - GRPC_PORT=50051
      - CONSUL_HOST=consul
    depends_on:
      - consul
      - jaeger

  api-gateway:
    build: .
    command: npm run start:gateway
    ports:
      - "8080:8080"
    environment:
      - GATEWAY_PORT=8080
      - CONSUL_HOST=consul
    depends_on:
      - consul
      - task-service
```

## Best Practices

1. **Service Health Checks**: Implement proper health endpoints
2. **Graceful Shutdown**: Handle SIGTERM signals properly
3. **Circuit Breakers**: Use for all external service calls
4. **Distributed Tracing**: Add custom spans for important operations
5. **Service Discovery**: Register all services with Consul
6. **Load Balancing**: Implement proper load balancing strategy
7. **Error Handling**: Use proper gRPC status codes
8. **Monitoring**: Set up alerts for circuit breaker states

## Next Steps

- Implement service mesh (Istio/Linkerd)
- Add mutual TLS (mTLS) for service communication
- Implement distributed caching
- Add saga pattern for distributed transactions
- Set up centralized logging with ELK stack
