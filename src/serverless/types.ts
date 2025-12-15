export interface LambdaContext {
  functionName: string;
  functionVersion: string;
  invokedFunctionArn: string;
  memoryLimitInMB: number;
  awsRequestId: string;
  logGroupName: string;
  logStreamName: string;
  getRemainingTimeInMillis: () => number;
  callbackWaitsForEmptyEventLoop: boolean;
}

export interface LambdaEvent {
  httpMethod?: string;
  path?: string;
  headers?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  pathParameters?: Record<string, string>;
  body?: string | null;
  isBase64Encoded?: boolean;
  requestContext?: {
    requestId: string;
    stage: string;
    identity?: {
      sourceIp: string;
      userAgent: string;
    };
  };
  // For scheduled events
  source?: string;
  'detail-type'?: string;
  detail?: Record<string, any>;
  // For SQS events
  Records?: Array<{
    messageId: string;
    body: string;
    attributes: Record<string, string>;
  }>;
}

export interface LambdaResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
}

export type LambdaHandler = (
  event: LambdaEvent,
  context: LambdaContext
) => Promise<LambdaResponse>;

export type MiddlewareFunction = (
  event: LambdaEvent,
  context: LambdaContext,
  next: () => Promise<LambdaResponse>
) => Promise<LambdaResponse>;
