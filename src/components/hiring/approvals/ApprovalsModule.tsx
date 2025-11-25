import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { ApprovalDashboard } from './ApprovalDashboard';
import { InternalApprovalsTab } from './InternalApprovalsTab';
import { ExternalApprovalsTab } from './ExternalApprovalsTab';

export function ApprovalsModule() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      <PageHeader
        title="JD Approvals"
        description="Review and approve job descriptions based on approval workflow"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="internal">Internal Approvals</TabsTrigger>
          <TabsTrigger value="external">External Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <ApprovalDashboard />
        </TabsContent>

        <TabsContent value="internal" className="space-y-4">
          <InternalApprovalsTab />
        </TabsContent>

        <TabsContent value="external" className="space-y-4">
          <ExternalApprovalsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}