import { BaseSupabaseService } from '../base/BaseSupabaseService';
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '../base/IService';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  target_audience: string[];
  author_id: string;
  published_at?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class AnnouncementSupabaseService extends BaseSupabaseService<Announcement> {
  protected tableName = 'announcements';

  async getActiveAnnouncements(targetAudience?: string[]): Promise<ApiResponse<Announcement[]>> {
    try {
      let query = supabase
        .from(this.tableName as any)
        .select('*')
        .eq('is_active', true)
        .or('published_at.is.null,published_at.lte.' + new Date().toISOString())
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .order('priority', { ascending: false })
        .order('published_at', { ascending: false });

      const { data, error } = await query;

      if (error) this.handleSupabaseError(error);

      // Filter by target audience if provided
      let filteredData = (data || []) as any;
      if (targetAudience && targetAudience.length > 0) {
        filteredData = filteredData.filter(announcement => 
          announcement.target_audience.includes('ALL') ||
          announcement.target_audience.some(audience => targetAudience.includes(audience))
        );
      }

      return this.createSuccessResponse(filteredData);
    } catch (error) {
      console.error('Error fetching active announcements:', error);
      throw error;
    }
  }

  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Announcement>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .insert(announcement)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data as any, 'Announcement created successfully');
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  async publishAnnouncement(announcementId: string): Promise<ApiResponse<Announcement>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .update({
          is_active: true,
          published_at: new Date().toISOString()
        })
        .eq('id', announcementId)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data as any, 'Announcement published successfully');
    } catch (error) {
      console.error('Error publishing announcement:', error);
      throw error;
    }
  }

  async getAnnouncementsByType(type: string): Promise<ApiResponse<Announcement[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .order('published_at', { ascending: false });

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse((data || []) as any);
    } catch (error) {
      console.error('Error fetching announcements by type:', error);
      throw error;
    }
  }

  async getAnnouncementsByPriority(priority: string): Promise<ApiResponse<Announcement[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .select('*')
        .eq('priority', priority)
        .eq('is_active', true)
        .order('published_at', { ascending: false });

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse((data || []) as any);
    } catch (error) {
      console.error('Error fetching announcements by priority:', error);
      throw error;
    }
  }

  async updateAnnouncement(announcementId: string, updates: Partial<Announcement>): Promise<ApiResponse<Announcement>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .update(updates)
        .eq('id', announcementId)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data as any, 'Announcement updated successfully');
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  }

  async deleteAnnouncement(announcementId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from(this.tableName as any)
        .delete()
        .eq('id', announcementId);

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(undefined, 'Announcement deleted successfully');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }
}