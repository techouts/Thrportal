import { supabase } from "@/integrations/supabase/client";
import NodeApiClient from "@/services/nodeApiClient";

export interface TaskItem {
  id: string;
  name: string;
  description: string | null;
  estHours: number;
  actualHours: number | null;
  billable: boolean;
}

export interface CreateTaskInput {
  projectId: string;
  name: string;
  description?: string | null;
  estHours: number;
  actualHours: number | null;
  billable: boolean;
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
}

export const taskService = {
  async getTasksByProject(projectId: string): Promise<TaskItem[]> {
    // const { data, error } = await supabase
    //   .from('tasks')
    //   .select('id, name, description, est_hours, actual_hours, billable')
    //   .eq('project_id', projectId)
    //   .order('created_at', { ascending: false })

    // if (error) {
    //   console.error('Error fetching tasks:', error)
    //   throw error
    // }
    const { data } = await NodeApiClient.get("/tasks", {
      params: {
        project_id: projectId,
        full: true,
      },
    });

    return (data || []).map((task) => ({
      id: task.id,
      name: task.name,
      description: task.description,
      estHours: Number(task.est_hours) || 0,
      actualHours: task.actual_hours ? Number(task.actual_hours) : null,
      billable: task.billable ?? false,
    }));
  },

  async createTask(input: CreateTaskInput): Promise<TaskItem> {
    // const { data, error } = await supabase
    //   .from("tasks")
    //   .insert({
    //     project_id: input.projectId,
    //     name: input.name,
    //     description: input.description || null,
    //     est_hours: input.estHours,
    //     actual_hours: input.actualHours,
    //     billable: input.billable,
    //     start_date: input.startDate || new Date().toISOString().split("T")[0],
    //     end_date: input.endDate || null,
    //     status: input.status || "not_started",
    //   })
    //   .select("id, name, description, est_hours, actual_hours, billable")
    //   .single();

    // if (error) {
    //   console.error("Error creating task:", error);
    //   throw error;
    // }
    const { data } = await NodeApiClient.post("/tasks", {
      project_id: input.projectId,
      name: input.name,
      description: input.description ?? null,
      est_hours: input.estHours,
      actual_hours: input.actualHours,
      billable: input.billable,
      start_date: input.startDate ?? new Date().toISOString().split("T")[0],
      end_date: input.endDate ?? null,
      status: input.status ?? "not_started",
    });

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      estHours: Number(data.est_hours) || 0,
      actualHours: data.actual_hours ? Number(data.actual_hours) : null,
      billable: data.billable ?? false,
    };
  },

  async createTasksBulk(tasks: CreateTaskInput[]): Promise<TaskItem[]> {
    const tasksToInsert = tasks.map((input) => ({
      project_id: input.projectId,
      name: input.name,
      description: input.description || null,
      est_hours: input.estHours,
      actual_hours: input.actualHours,
      billable: input.billable,
      start_date: input.startDate || new Date().toISOString().split("T")[0],
      end_date: input.endDate || null,
      status: input.status || "not_started",
    }));

    // const { data, error } = await supabase
    //   .from("tasks")
    //   .insert(tasksToInsert)
    //   .select("id, name, description, est_hours, actual_hours, billable");

    // if (error) {
    //   console.error("Error creating tasks in bulk:", error);
    //   throw error;
    // }
    const { data } = await NodeApiClient.post("/tasks/bulk", tasksToInsert);
    return (data || []).map((task) => ({
      id: task.id,
      name: task.name,
      description: task.description,
      estHours: Number(task.est_hours) || 0,
      actualHours: task.actual_hours ? Number(task.actual_hours) : null,
      billable: task.billable ?? false,
    }));
  },
};
