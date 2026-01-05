import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getNotificationService } from "@/services/notifications";
import NodeApiClient from "@/services/nodeApiClient";

export interface RegularizationRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  attendance_date: string;
  reason: string;
  status: string;
  document_url?: string;
  created_at: string;
}

export function usePendingRegularizationRequests(managerId?: string) {
  return useQuery({
    queryKey: ["pending-regularization-requests", managerId],
    queryFn: async (): Promise<RegularizationRequest[]> => {
      if (!managerId) return [];

      // First get direct reports of this manager
      // const { data: directReports, error: reportsError } = await supabase
      //   .from('profiles')
      //   .select('id, first_name, last_name')
      //   .eq('manager_employee_id', managerId);
      const { data: directReports } = await NodeApiClient.get(
        "/auth/users/by-managerData",
        {
          params: {
            manager_employee_id: managerId,
          },
        }
      );

      // if (reportsError) throw reportsError;
      if (!directReports || directReports.length === 0) return [];

      const reportIds = directReports.map((r) => r.id);

      // Get pending regularization requests from direct reports
      // const { data: requests, error } = await supabase
      //   .from('attendance_regularization_requests')
      //   .select('*')
      //   .in('employee_id', reportIds)
      //   .eq('status', 'pending')
      //   .order('created_at', { ascending: false });

      // if (error) throw error;
      const { data: requests } = await NodeApiClient.get(
        "/attendance/regularization",
        {
          params: {
            employee_id: reportIds.join(","),
            status: "pending",
          },
        }
      );

      // Map employee names
      const employeeMap = new Map(
        directReports.map((r) => [
          r.id,
          `${r.first_name || ""} ${r.last_name || ""}`.trim() || "Unknown",
        ])
      );

      return (requests || []).map((req) => ({
        id: req.id,
        employee_id: req.employee_id,
        employee_name: employeeMap.get(req.employee_id) || "Unknown",
        attendance_date: req.attendance_date,
        reason: req.reason,
        status: req.status,
        document_url: req.document_url || undefined,
        created_at: req.created_at || "",
      }));
    },
    enabled: !!managerId,
  });
}

export function useApproveRegularization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      approverId,
    }: {
      requestId: string;
      approverId: string;
    }) => {
      // First get the request to find attendance_record_id and employee_id
      // const { data: request, error: fetchError } = await supabase
      //   .from("attendance_regularization_requests")
      //   .select("attendance_record_id, employee_id, attendance_date")
      //   .eq("id", requestId)
      //   .single();

      // if (fetchError) throw fetchError;
      const { data: request } = await NodeApiClient.get(
        "/attendance/regularization/details",
        {
          params: {
            id: requestId,
          },
        }
      );

      // Update the regularization request
      // const { error: reqError } = await supabase
      //   .from("attendance_regularization_requests")
      //   .update({
      //     status: "approved",
      //     approved_by: approverId,
      //     approved_at: new Date().toISOString(),
      //   })
      //   .eq("id", requestId);

      // if (reqError) throw reqError;
      await NodeApiClient.patch(
        "/attendance/regularization/status",
        {
          status: "approved",
          approved_by: approverId,
          approved_at: new Date().toISOString(),
        },
        {
          params: {
            id: requestId,
          },
        }
      );

      // Update the attendance record to mark as regularized/present
      if (request?.attendance_record_id) {
        const { error: recordError } = await supabase
          .from("attendance_records")
          .update({
            status: "present",
            approved_by: approverId,
            notes: "Regularized by manager",
          })
          .eq("id", request.attendance_record_id);

        if (recordError) throw recordError;
      }

      // Create notification for the employee
      if (request?.employee_id) {
        try {
          const notificationService = getNotificationService();
          await notificationService.notify({
            user_id: request.employee_id,
            title: "Attendance Regularization Approved",
            body: `Your attendance regularization request for ${request.attendance_date} has been approved`,
            type: "success",
            action_url: "/Me/Attendance",
          });
        } catch (notifError) {
          console.error("Error creating notification:", notifError);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pending-regularization-requests"],
      });
      toast.success("Regularization request approved");
    },
    onError: () => {
      toast.error("Failed to approve request");
    },
  });
}

export function useRejectRegularization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      approverId,
      rejectionReason,
    }: {
      requestId: string;
      approverId: string;
      rejectionReason?: string;
    }) => {
      // First get the request to find employee_id
      // const { data: request, error: fetchError } = await supabase
      //   .from("attendance_regularization_requests")
      //   .select("employee_id, attendance_date")
      //   .eq("id", requestId)
      //   .single();

      // if (fetchError) throw fetchError;
      const { data: request } = await NodeApiClient.get(
        "/attendance/regularization/details",
        {
          params: {
            id: requestId,
          },
        }
      );

      // const { error } = await supabase
      //   .from("attendance_regularization_requests")
      //   .update({
      //     status: "rejected",
      //     approved_by: approverId,
      //     approved_at: new Date().toISOString(),
      //     rejection_reason: rejectionReason || "Rejected by manager",
      //   })
      //   .eq("id", requestId);

      // if (error) throw error;
      await NodeApiClient.patch(
        "/attendance/regularization/status",
        {
          status: "rejected",
          approved_by: approverId,
          rejection_reason: rejectionReason || "Rejected by manager",

          approved_at: new Date().toISOString(),
        },
        {
          params: {
            id: requestId,
          },
        }
      );

      // Create notification for the employee
      if (request?.employee_id) {
        try {
          const notificationService = getNotificationService();
          await notificationService.notify({
            user_id: request.employee_id,
            title: "Attendance Regularization Rejected",
            body: `Your attendance regularization request for ${
              request.attendance_date
            } has been rejected: ${rejectionReason || "Rejected by manager"}`,
            type: "error",
            action_url: "/Me/Attendance",
          });
        } catch (notifError) {
          console.error("Error creating notification:", notifError);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pending-regularization-requests"],
      });
      toast.success("Regularization request rejected");
    },
    onError: () => {
      toast.error("Failed to reject request");
    },
  });
}
