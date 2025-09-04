// Pipeline Module Types

export interface PipelineApplication {
  id: string
  candidateName: string
  jdId: string
  jdTitle: string
  client: string
  recruiterName: string
  currentStatus: ApplicationStatus
  lastUpdated: string
  notes: string
  updatedBy: string
  submittedAt: string
  statusHistory: StatusHistoryEntry[]
}

export type ApplicationStatus = 
  | 'Submitted'
  | 'L1 Cleared'
  | 'L2 Cleared'
  | 'L3 Cleared'
  | 'HR Cleared'
  | 'Offer'
  | 'Rejected'

export interface StatusHistoryEntry {
  id: string
  previousStatus?: ApplicationStatus
  newStatus: ApplicationStatus
  changedBy: string
  changedAt: string
  comment?: string
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

export interface PipelineFilters {
  jdTitle?: string
  client?: string
  recruiter?: string
  statuses?: ApplicationStatus[]
  dateRange?: {
    start: string
    end: string
  }
}

export interface PipelineMetrics {
  totalActiveJDs: number
  totalApplications: number
  avgTimeToOffer: number
  dropoffRate: number
  offerAcceptanceRatio: number
  jdsWithNoSubmissions: number
  dailySubmissions: { date: string; count: number }[]
}

export interface FunnelData {
  stage: ApplicationStatus
  count: number
  conversionRate: number
  dropoffRate: number
}

export interface RecruiterPerformance {
  recruiterId: string
  recruiterName: string
  submissions: number
  l1Clears: number
  offersMade: number
  offersAccepted: number
  avgTimeToOffer: number
  offerToJoinRatio: number
}

export interface BulkStatusUpdate {
  applicationIds: string[]
  newStatus: ApplicationStatus
  comment?: string
}

export interface PipelineAuditEntry {
  id: string
  applicationId: string
  candidateName: string
  action: string
  previousValue?: string
  newValue?: string
  changedBy: string
  changedAt: string
  comment?: string
}