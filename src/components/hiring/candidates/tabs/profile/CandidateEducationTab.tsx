import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CandidateEducationTabProps {
  candidateId: string;
}

export function CandidateEducationTab({ candidateId }: CandidateEducationTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Education details for candidate {candidateId}</p>
      </CardContent>
    </Card>
  );
}