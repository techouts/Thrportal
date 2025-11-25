/**
 * Service Registry for centralized service management and dependency injection
 */

type ServiceEnvironment = 'development' | 'staging' | 'production';
type ServiceMode = 'mock' | 'api' | 'supabase';

interface ServiceConfig {
  environment: ServiceEnvironment;
  mode: ServiceMode;
  apiBaseUrl?: string;
  enableLogging?: boolean;
  enableMetrics?: boolean;
}

interface ServiceDefinition<T> {
  name: string;
  mock: () => T;
  api: () => T;
  supabase: () => T;
  singleton?: boolean;
}

class ServiceRegistryClass {
  private services = new Map<string, ServiceDefinition<any>>();
  private instances = new Map<string, any>();
  private config: ServiceConfig;

  constructor() {
    this.config = {
      environment: (process.env.NODE_ENV as ServiceEnvironment) || 'development',
      mode: this.getServiceMode(),
      enableLogging: true,
      enableMetrics: false
    };
  }

  private getServiceMode(): ServiceMode {
    // In development, use mock by default
    if (this.config?.environment === 'development') {
      return 'mock';
    }
    
    // In production, prefer API if available, fallback to Supabase
    return 'supabase';
  }

  configure(config: Partial<ServiceConfig>): void {
    this.config = { ...this.config, ...config };
    this.instances.clear(); // Clear instances when config changes
  }

  register<T>(definition: ServiceDefinition<T>): void {
    this.services.set(definition.name, definition);
  }

  get<T>(serviceName: string): T {
    const definition = this.services.get(serviceName);
    if (!definition) {
      throw new Error(`Service '${serviceName}' not found in registry`);
    }

    // Return existing singleton instance if available
    if (definition.singleton && this.instances.has(serviceName)) {
      return this.instances.get(serviceName);
    }

    let service: T;

    // Create service instance based on current mode
    switch (this.config.mode) {
      case 'mock':
        service = definition.mock();
        break;
      case 'api':
        service = definition.api();
        break;
      case 'supabase':
        service = definition.supabase();
        break;
      default:
        throw new Error(`Unknown service mode: ${this.config.mode}`);
    }

    // Store singleton instance
    if (definition.singleton) {
      this.instances.set(serviceName, service);
    }

    this.logServiceCreation(serviceName, this.config.mode);
    return service;
  }

  has(serviceName: string): boolean {
    return this.services.has(serviceName);
  }

  list(): string[] {
    return Array.from(this.services.keys());
  }

  getConfig(): ServiceConfig {
    return { ...this.config };
  }

  switchMode(mode: ServiceMode): void {
    this.config.mode = mode;
    this.instances.clear(); // Clear all instances when switching modes
    console.log(`Service registry switched to ${mode} mode`);
  }

  private logServiceCreation(serviceName: string, mode: ServiceMode): void {
    if (this.config.enableLogging) {
      console.log(`[ServiceRegistry] Created ${serviceName} service in ${mode} mode`);
    }
  }

  // Utility methods for environment checking
  isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  isProduction(): boolean {
    return this.config.environment === 'production';
  }

  isMockMode(): boolean {
    return this.config.mode === 'mock';
  }

  isApiMode(): boolean {
    return this.config.mode === 'api';
  }

  isSupabaseMode(): boolean {
    return this.config.mode === 'supabase';
  }
}

export const ServiceRegistry = new ServiceRegistryClass();

// Helper function to register a service
export function registerService<T>(definition: ServiceDefinition<T>): void {
  ServiceRegistry.register(definition);
}

// Helper function to get a service
export function getService<T>(serviceName: string): T {
  return ServiceRegistry.get<T>(serviceName);
}

// Type-safe service getter
export function useService<T>(serviceName: string): T {
  return ServiceRegistry.get<T>(serviceName);
}

export type { ServiceConfig, ServiceDefinition, ServiceEnvironment, ServiceMode };