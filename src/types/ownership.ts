// Ownership Management Types

export interface JDOwnership {
  id: string;
  jdId: string;
  jdTitle: string;
  primaryRecruiter: string;
  collaborators: string[];
  openPoolFlag: boolean;
  perRecruiterSubmissionCap: number;
  staffingManager: string;
  clientSpoc: string;
  status: JDStatus;
  isLocked: boolean;
  submissionsByRecruiter: Record<string, number>;
  submissionsToday: number;
  submissionsTotal: number;
  firstSubmitAge: number; // hours since first submission
  slaStatus: SlaStatus;
  slaDeadline: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export type JDStatus = 'Active' | 'On Hold' | 'Closed' | 'Draft' | 'Cancelled';
export type SlaStatus = 'On Track' | 'Amber' | 'Red' | 'No Submission';

export interface CandidateOwnership {
  id: string;
  candidateId: string;
  candidateName: string;
  recruiterOwner: string;
  jdLinks: Array<{ jdId: string; jobTitle: string; clientName: string }>;
  currentStage: CandidateStage;
  lastUpdated: string;
  assignedAt: string;
  assignedBy: string;
}

export type CandidateStage = 'New' | 'Shortlisted' | 'Submitted' | 'Interview' | 'Offer' | 'Joined' | 'Rejected';

export interface ClientSpocMapping {
  id: string;
  clientId: string;
  clientName: string;
  primarySpoc: string;
  primarySpocId: string;
  secondarySpoc?: string;
  secondarySpocId?: string;
  assignedRecruiters: string[];
  assignedRecruiterIds: string[];
  jdCount: number;
  avgTurnaroundTime: number;
  feedbackAgeing: number;
  slaAdherence: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecruiterManagerMapping {
  id: string;
  recruiterId: string;
  recruiterName: string;
  staffingManagerId: string;
  staffingManagerName: string;
  activeJDs: number;
  activeCandidates: number;
  workloadScore: number;
  assignedAt: string;
  assignedBy: string;
}

export interface TalentPoolOwnership {
  id: string;
  poolId: string;
  poolName: string;
  owner: string;
  accessLevel: PoolAccessLevel;
  allowedUsers: string[];
  restrictedUsers: string[];
  tags: string[];
  candidateCount: number;
  usageCount: number;
  lastUsed: string;
  createdAt: string;
  isLocked: boolean;
  lockedBy?: string;
}

export type PoolAccessLevel = 'Private' | 'Team' | 'Department' | 'Public';

export interface EscalationRule {
  id: string;
  name: string;
  description: string;
  triggerType: EscalationTrigger;
  thresholdDays: number;
  escalationChain: EscalationStep[];
  notificationMethods: NotificationMethod[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EscalationTrigger = 
  | 'SLA_BREACH'
  | 'NO_SUBMISSION'
  | 'DELAYED_FEEDBACK'
  | 'INACTIVE_CANDIDATE'
  | 'STALE_JD';

export interface EscalationStep {
  level: number;
  role: string;
  userId?: string;
  autoAssign: boolean;
  timeoutHours: number;
}

export type NotificationMethod = 'Email' | 'WhatsApp' | 'Slack' | 'SMS';

export interface OwnershipChangeLog {
  id: string;
  resourceType: OwnershipResourceType;
  resourceId: string;
  resourceName: string;
  changeType: OwnershipChangeType;
  fromValue?: string;
  toValue?: string;
  changedBy: string;
  changedAt: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export type OwnershipResourceType = 'JD' | 'Candidate' | 'Client' | 'TalentPool' | 'RecruiterMapping';
export type OwnershipChangeType = 'Assign' | 'Reassign' | 'Unassign' | 'Lock' | 'Unlock' | 'Transfer';

export interface WorkloadDistribution {
  recruiterId: string;
  recruiterName: string;
  activeJDs: number;
  activeCandidates: number;
  weeklySubmissions: number;
  workloadScore: number;
  utilizationRate: number;
  slaCompliance: number;
  status: RecruiterStatus;
}

export type RecruiterStatus = 'Active' | 'Idle' | 'Overloaded' | 'On Leave';

export interface ManagerDashboard {
  managerId: string;
  managerName: string;
  teamSize: number;
  teamJDs: number;
  teamCandidates: number;
  teamSlaCompliance: number;
  pipelineHealth: number;
  avgResponseTime: number;
  escalationsReceived: number;
  escalationsResolved: number;
}

export interface ClientSlaReport {
  clientId: string;
  clientName: string;
  spocName: string;
  totalJDs: number;
  avgTurnaroundTime: number;
  feedbackDelay: number;
  slaBreaches: number;
  slaAdherence: number;
  riskLevel: RiskLevel;
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface OrphanReport {
  unassignedCandidates: OrphanCandidate[];
  unlinkedJDs: OrphanJD[];
  inactiveOwners: InactiveOwner[];
  staleAssignments: StaleAssignment[];
}

export interface OrphanCandidate {
  candidateId: string;
  candidateName: string;
  daysSinceCreated: number;
  lastActivity: string;
  source: string;
}

export interface OrphanJD {
  jdId: string;
  jdTitle: string;
  client: string;
  daysSinceCreated: number;
  priority: string;
}

export interface InactiveOwner {
  ownerId: string;
  ownerName: string;
  role: string;
  assignedResources: number;
  lastActivity: string;
  daysInactive: number;
}

export interface StaleAssignment {
  resourceType: string;
  resourceId: string;
  resourceName: string;
  owner: string;
  assignedAt: string;
  daysStale: number;
  recommendedAction: string;
}

export interface OwnershipFilters {
  recruiter?: string;
  manager?: string;
  client?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  workloadRange?: {
    min: number;
    max: number;
  };
}

export interface BulkOwnershipOperation {
  operation: BulkOperationType;
  resourceIds: string[];
  targetOwnerId?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export type BulkOperationType = 'REASSIGN' | 'TRANSFER' | 'LOCK' | 'UNLOCK' | 'TAG' | 'UNTAG';

export interface OwnershipMetrics {
  totalJDs: number;
  totalCandidates: number;
  totalMappings: number;
  avgWorkloadScore: number;
  balanceIndex: number;
  escalationRate: number;
  reassignmentRate: number;
  ownershipVelocity: number;
}

export interface JDSubmission {
  id: string;
  jdId: string;
  candidateId: string;
  candidateName: string;
  submitterId: string;
  submitterName: string;
  stage: string;
  age: number; // hours
  sentToClient: boolean;
  sentBy?: string;
  sentAt?: string;
  clientFeedback?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionBreakdown {
  jdId: string;
  jdTitle: string;
  primary: string;
  recruiterSubmissions: Array<{
    recruiterId: string;
    recruiterName: string;
    submissions: number;
    shortlistRate: number;
    offers: number;
    joins: number;
  }>;
}

export interface PrimaryFollowUp {
  id: string;
  jdId: string;
  jdTitle: string;
  candidateId: string;
  candidateName: string;
  followUpType: FollowUpType;
  age: number; // hours
  nextSlaDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  notes?: string;
}

export type FollowUpType = 'Client Feedback' | 'Scheduling' | 'Offer Follow-up' | 'Document Collection';

export interface OwnershipRules {
  creditRules: CreditRules;
  dedupeKeys: DedupeConfig;
  submissionCaps: SubmissionCapConfig;
  openPoolDefaults: OpenPoolConfig;
}

export interface CreditRules {
  submitterCredit: number;
  primaryFollowUpCredit: number;
  customSchemes: Array<{
    name: string;
    submitterCredit: number;
    primaryCredit: number;
    conditions: string;
  }>;
}

export interface DedupeConfig {
  keys: Array<'email' | 'phone' | 'resume_hash'>;
  mode: 'strict' | 'soft';
  blockDuplicates: boolean;
}

export interface SubmissionCapConfig {
  defaultDailyCap: number;
  enforceAtJDLevel: boolean;
  allowOverrides: boolean;
}

export interface OpenPoolConfig {
  defaultAllowCollaborators: boolean;
  requireApproval: boolean;
  autoNotifyPrimary: boolean;
}

export interface RecruiterCreditWidget {
  recruiterId: string;
  recruiterName: string;
  submitterCredits: {
    count: number;
    creditEarned: number;
  };
  primaryCredits: {
    count: number;
    creditEarned: number;
  };
  totalCredit: number;
  period: string;
}

export interface NoSubmissionReport {
  jdId: string;
  jdTitle: string;
  client: string;
  recruiterOwner: string;
  slaDeadline: string;
  submissionsCount: number;
  daysSincePosted: number;
  daysPastDeadline?: number;
  riskLevel: RiskLevel;
}

export interface NoSubmissionWidget {
  jdsLast24h: number;
  jdsLast7d: number;
  totalOpenJds: number;
  criticalJds: number;
}

export interface SpocDashboard {
  spocId: string;
  spocName: string;
  clientName: string;
  assignedJDs: SpocJD[];
  avgTurnaroundTime: number;
  feedbackPending: number;
  slaBreaches: number;
  responsePattern: ResponsePattern;
}

export interface SpocJD {
  jdId: string;
  jdTitle: string;
  assignedRecruiter: string;
  submittedCandidates: number;
  pendingFeedback: number;
  daysSinceSubmission: number;
  status: string;
}

export interface ResponsePattern {
  avgResponseHours: number;
  bestResponseTime: number;
  worstResponseTime: number;
  timeSlotPreferences: TimeSlotPreference[];
}

export interface TimeSlotPreference {
  timeSlot: string;
  responseRate: number;
  avgResponseTime: number;
}

export interface EscalationEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  fromUser: string;
  toUser: string;
  escalationLevel: number;
  reason: string;
  triggeredAt: string;
  resolvedAt?: string;
  status: EscalationStatus;
  actions: EscalationAction[];
}

export type EscalationStatus = 'Triggered' | 'In Progress' | 'Resolved' | 'Cancelled' | 'Overridden';

export interface EscalationAction {
  id: string;
  actionType: string;
  performedBy: string;
  performedAt: string;
  description: string;
  result: string;
}