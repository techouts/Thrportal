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

// Settings Components
import { OnOffboardingSettingsTab } from '@/components/onoffboarding/settings/OnOffboardingSettingsTab';

// Placeholder onboarding components
const PlaceholderOnboardingTab: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <Card>
    <CardContent className="text-center py-12">
      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
      <div className="text-lg font-medium">{title}</div>
      <div className="text-muted-foreground">{description}</div>
    </CardContent>
  </Card>
);

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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="checklists">Checklists</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <PlaceholderOnboardingTab title="Onboarding Dashboard" description="Track new employee onboarding progress" />
            </TabsContent>
            <TabsContent value="checklists">
              <PlaceholderOnboardingTab title="Onboarding Checklists" description="Manage onboarding checklists and tasks" />
            </TabsContent>
            <TabsContent value="tasks">
              <PlaceholderOnboardingTab title="Onboarding Tasks" description="Track individual onboarding tasks" />
            </TabsContent>
            <TabsContent value="documents">
              <PlaceholderOnboardingTab title="Onboarding Documents" description="Manage required documents" />
            </TabsContent>
            <TabsContent value="approvals">
              <PlaceholderOnboardingTab title="Onboarding Approvals" description="Handle onboarding approvals" />
            </TabsContent>
            <TabsContent value="integration">
              <PlaceholderOnboardingTab title="Onboarding Integration" description="Integration with other systems" />
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