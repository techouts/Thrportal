import { supabase } from '@/integrations/supabase/client'

export interface TaskItem {
  id: string
  name: string
  description: string | null
  estHours: number
  actualHours: number | null
  billable: boolean
}

export interface CreateTaskInput {
  projectId: string
  name: string
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
  },

  async createTask(input: CreateTaskInput): Promise<TaskItem> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        project_id: input.projectId,
        name: input.name,
        est_hours: input.estHours,
        actual_hours: input.actualHours,
        billable: input.billable,
        start_date: new Date().toISOString().split('T')[0],
        status: 'not_started'
      })
      .select('id, name, description, est_hours, actual_hours, billable')
      .single()

    if (error) {
      console.error('Error creating task:', error)
      throw error
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      estHours: Number(data.est_hours) || 0,
      actualHours: data.actual_hours ? Number(data.actual_hours) : null,
      billable: data.billable ?? false
    }
  }
}
