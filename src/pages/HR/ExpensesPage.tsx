import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { FolderOpen, DollarSign, GitBranch, Archive } from 'lucide-react'
import { ExpenseCategoriesTab } from '@/components/expenses/hr/ExpenseCategoriesTab'
import { ExpenseLimitsTab } from '@/components/expenses/hr/ExpenseLimitsTab'
import { ExpenseApprovalMatrixTab } from '@/components/expenses/hr/ExpenseApprovalMatrixTab'
import { ExpenseRetentionTab } from '@/components/expenses/hr/ExpenseRetentionTab'

export default function HRExpensesPage() {
  const [activeTab, setActiveTab] = useState('categories')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Management"
        description="Configure expense policies, approval workflows, and compliance settings"
        breadcrumbs={[
          { label: 'HR', href: '/HR' },
          { label: 'Expenses', href: '/HR/Expenses' }
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="limits" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Limits
          </TabsTrigger>
          <TabsTrigger value="approval-matrix" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Approval Matrix
          </TabsTrigger>
          <TabsTrigger value="retention" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Retention
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          <ExpenseCategoriesTab />
        </TabsContent>

        <TabsContent value="limits" className="space-y-6">
          <ExpenseLimitsTab />
        </TabsContent>

        <TabsContent value="approval-matrix" className="space-y-6">
          <ExpenseApprovalMatrixTab />
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <ExpenseRetentionTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}