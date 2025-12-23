/**
 * NotificationService Registry
 * 
 * Registers the NotificationService with all implementations.
 * Switch between mock (Supabase direct) and api (Node.js backend) modes
 * using ServiceRegistry.switchMode('mock') or ServiceRegistry.switchMode('api')
 */
import { ServiceRegistry, registerService } from '../ServiceRegistry';
import { NotificationMockService } from './NotificationMockService';
import { NotificationApiService } from './NotificationApiService';
import { INotificationService } from './INotificationService';

// Register the notification service with all implementations
registerService<INotificationService>({
  name: 'NotificationService',
  singleton: true,
  mock: () => new NotificationMockService(),
  api: () => new NotificationApiService(),
  supabase: () => new NotificationMockService(), // Supabase mode also uses direct Supabase
});

/**
 * Get the NotificationService instance based on current mode
 * 
 * Usage:
 * ```typescript
 * import { getNotificationService } from '@/services/notifications';
 * 
 * const notificationService = getNotificationService();
 * await notificationService.notify({
 *   user_id: 'user-uuid',
 *   title: 'Leave Approved',
 *   body: 'Your leave request has been approved',
 *   type: 'success'
 * });
 * ```
 */
export function getNotificationService(): INotificationService {
  return ServiceRegistry.get<INotificationService>('NotificationService');
}

// Re-export types and interfaces
export * from './INotificationService';
