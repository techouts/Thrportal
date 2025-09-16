import { 
  PipelineApplication,
  JDPipeline,
  PipelineFilters,
  PipelineMetrics,
  RecruiterPipelineStats,
  TeamPipelineStats,
  LeadershipInsight,
  ClientProgress,
  PipelineAlert,
  PipelineAuditEntry,
  BulkStatusUpdate,
  ReminderAction,
  EscalationAction,
  PipelineSettings,
  ApplicationStatus,
  FunnelStage,
  ActiveJD
} from '@/types/pipeline'

class PipelineService {
  private mockApplications: PipelineApplication[] = [
    {
      id: '1',
      candidateName: 'John Doe',
      jdId: 'jd-001',
      jdTitle: 'Senior React Developer',
      client: 'TechCorp Inc',
      recruiterName: 'Alice Smith',
      primaryRecruiter: 'Alice Smith',
      submittedBy: 'Alice Smith',
      currentStatus: 'Interview-R1',
      currentRound: 'Technical Round',
      lastUpdated: '2024-01-15T10:30:00Z',
      notes: 'Strong technical background',
      updatedBy: 'Alice Smith',
      submittedAt: '2024-01-10T09:00:00Z',
      ageing: 5,
      slaStatus: 'on-time',
      nextAction: 'Schedule R2 interview',
      statusHistory: []
    }
  ]

  async getApplications(filters?: PipelineFilters): Promise<PipelineApplication[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return this.mockApplications
  }

  async getMyApplications(userId: string): Promise<PipelineApplication[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return this.mockApplications
  }

  async getJDPipelines(filters?: PipelineFilters): Promise<JDPipeline[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return [{
      id: 'jd-001',
      title: 'Senior React Developer',
      client: 'TechCorp Inc',
      approvalStatus: 'approved',
      headcountApproved: 3,
      headcountRemaining: 2,
      submissions: 12,
      shortlisted: 8,
      interviews: 5,
      offers: 2,
      joins: 1,
      slaHealth: 'good',
      primaryRecruiter: 'Alice Smith',
      lastActivity: '2024-01-15T10:30:00Z',
      applications: this.mockApplications
    }]
  }

  async getJDPipelineDetail(jdId: string): Promise<JDPipeline | null> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      id: jdId,
      title: 'Senior React Developer',
      client: 'TechCorp Inc',
      approvalStatus: 'approved',
      headcountApproved: 3,
      headcountRemaining: 2,
      submissions: 12,
      shortlisted: 8,
      interviews: 5,
      offers: 2,
      joins: 1,
      slaHealth: 'good',
      primaryRecruiter: 'Alice Smith',
      lastActivity: '2024-01-15T10:30:00Z',
      applications: this.mockApplications
    }
  }

  async getPipelineMetrics(filters?: PipelineFilters): Promise<PipelineMetrics> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const mockFunnel: FunnelStage[] = [
      { stage: 'Submitted', count: 150, conversionRate: 100, dropoffRate: 0 },
      { stage: 'Shortlisted', count: 90, conversionRate: 60, dropoffRate: 40 },
      { stage: 'Interview-R1', count: 65, conversionRate: 72, dropoffRate: 28 },
      { stage: 'Offer-Released', count: 25, conversionRate: 56, dropoffRate: 44 },
      { stage: 'Joined', count: 18, conversionRate: 72, dropoffRate: 28 }
    ]

    return {
      totalApplications: 150,
      totalJDs: 25,
      globalFunnel: mockFunnel,
      slaHealth: {
        onTimePercent: 75,
        overdueCount: 28,
        dueTodayCount: 12,
        stageBreakdown: [
          { stage: 'Feedback-Pending', onTime: 15, overdue: 8 }
        ]
      },
      headcountProgress: {
        approved: 85,
        filled: 35,
        remaining: 50,
        byClient: [
          { client: 'TechCorp Inc', approved: 15, filled: 8, remaining: 7 }
        ]
      },
      bottlenecks: [
        { stage: 'Feedback-Pending', count: 23, avgAgeing: 6, description: 'Client feedback pending' }
      ]
    }
  }

  async getRecruiterStats(recruiterId?: string): Promise<RecruiterPipelineStats> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      recruiterId: recruiterId || 'current-user',
      recruiterName: 'Current User',
      activeJDs: 8,
      activeCandidates: 24,
      submissions: 45,
      shortlistPercent: 65,
      offerPercent: 28,
      joinPercent: 18,
      funnel: {
        asSubmitter: [
          { stage: 'Submitted', count: 30, conversionRate: 100, dropoffRate: 0 }
        ],
        asPrimary: [
          { stage: 'Interview-R1', count: 15, conversionRate: 75, dropoffRate: 25 }
        ]
      },
      slaHeatmap: {
        dueToday: 5,
        overdue: 3
      },
      todos: [
        {
          id: '1',
          type: 'follow-up',
          jdId: 'jd-001',
          jdTitle: 'Senior React Developer',
          candidateName: 'John Doe',
          description: 'Follow up on R2 interview feedback',
          dueDate: '2024-01-16',
          priority: 'high'
        }
      ]
    }
  }

  async getTeamStats(): Promise<TeamPipelineStats> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    return {
      teamFunnel: [
        {
          recruiter: 'Alice Smith',
          funnel: [
            { stage: 'Submitted', count: 25, conversionRate: 100, dropoffRate: 0 }
          ]
        }
      ],
      atRiskJDs: [
        {
          jdId: 'jd-003',
          jdTitle: 'DevOps Engineer',
          client: 'CloudTech',
          issue: 'No submissions in 5 days',
          daysSinceLastSubmission: 5
        }
      ],
      roundStalls: [
        { round: 'Client Interview', count: 12, avgAgeing: 7 }
      ]
    }
  }

  async getLeadershipInsights(): Promise<LeadershipInsight[]> {
    await new Promise(resolve => setTimeout(resolve, 700))
    
    return [
      {
        type: 'redistribution',
        priority: 'high',
        title: 'Redistribute focus on TechCorp Inc',
        description: 'SLA breaches high; only 1 active recruiter on 8 JDs',
        actionable: true,
        clientId: 'client-001',
        jdIds: ['jd-001', 'jd-002']
      }
    ]
  }

  async getClientProgress(): Promise<ClientProgress[]> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    return [
      {
        clientId: 'client-001',
        clientName: 'TechCorp Inc',
        totalHeadcount: 25,
        filledPositions: 12,
        progressPercent: 48,
        avgFeedbackTime: 3.5,
        slaBreaches: 8,
        stuckJDs: 2,
        forecast: {
          submissionsNeeded: 45,
          estimatedCompletionDays: 30
        }
      }
    ]
  }

  async getAlerts(role?: string): Promise<PipelineAlert[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    return [
      {
        id: 'alert-001',
        type: 'sla-breach',
        severity: 'critical',
        title: 'Feedback Overdue',
        description: 'Client feedback pending for 7 days on JD#001',
        targetRole: ['recruiter', 'manager'],
        jdId: 'jd-001',
        candidateId: 'cand-001',
        createdAt: '2024-01-15T08:00:00Z'
      }
    ]
  }

  async sendReminder(action: ReminderAction): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log('Reminder sent:', action)
  }

  async escalateIssue(action: EscalationAction): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400))
    console.log('Issue escalated:', action)
  }

  async getAuditTrail(filters?: any): Promise<PipelineAuditEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return [
      {
        id: 'audit-001',
        applicationId: '1',
        candidateName: 'John Doe',
        action: 'status-change',
        actor: 'Alice Smith',
        actorRole: 'Recruiter',
        previousValue: 'Submitted',
        newValue: 'Interview-R1',
        timestamp: '2024-01-15T10:30:00Z',
        comment: 'Moved to technical round'
      }
    ]
  }

  async exportPipelineReport(type: string, filters?: any): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(`Exporting ${type} report with filters:`, filters)
  }

  async getPipelineSettings(): Promise<PipelineSettings> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      slaTimers: {
        'feedback': {
          defaultHours: 48,
          clientOverrides: {},
          jdOverrides: {}
        }
      },
      statusPermissions: {
        'recruiter': {
          canUpdate: ['Submitted', 'Shortlisted'],
          requiresApproval: ['Offer-Released'],
          canOverride: false
        }
      },
      reminderSettings: {
        cadence: 'daily',
        channels: ['email'],
        digestEnabled: true
      },
      integrationSettings: {
        ownershipSyncEnabled: true,
        applicationsSyncEnabled: true,
        approvalGatingEnabled: true
      }
    }
  }

  async updatePipelineSettings(settings: Partial<PipelineSettings>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Settings updated:', settings)
  }

  async updateApplicationStatus(
    id: string, 
    status: ApplicationStatus, 
    comment?: string,
    overrideReason?: string
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log(`Updated application ${id} to ${status}`, { comment, overrideReason })
  }

  async bulkUpdateStatus(update: BulkStatusUpdate): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Bulk status update:', update)
  }

  async getActiveJDs(): Promise<ActiveJD[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return [
      {
        id: 'jd-001',
        title: 'Senior React Developer',
        client: 'TechCorp Inc',
        postedDate: '2024-01-10',
        assignedRecruiter: 'Alice Smith',
        daysSinceCreated: 5,
        hasSubmissions: true
      }
    ]
  }

  async assignRecruiter(jdId: string, recruiterId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log(`Assigned recruiter ${recruiterId} to JD ${jdId}`)
  }
}

export const pipelineService = new PipelineService()