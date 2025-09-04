// Profile Data Types for Employee Profile Management

export interface BusinessUnit {
  id: string
  name: string
}

export interface Department {
  id: string
  name: string
}

export interface CostCenter {
  id: string
  code: string
  name?: string
}

export interface EmployeeProfile {
  id: string
  employee_code: string // Employee ID
  first_name: string
  last_name: string
  role_title: string
  email: string
  phone?: string
  city?: string
  country?: string
  business_unit_id?: string
  department_id?: string
  cost_center_id?: string
  manager_employee_id?: string
  about?: string
  interests?: string[] // Array of interest strings
  photo_url?: string
  created_at: string
  updated_at: string

  // Related data (populated)
  manager?: {
    id: string
    first_name: string
    last_name: string
    role_title: string
    email: string
    photo_url?: string
  }
  reports?: Array<{
    id: string
    first_name: string
    last_name: string
    role_title: string
    email: string
    photo_url?: string
  }>
  business_unit?: BusinessUnit
  department?: Department
  cost_center?: CostCenter
}

export interface ProfileUpdateData {
  phone?: string
  city?: string
  country?: string
  about?: string
  interests?: string[]
}

export interface ProfileCorrectionRequest {
  field: string
  current_value: string
  requested_value: string
  reason: string
}

// Validation schemas
export const VALIDATION_RULES = {
  phone: {
    pattern: /^\+[1-9]\d{1,14}$/, // E.164 format
    message: 'Phone must be in E.164 format (e.g., +1234567890)'
  },
  city: {
    maxLength: 80,
    message: 'City name must be 80 characters or less'
  },
  country: {
    maxLength: 80,
    message: 'Country name must be 80 characters or less'
  },
  about: {
    maxLength: 1000,
    message: 'About section must be 1000 characters or less'
  },
  interest: {
    maxLength: 40,
    message: 'Each interest must be 40 characters or less'
  }
}