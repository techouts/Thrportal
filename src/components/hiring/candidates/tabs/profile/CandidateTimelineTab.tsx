import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CandidateTimelineTabProps {
  candidateId: string;
}

export function CandidateTimelineTab({ candidateId }: CandidateTimelineTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Timeline for candidate {candidateId}</p>
      </CardContent>
    </Card>
  );
}