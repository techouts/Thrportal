/**
 * NotificationMockService - Uses Supabase directly
 * This is the current implementation that will be used until Node.js API is ready
 */
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse, PaginatedResponse, FilterParams, CreateInput, UpdateInput } from '../base/IService';
import { INotificationService, Notification, CreateNotificationInput } from './INotificationService';

export class NotificationMockService implements INotificationService {
  private resourceName = 'notifications';

  private createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
    return {
      data,
      success: true,
      message: message || 'Operation successful',
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    };
  }

  private createErrorResponse<T>(error: string): ApiResponse<T> {
    return {
      data: null as T,
      success: false,
      error,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  async get(id: string): Promise<ApiResponse<Notification>> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return this.createErrorResponse(error.message);
    }

    return this.createSuccessResponse(data as Notification);
  }

  async getAll(params?: FilterParams): Promise<PaginatedResponse<Notification>> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        data: [],
        success: false,
        error: 'User not authenticated',
        pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
    }

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return {
        data: [],
        success: false,
        error: error.message,
        pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: (data as Notification[]) || [],
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async create(data: CreateInput<Notification>): Promise<ApiResponse<Notification>> {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: data.user_id,
        title: data.title,
        body: data.body,
        type: data.type || 'info',
        action_url: data.action_url,
        read: false,
      })
      .select()
      .single();

    if (error) {
      return this.createErrorResponse(error.message);
    }

    return this.createSuccessResponse(notification as Notification, 'Notification created');
  }

  async update(id: string, data: UpdateInput<Notification>): Promise<ApiResponse<Notification>> {
    const { data: notification, error } = await supabase
      .from('notifications')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return this.createErrorResponse(error.message);
    }

    return this.createSuccessResponse(notification as Notification, 'Notification updated');
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      return this.createErrorResponse(error.message);
    }

    return this.createSuccessResponse(undefined, 'Notification deleted');
  }

  // Notification-specific methods

  async getUnread(userId: string): Promise<ApiResponse<Notification[]>> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) {
      return this.createErrorResponse(error.message);
    }

    return this.createSuccessResponse((data as Notification[]) || []);
  }

  async getUnreadCount(userId: string): Promise<ApiResponse<number>> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      return this.createErrorResponse(error.message);
    }

    return this.createSuccessResponse(count || 0);
  }

  async markAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) {
      return this.createErrorResponse(error.message);
    }

    return this.createSuccessResponse(data as Notification, 'Notification marked as read');
  }

  async markAllAsRead(userId: string): Promise<ApiResponse<void>> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      return this.createErrorResponse(error.message);
    }

    return this.createSuccessResponse(undefined, 'All notifications marked as read');
  }

  async notify(input: CreateNotificationInput): Promise<ApiResponse<Notification>> {
    return this.create({
      user_id: input.user_id,
      title: input.title,
      body: input.body,
      type: input.type || 'info',
      action_url: input.action_url,
    });
  }

  async notifyMany(inputs: CreateNotificationInput[]): Promise<ApiResponse<Notification[]>> {
    const notifications = inputs.map(input => ({
      user_id: input.user_id,
      title: input.title,
      body: input.body,
      type: input.type || 'info',
      action_url: input.action_url,
      read: false,
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) {
      return this.createErrorResponse(error.message);
    }

    return this.createSuccessResponse((data as Notification[]) || [], `${inputs.length} notifications created`);
  }
}
