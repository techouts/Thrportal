import { BaseApiService } from '../base/BaseApiService';
import { ApiResponse, PaginatedResponse, FilterParams } from '../base/IService';

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
 * Example implementation of Employee service using BaseApiService
 * This would connect to your Node.js API backend
 */
export class EmployeeApiService extends BaseApiService<Employee> {
  protected baseUrl = 'https://api.yourcompany.com/v1';
  protected resourceName = 'employees';

  // Override getAll to add department filtering
  async getAll(params?: FilterParams): Promise<PaginatedResponse<Employee>> {
    // Add custom logic before calling parent
    console.log('Getting employees with params:', params);
    
    // Call parent implementation
    return super.getAll(params);
  }

  // Add custom methods specific to Employee service
  async getByDepartment(department: string): Promise<ApiResponse<Employee[]>> {
    const data = await this.makeRequest<Employee[]>(`/${this.resourceName}?department=${department}`);
    return this.createSuccessResponse(data);
  }

  async updateRole(id: string, role: string): Promise<ApiResponse<Employee>> {
    return this.patch(id, { role });
  }
}