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
    console.log('=== CREATE CANDIDATE SERVICE CALLED ===');
    console.log('Input data:', candidate);
    
    const insertData = {
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
    };
    
    console.log('Insert data:', insertData);
    
    const { data, error } = await supabase.from('candidates').insert(insertData).select().single();
    
    console.log('Supabase response:', { data, error });
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
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

  // Experience CRUD
  async createCandidateExperience(experience: Omit<CandidateExperience, 'id'>): Promise<CandidateExperience> {
    const { data, error } = await supabase
      .from('candidate_experience')
      .insert({
        candidate_id: experience.candidateId,
        company: experience.company,
        designation: experience.designation,
        start_date: experience.startDate,
        end_date: experience.endDate,
        is_current: experience.isCurrent,
        description: experience.description,
        skills: experience.skills,
        achievements: experience.achievements,
        ctc: experience.ctc,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      candidateId: data.candidate_id,
      company: data.company,
      designation: data.designation,
      startDate: data.start_date,
      endDate: data.end_date,
      isCurrent: data.is_current,
      description: data.description,
      skills: data.skills,
      achievements: data.achievements,
      ctc: data.ctc,
    };
  }

  async updateCandidateExperience(id: string, updates: Partial<CandidateExperience>): Promise<CandidateExperience> {
    const updateData: any = {};
    if (updates.company) updateData.company = updates.company;
    if (updates.designation) updateData.designation = updates.designation;
    if (updates.startDate) updateData.start_date = updates.startDate;
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
    if (updates.isCurrent !== undefined) updateData.is_current = updates.isCurrent;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.skills) updateData.skills = updates.skills;
    if (updates.achievements) updateData.achievements = updates.achievements;
    if (updates.ctc !== undefined) updateData.ctc = updates.ctc;
    
    const { data, error } = await supabase
      .from('candidate_experience')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      candidateId: data.candidate_id,
      company: data.company,
      designation: data.designation,
      startDate: data.start_date,
      endDate: data.end_date,
      isCurrent: data.is_current,
      description: data.description,
      skills: data.skills,
      achievements: data.achievements,
      ctc: data.ctc,
    };
  }

  async deleteCandidateExperience(id: string): Promise<boolean> {
    const { error } = await supabase.from('candidate_experience').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // Education CRUD
  async createCandidateEducation(education: Omit<CandidateEducation, 'id'>): Promise<CandidateEducation> {
    const { data, error } = await supabase
      .from('candidate_education')
      .insert({
        candidate_id: education.candidateId,
        degree: education.degree,
        field: education.field,
        institution: education.institution,
        start_year: education.startYear,
        end_year: education.endYear,
        grade: education.grade,
        type: education.type,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      candidateId: data.candidate_id,
      degree: data.degree,
      field: data.field,
      institution: data.institution,
      startYear: data.start_year,
      endYear: data.end_year,
      grade: data.grade,
      type: data.type as 'Degree' | 'Certification' | 'Course',
    };
  }

  async updateCandidateEducation(id: string, updates: Partial<CandidateEducation>): Promise<CandidateEducation> {
    const updateData: any = {};
    if (updates.degree) updateData.degree = updates.degree;
    if (updates.field) updateData.field = updates.field;
    if (updates.institution) updateData.institution = updates.institution;
    if (updates.startYear) updateData.start_year = updates.startYear;
    if (updates.endYear !== undefined) updateData.end_year = updates.endYear;
    if (updates.grade !== undefined) updateData.grade = updates.grade;
    if (updates.type) updateData.type = updates.type;
    
    const { data, error } = await supabase
      .from('candidate_education')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      candidateId: data.candidate_id,
      degree: data.degree,
      field: data.field,
      institution: data.institution,
      startYear: data.start_year,
      endYear: data.end_year,
      grade: data.grade,
      type: data.type as 'Degree' | 'Certification' | 'Course',
    };
  }

  async deleteCandidateEducation(id: string): Promise<boolean> {
    const { error } = await supabase.from('candidate_education').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // Document Upload & Delete
  async uploadCandidateDocument(
    candidateId: string, 
    file: File, 
    type: string,
    name: string
  ): Promise<CandidateDocument> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${candidateId}/${Date.now()}_${type.replace(/\s/g, '_')}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('candidate-documents')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('candidate-documents')
      .getPublicUrl(fileName);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('candidate_documents')
      .insert({
        candidate_id: candidateId,
        name: name || file.name,
        type,
        url: publicUrl,
        size: file.size,
        uploaded_by: user?.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      candidateId: data.candidate_id,
      name: data.name,
      type: data.type as any,
      url: data.url,
      uploadedAt: data.uploaded_at,
      uploadedBy: data.uploaded_by,
      size: data.size,
      verified: data.verified,
    };
  }

  async deleteCandidateDocument(id: string, url: string): Promise<boolean> {
    const pathMatch = url.match(/candidate-documents\/(.+)$/);
    if (pathMatch) {
      const { error: storageError } = await supabase.storage
        .from('candidate-documents')
        .remove([pathMatch[1]]);
      
      if (storageError) console.error('Storage delete error:', storageError);
    }
    
    const { error } = await supabase.from('candidate_documents').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}

export const candidatesService = CandidatesService.getInstance();
