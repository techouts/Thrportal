/**
 * Standard service error class for consistent error handling
 */
export class ServiceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly metadata?: Record<string, any>;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.statusCode = statusCode;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
  }

  static notFound(resource: string, id?: string): ServiceError {
    return new ServiceError(
      `${resource}${id ? ` with id ${id}` : ''} not found`,
      'NOT_FOUND',
      404,
      { resource, id }
    );
  }

  static validation(message: string, field?: string): ServiceError {
    return new ServiceError(
      message,
      'VALIDATION_ERROR',
      400,
      { field }
    );
  }

  static unauthorized(message: string = 'Unauthorized access'): ServiceError {
    return new ServiceError(message, 'UNAUTHORIZED', 401);
  }

  static forbidden(message: string = 'Forbidden access'): ServiceError {
    return new ServiceError(message, 'FORBIDDEN', 403);
  }

  static conflict(message: string, resource?: string): ServiceError {
    return new ServiceError(
      message,
      'CONFLICT',
      409,
      { resource }
    );
  }

  static rateLimited(message: string = 'Rate limit exceeded'): ServiceError {
    return new ServiceError(message, 'RATE_LIMITED', 429);
  }

  static internal(message: string = 'Internal server error', originalError?: Error): ServiceError {
    return new ServiceError(
      message,
      'INTERNAL_ERROR',
      500,
      { originalError: originalError?.message }
    );
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      metadata: this.metadata,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

/**
 * Service error handler utility
 */
export class ServiceErrorHandler {
  static handle(error: unknown): ServiceError {
    if (error instanceof ServiceError) {
      return error;
    }

    if (error instanceof Error) {
      return ServiceError.internal(error.message, error);
    }

    return ServiceError.internal('Unknown error occurred');
  }

  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const serviceError = this.handle(error);
    if (context) {
      (serviceError as any).metadata = { ...serviceError.metadata, context };
    }
      throw serviceError;
    }
  }
}