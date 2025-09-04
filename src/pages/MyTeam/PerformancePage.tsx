import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { CycleTimeline } from "@/components/performance/CycleTimeline";
import { TeamGoalsTab } from "@/components/performance/manager/TeamGoalsTab";
import { TeamReviewsTab } from "@/components/performance/manager/TeamReviewsTab";
import { PeerFeedbackTab } from "@/components/performance/manager/PeerFeedbackTab";
import { TeamPIPTab } from "@/components/performance/manager/TeamPIPTab";
import { Target, FileText, MessageSquare, AlertTriangle } from "lucide-react";

export default function TeamPerformancePage() {
  const [activeTab, setActiveTab] = useState("goals");

  // Mock data - will be replaced with real data from API
  const cycleStages = [
    {
      stage: "goal_setting",
      label: "Goal Setting",
      openAt: "2024-01-01T00:00:00Z",
      dueAt: "2024-01-31T23:59:59Z",
      closeAt: "2024-02-05T23:59:59Z",
      isLocked: false,
      isActive: false,
      isCompleted: true,
      completionPct: 95,
    },
    {
      stage: "mid_year",
      label: "Mid-Year Review",
      openAt: "2024-06-01T00:00:00Z",
      dueAt: "2024-06-30T23:59:59Z",
      closeAt: "2024-07-05T23:59:59Z",
      isLocked: false,
      isActive: true,
      isCompleted: false,
      completionPct: 72,
    },
    {
      stage: "mgr_review",
      label: "Manager Review",
      openAt: "2024-07-01T00:00:00Z",
      dueAt: "2024-07-15T23:59:59Z",
      closeAt: "2024-07-20T23:59:59Z",
      isLocked: false,
      isActive: false,
      isCompleted: false,
    },
    {
      stage: "calibration",
      label: "Calibration",
      openAt: "2024-07-20T00:00:00Z",
      dueAt: "2024-07-31T23:59:59Z",
      closeAt: "2024-08-05T23:59:59Z",
      isLocked: false,
      isActive: false,
      isCompleted: false,
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
    if (cycleStages.find(s => s.isActive)?.stage === "mid_year") {
      setActiveTab("reviews");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Performance"
        description="Manage your team's goals, reviews, and development"
      />

      <CycleTimeline
        cycleName="FY 2024 Performance Cycle"
        stages={cycleStages}
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
  );
}