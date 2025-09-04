// Mock data for employee profiles

import type { EmployeeProfile, BusinessUnit, Department, CostCenter } from '@/types/profile'

export const mockBusinessUnits: BusinessUnit[] = [
  { id: 'bu1', name: 'Engineering' },
  { id: 'bu2', name: 'Product' },
  { id: 'bu3', name: 'Sales' },
  { id: 'bu4', name: 'Marketing' }
]

export const mockDepartments: Department[] = [
  { id: 'dept1', name: 'Frontend Development' },
  { id: 'dept2', name: 'Backend Development' },
  { id: 'dept3', name: 'Product Management' },
  { id: 'dept4', name: 'Sales Operations' }
]

export const mockCostCenters: CostCenter[] = [
  { id: 'cc1', code: 'ENG001', name: 'Engineering Core' },
  { id: 'cc2', code: 'PROD001', name: 'Product Development' },
  { id: 'cc3', code: 'SALES001', name: 'Sales Team' },
  { id: 'cc4', code: 'MKT001', name: 'Marketing Operations' }
]

export const sampleEmployeeProfile: EmployeeProfile = {
  id: 'emp1',
  employee_code: 'EMP001',
  first_name: 'Pavan',
  last_name: 'Kumar',
  role_title: 'Senior Software Engineer',
  email: 'pavan.kumar@company.com',
  phone: '+919876543210',
  city: 'Hyderabad',
  country: 'India',
  business_unit_id: 'bu1',
  department_id: 'dept1',
  cost_center_id: 'cc1',
  manager_employee_id: 'mgr1',
  about: 'Passionate software engineer with 5+ years of experience in React, TypeScript, and modern web technologies. I enjoy building scalable applications and mentoring junior developers.',
  interests: ['React', 'TypeScript', 'Open Source', 'Photography', 'Travel', 'Gaming'],
  photo_url: '/placeholder.svg',
  created_at: '2023-01-15T09:00:00.000Z',
  updated_at: '2025-09-04T10:30:00.000Z',
  
  manager: {
    id: 'mgr1',
    first_name: 'Anita',
    last_name: 'Rao',
    role_title: 'Engineering Manager',
    email: 'anita.rao@company.com',
    photo_url: '/placeholder.svg'
  },
  
  reports: [
    {
      id: 'emp2',
      first_name: 'Karthik',
      last_name: 'Singh',
      role_title: 'Software Engineer',
      email: 'karthik.singh@company.com',
      photo_url: '/placeholder.svg'
    },
    {
      id: 'emp3',
      first_name: 'Meera',
      last_name: 'Patel',
      role_title: 'Junior Software Engineer',
      email: 'meera.patel@company.com',
      photo_url: '/placeholder.svg'
    }
  ],
  
  business_unit: mockBusinessUnits[0],
  department: mockDepartments[0],
  cost_center: mockCostCenters[0]
}

// Another employee profile for org directory view
export const sampleOtherEmployeeProfile: EmployeeProfile = {
  id: 'emp4',
  employee_code: 'EMP004',
  first_name: 'Rahul',
  last_name: 'Sharma',
  role_title: 'Product Manager',
  email: 'rahul.sharma@company.com',
  phone: '+919123456789',
  city: 'Bangalore',
  country: 'India',
  business_unit_id: 'bu2',
  department_id: 'dept3',
  cost_center_id: 'cc2',
  manager_employee_id: 'mgr2',
  about: 'Experienced product manager focused on user-centric design and data-driven decisions.',
  interests: ['Product Strategy', 'UX Design', 'Data Analytics', 'Cricket'],
  photo_url: '/placeholder.svg',
  created_at: '2022-08-10T09:00:00.000Z',
  updated_at: '2025-09-04T08:15:00.000Z',
  
  manager: {
    id: 'mgr2',
    first_name: 'Priya',
    last_name: 'Gupta',
    role_title: 'VP Product',
    email: 'priya.gupta@company.com',
    photo_url: '/placeholder.svg'
  },
  
  reports: [],
  
  business_unit: mockBusinessUnits[1],
  department: mockDepartments[2],
  cost_center: mockCostCenters[1]
}