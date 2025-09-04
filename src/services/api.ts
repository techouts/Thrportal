import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiResponse, ApiError, PaginatedResponse } from '@/types'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/data'
const API_TIMEOUT = 30000

// Mock IJP data
const mockIjpPostings = [
  {
    id: 'ijp-1',
    requisitionId: 'REQ-2024-001',
    title: 'Senior React Developer',
    level: 'Senior',
    bandId: 'L4',
    bu: 'Technology',
    dept: 'Engineering',
    location: 'Bangalore',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    tags: ['Internal', 'Full-time'],
    descriptionRich: 'Join our dynamic engineering team...',
    visibilityStart: '2024-01-01T00:00:00Z',
    visibilityEnd: '2024-12-31T23:59:59Z',
    salaryBandVisible: true,
    status: 'OPEN',
    createdBy: 'hr-admin',
    updatedAt: '2024-01-15T10:00:00Z',
    matchScore: 85,
    isSaved: false
  },
  {
    id: 'ijp-2',
    requisitionId: 'REQ-2024-002',
    title: 'Product Manager',
    level: 'Mid-Level',
    bandId: 'L3',
    bu: 'Product',
    dept: 'Product',
    location: 'Mumbai',
    skills: ['Product Strategy', 'Analytics', 'Agile'],
    tags: ['Internal', 'Growth Role'],
    descriptionRich: 'Lead product initiatives...',
    visibilityStart: '2024-01-01T00:00:00Z',
    visibilityEnd: '2024-06-30T23:59:59Z',
    salaryBandVisible: false,
    status: 'OPEN',
    createdBy: 'hr-admin',
    updatedAt: '2024-01-10T10:00:00Z',
    matchScore: 72,
    isSaved: true
  },
  {
    id: 'ijp-3',
    requisitionId: 'REQ-2024-003',
    title: 'DevOps Engineer',
    level: 'Senior',
    bandId: 'L4',
    bu: 'Technology',
    dept: 'Engineering',
    location: 'Remote',
    skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    tags: ['Internal', 'Remote'],
    descriptionRich: 'Build and maintain infrastructure...',
    visibilityStart: '2024-01-01T00:00:00Z',
    visibilityEnd: '2024-08-31T23:59:59Z',
    salaryBandVisible: true,
    status: 'OPEN',
    createdBy: 'hr-admin',
    updatedAt: '2024-01-20T10:00:00Z',
    matchScore: 90,
    isSaved: false
  }
];

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Mock IJP API responses
const handleIjpMockRequests = (config: any) => {
  const url = config.url || '';
  
  // Mock IJP postings endpoint
  if (url.includes('/api/ijp/postings') && config.method === 'get') {
    return Promise.resolve({
      data: {
        data: mockIjpPostings,
        success: true,
        timestamp: new Date().toISOString()
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    });
  }
  
  // Mock other IJP endpoints
  if (url.includes('/api/ijp/')) {
    return Promise.resolve({
      data: {
        data: [],
        success: true,
        timestamp: new Date().toISOString(),
        message: 'Mock endpoint'
      },
      status: 200,
      statusText: 'OK', 
      headers: {},
      config
    });
  }
  
  return null; // Let normal requests proceed
};

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Check for IJP mock requests first
    const mockResponse = await handleIjpMockRequests(config);
    if (mockResponse) {
      // For mock requests, we need to bypass the actual request
      return Promise.reject({ 
        ...mockResponse,
        __isMock: true,
        config 
      });
    }
    
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add request timestamp
    ;(config as any).metadata = { startTime: new Date() }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time
    const endTime = new Date()
    const startTime = (response.config as any).metadata?.startTime
    if (startTime) {
      const duration = endTime.getTime() - startTime.getTime()
      console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url} took ${duration}ms`)
    }
    
    return response
  },
  (error) => {
    // Handle mock responses
    if (error.__isMock) {
      return Promise.resolve(error);
    }
    
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    
    if (error.response?.status === 403) {
      // Forbidden - show error message
      console.error('Access denied:', error.response.data?.message)
    }
    
    if (error.response?.status >= 500) {
      // Server error - show generic error
      console.error('Server error:', error.response.data?.message)
    }
    
    return Promise.reject(error)
  }
)

// Generic API methods
export class ApiService {
  static async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.get<ApiResponse<T>>(endpoint, config)
    return response.data
  }
  
  static async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.post<ApiResponse<T>>(endpoint, data, config)
    return response.data
  }
  
  static async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.put<ApiResponse<T>>(endpoint, data, config)
    return response.data
  }
  
  static async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.patch<ApiResponse<T>>(endpoint, data, config)
    return response.data
  }
  
  static async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await apiClient.delete<ApiResponse<T>>(endpoint, config)
    return response.data
  }
  
  static async getPaginated<T>(
    endpoint: string,
    params?: { page?: number; limit?: number; [key: string]: any }
  ): Promise<PaginatedResponse<T>> {
    const response = await apiClient.get<PaginatedResponse<T>>(endpoint, { params })
    return response.data
  }
}

// Error handling utility
export const handleApiError = (error: any): ApiError => {
  if (error.response?.data) {
    return {
      message: error.response.data.message || 'An error occurred',
      code: error.response.data.code || 'UNKNOWN_ERROR',
      details: error.response.data.details,
      timestamp: new Date().toISOString(),
    }
  }
  
  if (error.request) {
    return {
      message: 'Network error - please check your connection',
      code: 'NETWORK_ERROR',
      timestamp: new Date().toISOString(),
    }
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString(),
  }
}

export default apiClient