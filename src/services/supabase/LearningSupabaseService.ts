import { BaseSupabaseService } from '../base/BaseSupabaseService';

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

  async getAvailableCourses() {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .order('title');

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data || []);
    } catch (error) {
      console.error('Error fetching available courses:', error);
      throw error;
    }
  }

  async getCoursesByCategory(category: string) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('title');

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data || []);
    } catch (error) {
      console.error('Error fetching courses by category:', error);
      throw error;
    }
  }

  async enrollInCourse(employeeId: string, courseId: string) {
    try {
      const { data, error } = await this.supabase
        .from('enrollments')
        .insert({
          employee_id: employeeId,
          course_id: courseId,
          status: 'ENROLLED'
        })
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data, 'Successfully enrolled in course');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  }

  async getEmployeeEnrollments(employeeId: string) {
    try {
      const { data, error } = await this.supabase
        .from('enrollments')
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

  async updateEnrollmentProgress(enrollmentId: string, progress: number) {
    try {
      const updates: Partial<Enrollment> = { progress };
      
      // If progress is 100%, mark as completed
      if (progress >= 100) {
        updates.status = 'COMPLETED';
        updates.completed_at = new Date().toISOString();
      } else if (progress > 0) {
        updates.status = 'IN_PROGRESS';
        if (!updates.started_at) {
          updates.started_at = new Date().toISOString();
        }
      }

      const { data, error } = await this.supabase
        .from('enrollments')
        .update(updates)
        .eq('id', enrollmentId)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data, 'Progress updated successfully');
    } catch (error) {
      console.error('Error updating enrollment progress:', error);
      throw error;
    }
  }

  async getCompletedCourses(employeeId: string) {
    try {
      const { data, error } = await this.supabase
        .from('enrollments')
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
}