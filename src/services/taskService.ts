import { supabase } from '@/integrations/supabase/client'

export interface TaskItem {
  id: string
  name: string
  description: string | null
  estHours: number
  actualHours: number | null
  billable: boolean
}

export const taskService = {
  async getTasksByProject(projectId: string): Promise<TaskItem[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, name, description, est_hours, actual_hours, billable')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }

    return (data || []).map(task => ({
      id: task.id,
      name: task.name,
      description: task.description,
      estHours: Number(task.est_hours) || 0,
      actualHours: task.actual_hours ? Number(task.actual_hours) : null,
      billable: task.billable ?? false
    }))
  }
}
