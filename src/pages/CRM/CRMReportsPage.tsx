import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';

export default function CRMReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="CRM analytics and performance reports"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>CRM Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            CRM reporting functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}