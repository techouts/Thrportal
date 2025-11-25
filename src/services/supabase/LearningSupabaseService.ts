import { BaseSupabaseService } from '../base/BaseSupabaseService';
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '../base/IService';

interface Course {
  id: string;
  title: string;
  description?: string;
  category?: string;
  level: string;
  duration_hours: number;
  format: string;
  instructor?: string;
  max_participants?: number;
  prerequisites?: string[];
  skills?: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Enrollment {
  id: string;
  employee_id: string;
  course_id: string;
  status: string;
  progress: number;
  enrolled_at: string;
  started_at?: string;
  completed_at?: string;
  certificate_url?: string;
  created_at: string;
  updated_at: string;
}

export class LearningSupabaseService extends BaseSupabaseService<Course> {
  protected tableName = 'courses';

  async getAvailableCourses(): Promise<ApiResponse<Course[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .select('*')
        .eq('is_active', true)
        .order('title');

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse((data || []) as any);
    } catch (error) {
      console.error('Error fetching available courses:', error);
      throw error;
    }
  }

  async getCoursesByCategory(category: string): Promise<ApiResponse<Course[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('title');

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse((data || []) as any);
    } catch (error) {
      console.error('Error fetching courses by category:', error);
      throw error;
    }
  }

  async enrollInCourse(employeeId: string, courseId: string): Promise<ApiResponse<Enrollment>> {
    try {
      const { data, error } = await supabase
        .from('enrollments' as any)
        .insert({
          employee_id: employeeId,
          course_id: courseId,
          status: 'ENROLLED'
        })
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data as any, 'Successfully enrolled in course');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  }

  async getEmployeeEnrollments(employeeId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('enrollments' as any)
        .select(`
          *,
          courses (
            id,
            title,
            description,
            category,
            level,
            duration_hours,
            format,
            instructor
          )
        `)
        .eq('employee_id', employeeId)
        .order('enrolled_at', { ascending: false });

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data || []);
    } catch (error) {
      console.error('Error fetching employee enrollments:', error);
      throw error;
    }
  }

  async updateEnrollmentProgress(enrollmentId: string, progress: number): Promise<ApiResponse<Enrollment>> {
    try {
      const updates: any = { progress };
      
      // If progress is 100%, mark as completed
      if (progress >= 100) {
        updates.status = 'COMPLETED';
        updates.completed_at = new Date().toISOString();
      } else if (progress > 0) {
        updates.status = 'IN_PROGRESS';
        // Get current enrollment to check if started_at is already set
        const { data: currentEnrollment } = await supabase
          .from('enrollments' as any)
          .select('started_at')
          .eq('id', enrollmentId)
          .single();

        if (!(currentEnrollment as any)?.started_at) {
          updates.started_at = new Date().toISOString();
        }
      }

      const { data, error } = await supabase
        .from('enrollments' as any)
        .update(updates)
        .eq('id', enrollmentId)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data as any, 'Progress updated successfully');
    } catch (error) {
      console.error('Error updating enrollment progress:', error);
      throw error;
    }
  }

  async getCompletedCourses(employeeId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('enrollments' as any)
        .select(`
          *,
          courses (
            id,
            title,
            description,
            category,
            level,
            duration_hours
          )
        `)
        .eq('employee_id', employeeId)
        .eq('status', 'COMPLETED')
        .order('completed_at', { ascending: false });

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data || []);
    } catch (error) {
      console.error('Error fetching completed courses:', error);
      throw error;
    }
  }

  async createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Course>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .insert(course)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data as any, 'Course created successfully');
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  async getCourseCategories(): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .select('category')
        .eq('is_active', true)
        .not('category', 'is', null);

      if (error) this.handleSupabaseError(error);

      const categories = [...new Set(data?.map((item: any) => item.category).filter(Boolean))] as string[];
      
      return this.createSuccessResponse(categories);
    } catch (error) {
      console.error('Error fetching course categories:', error);
      throw error;
    }
  }

  async searchCourses(searchTerm: string): Promise<ApiResponse<Course[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .select('*')
        .eq('is_active', true)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('title');

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse((data || []) as any);
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  }
}