import { ApiService } from './api'
import { 
  FollowupSubmissionDTO,
  FollowupActionDTO,
  EscalationDTO,
  DashboardSummaryDTO,
  EmailIngestPreview,
  FollowupFilters,
  FollowupStatus,
  Channel,
  FollowupTemplate
} from '@/types/followup'

export class FollowupService {
  private static readonly BASE_URL = '/api/followup'

  // Dashboard
  static async getDashboardSummary(filters?: FollowupFilters): Promise<DashboardSummaryDTO> {
    // Mock data for now
    return {
      monthSubmissions: 234,
      feedbackPct: 72.5,
      avgDaysToFeedback: 4.2,
      escalatedCount: 18,
      agingGt5Count: 45,
      agingBuckets: [
        { range: "0-2", count: 95 },
        { range: "3-5", count: 67 },
        { range: "6+", count: 45 }
      ],
      recruiterTable: [
        {
          recruiter: "John Recruiter",
          total: 58,
          feedbackPct: 78.5,
          avgFollowups: 2.3,
          agingGt5: 8
        },
        {
          recruiter: "Sarah Staffing",
          total: 45,
          feedbackPct: 82.1,
          avgFollowups: 1.9,
          agingGt5: 5
        },
        {
          recruiter: "Mike Talent",
          total: 39,
          feedbackPct: 65.2,
          avgFollowups: 3.1,
          agingGt5: 12
        }
      ],
      clientTable: [
        {
          clientId: "client-001",
          clientName: "TechCorp",
          avgDaysToFeedback: 3.2,
          noFeedbackRatePct: 15.5,
          escalations: 3
        },
        {
          clientId: "client-002",
          clientName: "CloudSoft",
          avgDaysToFeedback: 5.8,
          noFeedbackRatePct: 28.3,
          escalations: 8
        },
        {
          clientId: "client-003",
          clientName: "DataTech",
          avgDaysToFeedback: 2.9,
          noFeedbackRatePct: 12.1,
          escalations: 1
        }
      ],
      dueSoon: [
        {
          submissionId: "sub-001",
          jdCode: "JD-2024-001",
          candidate: "Alice Johnson",
          due: "2024-01-18T10:00:00Z",
          lastAction: "Email sent 2 days ago"
        },
        {
          submissionId: "sub-002",
          jdCode: "JD-2024-002",
          candidate: "Bob Chen",
          due: "2024-01-18T14:00:00Z",
          lastAction: "WhatsApp sent 1 day ago"
        }
      ]
    }
  }

  // Submissions
  static async getSubmissions(filters?: FollowupFilters): Promise<FollowupSubmissionDTO[]> {
    // Mock data
    return [
      {
        id: "sub-001",
        jdId: "jd-001",
        jdCode: "JD-2024-001",
        clientId: "client-001",
        clientName: "TechCorp",
        recruiterId: "rec-001",
        recruiterName: "John Recruiter",
        candidateId: "cand-001",
        candidateName: "Alice Johnson",
        candidateEmail: "alice.johnson@email.com",
        submissionSource: "ATS",
        submissionAt: "2024-01-15T09:00:00Z",
        status: "AWAITING_FEEDBACK",
        followupCount: 2,
        nextFollowupAt: "2024-01-18T10:00:00Z",
        followupOwnerId: "rec-001",
        escalationFlag: false,
        agingDays: 3,
        threadId: "thread-001",
        jdMatchScore: 85
      },
      {
        id: "sub-002",
        jdId: "jd-002",
        jdCode: "JD-2024-002",
        clientId: "client-002",
        clientName: "CloudSoft",
        recruiterId: "rec-002",
        recruiterName: "Sarah Staffing",
        candidateId: "cand-002",
        candidateName: "Bob Chen",
        candidateEmail: "bob.chen@email.com",
        submissionSource: "EMAIL_INGEST",
        submissionAt: "2024-01-12T14:30:00Z",
        status: "FEEDBACK_RECEIVED",
        lastClientResponseAt: "2024-01-16T11:20:00Z",
        followupCount: 1,
        followupOwnerId: "rec-002",
        escalationFlag: false,
        agingDays: 6,
        threadId: "thread-002",
        jdMatchScore: 78
      },
      {
        id: "sub-003",
        jdId: "jd-001",
        jdCode: "JD-2024-001",
        clientId: "client-001",
        clientName: "TechCorp",
        recruiterId: "rec-003",
        recruiterName: "Mike Talent",
        candidateId: "cand-003",
        candidateName: "Carol Davis",
        candidateEmail: "carol.davis@email.com",
        submissionSource: "MANUAL",
        submissionAt: "2024-01-10T16:45:00Z",
        status: "ESCALATED",
        followupCount: 4,
        nextFollowupAt: "2024-01-19T09:00:00Z",
        followupOwnerId: "rec-003",
        escalationFlag: true,
        agingDays: 8,
        threadId: "thread-003",
        jdMatchScore: 72
      }
    ]
  }

  static async updateSubmissionStatus(
    id: string, 
    status: FollowupStatus, 
    note?: string
  ): Promise<void> {
    // Mock implementation
    console.log('Updating submission status:', { id, status, note })
  }

  static async scheduleFollowup(
    id: string, 
    nextFollowupAt: string, 
    note?: string
  ): Promise<void> {
    // Mock implementation
    console.log('Scheduling followup:', { id, nextFollowupAt, note })
  }

  // Actions
  static async getActions(submissionId?: string): Promise<FollowupActionDTO[]> {
    // Mock data
    return [
      {
        id: "action-001",
        submissionId: "sub-001",
        actionAt: "2024-01-15T10:00:00Z",
        channel: "EMAIL",
        actorId: "rec-001",
        note: "Initial submission email sent to client",
        result: "DELIVERED"
      },
      {
        id: "action-002",
        submissionId: "sub-001",
        actionAt: "2024-01-16T15:30:00Z",
        channel: "EMAIL",
        actorId: "rec-001",
        note: "Follow-up reminder sent",
        result: "READ"
      },
      {
        id: "action-003",
        submissionId: "sub-002",
        actionAt: "2024-01-13T11:20:00Z",
        channel: "WHATSAPP",
        actorId: "rec-002",
        note: "Quick follow-up via WhatsApp",
        result: "DELIVERED"
      }
    ]
  }

  static async createAction(action: Omit<FollowupActionDTO, 'id'>): Promise<FollowupActionDTO> {
    // Mock implementation
    const newAction: FollowupActionDTO = {
      id: `action-${Date.now()}`,
      ...action
    }
    console.log('Creating action:', newAction)
    return newAction
  }

  // Escalations
  static async getEscalations(filters?: FollowupFilters): Promise<EscalationDTO[]> {
    // Mock data
    return [
      {
        id: "esc-001",
        submissionId: "sub-003",
        raisedAt: "2024-01-17T12:00:00Z",
        ownerId: "manager-001",
        reason: "No feedback received after 7 days and 4 follow-ups",
        status: "IN_PROGRESS"
      },
      {
        id: "esc-002",
        submissionId: "sub-004",
        raisedAt: "2024-01-16T09:30:00Z",
        resolvedAt: "2024-01-17T14:20:00Z",
        ownerId: "manager-001",
        reason: "Client not responding to urgent JD",
        status: "RESOLVED"
      }
    ]
  }

  static async createEscalation(
    submissionId: string, 
    reason: string, 
    ownerId: string
  ): Promise<EscalationDTO> {
    // Mock implementation
    const escalation: EscalationDTO = {
      id: `esc-${Date.now()}`,
      submissionId,
      raisedAt: new Date().toISOString(),
      ownerId,
      reason,
      status: "OPEN"
    }
    console.log('Creating escalation:', escalation)
    return escalation
  }

  static async resolveEscalation(id: string, note?: string): Promise<void> {
    // Mock implementation
    console.log('Resolving escalation:', { id, note })
  }

  // Email Ingestion
  static async uploadEmails(files: File[]): Promise<EmailIngestPreview[]> {
    // Mock implementation
    return files.map((file, index) => ({
      messageId: `msg-${Date.now()}-${index}`,
      subject: `Mock Email Subject ${index + 1}`,
      to: ["client@techcorp.com"],
      cc: [],
      sentAt: new Date().toISOString(),
      detectedJdCode: index === 0 ? "JD-2024-001" : undefined,
      guessedClient: index === 0 ? "TechCorp" : undefined,
      attachments: [
        { fileName: `resume-${index + 1}.pdf`, mime: "application/pdf", size: 245760 }
      ],
      parsedCandidates: [
        { name: `Candidate ${index + 1}`, email: `candidate${index + 1}@email.com`, matchScore: 80 + index * 5 }
      ]
    }))
  }

  static async processEmailIngest(previews: EmailIngestPreview[]): Promise<void> {
    // Mock implementation
    console.log('Processing email ingest:', previews)
  }

  // Templates
  static async getTemplates(): Promise<FollowupTemplate[]> {
    // Mock data
    return [
      {
        id: "template-001",
        name: "Initial Submission",
        channel: "EMAIL",
        subject: "New Candidate Submission - {{jdCode}}",
        body: "Hi {{clientName}},\n\nI hope this email finds you well. I'm excited to share a strong candidate profile for {{jdCode}}.\n\nCandidate: {{candidateName}}\nEmail: {{candidateEmail}}\n\nPlease find the resume attached. I'd love to hear your thoughts.\n\nBest regards,\n{{recruiterName}}",
        variables: ["clientName", "jdCode", "candidateName", "candidateEmail", "recruiterName"],
        isActive: true
      },
      {
        id: "template-002",
        name: "Follow-up Reminder",
        channel: "EMAIL",
        subject: "Following up on {{candidateName}} - {{jdCode}}",
        body: "Hi {{clientName}},\n\nI wanted to follow up on the candidate I shared for {{jdCode}}. Have you had a chance to review {{candidateName}}'s profile?\n\nI'm here to answer any questions you might have.\n\nBest regards,\n{{recruiterName}}",
        variables: ["clientName", "jdCode", "candidateName", "recruiterName"],
        isActive: true
      },
      {
        id: "template-003",
        name: "WhatsApp Quick Check",
        channel: "WHATSAPP",
        body: "Hi {{clientName}}, quick follow-up on {{candidateName}} for {{jdCode}}. Any feedback? Thanks!",
        variables: ["clientName", "candidateName", "jdCode"],
        isActive: true
      }
    ]
  }

  // Exports
  static async exportSubmissions(filters?: FollowupFilters): Promise<void> {
    // Mock implementation
    console.log('Exporting submissions:', filters)
  }

  static async exportActions(filters?: FollowupFilters): Promise<void> {
    // Mock implementation
    console.log('Exporting actions:', filters)
  }

  static async exportEscalations(filters?: FollowupFilters): Promise<void> {
    // Mock implementation
    console.log('Exporting escalations:', filters)
  }
}