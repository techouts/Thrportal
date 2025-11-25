import { supabase } from '@/integrations/supabase/client';
import { ApiResponse, PaginatedResponse, FilterParams, CreateInput, UpdateInput, IService } from './IService';
import { ServiceError, ServiceErrorHandler } from './ServiceError';

/**
 * Base service class for Supabase operations
 */
export abstract class BaseSupabaseService<T> implements IService<T> {
  protected abstract tableName: string;

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

  protected handleSupabaseError(error: any): never {
    if (error?.code === 'PGRST116') {
      throw ServiceError.notFound(this.tableName);
    }
    if (error?.code === '23505') {
      throw ServiceError.conflict('Resource already exists', this.tableName);
    }
    if (error?.code === '42501') {
      throw ServiceError.forbidden('Insufficient permissions');
    }
    throw ServiceError.internal(error?.message || 'Database operation failed');
  }

  async get(id: string): Promise<ApiResponse<T>> {
    return ServiceErrorHandler.withErrorHandling(async () => {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .select('*')
        .eq('id', id)
        .single();

      if (error) this.handleSupabaseError(error);
      if (!data) throw ServiceError.notFound(this.tableName, id);

      return this.createSuccessResponse(data as T);
    }, `Get ${this.tableName} by id`);
  }

  async getAll(params?: FilterParams): Promise<PaginatedResponse<T>> {
    return ServiceErrorHandler.withErrorHandling(async () => {
      let query = supabase.from(this.tableName as any).select('*', { count: 'exact' });

      // Apply search if provided
      if (params?.search) {
        // This is a basic implementation - override in subclasses for specific search logic
        query = query.ilike('name', `%${params.search}%`);
      }

      // Apply custom filters
      if (params?.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply sorting
      if (params?.sortBy) {
        query = query.order(params.sortBy, { 
          ascending: params.sortOrder !== 'desc' 
        });
      }

      // Apply pagination
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) this.handleSupabaseError(error);

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      const pagination = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };

      return this.createPaginatedResponse(data as T[], pagination);
    }, `Get all ${this.tableName}`);
  }

  async create(data: CreateInput<T>): Promise<ApiResponse<T>> {
    return ServiceErrorHandler.withErrorHandling(async () => {
      const { data: result, error } = await supabase
        .from(this.tableName as any)
        .insert(data as any)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(result as T, `${this.tableName} created successfully`);
    }, `Create ${this.tableName}`);
  }

  async update(id: string, data: UpdateInput<T>): Promise<ApiResponse<T>> {
    return ServiceErrorHandler.withErrorHandling(async () => {
      const { data: result, error } = await supabase
        .from(this.tableName as any)
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);
      if (!result) throw ServiceError.notFound(this.tableName, id);

      return this.createSuccessResponse(result as T, `${this.tableName} updated successfully`);
    }, `Update ${this.tableName}`);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return ServiceErrorHandler.withErrorHandling(async () => {
      const { error } = await supabase
        .from(this.tableName as any)
        .delete()
        .eq('id', id);

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(undefined, `${this.tableName} deleted successfully`);
    }, `Delete ${this.tableName}`);
  }

  protected async getCurrentUserId(): Promise<string> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw ServiceError.unauthorized('User not authenticated');
    }
    return user.id;
  }

  protected async upsert(data: CreateInput<T> | UpdateInput<T>): Promise<ApiResponse<T>> {
    return ServiceErrorHandler.withErrorHandling(async () => {
      const { data: result, error } = await supabase
        .from(this.tableName as any)
        .upsert(data as any)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(result as T, `${this.tableName} saved successfully`);
    }, `Upsert ${this.tableName}`);
  }
}