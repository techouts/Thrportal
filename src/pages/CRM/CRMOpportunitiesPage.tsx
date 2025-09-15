import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';

export default function CRMOpportunitiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunities"
        description="Track business opportunities and growth potential"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Opportunities Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Opportunities management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}