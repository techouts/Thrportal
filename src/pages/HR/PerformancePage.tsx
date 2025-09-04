import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { CycleTimeline } from "@/components/performance/CycleTimeline";
import { CompanyGoalsTab } from "@/components/performance/hr/CompanyGoalsTab";
import { DepartmentGoalsTab } from "@/components/performance/hr/DepartmentGoalsTab";
import { PeriodsTab } from "@/components/performance/hr/PeriodsTab";
import { HRReviewsTab } from "@/components/performance/hr/HRReviewsTab";
import { Building, Building2, Calendar, BarChart3 } from "lucide-react";

export default function HRPerformancePage() {
  const [activeTab, setActiveTab] = useState("periods");

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
      isActive: false,
      isCompleted: true,
      completionPct: 100,
    },
    {
      stage: "mgr_review",
      label: "Manager Review",
      openAt: "2024-07-01T00:00:00Z",
      dueAt: "2024-07-15T23:59:59Z",
      closeAt: "2024-07-20T23:59:59Z",
      isLocked: false,
      isActive: false,
      isCompleted: true,
      completionPct: 100,
    },
    {
      stage: "calibration",
      label: "Calibration",
      openAt: "2024-07-20T00:00:00Z",
      dueAt: "2024-07-31T23:59:59Z",
      closeAt: "2024-08-05T23:59:59Z",
      isLocked: false,
      isActive: true,
      isCompleted: false,
      completionPct: 85,
    },
    {
      stage: "rating_discussion",
      label: "Rating Discussion",
      openAt: "2024-08-05T00:00:00Z",
      dueAt: "2024-08-15T23:59:59Z",
      closeAt: "2024-08-20T23:59:59Z",
      isLocked: false,
      isActive: false,
      isCompleted: false,
    },
    {
      stage: "publish",
      label: "Publish Results",
      openAt: "2024-08-20T00:00:00Z",
      dueAt: "2024-08-31T23:59:59Z",
      closeAt: "2024-09-05T23:59:59Z",
      isLocked: false,
      isActive: false,
      isCompleted: false,
    },
  ];

  const tabs = [
    {
      id: "company",
      label: "Company Goals",
      icon: Building,
      component: CompanyGoalsTab,
    },
    {
      id: "department",
      label: "Department Goals",
      icon: Building2,
      component: DepartmentGoalsTab,
    },
    {
      id: "periods",
      label: "Periods",
      icon: Calendar,
      component: PeriodsTab,
    },
    {
      id: "reviews",
      label: "Reviews",
      icon: BarChart3,
      component: HRReviewsTab,
    },
  ];

  const handleStageClick = (stage: any) => {
    console.log("HR stage clicked:", stage);
    // Handle stage click - could open calibration console, admin tools, etc.
    if (stage.stage === "calibration") {
      setActiveTab("reviews");
    }
  };

  const handlePrimaryAction = () => {
    // Primary action for HR based on current stage
    if (cycleStages.find(s => s.isActive)?.stage === "calibration") {
      setActiveTab("reviews");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Management"
        description="Manage performance cycles, goals, and calibration across the organization"
      />

      <CycleTimeline
        cycleName="FY 2024 Performance Cycle"
        stages={cycleStages}
        onStageClick={handleStageClick}
        primaryAction={{
          label: "Open Calibration Console",
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