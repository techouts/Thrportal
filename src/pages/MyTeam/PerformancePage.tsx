import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { CycleTimeline } from "@/features/performance/components/shared/CycleTimeline";
import { RBACGuard } from "@/features/performance/components/guards/RBACGuard";
import { TeamGoalsTab } from "@/features/performance/components/manager/TeamGoalsTab";
import { TeamReviewsTab } from "@/features/performance/components/manager/TeamReviewsTab";
import { PeerFeedbackTab } from "@/features/performance/components/manager/PeerFeedbackTab";
import { TeamPIPTab } from "@/features/performance/components/manager/TeamPIPTab";
import { Target, FileText, MessageSquare, AlertTriangle } from "lucide-react";

export default function TeamPerformancePage() {
  const [activeTab, setActiveTab] = useState("goals");

  // Mock data - will be replaced with real data from API
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
    // Handle stage click - could open calibration console, review dashboard, etc.
  };

  const handlePrimaryAction = () => {
    // Primary action based on current stage for managers
    const activeStage = mockWindows.find(w => {
      const now = new Date();
      const openAt = new Date(w.openAt);
      const dueAt = new Date(w.dueAt);
      return now >= openAt && now <= dueAt;
    });
    
    if (activeStage?.stage === "mid_year") {
      setActiveTab("reviews");
    }
  };

  return (
    <RBACGuard requiredRoles={["MANAGER", "HR", "ADMIN"]}>
      <div className="space-y-6">
        <PageHeader
          title="Team Performance"
          description="Manage your team's goals, reviews, and development"
        />

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
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
    </RBACGuard>
  );
}