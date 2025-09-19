import { BaseSupabaseService } from '../base/BaseSupabaseService';

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

  async getActiveAnnouncements(targetAudience?: string[]) {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .or('published_at.is.null,published_at.lte.' + new Date().toISOString())
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .order('priority', { ascending: false })
        .order('published_at', { ascending: false });

      const { data, error } = await query;

      if (error) this.handleSupabaseError(error);

      // Filter by target audience if provided
      let filteredData = data || [];
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

  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert(announcement)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data, 'Announcement created successfully');
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  async publishAnnouncement(announcementId: string) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          is_active: true,
          published_at: new Date().toISOString()
        })
        .eq('id', announcementId)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data, 'Announcement published successfully');
    } catch (error) {
      console.error('Error publishing announcement:', error);
      throw error;
    }
  }

  async getAnnouncementsByType(type: string) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .order('published_at', { ascending: false });

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data || []);
    } catch (error) {
      console.error('Error fetching announcements by type:', error);
      throw error;
    }
  }
}