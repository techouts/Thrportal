/**
 * Base service interface for standardized CRUD operations
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  metadata?: {
    timestamp: string;
    requestId?: string;
    version?: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FilterParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export type CreateInput<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt'>>;

/**
 * Standard service interface that all services should implement
 */
export interface IService<T> {
  get(id: string): Promise<ApiResponse<T>>;
  getAll(params?: FilterParams): Promise<PaginatedResponse<T>>;
  create(data: CreateInput<T>): Promise<ApiResponse<T>>;
  update(id: string, data: UpdateInput<T>): Promise<ApiResponse<T>>;
  delete(id: string): Promise<ApiResponse<void>>;
}

/**
 * Extended service interface for more complex operations
 */
export interface IExtendedService<T> extends IService<T> {
  search(query: string, params?: FilterParams): Promise<PaginatedResponse<T>>;
  bulkCreate(data: CreateInput<T>[]): Promise<ApiResponse<T[]>>;
  bulkUpdate(updates: Array<{ id: string; data: UpdateInput<T> }>): Promise<ApiResponse<T[]>>;
  bulkDelete(ids: string[]): Promise<ApiResponse<void>>;
  export(format: 'csv' | 'xlsx' | 'pdf', params?: FilterParams): Promise<ApiResponse<{ downloadUrl: string }>>;
}