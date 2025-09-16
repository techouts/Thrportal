import { ApiService } from './api'
import { 
  MappingCandidate, 
  MappingJD, 
  MatchScore, 
  ConflictFlag, 
  MappingResult,
  MappingApprovalRequest,
  MappingSettings,
  MappingFilters,
  InterestCheckTemplate,
  MappingOutcomesReport
} from '@/types/applications'

export class MappingService {
  private static readonly BASE_URL = '/api/mapping'

  // JD to Candidate Mapping
  static async getCandidatesForJD(jdId: string, filters?: MappingFilters): Promise<MappingCandidate[]> {
    // Mock data
    return [
      {
        id: 'candidate-001',
        name: 'Alice Johnson',
        email: 'alice.johnson@email.com',
        phone: '+1-555-0123',
        location: 'San Francisco, CA',
        totalExp: 6,
        skills: ['React', 'TypeScript', 'Node.js', 'Vue.js'],
        owner: 'John Recruiter',
        existingApplicationsCount: 2,
        highestCurrentStage: 'Interview',
        consent: true,
        activelyLooking: true,
        lastContactedAt: '2024-01-10T14:00:00Z',
        currentCTC: 110000,
        expectedCTC: 150000,
        matchScore: 85
      },
      {
        id: 'candidate-002',
        name: 'Bob Chen',
        email: 'bob.chen@email.com',
        location: 'Seattle, WA',
        totalExp: 4,
        skills: ['AWS', 'Docker', 'Kubernetes'],
        owner: 'Sarah Staffing',
        existingApplicationsCount: 1,
        highestCurrentStage: 'Shortlisted',
        consent: true,
        activelyLooking: false,
        lastContactedAt: '2024-01-05T10:00:00Z',
        currentCTC: 95000,
        expectedCTC: 120000,
        matchScore: 78
      }
    ]
  }

  // Candidate to JD Mapping
  static async getJDsForCandidate(candidateId: string, filters?: MappingFilters): Promise<MappingJD[]> {
    // Mock data
    return [
      {
        id: 'jd-001',
        title: 'Senior React Developer',
        client: 'TechCorp',
        location: 'San Francisco, CA',
        skills: ['React', 'TypeScript', 'Node.js'],
        seniority: 'Senior',
        compensationMin: 120000,
        compensationMax: 180000,
        currency: 'USD',
        workType: 'Full-time',
        status: 'Approved',
        headcountLeft: 2,
        slaHealth: 'Green',
        primaryRecruiter: 'John Recruiter',
        collaborators: ['Sarah Staffing'],
        matchScore: 85
      },
      {
        id: 'jd-003',
        title: 'Frontend Lead',
        client: 'StartupX',
        location: 'Remote',
        skills: ['React', 'Vue.js', 'TypeScript'],
        seniority: 'Lead',
        compensationMin: 140000,
        compensationMax: 200000,
        currency: 'USD',
        workType: 'Full-time',
        status: 'Published',
        headcountLeft: 1,
        slaHealth: 'Amber',
        primaryRecruiter: 'Mike Manager',
        collaborators: [],
        matchScore: 92
      }
    ]
  }

  // Smart Mapper - Two-way matching
  static async getSmartMatches(filters?: MappingFilters): Promise<MappingResult[]> {
    // Mock data
    return [
      {
        candidateId: 'candidate-001',
        jdId: 'jd-001',
        matchScore: {
          total: 85,
          breakdown: {
            skills: 80,
            location: 95,
            seniority: 85,
            compensation: 75,
            availability: 90
          }
        },
        conflicts: [],
        nextBestAction: 'Interest Check'
      },
      {
        candidateId: 'candidate-003',
        jdId: 'jd-002',
        matchScore: {
          total: 92,
          breakdown: {
            skills: 95,
            location: 85,
            seniority: 90,
            compensation: 85,
            availability: 95
          }
        },
        conflicts: [
          {
            type: 'deep-stage',
            severity: 'warning',
            message: 'Candidate has Offer stage application with another client',
            details: { clientName: 'CompetitorCorp', stage: 'Offer' }
          }
        ],
        nextBestAction: 'Manager Approval Required'
      }
    ]
  }

  // Calculate Match Score
  static async calculateMatchScore(candidateId: string, jdId: string): Promise<MatchScore> {
    // Mock calculation
    return {
      total: 85,
      breakdown: {
        skills: 80,
        location: 95,
        seniority: 85,
        compensation: 75,
        availability: 90
      }
    }
  }

  // Check for conflicts
  static async checkConflicts(candidateId: string, jdId: string): Promise<ConflictFlag[]> {
    // Mock conflict detection
    return [
      {
        type: 'compensation',
        severity: 'warning',
        message: 'Expected CTC exceeds JD budget by 10%',
        details: { expectedCTC: 180000, budgetMax: 160000 }
      }
    ]
  }

  // Interest Check Actions
  static async sendInterestCheck(
    candidateIds: string[], 
    jdId: string, 
    templateId: string,
    channel: 'email' | 'whatsapp'
  ): Promise<void> {
    console.log('Sending interest check:', { candidateIds, jdId, templateId, channel })
  }

  static async markActivelyLooking(candidateId: string, expiryDays: number = 60): Promise<void> {
    console.log('Marking candidate as actively looking:', { candidateId, expiryDays })
  }

  // Approval Workflow
  static async submitForApproval(mappingRequests: Partial<MappingApprovalRequest>[]): Promise<string[]> {
    // Mock submission - return approval request IDs
    return mappingRequests.map(() => `approval-${Date.now()}-${Math.random()}`)
  }

  static async getApprovalRequests(filters?: { status?: string, assignedTo?: string }): Promise<MappingApprovalRequest[]> {
    // Mock data
    return [
      {
        id: 'approval-001',
        requestedBy: 'John Recruiter',
        requestedAt: '2024-01-16T10:00:00Z',
        type: 'jd-to-candidate',
        candidateId: 'candidate-001',
        jdId: 'jd-001',
        matchScore: 85,
        conflicts: [],
        status: 'pending'
      }
    ]
  }

  static async approveMapping(
    approvalId: string, 
    decision: 'approved' | 'rejected',
    comments?: string
  ): Promise<void> {
    console.log('Approving mapping:', { approvalId, decision, comments })
  }

  static async lineUpApplications(approvalIds: string[]): Promise<string[]> {
    // Mock - create applications and return application IDs
    return approvalIds.map(() => `app-${Date.now()}-${Math.random()}`)
  }

  // Templates
  static async getInterestCheckTemplates(): Promise<InterestCheckTemplate[]> {
    return [
      {
        id: 'template-001',
        name: 'Standard Interest Check',
        subject: 'New opportunity at {{client_name}}',
        body: 'Hi {{candidate_name}}, I have an exciting {{job_title}} opportunity at {{client_name}}. Are you interested to know more?',
        channel: 'email',
        mergeFields: ['candidate_name', 'client_name', 'job_title', 'recruiter_name']
      },
      {
        id: 'template-002',
        name: 'WhatsApp Quick Check',
        subject: '',
        body: 'Hi {{candidate_name}}! New {{job_title}} role at {{client_name}}. Interested?',
        channel: 'whatsapp',
        mergeFields: ['candidate_name', 'client_name', 'job_title']
      }
    ]
  }

  // Settings
  static async getMappingSettings(): Promise<MappingSettings> {
    return {
      matching: {
        weights: {
          skills: 50,
          location: 15,
          seniority: 15,
          compensation: 10,
          availability: 10
        },
        minimumThreshold: 65
      },
      conflicts: {
        clientBlacklist: false,
        deepStagePolicy: 'require-approval'
      },
      approvals: {
        autoApprove: false,
        requireManagerApproval: true
      },
      consent: {
        requiredBeforeSubmit: true,
        allowPendingOutreach: true,
        activelyLookingExpiryDays: 60,
        reminderDaysBefore: 10
      },
      sla: {
        managerApprovalHours: 24,
        recruiterOutreachHours: 48,
        alertHoursBefore: 2
      }
    }
  }

  static async updateMappingSettings(settings: Partial<MappingSettings>): Promise<void> {
    console.log('Updating mapping settings:', settings)
  }

  // Reports
  static async getMappingOutcomesReport(
    startDate: string, 
    endDate: string, 
    filters?: MappingFilters
  ): Promise<MappingOutcomesReport[]> {
    // Mock data
    return [
      {
        period: { start: startDate, end: endDate },
        initiator: 'John Recruiter',
        jdId: 'jd-001',
        candidateId: 'candidate-001',
        matchScore: 85,
        hasDeepStageWarning: false,
        hasCompensationWarning: true,
        hasConsentPending: false,
        approved: true,
        applicationCreated: true,
        daysToOutreach: 1,
        daysToSubmission: 3
      }
    ]
  }

  // Bulk Actions
  static async bulkInterestCheck(
    candidateIds: string[],
    jdIds: string[],
    templateId: string,
    channel: 'email' | 'whatsapp'
  ): Promise<void> {
    console.log('Bulk interest check:', { candidateIds, jdIds, templateId, channel })
  }

  static async bulkSubmitForApproval(
    candidateJDPairs: Array<{ candidateId: string, jdId: string }>
  ): Promise<string[]> {
    return candidateJDPairs.map(() => `approval-${Date.now()}-${Math.random()}`)
  }
}