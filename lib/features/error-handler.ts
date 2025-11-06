import { HttpError } from './errors.js';

export function createErrorHandler() {
  return (error: any, req: any, res: any) => {
    // Default to development mode if not set
    const isDev = process.env.NODE_ENV !== 'production';
    
    console.error('💥 Error handled:', {
      message: error.message,
      statusCode: error.statusCode,
      url: req.url,
      method: req.method
    });

    // Handle HttpError instances
    if (error instanceof HttpError) {
      const response: any = {
        error: error.message,
        ...(error.details && { details: error.details })
      };

      // Add stack trace in development
      if (isDev) {
        response.stack = error.stack;
      }

      res.status(error.statusCode).json(response);
      return;
    }

    // Handle generic errors
    const statusCode = error.statusCode || 500;
    const response: any = {
      error: statusCode === 500 ? 'Internal server error' : error.message
    };

    // Add debug info in development
    if (isDev) {
      response.stack = error.stack;
      if (statusCode === 500) {
        response.originalError = error.message;
      }
    }

    res.status(statusCode).json(response);
  };
}
