import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FinancialsTab } from '@/components/reports/FinancialsTab';
import { UtilizationTab } from '@/components/reports/UtilizationTab';
import { BenchShadowTab } from '@/components/reports/BenchShadowTab';
import { ResourceBurnTab } from '@/components/reports/ResourceBurnTab';
import { TasksDeliveryTab } from '@/components/reports/TasksDeliveryTab';
import { CustomExportsTab } from '@/components/reports/CustomExportsTab';

export function ProjectReportsPage() {
  const [activeTab, setActiveTab] = useState('financials');

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Project Reports</h1>
          <p className="text-muted-foreground">Comprehensive analytics and reporting hub</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="utilization">Utilization</TabsTrigger>
            <TabsTrigger value="bench-shadow">Bench & Shadow</TabsTrigger>
            <TabsTrigger value="resource-burn">Resource Burn</TabsTrigger>
            <TabsTrigger value="tasks-delivery">Tasks & Delivery</TabsTrigger>
            <TabsTrigger value="custom-exports">Custom Exports</TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-6">
            <TabsContent value="financials" className="h-full">
              <FinancialsTab />
            </TabsContent>
            
            <TabsContent value="utilization" className="h-full">
              <UtilizationTab />
            </TabsContent>
            
            <TabsContent value="bench-shadow" className="h-full">
              <BenchShadowTab />
            </TabsContent>
            
            <TabsContent value="resource-burn" className="h-full">
              <ResourceBurnTab />
            </TabsContent>
            
            <TabsContent value="tasks-delivery" className="h-full">
              <TasksDeliveryTab />
            </TabsContent>
            
            <TabsContent value="custom-exports" className="h-full">
              <CustomExportsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}