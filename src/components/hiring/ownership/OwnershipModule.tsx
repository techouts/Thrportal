import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { JDOwnershipTab } from './tabs/JDOwnershipTab';
import { CandidateOwnershipTab } from './tabs/CandidateOwnershipTab';
import { ClientSpocMappingTab } from './tabs/ClientSpocMappingTab';
import { RecruiterManagerMappingTab } from './tabs/RecruiterManagerMappingTab';
import { TalentPoolsOwnershipTab } from './tabs/TalentPoolsOwnershipTab';
import { EscalationRulesTab } from './tabs/EscalationRulesTab';
import { OwnershipReportsTab } from './tabs/OwnershipReportsTab';
import { PrimaryFollowUpQueue } from './tabs/PrimaryFollowUpQueue';
import { OwnershipSettingsTab } from './tabs/OwnershipSettingsTab';
import { EscalationsTab } from './tabs/EscalationsTab';

export function OwnershipModule() {
  const [showMigrationBanner, setShowMigrationBanner] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ownership Management"
        description="Manage JD ownership, candidate assignments, client mappings, and escalation rules"
      />
      
      {showMigrationBanner && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Assignment module has been merged into Ownership. Find Unassigned/Unattended JDs under JD Ownership tab.
            <button 
              onClick={() => setShowMigrationBanner(false)}
              className="ml-2 text-sm underline"
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="jd-ownership" className="space-y-6">
        <div className="space-y-2">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="jd-ownership">JD Ownership</TabsTrigger>
            <TabsTrigger value="candidate-ownership">Candidate Ownership</TabsTrigger>
            <TabsTrigger value="client-spoc">Client & SPOC</TabsTrigger>
            <TabsTrigger value="recruiter-manager">Recruiter-Manager</TabsTrigger>
            <TabsTrigger value="talent-pools">Talent Pools</TabsTrigger>
          </TabsList>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="primary-queue">Primary Queues</TabsTrigger>
            <TabsTrigger value="escalations">Escalations</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="jd-ownership" className="space-y-6">
          <JDOwnershipTab />
        </TabsContent>
        
        <TabsContent value="candidate-ownership" className="space-y-6">
          <CandidateOwnershipTab />
        </TabsContent>
        
        <TabsContent value="client-spoc" className="space-y-6">
          <ClientSpocMappingTab />
        </TabsContent>
        
        <TabsContent value="recruiter-manager" className="space-y-6">
          <RecruiterManagerMappingTab />
        </TabsContent>
        
        <TabsContent value="talent-pools" className="space-y-6">
          <TalentPoolsOwnershipTab />
        </TabsContent>
        
        <TabsContent value="primary-queue" className="space-y-6">
          <PrimaryFollowUpQueue />
        </TabsContent>
        
        <TabsContent value="escalations" className="space-y-6">
          <EscalationsTab />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <OwnershipReportsTab />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <OwnershipSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}