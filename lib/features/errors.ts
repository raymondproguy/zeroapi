// Custom error classes with automatic status codes
export class HttpError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    
    // Capture stack trace (excluding constructor call)
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = 'Resource not found', details?: any) {
    super(404, message, details);
  }
}

export class ValidationError extends HttpError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(400, message, details);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = 'Unauthorized', details?: any) {
    super(401, message, details);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string = 'Forbidden', details?: any) {
    super(403, message, details);
  }
}

export class InternalServerError extends HttpError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(500, message, details);
  }
}
