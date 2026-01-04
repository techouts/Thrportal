import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock } from "lucide-react";
import { format } from "date-fns";
// useLeaveBalances removed - now using real data from transactions
import { useCompOffBalance } from "@/hooks/useCompOffBalance";
import { useLeaveBalanceFromTransactions } from "@/hooks/useLeaveBalanceFromTransactions";
import { 
  useAllMyRequests,
  useProfiles, 
  useCreateLeaveRequest,
  useCreateCompOffRequest,
  useCancelLeaveRequest,
  useCancelCompOffRequest
} from "@/hooks/useLeaveSupabase";
import { CasualLeaveBalanceCard } from "@/components/leave/CasualLeaveBalanceCard";
import { CompOffBalanceCard } from "@/components/leave/CompOffBalanceCard";
import { UpcomingHolidayCard } from "@/components/leave/UpcomingHolidayCard";
import { RequestLeaveDialog, LeaveRequestData } from "@/components/leave/RequestLeaveDialog";
import { RequestCompOffDialog, CompOffRequestData } from "@/components/leave/RequestCompOffDialog";
import { LeavePolicyDialog } from "@/components/leave/LeavePolicyDialog";
import { MyRequestsTable } from "@/components/leave/MyRequestsTable";
import { RBACGuard } from "@/features/performance/components/guards/RBACGuard";
import { useAuth } from "@/auth/AuthContext";

export default function LeavePage() {
  const { user } = useAuth();
  const [selectedYear] = useState(new Date().getFullYear().toString());

  // Dialog states
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showCompOffDialog, setShowCompOffDialog] = useState(false);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);

  // Data hooks
  // Leave balances now fetched via CasualLeaveBalanceCard component directly
  const { data: compOffBalance } = useCompOffBalance(user?.id);
  const { available: clBalance } = useLeaveBalanceFromTransactions('CL');
  const { available: plBalance } = useLeaveBalanceFromTransactions('PL');
  const { available: mlBalance } = useLeaveBalanceFromTransactions('ML');
  const { data: allRequests, isLoading: requestsLoading } = useAllMyRequests(user?.id);
  const { data: profiles } = useProfiles();

  // Mutations
  const createLeaveRequest = useCreateLeaveRequest();
  const createCompOffRequest = useCreateCompOffRequest();
  const cancelLeaveRequest = useCancelLeaveRequest();
  const cancelCompOffRequest = useCancelCompOffRequest();

  // Get user display name
  const userName = user?.display_name || 
    `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 
    user?.email || '';

  const handleLeaveSubmit = async (data: LeaveRequestData) => {
    if (!user?.id) return;
    
    await createLeaveRequest.mutateAsync({
      employee_id: user.id,
      leave_type: data.leave_type,
      start_date: format(data.start_date, 'yyyy-MM-dd'),
      end_date: format(data.end_date, 'yyyy-MM-dd'),
      total_days: data.total_days,
      reason: data.reason,
      requested_by: userName,
    });
  };

  const handleCompOffSubmit = async (data: CompOffRequestData) => {
    if (!user?.id) return;
    
    await createCompOffRequest.mutateAsync({
      employee_id: user.id,
      start_date: format(data.start_date, 'yyyy-MM-dd'),
      end_date: format(data.end_date, 'yyyy-MM-dd'),
      total_days: data.total_days,
      reason: data.reason,
      evidence_url: data.evidence_url,
    });
  };

  const handleCancelRequest = (requestId: string, requestSource?: 'leave' | 'comp_off') => {
    if (requestSource === 'comp_off') {
      cancelCompOffRequest.mutate(requestId);
    } else {
      cancelLeaveRequest.mutate(requestId);
    }
  };

  return (
    <RBACGuard requiredRoles={["EMPLOYEE", "MANAGER", "HR", "ADMIN"]}>
      <div className="space-y-6">
        {/* Page Header - Mobile Responsive */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Leave Management</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Manage your leave requests and view balances
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setShowCompOffDialog(true)} className="flex-1 sm:flex-none">
                <Clock className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Request </span>Comp-Off
              </Button>
              <Button size="sm" onClick={() => setShowLeaveDialog(true)} className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Request </span>Leave
              </Button>
            </div>
            <button 
              onClick={() => setShowPolicyDialog(true)}
              className="text-sm text-primary hover:underline font-medium text-center sm:text-left"
            >
              Leave Policy
            </button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="history">My Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Leave Balances - CL and Comp-Offs */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Leave Balances</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Casual Leave Card - Real data from transactions */}
                <CasualLeaveBalanceCard />
                
                {/* Comp-Off Balance Card */}
                <CompOffBalanceCard employeeId={user?.id} />
              </div>
            </div>

            {/* Upcoming Holidays */}
            <div>
              <UpcomingHolidayCard />
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>My Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <MyRequestsTable 
                  requests={allRequests || []}
                  isLoading={requestsLoading}
                  onCancel={handleCancelRequest}
                  userGender={user?.gender}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <RequestLeaveDialog
          open={showLeaveDialog}
          onOpenChange={setShowLeaveDialog}
          onSubmit={handleLeaveSubmit}
          compOffBalance={compOffBalance?.available ?? 0}
          clBalance={clBalance ?? 0}
          plBalance={plBalance ?? 0}
          mlBalance={mlBalance ?? 0}
          userGender={user?.gender}
        />
        <RequestCompOffDialog
          open={showCompOffDialog}
          onOpenChange={setShowCompOffDialog}
          onSubmit={handleCompOffSubmit}
        />
        <LeavePolicyDialog
          open={showPolicyDialog}
          onOpenChange={setShowPolicyDialog}
        />
      </div>
    </RBACGuard>
  );
}
