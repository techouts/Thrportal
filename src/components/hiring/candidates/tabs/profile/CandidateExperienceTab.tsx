import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CandidateExperienceTabProps {
  candidateId: string;
}

export function CandidateExperienceTab({ candidateId }: CandidateExperienceTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Experience</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Experience details for candidate {candidateId}</p>
      </CardContent>
    </Card>
  );
}