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
  UploadConfig,
  Application
} from '@/types/applications'
import { supabase } from '@/integrations/supabase/client'

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
        assignedRecruiterId: 'recruiter-1',
        status: 'Approved',
        headcount: 3,
        headcountFilled: 1,
        compensationMin: 120000,
        compensationMax: 180000,
        currency: 'USD',
        workType: 'Full-time',
        seniority: 'Senior',
        primaryRecruiter: 'recruiter-1',
        collaborators: ['recruiter-3'],
        slaHealth: 'Green'
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
        assignedRecruiterId: 'recruiter-2',
        status: 'Published',
        headcount: 2,
        headcountFilled: 0,
        compensationMin: 90000,
        compensationMax: 140000,
        currency: 'USD',
        workType: 'Full-time',
        seniority: 'Mid',
        primaryRecruiter: 'recruiter-2',
        collaborators: [],
        slaHealth: 'Amber'
      }
    ]
  }

  static async getJD(id: string): Promise<JD | null> {
    const jds = await this.getJDs()
    return jds.find(jd => jd.id === id) || null
  }

  // Submissions Management
  static async getSubmissions(filters?: ApplicationsFilters): Promise<Submission[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        candidate:candidates(id, name, email, skills),
        jd:jd_approvals(id, job_title, client_name, required_skills),
        primary_recruiter_profile:profiles!applications_primary_recruiter_id_fkey(id, display_name, first_name, last_name)
      `)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    // Fetch submitter profiles separately if needed
    const submitterIds = [...new Set(data?.map(app => app.submitted_by).filter(Boolean) || [])];
    const { data: submitterProfiles } = await supabase
      .from('profiles')
      .select('id, display_name, first_name, last_name')
      .in('id', submitterIds);

    const submitterMap = new Map(submitterProfiles?.map(p => [p.id, p]) || []);

    return (data || []).map(app => {
      const submitter = submitterMap.get(app.submitted_by);
      return {
        id: app.id,
        candidateId: app.candidate_id,
        jdId: app.jd_id,
        resumeId: '',
        submittedBy: submitter?.display_name || 
                     `${submitter?.first_name || ''} ${submitter?.last_name || ''}`.trim() || 
                     'Unknown',
        primaryRecruiter: app.primary_recruiter_profile?.display_name || 
                         `${app.primary_recruiter_profile?.first_name || ''} ${app.primary_recruiter_profile?.last_name || ''}`.trim() || 
                         'Unassigned',
        submittedAt: app.submitted_at,
        stage: app.stage as Submission['stage'],
        status: app.status as Submission['status'],
        statusReason: app.status_reason,
        notes: app.notes,
        slaStatus: app.sla_status as Submission['slaStatus'],
        lastUpdatedAt: app.last_updated_at,
        createdViaMapping: app.created_via_mapping,
        round: app.round,
        candidateName: app.candidate?.name || 'Unknown',
        candidateEmail: app.candidate?.email || '',
        jdTitle: app.jd?.job_title || 'Unknown JD',
        jdClient: app.jd?.client_name || 'Unknown Client',
        match: {
          score: 0,
          matched: [],
          missing: [],
          extra: []
        },
        tat: {}
      };
    });
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
      candidateId: submission.candidateId!,
      jdId: submission.jdId!,
      resumeId: submission.resumeId!,
      submittedBy: submission.submittedBy!,
      primaryRecruiter: submission.primaryRecruiter!,
      submittedAt: new Date().toISOString(),
      stage: 'Submitted',
      status: 'New',
      slaStatus: 'Green',
      lastUpdatedAt: new Date().toISOString(),
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
        parseConfidence: 0.92,
        owner: 'recruiter-1',
        consent: true,
        activelyLooking: true,
        activelyLookingExpiresAt: '2024-03-15T10:00:00Z',
        lastContactedAt: '2024-01-10T14:00:00Z',
        currentCTC: 110000,
        expectedCTC: 150000,
        noticePeriod: 30,
        availability: 'Immediate'
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
        parseConfidence: 0.88,
        owner: 'recruiter-2',
        consent: true,
        activelyLooking: false,
        lastContactedAt: '2024-01-05T10:00:00Z',
        currentCTC: 95000,
        expectedCTC: 120000,
        noticePeriod: 60,
        availability: '60 days'
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
      parseConfidence: 0.8,
      consent: false,
      activelyLooking: false
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

  // Create Application feature methods
  static async getActiveJDs(): Promise<Array<{ id: string; title: string; client: string; primaryRecruiterId?: string }>> {
    const { data, error } = await supabase
      .from('jd_approvals')
      .select(`
        id,
        job_title,
        client_name,
        jd_ownership_assignments (
          primary_recruiter_id
        )
      `)
      .eq('status', 'Active')
      .eq('approval_status', 'approved')
      .order('job_title')

    if (error) throw error

    return (data || []).map(jd => ({
      id: jd.id,
      title: jd.job_title || 'Untitled',
      client: jd.client_name || 'Unknown Client',
      primaryRecruiterId: (jd.jd_ownership_assignments as any)?.[0]?.primary_recruiter_id
    }))
  }

  static async getAllCandidates(): Promise<Array<{ id: string; name: string; email: string; status: string; skills: string[] }>> {
    const { data, error } = await supabase
      .from('candidates')
      .select('id, name, first_name, last_name, email, status, skills')
      .order('name')

    if (error) throw error

    return (data || []).map(c => ({
      id: c.id,
      name: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unnamed',
      email: c.email,
      status: c.status,
      skills: c.skills || []
    }))
  }

  static async checkDuplicateApplication(candidateId: string, jdId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('applications')
      .select('id')
      .eq('candidate_id', candidateId)
      .eq('jd_id', jdId)
      .maybeSingle()

    if (error) throw error
    return !!data
  }

  static async createApplication(candidateId: string, jdId: string): Promise<Application> {
    // Get primary recruiter from JD ownership
    const { data: ownership } = await supabase
      .from('jd_ownership_assignments')
      .select('primary_recruiter_id')
      .eq('jd_id', jdId)
      .maybeSingle()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // DEV-ONLY fallback: use a dummy UUID when no user is logged in
    const FALLBACK_SUBMITTER_ID = '00000000-0000-0000-0000-000000000000'
    const submittedBy = user?.id ?? FALLBACK_SUBMITTER_ID

    // Insert application
    const { data, error } = await supabase
      .from('applications')
      .insert({
        candidate_id: candidateId,
        jd_id: jdId,
        primary_recruiter_id: ownership?.primary_recruiter_id || null,
        submitted_by: submittedBy,
        stage: 'Submitted',
        status: 'New',
        sla_status: 'Green'
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      jdId: data.jd_id,
      candidateId: data.candidate_id,
      submittedBy: data.submitted_by,
      primaryRecruiter: data.primary_recruiter_id || 'Unassigned',
      submittedAt: data.submitted_at,
      stage: data.stage as Application['stage'],
      round: data.round,
      statusReason: data.status_reason,
      notes: data.notes,
      slaStatus: data.sla_status as Application['slaStatus'],
      lastUpdatedAt: data.last_updated_at,
      createdViaMapping: data.created_via_mapping
    }
  }

  static async getApplicationById(id: string): Promise<Submission | null> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          candidates:candidate_id (
            id,
            name,
            email,
            phone,
            location,
            skills,
            experience,
            status
          ),
          jd_approvals:jd_id (
            id,
            job_title,
            client_name,
            department,
            status,
            employment_type
          ),
          primary_recruiter_profile:profiles!applications_primary_recruiter_id_fkey (
            id,
            display_name,
            first_name,
            last_name
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching application:', error)
        return null
      }

      if (!data) return null

      const candidate = data.candidates as any
      const jd = data.jd_approvals as any
      const recruiterProfile = data.primary_recruiter_profile as any

      return {
        id: data.id,
        jdId: data.jd_id,
        candidateId: data.candidate_id,
        resumeId: data.candidate_id,
        submittedBy: 'System',
        primaryRecruiter: recruiterProfile?.display_name || 
                          `${recruiterProfile?.first_name || ''} ${recruiterProfile?.last_name || ''}`.trim() || 
                          'Unassigned',
        submittedAt: data.submitted_at,
        stage: data.stage as Submission['stage'],
        round: data.round || 'Round 1',
        status: data.status as Submission['status'],
        statusReason: data.status_reason,
        notes: data.notes,
        slaStatus: data.sla_status as Submission['slaStatus'],
        lastUpdatedAt: data.last_updated_at,
        createdViaMapping: data.created_via_mapping || false,
        candidateName: candidate?.name || 'Unknown Candidate',
        candidateEmail: candidate?.email || '',
        jdTitle: jd?.job_title || 'Unknown Position',
        jdClient: jd?.client_name || 'Unknown Client',
        match: {
          score: 0,
          matched: [],
          missing: [],
          extra: []
        },
        tat: {}
      }
    } catch (error) {
      console.error('Error in getApplicationById:', error)
      return null
    }
  }

  // Get application timeline events
  static async getApplicationTimeline(applicationId: string): Promise<Array<{
    id: string
    timestamp: string
    actor: string
    action: string
    details: string
    type: string
    fromStatus?: string
    toStatus: string
    reason?: string
  }>> {
    try {
      // First get the application to get candidate_id and jd_id
      const { data: app, error: appError } = await supabase
        .from('applications')
        .select('candidate_id, jd_id')
        .eq('id', applicationId)
        .single()

      if (appError || !app) {
        console.error('Error fetching application:', appError)
        return []
      }

      // Fetch timeline events for this candidate and JD
      const { data, error } = await supabase
        .from('candidate_timeline')
        .select(`
          id,
          timestamp,
          from_status,
          to_status,
          reason,
          notes,
          automatic_change,
          changed_by,
          profiles:changed_by (
            display_name,
            first_name,
            last_name
          )
        `)
        .eq('candidate_id', app.candidate_id)
        .eq('jd_id', app.jd_id)
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Error fetching timeline:', error)
        return []
      }

      return (data || []).map(event => {
        const profile = event.profiles as any
        const actorName = profile?.display_name || 
                         `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
                         (event.automatic_change ? 'System' : 'Unknown')

        let action = 'Status Changed'
        let type = 'stage_change'
        let details = ''

        if (event.from_status && event.to_status) {
          action = 'Stage Changed'
          details = `${event.from_status} → ${event.to_status}`
          type = 'stage_change'
        } else if (event.notes) {
          action = 'Note Added'
          details = event.notes
          type = 'note'
        } else {
          action = 'Status Updated'
          details = event.to_status
          type = 'status_update'
        }

        if (event.reason) {
          details = `${details}${details ? ': ' : ''}${event.reason}`
        }

        return {
          id: event.id,
          timestamp: event.timestamp,
          actor: actorName,
          action,
          details,
          type,
          fromStatus: event.from_status || undefined,
          toStatus: event.to_status,
          reason: event.reason || undefined
        }
      })
    } catch (error) {
      console.error('Error in getApplicationTimeline:', error)
      return []
    }
  }

  // Update application notes
  static async updateApplicationNotes(applicationId: string, notes: string): Promise<void> {
    const { error } = await supabase
      .from('applications')
      .update({ notes })
      .eq('id', applicationId)

    if (error) {
      console.error('Error updating notes:', error)
      throw error
    }
  }
}