import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ClipboardList, CheckSquare, FileText, UserCheck, Settings } from 'lucide-react';

// Offboarding Components
import { OffboardingDashboardTab } from '@/components/onoffboarding/offboarding/OffboardingDashboardTab';
import { OffboardingChecklistsTab } from '@/components/onoffboarding/offboarding/OffboardingChecklistsTab';
import { OffboardingTasksTab } from '@/components/onoffboarding/offboarding/OffboardingTasksTab';
import { OffboardingExitInterviewsTab } from '@/components/onoffboarding/offboarding/OffboardingExitInterviewsTab';
import { OffboardingDocumentsTab } from '@/components/onoffboarding/offboarding/OffboardingDocumentsTab';
import { OffboardingApprovalsTab } from '@/components/onoffboarding/offboarding/OffboardingApprovalsTab';
import { OffboardingIntegrationTab } from '@/components/onoffboarding/offboarding/OffboardingIntegrationTab';

// Onboarding Components
import { OnboardingDashboardTab } from '@/components/onoffboarding/onboarding/OnboardingDashboardTab';
import { OnboardingCandidatePipelineTab } from '@/components/onoffboarding/onboarding/OnboardingCandidatePipelineTab';
import { OnboardingChecklistsTab } from '@/components/onoffboarding/onboarding/OnboardingChecklistsTab';
import { OnboardingTasksTab } from '@/components/onoffboarding/onboarding/OnboardingTasksTab';
import { OnboardingDocumentsTab } from '@/components/onoffboarding/onboarding/OnboardingDocumentsTab';
import { OnboardingBGVTab } from '@/components/onoffboarding/onboarding/OnboardingBGVTab';
import { OnboardingApprovalsTab } from '@/components/onoffboarding/onboarding/OnboardingApprovalsTab';
import { OnboardingIntegrationTab } from '@/components/onoffboarding/onboarding/OnboardingIntegrationTab';

// Settings Components
import { OnOffboardingSettingsTab } from '@/components/onoffboarding/settings/OnOffboardingSettingsTab';

const OnOffboardingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('onboarding');
  const [activeSubTab, setActiveSubTab] = useState('dashboard');

  useEffect(() => {
    const tab = searchParams.get('tab') || 'onboarding';
    const subTab = searchParams.get('subTab') || 'dashboard';
    setActiveTab(tab);
    setActiveSubTab(subTab);
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const subTab = tab === 'settings' ? 'templates' : 'dashboard';
    setActiveSubTab(subTab);
    navigate(`/HR/OnOffboarding?tab=${tab}&subTab=${subTab}`);
  };

  const handleSubTabChange = (subTab: string) => {
    setActiveSubTab(subTab);
    navigate(`/HR/OnOffboarding?tab=${activeTab}&subTab=${subTab}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="OnOffboarding Management"
        description="Manage employee onboarding and offboarding processes, checklists, and workflows"
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="onboarding" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Onboarding
          </TabsTrigger>
          <TabsTrigger value="offboarding" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Offboarding
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Onboarding Section */}
        <TabsContent value="onboarding" className="space-y-6">
          <Tabs value={activeSubTab} onValueChange={handleSubTabChange}>
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="pipeline">Candidate Pipeline</TabsTrigger>
              <TabsTrigger value="checklists">Checklists</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="bgv">BGV</TabsTrigger>
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <OnboardingDashboardTab />
            </TabsContent>
            <TabsContent value="pipeline">
              <OnboardingCandidatePipelineTab />
            </TabsContent>
            <TabsContent value="checklists">
              <OnboardingChecklistsTab />
            </TabsContent>
            <TabsContent value="tasks">
              <OnboardingTasksTab />
            </TabsContent>
            <TabsContent value="documents">
              <OnboardingDocumentsTab />
            </TabsContent>
            <TabsContent value="bgv">
              <OnboardingBGVTab />
            </TabsContent>
            <TabsContent value="approvals">
              <OnboardingApprovalsTab />
            </TabsContent>
            <TabsContent value="integration">
              <OnboardingIntegrationTab />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Offboarding Section */}
        <TabsContent value="offboarding" className="space-y-6">
          <Tabs value={activeSubTab} onValueChange={handleSubTabChange}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="checklists">Checklists</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="exit-interviews">Exit Interviews</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <OffboardingDashboardTab />
            </TabsContent>
            <TabsContent value="checklists">
              <OffboardingChecklistsTab />
            </TabsContent>
            <TabsContent value="tasks">
              <OffboardingTasksTab />
            </TabsContent>
            <TabsContent value="exit-interviews">
              <OffboardingExitInterviewsTab />
            </TabsContent>
            <TabsContent value="documents">
              <OffboardingDocumentsTab />
            </TabsContent>
            <TabsContent value="approvals">
              <OffboardingApprovalsTab />
            </TabsContent>
            <TabsContent value="integration">
              <OffboardingIntegrationTab />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Settings Section */}
        <TabsContent value="settings" className="space-y-6">
          <OnOffboardingSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OnOffboardingPage;