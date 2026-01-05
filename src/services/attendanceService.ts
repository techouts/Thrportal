import {
  AttendanceRecord,
  AttendanceStats,
  ClockInRequest,
  AttendanceApproval,
  AttendancePolicy,
  ApiResponse,
  AttendanceStatsFilter,
  AttendanceLogsFilter,
} from "@/types/attendance";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  differenceInMinutes,
  startOfDay,
  subDays,
  getDay,
  addDays,
} from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import NodeApiClient from "@/services/nodeApiClient";

const TIMEZONE = "Asia/Kolkata";

class AttendanceService {
  private policies: AttendancePolicy[] = [];

  constructor() {
    this.loadPolicies();
  }

  private loadPolicies() {
    // Mock policies - in production, these would come from database
    this.policies = [
      {
        id: "pol-001",
        name: "Standard Office Policy",
        officeStartTime: "09:00",
        officeEndTime: "17:30",
        lateGracePeriod: 15,
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        minimumHours: 8,
        isActive: true,
        geofenceEnabled: true,
        geofenceRadius: 200,
        officeLocation: {
          lat: 12.9716,
          lng: 77.5946,
          address: "Bangalore Office, India",
        },
      },
    ];
  }

  async getEmployeeAttendance(
    employeeId: string,
    filterType: AttendanceLogsFilter = "30_days"
  ): Promise<ApiResponse<AttendanceRecord[]>> {
    try {
      let startDate: Date;
      let endDate = new Date();

      if (filterType === "30_days") {
        startDate = subDays(endDate, 30);
      } else {
        // filterType is a month like '2024-11'
        const [year, month] = filterType.split("-").map(Number);
        startDate = new Date(year, month - 1, 1);
        endDate = endOfMonth(startDate);
      }

      const startDateStr = format(startDate, "yyyy-MM-dd");
      const endDateStr = format(endDate, "yyyy-MM-dd");

      // Fetch attendance records, leave requests, employee profile, and holidays in parallel
      const [attendanceResult, leaveResult, profileResult, holidaysResult] =
        await Promise.all([
          // supabase
          //   .from("attendance_records")
          //   .select("*")
          //   .eq("employee_id", employeeId)
          //   .gte("date", startDateStr)
          //   .lte("date", endDateStr)
          //   .order("date", { ascending: false }),
          NodeApiClient.get("/attendance", {
            params: {
              employee_id: employeeId,
              from: startDateStr,
              to: endDateStr,
            },
          }),
          // supabase
          //   .from("leave_requests")
          //   .select("start_date, end_date, leave_type")
          //   .eq("employee_id", employeeId)
          //   .eq("status", "approved")
          //   .lte("start_date", endDateStr)
          //   .gte("end_date", startDateStr),
          NodeApiClient.get("/leaves/all", {
            params: {
              employee_id: employeeId,
              status: "approved",
              start_date: startDateStr,
              end_date: endDateStr,
            },
          }),
          // supabase
          //   .from("profiles")
          //   .select("employee_type")
          //   .eq("id", employeeId)
          //   .single(),
          NodeApiClient.get(`/auth/employee-type/${employeeId}`),
          // supabase
          //   .from("holidays")
          //   .select("date, name")
          //   .gte("date", startDateStr)
          //   .lte("date", endDateStr),
          NodeApiClient.get("/holidays/filter", {
            params: {
              from_date: startDateStr, // e.g. "2025-12-01"
              to_date: endDateStr, // e.g. "2025-12-31"
            },
          }),
        ]);

      if (attendanceResult.data.error) throw attendanceResult.data.error;

      const employeeType = profileResult.data?.employee_type;

      // Build a set of dates that have approved leave
      const approvedLeaveDates = new Set<string>();
      (leaveResult.data || []).forEach((leave) => {
        const leaveStart = new Date(leave.start_date);
        const leaveEnd = new Date(leave.end_date);
        for (
          let d = new Date(leaveStart);
          d <= leaveEnd;
          d.setDate(d.getDate() + 1)
        ) {
          approvedLeaveDates.add(format(d, "yyyy-MM-dd"));
        }
      });

      // Build a map of holiday dates
      const holidayDates = new Map<string, string>();
      (holidaysResult.data || []).forEach((holiday) => {
        holidayDates.set(holiday.date, holiday.name);
      });

      // Create a map of existing records by date
      const recordsByDate = new Map<string, any>();
      (attendanceResult.data || []).forEach((record) => {
        recordsByDate.set(record.date, record);
      });

      // Generate all dates in range and fill missing weekdays
      const allRecords: AttendanceRecord[] = [];
      const today = startOfDay(new Date());
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        const existingRecord = recordsByDate.get(dateStr);
        const dayOfWeek = getDay(currentDate);
        const isSaturday = dayOfWeek === 6;
        const isSunday = dayOfWeek === 0;

        // Determine if this day is a week-off based on employee type
        let isWeekOff = false;
        if (employeeType === "FTE" || employeeType === "FTDE") {
          isWeekOff = isSaturday || isSunday; // Both Sat and Sun off
        } else if (employeeType === "Intern") {
          isWeekOff = isSunday; // Only Sunday off
        } else {
          isWeekOff = isSaturday || isSunday; // Default: both off
        }

        if (existingRecord) {
          // Check if this date is a holiday
          const holidayName = holidayDates.get(dateStr);

          // Use existing record from database, but override status if it's a holiday
          allRecords.push({
            id: existingRecord.id,
            employeeId: existingRecord.employee_id,
            date: existingRecord.date,
            checkIn: existingRecord.check_in || undefined,
            checkOut: existingRecord.check_out || undefined,
            breakTime: existingRecord.break_time || 0,
            totalHours: Number(existingRecord.total_hours) || 0,
            // Override status to 'holiday' if it's a holiday, otherwise use the record's status
            status: holidayName
              ? "holiday"
              : (existingRecord.status as AttendanceRecord["status"]),
            location: existingRecord.location as AttendanceRecord["location"],
            coordinates: existingRecord.coordinates as any,
            // If it's a holiday, include the holiday name in notes
            notes: holidayName || existingRecord.notes || undefined,
            approvedBy: existingRecord.approved_by || undefined,
            createdAt: existingRecord.created_at,
            updatedAt: existingRecord.updated_at,
          });
        } else if (holidayDates.has(dateStr)) {
          // Add holiday record
          allRecords.push({
            id: `holiday-${dateStr}`,
            employeeId,
            date: dateStr,
            checkIn: undefined,
            checkOut: undefined,
            breakTime: 0,
            totalHours: 0,
            status: "holiday",
            location: "Office",
            notes: holidayDates.get(dateStr),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else if (isWeekOff) {
          // Add week-off record for weekends based on employee type
          allRecords.push({
            id: `week-off-${dateStr}`,
            employeeId,
            date: dateStr,
            checkIn: undefined,
            checkOut: undefined,
            breakTime: 0,
            totalHours: 0,
            status: "week_off",
            location: "Office",
            notes: "Full day Weekly-off",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else if (currentDate < today) {
          // Only add records for past dates (not today or future)
          // Check if this date has an approved leave
          const status = approvedLeaveDates.has(dateStr)
            ? "on_leave"
            : "absent";
          allRecords.push({
            id: `${status}-${dateStr}`,
            employeeId,
            date: dateStr,
            checkIn: undefined,
            checkOut: undefined,
            breakTime: 0,
            totalHours: 0,
            status,
            location: "Office",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        currentDate = addDays(currentDate, 1);
      }

      // Sort by date descending
      allRecords.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      return {
        data: allRecords,
        message: "Attendance records retrieved successfully",
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to retrieve attendance records:", error);
      return {
        data: [],
        message: "Failed to retrieve attendance records",
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getEmployeeStats(
    employeeId: string,
    monthsBack: AttendanceStatsFilter = "1month"
  ): Promise<ApiResponse<AttendanceStats>> {
    try {
      const endDate = new Date();
      const startDate =
        monthsBack === "1month"
          ? startOfMonth(endDate)
          : startOfMonth(subMonths(endDate, 2));

      // const { data, error } = await supabase
      //   .from("attendance_records")
      //   .select("*")
      //   .eq("employee_id", employeeId)
      //   .gte("date", format(startDate, "yyyy-MM-dd"))
      //   .lte("date", format(endDate, "yyyy-MM-dd"))
      //   .order("date", { ascending: false });

      // if (error) throw error;
      const response = await NodeApiClient.get("/attendance", {
        params: {
          employee_id: employeeId,
          from: format(startDate, "yyyy-MM-dd"),
          to: format(endDate, "yyyy-MM-dd"),
        },
      });

      const data = response.data;
      if (!Array.isArray(data)) {
        throw new Error("Invalid attendance response");
      }

      const records = data || [];
      // Count as present if:
      // 1. Employee has both clock-in AND clock-out, OR
      // 2. Status is 'present' (includes regularized records approved by manager)
      const presentDays = records.filter(
        (r) => (r.check_in && r.check_out) || r.status === "present"
      ).length;
      const absentDays = records.filter((r) => r.status === "absent").length;
      const lateDays = records.filter((r) => r.status === "late").length;
      const totalHours = records.reduce(
        (sum, r) => sum + Number(r.total_hours || 0),
        0
      );

      const stats: AttendanceStats = {
        presentDays,
        absentDays,
        lateDays,
        totalWorkingDays: monthsBack === "1month" ? 22 : 66, // Approximate working days
        averageHours: records.length > 0 ? totalHours / records.length : 0,
        currentStreak: this.calculateCurrentStreak(
          records.map((r) => ({
            id: r.id,
            employeeId: r.employee_id,
            date: r.date,
            checkIn: r.check_in,
            checkOut: r.check_out,
            breakTime: r.break_time || 0,
            totalHours: Number(r.total_hours) || 0,
            status: r.status as AttendanceRecord["status"],
            location: r.location as AttendanceRecord["location"],
            coordinates: r.coordinates as any,
            notes: r.notes,
            approvedBy: r.approved_by,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }))
        ),
        monthlyStats: [
          {
            month: format(startDate, "yyyy-MM"),
            present: presentDays,
            absent: absentDays,
            late: lateDays,
            totalHours,
          },
        ],
      };

      return {
        data: stats,
        message: "Attendance stats retrieved successfully",
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to retrieve attendance stats:", error);
      return {
        data: {} as AttendanceStats,
        message: "Failed to retrieve attendance stats",
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async clockIn(
    request: ClockInRequest
  ): Promise<ApiResponse<AttendanceRecord>> {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const now = new Date();
      const checkInTime = format(now, "HH:mm:ss");

      // Check if already clocked in today
      // const { data: existing } = await supabase
      //   .from("attendance_records")
      //   .select("*")
      //   .eq("employee_id", request.employeeId)
      //   .eq("date", today)
      //   .maybeSingle();

      // if (existing?.check_in) {
      //   throw new Error("Already clocked in today");
      // }
      const response = await NodeApiClient.get("/attendance/check-in/status", {
        params: {
          employee_id: request.employeeId,
          date: today,
        },
      });

      if (response?.data?.check_in) {
        throw new Error("Already clocked in today");
      }

      const status = this.determineStatus(now);

      const recordData = {
        employee_id: request.employeeId,
        date: today,
        check_in: checkInTime,
        break_time: 0,
        total_hours: 0,
        status,
        location: request.location,
        coordinates: request.coordinates || null,
        notes: request.notes || null,
      };

      // const { data, error } = await supabase
      //   .from("attendance_records")
      //   .upsert(recordData, { onConflict: "employee_id,date" })
      //   .select()
      //   .single();

      // if (error) throw error;
      const newResponse = await NodeApiClient.post(
        "/attendance/check-in",
        recordData
      );
      const data = newResponse.data;

      const newRecord: AttendanceRecord = {
        id: data.id,
        employeeId: data.employee_id,
        date: data.date,
        checkIn: data.check_in,
        checkOut: data.check_out || undefined,
        breakTime: data.break_time || 0,
        totalHours: Number(data.total_hours) || 0,
        status: data.status as AttendanceRecord["status"],
        location: data.location as AttendanceRecord["location"],
        coordinates: data.coordinates as any,
        notes: data.notes || undefined,
        approvedBy: data.approved_by || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        data: newRecord,
        message: "Clocked in successfully",
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to clock in:", error);
      return {
        data: {} as AttendanceRecord,
        message: error instanceof Error ? error.message : "Failed to clock in",
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async clockOut(employeeId: string): Promise<ApiResponse<AttendanceRecord>> {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const now = new Date();
      const checkOutTime = format(now, "HH:mm:ss");

      // const { data: record, error: fetchError } = await supabase
      //   .from("attendance_records")
      //   .select("*")
      //   .eq("employee_id", employeeId)
      //   .eq("date", today)
      //   .maybeSingle();

      // if (fetchError) throw fetchError;
      const response = await NodeApiClient.get("/attendance/check-out/status", {
        params: {
          employee_id: employeeId,
          date: today,
        },
      });
      const record = response?.data;
      console.log("Clock-out record fetched:", record);
      if (!record[0] || !record[0].check_in) {
        throw new Error("No check-in record found for today");
      }
      if (record[0].check_out) {
        throw new Error("Already clocked out today");
      }

      const checkInTime = new Date(`${today}T${record[0].check_in}`);
      const totalMinutes =
        differenceInMinutes(now, checkInTime) - (record[0].break_time || 0);
      const totalHours = Math.max(0, totalMinutes / 60);

      // const { data: updated, error: updateError } = await supabase
      //   .from("attendance_records")
      //   .update({
      //     check_out: checkOutTime,
      //     total_hours: totalHours,
      //   })
      //   .eq("id", record.id)
      //   .select()
      //   .single();

      // if (updateError) throw updateError;
      const newResponse = await NodeApiClient.patch(
        `/attendance/check-out/${record[0].id}`,
        {
          check_out: checkOutTime,
          total_hours: totalHours,
        }
      );
      const updated = newResponse.data;

      const updatedRecord: AttendanceRecord = {
        id: updated.id,
        employeeId: updated.employee_id,
        date: updated.date,
        checkIn: updated.check_in,
        checkOut: updated.check_out || undefined,
        breakTime: updated.break_time || 0,
        totalHours: Number(updated.total_hours) || 0,
        status: updated.status as AttendanceRecord["status"],
        location: updated.location as AttendanceRecord["location"],
        coordinates: updated.coordinates as any,
        notes: updated.notes || undefined,
        approvedBy: updated.approved_by || undefined,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      };

      return {
        data: updatedRecord,
        message: "Clocked out successfully",
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to clock out:", error);
      return {
        data: {} as AttendanceRecord,
        message: error instanceof Error ? error.message : "Failed to clock out",
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getTeamAttendance(
    managerId: string
  ): Promise<ApiResponse<AttendanceRecord[]>> {
    try {
      const today = format(new Date(), "yyyy-MM-dd");

      // const { data, error } = await supabase
      //   .from("attendance_records")
      //   .select(
      //     `
      //     *,
      //     profiles:employee_id (display_name, first_name, last_name)
      //   `
      //   )
      //   .eq("date", today);

      // if (error) throw error;
      const { data } = await NodeApiClient.get("/attendance", {
        params: {
          date: today, // yyyy-MM-dd
        },
      });

      const records: AttendanceRecord[] = (data || []).map((record) => {
        const profile = record.profiles as {
          display_name?: string;
          first_name?: string;
          last_name?: string;
        } | null;
        const employeeName =
          profile?.display_name ||
          `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
          "Unknown Employee";

        return {
          id: record.id,
          employeeId: record.employee_id,
          employeeName,
          date: record.date,
          checkIn: record.check_in || undefined,
          checkOut: record.check_out || undefined,
          breakTime: record.break_time || 0,
          totalHours: Number(record.total_hours) || 0,
          status: record.status as AttendanceRecord["status"],
          location: record.location as AttendanceRecord["location"],
          coordinates: record.coordinates as any,
          notes: record.notes || undefined,
          approvedBy: record.approved_by || undefined,
          createdAt: record.created_at,
          updatedAt: record.updated_at,
        };
      });

      return {
        data: records,
        message: "Team attendance retrieved successfully",
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to retrieve team attendance:", error);
      return {
        data: [],
        message: "Failed to retrieve team attendance",
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getPendingApprovals(): Promise<ApiResponse<AttendanceApproval[]>> {
    try {
      // Mock pending approvals for now
      const approvals: AttendanceApproval[] = [];

      return {
        data: approvals,
        message: "Pending approvals retrieved successfully",
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        data: [],
        message: "Failed to retrieve pending approvals",
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getAttendancePolicies(): Promise<ApiResponse<AttendancePolicy[]>> {
    try {
      return {
        data: this.policies,
        message: "Attendance policies retrieved successfully",
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        data: [],
        message: "Failed to retrieve attendance policies",
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private determineStatus(checkInTime: Date): AttendanceRecord["status"] {
    const policy = this.policies[0];
    if (!policy) return "present";

    const [startHour, startMinute] = policy.officeStartTime
      .split(":")
      .map(Number);
    const startTime = new Date(checkInTime);
    startTime.setHours(startHour, startMinute, 0, 0);

    const minutesLate = differenceInMinutes(checkInTime, startTime);

    if (minutesLate > policy.lateGracePeriod) {
      return "late";
    }
    return "present";
  }

  private calculateCurrentStreak(records: AttendanceRecord[]): number {
    let streak = 0;
    const sortedRecords = records.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const record of sortedRecords) {
      if (record.status === "present") {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}

export const attendanceService = new AttendanceService();
