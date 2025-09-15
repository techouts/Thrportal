import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { ManualJDTab } from './ManualJDTab';
import { ExcelJDTab } from './ExcelJDTab';
import { SmartJDTab } from './SmartJDTab';
import { DraftsJDTab } from './DraftsJDTab';

export function JDManagementModule() {
  const [activeTab, setActiveTab] = useState('manual');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Description Management"
        description="Create, manage, and track job descriptions across multiple channels"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="manual">Manual Creation</TabsTrigger>
          <TabsTrigger value="excel">Excel Import</TabsTrigger>
          <TabsTrigger value="smart">Smart Parse</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          <ManualJDTab />
        </TabsContent>

        <TabsContent value="excel" className="space-y-4">
          <ExcelJDTab />
        </TabsContent>

        <TabsContent value="smart" className="space-y-4">
          <SmartJDTab />
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <DraftsJDTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}