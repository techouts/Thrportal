/**
 * Notification Service Module
 * 
 * Provides a centralized way to manage notifications in the application.
 * Uses the ServiceRegistry pattern to switch between:
 * - Mock mode: Direct Supabase calls (current implementation)
 * - API mode: Node.js backend calls (future implementation)
 * 
 * @example
 * ```typescript
 * import { getNotificationService } from '@/services/notifications';
 * 
 * // Get the service (uses current mode from ServiceRegistry)
 * const service = getNotificationService();
 * 
 * // Create a notification
 * await service.notify({
 *   user_id: 'user-uuid',
 *   title: 'New Message',
 *   body: 'You have a new message',
 *   type: 'info',
 *   action_url: '/messages'
 * });
 * 
 * // Get unread notifications
 * const { data: unread } = await service.getUnread(userId);
 * 
 * // Mark as read
 * await service.markAsRead(notificationId);
 * 
 * // Mark all as read
 * await service.markAllAsRead(userId);
 * ```
 */

export { getNotificationService } from './NotificationServiceRegistry';
export type { 
  Notification, 
  CreateNotificationInput, 
  INotificationService 
} from './INotificationService';
export { NotificationMockService } from './NotificationMockService';
export { NotificationApiService } from './NotificationApiService';
