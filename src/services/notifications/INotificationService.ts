/**
 * Notification-specific interfaces and types
 */
import { ApiResponse, PaginatedResponse, FilterParams, IService } from '../base/IService';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  action_url?: string;
  created_at: string;
}

export interface CreateNotificationInput {
  user_id: string;
  title: string;
  body: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  action_url?: string;
}

/**
 * Extended notification service interface with notification-specific methods
 */
export interface INotificationService extends IService<Notification> {
  // Get unread notifications for a user
  getUnread(userId: string): Promise<ApiResponse<Notification[]>>;
  
  // Get unread count for badge display
  getUnreadCount(userId: string): Promise<ApiResponse<number>>;
  
  // Mark a notification as read
  markAsRead(notificationId: string): Promise<ApiResponse<Notification>>;
  
  // Mark all notifications as read for a user
  markAllAsRead(userId: string): Promise<ApiResponse<void>>;
  
  // Create a notification (convenience method)
  notify(input: CreateNotificationInput): Promise<ApiResponse<Notification>>;
  
  // Bulk create notifications (e.g., notify multiple users)
  notifyMany(inputs: CreateNotificationInput[]): Promise<ApiResponse<Notification[]>>;
}
