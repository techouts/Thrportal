import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { BarChart3, CheckCircle } from 'lucide-react'
import { TeamExpenseDashboardTab } from '@/components/expenses/manager/TeamExpenseDashboardTab'
import { TeamExpenseApprovalsTab } from '@/components/expenses/manager/TeamExpenseApprovalsTab'

export default function TeamExpensesPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Expenses"
        description="Review team expense claims, approve reimbursements, and track spending"
        breadcrumbs={[
          { label: 'My Team', href: '/MyTeam' },
          { label: 'Expenses', href: '/MyTeam/Expenses' }
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approvals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <TeamExpenseDashboardTab />
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <TeamExpenseApprovalsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}