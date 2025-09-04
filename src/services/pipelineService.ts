import { ApiService } from './api'
import { 
  PipelineApplication, 
  ActiveJD, 
  PipelineFilters, 
  PipelineMetrics,
  FunnelData,
  RecruiterPerformance,
  BulkStatusUpdate,
  ApplicationStatus,
  StatusHistoryEntry,
  PipelineAuditEntry
} from '@/types/pipeline'

export class PipelineService {
  private static readonly BASE_URL = '/api/pipeline'

  // Pipeline Applications
  static async getApplications(filters?: PipelineFilters): Promise<PipelineApplication[]> {
    // Mock data for now
    return [
      {
        id: 'app-001',
        candidateName: 'Alice Johnson',
        jdId: 'jd-001',
        jdTitle: 'Senior React Developer',
        client: 'TechCorp',
        recruiterName: 'John Recruiter',
        currentStatus: 'L2 Cleared',
        lastUpdated: '2024-01-16T14:30:00Z',
        notes: 'Strong technical background, excellent communication skills',
        updatedBy: 'Sarah HR',
        submittedAt: '2024-01-10T09:00:00Z',
        statusHistory: [
          {
            id: 'hist-001',
            newStatus: 'Submitted',
            changedBy: 'John Recruiter',
            changedAt: '2024-01-10T09:00:00Z'
          },
          {
            id: 'hist-002',
            previousStatus: 'Submitted',
            newStatus: 'L1 Cleared',
            changedBy: 'Technical Lead',
            changedAt: '2024-01-12T15:30:00Z',
            comment: 'Good technical skills, cleared L1 interview'
          },
          {
            id: 'hist-003',
            previousStatus: 'L1 Cleared',
            newStatus: 'L2 Cleared',
            changedBy: 'Engineering Manager',
            changedAt: '2024-01-16T14:30:00Z',
            comment: 'Excellent problem-solving approach'
          }
        ]
      },
      {
        id: 'app-002',
        candidateName: 'Bob Chen',
        jdId: 'jd-002',
        jdTitle: 'DevOps Engineer',
        client: 'CloudSoft',
        recruiterName: 'Sarah Staffing',
        currentStatus: 'Offer',
        lastUpdated: '2024-01-17T10:15:00Z',
        notes: 'Strong AWS experience, team player',
        updatedBy: 'HR Manager',
        submittedAt: '2024-01-08T11:00:00Z',
        statusHistory: [
          {
            id: 'hist-004',
            newStatus: 'Submitted',
            changedBy: 'Sarah Staffing',
            changedAt: '2024-01-08T11:00:00Z'
          },
          {
            id: 'hist-005',
            previousStatus: 'Submitted',
            newStatus: 'L1 Cleared',
            changedBy: 'DevOps Lead',
            changedAt: '2024-01-10T16:00:00Z'
          },
          {
            id: 'hist-006',
            previousStatus: 'L1 Cleared',
            newStatus: 'L2 Cleared',
            changedBy: 'DevOps Manager',
            changedAt: '2024-01-12T14:00:00Z'
          },
          {
            id: 'hist-007',
            previousStatus: 'L2 Cleared',
            newStatus: 'HR Cleared',
            changedBy: 'HR Manager',
            changedAt: '2024-01-15T11:30:00Z'
          },
          {
            id: 'hist-008',
            previousStatus: 'HR Cleared',
            newStatus: 'Offer',
            changedBy: 'HR Manager',
            changedAt: '2024-01-17T10:15:00Z',
            comment: 'Offer extended - 120K package'
          }
        ]
      },
      {
        id: 'app-003',
        candidateName: 'Carol Davis',
        jdId: 'jd-001',
        jdTitle: 'Senior React Developer',
        client: 'TechCorp',
        recruiterName: 'Mike Talent',
        currentStatus: 'Rejected',
        lastUpdated: '2024-01-15T16:45:00Z',
        notes: 'Technical skills good but communication needs improvement',
        updatedBy: 'Technical Lead',
        submittedAt: '2024-01-11T14:20:00Z',
        statusHistory: [
          {
            id: 'hist-009',
            newStatus: 'Submitted',
            changedBy: 'Mike Talent',
            changedAt: '2024-01-11T14:20:00Z'
          },
          {
            id: 'hist-010',
            previousStatus: 'Submitted',
            newStatus: 'Rejected',
            changedBy: 'Technical Lead',
            changedAt: '2024-01-15T16:45:00Z',
            comment: 'Communication skills not meeting requirements'
          }
        ]
      }
    ]
  }

  static async updateApplicationStatus(
    id: string, 
    status: ApplicationStatus, 
    comment?: string
  ): Promise<void> {
    // Mock implementation
    console.log('Updating application status:', { id, status, comment })
  }

  static async bulkUpdateStatus(update: BulkStatusUpdate): Promise<void> {
    // Mock implementation
    console.log('Bulk updating applications:', update)
  }

  static async addNotes(id: string, notes: string): Promise<void> {
    // Mock implementation
    console.log('Adding notes to application:', { id, notes })
  }

  // Active JDs
  static async getActiveJDs(): Promise<ActiveJD[]> {
    // Mock data
    return [
      {
        id: 'jd-003',
        title: 'Full Stack Developer',
        client: 'StartupCo',
        postedDate: '2024-01-05T10:00:00Z',
        assignedRecruiter: 'John Recruiter',
        daysSinceCreated: 12,
        hasSubmissions: false
      },
      {
        id: 'jd-004',
        title: 'Data Scientist',
        client: 'DataTech',
        postedDate: '2024-01-12T15:30:00Z',
        assignedRecruiter: 'Mike Talent',
        daysSinceCreated: 5,
        hasSubmissions: false
      },
      {
        id: 'jd-005',
        title: 'Product Manager',
        client: 'InnovateTech',
        postedDate: '2024-01-01T09:00:00Z',
        assignedRecruiter: 'Sarah Staffing',
        daysSinceCreated: 16,
        hasSubmissions: false
      }
    ]
  }

  static async assignRecruiter(jdId: string, recruiterId: string): Promise<void> {
    // Mock implementation
    console.log('Assigning recruiter to JD:', { jdId, recruiterId })
  }

  // Analytics
  static async getMetrics(filters?: PipelineFilters): Promise<PipelineMetrics> {
    // Mock data
    return {
      totalActiveJDs: 23,
      totalApplications: 156,
      avgTimeToOffer: 12.5,
      dropoffRate: 25.8,
      offerAcceptanceRatio: 78.5,
      jdsWithNoSubmissions: 8,
      dailySubmissions: [
        { date: '2024-01-10', count: 12 },
        { date: '2024-01-11', count: 15 },
        { date: '2024-01-12', count: 8 },
        { date: '2024-01-13', count: 18 },
        { date: '2024-01-14', count: 22 },
        { date: '2024-01-15', count: 19 },
        { date: '2024-01-16', count: 25 }
      ]
    }
  }

  static async getFunnelData(filters?: PipelineFilters): Promise<FunnelData[]> {
    // Mock data
    return [
      { stage: 'Submitted', count: 156, conversionRate: 100, dropoffRate: 0 },
      { stage: 'L1 Cleared', count: 125, conversionRate: 80.1, dropoffRate: 19.9 },
      { stage: 'L2 Cleared', count: 98, conversionRate: 78.4, dropoffRate: 21.6 },
      { stage: 'L3 Cleared', count: 76, conversionRate: 77.6, dropoffRate: 22.4 },
      { stage: 'HR Cleared', count: 65, conversionRate: 85.5, dropoffRate: 14.5 },
      { stage: 'Offer', count: 45, conversionRate: 69.2, dropoffRate: 30.8 },
      { stage: 'Rejected', count: 0, conversionRate: 0, dropoffRate: 0 }
    ]
  }

  static async getRecruiterPerformance(filters?: PipelineFilters): Promise<RecruiterPerformance[]> {
    // Mock data
    return [
      {
        recruiterId: 'rec-001',
        recruiterName: 'John Recruiter',
        submissions: 45,
        l1Clears: 38,
        offersMade: 15,
        offersAccepted: 12,
        avgTimeToOffer: 11.2,
        offerToJoinRatio: 80.0
      },
      {
        recruiterId: 'rec-002',
        recruiterName: 'Sarah Staffing',
        submissions: 38,
        l1Clears: 32,
        offersMade: 18,
        offersAccepted: 15,
        avgTimeToOffer: 10.8,
        offerToJoinRatio: 83.3
      },
      {
        recruiterId: 'rec-003',
        recruiterName: 'Mike Talent',
        submissions: 32,
        l1Clears: 25,
        offersMade: 12,
        offersAccepted: 8,
        avgTimeToOffer: 14.5,
        offerToJoinRatio: 66.7
      }
    ]
  }

  // Audit Trail
  static async getAuditTrail(applicationId?: string): Promise<PipelineAuditEntry[]> {
    // Mock data
    return [
      {
        id: 'audit-001',
        applicationId: 'app-001',
        candidateName: 'Alice Johnson',
        action: 'Status Changed',
        previousValue: 'L1 Cleared',
        newValue: 'L2 Cleared',
        changedBy: 'Engineering Manager',
        changedAt: '2024-01-16T14:30:00Z',
        comment: 'Excellent problem-solving approach'
      },
      {
        id: 'audit-002',
        applicationId: 'app-002',
        candidateName: 'Bob Chen',
        action: 'Status Changed',
        previousValue: 'HR Cleared',
        newValue: 'Offer',
        changedBy: 'HR Manager',
        changedAt: '2024-01-17T10:15:00Z',
        comment: 'Offer extended - 120K package'
      }
    ]
  }

  // Export
  static async exportApplications(filters?: PipelineFilters, format: 'csv' | 'excel' = 'csv'): Promise<void> {
    // Mock implementation
    console.log('Exporting applications:', { filters, format })
  }

  static async exportAuditTrail(filters?: PipelineFilters): Promise<void> {
    // Mock implementation
    console.log('Exporting audit trail:', filters)
  }
}