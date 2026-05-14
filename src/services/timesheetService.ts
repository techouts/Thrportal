// Timesheet service with database integration

import { format, startOfWeek, addDays, subWeeks, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type {
  Timesheet,
  TimesheetEntry,
  TimesheetHistoryItem,
  NonBillableCategory,
  ProjectAssignment,
  ProjectTask,
  ClientExportProfile,
  TimesheetReportRow,
  ExportPreview,
  ExportRun,
  TimesheetTotals,
  TimesheetWarning,
  TimesheetPolicy,
  HistoryFilter,
  ExportFilters,
  DailyEntry,
} from "@/types/timesheet";
import NodeApiClient from "@/services/nodeApiClient";

// Mock data for categories and tasks (will be replaced with DB later)
const mockNonBillableCategories: NonBillableCategory[] = [
  { id: "training", name: "Training", isActive: true },
  { id: "presales", name: "Pre-sales", isActive: true },
  { id: "bench", name: "Bench", isActive: true },
  { id: "internal", name: "Internal Ops", isActive: true },
  { id: "admin", name: "Admin", isActive: true },
  { id: "meetings", name: "Meetings", isActive: true },
];

const mockProjects: ProjectAssignment[] = [
  {
    projectId: "p1",
    code: "PRJ001",
    name: "Project Alpha",
    client: "Client A",
    billable: true,
    allocStart: "2024-01-01",
    allocEnd: "2024-12-31",
  },
  {
    projectId: "p2",
    code: "PRJ002",
    name: "Project Beta",
    client: "Client B",
    billable: true,
    allocStart: "2024-06-01",
    allocEnd: "2024-12-31",
  },
  {
    projectId: "p3",
    code: "INT001",
    name: "Internal Project",
    client: "Internal",
    billable: false,
  },
];

const genericTasks: ProjectTask[] = [
  { taskId: "t1", code: "DEV", name: "Development", billable: true },
  { taskId: "t2", code: "TEST", name: "Testing", billable: true },
  { taskId: "t3", code: "DESIGN", name: "Design", billable: true },
  { taskId: "t4", code: "REQ", name: "Requirements", billable: true },
  { taskId: "t5", code: "DOC", name: "Documentation", billable: false },
  { taskId: "t6", code: "DEPLOY", name: "Deployment", billable: true },
  { taskId: "t7", code: "REVIEW", name: "Code Review", billable: true },
  { taskId: "t8", code: "MEET", name: "Meetings", billable: false },
  { taskId: "t9", code: "SUPPORT", name: "Support", billable: true },
  { taskId: "t10", code: "PLAN", name: "Planning", billable: true },
];

const mockExportProfiles: ClientExportProfile[] = [
  { id: "clientA", name: "Client A Format", format: "XLSX", isActive: true },
  { id: "clientB", name: "Client B Format", format: "CSV", isActive: true },
  { id: "generic", name: "Generic Export", format: "XLSX", isActive: true },
];

const mockPolicy: TimesheetPolicy = {
  maxPerDay: 24,
  maxPerWeek: 60,
  backdateWeeksLimit: 60,
  lockAfterApproval: true,
};

export class TimesheetService {
  private static instance: TimesheetService;

  static getInstance(): TimesheetService {
    if (!TimesheetService.instance) {
      TimesheetService.instance = new TimesheetService();
    }
    return TimesheetService.instance;
  }

  // Helper to create empty daily entries
  private createEmptyDailyEntries(): DailyEntry[] {
    return Array(7)
      .fill(null)
      .map(() => ({ hours: 0, comment: "" }));
  }

  // Fetch timesheet from database
  async getTimesheet(
    employeeId: string,
    weekStart: string
  ): Promise<Timesheet> {
    const weekEnd = format(addDays(parseISO(weekStart), 6), "yyyy-MM-dd");

    // Try to fetch existing timesheet
    // const { data: timesheetData, error: timesheetError } = await supabase
    //   .from('timesheets')
    //   .select('*')
    //   .eq('employee_id', employeeId)
    //   .eq('week_start', weekStart)
    //   .maybeSingle()
    const response = await NodeApiClient.get(
      `/timesheets-v2/by-employee-week`,
      {
        params: {
          employee_id: employeeId,
          week_start: weekStart,
        },
      }
    );

    const timesheetData = response.data;
    console.log("Timesheet Data:", timesheetData);
    // if (timesheetError) {
    //   console.error('Error fetching timesheet:', timesheetError)
    //   throw timesheetError
    // }

    // If no timesheet exists, return a new draft
    if (!Array.isArray(timesheetData) || timesheetData.length === 0) {
      return {
        id: "",
        employeeId,
        weekStart,
        weekEnd,
        status: "DRAFT",
        totalHours: 0,
        billableHours: 0,
        entries: [],
      };
    }

    // Fetch entries for the timesheet
    // const { data: entriesData, error: entriesError } = await supabase
    //   .from("timesheet_entries")
    //   .select("*")
    //   .eq("timesheet_id", timesheetData.id)
    //   .order("entry_date");

    // if (entriesError) {
    //   console.error("Error fetching entries:", entriesError);
    //   throw entriesError;
    // }
    const timesheet = timesheetData[0];
    const entriesResponse = await NodeApiClient.get(
      `/timesheets-v2/${timesheet.id}/entries`
    );
    const entriesData = entriesResponse.data;

    // Group entries by project+task to build TimesheetEntry rows
    const entryMap = new Map<string, TimesheetEntry>();

    for (const entry of entriesData || []) {
      const key = `${entry.project_id || "none"}-${entry.task_id || "none"}`;
      const entryDate = parseISO(entry.entry_date);
      const dayIndex = (entryDate.getDay() + 6) % 7; // Convert Sun=0 to Mon=0

      if (!entryMap.has(key)) {
        entryMap.set(key, {
          id: entry.id,
          rowId: `row-${entry.project_id}-${entry.task_id}`,
          projectId: entry.project_id || "",
          projectName: "", // Will be populated below
          taskId: entry.task_id || "",
          taskName: entry.task_name || "",
          billable: entry.is_billable ?? true,
          daily: this.createEmptyDailyEntries(),
        });
      }

      const timesheetEntry = entryMap.get(key)!;
      timesheetEntry.daily[dayIndex] = {
        hours: Number(entry.hours) || 0,
        comment: entry.comment || "",
      };
    }

    // Populate project names
    const entries = Array.from(entryMap.values());
    const projectIds = [
      ...new Set(entries.map((e) => e.projectId).filter(Boolean)),
    ];

    if (projectIds.length > 0) {
      // const { data: projectsData } = await supabase
      //   .from("crm_projects")
      //   .select("id, name")
      //   .in("id", projectIds);
      const { data: projectsData } = await NodeApiClient.get(
        "/employeeAllocations/projects",
        {
          params: {
            projectId: projectIds.join(","), // supports IN (...)
          },
        }
      );

      const projectMap = new Map(
        (projectsData || []).map((p) => [p.id, p.name])
      );

      for (const entry of entries) {
        entry.projectName =
          projectMap.get(entry.projectId) || "Unknown Project";
      }
    }

    return {
      id: timesheet.id,
      employeeId: timesheet.employee_id,
      weekStart: timesheet.week_start,
      weekEnd: timesheet.week_end,
      status: timesheet.status as Timesheet["status"],
      totalHours: Number(timesheet.total_hours) || 0,
      billableHours: Number(timesheet.billable_hours) || 0,
      submittedAt: timesheet.submitted_at || undefined,
      approvedAt: timesheet.approved_at || undefined,
      rejectedAt: timesheet.rejected_at || undefined,
      approverComment: timesheet.approver_comment || undefined,
      submissionComment: timesheet.submission_comment || undefined,
      entries,
    };
  }

  // Save timesheet to database
  async saveTimesheet(
    employeeId: string,
    weekStart: string,
    entries: TimesheetEntry[],
    status: "SAVED" | "SUBMITTED",
    submissionComment?: string
  ): Promise<{ ok: boolean; timesheet: Timesheet }> {
    const weekEnd = format(addDays(parseISO(weekStart), 6), "yyyy-MM-dd");

    // Calculate totals
    let totalHours = 0;
    let billableHours = 0;

    for (const entry of entries) {
      const entryTotal = entry.daily.reduce((sum, d) => sum + d.hours, 0);
      totalHours += entryTotal;
      if (entry.billable) {
        billableHours += entryTotal;
      }
    }

    // Upsert timesheet
    // const { data: timesheetData, error: timesheetError } = await supabase
    //   .from("timesheets")
    //   .upsert(
    //     {
    //       employee_id: employeeId,
    //       week_start: weekStart,
    //       week_end: weekEnd,
    //       status,
    //       total_hours: totalHours,
    //       billable_hours: billableHours,
    //       submission_comment: submissionComment || null,
    //       submitted_at:
    //         status === "SUBMITTED" ? new Date().toISOString() : null,
    //     },
    //     {
    //       onConflict: "employee_id,week_start",
    //     }
    //   )
    //   .select()
    //   .single();

    // if (timesheetError) {
    //   console.error("Error saving timesheet:", timesheetError);
    //   throw timesheetError;
    // }

    // const timesheetId = timesheetData.id;
    const response = await NodeApiClient.post("/timesheets-v2", {
      employee_id: employeeId,
      week_start: weekStart,
      week_end: weekEnd,
      status,
      total_hours: totalHours,
      billable_hours: billableHours,
      submission_comment: submissionComment || null,
      submitted_at: status === "SUBMITTED" ? new Date().toISOString() : null,
    });

    const timesheetData = response.data;
    const timesheetId = timesheetData.id;

    // Delete existing entries and insert new ones
    // await supabase
    //   .from("timesheet_entries")
    //   .delete()
    //   .eq("timesheet_id", timesheetId);
    await NodeApiClient.delete(`/timesheets-v2/deleteTimesheet/${timesheetId}`);

    // Prepare entries for insert
    const entriesToInsert: any[] = [];

    for (const entry of entries) {
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dailyEntry = entry.daily[dayIndex];
        if (dailyEntry.hours > 0 || dailyEntry.comment) {
          const entryDate = format(
            addDays(parseISO(weekStart), dayIndex),
            "yyyy-MM-dd"
          );

          entriesToInsert.push({
            timesheet_id: timesheetId,
            project_id: entry.projectId || null,
            task_id: entry.taskId,
            task_name: entry.taskName,
            entry_date: entryDate,
            hours: dailyEntry.hours,
            comment: dailyEntry.comment || null,
            is_billable: entry.billable,
          });
        }
      }
    }

    if (entriesToInsert.length > 0) {
      // const { error: entriesError } = await supabase
      //   .from("timesheet_entries")
      //   .insert(entriesToInsert);

      // if (entriesError) {
      //   console.error("Error saving entries:", entriesError);
      //   throw entriesError;
      // }
      await NodeApiClient.post("/timesheets-v2/entries/bulk", entriesToInsert);
    }

    return {
      ok: true,
      timesheet: {
        id: timesheetId,
        employeeId,
        weekStart,
        weekEnd,
        status,
        totalHours,
        billableHours,
        submissionComment,
        submittedAt:
          status === "SUBMITTED" ? new Date().toISOString() : undefined,
        entries,
      },
    };
  }

  async recallTimesheet(timesheetId: string): Promise<{ ok: boolean }> {
    // const { error } = await supabase
    //   .from("timesheets")
    //   .update({
    //     status: "SAVED",
    //     submitted_at: null,
    //   })
    //   .eq("id", timesheetId)
    //   .eq("status", "SUBMITTED");

    // if (error) {
    //   console.error("Error recalling timesheet:", error);
    //   throw error;
    // }

    // return { ok: true };
    try {
      await NodeApiClient.patch(
        "/timesheets-v2/recall",
        {
          status: "SAVED",
          submitted_at: null,
        },
        {
          params: {
            id: timesheetId,
            status: "SUBMITTED",
          },
        }
      );

      return { ok: true };
    } catch (error) {
      console.error("Error recalling timesheet:", error);
      throw error;
    }
  }

  async getHistory(
    employeeId: string,
    filter: HistoryFilter
  ): Promise<TimesheetHistoryItem[]> {
    let query = supabase
      .from("timesheets")
      .select("*")
      .eq("employee_id", employeeId)
      .order("week_start", { ascending: false })
      .limit(20);

    if (filter.status && filter.status !== "All") {
      query = query.eq("status", filter.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching history:", error);
      // Return mock data as fallback
      return this.getMockHistory(filter);
    }

    return (data || []).map((ts) => ({
      weekStart: ts.week_start,
      status: ts.status,
      totalHours: Number(ts.total_hours) || 0,
      billablePercentage:
        ts.total_hours > 0
          ? (Number(ts.billable_hours) / Number(ts.total_hours)) * 100
          : 0,
      flags: [],
      submittedAt: ts.submitted_at || undefined,
      approvedAt: ts.approved_at || undefined,
    }));
  }

  private getMockHistory(filter: HistoryFilter): TimesheetHistoryItem[] {
    const now = new Date();
    const items: TimesheetHistoryItem[] = [];

    for (let i = 0; i < 12; i++) {
      const weekStart = format(
        startOfWeek(subWeeks(now, i), { weekStartsOn: 1 }),
        "yyyy-MM-dd"
      );
      const status = i === 0 ? "DRAFT" : i === 1 ? "SUBMITTED" : "APPROVED";

      if (filter.status && filter.status !== "All" && status !== filter.status)
        continue;

      items.push({
        weekStart,
        status,
        totalHours: 40 + Math.random() * 8,
        billablePercentage: 80 + Math.random() * 15,
        flags: [],
        submittedAt: i > 0 ? subWeeks(now, i - 0.5).toISOString() : undefined,
        approvedAt: i > 1 ? subWeeks(now, i - 1).toISOString() : undefined,
      });
    }

    return items;
  }

  async getNonBillableCategories(): Promise<NonBillableCategory[]> {
    return mockNonBillableCategories;
  }

  async getAssignedProjects(employeeId: string, weekStart?: string): Promise<ProjectAssignment[]> {
    try {
      // const today = format(new Date(), "yyyy-MM-dd");
      const filterStart = weekStart || format(new Date(), 'yyyy-MM-dd')
      const filterEnd = weekStart 
        ? format(addDays(parseISO(weekStart), 6), 'yyyy-MM-dd')
        : filterStart

      // Get project IDs from both allocations and contract_assignments
      // const [allocationsResult, contractsResult] = await Promise.all([
      //   // supabase
      //   //   .from("allocations")
      //   //   .select("project_id")
      //   //   .eq("employee_id", employeeId)
      //   //   .in("type", ["ACTIVE", "SHADOW"])
      //   //   .lte("start_date", today)
      //   //   .or(`end_date.is.null,end_date.gte.${today}`),
      //   NodeApiClient.get("/allocations/projects/by-employee", {
      //     params: {
      //       employee_id: employeeId,
      //       types: "ACTIVE,SHADOW",
      //       end_date_gte: filterEnd,
      //       start_date: filterStart,
      //     },
      //   }),

      //   //   supabase
      //   //     .from("contract_assignments")
      //   //     .select("project_id")
      //   //     .eq("employee_id", employeeId)
      //   //     .lte("start_date", today)
      //   //     .or(`end_date.is.null,end_date.gte.${today}`),
      //   // ]);
      //   NodeApiClient.get("/tasks/contract/assignments", {
      //     params: {
      //       employee_id: employeeId,
      //       start_date: filterStart, // backend applies lte(start_date) + end_date null/gte
      //     },
      //   }),
      // ]);

      // const projectIds = [
      //   ...new Set([
      //     ...(allocationsResult.data || []).map((a) => a.project_id),
      //     ...(contractsResult.data || []).map((c) => c.project_id),
      //   ]),
      // ].filter(Boolean) as string[];

      // if (projectIds.length === 0) {
      //   console.log("No project allocations found for employee:", employeeId);
      //   return [];
      // }

      // Fetch project details for allocated projects
      // const { data, error } = await supabase
      //   .from("crm_projects")
      //   .select(
      //     `
      //     id,
      //     name,
      //     start_date,
      //     end_date,
      //     client:crm_clients(name)
      //   `
      //   )
      //   .in("id", projectIds)
      //   .in("status", ["Planned", "Active", "In-flight"])
      //   .order("name");

      // if (error) {
      //   console.error("Error fetching projects:", error);
      //   return [];
      // }
      // const { data } = await NodeApiClient.get(
      //   "/employeeAllocations/projects",
      //   {
      //     params: {
      //       projectId: projectIds.join(","), // IN (...)
      //       // status: "Planned,Active,In-flight",
      //     },
      //   }
      // );

       const { data } = await NodeApiClient.get(
        "crm/projects/projects-list"
      );

      return (data || []).map((project) => ({
        projectId: project.id,
        code: project.id.slice(0, 8).toUpperCase(),
        name: project.name,
        client: (project.client as any)?.name || "Unknown",
        billable: true,
        allocStart: project.start_date || undefined,
        allocEnd: project.end_date || undefined,
      }));
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  }

  async getAssignedTasks(
    employeeId: string,
    projectId: string
  ): Promise<ProjectTask[]> {
    try {
      // const { data, error } = await supabase
      //   .from("tasks")
      //   .select("id, name, billable")
      //   .eq("project_id", projectId)
      //   .in("status", ["not_started", "in_progress"])
      //   .order("name");

      // if (error) {
      //   console.error("Error fetching tasks:", error);
      //   return [];
      // }
      const response = await NodeApiClient.get("/tasks", {
        params: {
          project_id: projectId,
          status: "not_started,in_progress", // matches .in(...)
        },
      });

      const data = response.data;

      if (!data || data.length === 0) {
        // No tasks for this project
        return [];
      }

      return data.map((task) => ({
        taskId: task.id,
        code: task.id.slice(0, 6).toUpperCase(),
        name: task.name,
        billable: task.billable ?? true,
      }));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  }

  async getActiveExportProfiles(): Promise<ClientExportProfile[]> {
    return mockExportProfiles;
  }

  async previewExport(
    profileId: string,
    periodStart: string,
    periodEnd: string,
    filters?: ExportFilters
  ): Promise<ExportPreview> {
    return {
      headers: ["Date", "Project", "Task", "Hours", "Billable", "Description"],
      rows: [
        [
          "2024-01-01",
          "Project Alpha",
          "Development",
          "8.0",
          "Yes",
          "Feature implementation",
        ],
        [
          "2024-01-02",
          "Project Alpha",
          "Testing",
          "6.5",
          "Yes",
          "Unit testing",
        ],
        [
          "2024-01-03",
          "Internal Project",
          "Training",
          "2.0",
          "No",
          "Team training session",
        ],
      ],
      warnings: filters?.billableOnly
        ? ["Non-billable entries excluded"]
        : undefined,
    };
  }

  async runExport(
    profileId: string,
    periodStart: string,
    periodEnd: string,
    filters?: ExportFilters
  ): Promise<{ fileRef: string; rows: number }> {
    const fileRef = `export-${profileId}-${Date.now()}.xlsx`;
    return { fileRef, rows: 15 };
  }

  async getExportLogs(
    employeeId: string,
    limit: number = 20
  ): Promise<ExportRun[]> {
    const now = new Date();
    return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      id: `run-${i}`,
      at: subWeeks(now, i * 2).toISOString(),
      profileName: mockExportProfiles[i % mockExportProfiles.length].name,
      rows: 15 + i * 3,
      fileRef: `export-${i}-${Date.now()}.xlsx`,
    }));
  }

  getPolicy(): TimesheetPolicy {
    return mockPolicy;
  }

  validateWeekEntries(
    entries: TimesheetEntry[],
    policy: TimesheetPolicy
  ): TimesheetWarning[] {
    const warnings: TimesheetWarning[] = [];

    entries.forEach((entry) => {
      entry.daily.forEach((dailyEntry, dayIndex) => {
        if (dailyEntry.hours > policy.maxPerDay) {
          warnings.push({
            rowId: entry.rowId,
            dayIndex,
            type: "CAP_DAY",
            message: `Exceeds daily limit of ${policy.maxPerDay} hours`,
          });
        }
      });

      const weekTotal = entry.daily.reduce((sum, d) => sum + d.hours, 0);
      if (weekTotal > policy.maxPerWeek) {
        warnings.push({
          rowId: entry.rowId,
          type: "CAP_WEEK",
          message: `Exceeds weekly limit of ${policy.maxPerWeek} hours`,
        });
      }
    });

    return warnings;
  }

  // Validate that all entries with hours have comments (for submission)
  validateCommentsForSubmit(entries: TimesheetEntry[]): {
    valid: boolean;
    missingComments: { rowId: string; dayIndex: number }[];
  } {
    const missingComments: { rowId: string; dayIndex: number }[] = [];

    for (const entry of entries) {
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const daily = entry.daily[dayIndex];
        if (daily.hours > 0 && !daily.comment.trim()) {
          missingComments.push({ rowId: entry.rowId, dayIndex });
        }
      }
    }

    return {
      valid: missingComments.length === 0,
      missingComments,
    };
  }

  // Delete a specific row (project+task combination) from a timesheet
  async deleteTimesheetRow(
    timesheetId: string,
    projectId: string,
    taskId: string
  ): Promise<void> {
    // const { error } = await supabase
    //   .from("timesheet_entries")
    //   .delete()
    //   .eq("timesheet_id", timesheetId)
    //   .eq("project_id", projectId)
    //   .eq("task_id", taskId);

    // if (error) {
    //   console.error("Error deleting timesheet row:", error);
    //   throw error;
    // }
    try {
      await NodeApiClient.delete("/timesheets-v2/timesheet/entries", {
        params: {
          timesheet_id: timesheetId,
          project_id: projectId,
          task_id: taskId,
        },
      });
    } catch (error) {
      console.error("Error deleting timesheet row:", error);
      throw error;
    }
  }

  // Get the status of a timesheet for a specific week
  async getTimesheetStatus(
    employeeId: string,
    weekStart: string
  ): Promise<string | null> {
    // const { data, error } = await supabase
    //   .from("timesheets")
    //   .select("status")
    //   .eq("employee_id", employeeId)
    //   .eq("week_start", weekStart)
    //   .maybeSingle();

    // if (error) {
    //   console.error("Error fetching timesheet status:", error);
    //   return null;
    // }

    // return data?.status || null;
    try {
      const response = await NodeApiClient.get("/timesheets-v2/status", {
        params: {
          employee_id: employeeId,
          week_start: weekStart,
        },
      });

      return response.data[0].status || null;
    } catch (err: any) {
      console.error("Error fetching timesheet status:", err);
      return null;
    }
  }

  // Get incomplete weeks (DRAFT, REJECTED, or no record) for History tab
  async getIncompleteWeeks(
    employeeId: string,
    backdateLimit: number = 6
  ): Promise<{ weekStart: string; status: string | null }[]> {
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const incompleteWeeks: { weekStart: string; status: string | null }[] = [];

    // Generate all weeks within backdate limit (excluding current week)
    const allWeeks: string[] = [];
    for (let i = 1; i <= backdateLimit; i++) {
      const weekStart = format(subWeeks(currentWeekStart, i), "yyyy-MM-dd");
      allWeeks.push(weekStart);
    }

    if (allWeeks.length === 0) {
      return [];
    }

    // Fetch existing timesheets for these weeks
    // const { data: existingTimesheets, error } = await supabase
    //   .from("timesheets")
    //   .select("week_start, status")
    //   .eq("employee_id", employeeId)
    //   .in("week_start", allWeeks);

    // if (error) {
    //   console.error("Error fetching timesheets for incomplete weeks:", error);
    //   // Return all weeks as incomplete if query fails
    //   return allWeeks.map((weekStart) => ({ weekStart, status: null }));
    // }
    const { data: existingTimesheets } = await NodeApiClient.get(
      "/timesheets-v2/statuses",
      {
        params: {
          employee_id: employeeId,
          week_start: allWeeks.join(","), // <-- matches curl
        },
      }
    );
    // Create a map of existing timesheets
    const timesheetMap = new Map(
      (existingTimesheets || []).map((ts) => [ts.week_start, ts.status])
    );

    // Filter to only incomplete weeks (no record, DRAFT, or REJECTED)
    for (const weekStart of allWeeks) {
      const status = timesheetMap.get(weekStart) || null;

      // Include if: no record, DRAFT, or REJECTED
      if (!status || status === "DRAFT" || status === "REJECTED") {
        incompleteWeeks.push({ weekStart, status });
      }
    }

    return incompleteWeeks;
  }
  // Get timesheet report data for a project within a date range
  async getProjectTimesheetReport(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<TimesheetReportRow[]> {
    // Fetch timesheet entries for the project within the date range
    // const { data: entriesData, error: entriesError } = await supabase
    //   .from("timesheet_entries")
    //   .select(
    //     `
    //     entry_date,
    //     task_name,
    //     hours,
    //     comment,
    //     is_billable,
    //     timesheet_id,
    //     project_id
    //   `
    //   )
    //   .eq("project_id", projectId)
    //   .gte("entry_date", startDate)
    //   .lte("entry_date", endDate)
    //   .order("entry_date");
    const { data: entriesData } = await NodeApiClient.get(
      "/timesheets-v2/entries/by-project",
      {
        params: {
          project_id: projectId,
          from: startDate, // e.g. "2025-12-10"
          to: endDate, // e.g. "2026-01-31"
        },
      }
    );

    // if (entriesError) {
    //   console.error("Error fetching timesheet entries:", entriesError);
    //   throw entriesError;
    // }

    if (!entriesData || entriesData.length === 0) {
      return [];
    }

    // Get unique timesheet IDs to fetch timesheet details
    const timesheetIds = [...new Set(entriesData.map((e) => e.timesheet_id))];

    // Fetch timesheets with employee info
    // const { data: timesheetsData, error: timesheetsError } = await supabase
    //   .from("timesheets")
    //   .select(
    //     `
    //     id,
    //     status,
    //     employee_id
    //   `
    //   )
    //   .in("id", timesheetIds)
    //   .in("status", ["SAVED", "SUBMITTED", "APPROVED"]);
    const { data: timesheetsData } = await NodeApiClient.get(
      "/timesheets-v2/timesheets/status-check",
      {
        params: {
          id: timesheetIds.join(","), // <-- matches curl
          status: ["SAVED", "SUBMITTED", "APPROVED"].join(","),
        },
      }
    );

    // if (timesheetsError) {
    //   console.error("Error fetching timesheets:", timesheetsError);
    //   throw timesheetsError;
    // }

    // Get employee IDs to fetch profile info
    const employeeIds = [
      ...new Set((timesheetsData || []).map((t) => t.employee_id)),
    ];

    // Fetch profiles
    // const { data: profilesData, error: profilesError } = await supabase
    //   .from("profiles")
    //   .select("id, display_name, first_name, last_name, employee_code")
    //   .in("id", employeeIds);
    const { data: profilesData } = await NodeApiClient.get("/auth/by-ids", {
      params: {
        ids: employeeIds.join(","), // <-- same as curl
      },
    });

    // if (profilesError) {
    //   console.error("Error fetching profiles:", profilesError);
    //   throw profilesError;
    // }

    // Fetch project name
    // const { data: projectData } = await supabase
    //   .from("crm_projects")
    //   .select("name")
    //   .eq("id", projectId)
    //   .single();
    const { data: projectData } = await NodeApiClient.get("/crm/projects", {
      params: {
        projectId: projectId,
      },
    });

    const projectName = projectData?.name || "Unknown Project";

    // Create lookup maps
    const timesheetMap = new Map((timesheetsData || []).map((t) => [t.id, t]));
    const profileMap = new Map((profilesData || []).map((p) => [p.id, p]));

    // Build report rows
    const reportRows: TimesheetReportRow[] = [];

    for (const entry of entriesData) {
      const timesheet = timesheetMap.get(entry.timesheet_id);
      if (!timesheet) continue; // Skip entries without valid timesheet (e.g., DRAFT status)

      const profile = profileMap.get(timesheet?.employee_id);
      if (!profile) continue;

      const employeeName =
        profile.display_name ||
        `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
        "Unknown";

      reportRows.push({
        employeeName,
        employeeCode: profile.employee_code,
        date: entry.entry_date,
        projectName,
        taskName: entry.task_name || "",
        hours: Number(entry.hours) || 0,
        comment: entry.comment,
        isBillable: entry.is_billable ?? true,
        status: timesheet.status,
      });
    }

    // Sort by date, then by employee name
    reportRows.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.employeeName.localeCompare(b.employeeName);
    });

    return reportRows;
  }
}
