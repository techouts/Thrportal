import { BaseMockService } from '../base/BaseMockService';
import { ApiResponse } from '../base/IService';
import { faker } from '@faker-js/faker';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Example implementation of Employee service using BaseMockService
 * This provides mock data for development and testing
 */
export class EmployeeMockService extends BaseMockService<Employee> {
  protected resourceName = 'employee';
  
  // Generate initial mock data
  protected mockData: Employee[] = Array.from({ length: 50 }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    department: faker.helpers.arrayElement(['Engineering', 'Sales', 'Marketing', 'HR', 'Finance']),
    role: faker.person.jobTitle(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  }));

  // Add custom methods specific to Employee service
  async getByDepartment(department: string): Promise<ApiResponse<Employee[]>> {
    await this.simulateDelay();
    
    const employees = this.mockData.filter(emp => emp.department === department);
    return this.createSuccessResponse(employees);
  }

  async updateRole(id: string, role: string): Promise<ApiResponse<Employee>> {
    return this.update(id, { role } as any);
  }

  // Override create to add realistic data
  async create(data: any): Promise<ApiResponse<Employee>> {
    const enrichedData = {
      ...data,
      email: data.email || faker.internet.email(),
      department: data.department || faker.helpers.arrayElement(['Engineering', 'Sales', 'Marketing', 'HR', 'Finance']),
    };
    
    return super.create(enrichedData);
  }
}