import { ApiResponse, PaginatedResponse, FilterParams, CreateInput, UpdateInput, IService } from './IService';
import { ServiceError, ServiceErrorHandler } from './ServiceError';

/**
 * Base service class for HTTP API operations
 */
export abstract class BaseApiService<T> implements IService<T> {
  protected abstract baseUrl: string;
  protected abstract resourceName: string;

  protected generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected createSuccessResponse<U>(data: U, message?: string): ApiResponse<U> {
    return {
      data,
      success: true,
      message,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: '1.0.0'
      }
    };
  }

  protected createPaginatedResponse<U>(
    data: U[],
    pagination: PaginatedResponse<U>['pagination'],
    message?: string
  ): PaginatedResponse<U> {
    return {
      ...this.createSuccessResponse(data, message),
      pagination
    };
  }

  protected async makeRequest<U>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<U> {
    return ServiceErrorHandler.withErrorHandling(async () => {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new ServiceError(
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR',
          response.status
        );
      }

      return response.json();
    }, `API request to ${endpoint}`);
  }

  async get(id: string): Promise<ApiResponse<T>> {
    const data = await this.makeRequest<T>(`/${this.resourceName}/${id}`);
    return this.createSuccessResponse(data);
  }

  async getAll(params?: FilterParams): Promise<PaginatedResponse<T>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    if (params?.search) queryParams.set('search', params.search);
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        queryParams.set(key, String(value));
      });
    }

    const endpoint = `/${this.resourceName}?${queryParams.toString()}`;
    const response = await this.makeRequest<{
      data: T[];
      pagination: PaginatedResponse<T>['pagination'];
    }>(endpoint);

    return this.createPaginatedResponse(
      response.data,
      response.pagination
    );
  }

  async create(data: CreateInput<T>): Promise<ApiResponse<T>> {
    const result = await this.makeRequest<T>(`/${this.resourceName}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return this.createSuccessResponse(result, `${this.resourceName} created successfully`);
  }

  async update(id: string, data: UpdateInput<T>): Promise<ApiResponse<T>> {
    const result = await this.makeRequest<T>(`/${this.resourceName}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return this.createSuccessResponse(result, `${this.resourceName} updated successfully`);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    await this.makeRequest<void>(`/${this.resourceName}/${id}`, {
      method: 'DELETE'
    });
    return this.createSuccessResponse(undefined, `${this.resourceName} deleted successfully`);
  }

  protected async patch(id: string, data: Partial<UpdateInput<T>>): Promise<ApiResponse<T>> {
    const result = await this.makeRequest<T>(`/${this.resourceName}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return this.createSuccessResponse(result, `${this.resourceName} updated successfully`);
  }
}