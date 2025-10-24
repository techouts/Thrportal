import { supabase } from "@/integrations/supabase/client";
import type { PaginatedResponse } from "./base/IService";

export interface JDOverviewItem {
  id: string;
  jd_id: string;
  project_name: string | null;
  client_name: string | null;
  job_title: string | null;
  department: string | null;
  business_unit: string | null;
  headcount: number | null;
  salary_band_min: number | null;
  salary_band_max: number | null;
  currency: string | null;
  status: string;
  created_at: string;
  created_by_name: string | null;
  current_step: number | null;
  cost_center: string | null;
  business_justification: string | null;
  work_location: { city: string; mode: string } | null;
  is_internal: boolean | null;
  short_summary: string | null;
  responsibilities: string[] | null;
  required_skills: { mustHave: string[]; goodToHave: string[] } | null;
  experience_min: number | null;
  experience_max: number | null;
  positions: number | null;
  priority: string | null;
  job_type: string | null;
  pay_type: string | null;
  employment_type: string | null;
  ctc_monthly_min: number | null;
  ctc_monthly_max: number | null;
  target_date: string | null;
  resume_deadline: string | null;
  interview_rounds: string[] | null;
  additional_notes: string | null;
  approver_names: string[] | null;
}

export interface JDFilters {
  status: 'all' | 'active' | 'inactive' | 'draft';
  page: number;
  limit: number;
  sortBy?: 'created_at' | 'client_name';
  sortOrder?: 'asc' | 'desc';
}

export class JDService {
  static async getJDs(filters: JDFilters): Promise<PaginatedResponse<JDOverviewItem>> {
    try {
      const { page, limit, status, sortBy = 'created_at', sortOrder = 'desc' } = filters;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('jd_approvals')
        .select(`
          id,
          project_name,
          client_name,
          job_title,
          department,
          business_unit,
          headcount,
          salary_band_min,
          salary_band_max,
          currency,
          current_step,
          cost_center,
          business_justification,
          work_location,
          is_internal,
          short_summary,
          responsibilities,
          required_skills,
          experience_min,
          experience_max,
          positions,
          priority,
          job_type,
          pay_type,
          employment_type,
          ctc_monthly_min,
          ctc_monthly_max,
          target_date,
          resume_deadline,
          interview_rounds,
          additional_notes,
          approver_names,
          status,
          created_at,
          created_by,
          profiles:created_by(display_name)
        `, { count: 'exact' });

      // Apply status filter
      if (status === 'draft') {
        query = query.eq('status', 'Draft');
      } else if (status === 'active') {
        query = query.neq('status', 'Draft');
      } else if (status === 'inactive') {
        query = query.in('status', ['Closed', 'Cancelled']);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const items: JDOverviewItem[] = (data || []).map((item: any) => ({
        id: item.id,
        jd_id: `JD-${item.id.substring(0, 8)}`,
        project_name: item.project_name,
        client_name: item.client_name,
        job_title: item.job_title,
        department: item.department,
        business_unit: item.business_unit,
        headcount: item.headcount,
        salary_band_min: item.salary_band_min,
        salary_band_max: item.salary_band_max,
        currency: item.currency || 'USD',
        status: item.status || (item.current_step === 0 ? 'Draft' : 'Active'),
        created_at: item.created_at,
        created_by_name: item.profiles?.display_name || 'Unknown',
        current_step: item.current_step,
        cost_center: item.cost_center,
        business_justification: item.business_justification,
        work_location: item.work_location,
        is_internal: item.is_internal,
        short_summary: item.short_summary,
        responsibilities: item.responsibilities,
        required_skills: item.required_skills,
        experience_min: item.experience_min,
        experience_max: item.experience_max,
        positions: item.positions,
        priority: item.priority,
        job_type: item.job_type,
        pay_type: item.pay_type,
        employment_type: item.employment_type,
        ctc_monthly_min: item.ctc_monthly_min,
        ctc_monthly_max: item.ctc_monthly_max,
        target_date: item.target_date,
        resume_deadline: item.resume_deadline,
        interview_rounds: item.interview_rounds,
        additional_notes: item.additional_notes,
        approver_names: item.approver_names,
      }));

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: items,
        success: true,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      console.error('Error fetching JDs:', error);
      return {
        data: [],
        success: false,
        error: error.message,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  static async updateJD(id: string, data: Partial<JDOverviewItem>) {
    try {
      const updateData: any = {};
      
      if (data.job_title !== undefined) updateData.job_title = data.job_title;
      if (data.project_name !== undefined) updateData.project_name = data.project_name;
      if (data.client_name !== undefined) updateData.client_name = data.client_name;
      if (data.department !== undefined) updateData.department = data.department;
      if (data.business_unit !== undefined) updateData.business_unit = data.business_unit;
      if (data.headcount !== undefined) updateData.headcount = data.headcount;
      if (data.positions !== undefined) updateData.positions = data.positions;
      if (data.salary_band_min !== undefined) updateData.salary_band_min = data.salary_band_min;
      if (data.salary_band_max !== undefined) updateData.salary_band_max = data.salary_band_max;
      if (data.ctc_monthly_min !== undefined) updateData.ctc_monthly_min = data.ctc_monthly_min;
      if (data.ctc_monthly_max !== undefined) updateData.ctc_monthly_max = data.ctc_monthly_max;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.cost_center !== undefined) updateData.cost_center = data.cost_center;
      if (data.business_justification !== undefined) updateData.business_justification = data.business_justification;
      if (data.short_summary !== undefined) updateData.short_summary = data.short_summary;
      if (data.experience_min !== undefined) updateData.experience_min = data.experience_min;
      if (data.experience_max !== undefined) updateData.experience_max = data.experience_max;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.job_type !== undefined) updateData.job_type = data.job_type;
      if (data.pay_type !== undefined) updateData.pay_type = data.pay_type;
      if (data.employment_type !== undefined) updateData.employment_type = data.employment_type;
      if (data.additional_notes !== undefined) updateData.additional_notes = data.additional_notes;
      if (data.is_internal !== undefined) updateData.is_internal = data.is_internal;

      // Track if status is being changed to Active
      const statusChangedToActive = data.status === 'Active';

      const { data: result, error } = await supabase
        .from('jd_approvals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // If status changed to Active, ensure approval steps exist
      if (statusChangedToActive && result && result.is_internal !== undefined) {
        const { approvalsService } = await import('./approvalsService');
        await approvalsService.ensureApprovalStepsExist(result.id, result.is_internal);
      }

      return {
        data: result,
        success: true,
        message: 'JD updated successfully',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      console.error('Error updating JD:', error);
      return {
        data: null,
        success: false,
        error: error.message,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
}