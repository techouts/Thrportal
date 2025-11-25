import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { CycleTimeline } from "@/features/performance/components/shared/CycleTimeline";
import { RBACGuard } from "@/features/performance/components/guards/RBACGuard";
import { MyGoalsTab } from "@/features/performance/components/employee/MyGoalsTab";
import { OneOnOnesTab } from "@/features/performance/components/employee/OneOnOnesTab";
import { ReviewsTab } from "@/features/performance/components/employee/ReviewsTab";
import { FeedbackTab } from "@/features/performance/components/employee/FeedbackTab";
import { PIPTab } from "@/features/performance/components/employee/PIPTab";
import { Target, Users, FileText, MessageSquare, AlertTriangle } from "lucide-react";

export default function PerformancePage() {
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
      stage: "year_end" as const,
      openAt: "2024-11-01T00:00:00Z",
      dueAt: "2024-11-30T23:59:59Z",
      closeAt: "2024-12-05T23:59:59Z",
      isLocked: false,
    },
    {
      stage: "rating_discussion" as const,
      openAt: "2024-12-15T00:00:00Z",
      dueAt: "2024-12-31T23:59:59Z",
      closeAt: "2025-01-05T23:59:59Z",
      isLocked: false,
    },
  ];

  const tabs = [
    {
      id: "goals",
      label: "My Goals",
      icon: Target,
      component: MyGoalsTab,
    },
    {
      id: "oneOnOnes",
      label: "1:1s",
      icon: Users,
      component: OneOnOnesTab,
    },
    {
      id: "reviews",
      label: "Reviews",
      icon: FileText,
      component: ReviewsTab,
    },
    {
      id: "feedback",
      label: "Feedback",
      icon: MessageSquare,
      component: FeedbackTab,
    },
    {
      id: "pip",
      label: "PIP",
      icon: AlertTriangle,
      component: PIPTab,
    },
  ];

  const handleStageClick = (stage: any) => {
    console.log("Stage clicked:", stage);
    // Handle stage click - could open stage details modal
  };

  const handlePrimaryAction = () => {
    // Primary action based on current stage
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
    <RBACGuard requiredRoles={["EMPLOYEE", "MANAGER", "HR", "ADMIN"]}>
      <div className="space-y-6">
        <PageHeader
          title="Performance"
          description="Manage your goals, reviews, and professional development"
        />

        <CycleTimeline
          cycleName="FY 2024 Performance Cycle"
          windows={mockWindows}
          onStageClick={handleStageClick}
          primaryAction={{
            label: "Complete Mid-Year Review",
            onClick: handlePrimaryAction,
            variant: "default",
          }}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
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