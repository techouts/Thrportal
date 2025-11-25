import { ApiService, handleApiError } from './api'
import { Employee, PaginatedResponse, ApiResponse } from '@/types'

export class EmployeeService {
  private static readonly BASE_PATH = '/employees'
  
  // Get all employees with pagination and filters
  static async getEmployees(params?: {
    page?: number
    limit?: number
    department?: string
    status?: string
    search?: string
  }): Promise<PaginatedResponse<Employee>> {
    try {
      return await ApiService.getPaginated<Employee>(this.BASE_PATH, params)
    } catch (error) {
      throw handleApiError(error)
    }
  }
  
  // Get employee by ID
  static async getEmployeeById(id: string): Promise<ApiResponse<Employee>> {
    try {
      return await ApiService.get<Employee>(`${this.BASE_PATH}/${id}`)
    } catch (error) {
      throw handleApiError(error)
    }
  }
  
  // Create new employee
  static async createEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Employee>> {
    try {
      return await ApiService.post<Employee>(this.BASE_PATH, employee)
    } catch (error) {
      throw handleApiError(error)
    }
  }
  
  // Update employee
  static async updateEmployee(id: string, updates: Partial<Employee>): Promise<ApiResponse<Employee>> {
    try {
      return await ApiService.put<Employee>(`${this.BASE_PATH}/${id}`, updates)
    } catch (error) {
      throw handleApiError(error)
    }
  }
  
  // Delete employee
  static async deleteEmployee(id: string): Promise<ApiResponse<void>> {
    try {
      return await ApiService.delete<void>(`${this.BASE_PATH}/${id}`)
    } catch (error) {
      throw handleApiError(error)
    }
  }
  
  // Get employees by department
  static async getEmployeesByDepartment(department: string): Promise<ApiResponse<Employee[]>> {
    try {
      return await ApiService.get<Employee[]>(`${this.BASE_PATH}/department/${department}`)
    } catch (error) {
      throw handleApiError(error)
    }
  }
  
  // Get employee's direct reports
  static async getDirectReports(managerId: string): Promise<ApiResponse<Employee[]>> {
    try {
      return await ApiService.get<Employee[]>(`${this.BASE_PATH}/${managerId}/reports`)
    } catch (error) {
      throw handleApiError(error)
    }
  }
  
  // Search employees
  static async searchEmployees(query: string): Promise<ApiResponse<Employee[]>> {
    try {
      return await ApiService.get<Employee[]>(`${this.BASE_PATH}/search`, {
        params: { q: query }
      })
    } catch (error) {
      throw handleApiError(error)
    }
  }
  
  // Get employee statistics
  static async getEmployeeStats(): Promise<ApiResponse<{
    total: number
    active: number
    inactive: number
    byDepartment: Record<string, number>
    recentHires: number
  }>> {
    try {
      return await ApiService.get(`${this.BASE_PATH}/stats`)
    } catch (error) {
      throw handleApiError(error)
    }
  }
}

// Mock data for development (remove when backend is ready)
export const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1-555-0123',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    department: 'Engineering',
    position: 'Senior Software Engineer',
    manager: 'EMP002',
    location: 'New York, NY',
    startDate: '2022-01-15',
    status: 'active',
    salary: 120000,
  },
  {
    id: '2',
    employeeId: 'EMP002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@company.com',
    phone: '+1-555-0124',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
    department: 'Engineering',
    position: 'Engineering Manager',
    location: 'New York, NY',
    startDate: '2021-03-01',
    status: 'active',
    salary: 150000,
  },
  {
    id: '3',
    employeeId: 'EMP003',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@company.com',
    phone: '+1-555-0125',
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=32&h=32&fit=crop&crop=face',
    department: 'Marketing',
    position: 'Marketing Specialist',
    manager: 'EMP004',
    location: 'San Francisco, CA',
    startDate: '2023-06-01',
    status: 'active',
    salary: 75000,
  },
]