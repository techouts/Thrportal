import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { CycleTimeline } from "@/components/performance/CycleTimeline";
import { MyGoalsTab } from "@/components/performance/employee/MyGoalsTab";
import { OneOnOnesTab } from "@/components/performance/employee/OneOnOnesTab";
import { ReviewsTab } from "@/components/performance/employee/ReviewsTab";
import { FeedbackTab } from "@/components/performance/employee/FeedbackTab";
import { PIPTab } from "@/components/performance/employee/PIPTab";
import { Target, Users, FileText, MessageSquare, AlertTriangle } from "lucide-react";

export default function PerformancePage() {
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
      completionPct: 100,
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
      completionPct: 65,
    },
    {
      stage: "year_end",
      label: "Year-End Review",
      openAt: "2024-11-01T00:00:00Z",
      dueAt: "2024-11-30T23:59:59Z",
      closeAt: "2024-12-05T23:59:59Z",
      isLocked: false,
      isActive: false,
      isCompleted: false,
    },
    {
      stage: "rating_discussion",
      label: "Rating Discussion",
      openAt: "2024-12-15T00:00:00Z",
      dueAt: "2024-12-31T23:59:59Z",
      closeAt: "2025-01-05T23:59:59Z",
      isLocked: false,
      isActive: false,
      isCompleted: false,
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
    if (cycleStages.find(s => s.isActive)?.stage === "mid_year") {
      setActiveTab("reviews");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance"
        description="Manage your goals, reviews, and professional development"
      />

      <CycleTimeline
        cycleName="FY 2024 Performance Cycle"
        stages={cycleStages}
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
  );
}