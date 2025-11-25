// Export all base service classes and interfaces
export * from './IService';
export * from './ServiceError';
export * from './BaseApiService';
export * from './BaseSupabaseService';
export * from './BaseMockService';
export { ServiceRegistry, registerService, getService, useService } from '../ServiceRegistry';
export type { ServiceConfig, ServiceDefinition, ServiceEnvironment, ServiceMode } from '../ServiceRegistry';