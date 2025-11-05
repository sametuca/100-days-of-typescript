export class ApiError extends Error {
  public statusCode: number;
  public errorCode?: string;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode?: string,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApiError {
  public details: any[];

  constructor(
    message: string,
    details: any[] = [],
    errorCode: string = 'VALIDATION_ERROR'
  ) {
    super(message, 400, errorCode);
    this.details = details;
  }
}

export class ConflictError extends ApiError {
  constructor(
    message: string,
    errorCode: string = 'CONFLICT_ERROR'
  ) {
    super(message, 409, errorCode);
  }
}

export class AuthenticationError extends ApiError {
  constructor(
    message: string,
    errorCode: string = 'AUTHENTICATION_ERROR'
  ) {
    super(message, 401, errorCode);
  }
}

export class AuthorizationError extends ApiError {
  constructor(
    message: string,
    errorCode: string = 'AUTHORIZATION_ERROR'
  ) {
    super(message, 403, errorCode);
  }
}