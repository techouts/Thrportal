import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CandidateDocumentsTabProps {
  candidateId: string;
}

export function CandidateDocumentsTab({ candidateId }: CandidateDocumentsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Documents for candidate {candidateId}</p>
      </CardContent>
    </Card>
  );
}