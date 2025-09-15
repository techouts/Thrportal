// Candidates Security Types

export interface CandidatePermission {
  id: string;
  action: CandidateAction;
  resource: CandidateResource;
  description: string;
  category: PermissionCategory;
}

export type CandidateAction = 
  | 'view' 
  | 'create' 
  | 'edit' 
  | 'delete'
  | 'submit'
  | 'approve'
  | 'reject'
  | 'reassign'
  | 'schedule'
  | 'update_status'
  | 'add_notes'
  | 'link_jd'
  | 'upload_documents'
  | 'view_sensitive'
  | 'escalate'
  | 'export'
  | 'share'
  | 'lock'
  | 'override';

export type CandidateResource = 
  | 'candidate_profile'
  | 'candidate_resume'
  | 'candidate_documents'
  | 'candidate_communication'
  | 'candidate_timeline'
  | 'candidate_offers'
  | 'candidate_submissions'
  | 'candidate_interviews'
  | 'talent_pools'
  | 'candidate_reports'
  | 'candidate_analytics'
  | 'candidate_audit_logs'
  | 'candidate_feedback'
  | 'candidate_bgv'
  | 'candidate_consent';

export type PermissionCategory = 
  | 'candidate_management'
  | 'submission_workflow'
  | 'interview_process'
  | 'offer_management'
  | 'talent_pools'
  | 'reporting_analytics'
  | 'compliance_security'
  | 'administration';

export interface RolePermissionMatrix {
  roleId: string;
  roleName: string;
  permissions: {
    [key: string]: boolean; // permission ID -> enabled/disabled
  };
  restrictions: RoleRestriction[];
}

export interface RoleRestriction {
  id: string;
  type: RestrictionType;
  description: string;
  condition?: string;
}

export type RestrictionType = 
  | 'data_access'
  | 'time_based'
  | 'location_based'
  | 'approval_required'
  | 'audit_required'
  | 'escalation_required';

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: CandidateAction;
  resource: CandidateResource;
  resourceId: string;
  resourceName?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  details?: Record<string, any>;
  previousValue?: any;
  newValue?: any;
}

export interface PermissionCheck {
  userId: string;
  permission: string;
  resourceId?: string;
  context?: Record<string, any>;
}

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
  restrictions?: string[];
  auditRequired?: boolean;
}

export interface SecurityConfiguration {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  roles: RolePermissionMatrix[];
  auditSettings: AuditSettings;
  complianceSettings: ComplianceSettings;
  updatedAt: string;
  updatedBy: string;
}

export interface AuditSettings {
  enableAuditLogging: boolean;
  retentionDays: number;
  logSuccessfulActions: boolean;
  logFailedActions: boolean;
  logDataAccess: boolean;
  logPermissionChanges: boolean;
  realTimeAlerts: boolean;
  alertThresholds: {
    failedLoginAttempts: number;
    suspiciousActivityScore: number;
  };
}

export interface ComplianceSettings {
  gdprEnabled: boolean;
  dpdpEnabled: boolean;
  consentRequired: boolean;
  dataRetentionDays: number;
  anonymizationEnabled: boolean;
  rightToForgotten: boolean;
  dataPortability: boolean;
  consentWithdrawalEnabled: boolean;
}

// Predefined role configurations
export const CANDIDATE_ROLES = {
  RECRUITER: 'RECRUITER',
  STAFFING_MANAGER: 'STAFFING_MANAGER', 
  HR_MANAGER: 'HR_MANAGER',
  HIRING_MANAGER: 'HIRING_MANAGER',
  LEADERSHIP: 'LEADERSHIP',
  CLIENT_SPOC: 'CLIENT_SPOC',
  ADMIN: 'ADMIN'
} as const;

export type CandidateRole = typeof CANDIDATE_ROLES[keyof typeof CANDIDATE_ROLES];

// Default permission definitions
export const DEFAULT_CANDIDATE_PERMISSIONS: CandidatePermission[] = [
  // Candidate Management
  {
    id: 'candidate.view',
    action: 'view',
    resource: 'candidate_profile',
    description: 'View candidate profiles and basic information',
    category: 'candidate_management'
  },
  {
    id: 'candidate.create',
    action: 'create',
    resource: 'candidate_profile',
    description: 'Create new candidate profiles',
    category: 'candidate_management'
  },
  {
    id: 'candidate.edit',
    action: 'edit',
    resource: 'candidate_profile',
    description: 'Edit candidate profiles and information',
    category: 'candidate_management'
  },
  {
    id: 'candidate.view_sensitive',
    action: 'view_sensitive',
    resource: 'candidate_profile',
    description: 'View sensitive candidate information (salary, personal details)',
    category: 'candidate_management'
  },
  {
    id: 'candidate.reassign',
    action: 'reassign',
    resource: 'candidate_profile',
    description: 'Reassign candidates between recruiters',
    category: 'candidate_management'
  },
  
  // Resume & Documents
  {
    id: 'resume.upload',
    action: 'upload_documents',
    resource: 'candidate_resume',
    description: 'Upload candidate resumes and documents',
    category: 'candidate_management'
  },
  {
    id: 'documents.view',
    action: 'view',
    resource: 'candidate_documents',
    description: 'View candidate documents and files',
    category: 'candidate_management'
  },
  
  // Submission Workflow
  {
    id: 'submission.create',
    action: 'submit',
    resource: 'candidate_submissions',
    description: 'Submit candidates to job descriptions',
    category: 'submission_workflow'
  },
  {
    id: 'submission.approve',
    action: 'approve',
    resource: 'candidate_submissions',
    description: 'Approve candidate submissions before client',
    category: 'submission_workflow'
  },
  {
    id: 'jd.link',
    action: 'link_jd',
    resource: 'candidate_profile',
    description: 'Link candidates to job descriptions',
    category: 'submission_workflow'
  },
  
  // Interview Process
  {
    id: 'interview.schedule',
    action: 'schedule',
    resource: 'candidate_interviews',
    description: 'Schedule candidate interviews',
    category: 'interview_process'
  },
  {
    id: 'interview.feedback',
    action: 'edit',
    resource: 'candidate_feedback',
    description: 'Provide interview feedback',
    category: 'interview_process'
  },
  
  // Status Management
  {
    id: 'status.update',
    action: 'update_status',
    resource: 'candidate_timeline',
    description: 'Update candidate status and timeline',
    category: 'candidate_management'
  },
  {
    id: 'notes.add',
    action: 'add_notes',
    resource: 'candidate_communication',
    description: 'Add notes and communication logs',
    category: 'candidate_management'
  },
  
  // Offer Management
  {
    id: 'offer.create',
    action: 'create',
    resource: 'candidate_offers',
    description: 'Create candidate offers',
    category: 'offer_management'
  },
  {
    id: 'offer.approve',
    action: 'approve',
    resource: 'candidate_offers',
    description: 'Approve candidate offers',
    category: 'offer_management'
  },
  
  // Talent Pools
  {
    id: 'pools.create',
    action: 'create',
    resource: 'talent_pools',
    description: 'Create and manage talent pools',
    category: 'talent_pools'
  },
  {
    id: 'pools.share',
    action: 'share',
    resource: 'talent_pools',
    description: 'Share talent pools with other users',
    category: 'talent_pools'
  },
  {
    id: 'pools.lock',
    action: 'lock',
    resource: 'talent_pools',
    description: 'Lock/unlock talent pools',
    category: 'talent_pools'
  },
  
  // Reporting & Analytics
  {
    id: 'reports.view',
    action: 'view',
    resource: 'candidate_reports',
    description: 'View candidate reports and dashboards',
    category: 'reporting_analytics'
  },
  {
    id: 'analytics.view',
    action: 'view',
    resource: 'candidate_analytics',
    description: 'View candidate analytics and metrics',
    category: 'reporting_analytics'
  },
  {
    id: 'data.export',
    action: 'export',
    resource: 'candidate_reports',
    description: 'Export candidate data and reports',
    category: 'reporting_analytics'
  },
  
  // Compliance & Security
  {
    id: 'consent.manage',
    action: 'edit',
    resource: 'candidate_consent',
    description: 'Manage candidate consent and GDPR compliance',
    category: 'compliance_security'
  },
  {
    id: 'bgv.manage',
    action: 'edit',
    resource: 'candidate_bgv',
    description: 'Manage background verification processes',
    category: 'compliance_security'
  },
  {
    id: 'audit.view',
    action: 'view',
    resource: 'candidate_audit_logs',
    description: 'View audit logs and security events',
    category: 'compliance_security'
  },
  
  // SLA & Escalation
  {
    id: 'sla.override',
    action: 'override',
    resource: 'candidate_timeline',
    description: 'Override SLA breaches and timelines',
    category: 'administration'
  },
  {
    id: 'escalate',
    action: 'escalate',
    resource: 'candidate_profile',
    description: 'Escalate candidate issues and SLA breaches',
    category: 'administration'
  }
];

// Default role permission matrices
export const DEFAULT_ROLE_PERMISSIONS: Record<CandidateRole, string[]> = {
  RECRUITER: [
    'candidate.view',
    'candidate.create', 
    'candidate.edit',
    'resume.upload',
    'documents.view',
    'submission.create',
    'jd.link',
    'interview.schedule',
    'status.update',
    'notes.add',
    'pools.create',
    'reports.view'
  ],
  
  STAFFING_MANAGER: [
    'candidate.view',
    'candidate.view_sensitive',
    'candidate.reassign',
    'submission.approve',
    'interview.feedback',
    'pools.share',
    'pools.lock',
    'reports.view',
    'analytics.view',
    'escalate'
  ],
  
  HR_MANAGER: [
    'candidate.view',
    'candidate.view_sensitive',
    'consent.manage',
    'bgv.manage',
    'offer.approve',
    'reports.view',
    'analytics.view',
    'audit.view',
    'data.export'
  ],
  
  HIRING_MANAGER: [
    'candidate.view',
    'candidate.view_sensitive',
    'submission.approve',
    'interview.feedback',
    'offer.create',
    'offer.approve',
    'reports.view'
  ],
  
  LEADERSHIP: [
    'reports.view',
    'analytics.view',
    'audit.view'
  ],
  
  CLIENT_SPOC: [
    'candidate.view',
    'interview.feedback'
  ],
  
  ADMIN: [
    // All permissions
    ...DEFAULT_CANDIDATE_PERMISSIONS.map(p => p.id),
    'sla.override'
  ]
};