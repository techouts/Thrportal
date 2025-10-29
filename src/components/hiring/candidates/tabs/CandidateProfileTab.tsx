import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Briefcase, GraduationCap, FileText, MessageSquare, Clock, Shield } from 'lucide-react';
import { candidatesService } from '@/services/candidatesService';
import { CandidateProfile } from '@/types/candidates';
import { CandidateOverviewTab } from './profile/CandidateOverviewTab';
import { CandidateExperienceTab } from './profile/CandidateExperienceTab';
import { CandidateEducationTab } from './profile/CandidateEducationTab';
import { CandidateDocumentsTab } from './profile/CandidateDocumentsTab';
import { CandidateCommunicationTab } from './profile/CandidateCommunicationTab';
import { CandidateTimelineTab } from './profile/CandidateTimelineTab';
import { CandidateComplianceTab } from './profile/CandidateComplianceTab';

import { CandidateClientResumesTab } from './profile/CandidateClientResumesTab';

interface CandidateProfileTabProps {
  candidateId: string | null;
  onBack: () => void;
}

export function CandidateProfileTab({ candidateId, onBack }: CandidateProfileTabProps) {
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (candidateId) {
      loadCandidate();
    }
  }, [candidateId]);

  const loadCandidate = async () => {
    if (!candidateId) return;
    
    setLoading(true);
    try {
      const data = await candidatesService.getCandidateById(candidateId);
      setCandidate(data);
    } catch (error) {
      console.error('Failed to load candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!candidateId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a candidate to view their profile</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading candidate profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!candidate) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Candidate not found</p>
            <Button variant="outline" onClick={onBack} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to List
              </Button>
              <div>
                <h2 className="text-2xl font-bold">{candidate.name}</h2>
                <p className="text-muted-foreground">{candidate.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={candidate.status === 'Joined' ? 'default' : 
                            candidate.status === 'Rejected' ? 'destructive' : 'secondary'}>
                {candidate.status}
              </Badge>
              <Badge variant="outline">{candidate.source}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8 gap-1">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Experience
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="client-resumes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Client Resumes
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Communication
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <CandidateOverviewTab candidate={candidate} />
        </TabsContent>

        <TabsContent value="experience">
          <CandidateExperienceTab candidateId={candidate.id} />
        </TabsContent>

        <TabsContent value="education">
          <CandidateEducationTab candidateId={candidate.id} />
        </TabsContent>

        <TabsContent value="documents">
          <CandidateDocumentsTab candidateId={candidate.id} />
        </TabsContent>

        <TabsContent value="client-resumes">
          <CandidateClientResumesTab candidateId={candidate.id} />
        </TabsContent>

        <TabsContent value="communication">
          <CandidateCommunicationTab candidateId={candidate.id} />
        </TabsContent>

        <TabsContent value="timeline">
          <CandidateTimelineTab candidateId={candidate.id} />
        </TabsContent>

        <TabsContent value="compliance">
          <CandidateComplianceTab candidate={candidate} />
        </TabsContent>

      </Tabs>
    </div>
  );
}