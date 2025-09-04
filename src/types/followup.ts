// Follow-up Module Types

export type FollowupStatus = 
  | "SUBMITTED" 
  | "AWAITING_FEEDBACK" 
  | "FEEDBACK_RECEIVED" 
  | "REJECTED" 
  | "ON_HOLD" 
  | "FOLLOWUP_SCHEDULED" 
  | "ESCALATED" 
  | "CLOSED"

export type Channel = "EMAIL" | "WHATSAPP" | "CALL" | "IN_APP"

export type FeedbackOutcome = "SHORTLISTED" | "REJECTED" | "KEEP_WARM" | "REQUEST_INTERVIEW"

export interface FollowupSubmissionDTO {
  id: string
  jdId: string
  jdCode: string
  clientId: string
  clientName: string
  recruiterId: string
  recruiterName: string
  candidateId: string
  candidateName: string
  candidateEmail?: string
  submissionSource: "ATS" | "EMAIL_INGEST" | "MANUAL"
  submissionAt: string
  status: FollowupStatus
  lastClientResponseAt?: string
  followupCount: number
  nextFollowupAt?: string
  followupOwnerId?: string
  escalationFlag: boolean
  agingDays: number
  threadId?: string
  attachments?: Array<{name: string; url: string}>
  jdMatchScore?: number
}

export interface FollowupActionDTO {
  id: string
  submissionId: string
  actionAt: string
  channel: Channel
  actorId: string
  note?: string
  payload?: Record<string, any>
  result?: "SENT" | "FAILED" | "DELIVERED" | "READ"
}

export interface EscalationDTO {
  id: string
  submissionId: string
  raisedAt: string
  resolvedAt?: string
  ownerId: string
  reason: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
}

export interface ClientTATMetricDTO {
  clientId: string
  clientName: string
  avgDaysToFeedback: number
  noFeedbackRatePct: number
  escalations: number
}

export interface DashboardSummaryDTO {
  monthSubmissions: number
  feedbackPct: number
  avgDaysToFeedback: number
  escalatedCount: number
  agingGt5Count: number
  agingBuckets: {range: "0-2" | "3-5" | "6+"; count: number}[]
  recruiterTable: Array<{
    recruiter: string
    total: number
    feedbackPct: number
    avgFollowups: number
    agingGt5: number
  }>
  clientTable: ClientTATMetricDTO[]
  dueSoon: Array<{
    submissionId: string
    jdCode: string
    candidate: string
    due: string
    lastAction?: string
  }>
}

export interface EmailIngestPreview {
  messageId: string
  subject: string
  to: string[]
  cc: string[]
  sentAt: string
  detectedJdCode?: string
  guessedClient?: string
  attachments: Array<{fileName: string; mime: string; size: number}>
  parsedCandidates?: Array<{name: string; email?: string; matchScore?: number}>
}

export interface FollowupFilters {
  jdCode?: string
  clientId?: string
  recruiterId?: string
  status?: FollowupStatus[]
  dateRange?: {
    start: string
    end: string
  }
  agingDays?: {
    min?: number
    max?: number
  }
  escalationFlag?: boolean
}

export interface FollowupTemplate {
  id: string
  name: string
  channel: Channel
  subject?: string
  body: string
  variables: string[]
  isActive: boolean
}