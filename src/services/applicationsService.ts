import { ApiService } from './api'
import { 
  JD, 
  Resume, 
  Submission, 
  ApplicationsFilters, 
  MatchFilters, 
  ApplicationsMetrics,
  RecruiterStats,
  VendorStats,
  UploadConfig
} from '@/types/applications'

export class ApplicationsService {
  private static readonly BASE_URL = '/api/applications'

  // JD Management
  static async getJDs(): Promise<JD[]> {
    // Mock data for now
    return [
      {
        id: 'jd-001',
        title: 'Senior React Developer',
        client: 'TechCorp',
        priority: 'Urgent',
        location: 'San Francisco, CA',
        skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
        minExp: 5,
        maxExp: 8,
        createdAt: '2024-01-15T10:00:00Z',
        assignedRecruiterId: 'recruiter-1'
      },
      {
        id: 'jd-002',
        title: 'DevOps Engineer',
        client: 'CloudSoft',
        priority: 'Standard',
        location: 'Remote',
        skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
        minExp: 3,
        maxExp: 6,
        createdAt: '2024-01-14T09:00:00Z',
        assignedRecruiterId: 'recruiter-2'
      }
    ]
  }

  static async getJD(id: string): Promise<JD | null> {
    const jds = await this.getJDs()
    return jds.find(jd => jd.id === id) || null
  }

  // Submissions Management
  static async getSubmissions(filters?: ApplicationsFilters): Promise<Submission[]> {
    // Mock data for now
    return [
      {
        id: 'sub-001',
        jdId: 'jd-001',
        resumeId: 'resume-001',
        submittedBy: 'John Recruiter',
        submittedAt: '2024-01-16T14:30:00Z',
        status: 'New',
        match: {
          score: 85,
          matched: ['React', 'TypeScript', 'Node.js'],
          missing: ['GraphQL'],
          extra: ['Vue.js', 'Python'],
          dims: { skills: 80, exp: 90, edu: 85 }
        },
        tat: {
          jdToFirstSubmissionHrs: 28,
          submissionToFeedbackHrs: undefined
        }
      },
      {
        id: 'sub-002',
        jdId: 'jd-002',
        resumeId: 'resume-002',
        submittedBy: 'Sarah Staffing',
        submittedAt: '2024-01-15T16:45:00Z',
        status: 'Shortlisted',
        statusReason: 'Strong AWS and Kubernetes experience',
        match: {
          score: 78,
          matched: ['AWS', 'Docker', 'Kubernetes'],
          missing: ['Terraform'],
          extra: ['Jenkins', 'Ansible'],
          dims: { skills: 75, exp: 85, edu: 75 }
        },
        tat: {
          jdToFirstSubmissionHrs: 18,
          submissionToFeedbackHrs: 24
        }
      }
    ]
  }

  static async updateSubmissionStatus(
    id: string, 
    status: Submission['status'], 
    reason?: string,
    notes?: string
  ): Promise<void> {
    // Mock implementation
    console.log('Updating submission status:', { id, status, reason, notes })
  }

  static async createSubmission(submission: Partial<Submission>): Promise<Submission> {
    // Mock implementation
    const newSubmission: Submission = {
      id: `sub-${Date.now()}`,
      jdId: submission.jdId!,
      resumeId: submission.resumeId!,
      submittedBy: submission.submittedBy!,
      submittedAt: new Date().toISOString(),
      status: 'New',
      match: submission.match || {
        score: 0,
        matched: [],
        missing: [],
        extra: []
      },
      tat: {}
    }
    return newSubmission
  }

  // Resume Management
  static async getResumes(): Promise<Resume[]> {
    // Mock data for now
    return [
      {
        id: 'resume-001',
        candidateName: 'Alice Johnson',
        email: 'alice.johnson@email.com',
        phone: '+1-555-0123',
        location: 'San Francisco, CA',
        totalExp: 6,
        skills: ['React', 'TypeScript', 'Node.js', 'Vue.js', 'Python'],
        education: ['Bachelor in Computer Science - UC Berkeley'],
        companies: [
          { name: 'Google', from: '2020-01-01', to: '2024-01-01' },
          { name: 'Startup Inc', from: '2018-06-01', to: '2019-12-31' }
        ],
        source: 'Internal',
        rawFileUrl: '/uploads/alice-johnson-resume.pdf',
        parsedJson: {},
        parsedAt: '2024-01-16T10:00:00Z',
        parseConfidence: 0.92
      },
      {
        id: 'resume-002',
        candidateName: 'Bob Chen',
        email: 'bob.chen@email.com',
        phone: '+1-555-0124',
        location: 'Seattle, WA',
        totalExp: 4,
        skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Ansible'],
        education: ['Master in Computer Science - University of Washington'],
        companies: [
          { name: 'Amazon', from: '2022-01-01', to: '2024-01-01' },
          { name: 'Microsoft', from: '2020-06-01', to: '2021-12-31' }
        ],
        source: 'Vendor',
        vendorName: 'TechRecruit Solutions',
        rawFileUrl: '/uploads/bob-chen-resume.pdf',
        parsedJson: {},
        parsedAt: '2024-01-15T12:00:00Z',
        parseConfidence: 0.88
      }
    ]
  }

  static async getResume(id: string): Promise<Resume | null> {
    const resumes = await this.getResumes()
    return resumes.find(resume => resume.id === id) || null
  }

  static async checkDuplicate(resumeData: Partial<Resume>): Promise<boolean> {
    // Mock implementation
    return false
  }

  static async uploadResume(file: File, config: UploadConfig): Promise<Resume> {
    // Mock implementation
    const newResume: Resume = {
      id: `resume-${Date.now()}`,
      candidateName: 'New Candidate',
      rawFileUrl: URL.createObjectURL(file),
      source: config.source,
      vendorName: config.vendorName,
      skills: [],
      parsedJson: {},
      parseConfidence: 0.8
    }
    return newResume
  }

  // Matching
  static async getMatches(filters: MatchFilters): Promise<Submission[]> {
    const submissions = await this.getSubmissions()
    return submissions.filter(sub => 
      !filters.jdId || sub.jdId === filters.jdId
    )
  }

  // Analytics
  static async getMetrics(filters?: ApplicationsFilters): Promise<ApplicationsMetrics> {
    // Mock data
    return {
      totalApplications: 156,
      avgMatch: 73.5,
      coverage: 68.2
    }
  }

  static async getRecruiterStats(filters?: ApplicationsFilters): Promise<RecruiterStats[]> {
    // Mock data
    return [
      {
        recruiter: 'John Recruiter',
        submissions: 45,
        shortlisted: 12,
        avgMatch: 78.5,
        avgTATJdToFirst: 24.5,
        avgTATSubToFeedback: 18.2
      },
      {
        recruiter: 'Sarah Staffing',
        submissions: 38,
        shortlisted: 15,
        avgMatch: 81.2,
        avgTATJdToFirst: 20.8,
        avgTATSubToFeedback: 16.5
      }
    ]
  }

  static async getVendorStats(filters?: ApplicationsFilters): Promise<VendorStats[]> {
    // Mock data
    return [
      {
        vendor: 'TechRecruit Solutions',
        submissions: 28,
        shortlistPercent: 32.1,
        avgMatch: 75.8,
        duplicates: 2
      },
      {
        vendor: 'Elite Staffing',
        submissions: 19,
        shortlistPercent: 42.1,
        avgMatch: 82.3,
        duplicates: 0
      }
    ]
  }

  // Exports
  static async exportJDSummary(filters?: ApplicationsFilters): Promise<void> {
    // Mock implementation
    console.log('Exporting JD summary:', filters)
  }

  static async exportRecruiterReport(filters?: ApplicationsFilters): Promise<void> {
    // Mock implementation
    console.log('Exporting recruiter report:', filters)
  }

  static async exportVendorReport(filters?: ApplicationsFilters): Promise<void> {
    // Mock implementation
    console.log('Exporting vendor report:', filters)
  }
}