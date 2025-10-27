import type {
  CandidateProfile,
  CandidateFilters,
  CandidateExperience,
  CandidateEducation,
  CandidateDocument,
  CandidateCommunication,
  CandidateStatusTimeline,
  CandidateOffer,
  TalentPool,
  CandidateReports,
  CandidateStatus,
} from '@/types/candidates';
import { supabase } from '@/integrations/supabase/client';

class CandidatesService {
  private static instance: CandidatesService;

  private constructor() {}

  static getInstance(): CandidatesService {
    if (!CandidatesService.instance) {
      CandidatesService.instance = new CandidatesService();
    }
    return CandidatesService.instance;
  }

  private mapToCandidate(row: any): CandidateProfile {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone || '',
      linkedinUrl: row.linkedin_url,
      location: row.location,
      currentCtc: row.current_ctc,
      expectedCtc: row.expected_ctc,
      noticePeriod: row.notice_period,
      status: row.status as CandidateStatus,
      source: row.source,
      recruiterOwner: row.recruiter_owner || '',
      skills: row.skills || [],
      experience: row.experience,
      lastUpdated: row.updated_at,
      createdAt: row.created_at,
      avatarUrl: row.avatar_url,
      consent: row.consent,
      gdprCompliant: row.gdpr_compliant,
      
      // Phase 2 fields
      firstName: row.first_name,
      middleName: row.middle_name,
      lastName: row.last_name,
      dateOfBirth: row.date_of_birth,
      maritalStatus: row.marital_status,
      languagesKnown: row.languages_known || [],
      panCardNumber: row.pan_card_number,
      aadhaarCardNumber: row.aadhaar_card_number,
      passportNumber: row.passport_number,
      city: row.city,
      state: row.state,
      country: row.country,
      address: row.address,
      pincode: row.pincode,
      willingToRelocate: row.willing_to_relocate,
      githubUrl: row.github_url,
      alternateEmail: row.alternate_email,
      jobType: row.job_type,
      preferredShift: row.preferred_shift,
      expectedCtcType: row.expected_ctc_type,
      statusExtended: row.status_extended,
    };
  }

  async getCandidates(filters?: CandidateFilters): Promise<CandidateProfile[]> {
    let query = supabase.from('candidates').select('*');

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    if (filters?.source && filters.source.length > 0) {
      query = query.in('source', filters.source);
    }
    if (filters?.location && filters.location.length > 0) {
      query = query.in('location', filters.location);
    }
    if (filters?.experienceRange) {
      query = query.gte('experience', filters.experienceRange.min).lte('experience', filters.experienceRange.max);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    
    return (data || []).map(this.mapToCandidate);
  }

  async getCandidateById(id: string): Promise<CandidateProfile | null> {
    const { data, error } = await supabase.from('candidates').select('*').eq('id', id).single();
    if (error) return null;
    return data ? this.mapToCandidate(data) : null;
  }

  async createCandidate(
    candidate: Omit<CandidateProfile, 'id' | 'createdAt' | 'lastUpdated'>
  ): Promise<CandidateProfile> {
    const { data, error } = await supabase.from('candidates').insert({
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      linkedin_url: candidate.linkedinUrl,
      location: candidate.location,
      current_ctc: candidate.currentCtc,
      expected_ctc: candidate.expectedCtc,
      notice_period: candidate.noticePeriod,
      status: candidate.status,
      source: candidate.source,
      recruiter_owner: candidate.recruiterOwner,
      skills: candidate.skills,
      experience: candidate.experience,
      consent: candidate.consent,
      gdpr_compliant: candidate.gdprCompliant,
      avatar_url: candidate.avatarUrl,
      // Phase 2 fields
      first_name: candidate.firstName,
      middle_name: candidate.middleName,
      last_name: candidate.lastName,
      date_of_birth: candidate.dateOfBirth,
      marital_status: candidate.maritalStatus,
      languages_known: candidate.languagesKnown,
      pan_card_number: candidate.panCardNumber,
      aadhaar_card_number: candidate.aadhaarCardNumber,
      passport_number: candidate.passportNumber,
      city: candidate.city,
      state: candidate.state,
      country: candidate.country,
      address: candidate.address,
      pincode: candidate.pincode,
      willing_to_relocate: candidate.willingToRelocate,
      github_url: candidate.githubUrl,
      alternate_email: candidate.alternateEmail,
      job_type: candidate.jobType,
      preferred_shift: candidate.preferredShift,
      expected_ctc_type: candidate.expectedCtcType,
      status_extended: candidate.statusExtended,
    }).select().single();
    
    if (error) throw error;
    return this.mapToCandidate(data);
  }

  async updateCandidate(
    id: string,
    updates: Partial<CandidateProfile>
  ): Promise<CandidateProfile | null> {
    const { data, error } = await supabase.from('candidates').update({
      name: updates.name,
      email: updates.email,
      phone: updates.phone,
      linkedin_url: updates.linkedinUrl,
      location: updates.location,
      current_ctc: updates.currentCtc,
      expected_ctc: updates.expectedCtc,
      notice_period: updates.noticePeriod,
      status: updates.status,
      source: updates.source,
      recruiter_owner: updates.recruiterOwner,
      skills: updates.skills,
      experience: updates.experience,
      avatar_url: updates.avatarUrl,
    }).eq('id', id).select().single();
    
    if (error) return null;
    return this.mapToCandidate(data);
  }

  async getCandidateExperience(candidateId: string): Promise<CandidateExperience[]> {
    const { data, error } = await supabase.from('candidate_experience').select('*').eq('candidate_id', candidateId).order('start_date', { ascending: false });
    if (error) return [];
    return (data || []).map(row => ({
      id: row.id,
      candidateId: row.candidate_id,
      company: row.company,
      designation: row.designation,
      startDate: row.start_date,
      endDate: row.end_date,
      isCurrent: row.is_current,
      description: row.description || '',
      skills: row.skills || [],
      achievements: row.achievements || [],
      ctc: row.ctc,
    }));
  }

  async getCandidateEducation(candidateId: string): Promise<CandidateEducation[]> {
    const { data, error } = await supabase.from('candidate_education').select('*').eq('candidate_id', candidateId).order('start_year', { ascending: false });
    if (error) return [];
    return (data || []).map(row => ({
      id: row.id,
      candidateId: row.candidate_id,
      degree: row.degree,
      field: row.field,
      institution: row.institution,
      startYear: row.start_year,
      endYear: row.end_year,
      grade: row.grade,
      type: row.type as 'Degree' | 'Certification' | 'Course',
    }));
  }

  async getCandidateDocuments(candidateId: string): Promise<CandidateDocument[]> {
    const { data, error } = await supabase.from('candidate_documents').select('*').eq('candidate_id', candidateId).order('uploaded_at', { ascending: false });
    if (error) return [];
    return (data || []).map(row => ({
      id: row.id,
      candidateId: row.candidate_id,
      name: row.name,
      type: row.type as any,
      url: row.url,
      uploadedAt: row.uploaded_at,
      uploadedBy: row.uploaded_by || '',
      size: row.size,
      verified: row.verified,
    }));
  }

  async getCandidateCommunications(candidateId: string): Promise<CandidateCommunication[]> {
    const { data, error } = await supabase.from('candidate_communications').select('*').eq('candidate_id', candidateId).order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(row => ({
      id: row.id,
      candidateId: row.candidate_id,
      type: row.type as any,
      direction: row.direction as 'Inbound' | 'Outbound',
      subject: row.subject,
      content: row.content,
      createdAt: row.created_at,
      createdBy: row.created_by || '',
      attachments: row.attachments || [],
      metadata: row.metadata as any,
    }));
  }

  async getCandidateTimeline(candidateId: string): Promise<CandidateStatusTimeline[]> {
    const { data, error } = await supabase.from('candidate_timeline').select('*').eq('candidate_id', candidateId).order('timestamp', { ascending: false });
    if (error) return [];
    return (data || []).map(row => ({
      id: row.id,
      candidateId: row.candidate_id,
      fromStatus: row.from_status as CandidateStatus | undefined,
      toStatus: row.to_status as CandidateStatus,
      timestamp: row.timestamp,
      changedBy: row.changed_by || '',
      reason: row.reason,
      notes: row.notes,
      jdId: row.jd_id,
      automaticChange: row.automatic_change,
    }));
  }

  async getCandidateOffers(candidateId: string): Promise<CandidateOffer[]> {
    const { data, error } = await supabase.from('candidate_offers').select('*').eq('candidate_id', candidateId).order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(row => ({
      id: row.id,
      candidateId: row.candidate_id,
      jdId: row.jd_id,
      designation: row.designation,
      ctc: row.ctc,
      location: row.location,
      joiningDate: row.joining_date,
      status: row.status as any,
      approvalWorkflow: row.approval_workflow as any || [],
      terms: row.terms || [],
      sentAt: row.sent_at,
      respondedAt: row.responded_at,
      declineReason: row.decline_reason,
      noShowDate: row.no_show_date,
    }));
  }

  async getTalentPools(): Promise<TalentPool[]> {
    const { data: pools, error: poolsError } = await supabase.from('talent_pools').select('*').order('created_at', { ascending: false });
    if (poolsError) return [];
    
    const { data: links } = await supabase.from('candidate_pool_links').select('candidate_id, pool_id');
    
    return (pools || []).map(pool => ({
      id: pool.id,
      name: pool.name,
      description: pool.description || '',
      tags: pool.tags || [],
      candidateIds: (links || []).filter(l => l.pool_id === pool.id).map(l => l.candidate_id),
      createdBy: pool.created_by || '',
      createdAt: pool.created_at,
      isPublic: pool.is_public,
      sharedWith: pool.shared_with || [],
    }));
  }

  async createTalentPool(pool: Omit<TalentPool, 'id' | 'createdAt'>): Promise<TalentPool> {
    const { data, error } = await supabase.from('talent_pools').insert({
      name: pool.name,
      description: pool.description,
      tags: pool.tags,
      is_public: pool.isPublic,
      shared_with: pool.sharedWith,
    }).select().single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      tags: data.tags || [],
      candidateIds: [],
      createdBy: data.created_by || '',
      createdAt: data.created_at,
      isPublic: data.is_public,
      sharedWith: data.shared_with || [],
    };
  }

  async addCandidateToPool(poolId: string, candidateId: string): Promise<boolean> {
    const { error } = await supabase.from('candidate_pool_links').insert({
      pool_id: poolId,
      candidate_id: candidateId,
    });
    return !error;
  }

  async getReports(): Promise<CandidateReports> {
    // Simplified mock report data - can be replaced with actual DB queries
    return {
      recruiterStats: [],
      sourceAnalytics: [],
      conversionMetrics: {
        sourcedToShortlisted: 58,
        shortlistedToSubmitted: 67,
        submittedToInterview: 78,
        interviewToOffer: 65,
        offerToJoin: 82,
        overallConversion: 15.2,
      },
      pipelineHealth: {
        totalCandidates: 5,
        candidatesByStage: {} as any,
        avgTimeInStage: {} as any,
        bottlenecks: [],
      },
      rejectionAnalysis: {
        candidateDriven: { total: 0, reasons: {} },
        clientDriven: { total: 0, reasons: {} },
        topReasons: [],
      },
    };
  }

  async bulkUpdateStatus(candidateIds: string[], status: CandidateStatus, reason?: string): Promise<boolean> {
    const { error } = await supabase.from('candidates').update({ status }).in('id', candidateIds);
    if (error) return false;
    
    const timelineEntries = candidateIds.map(id => ({
      candidate_id: id,
      to_status: status,
      reason: reason || 'Bulk status update',
      automatic_change: false,
    }));
    
    await supabase.from('candidate_timeline').insert(timelineEntries);
    return true;
  }

  async exportCandidates(format: 'csv' | 'excel', filters?: CandidateFilters): Promise<string> {
    return `https://exports.company.com/candidates-${Date.now()}.${format}`;
  }
}

export const candidatesService = CandidatesService.getInstance();
