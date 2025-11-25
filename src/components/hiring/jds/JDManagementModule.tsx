import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { ManualJDTab } from './ManualJDTab';
import { ExcelJDTab } from './ExcelJDTab';
import { SmartJDTab } from './SmartJDTab';
import { DraftsJDTab } from './DraftsJDTab';

import { PublishingTab } from './PublishingTab';

export function JDManagementModule() {
  const [activeTab, setActiveTab] = useState('overview');
  

  // Mock JD ID for demo - in real implementation, this would come from JD selection
  const mockJdId = "mock-jd-id-123";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Description Management"
        description="Create, manage, and track job descriptions with approvals and publishing"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="manual">Manual Creation</TabsTrigger>
          <TabsTrigger value="smart">Smart Parse</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          
          <TabsTrigger value="publishing">Publishing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <DraftsJDTab defaultStatus="active" />
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <ManualJDTab />
        </TabsContent>

        <TabsContent value="smart" className="space-y-4">
          <SmartJDTab />
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <DraftsJDTab />
        </TabsContent>


        <TabsContent value="publishing" className="space-y-4">
          <PublishingTab jdId={mockJdId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}