import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CandidateOfferTabProps {
  candidateId: string;
}

export function CandidateOfferTab({ candidateId }: CandidateOfferTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Offer Details</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Offer information for candidate {candidateId}</p>
      </CardContent>
    </Card>
  );
}