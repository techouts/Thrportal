import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MSATab } from '@/components/contracts/MSATab';
import { SOWTab } from '@/components/contracts/SOWTab';
import { PurchaseOrderTab } from '@/components/contracts/PurchaseOrderTab';
import { ContractDashboardTab } from '@/components/contracts/ContractDashboardTab';

export function CRMContractsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Contract Management</h1>
          <p className="text-muted-foreground">Source of truth for MSAs, SOWs, and Purchase Orders</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="msa">MSAs</TabsTrigger>
            <TabsTrigger value="sow">SOWs</TabsTrigger>
            <TabsTrigger value="po">Purchase Orders</TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-6">
            <TabsContent value="dashboard" className="h-full">
              <ContractDashboardTab />
            </TabsContent>
            
            <TabsContent value="msa" className="h-full">
              <MSATab />
            </TabsContent>
            
            <TabsContent value="sow" className="h-full">
              <SOWTab />
            </TabsContent>
            
            <TabsContent value="po" className="h-full">
              <PurchaseOrderTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}