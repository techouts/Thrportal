import type { 
  JDAssignment, 
  RecruiterLoad, 
  UnattendedJD, 
  AssignmentFilters, 
  AssignmentStats,
  JDBurnReport,
  SourceChannel,
  AssignmentAction
} from '@/types/assignment'

// Mock data generators
function generateMockAssignments(): JDAssignment[] {
  const clients = ['TechCorp', 'StartupXYZ', 'Enterprise Ltd', 'Innovation Inc']
  const recruiters = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson']
  const channels = ['LinkedIn', 'Naukri', 'Indeed', 'Internal Referral', 'Vendor']
  const priorities: ('Urgent' | 'Standard' | 'Bulk')[] = ['Urgent', 'Standard', 'Bulk']
  const statuses: ('Assigned' | 'Unassigned' | 'Unattended')[] = ['Assigned', 'Unassigned', 'Unattended']

  return Array.from({ length: 50 }, (_, i) => {
    const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    const jdAge = Math.floor((Date.now() - createdDate.getTime()) / (24 * 60 * 60 * 1000))
    
    return {
      id: `assignment-${i + 1}`,
      jdId: `JD-${(i + 1).toString().padStart(4, '0')}`,
      title: `${['Senior', 'Junior', 'Lead', 'Principal'][Math.floor(Math.random() * 4)]} ${['Developer', 'Engineer', 'Manager', 'Architect'][Math.floor(Math.random() * 4)]}`,
      client: clients[Math.floor(Math.random() * clients.length)],
      assignedRecruiters: Math.random() > 0.3 ? 
        [recruiters[Math.floor(Math.random() * recruiters.length)]] : 
        [],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      sourcingChannels: [channels[Math.floor(Math.random() * channels.length)]],
      lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: Math.random() > 0.7 ? 'Follow up needed' : '',
      createdDate: createdDate.toISOString(),
      jdAge,
      isPinned: Math.random() > 0.9,
      isActive: Math.random() > 0.1
    }
  })
}

function generateMockRecruiterLoads(): RecruiterLoad[] {
  const recruiters = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown']
  
  return recruiters.map((name, i) => {
    const assignedJDs = Math.floor(Math.random() * 15) + 5
    const urgentJDs = Math.floor(assignedJDs * 0.3)
    const standardJDs = Math.floor(assignedJDs * 0.5)
    const bulkJDs = assignedJDs - urgentJDs - standardJDs
    
    return {
      recruiterId: `recruiter-${i + 1}`,
      recruiterName: name,
      assignedJDs,
      urgentJDs,
      standardJDs,
      bulkJDs,
      fillRate: Math.floor(Math.random() * 30) + 60,
      avgTAT: Math.floor(Math.random() * 10) + 5,
      bandwidth: assignedJDs > 12 ? 'Overloaded' : 
                assignedJDs > 8 ? 'High' : 
                assignedJDs > 5 ? 'Medium' : 'Low'
    }
  })
}

function generateMockUnattendedJDs(): UnattendedJD[] {
  const reasons = ['Budget Constraints', 'Hiring Freeze', 'Role Cancelled', 'Requirements Changed', 'Resource Shortage']
  const statuses: ('On Hold' | 'Do Not Work' | 'Blocked')[] = ['On Hold', 'Do Not Work', 'Blocked']
  
  return Array.from({ length: 12 }, (_, i) => ({
    id: `unattended-${i + 1}`,
    jdId: `JD-${(i + 101).toString().padStart(4, '0')}`,
    title: `${['Senior', 'Junior', 'Lead'][Math.floor(Math.random() * 3)]} ${['Developer', 'Manager', 'Analyst'][Math.floor(Math.random() * 3)]}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    reason: reasons[Math.floor(Math.random() * reasons.length)],
    notes: 'Temporarily paused due to business priorities',
    lastUpdated: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
    assignedRecruiters: Math.random() > 0.5 ? ['Alice Johnson'] : [],
    markedBy: 'John Manager',
    markedDate: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString()
  }))
}

// Assignment Service Class
class AssignmentService {
  private static instance: AssignmentService
  private assignments: JDAssignment[] = []
  private recruiterLoads: RecruiterLoad[] = []
  private unattendedJDs: UnattendedJD[] = []

  private constructor() {
    this.assignments = generateMockAssignments()
    this.recruiterLoads = generateMockRecruiterLoads()
    this.unattendedJDs = generateMockUnattendedJDs()
  }

  static getInstance(): AssignmentService {
    if (!AssignmentService.instance) {
      AssignmentService.instance = new AssignmentService()
    }
    return AssignmentService.instance
  }

  async getAssignments(filters?: AssignmentFilters): Promise<JDAssignment[]> {
    let filtered = [...this.assignments]

    if (filters?.client) {
      filtered = filtered.filter(a => a.client.toLowerCase().includes(filters.client!.toLowerCase()))
    }

    if (filters?.recruiters && filters.recruiters.length > 0) {
      filtered = filtered.filter(a => 
        a.assignedRecruiters.some(r => filters.recruiters!.includes(r))
      )
    }

    if (filters?.jdId) {
      filtered = filtered.filter(a => 
        a.jdId.toLowerCase().includes(filters.jdId!.toLowerCase()) ||
        a.title.toLowerCase().includes(filters.jdId!.toLowerCase())
      )
    }

    if (filters?.priority && filters.priority !== 'all') {
      filtered = filtered.filter(a => a.priority === filters.priority)
    }

    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter(a => a.status === filters.status)
    }

    if (filters?.sourcingChannel && filters.sourcingChannel !== 'all') {
      filtered = filtered.filter(a => a.sourcingChannels.includes(filters.sourcingChannel!))
    }

    return filtered
  }

  async getAssignmentStats(filters?: AssignmentFilters): Promise<AssignmentStats> {
    const assignments = await this.getAssignments(filters)
    
    return {
      totalJDs: assignments.length,
      unassigned: assignments.filter(a => a.status === 'Unassigned').length,
      urgent: assignments.filter(a => a.priority === 'Urgent').length,
      avgJDsPerRecruiter: Math.round(assignments.filter(a => a.assignedRecruiters.length > 0).length / this.recruiterLoads.length),
      overloadedRecruiters: this.recruiterLoads.filter(r => r.bandwidth === 'Overloaded').length,
      jdsOlderThan7Days: assignments.filter(a => a.jdAge > 7).length
    }
  }

  async getRecruiterLoads(): Promise<RecruiterLoad[]> {
    return this.recruiterLoads
  }

  async getUnattendedJDs(): Promise<UnattendedJD[]> {
    return this.unattendedJDs
  }

  async getUnassignedJDs(): Promise<JDAssignment[]> {
    return this.assignments.filter(a => a.status === 'Unassigned')
  }

  async getBurnReport(): Promise<JDBurnReport[]> {
    return Array.from({ length: 20 }, (_, i) => ({
      jdId: `JD-${(i + 1).toString().padStart(4, '0')}`,
      title: `Position ${i + 1}`,
      recruiters: ['Alice Johnson', 'Bob Smith'].slice(0, Math.floor(Math.random() * 2) + 1),
      profilesSent: Math.floor(Math.random() * 20) + 5,
      interviews: Math.floor(Math.random() * 10) + 1,
      offers: Math.floor(Math.random() * 3),
      status: ['Active', 'On Hold', 'Closed'][Math.floor(Math.random() * 3)],
      efficiency: Math.floor(Math.random() * 40) + 60
    }))
  }

  async getSourceChannels(): Promise<SourceChannel[]> {
    return [
      { id: '1', name: 'LinkedIn', type: 'External', isActive: true },
      { id: '2', name: 'Naukri', type: 'External', isActive: true },
      { id: '3', name: 'Indeed', type: 'External', isActive: true },
      { id: '4', name: 'Internal Referral', type: 'Internal', isActive: true },
      { id: '5', name: 'Vendor Pool', type: 'Vendor', isActive: true }
    ]
  }

  async assignRecruiter(jdId: string, recruiters: string[]): Promise<void> {
    const assignment = this.assignments.find(a => a.jdId === jdId)
    if (assignment) {
      assignment.assignedRecruiters = recruiters
      assignment.status = recruiters.length > 0 ? 'Assigned' : 'Unassigned'
    }
  }

  async updatePriority(jdId: string, priority: 'Urgent' | 'Standard' | 'Bulk'): Promise<void> {
    const assignment = this.assignments.find(a => a.jdId === jdId)
    if (assignment) {
      assignment.priority = priority
    }
  }

  async updateNotes(jdId: string, notes: string): Promise<void> {
    const assignment = this.assignments.find(a => a.jdId === jdId)
    if (assignment) {
      assignment.notes = notes
    }
  }

  async togglePin(jdId: string): Promise<void> {
    const assignment = this.assignments.find(a => a.jdId === jdId)
    if (assignment) {
      assignment.isPinned = !assignment.isPinned
    }
  }

  async markAsUnattended(jdId: string, reason: string, notes: string): Promise<void> {
    const assignment = this.assignments.find(a => a.jdId === jdId)
    if (assignment) {
      assignment.status = 'Unattended'
      
      this.unattendedJDs.push({
        id: `unattended-${Date.now()}`,
        jdId: assignment.jdId,
        title: assignment.title,
        status: 'Do Not Work',
        reason,
        notes,
        lastUpdated: new Date().toISOString(),
        assignedRecruiters: assignment.assignedRecruiters,
        markedBy: 'Current User',
        markedDate: new Date().toISOString()
      })
    }
  }
}

// Export singleton instance
export const assignmentService = AssignmentService.getInstance()