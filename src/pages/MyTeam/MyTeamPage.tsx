import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// Import Performance Components
import { CycleTimeline } from '@/features/performance/components/shared/CycleTimeline'
import { TeamGoalsTab } from '@/features/performance/components/manager/TeamGoalsTab'
import { TeamReviewsTab } from '@/features/performance/components/manager/TeamReviewsTab'
import { PeerFeedbackTab } from '@/features/performance/components/manager/PeerFeedbackTab'
import { TeamPIPTab } from '@/features/performance/components/manager/TeamPIPTab'
import { Target, FileText, MessageSquare, AlertTriangle } from "lucide-react"
import { moduleRegistry } from '@/lib/moduleRegistry'

interface MyTeamPageProps {
  defaultTab: string
}

export default function MyTeamPage({ defaultTab }: MyTeamPageProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const moduleSpec = moduleRegistry.getModuleSpec(`/MyTeam/${defaultTab}`) || 
    moduleRegistry.registerModuleSpec(`/MyTeam/${defaultTab}`, {
      brdStatus: 'draft',
      promptStatus: 'pending',
      description: `Team management - ${defaultTab}`
    })

  const renderPerformance = () => {
    const [activePerformanceTab, setActivePerformanceTab] = useState("goals");

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
      const activeStage = mockWindows.find(w => {
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
        title={`My Team - ${defaultTab}`}
        breadcrumbs={[
          { label: 'My Team', href: '/MyTeam/Dashboard' },
          { label: defaultTab, href: `/MyTeam/${defaultTab}` }
        ]}
        moduleSpec={moduleSpec}
      />

      {renderContent()}
    </div>
  )
}