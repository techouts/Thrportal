import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvoiceUploadTab } from '@/components/invoices/InvoiceUploadTab';
import { InvoiceValidationTab } from '@/components/invoices/InvoiceValidationTab';
import { InvoiceHistoryTab } from '@/components/invoices/InvoiceHistoryTab';

export function FinanceInvoicesPage() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Invoice Management</h1>
          <p className="text-muted-foreground">Upload, validate and track invoices with 3-point validation</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload & Parse</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-6">
            <TabsContent value="upload" className="h-full">
              <InvoiceUploadTab />
            </TabsContent>
            
            <TabsContent value="validation" className="h-full">
              <InvoiceValidationTab />
            </TabsContent>
            
            <TabsContent value="history" className="h-full">
              <InvoiceHistoryTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}