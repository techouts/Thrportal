import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CandidateCommunicationTabProps {
  candidateId: string;
}

export function CandidateCommunicationTab({ candidateId }: CandidateCommunicationTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication History</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Communication history for candidate {candidateId}</p>
      </CardContent>
    </Card>
  );
}