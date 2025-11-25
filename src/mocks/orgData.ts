import type { 
  EmployeeCard, 
  OrgNode, 
  OrgEdge, 
  PolicyFolder, 
  PolicyDoc, 
  PolicyAck, 
  SearchFilters 
} from '@/types/org';

// Mock employee directory data
export const mockEmployees: EmployeeCard[] = [
  {
    id: 'emp1',
    display_name: 'Anita Rao',
    title: 'Engineering Manager',
    department_name: 'Engineering',
    city: 'Bangalore',
    country: 'India',
    manager: { id: 'emp10', name: 'Vikram Singh' },
    avatar_url: '/placeholder.svg'
  },
  {
    id: 'emp2',
    display_name: 'Pavan Kumar',
    title: 'Senior Software Engineer',
    department_name: 'Engineering',
    city: 'Hyderabad',
    country: 'India',
    manager: { id: 'emp1', name: 'Anita Rao' },
    avatar_url: '/placeholder.svg'
  },
  {
    id: 'emp3',
    display_name: 'Meera Shah',
    title: 'Product Manager',
    department_name: 'Product',
    city: 'Mumbai',
    country: 'India',
    manager: { id: 'emp11', name: 'Rajesh Gupta' },
    avatar_url: '/placeholder.svg'
  },
  {
    id: 'emp4',
    display_name: 'Karthik Reddy',
    title: 'Frontend Developer',
    department_name: 'Engineering',
    city: 'Bangalore',
    country: 'India',
    manager: { id: 'emp1', name: 'Anita Rao' },
    avatar_url: '/placeholder.svg'
  },
  {
    id: 'emp5',
    display_name: 'Priya Nair',
    title: 'HR Business Partner',
    department_name: 'Human Resources',
    city: 'Kochi',
    country: 'India',
    manager: { id: 'emp12', name: 'Sunita Verma' },
    avatar_url: '/placeholder.svg'
  }
];

// Mock org structure data
export const mockOrgNodes: OrgNode[] = [
  {
    id: 'emp10',
    display_name: 'Vikram Singh',
    title: 'VP Engineering',
    dept: 'Engineering',
    city: 'Bangalore',
    country: 'India',
    has_reports: true,
    direct_reports_count: 3,
    avatar_url: '/placeholder.svg'
  },
  {
    id: 'emp1',
    display_name: 'Anita Rao',
    title: 'Engineering Manager',
    dept: 'Engineering',
    city: 'Bangalore',
    country: 'India',
    has_reports: true,
    direct_reports_count: 5,
    avatar_url: '/placeholder.svg',
    manager_id: 'emp10'
  },
  {
    id: 'emp2',
    display_name: 'Pavan Kumar',
    title: 'Senior Software Engineer',
    dept: 'Engineering',
    city: 'Hyderabad',
    country: 'India',
    has_reports: false,
    direct_reports_count: 0,
    avatar_url: '/placeholder.svg',
    manager_id: 'emp1'
  },
  {
    id: 'emp4',
    display_name: 'Karthik Reddy',
    title: 'Frontend Developer',
    dept: 'Engineering',
    city: 'Bangalore',
    country: 'India',
    has_reports: false,
    direct_reports_count: 0,
    avatar_url: '/placeholder.svg',
    manager_id: 'emp1'
  }
];

export const mockOrgEdges: OrgEdge[] = [
  { from: 'emp10', to: 'emp1', type: 'manager' },
  { from: 'emp1', to: 'emp2', type: 'manager' },
  { from: 'emp1', to: 'emp4', type: 'manager' }
];

// Mock policy folders
export const mockPolicyFolders: PolicyFolder[] = [
  {
    id: 'folder1',
    name: 'HR Policies',
    path: '/hr-policies',
    children: [
      {
        id: 'folder2',
        name: 'Leave & Attendance',
        parent_id: 'folder1',
        path: '/hr-policies/leave-attendance'
      },
      {
        id: 'folder3',
        name: 'Code of Conduct',
        parent_id: 'folder1',
        path: '/hr-policies/code-conduct'
      }
    ]
  },
  {
    id: 'folder4',
    name: 'IT Policies',
    path: '/it-policies',
    children: [
      {
        id: 'folder5',
        name: 'Security',
        parent_id: 'folder4',
        path: '/it-policies/security'
      }
    ]
  }
];

// Mock policy documents
export const mockPolicyDocs: PolicyDoc[] = [
  {
    id: 'doc1',
    folder_id: 'folder2',
    title: 'Annual Leave Policy',
    version: '2.1',
    file_url: '/policies/annual-leave-policy-v2.1.pdf',
    file_sha256: 'a1b2c3d4e5f6...',
    effective_from: '2025-01-01T00:00:00Z',
    expires_on: '2025-12-31T23:59:59Z',
    is_mandatory: true,
    visibility_json: { audience: 'all' },
    owner_id: 'emp5',
    owner_name: 'Priya Nair',
    updated_at: '2025-08-15T10:30:00Z'
  },
  {
    id: 'doc2',
    folder_id: 'folder3',
    title: 'Employee Code of Conduct',
    version: '1.0',
    file_url: '/policies/code-of-conduct-v1.0.pdf',
    file_sha256: 'f1e2d3c4b5a6...',
    effective_from: '2025-01-01T00:00:00Z',
    is_mandatory: true,
    visibility_json: { audience: 'all' },
    owner_id: 'emp5',
    owner_name: 'Priya Nair',
    updated_at: '2025-07-20T14:15:00Z'
  },
  {
    id: 'doc3',
    folder_id: 'folder5',
    title: 'Data Security Guidelines',
    version: '1.2',
    file_url: '/policies/data-security-v1.2.pdf',
    file_sha256: 'g2h3i4j5k6l7...',
    effective_from: '2025-01-01T00:00:00Z',
    is_mandatory: false,
    visibility_json: { audience: { departments: ['Engineering', 'IT'] } },
    owner_id: 'emp6',
    owner_name: 'Tech Admin',
    updated_at: '2025-08-01T09:45:00Z'
  }
];

// Mock policy acknowledgements
export const mockPolicyAcks: PolicyAck[] = [
  {
    id: 'ack1',
    policy_id: 'doc2',
    policy_title: 'Employee Code of Conduct',
    policy_version: '1.0',
    policy_sha256: 'f1e2d3c4b5a6...',
    typed_name: 'Pavan Kumar',
    acknowledged_at: '2025-07-25T11:30:00Z'
  }
];

// Mock search filters
export const mockSearchFilters: SearchFilters = {
  departments: [
    { id: 'dept1', name: 'Engineering' },
    { id: 'dept2', name: 'Product' },
    { id: 'dept3', name: 'Human Resources' },
    { id: 'dept4', name: 'Marketing' }
  ],
  managers: [
    { id: 'emp1', name: 'Anita Rao' },
    { id: 'emp10', name: 'Vikram Singh' },
    { id: 'emp11', name: 'Rajesh Gupta' }
  ],
  cities: ['Bangalore', 'Hyderabad', 'Mumbai', 'Delhi', 'Kochi'],
  countries: ['India', 'USA', 'UK', 'Singapore']
};