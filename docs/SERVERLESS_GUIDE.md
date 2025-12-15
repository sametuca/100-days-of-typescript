# Serverless Architecture Guide

## Overview

Serverless architecture (FaaS - Function as a Service) enables building scalable applications without managing infrastructure.

## Key Benefits

- **No Server Management**: Focus on code, not infrastructure
- **Auto-Scaling**: Automatically scales based on demand
- **Pay-Per-Use**: Only pay for actual execution time
- **Event-Driven**: Respond to events in real-time
- **Faster Deployment**: Deploy functions in seconds

## Architecture Components

### 1. API Gateway
Expose functions as HTTP endpoints:

```typescript
// HTTP trigger
events:
  - http:
      path: /tasks
      method: post
      cors: true
      authorizer: authFunction
```

### 2. Database Integration
Use DynamoDB for serverless databases:

```typescript
// DynamoDB access
const dynamodb = new AWS.DynamoDB.DocumentClient();
await dynamodb.put({ TableName: 'tasks', Item: {...} }).promise();
```

### 3. Storage
Use S3 for file storage:

```typescript
// S3 file upload
const s3 = new AWS.S3();
await s3.putObject({ Bucket, Key, Body }).promise();
```

### 4. Event Triggers
Process events asynchronously:

```typescript
// SQS trigger
events:
  - sqs:
      arn: arn:aws:sqs:region:account:queue-name
      batchSize: 10
```

## Development Setup

### Install Serverless Framework
```bash
npm install -g serverless
serverless plugin install -n serverless-offline
```

### Local Development
```bash
serverless offline start
```

### Deploy to AWS
```bash
serverless deploy --stage prod
```

## Performance Optimization

### 1. Cold Start Reduction
- Keep functions small
- Use connection pooling
- Pre-load dependencies
- Use provisioned concurrency

### 2. Memory Optimization
```typescript
// Check remaining time
const remaining = context.getRemainingTimeInMillis();

// Don't wait for empty event loop
context.callbackWaitsForEmptyEventLoop = false;
```

### 3. Concurrent Execution
```typescript
// Handle concurrent requests
const concurrency = process.env.LAMBDA_CONCURRENCY || 100;
```

## Cost Optimization

- Monitor invocation counts
- Use reserved concurrency
- Implement request caching
- Batch operations when possible

## Monitoring

### CloudWatch Logs
```bash
serverless logs -f functionName
```

### Custom Metrics
```typescript
const cloudwatch = new AWS.CloudWatch();
await cloudwatch.putMetricData({
  Namespace: 'MyApp',
  MetricData: [{ MetricName, Value, Unit }]
}).promise();
```

## Best Practices

1. **Stateless Functions**: Each invocation should be independent
2. **Environment Variables**: Use for configuration
3. **Error Handling**: Implement proper error responses
4. **Timeout Management**: Set appropriate timeouts
5. **Logging**: Use structured logging
6. **Security**: Validate all inputs, use IAM roles

## Common Patterns

### API Gateway + Lambda
```yaml
functions:
  api:
    handler: src/api.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
```

### Async Processing
```yaml
functions:
  processor:
    handler: src/processor.handler
    events:
      - sqs:
          arn: queue-arn
          batchSize: 10
```

### Scheduled Tasks
```yaml
functions:
  cleanup:
    handler: src/cleanup.handler
    events:
      - schedule: cron(0 2 * * ? *)
```

## Troubleshooting

### Function Timeouts
- Check function memory allocation
- Monitor execution time
- Optimize database queries

### High Costs
- Review invocation metrics
- Implement request caching
- Use batch processing

### Cold Starts
- Increase provisioned concurrency
- Reduce function size
- Pre-warm functions

## Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Serverless Framework Guide](https://www.serverless.com/framework/docs)
- [Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
