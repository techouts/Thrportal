// Organization module types

export interface EmployeeCard {
  id: string;
  display_name: string;
  title: string;
  department_name: string;
  city?: string;
  country?: string;
  manager?: {
    id: string;
    name: string;
  };
  avatar_url?: string;
}

export interface EmployeeSearchFilters {
  query?: string;
  managerId?: string;
  departmentId?: string;
  city?: string;
  country?: string;
  page?: number;
  pageSize?: number;
}

export interface EmployeeSearchResponse {
  employees: EmployeeCard[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Org Structure types
export interface OrgNode {
  id: string;
  display_name: string;
  title: string;
  dept: string;
  city?: string;
  country?: string;
  has_reports: boolean;
  direct_reports_count: number;
  avatar_url?: string;
  manager_id?: string;
}

export interface OrgEdge {
  from: string;
  to: string;
  type: 'manager' | 'dotted';
}

export interface OrgTreeResponse {
  nodes: OrgNode[];
  edges: OrgEdge[];
}

// Policy Hub types
export interface PolicyFolder {
  id: string;
  name: string;
  parent_id?: string;
  path: string;
  children?: PolicyFolder[];
}

export interface PolicyDoc {
  id: string;
  folder_id: string;
  title: string;
  version: string;
  file_url: string;
  file_sha256: string;
  effective_from: string;
  expires_on?: string;
  is_mandatory: boolean;
  visibility_json: any; // Audience rules
  owner_id: string;
  owner_name: string;
  updated_at: string;
}

export interface PolicyAck {
  id: string;
  policy_id: string;
  policy_title: string;
  policy_version: string;
  policy_sha256: string;
  typed_name: string;
  acknowledged_at: string;
}

export interface PolicyAckSubmission {
  policy_id: string;
  typed_name: string;
}

// Search and filter types
export interface SearchFilters {
  departments: Array<{ id: string; name: string }>;
  managers: Array<{ id: string; name: string }>;
  cities: string[];
  countries: string[];
}