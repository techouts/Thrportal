import { ServiceRegistry, registerService } from '../ServiceRegistry';
import { EmployeeApiService } from './EmployeeApiService';
import { EmployeeSupabaseService } from './EmployeeSupabaseService';
import { EmployeeMockService } from './EmployeeMockService';
import { IService } from '../base/IService';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Register the employee service with all three implementations
registerService<IService<Employee>>({
  name: 'EmployeeService',
  singleton: true,
  mock: () => new EmployeeMockService(),
  api: () => new EmployeeApiService(),
  supabase: () => new EmployeeSupabaseService(),
});

// Example usage:
// const employeeService = ServiceRegistry.get<IService<Employee>>('EmployeeService');
// 
// Switch modes:
// ServiceRegistry.switchMode('api'); // Now all services use API mode
// ServiceRegistry.switchMode('mock'); // Back to mock mode for testing

export { ServiceRegistry };