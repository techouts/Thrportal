import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { CycleTimeline } from "@/features/performance/components/shared/CycleTimeline";
import { RBACGuard } from "@/features/performance/components/guards/RBACGuard";
import { CompanyGoalsTab } from "@/features/performance/components/hr/CompanyGoalsTab";
import { DepartmentGoalsTab } from "@/features/performance/components/hr/DepartmentGoalsTab";
import { PeriodsTab } from "@/features/performance/components/hr/PeriodsTab";
import { HRReviewsTab } from "@/features/performance/components/hr/HRReviewsTab";
import { Building, Building2, Calendar, BarChart3 } from "lucide-react";

export default function HRPerformancePage() {
  const [activeTab, setActiveTab] = useState("periods");

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
    {
      stage: "rating_discussion" as const,
      openAt: "2024-08-05T00:00:00Z",
      dueAt: "2024-08-15T23:59:59Z",
      closeAt: "2024-08-20T23:59:59Z",
      isLocked: false,
    },
    {
      stage: "publish" as const,
      openAt: "2024-08-20T00:00:00Z",
      dueAt: "2024-08-31T23:59:59Z",
      closeAt: "2024-09-05T23:59:59Z",
      isLocked: false,
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
    const activeStage = mockWindows.find(w => {
      const now = new Date();
      const openAt = new Date(w.openAt);
      const dueAt = new Date(w.dueAt);
      return now >= openAt && now <= dueAt;
    });
    
    if (activeStage?.stage === "calibration") {
      setActiveTab("reviews");
    }
  };

  return (
    <RBACGuard requiredRoles={["HR", "ADMIN"]}>
      <div className="space-y-6">
        <PageHeader
          title="Performance Management"
          description="Manage performance cycles, goals, and calibration across the organization"
        />

        <CycleTimeline
          cycleName="FY 2024 Performance Cycle"
          windows={mockWindows}
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
    </RBACGuard>
  );
}