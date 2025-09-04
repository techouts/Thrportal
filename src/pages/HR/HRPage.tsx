import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// Import Performance Components
import { CycleTimeline } from '@/features/performance/components/shared/CycleTimeline'
import { CompanyGoalsTab } from '@/features/performance/components/hr/CompanyGoalsTab'
import { DepartmentGoalsTab } from '@/features/performance/components/hr/DepartmentGoalsTab'
import { PeriodsTab } from '@/features/performance/components/hr/PeriodsTab'
import { HRReviewsTab } from '@/features/performance/components/hr/HRReviewsTab'
import { Building, Building2, Calendar, BarChart3 } from "lucide-react"
import { moduleRegistry } from '@/lib/moduleRegistry'

interface HRPageProps {
  defaultTab: string
}

export default function HRPage({ defaultTab }: HRPageProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const moduleSpec = moduleRegistry.getModuleSpec(`/HR/${defaultTab}`) || 
    moduleRegistry.registerModuleSpec(`/HR/${defaultTab}`, {
      brdStatus: 'draft',
      promptStatus: 'pending',
      description: `HR management - ${defaultTab}`
    })

  const renderPerformance = () => {
    const [activePerformanceTab, setActivePerformanceTab] = useState("periods");

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
      if (stage.stage === "calibration") {
        setActivePerformanceTab("reviews");
      }
    };

    const handlePrimaryAction = () => {
      const activeStage = mockWindows.find(w => {
        const now = new Date();
        const openAt = new Date(w.openAt);
        const dueAt = new Date(w.dueAt);
        return now >= openAt && now <= dueAt;
      });
      
      if (activeStage?.stage === "calibration") {
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
            label: "Open Calibration Console",
            onClick: handlePrimaryAction,
            variant: "default",
          }}
        />

        <Tabs value={activePerformanceTab} onValueChange={setActivePerformanceTab} className="space-y-6">
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
  };

  const renderContent = () => {
    if (defaultTab === 'Performance') {
      return renderPerformance();
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
        title={`HR - ${defaultTab}`}
        breadcrumbs={[
          { label: 'HR', href: '/HR/Performance' },
          { label: defaultTab, href: `/HR/${defaultTab}` }
        ]}
        moduleSpec={moduleSpec}
      />

      {renderContent()}
    </div>
  )
}