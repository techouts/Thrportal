import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Import Performance Components
import { CycleTimeline } from "@/features/performance/components/shared/CycleTimeline";
import { TeamGoalsTab } from "@/features/performance/components/manager/TeamGoalsTab";
import { TeamReviewsTab } from "@/features/performance/components/manager/TeamReviewsTab";
import { PeerFeedbackTab } from "@/features/performance/components/manager/PeerFeedbackTab";
import { TeamPIPTab } from "@/features/performance/components/manager/TeamPIPTab";
import MyTeamLeavePage from "@/pages/MyTeam/LeavePage";
import MyTeamLearningPage from "@/pages/MyTeam/LearningPage";
import MyTeamRecognitionPage from "@/pages/MyTeam/RecognitionPage";
import TeamExpensesPage from "@/pages/MyTeam/ExpensesPage";
import MyTeamIJPPage from "@/pages/MyTeam/IJPPage";
import MyTeamAttendancePage from "@/pages/MyTeam/AttendancePage";
// Import My Team Components
import { DashboardMetrics } from "@/components/myteam/DashboardMetrics";
import { ExpensesDashboard } from "@/components/myteam/ExpensesDashboard";
import { TimesheetDashboard } from "@/components/myteam/TimesheetDashboard";
import { ProfileChangesDashboard } from "@/components/myteam/ProfileChangesDashboard";
import { ApprovalQueues } from "@/components/myteam/ApprovalQueues";
import {
  Target,
  FileText,
  MessageSquare,
  AlertTriangle,
  DollarSign,
  Clock,
  User,
} from "lucide-react";
import { moduleRegistry } from "@/lib/moduleRegistry";
import { myTeamService } from "@/services/myTeamService";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";

interface MyTeamPageProps {
  defaultTab: string;
}

export default function MyTeamPage({ defaultTab }: MyTeamPageProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync activeTab with defaultTab when URL changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
  const [metrics, setMetrics] = useState<any>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePerformanceTab, setActivePerformanceTab] = useState("goals");
  // const { user: currentUser } = useAuth()
  const currentUserId = localStorage.getItem("auth_user_id");

  const moduleSpec =
    moduleRegistry.getModuleSpec(`/MyTeam/${defaultTab}`) ||
    moduleRegistry.registerModuleSpec(`/MyTeam/${defaultTab}`, {
      brdStatus: "draft",
      promptStatus: "pending",
      description: `Team management - ${defaultTab}`,
    });

  useEffect(() => {
    loadData();
  }, [defaultTab, currentUserId]);

  const loadData = async () => {
    if (!currentUserId) return;

    setLoading(true);
    try {
      let data;
      switch (defaultTab) {
        case "Dashboard":
          data = await myTeamService.getDashboardMetrics(currentUserId);
          break;
        case "Expenses":
          data = await myTeamService.getExpenseMetrics(currentUserId);
          break;
        case "Timesheet":
          data = await myTeamService.getTimesheetMetrics(currentUserId);
          break;
        case "ProfileChanges":
          data = await myTeamService.getProfileChangeMetrics(currentUserId);
          break;
        default:
          data = await myTeamService.getDashboardMetrics(currentUserId);
      }

      setMetrics(data.data);

      // Load approvals for all tabs
      const approvalsData = await myTeamService.getApprovalQueues(
        currentUserId
      );
      setApprovals(approvalsData.data);
    } catch (error) {
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (
    id: string,
    comments?: string,
    type?: string
  ) => {
    try {
      const result = await myTeamService.approveRequest(id, comments, type);
      if (result.success) {
        toast.success(result.message || "Request approved successfully");
      } else {
        toast.error(result.message || "Failed to approve request");
      }
      loadData();
    } catch (error) {
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (id: string, reason: string, type?: string) => {
    try {
      const result = await myTeamService.rejectRequest(id, reason, type);
      if (result.success) {
        toast.success(result.message || "Request rejected successfully");
      } else {
        toast.error(result.message || "Failed to reject request");
      }
      loadData();
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };

  const handleBulkApprove = async (ids: string[], type?: string) => {
    try {
      const result = await myTeamService.bulkApprove(ids, type);
      if (result.success) {
        toast.success(
          result.message || `${ids.length} requests approved successfully`
        );
      } else {
        toast.error(result.message || "Failed to bulk approve requests");
      }
      loadData();
    } catch (error) {
      toast.error("Failed to bulk approve requests");
    }
  };

  const handleBulkReject = async (
    ids: string[],
    reason: string,
    type?: string
  ) => {
    try {
      const result = await myTeamService.bulkReject(ids, reason, type);
      if (result.success) {
        toast.success(
          result.message || `${ids.length} requests rejected successfully`
        );
      } else {
        toast.error(result.message || "Failed to bulk reject requests");
      }
      loadData();
    } catch (error) {
      toast.error("Failed to bulk reject requests");
    }
  };

  const handleFetchTimesheetEntries = async (timesheetId: string) => {
    try {
      const result = await myTeamService.getTimesheetEntries(timesheetId);
      return result.data || [];
    } catch (error) {
      console.error("Error fetching timesheet entries:", error);
      return [];
    }
  };

  const renderPerformance = () => {
    // Mock data for cycle timeline
    const mockWindows = [
      {
        stage: "goal_setting" as const,
        openAt: "2024-01-01T00:00:00Z",
        dueAt: "2024-01-31T23:59:59Z",
        closeAt: "2024-02-05T23:59:59Z",
        isLocked: false,
      },
      {
        stage: "mid_year" as const,
        openAt: "2024-06-01T00:00:00Z",
        dueAt: "2024-06-30T23:59:59Z",
        closeAt: "2024-07-05T23:59:59Z",
        isLocked: false,
      },
      {
        stage: "mgr_review" as const,
        openAt: "2024-07-01T00:00:00Z",
        dueAt: "2024-07-15T23:59:59Z",
        closeAt: "2024-07-20T23:59:59Z",
        isLocked: false,
      },
      {
        stage: "calibration" as const,
        openAt: "2024-07-20T00:00:00Z",
        dueAt: "2024-07-31T23:59:59Z",
        closeAt: "2024-08-05T23:59:59Z",
        isLocked: false,
      },
    ];

    const tabs = [
      {
        id: "goals",
        label: "Team Goals",
        icon: Target,
        component: TeamGoalsTab,
      },
      {
        id: "reviews",
        label: "Reviews",
        icon: FileText,
        component: TeamReviewsTab,
      },
      {
        id: "feedback",
        label: "Peer Feedback",
        icon: MessageSquare,
        component: PeerFeedbackTab,
      },
      {
        id: "pip",
        label: "PIP",
        icon: AlertTriangle,
        component: TeamPIPTab,
      },
    ];

    const handleStageClick = (stage: any) => {
      console.log("Manager stage clicked:", stage);
    };

    const handlePrimaryAction = () => {
      const activeStage = mockWindows.find((w) => {
        const now = new Date();
        const openAt = new Date(w.openAt);
        const dueAt = new Date(w.dueAt);
        return now >= openAt && now <= dueAt;
      });

      if (activeStage?.stage === "mid_year") {
        setActivePerformanceTab("reviews");
      }
    };

    return (
      <div className="space-y-6">
        <CycleTimeline
          cycleName="FY 2024 Performance Cycle"
          windows={mockWindows}
          onStageClick={handleStageClick}
          primaryAction={{
            label: "Review Team Progress",
            onClick: handlePrimaryAction,
            variant: "default",
          }}
        />

        <Tabs
          value={activePerformanceTab}
          onValueChange={setActivePerformanceTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <tab.component />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  };

  const renderContent = () => {
    if (defaultTab === "Performance") {
      return renderPerformance();
    }

    if (defaultTab === "Dashboard") {
      return (
        <Tabs defaultValue="metrics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="metrics">Dashboard</TabsTrigger>
            <TabsTrigger value="approvals">
              Approvals ({approvals.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="metrics">
            <DashboardMetrics metrics={metrics} loading={loading} />
          </TabsContent>
          <TabsContent value="approvals">
            <ApprovalQueues
              approvals={approvals}
              loading={loading}
              onApprove={handleApprove}
              onReject={handleReject}
              onBulkApprove={handleBulkApprove}
              onBulkReject={handleBulkReject}
              onFetchTimesheetEntries={handleFetchTimesheetEntries}
            />
          </TabsContent>
        </Tabs>
      );
    }

    if (defaultTab === "Expenses") {
      return <TeamExpensesPage />;
    }

    if (defaultTab === "Timesheet") {
      return (
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <TimesheetDashboard metrics={metrics} loading={loading} />
          </TabsContent>
          <TabsContent value="approvals">
            <ApprovalQueues
              approvals={approvals.filter((a) => a.type === "timesheet")}
              loading={loading}
              onApprove={handleApprove}
              onReject={handleReject}
              onBulkApprove={handleBulkApprove}
              onBulkReject={handleBulkReject}
              onFetchTimesheetEntries={handleFetchTimesheetEntries}
            />
          </TabsContent>
        </Tabs>
      );
    }

    if (defaultTab === "ProfileChanges") {
      return (
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <ProfileChangesDashboard metrics={metrics} loading={loading} />
          </TabsContent>
          <TabsContent value="approvals">
            <ApprovalQueues
              approvals={approvals.filter((a) => a.type === "profile")}
              loading={loading}
              onApprove={handleApprove}
              onReject={handleReject}
              onBulkApprove={handleBulkApprove}
              onBulkReject={handleBulkReject}
              onFetchTimesheetEntries={handleFetchTimesheetEntries}
            />
          </TabsContent>
        </Tabs>
      );
    }

    if (defaultTab === "Leave") {
      return <MyTeamLeavePage />;
    }

    if (defaultTab === "Learning") {
      return <MyTeamLearningPage />;
    }

    if (defaultTab === "IJP") {
      return <MyTeamIJPPage />;
    }

    if (defaultTab === "Attendance") {
      return <MyTeamAttendancePage />;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>{defaultTab}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {defaultTab} functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`My Team - ${defaultTab}`}
        breadcrumbs={[
          { label: "My Team", href: "/MyTeam/Dashboard" },
          { label: defaultTab, href: `/MyTeam/${defaultTab}` },
        ]}
        moduleSpec={moduleSpec}
      />

      {renderContent()}
    </div>
  );
}
