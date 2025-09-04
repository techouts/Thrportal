// Assignment Module Types

export interface JDAssignment {
  id: string
  jdId: string
  title: string
  client: string
  assignedRecruiters: string[]
  priority: 'Urgent' | 'Standard' | 'Bulk'
  status: 'Assigned' | 'Unassigned' | 'Unattended'
  sourcingChannels: string[]
  lastActivity: string
  notes: string
  createdDate: string
  jdAge: number
  isPinned: boolean
  isActive: boolean
}

export interface RecruiterLoad {
  recruiterId: string
  recruiterName: string
  assignedJDs: number
  urgentJDs: number
  standardJDs: number
  bulkJDs: number
  fillRate: number
  avgTAT: number
  bandwidth: 'Low' | 'Medium' | 'High' | 'Overloaded'
}

export interface UnattendedJD {
  id: string
  jdId: string
  title: string
  status: 'On Hold' | 'Do Not Work' | 'Blocked'
  reason: string
  notes: string
  lastUpdated: string
  assignedRecruiters: string[]
  markedBy: string
  markedDate: string
}

export interface AssignmentFilters {
  client?: string
  recruiters?: string[]
  jdId?: string
  priority?: string
  status?: string
  sourcingChannel?: string
  dateRange?: {
    start: string
    end: string
  }
}

export interface AssignmentStats {
  totalJDs: number
  unassigned: number
  urgent: number
  avgJDsPerRecruiter: number
  overloadedRecruiters: number
  jdsOlderThan7Days: number
}

export interface JDBurnReport {
  jdId: string
  title: string
  recruiters: string[]
  profilesSent: number
  interviews: number
  offers: number
  status: string
  efficiency: number
}

export interface SourceChannel {
  id: string
  name: string
  type: 'Internal' | 'External' | 'Vendor'
  isActive: boolean
}

export interface AssignmentAction {
  type: 'assign' | 'priority_change' | 'note_update' | 'status_change'
  jdId: string
  performedBy: string
  timestamp: string
  oldValue?: string
  newValue?: string
  comment?: string
}