import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { Receipt, Upload, History } from 'lucide-react'
import { ExpenseSubmitTab } from '@/components/expenses/employee/ExpenseSubmitTab'
import { ExpenseImportsTab } from '@/components/expenses/employee/ExpenseImportsTab'
import { ExpenseHistoryTab } from '@/components/expenses/employee/ExpenseHistoryTab'

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState('submit')

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Expenses"
        description="Submit expense claims, import transactions, and track reimbursements"
        breadcrumbs={[
          { label: 'Me', href: '/Me' },
          { label: 'Expenses', href: '/Me/Expenses' }
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="submit" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Submit
          </TabsTrigger>
          <TabsTrigger value="imports" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Imports
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-6">
          <ExpenseSubmitTab />
        </TabsContent>

        <TabsContent value="imports" className="space-y-6">
          <ExpenseImportsTab />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <ExpenseHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}