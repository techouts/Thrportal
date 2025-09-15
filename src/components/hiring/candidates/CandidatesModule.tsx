import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { CandidateListTab } from './tabs/CandidateListTab';
import { CandidateProfileTab } from './tabs/CandidateProfileTab';
import { CandidateSecurityTab } from './tabs/CandidateSecurityTab';
import { TalentPoolsTab } from './tabs/TalentPoolsTab';
import { CandidateReportsTab } from './tabs/CandidateReportsTab';

export function CandidatesModule() {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const handleViewCandidate = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setActiveTab('profile');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidates & Resumes"
        description="Manage candidate profiles, resumes, applications, and talent pools"
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="list">Candidate List</TabsTrigger>
          <TabsTrigger value="profile">Candidate Profile</TabsTrigger>
          <TabsTrigger value="pools">Talent Pools</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-6">
          <CandidateListTab onViewCandidate={handleViewCandidate} />
        </TabsContent>
        
        <TabsContent value="profile" className="space-y-6">
          <CandidateProfileTab 
            candidateId={selectedCandidateId} 
            onBack={() => setActiveTab('list')}
          />
        </TabsContent>
        
        <TabsContent value="pools" className="space-y-6">
          <TalentPoolsTab />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <CandidateSecurityTab />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <CandidateReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}