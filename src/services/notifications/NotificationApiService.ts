/**
 * NotificationApiService - Calls Node.js API backend
 * This implementation will be used after migrating to Node.js
 */
import { BaseApiService } from '../base/BaseApiService';
import { ApiResponse, PaginatedResponse, FilterParams, CreateInput, UpdateInput } from '../base/IService';
import { INotificationService, Notification, CreateNotificationInput } from './INotificationService';

export class NotificationApiService extends BaseApiService<Notification> implements INotificationService {
  // TODO: Update this URL when Node.js API is deployed
  protected baseUrl = 'https://api.yourcompany.com/v1';
  protected resourceName = 'notifications';

  // Notification-specific methods that call API endpoints

  async getUnread(userId: string): Promise<ApiResponse<Notification[]>> {
    try {
      const data = await this.makeRequest<Notification[]>(
        `/${this.resourceName}/unread?userId=${userId}`
      );
      return this.createSuccessResponse(data);
    } catch (error: any) {
      return {
        data: [],
        success: false,
        error: error.message,
      };
    }
  }

  async getUnreadCount(userId: string): Promise<ApiResponse<number>> {
    try {
      const data = await this.makeRequest<{ count: number }>(
        `/${this.resourceName}/unread/count?userId=${userId}`
      );
      return this.createSuccessResponse(data.count);
    } catch (error: any) {
      return {
        data: 0,
        success: false,
        error: error.message,
      };
    }
  }

  async markAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
    try {
      const data = await this.makeRequest<Notification>(
        `/${this.resourceName}/${notificationId}/read`,
        { method: 'PATCH' }
      );
      return this.createSuccessResponse(data, 'Notification marked as read');
    } catch (error: any) {
      return {
        data: null as any,
        success: false,
        error: error.message,
      };
    }
  }

  async markAllAsRead(userId: string): Promise<ApiResponse<void>> {
    try {
      await this.makeRequest<void>(
        `/${this.resourceName}/read-all`,
        {
          method: 'POST',
          body: JSON.stringify({ userId }),
        }
      );
      return this.createSuccessResponse(undefined, 'All notifications marked as read');
    } catch (error: any) {
      return {
        data: undefined,
        success: false,
        error: error.message,
      };
    }
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
    try {
      const data = await this.makeRequest<Notification[]>(
        `/${this.resourceName}/bulk`,
        {
          method: 'POST',
          body: JSON.stringify({ notifications: inputs }),
        }
      );
      return this.createSuccessResponse(data, `${inputs.length} notifications created`);
    } catch (error: any) {
      return {
        data: [],
        success: false,
        error: error.message,
      };
    }
  }
}
