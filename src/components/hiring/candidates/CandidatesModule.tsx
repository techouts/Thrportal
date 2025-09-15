import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';

export function CandidatesModule() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidates & Resumes"
        description="Manage candidate profiles, resumes, and applications"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Candidates Module</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Candidates management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}