// Profile Data Types for Employee Profile Management

export interface BusinessUnit {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface CostCenter {
  id: string;
  code: string;
  name?: string;
}

export interface EmployeeProfile {
  id: string;
  employee_code: string; // Employee ID
  first_name: string;
  last_name: string;
  role_title: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  business_unit_id?: string;
  department_id?: string;
  cost_center_id?: string;
  manager_employee_id?: string;
  about?: string;
  interests?: string[]; // Array of interest strings
  photo_url?: string;
  created_at: string;
  updated_at: string;
  date_of_joining?: string;
  notice_period?: string;
  band?: string;
  personal_email?: string;
  temporary_address?: string;
  permanent_address?: string;
  alternate_phone?: string;
  date_of_birth?: string;
  blood_group?: string;
  family_details?: FamilyMember[];
  gender?: string;
  marital_status?: string;
  is_physically_handicapped?: boolean;
  nationality?: string;

  // New employment fields
  employee_type?: string;
  shifts?: string;
  week_off?: string;
  leaves_policy?: string;
  attendance_policy?: string;
  work_location?: string;

  // Related data (populated)
  manager?: {
    id: string;
    first_name: string;
    last_name: string;
    role_title: string;
    email: string;
    photo_url?: string;
  };
  reports?: Array<{
    id: string;
    first_name: string;
    last_name: string;
    role_title: string;
    email: string;
    photo_url?: string;
  }>;
  direct_reports?: Array<{
    id: string;
    first_name: string;
    last_name: string;
    role_title: string;
    email: string;
    photo_url?: string;
  }>;
  business_unit?: BusinessUnit;
  department?: Department;
  cost_center?: CostCenter;
}

export interface ProfileUpdateData {
  phone?: string;
  city?: string;
  country?: string;
  about?: string;
  interests?: string[];
  personal_email?: string;
  temporary_address?: string;
  permanent_address?: string;
  alternate_phone?: string;
  date_of_birth?: string;
  blood_group?: string;
  family_details?: FamilyMember[];
  gender?: string;
  marital_status?: string;
  is_physically_handicapped?: boolean;
  nationality?: string;
  section?: string;
}

export interface ProfileCorrectionRequest {
  field: string;
  current_value: string;
  requested_value: string;
  reason: string;
}

// Family Member interface
export interface FamilyMember {
  id: string;
  relationship: "Father" | "Mother" | "Spouse" | "Child";
  name: string;
  phone?: string;
  occupation?: string;
  date_of_birth?: string;
  gender?: "Male" | "Female" | "Other";
}

// Blood group options
export const BLOOD_GROUP_OPTIONS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;
export type BloodGroup = (typeof BLOOD_GROUP_OPTIONS)[number];

// Gender options
export const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;
export type Gender = (typeof GENDER_OPTIONS)[number];

// Marital status options
export const MARITAL_STATUS_OPTIONS = [
  "Single",
  "Married",
  "Divorced",
  "Widowed",
] as const;
export type MaritalStatus = (typeof MARITAL_STATUS_OPTIONS)[number];

// Nationality options
export const NATIONALITY_OPTIONS = [
  "Indian",
  "American",
  "British",
  "Canadian",
  "Australian",
  "Other",
] as const;
export type Nationality = (typeof NATIONALITY_OPTIONS)[number];

// Employment field options
export const DEPARTMENT_OPTIONS = [
  "IT-BA",
  "IT-DevOps",
  "IT-UI Development",
  "IT-Java",
] as const;

export const EMPLOYEE_TYPE_OPTIONS = [
  "FTE", // Full-Time Employee
  "FTDE", // Full-Time Deputy Employee
  "Intern",
] as const;

export const SHIFTS_OPTIONS = [
  "Regular",
  "US Shift",
  "Day Light Saving",
] as const;

export const WEEK_OFF_OPTIONS = ["Sat-Sun Off", "Sun Off"] as const;

export const LEAVES_POLICY_OPTIONS = [
  "Standard",
  "Client Support",
  "Interns",
] as const;

export const ATTENDANCE_POLICY_OPTIONS = [
  "Work from Office",
  "Client Support",
] as const;

export const COST_CENTER_OPTIONS = [
  "Cost Center",
  "India Engineering",
  "India Finance",
  "India HR",
  "India Sales",
  "India Others",
  "US Recruitment",
  "India Recruitment",
  "US Engineering",
  "India IT & System Admin",
  "India Staffing",
] as const;

export const WORK_LOCATION_OPTIONS = ["Hyderabad", "Bangalore"] as const;

// Validation schemas
export const VALIDATION_RULES = {
  phone: {
    pattern: /^(\+)?[1-9]\d{1,14}$/, // E.164 format (+ optional)
    message: "Phone must be valid (e.g., +1234567890 or 1234567890)",
  },
  city: {
    maxLength: 80,
    message: "City name must be 80 characters or less",
  },
  country: {
    maxLength: 80,
    message: "Country name must be 80 characters or less",
  },
  about: {
    maxLength: 1000,
    message: "About section must be 1000 characters or less",
  },
  interest: {
    maxLength: 40,
    message: "Each interest must be 40 characters or less",
  },
  familyMemberName: {
    maxLength: 100,
    message: "Family member name must be 100 characters or less",
  },
};
