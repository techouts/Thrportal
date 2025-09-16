import { faker } from '@faker-js/faker'
import { 
  Client, 
  Project, 
  Task, 
  RoleCatalog, 
  Allocation, 
  Timesheet, 
  Invoice,
  ProjectDashboardMetrics,
  UtilizationData,
  RoleHeatmapData,
  RevenueData,
  BenchEmployee,
  ShadowAllocation,
  ForecastData
} from '@/types/projects'

// ============= CRM INTEGRATION DATA =============
// Extended CRM entities that integrate with the CRM module structure

export interface CrmClient {
  id: string
  name: string
  domain: string
  industry: string
  location: string
  status: 'Active' | 'Inactive' | 'Prospect'
  health_score: number
  billing_model: string
  contract_type: string
  created_at: string
  updated_at: string
}

export interface CrmAccount {
  id: string
  client_id: string
  name: string
  type: 'Primary' | 'Secondary' | 'Support'
  primary_spoc_id: string
  sla_override?: string
  created_at: string
  updated_at: string
}

export interface CrmSpoc {
  id: string
  client_id: string
  account_id?: string
  name: string
  role: string
  email: string
  phone: string
  linkedin_url?: string
  is_primary: boolean
  last_contacted_at?: string
  created_at: string
  updated_at: string
}

export interface CrmProject {
  id: string
  client_id: string
  account_id: string
  name: string
  status: 'Planned' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  skills: string[]
  start_date?: string
  end_date?: string
  ft_target: number
  contract_target: number
  owner_id: string
  primary_spoc_id: string
  created_at: string
  updated_at: string
}

export interface EmployeeProfile {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  avatar: string
  department: string
  position: string
  manager: string
  location: string
  start_date: string
  status: 'Active' | 'Inactive' | 'On Leave'
  salary: number
  skills: string[]
  role_id: string
  cost_center: string
  emergency_contact: {
    name: string
    phone: string
    relationship: string
  }
}

// ============= ENHANCED CRM MOCK DATA =============

export const mockCrmClients: CrmClient[] = [
  {
    id: 'crm-1',
    name: 'Microsoft Corporation',
    domain: 'microsoft.com',
    industry: 'Technology',
    location: 'Redmond, WA',
    status: 'Active',
    health_score: 95,
    billing_model: 'T&M',
    contract_type: 'MSA',
    created_at: '2023-06-15T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z'
  },
  {
    id: 'crm-2',
    name: 'Amazon Web Services',
    domain: 'aws.amazon.com',
    industry: 'Cloud Computing',
    location: 'Seattle, WA',
    status: 'Active',
    health_score: 88,
    billing_model: 'Fixed Price',
    contract_type: 'SOW',
    created_at: '2023-08-20T00:00:00Z',
    updated_at: '2024-03-12T00:00:00Z'
  },
  {
    id: 'crm-3',
    name: 'Goldman Sachs',
    domain: 'gs.com',
    industry: 'Financial Services',
    location: 'New York, NY',
    status: 'Active',
    health_score: 92,
    billing_model: 'Retainer',
    contract_type: 'MSA',
    created_at: '2023-05-10T00:00:00Z',
    updated_at: '2024-03-08T00:00:00Z'
  },
  {
    id: 'crm-4',
    name: 'Tesla, Inc.',
    domain: 'tesla.com',
    industry: 'Automotive',
    location: 'Austin, TX',
    status: 'Active',
    health_score: 85,
    billing_model: 'T&M',
    contract_type: 'SOW',
    created_at: '2023-09-15T00:00:00Z',
    updated_at: '2024-03-05T00:00:00Z'
  },
  {
    id: 'crm-5',
    name: 'JPMorgan Chase',
    domain: 'jpmorgan.com',
    industry: 'Banking',
    location: 'New York, NY',
    status: 'Active',
    health_score: 90,
    billing_model: 'Fixed Price',
    contract_type: 'MSA',
    created_at: '2023-07-01T00:00:00Z',
    updated_at: '2024-03-14T00:00:00Z'
  },
  {
    id: 'crm-6',
    name: 'Salesforce',
    domain: 'salesforce.com',
    industry: 'SaaS',
    location: 'San Francisco, CA',
    status: 'Active',
    health_score: 87,
    billing_model: 'T&M',
    contract_type: 'SOW',
    created_at: '2023-10-05T00:00:00Z',
    updated_at: '2024-03-11T00:00:00Z'
  },
  {
    id: 'crm-7',
    name: 'Netflix',
    domain: 'netflix.com',
    industry: 'Entertainment',
    location: 'Los Gatos, CA',
    status: 'Active',
    health_score: 91,
    billing_model: 'Retainer',
    contract_type: 'MSA',
    created_at: '2023-04-20T00:00:00Z',
    updated_at: '2024-03-09T00:00:00Z'
  },
  {
    id: 'crm-8',
    name: 'Pfizer Inc.',
    domain: 'pfizer.com',
    industry: 'Pharmaceuticals',
    location: 'New York, NY',
    status: 'Active',
    health_score: 89,
    billing_model: 'Fixed Price',
    contract_type: 'SOW',
    created_at: '2023-11-12T00:00:00Z',
    updated_at: '2024-03-13T00:00:00Z'
  },
  {
    id: 'crm-9',
    name: 'Spotify Technology',
    domain: 'spotify.com',
    industry: 'Music Streaming',
    location: 'Stockholm, Sweden',
    status: 'Active',
    health_score: 86,
    billing_model: 'T&M',
    contract_type: 'MSA',
    created_at: '2023-12-01T00:00:00Z',
    updated_at: '2024-03-07T00:00:00Z'
  },
  {
    id: 'crm-10',
    name: 'Adobe Systems',
    domain: 'adobe.com',
    industry: 'Software',
    location: 'San Jose, CA',
    status: 'Prospect',
    health_score: 75,
    billing_model: 'T&M',
    contract_type: 'SOW',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z'
  }
]

export const mockCrmAccounts: CrmAccount[] = [
  // Microsoft Accounts
  { id: 'acc-1', client_id: 'crm-1', name: 'Azure Cloud Division', type: 'Primary', primary_spoc_id: 'spoc-1', created_at: '2023-06-15T00:00:00Z', updated_at: '2024-03-10T00:00:00Z' },
  { id: 'acc-2', client_id: 'crm-1', name: 'Office 365 Team', type: 'Secondary', primary_spoc_id: 'spoc-2', created_at: '2023-06-20T00:00:00Z', updated_at: '2024-03-10T00:00:00Z' },
  
  // AWS Accounts
  { id: 'acc-3', client_id: 'crm-2', name: 'EC2 Engineering', type: 'Primary', primary_spoc_id: 'spoc-3', created_at: '2023-08-20T00:00:00Z', updated_at: '2024-03-12T00:00:00Z' },
  { id: 'acc-4', client_id: 'crm-2', name: 'S3 Storage Team', type: 'Secondary', primary_spoc_id: 'spoc-4', created_at: '2023-08-25T00:00:00Z', updated_at: '2024-03-12T00:00:00Z' },
  
  // Goldman Sachs Accounts
  { id: 'acc-5', client_id: 'crm-3', name: 'Investment Banking', type: 'Primary', primary_spoc_id: 'spoc-5', created_at: '2023-05-10T00:00:00Z', updated_at: '2024-03-08T00:00:00Z' },
  { id: 'acc-6', client_id: 'crm-3', name: 'Risk Management', type: 'Secondary', primary_spoc_id: 'spoc-6', created_at: '2023-05-15T00:00:00Z', updated_at: '2024-03-08T00:00:00Z' },
  
  // Tesla Accounts
  { id: 'acc-7', client_id: 'crm-4', name: 'Autopilot Engineering', type: 'Primary', primary_spoc_id: 'spoc-7', created_at: '2023-09-15T00:00:00Z', updated_at: '2024-03-05T00:00:00Z' },
  { id: 'acc-8', client_id: 'crm-4', name: 'Energy Division', type: 'Secondary', primary_spoc_id: 'spoc-8', created_at: '2023-09-20T00:00:00Z', updated_at: '2024-03-05T00:00:00Z' },
  
  // JPMorgan Accounts
  { id: 'acc-9', client_id: 'crm-5', name: 'Digital Banking', type: 'Primary', primary_spoc_id: 'spoc-9', created_at: '2023-07-01T00:00:00Z', updated_at: '2024-03-14T00:00:00Z' },
  { id: 'acc-10', client_id: 'crm-5', name: 'Corporate Banking', type: 'Secondary', primary_spoc_id: 'spoc-10', created_at: '2023-07-05T00:00:00Z', updated_at: '2024-03-14T00:00:00Z' },
  
  // Salesforce Accounts
  { id: 'acc-11', client_id: 'crm-6', name: 'Sales Cloud', type: 'Primary', primary_spoc_id: 'spoc-11', created_at: '2023-10-05T00:00:00Z', updated_at: '2024-03-11T00:00:00Z' },
  { id: 'acc-12', client_id: 'crm-6', name: 'Service Cloud', type: 'Secondary', primary_spoc_id: 'spoc-12', created_at: '2023-10-10T00:00:00Z', updated_at: '2024-03-11T00:00:00Z' },
  
  // Netflix Accounts
  { id: 'acc-13', client_id: 'crm-7', name: 'Content Platform', type: 'Primary', primary_spoc_id: 'spoc-13', created_at: '2023-04-20T00:00:00Z', updated_at: '2024-03-09T00:00:00Z' },
  { id: 'acc-14', client_id: 'crm-7', name: 'Analytics Team', type: 'Secondary', primary_spoc_id: 'spoc-14', created_at: '2023-04-25T00:00:00Z', updated_at: '2024-03-09T00:00:00Z' },
  
  // Pfizer Accounts
  { id: 'acc-15', client_id: 'crm-8', name: 'Clinical Trials', type: 'Primary', primary_spoc_id: 'spoc-15', created_at: '2023-11-12T00:00:00Z', updated_at: '2024-03-13T00:00:00Z' },
  { id: 'acc-16', client_id: 'crm-8', name: 'Drug Discovery', type: 'Secondary', primary_spoc_id: 'spoc-16', created_at: '2023-11-15T00:00:00Z', updated_at: '2024-03-13T00:00:00Z' },
  
  // Spotify Accounts
  { id: 'acc-17', client_id: 'crm-9', name: 'Music Recommendation', type: 'Primary', primary_spoc_id: 'spoc-17', created_at: '2023-12-01T00:00:00Z', updated_at: '2024-03-07T00:00:00Z' },
  { id: 'acc-18', client_id: 'crm-9', name: 'Podcast Platform', type: 'Secondary', primary_spoc_id: 'spoc-18', created_at: '2023-12-05T00:00:00Z', updated_at: '2024-03-07T00:00:00Z' },
  
  // Adobe Accounts
  { id: 'acc-19', client_id: 'crm-10', name: 'Creative Cloud', type: 'Primary', primary_spoc_id: 'spoc-19', created_at: '2024-01-15T00:00:00Z', updated_at: '2024-03-15T00:00:00Z' },
  { id: 'acc-20', client_id: 'crm-10', name: 'Experience Cloud', type: 'Secondary', primary_spoc_id: 'spoc-20', created_at: '2024-01-20T00:00:00Z', updated_at: '2024-03-15T00:00:00Z' }
]

export const mockCrmSpocs: CrmSpoc[] = [
  // Microsoft SPOCs
  { id: 'spoc-1', client_id: 'crm-1', account_id: 'acc-1', name: 'Sarah Thompson', role: 'Engineering Manager', email: 'sarah.thompson@microsoft.com', phone: '+1-425-882-8080', linkedin_url: 'https://linkedin.com/in/sarah-thompson-ms', is_primary: true, last_contacted_at: '2024-03-10T00:00:00Z', created_at: '2023-06-15T00:00:00Z', updated_at: '2024-03-10T00:00:00Z' },
  { id: 'spoc-2', client_id: 'crm-1', account_id: 'acc-2', name: 'David Kim', role: 'Product Manager', email: 'david.kim@microsoft.com', phone: '+1-425-882-8081', linkedin_url: 'https://linkedin.com/in/david-kim-ms', is_primary: true, last_contacted_at: '2024-03-08T00:00:00Z', created_at: '2023-06-20T00:00:00Z', updated_at: '2024-03-10T00:00:00Z' },
  
  // AWS SPOCs
  { id: 'spoc-3', client_id: 'crm-2', account_id: 'acc-3', name: 'Jennifer Martinez', role: 'Technical Lead', email: 'jennifer.martinez@amazon.com', phone: '+1-206-266-1000', linkedin_url: 'https://linkedin.com/in/jennifer-martinez-aws', is_primary: true, last_contacted_at: '2024-03-12T00:00:00Z', created_at: '2023-08-20T00:00:00Z', updated_at: '2024-03-12T00:00:00Z' },
  { id: 'spoc-4', client_id: 'crm-2', account_id: 'acc-4', name: 'Michael Chen', role: 'Senior Engineer', email: 'michael.chen@amazon.com', phone: '+1-206-266-1001', linkedin_url: 'https://linkedin.com/in/michael-chen-aws', is_primary: true, last_contacted_at: '2024-03-11T00:00:00Z', created_at: '2023-08-25T00:00:00Z', updated_at: '2024-03-12T00:00:00Z' },
  
  // Goldman Sachs SPOCs
  { id: 'spoc-5', client_id: 'crm-3', account_id: 'acc-5', name: 'Robert Anderson', role: 'VP Technology', email: 'robert.anderson@gs.com', phone: '+1-212-902-1000', linkedin_url: 'https://linkedin.com/in/robert-anderson-gs', is_primary: true, last_contacted_at: '2024-03-08T00:00:00Z', created_at: '2023-05-10T00:00:00Z', updated_at: '2024-03-08T00:00:00Z' },
  { id: 'spoc-6', client_id: 'crm-3', account_id: 'acc-6', name: 'Lisa Wang', role: 'Risk Technology Director', email: 'lisa.wang@gs.com', phone: '+1-212-902-1001', linkedin_url: 'https://linkedin.com/in/lisa-wang-gs', is_primary: true, last_contacted_at: '2024-03-07T00:00:00Z', created_at: '2023-05-15T00:00:00Z', updated_at: '2024-03-08T00:00:00Z' },
  
  // Tesla SPOCs
  { id: 'spoc-7', client_id: 'crm-4', account_id: 'acc-7', name: 'Elon Rodriguez', role: 'Autopilot Director', email: 'elon.rodriguez@tesla.com', phone: '+1-512-516-8177', linkedin_url: 'https://linkedin.com/in/elon-rodriguez-tesla', is_primary: true, last_contacted_at: '2024-03-05T00:00:00Z', created_at: '2023-09-15T00:00:00Z', updated_at: '2024-03-05T00:00:00Z' },
  { id: 'spoc-8', client_id: 'crm-4', account_id: 'acc-8', name: 'Maria Gonzalez', role: 'Energy Engineering Lead', email: 'maria.gonzalez@tesla.com', phone: '+1-512-516-8178', linkedin_url: 'https://linkedin.com/in/maria-gonzalez-tesla', is_primary: true, last_contacted_at: '2024-03-04T00:00:00Z', created_at: '2023-09-20T00:00:00Z', updated_at: '2024-03-05T00:00:00Z' },
  
  // JPMorgan SPOCs
  { id: 'spoc-9', client_id: 'crm-5', account_id: 'acc-9', name: 'James Wilson', role: 'Digital Banking CTO', email: 'james.wilson@jpmorgan.com', phone: '+1-212-270-6000', linkedin_url: 'https://linkedin.com/in/james-wilson-jpmc', is_primary: true, last_contacted_at: '2024-03-14T00:00:00Z', created_at: '2023-07-01T00:00:00Z', updated_at: '2024-03-14T00:00:00Z' },
  { id: 'spoc-10', client_id: 'crm-5', account_id: 'acc-10', name: 'Patricia Lee', role: 'Corporate Tech Lead', email: 'patricia.lee@jpmorgan.com', phone: '+1-212-270-6001', linkedin_url: 'https://linkedin.com/in/patricia-lee-jpmc', is_primary: true, last_contacted_at: '2024-03-13T00:00:00Z', created_at: '2023-07-05T00:00:00Z', updated_at: '2024-03-14T00:00:00Z' },
  
  // Salesforce SPOCs
  { id: 'spoc-11', client_id: 'crm-6', account_id: 'acc-11', name: 'Mark Benioff Jr.', role: 'Sales Cloud PM', email: 'mark.benioff.jr@salesforce.com', phone: '+1-415-901-7000', linkedin_url: 'https://linkedin.com/in/mark-benioff-jr-sf', is_primary: true, last_contacted_at: '2024-03-11T00:00:00Z', created_at: '2023-10-05T00:00:00Z', updated_at: '2024-03-11T00:00:00Z' },
  { id: 'spoc-12', client_id: 'crm-6', account_id: 'acc-12', name: 'Susan Davis', role: 'Service Cloud Director', email: 'susan.davis@salesforce.com', phone: '+1-415-901-7001', linkedin_url: 'https://linkedin.com/in/susan-davis-sf', is_primary: true, last_contacted_at: '2024-03-10T00:00:00Z', created_at: '2023-10-10T00:00:00Z', updated_at: '2024-03-11T00:00:00Z' },
  
  // Netflix SPOCs
  { id: 'spoc-13', client_id: 'crm-7', account_id: 'acc-13', name: 'Reed Johnson', role: 'Content Platform VP', email: 'reed.johnson@netflix.com', phone: '+1-408-540-3700', linkedin_url: 'https://linkedin.com/in/reed-johnson-netflix', is_primary: true, last_contacted_at: '2024-03-09T00:00:00Z', created_at: '2023-04-20T00:00:00Z', updated_at: '2024-03-09T00:00:00Z' },
  { id: 'spoc-14', client_id: 'crm-7', account_id: 'acc-14', name: 'Anna Miller', role: 'Analytics Director', email: 'anna.miller@netflix.com', phone: '+1-408-540-3701', linkedin_url: 'https://linkedin.com/in/anna-miller-netflix', is_primary: true, last_contacted_at: '2024-03-08T00:00:00Z', created_at: '2023-04-25T00:00:00Z', updated_at: '2024-03-09T00:00:00Z' },
  
  // Pfizer SPOCs
  { id: 'spoc-15', client_id: 'crm-8', account_id: 'acc-15', name: 'Dr. Albert Bourla Jr.', role: 'Clinical Trials CTO', email: 'albert.bourla.jr@pfizer.com', phone: '+1-212-733-2323', linkedin_url: 'https://linkedin.com/in/albert-bourla-jr-pfizer', is_primary: true, last_contacted_at: '2024-03-13T00:00:00Z', created_at: '2023-11-12T00:00:00Z', updated_at: '2024-03-13T00:00:00Z' },
  { id: 'spoc-16', client_id: 'crm-8', account_id: 'acc-16', name: 'Dr. Sarah Cohen', role: 'Drug Discovery Lead', email: 'sarah.cohen@pfizer.com', phone: '+1-212-733-2324', linkedin_url: 'https://linkedin.com/in/sarah-cohen-pfizer', is_primary: true, last_contacted_at: '2024-03-12T00:00:00Z', created_at: '2023-11-15T00:00:00Z', updated_at: '2024-03-13T00:00:00Z' },
  
  // Spotify SPOCs
  { id: 'spoc-17', client_id: 'crm-9', account_id: 'acc-17', name: 'Daniel Ek Jr.', role: 'Recommendation Algorithms VP', email: 'daniel.ek.jr@spotify.com', phone: '+46-8-1234-5678', linkedin_url: 'https://linkedin.com/in/daniel-ek-jr-spotify', is_primary: true, last_contacted_at: '2024-03-07T00:00:00Z', created_at: '2023-12-01T00:00:00Z', updated_at: '2024-03-07T00:00:00Z' },
  { id: 'spoc-18', client_id: 'crm-9', account_id: 'acc-18', name: 'Joe Rogan Tech', role: 'Podcast Platform Director', email: 'joe.rogan.tech@spotify.com', phone: '+46-8-1234-5679', linkedin_url: 'https://linkedin.com/in/joe-rogan-tech-spotify', is_primary: true, last_contacted_at: '2024-03-06T00:00:00Z', created_at: '2023-12-05T00:00:00Z', updated_at: '2024-03-07T00:00:00Z' },
  
  // Adobe SPOCs
  { id: 'spoc-19', client_id: 'crm-10', account_id: 'acc-19', name: 'Shantanu Narayen Jr.', role: 'Creative Cloud VP', email: 'shantanu.narayen.jr@adobe.com', phone: '+1-408-536-6000', linkedin_url: 'https://linkedin.com/in/shantanu-narayen-jr-adobe', is_primary: true, last_contacted_at: '2024-03-15T00:00:00Z', created_at: '2024-01-15T00:00:00Z', updated_at: '2024-03-15T00:00:00Z' },
  { id: 'spoc-20', client_id: 'crm-10', account_id: 'acc-20', name: 'Anil Chakravarthy Jr.', role: 'Experience Cloud Director', email: 'anil.chakravarthy.jr@adobe.com', phone: '+1-408-536-6001', linkedin_url: 'https://linkedin.com/in/anil-chakravarthy-jr-adobe', is_primary: true, last_contacted_at: '2024-03-14T00:00:00Z', created_at: '2024-01-20T00:00:00Z', updated_at: '2024-03-15T00:00:00Z' }
]

// ============= ENHANCED PROJECTS MODULE DATA =============
// Projects that integrate with CRM hierarchy

export const mockClients: Client[] = [
  {
    id: 'crm-1',
    name: 'Microsoft Corporation',
    code: 'MSFT',
    billing_name: 'Microsoft Corporation',
    currency: 'USD',
    manager_id: 'emp-101',
    manager_name: 'Sarah Thompson',
    address: 'One Microsoft Way, Redmond, WA 98052',
    description: 'Global technology company providing cloud computing, productivity software, and enterprise solutions',
    created_at: '2023-06-15T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z'
  },
  {
    id: 'crm-2',
    name: 'Amazon Web Services',
    code: 'AWS',
    billing_name: 'Amazon Web Services, Inc.',
    currency: 'USD',
    manager_id: 'emp-102',
    manager_name: 'Jennifer Martinez',
    address: '410 Terry Ave N, Seattle, WA 98109',
    description: 'Leading cloud infrastructure and services provider',
    created_at: '2023-08-20T00:00:00Z',
    updated_at: '2024-03-12T00:00:00Z'
  },
  {
    id: 'crm-3',
    name: 'Goldman Sachs',
    code: 'GS',
    billing_name: 'The Goldman Sachs Group, Inc.',
    currency: 'USD',
    manager_id: 'emp-103',
    manager_name: 'Robert Anderson',
    address: '200 West Street, New York, NY 10282',
    description: 'Global investment banking and financial services firm',
    created_at: '2023-05-10T00:00:00Z',
    updated_at: '2024-03-08T00:00:00Z'
  },
  {
    id: 'crm-4',
    name: 'Tesla, Inc.',
    code: 'TSLA',
    billing_name: 'Tesla, Inc.',
    currency: 'USD',
    manager_id: 'emp-104',
    manager_name: 'Elon Rodriguez',
    address: '1 Tesla Road, Austin, TX 78725',
    description: 'Electric vehicle and clean energy company',
    created_at: '2023-09-15T00:00:00Z',
    updated_at: '2024-03-05T00:00:00Z'
  },
  {
    id: 'crm-5',
    name: 'JPMorgan Chase',
    code: 'JPMC',
    billing_name: 'JPMorgan Chase & Co.',
    currency: 'USD',
    manager_id: 'emp-105',
    manager_name: 'James Wilson',
    address: '383 Madison Avenue, New York, NY 10017',
    description: 'Multinational investment bank and financial services holding company',
    created_at: '2023-07-01T00:00:00Z',
    updated_at: '2024-03-14T00:00:00Z'
  },
  {
    id: 'crm-6',
    name: 'Salesforce',
    code: 'CRM',
    billing_name: 'Salesforce, Inc.',
    currency: 'USD',
    manager_id: 'emp-106',
    manager_name: 'Mark Benioff Jr.',
    address: 'Salesforce Tower, 415 Mission St, San Francisco, CA 94105',
    description: 'Cloud-based software company providing customer relationship management services',
    created_at: '2023-10-05T00:00:00Z',
    updated_at: '2024-03-11T00:00:00Z'
  },
  {
    id: 'crm-7',
    name: 'Netflix',
    code: 'NFLX',
    billing_name: 'Netflix, Inc.',
    currency: 'USD',
    manager_id: 'emp-107',
    manager_name: 'Reed Johnson',
    address: '100 Winchester Circle, Los Gatos, CA 95032',
    description: 'Streaming entertainment service with TV series, documentaries and feature films',
    created_at: '2023-04-20T00:00:00Z',
    updated_at: '2024-03-09T00:00:00Z'
  },
  {
    id: 'crm-8',
    name: 'Pfizer Inc.',
    code: 'PFE',
    billing_name: 'Pfizer Inc.',
    currency: 'USD',
    manager_id: 'emp-108',
    manager_name: 'Dr. Albert Bourla Jr.',
    address: '235 East 42nd Street, New York, NY 10017',
    description: 'Global pharmaceutical and biotechnology corporation',
    created_at: '2023-11-12T00:00:00Z',
    updated_at: '2024-03-13T00:00:00Z'
  },
  {
    id: 'crm-9',
    name: 'Spotify Technology',
    code: 'SPOT',
    billing_name: 'Spotify Technology S.A.',
    currency: 'EUR',
    manager_id: 'emp-109',
    manager_name: 'Daniel Ek Jr.',
    address: 'Regeringsgatan 19, 111 53 Stockholm, Sweden',
    description: 'Audio streaming and media services provider',
    created_at: '2023-12-01T00:00:00Z',
    updated_at: '2024-03-07T00:00:00Z'
  },
  {
    id: 'crm-10',
    name: 'Adobe Systems',
    code: 'ADBE',
    billing_name: 'Adobe Inc.',
    currency: 'USD',
    manager_id: 'emp-110',
    manager_name: 'Shantanu Narayen Jr.',
    address: '345 Park Avenue, San Jose, CA 95110',
    description: 'Software company providing creative, marketing and document management solutions',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z'
  },
  {
    id: 'internal',
    name: 'Internal Operations',
    code: 'INT',
    billing_name: 'Internal Operations',
    currency: 'USD',
    manager_id: 'system',
    manager_name: 'System',
    address: 'N/A',
    description: 'Internal company operations and bench time',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

export const mockProjects: Project[] = [
  // Microsoft Projects
  {
    id: 'proj-1',
    client_id: 'crm-1',
    client_name: 'Microsoft Corporation',
    account_id: 'acc-1',
    account_name: 'Azure Cloud Division',
    code: 'MSFT-AZ-001',
    name: 'Azure AI Platform Enhancement',
    description: 'Enhance Azure AI services with new machine learning capabilities and improved performance',
    pm_id: 'emp-201',
    pm_name: 'Alex Rodriguez',
    status: 'active',
    start_date: '2024-01-15',
    end_date: '2024-08-15',
    billing_type: 'TM',
    allow_non_billable: true,
    allow_expenses: true,
    budget: 1200000,
    actual_cost: 420000,
    margin: 0.35,
    spoc_ids: ['spoc-1'],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z'
  },
  {
    id: 'proj-2',
    client_id: 'crm-1',
    client_name: 'Microsoft Corporation',
    account_id: 'acc-2',
    account_name: 'Office 365 Team',
    code: 'MSFT-O365-001',
    name: 'Office 365 Collaboration Suite',
    description: 'Develop new collaboration features for Office 365 including real-time co-authoring enhancements',
    pm_id: 'emp-202',
    pm_name: 'Jessica Park',
    status: 'active',
    start_date: '2024-02-01',
    end_date: '2024-09-30',
    billing_type: 'FIXED',
    allow_non_billable: false,
    allow_expenses: true,
    budget: 850000,
    actual_cost: 285000,
    margin: 0.28,
    spoc_ids: ['spoc-2'],
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z'
  },
  
  // AWS Projects
  {
    id: 'proj-3',
    client_id: 'crm-2',
    client_name: 'Amazon Web Services',
    account_id: 'acc-3',
    account_name: 'EC2 Engineering',
    code: 'AWS-EC2-001',
    name: 'EC2 Performance Optimization',
    description: 'Optimize EC2 instance performance and reduce latency for enterprise workloads',
    pm_id: 'emp-203',
    pm_name: 'Michael Chen',
    status: 'active',
    start_date: '2024-01-10',
    end_date: '2024-07-10',
    billing_type: 'TM',
    allow_non_billable: true,
    allow_expenses: true,
    budget: 950000,
    actual_cost: 380000,
    margin: 0.32,
    spoc_ids: ['spoc-3'],
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-03-12T00:00:00Z'
  },
  {
    id: 'proj-4',
    client_id: 'crm-2',
    client_name: 'Amazon Web Services',
    account_id: 'acc-4',
    account_name: 'S3 Storage Team',
    code: 'AWS-S3-001',
    name: 'S3 Security Enhancement',
    description: 'Implement advanced security features and encryption protocols for S3 storage',
    pm_id: 'emp-204',
    pm_name: 'Sarah Williams',
    status: 'active',
    start_date: '2024-03-01',
    end_date: '2024-10-31',
    billing_type: 'MILESTONE',
    allow_non_billable: true,
    allow_expenses: true,
    budget: 720000,
    actual_cost: 145000,
    margin: 0.31,
    spoc_ids: ['spoc-4'],
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-12T00:00:00Z'
  },
  
  // Goldman Sachs Projects
  {
    id: 'proj-5',
    client_id: 'crm-3',
    client_name: 'Goldman Sachs',
    account_id: 'acc-5',
    account_name: 'Investment Banking',
    code: 'GS-IB-001',
    name: 'Trading Platform Modernization',
    description: 'Modernize legacy trading systems with real-time analytics and risk management',
    pm_id: 'emp-205',
    pm_name: 'David Thompson',
    status: 'active',
    start_date: '2023-11-01',
    end_date: '2024-05-31',
    billing_type: 'RETAINER',
    allow_non_billable: false,
    allow_expenses: true,
    budget: 1500000,
    actual_cost: 980000,
    margin: 0.37,
    spoc_ids: ['spoc-5'],
    created_at: '2023-11-01T00:00:00Z',
    updated_at: '2024-03-08T00:00:00Z'
  },
  {
    id: 'proj-6',
    client_id: 'crm-3',
    client_name: 'Goldman Sachs',
    account_id: 'acc-6',
    account_name: 'Risk Management',
    code: 'GS-RM-001',
    name: 'Risk Analytics Platform',
    description: 'Build comprehensive risk analytics platform with machine learning capabilities',
    pm_id: 'emp-206',
    pm_name: 'Emily Davis',
    status: 'active',
    start_date: '2024-01-20',
    end_date: '2024-08-20',
    billing_type: 'TM',
    allow_non_billable: true,
    allow_expenses: true,
    budget: 1100000,
    actual_cost: 385000,
    margin: 0.34,
    spoc_ids: ['spoc-6'],
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-03-08T00:00:00Z'
  },
  
  // Tesla Projects
  {
    id: 'proj-7',
    client_id: 'crm-4',
    client_name: 'Tesla, Inc.',
    account_id: 'acc-7',
    account_name: 'Autopilot Engineering',
    code: 'TSLA-AP-001',
    name: 'Autopilot Neural Network Optimization',
    description: 'Optimize neural networks for faster processing and improved safety in autonomous driving',
    pm_id: 'emp-207',
    pm_name: 'Robert Lee',
    status: 'active',
    start_date: '2024-02-15',
    end_date: '2024-11-15',
    billing_type: 'TM',
    allow_non_billable: true,
    allow_expenses: true,
    budget: 2200000,
    actual_cost: 445000,
    margin: 0.33,
    spoc_ids: ['spoc-7'],
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-03-05T00:00:00Z'
  },
  {
    id: 'proj-8',
    client_id: 'crm-4',
    client_name: 'Tesla, Inc.',
    account_id: 'acc-8',
    account_name: 'Energy Division',
    code: 'TSLA-EN-001',
    name: 'Energy Grid Management System',
    description: 'Develop smart grid management system for Tesla energy storage solutions',
    pm_id: 'emp-208',
    pm_name: 'Lisa Martinez',
    status: 'active',
    start_date: '2024-03-10',
    end_date: '2024-12-10',
    billing_type: 'FIXED',
    allow_non_billable: false,
    allow_expenses: true,
    budget: 1350000,
    actual_cost: 185000,
    margin: 0.29,
    spoc_ids: ['spoc-8'],
    created_at: '2024-03-10T00:00:00Z',
    updated_at: '2024-03-05T00:00:00Z'
  },
  
  // JPMorgan Chase Projects
  {
    id: 'proj-9',
    client_id: 'crm-5',
    client_name: 'JPMorgan Chase',
    account_id: 'acc-9',
    account_name: 'Digital Banking',
    code: 'JPMC-DB-001',
    name: 'Digital Banking Mobile App',
    description: 'Develop next-generation mobile banking application with enhanced security features',
    pm_id: 'emp-209',
    pm_name: 'Kevin Anderson',
    status: 'active',
    start_date: '2024-01-05',
    end_date: '2024-06-05',
    billing_type: 'TM',
    allow_non_billable: true,
    allow_expenses: true,
    budget: 890000,
    actual_cost: 445000,
    margin: 0.30,
    spoc_ids: ['spoc-9'],
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-03-14T00:00:00Z'
  },
  {
    id: 'proj-10',
    client_id: 'crm-5',
    client_name: 'JPMorgan Chase',
    account_id: 'acc-10',
    account_name: 'Corporate Banking',
    code: 'JPMC-CB-001',
    name: 'Corporate Treasury Platform',
    description: 'Build comprehensive treasury management platform for corporate clients',
    pm_id: 'emp-210',
    pm_name: 'Amanda Wilson',
    status: 'active',
    start_date: '2024-02-20',
    end_date: '2024-09-20',
    billing_type: 'MILESTONE',
    allow_non_billable: true,
    allow_expenses: true,
    budget: 1250000,
    actual_cost: 285000,
    margin: 0.35,
    spoc_ids: ['spoc-10'],
    created_at: '2024-02-20T00:00:00Z',
    updated_at: '2024-03-14T00:00:00Z'
  },
  
  // Salesforce Projects
  {
    id: 'proj-11',
    client_id: 'crm-6',
    client_name: 'Salesforce',
    account_id: 'acc-11',
    account_name: 'Sales Cloud',
    code: 'CRM-SC-001',
    name: 'Sales Cloud AI Integration',
    description: 'Integrate advanced AI capabilities into Sales Cloud for predictive analytics',
    pm_id: 'emp-211',
    pm_name: 'Brian Taylor',
    status: 'active',
    start_date: '2024-01-25',
    end_date: '2024-07-25',
    billing_type: 'TM',
    allow_non_billable: true,
    allow_expenses: true,
    budget: 780000,
    actual_cost: 285000,
    margin: 0.31,
    spoc_ids: ['spoc-11'],
    created_at: '2024-01-25T00:00:00Z',
    updated_at: '2024-03-11T00:00:00Z'
  },
  {
    id: 'proj-12',
    client_id: 'crm-6',
    client_name: 'Salesforce',
    account_id: 'acc-12',
    account_name: 'Service Cloud',
    code: 'CRM-SVC-001',
    name: 'Service Cloud Automation',
    description: 'Automate customer service workflows with intelligent case routing and resolution',
    pm_id: 'emp-212',
    pm_name: 'Michelle Brown',
    status: 'completed',
    start_date: '2023-10-01',
    end_date: '2024-02-29',
    billing_type: 'FIXED',
    allow_non_billable: false,
    allow_expenses: true,
    budget: 650000,
    actual_cost: 485000,
    margin: 0.25,
    spoc_ids: ['spoc-12'],
    created_at: '2023-10-01T00:00:00Z',
    updated_at: '2024-03-11T00:00:00Z'
  },
  
  // Netflix Projects
  {
    id: 'proj-13',
    client_id: 'crm-7',
    client_name: 'Netflix',
    account_id: 'acc-13',
    account_name: 'Content Platform',
    code: 'NFLX-CP-001',
    name: 'Content Recommendation Engine V2',
    description: 'Next-generation recommendation engine using advanced machine learning algorithms',
    pm_id: 'emp-213',
    pm_name: 'Christopher Garcia',
    status: 'active',
    start_date: '2024-01-30',
    end_date: '2024-08-30',
    billing_type: 'TM',
    allow_non_billable: true,
    allow_expenses: true,
    budget: 1150000,
    actual_cost: 385000,
    margin: 0.36,
    spoc_ids: ['spoc-13'],
    created_at: '2024-01-30T00:00:00Z',
    updated_at: '2024-03-09T00:00:00Z'
  },
  {
    id: 'proj-14',
    client_id: 'crm-7',
    client_name: 'Netflix',
    account_id: 'acc-14',
    account_name: 'Analytics Team',
    code: 'NFLX-AN-001',
    name: 'Viewer Analytics Dashboard',
    description: 'Comprehensive analytics dashboard for content performance and viewer insights',
    pm_id: 'emp-214',
    pm_name: 'Patricia Johnson',
    status: 'on_hold',
    start_date: '2024-03-01',
    end_date: '2024-10-01',
    billing_type: 'MILESTONE',
    allow_non_billable: true,
    allow_expenses: true,
    budget: 520000,
    actual_cost: 85000,
    margin: 0.28,
    spoc_ids: ['spoc-14'],
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-09T00:00:00Z'
  },
  
  // Pfizer Projects
  {
    id: 'proj-15',
    client_id: 'crm-8',
    client_name: 'Pfizer Inc.',
    account_id: 'acc-15',
    account_name: 'Clinical Trials',
    code: 'PFE-CT-001',
    name: 'Clinical Trial Management System',
    description: 'Comprehensive system for managing clinical trials with real-time data collection and analysis',
    pm_id: 'emp-215',
    pm_name: 'Daniel Miller',
    status: 'active',
    start_date: '2024-02-10',
    end_date: '2024-11-10',
    billing_type: 'TM',
    allow_non_billable: true,
    allow_expenses: true,
    budget: 1680000,
    actual_cost: 485000,
    margin: 0.33,
    spoc_ids: ['spoc-15'],
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2024-03-13T00:00:00Z'
  },
  {
    id: 'proj-16',
    client_id: 'crm-8',
    client_name: 'Pfizer Inc.',
    account_id: 'acc-16',
    account_name: 'Drug Discovery',
    code: 'PFE-DD-001',
    name: 'AI-Powered Drug Discovery Platform',
    description: 'Machine learning platform for accelerating drug discovery and development processes',
    pm_id: 'emp-216',
    pm_name: 'Jennifer Davis',
    status: 'active',
    start_date: '2024-03-15',
    end_date: '2025-01-15',
    billing_type: 'RETAINER',
    allow_non_billable: false,
    allow_expenses: true,
    budget: 2150000,
    actual_cost: 285000,
    margin: 0.38,
    spoc_ids: ['spoc-16'],
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-13T00:00:00Z'
  },
  
  // Spotify Projects
  {
    id: 'proj-17',
    client_id: 'crm-9',
    client_name: 'Spotify Technology',
    account_id: 'acc-17',
    account_name: 'Music Recommendation',
    code: 'SPOT-MR-001',
    name: 'Personalized Playlist Generation',
    description: 'Advanced AI system for generating personalized playlists based on user behavior and preferences',
    pm_id: 'emp-217',
    pm_name: 'Matthew Wilson',
    status: 'active',
    start_date: '2024-02-05',
    end_date: '2024-09-05',
    billing_type: 'TM',
    allow_non_billable: true,
    allow_expenses: true,
    budget: 885000,
    actual_cost: 285000,
    margin: 0.32,
    spoc_ids: ['spoc-17'],
    created_at: '2024-02-05T00:00:00Z',
    updated_at: '2024-03-07T00:00:00Z'
  },
  {
    id: 'proj-18',
    client_id: 'crm-9',
    client_name: 'Spotify Technology',
    account_id: 'acc-18',
    account_name: 'Podcast Platform',
    code: 'SPOT-PP-001',
    name: 'Podcast Discovery Enhancement',
    description: 'Enhanced podcast discovery and recommendation system with transcript search capabilities',
    pm_id: 'emp-218',
    pm_name: 'Ashley Thompson',
    status: 'active',
    start_date: '2024-03-20',
    end_date: '2024-10-20',
    billing_type: 'FIXED',
    allow_non_billable: false,
    allow_expenses: true,
    budget: 620000,
    actual_cost: 145000,
    margin: 0.29,
    spoc_ids: ['spoc-18'],
    created_at: '2024-03-20T00:00:00Z',
    updated_at: '2024-03-07T00:00:00Z'
  },
  
  // Adobe Projects
  {
    id: 'proj-19',
    client_id: 'crm-10',
    client_name: 'Adobe Systems',
    account_id: 'acc-19',
    account_name: 'Creative Cloud',
    code: 'ADBE-CC-001',
    name: 'Creative Cloud AI Tools',
    description: 'Integration of advanced AI tools for creative professionals in Creative Cloud suite',
    pm_id: 'emp-219',
    pm_name: 'Joshua Martinez',
    status: 'active',
    start_date: '2024-03-25',
    end_date: '2024-12-25',
    billing_type: 'TM',
    allow_non_billable: true,
    allow_expenses: true,
    budget: 1250000,
    actual_cost: 185000,
    margin: 0.34,
    spoc_ids: ['spoc-19'],
    created_at: '2024-03-25T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z'
  },
  {
    id: 'proj-20',
    client_id: 'crm-10',
    client_name: 'Adobe Systems',
    account_id: 'acc-20',
    account_name: 'Experience Cloud',
    code: 'ADBE-EX-001',
    name: 'Customer Experience Analytics',
    description: 'Advanced analytics platform for customer experience optimization and personalization',
    pm_id: 'emp-220',
    pm_name: 'Stephanie Anderson',
    status: 'cancelled',
    start_date: '2024-02-01',
    end_date: '2024-08-01',
    billing_type: 'MILESTONE',
    allow_non_billable: true,
    allow_expenses: true,
    budget: 750000,
    actual_cost: 125000,
    margin: 0.15,
    spoc_ids: ['spoc-20'],
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z'
  },
  
  // Internal Projects
  {
    id: 'bench',
    client_id: 'internal',
    client_name: 'Internal Operations',
    code: 'BENCH',
    name: 'Bench Time',
    description: 'Unallocated employee time for training, upskilling, and internal projects',
    pm_id: 'system',
    pm_name: 'System',
    status: 'active',
    start_date: '2024-01-01',
    billing_type: 'TM',
    allow_non_billable: true,
    allow_expenses: false,
    budget: 0,
    actual_cost: 285000,
    margin: -1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z'
  },
  {
    id: 'training',
    client_id: 'internal',
    client_name: 'Internal Operations',
    code: 'TRAIN',
    name: 'Employee Training & Development',
    description: 'Internal training programs, certifications, and professional development initiatives',
    pm_id: 'emp-221',
    pm_name: 'Training Manager',
    status: 'active',
    start_date: '2024-01-01',
    billing_type: 'TM',
    allow_non_billable: true,
    allow_expenses: true,
    budget: 150000,
    actual_cost: 85000,
    margin: -1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z'
  }
]

// ============= ENHANCED EMPLOYEE PROFILES =============

export const mockEmployeeProfiles: EmployeeProfile[] = [
  { id: 'emp-301', employee_id: 'EMP001', first_name: 'John', last_name: 'Smith', email: 'john.smith@company.com', phone: '+1-555-0101', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face', department: 'Engineering', position: 'Senior Full Stack Developer', manager: 'emp-201', location: 'San Francisco, CA', start_date: '2022-03-15', status: 'Active', salary: 145000, skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'], role_id: 'role-1', cost_center: 'ENG-001', emergency_contact: { name: 'Jane Smith', phone: '+1-555-0102', relationship: 'Spouse' } },
  { id: 'emp-302', employee_id: 'EMP002', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah.johnson@company.com', phone: '+1-555-0103', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b72cceaa?w=64&h=64&fit=crop&crop=face', department: 'Engineering', position: 'Machine Learning Engineer', manager: 'emp-201', location: 'Seattle, WA', start_date: '2021-08-20', status: 'Active', salary: 155000, skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Kubernetes'], role_id: 'role-2', cost_center: 'ENG-001', emergency_contact: { name: 'Mike Johnson', phone: '+1-555-0104', relationship: 'Partner' } },
  { id: 'emp-303', employee_id: 'EMP003', first_name: 'Michael', last_name: 'Chen', email: 'michael.chen@company.com', phone: '+1-555-0105', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face', department: 'Engineering', position: 'DevOps Engineer', manager: 'emp-203', location: 'Austin, TX', start_date: '2023-01-10', status: 'Active', salary: 135000, skills: ['AWS', 'Terraform', 'Kubernetes', 'Python', 'Jenkins'], role_id: 'role-3', cost_center: 'ENG-002', emergency_contact: { name: 'Lisa Chen', phone: '+1-555-0106', relationship: 'Spouse' } }
]

export const mockTasks: Task[] = [
  // Microsoft Azure AI Platform Enhancement
  { id: 'task-1', project_id: 'proj-1', project_name: 'Azure AI Platform Enhancement', name: 'ML Model Optimization', description: 'Optimize machine learning models for better performance', stage: 'Development', phase: 'Phase 2', est_hours: 160, actual_hours: 145, billable: true, start_date: '2024-02-01', end_date: '2024-02-29', status: 'completed', assignees: ['emp-301', 'emp-302'], created_at: '2024-02-01T00:00:00Z', updated_at: '2024-02-29T00:00:00Z' },
  { id: 'task-2', project_id: 'proj-1', project_name: 'Azure AI Platform Enhancement', name: 'API Integration Testing', description: 'Comprehensive testing of AI service APIs', stage: 'Testing', phase: 'Phase 3', est_hours: 120, actual_hours: 95, billable: true, start_date: '2024-03-01', end_date: '2024-03-15', status: 'in_progress', assignees: ['emp-303'], created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-15T00:00:00Z' },
  
  // Tesla Autopilot Neural Network Optimization  
  { id: 'task-3', project_id: 'proj-7', project_name: 'Autopilot Neural Network Optimization', name: 'Neural Network Architecture Design', description: 'Design improved neural network architecture for autonomous driving', stage: 'Research', phase: 'Phase 1', est_hours: 200, actual_hours: 185, billable: true, start_date: '2024-02-15', end_date: '2024-03-15', status: 'completed', assignees: ['emp-302'], created_at: '2024-02-15T00:00:00Z', updated_at: '2024-03-15T00:00:00Z' },
  
  // Goldman Sachs Trading Platform
  { id: 'task-4', project_id: 'proj-5', project_name: 'Trading Platform Modernization', name: 'Real-time Data Processing', description: 'Implement real-time data processing for trading algorithms', stage: 'Development', phase: 'Phase 2', est_hours: 180, actual_hours: 165, billable: true, start_date: '2024-01-15', end_date: '2024-02-15', status: 'completed', assignees: ['emp-301', 'emp-303'], created_at: '2024-01-15T00:00:00Z', updated_at: '2024-02-15T00:00:00Z' }
]

export const mockRoles: RoleCatalog[] = [
  { id: 'role-1', name: 'Senior Full Stack Developer', suggested_cost_rate: 145 },
  { id: 'role-2', name: 'Machine Learning Engineer', suggested_cost_rate: 155 },
  { id: 'role-3', name: 'DevOps Engineer', suggested_cost_rate: 135 },
  { id: 'role-4', name: 'Senior Frontend Developer', suggested_cost_rate: 130 },
  { id: 'role-5', name: 'Backend Developer', suggested_cost_rate: 125 },
  { id: 'role-6', name: 'Data Engineer', suggested_cost_rate: 140 },
  { id: 'role-7', name: 'Security Engineer', suggested_cost_rate: 150 },
  { id: 'role-8', name: 'Mobile Developer', suggested_cost_rate: 120 },
  { id: 'role-9', name: 'UI/UX Designer', suggested_cost_rate: 110 },
  { id: 'role-10', name: 'Business Analyst', suggested_cost_rate: 95 },
  { id: 'role-11', name: 'Product Manager', suggested_cost_rate: 160 },
  { id: 'role-12', name: 'Tech Lead', suggested_cost_rate: 170 }
]

export const mockAllocations: Allocation[] = [
  {
    id: '1',
    employee_id: 'emp-1',
    employee_name: 'John Smith',
    project_id: '1',
    project_name: 'Digital Platform Modernization',
    role_id: '1',
    role_name: 'Senior Developer',
    type: 'ACTIVE',
    allocation_pct: 80,
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    bill_rate: 120,
    cost_rate: 85,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    employee_id: 'emp-2',
    employee_name: 'Jane Doe',
    project_id: '2',
    project_name: 'Mobile App Development',
    role_id: '5',
    role_name: 'UI/UX Designer',
    type: 'SHADOW',
    allocation_pct: 60,
    start_date: '2024-03-01',
    end_date: '2024-05-31',
    bill_rate: 95,
    cost_rate: 70,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z'
  },
  {
    id: '3',
    employee_id: 'emp-3',
    employee_name: 'Bob Johnson',
    project_id: 'bench',
    project_name: 'Bench Time',
    role_id: '2',
    role_name: 'Junior Developer',
    type: 'BENCH',
    allocation_pct: 100,
    start_date: '2024-03-15',
    bill_rate: 0,
    cost_rate: 55,
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z'
  }
]

export const mockTimesheets: Timesheet[] = [
  {
    id: '1',
    employee_id: 'emp-1',
    employee_name: 'John Smith',
    project_id: '1',
    project_name: 'Digital Platform Modernization',
    task_id: '1',
    task_name: 'Requirements Analysis',
    date: '2024-03-15',
    hours: 8,
    overtime_hours: 0,
    allocation_type_snapshot: 'ACTIVE',
    description: 'Completed requirements documentation',
    status: 'approved',
    approved_by: 'pm-1',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-16T00:00:00Z'
  },
  {
    id: '2',
    employee_id: 'emp-2',
    employee_name: 'Jane Doe',
    project_id: '2',
    project_name: 'Mobile App Development',
    task_id: '2',
    task_name: 'UI Design',
    date: '2024-03-15',
    hours: 6,
    overtime_hours: 2,
    allocation_type_snapshot: 'SHADOW',
    description: 'Created mobile app wireframes',
    status: 'submitted',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z'
  }
]

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    project_id: '1',
    project_name: 'Digital Platform Modernization',
    client_id: '1',
    client_name: 'Acme Corporation',
    amount: 85000,
    status: 'PAID',
    issued_on: '2024-02-01',
    due_on: '2024-03-01',
    paid_on: '2024-02-28',
    description: 'January 2024 - Development Services'
  },
  {
    id: '2',
    project_id: '2',
    project_name: 'Mobile App Development',
    client_id: '2',
    client_name: 'TechFlow Solutions',
    amount: 45000,
    status: 'PENDING',
    issued_on: '2024-03-01',
    due_on: '2024-04-01',
    description: 'February 2024 - Design Services'
  },
  {
    id: '3',
    project_id: '1',
    project_name: 'Digital Platform Modernization',
    client_id: '1',
    client_name: 'Acme Corporation',
    amount: 92000,
    status: 'OVERDUE',
    issued_on: '2024-01-15',
    due_on: '2024-02-15',
    description: 'December 2023 - Development Services'
  }
]

// Dashboard data
export const mockDashboardMetrics: ProjectDashboardMetrics = {
  active_projects: 8,
  core_utilization: 78.5,
  effective_utilization: 84.2,
  bench_cost_per_day: 2840,
  estimated_margin_ytd: 28.6,
  invoices_overdue: 3
}

export const mockUtilizationData: UtilizationData[] = [
  { period: '2024-01', billable: 75.2, bench: 18.3, shadow: 6.5 },
  { period: '2024-02', billable: 78.1, bench: 15.4, shadow: 6.5 },
  { period: '2024-03', billable: 82.3, bench: 12.1, shadow: 5.6 }
]

export const mockRoleHeatmapData: RoleHeatmapData[] = [
  { role: 'Senior Developer', billable_pct: 85.2, bench_pct: 8.1, shadow_pct: 6.7 },
  { role: 'Junior Developer', billable_pct: 72.5, bench_pct: 22.1, shadow_pct: 5.4 },
  { role: 'Project Manager', billable_pct: 92.1, bench_pct: 4.2, shadow_pct: 3.7 },
  { role: 'Business Analyst', billable_pct: 78.9, bench_pct: 15.2, shadow_pct: 5.9 },
  { role: 'UI/UX Designer', billable_pct: 76.3, bench_pct: 18.4, shadow_pct: 5.3 },
  { role: 'DevOps Engineer', billable_pct: 88.7, bench_pct: 7.1, shadow_pct: 4.2 }
]

export const mockRevenueData: RevenueData[] = [
  { period: '2024-01', revenue: 285000, cost: 198000, margin: 87000, shadow_cost: 12000 },
  { period: '2024-02', revenue: 312000, cost: 218000, margin: 94000, shadow_cost: 15000 },
  { period: '2024-03', revenue: 298000, cost: 205000, margin: 93000, shadow_cost: 11000 }
]

export const mockBenchEmployees: BenchEmployee[] = [
  {
    id: 'emp-3',
    name: 'Bob Johnson',
    role: 'Junior Developer',
    skills: ['React', 'JavaScript', 'Node.js'],
    available_from: '2024-03-15',
    daily_cost: 440,
    bench_days: 12,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
  },
  {
    id: 'emp-4',
    name: 'Alice Cooper',
    role: 'Business Analyst',
    skills: ['Requirements', 'Process Design', 'Stakeholder Management'],
    available_from: '2024-03-20',
    daily_cost: 600,
    bench_days: 8,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b72cceaa?w=32&h=32&fit=crop&crop=face'
  }
]

export const mockShadowAllocations: ShadowAllocation[] = [
  {
    id: '2',
    employee_id: 'emp-2',
    employee_name: 'Jane Doe',
    role: 'UI/UX Designer',
    target_project: 'Mobile App Development',
    start_date: '2024-03-01',
    allocation_pct: 60,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
  }
]

export const mockForecastData: ForecastData[] = [
  { week: '2024-W13', role: 'Senior Developer', needed: 5, available: 4, shadow_coverage: 80 },
  { week: '2024-W13', role: 'Junior Developer', needed: 3, available: 5, shadow_coverage: 100 },
  { week: '2024-W14', role: 'Senior Developer', needed: 6, available: 4, shadow_coverage: 67 },
  { week: '2024-W14', role: 'Junior Developer', needed: 4, available: 5, shadow_coverage: 100 }
]

// API mock functions
export const mockApiDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms))

export const generateMockTimesheet = (employeeId: string, projectId: string): Timesheet => ({
  id: faker.string.uuid(),
  employee_id: employeeId,
  employee_name: faker.person.fullName(),
  project_id: projectId,
  project_name: faker.company.buzzPhrase(),
  task_id: faker.string.uuid(),
  task_name: faker.hacker.phrase(),
  date: faker.date.recent().toISOString().split('T')[0],
  hours: faker.number.int({ min: 4, max: 8 }),
  overtime_hours: faker.number.int({ min: 0, max: 4 }),
  allocation_type_snapshot: faker.helpers.arrayElement(['ACTIVE', 'SHADOW', 'BENCH']),
  description: faker.lorem.sentence(),
  status: faker.helpers.arrayElement(['draft', 'submitted', 'approved', 'rejected']),
  created_at: faker.date.recent().toISOString(),
  updated_at: faker.date.recent().toISOString()
})

export const generateMockProject = (): Project => ({
  id: faker.string.uuid(),
  client_id: faker.string.uuid(),
  client_name: faker.company.name(),
  code: faker.string.alphanumeric(8).toUpperCase(),
  name: faker.company.buzzPhrase(),
  description: faker.lorem.paragraph(),
  pm_id: faker.string.uuid(),
  pm_name: faker.person.fullName(),
  status: faker.helpers.arrayElement(['active', 'completed', 'on_hold', 'cancelled']),
  start_date: faker.date.past().toISOString().split('T')[0],
  end_date: faker.date.future().toISOString().split('T')[0],
  billing_type: faker.helpers.arrayElement(['TM', 'FIXED', 'MILESTONE', 'RETAINER']),
  allow_non_billable: faker.datatype.boolean(),
  allow_expenses: faker.datatype.boolean(),
  budget: faker.number.int({ min: 50000, max: 1000000 }),
  actual_cost: faker.number.int({ min: 25000, max: 500000 }),
  margin: faker.number.float({ min: 0.1, max: 0.4, fractionDigits: 2 }),
  created_at: faker.date.past().toISOString(),
  updated_at: faker.date.recent().toISOString()
})