// Pipeline Module Types

export interface PipelineApplication {
  id: string
  candidateName: string
  jdId: string
  jdTitle: string
  client: string
  recruiterName: string
  primaryRecruiter?: string
  submittedBy: string
  currentStatus: ApplicationStatus
  currentRound?: string
  lastUpdated: string
  notes: string
  updatedBy: string
  submittedAt: string
  ageing: number
  slaStatus: 'on-time' | 'due-today' | 'overdue'
  nextAction?: string
  statusHistory: StatusHistoryEntry[]
}

export type ApplicationStatus = 
  | 'Submitted'
  | 'Shortlisted'
  | 'Interview-R1'
  | 'Interview-R2'
  | 'Interview-R3'
  | 'Interview-HR'
  | 'Interview-Client'
  | 'Feedback-Pending'
  | 'Offer-Pending'
  | 'Offer-Released'
  | 'Offer-Accepted'
  | 'Offer-Rejected'
  | 'Joined'
  | 'Rejected'
  | 'Withdrawn'

export interface StatusHistoryEntry {
  id: string
  previousStatus?: ApplicationStatus
  newStatus: ApplicationStatus
  changedBy: string
  changedAt: string
  comment?: string
  slaBreached?: boolean
}

export interface ActiveJD {
  id: string
  title: string
  client: string
  postedDate: string
  assignedRecruiter?: string
  daysSinceCreated: number
  hasSubmissions: boolean
}

export interface JDPipeline {
  id: string
  title: string
  client: string
  approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected'
  headcountApproved: number
  headcountRemaining: number
  submissions: number
  shortlisted: number
  interviews: number
  offers: number
  joins: number
  slaHealth: 'good' | 'warning' | 'critical'
  primaryRecruiter?: string
  lastActivity: string
  applications: PipelineApplication[]
}

export interface PipelineFilters {
  client?: string
  jdTitle?: string
  recruiter?: string
  round?: string
  statuses?: ApplicationStatus[]
  slaStatus?: ('on-time' | 'due-today' | 'overdue')[]
  dateRange?: {
    start: string
    end: string
  }
}

export interface PipelineMetrics {
  totalApplications: number
  totalJDs: number
  globalFunnel: FunnelStage[]
  slaHealth: SLAHealth
  headcountProgress: HeadcountProgress
  bottlenecks: Bottleneck[]
}

export interface FunnelStage {
  stage: ApplicationStatus
  count: number
  conversionRate: number
  dropoffRate: number
}

export interface SLAHealth {
  onTimePercent: number
  overdueCount: number
  dueTodayCount: number
  stageBreakdown: {
    stage: string
    onTime: number
    overdue: number
  }[]
}

export interface HeadcountProgress {
  approved: number
  filled: number
  remaining: number
  byClient: {
    client: string
    approved: number
    filled: number
    remaining: number
  }[]
}

export interface Bottleneck {
  stage: ApplicationStatus
  count: number
  avgAgeing: number
  description: string
}

export interface RecruiterPipelineStats {
  recruiterId: string
  recruiterName: string
  activeJDs: number
  activeCandidates: number
  submissions: number
  shortlistPercent: number
  offerPercent: number
  joinPercent: number
  funnel: {
    asSubmitter: FunnelStage[]
    asPrimary: FunnelStage[]
  }
  slaHeatmap: {
    dueToday: number
    overdue: number
  }
  todos: PipelineTodo[]
}

export interface PipelineTodo {
  id: string
  type: 'follow-up' | 'schedule' | 'feedback' | 'reminder'
  jdId: string
  jdTitle: string
  candidateName: string
  description: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
}

export interface TeamPipelineStats {
  teamFunnel: {
    recruiter: string
    funnel: FunnelStage[]
  }[]
  atRiskJDs: {
    jdId: string
    jdTitle: string
    client: string
    issue: string
    daysSinceLastSubmission: number
  }[]
  roundStalls: {
    round: string
    count: number
    avgAgeing: number
  }[]
}

export interface LeadershipInsight {
  type: 'redistribution' | 'sourcing' | 'sla-breach' | 'forecast'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  actionable: boolean
  clientId?: string
  jdIds?: string[]
}

export interface ClientProgress {
  clientId: string
  clientName: string
  totalHeadcount: number
  filledPositions: number
  progressPercent: number
  avgFeedbackTime: number
  slaBreaches: number
  stuckJDs: number
  forecast: {
    submissionsNeeded: number
    estimatedCompletionDays: number
  }
}

export interface PipelineAlert {
  id: string
  type: 'sla-breach' | 'productivity-nudge' | 'escalation-needed'
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  targetRole: ('recruiter' | 'manager' | 'leadership')[]
  jdId?: string
  candidateId?: string
  recruiterId?: string
  createdAt: string
  actionTaken?: string
  actionBy?: string
  actionAt?: string
}

export interface PipelineAuditEntry {
  id: string
  applicationId?: string
  jdId?: string
  candidateName?: string
  action: 'status-change' | 'reassignment' | 'reminder-sent' | 'escalation' | 'override'
  actor: string
  actorRole: string
  previousValue?: string
  newValue?: string
  timestamp: string
  comment?: string
  context?: any
}

export interface BulkStatusUpdate {
  applicationIds: string[]
  newStatus: ApplicationStatus
  comment?: string
  overrideReason?: string
}

export interface ReminderAction {
  type: 'email' | 'whatsapp' | 'slack'
  recipientIds: string[]
  message: string
  jdIds?: string[]
  applicationIds?: string[]
}

export interface EscalationAction {
  applicationId: string
  fromRole: string
  toRole: string
  reason: string
  urgency: 'normal' | 'high' | 'critical'
}

export interface PipelineSettings {
  slaTimers: {
    [stage: string]: {
      defaultHours: number
      clientOverrides: { [clientId: string]: number }
      jdOverrides: { [jdId: string]: number }
    }
  }
  statusPermissions: {
    [role: string]: {
      canUpdate: ApplicationStatus[]
      requiresApproval: ApplicationStatus[]
      canOverride: boolean
    }
  }
  reminderSettings: {
    cadence: 'daily' | 'weekly'
    channels: ('email' | 'whatsapp' | 'slack')[]
    digestEnabled: boolean
  }
  integrationSettings: {
    ownershipSyncEnabled: boolean
    applicationsSyncEnabled: boolean
    approvalGatingEnabled: boolean
  }
}