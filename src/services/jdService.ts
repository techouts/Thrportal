import { supabase } from "@/integrations/supabase/client";
import type { PaginatedResponse } from "./base/IService";

export interface JDOverviewItem {
  id: string;
  jd_id: string;
  project_name: string | null;
  client_name: string | null;
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
}

export interface JDFilters {
  status: 'all' | 'active' | 'inactive';
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
          headcount,
          salary_band_min,
          salary_band_max,
          currency,
          current_step,
          cost_center,
          business_justification,
          created_at,
          created_by,
          profiles:created_by(display_name)
        `, { count: 'exact' });

      // Apply status filter
      if (status === 'active') {
        query = query.gt('current_step', 0);
      } else if (status === 'inactive') {
        query = query.eq('current_step', 0);
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
        headcount: item.headcount,
        salary_band_min: item.salary_band_min,
        salary_band_max: item.salary_band_max,
        currency: item.currency || 'USD',
        status: item.current_step === 0 ? 'draft' : item.current_step > 0 ? 'pending' : 'approved',
        created_at: item.created_at,
        created_by_name: item.profiles?.display_name || 'Unknown',
        current_step: item.current_step,
        cost_center: item.cost_center,
        business_justification: item.business_justification,
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
      
      if (data.project_name !== undefined) updateData.project_name = data.project_name;
      if (data.client_name !== undefined) updateData.client_name = data.client_name;
      if (data.headcount !== undefined) updateData.headcount = data.headcount;
      if (data.salary_band_min !== undefined) updateData.salary_band_min = data.salary_band_min;
      if (data.salary_band_max !== undefined) updateData.salary_band_max = data.salary_band_max;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.cost_center !== undefined) updateData.cost_center = data.cost_center;
      if (data.business_justification !== undefined) updateData.business_justification = data.business_justification;

      const { data: result, error } = await supabase
        .from('jd_approvals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

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
