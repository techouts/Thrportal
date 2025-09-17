import { ApiResponse, PaginatedResponse, FilterParams, CreateInput, UpdateInput, IService } from './IService';
import { ServiceError, ServiceErrorHandler } from './ServiceError';

/**
 * Base service class for mock/development operations
 */
export abstract class BaseMockService<T extends { id: string }> implements IService<T> {
  protected abstract mockData: T[];
  protected abstract resourceName: string;

  protected generateId(): string {
    return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

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

  protected simulateDelay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected applyFilters(data: T[], params?: FilterParams): T[] {
    let filtered = [...data];

    // Apply search
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply custom filters
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          filtered = filtered.filter(item => 
            (item as any)[key] === value
          );
        }
      });
    }

    // Apply sorting
    if (params?.sortBy) {
      filtered.sort((a, b) => {
        const aVal = (a as any)[params.sortBy!];
        const bVal = (b as any)[params.sortBy!];
        
        if (aVal < bVal) return params.sortOrder === 'desc' ? 1 : -1;
        if (aVal > bVal) return params.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    return filtered;
  }

  protected applyPagination<U>(data: U[], params?: FilterParams): {
    data: U[];
    pagination: PaginatedResponse<U>['pagination'];
  } {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;
    
    const paginatedData = data.slice(offset, offset + limit);
    const total = data.length;
    const totalPages = Math.ceil(total / limit);

    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    return { data: paginatedData, pagination };
  }

  async get(id: string): Promise<ApiResponse<T>> {
    return ServiceErrorHandler.withErrorHandling(async () => {
      await this.simulateDelay();
      
      const item = this.mockData.find(item => item.id === id);
      if (!item) {
        throw ServiceError.notFound(this.resourceName, id);
      }

      return this.createSuccessResponse(item);
    }, `Get ${this.resourceName} by id`);
  }

  async getAll(params?: FilterParams): Promise<PaginatedResponse<T>> {
    return ServiceErrorHandler.withErrorHandling(async () => {
      await this.simulateDelay();
      
      const filtered = this.applyFilters(this.mockData, params);
      const { data, pagination } = this.applyPagination(filtered, params);

      return this.createPaginatedResponse(data, pagination);
    }, `Get all ${this.resourceName}`);
  }

  async create(data: CreateInput<T>): Promise<ApiResponse<T>> {
    return ServiceErrorHandler.withErrorHandling(async () => {
      await this.simulateDelay();
      
      const newItem = {
        ...data,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as unknown as T;

      this.mockData.push(newItem);

      return this.createSuccessResponse(newItem, `${this.resourceName} created successfully`);
    }, `Create ${this.resourceName}`);
  }

  async update(id: string, data: UpdateInput<T>): Promise<ApiResponse<T>> {
    return ServiceErrorHandler.withErrorHandling(async () => {
      await this.simulateDelay();
      
      const index = this.mockData.findIndex(item => item.id === id);
      if (index === -1) {
        throw ServiceError.notFound(this.resourceName, id);
      }

      const updatedItem = {
        ...this.mockData[index],
        ...data,
        updatedAt: new Date().toISOString()
      } as T;

      this.mockData[index] = updatedItem;

      return this.createSuccessResponse(updatedItem, `${this.resourceName} updated successfully`);
    }, `Update ${this.resourceName}`);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return ServiceErrorHandler.withErrorHandling(async () => {
      await this.simulateDelay();
      
      const index = this.mockData.findIndex(item => item.id === id);
      if (index === -1) {
        throw ServiceError.notFound(this.resourceName, id);
      }

      this.mockData.splice(index, 1);

      return this.createSuccessResponse(undefined, `${this.resourceName} deleted successfully`);
    }, `Delete ${this.resourceName}`);
  }

  protected findById(id: string): T | undefined {
    return this.mockData.find(item => item.id === id);
  }

  protected validateExists(id: string): T {
    const item = this.findById(id);
    if (!item) {
      throw ServiceError.notFound(this.resourceName, id);
    }
    return item;
  }
}