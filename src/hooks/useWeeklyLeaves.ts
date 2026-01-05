import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, parseISO, isWithinInterval } from "date-fns";
import NodeApiClient from "@/services/nodeApiClient";
import { c } from "node_modules/framer-motion/dist/types.d-Cjd591yU";

export interface WeeklyLeave {
  date: string;
  leaveType: string;
  leaveTypeLabel: string;
  hours: number;
}

// Map leave type codes to friendly names
const LEAVE_TYPE_LABELS: Record<string, string> = {
  CL: "Casual Leave",
  SL: "Sick Leave",
  PL: "Privilege Leave",
  ML: "Maternity Leave",
  PL_PATERNITY: "Paternity Leave",
  COMP_OFF: "Comp Off",
  LOP: "Loss of Pay",
  EL: "Earned Leave",
  WFH: "Work From Home",
};

export function useWeeklyLeaves(employeeId: string, weekStart: Date) {
  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const weekEnd = addDays(weekStart, 6);
  const weekEndStr = format(weekEnd, "yyyy-MM-dd");

  return useQuery({
    queryKey: ["weeklyLeaves", employeeId, weekStartStr],
    queryFn: async () => {
      // Fetch approved leave requests that overlap with the selected week
      // const { data, error } = await supabase
      //   .from('leave_requests')
      //   .select('*')
      //   .eq('employee_id', employeeId)
      //   .eq('status', 'approved')
      //   .lte('start_date', weekEndStr)
      //   .gte('end_date', weekStartStr);

      // if (error) throw error;
      const response = await NodeApiClient.get("/leaves", {
        params: {
          employee_id: employeeId,
          status: "approved",
          start_date: weekStartStr,
          end_date: weekEndStr,
        },
      });
      const data = response.data;
      const leaves: WeeklyLeave[] = [];

      // For each leave request, generate entries for each day within the week
      (data || []).forEach((leave) => {
        const leaveStart = parseISO(leave.start_date);
        const leaveEnd = parseISO(leave.end_date);
        const totalDays = leave.total_days || 1;

        // Check if it's a half-day leave (total_days is 0.5 or similar)
        const isHalfDay = totalDays < 1;
        const hoursPerDay = isHalfDay ? 4 : 8;

        // Iterate through each day of the week
        for (let i = 0; i < 7; i++) {
          const currentDate = addDays(weekStart, i);
          const currentDateStr = format(currentDate, "yyyy-MM-dd");

          // Check if this day falls within the leave period
          if (
            isWithinInterval(currentDate, { start: leaveStart, end: leaveEnd })
          ) {
            const leaveTypeLabel =
              LEAVE_TYPE_LABELS[leave.leave_type] || leave.leave_type;

            leaves.push({
              date: currentDateStr,
              leaveType: leave.leave_type,
              leaveTypeLabel,
              hours: hoursPerDay,
            });
          }
        }
      });

      return leaves;
    },
    enabled: !!employeeId,
  });
}
