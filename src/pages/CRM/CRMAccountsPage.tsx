import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';

export default function CRMAccountsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts"
        description="Manage client accounts and sub-units"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Accounts Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Account management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}