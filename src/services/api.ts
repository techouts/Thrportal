import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiResponse, ApiError, PaginatedResponse } from '@/types'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/data'
const API_TIMEOUT = 30000

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
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