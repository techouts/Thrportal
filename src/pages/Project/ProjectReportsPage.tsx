import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FinancialsTab } from '@/components/reports/FinancialsTab';
import { UtilizationTab } from '@/components/reports/UtilizationTab';
import { BenchShadowTab } from '@/components/reports/BenchShadowTab';
import { ResourceBurnTab } from '@/components/reports/ResourceBurnTab';
import { TasksDeliveryTab } from '@/components/reports/TasksDeliveryTab';
import { CustomExportsTab } from '@/components/reports/CustomExportsTab';
import { useIsMobile } from '@/hooks/use-mobile';

const reportTabs = [
  { value: 'financials', label: 'Financials' },
  { value: 'utilization', label: 'Utilization' },
  { value: 'bench-shadow', label: 'Bench & Shadow' },
  { value: 'resource-burn', label: 'Resource Burn' },
  { value: 'tasks-delivery', label: 'Tasks & Delivery' },
  { value: 'custom-exports', label: 'Custom Exports' },
];

export function ProjectReportsPage() {
  const [activeTab, setActiveTab] = useState('financials');
  const isMobile = useIsMobile();

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none space-y-4 md:space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Project Reports</h1>
          <p className="text-muted-foreground text-sm md:text-base">Comprehensive analytics and reporting hub</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          {/* Mobile: Dropdown navigation */}
          {isMobile ? (
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Report" />
              </SelectTrigger>
              <SelectContent>
                {reportTabs.map((tab) => (
                  <SelectItem key={tab.value} value={tab.value}>
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            /* Desktop: Tab list */
            <TabsList className="grid w-full grid-cols-6">
              {reportTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          )}

          <div className="flex-1 mt-4 md:mt-6">
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