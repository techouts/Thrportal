import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { DashboardTab } from './DashboardTab'
import { AllSubmissionsTab } from './AllSubmissionsTab'
import { PendingFeedbackTab } from './PendingFeedbackTab'
import { FollowupHistoryTab } from './FollowupHistoryTab'
import { EscalationReportsTab } from './EscalationReportsTab'
import { EmailUploadTab } from './EmailUploadTab'
import { moduleRegistry } from '@/lib/moduleRegistry'

export function FollowupModule() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const moduleSpec = moduleRegistry.getModuleSpec('/Hiring/Followup') || 
    moduleRegistry.registerModuleSpec('/Hiring/Followup', {
      brdStatus: 'draft',
      promptStatus: 'pending',
      description: 'Follow-up management for tracking submissions and client feedback'
    })

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Follow-up"
        icon={MessageCircle}
        breadcrumbs={[
          { label: 'Hiring', href: '/Hiring/Dashboard' },
          { label: 'Follow-up', href: '/Hiring/Followup' }
        ]}
        moduleSpec={moduleSpec}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="all-submissions">All Submissions</TabsTrigger>
          <TabsTrigger value="pending-feedback">Pending Feedback</TabsTrigger>
          <TabsTrigger value="history">Follow-up History</TabsTrigger>
          <TabsTrigger value="escalations">Escalation Reports</TabsTrigger>
          <TabsTrigger value="email-upload">Smart Email Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <DashboardTab />
        </TabsContent>

        <TabsContent value="all-submissions" className="space-y-6">
          <AllSubmissionsTab />
        </TabsContent>

        <TabsContent value="pending-feedback" className="space-y-6">
          <PendingFeedbackTab />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <FollowupHistoryTab />
        </TabsContent>

        <TabsContent value="escalations" className="space-y-6">
          <EscalationReportsTab />
        </TabsContent>

        <TabsContent value="email-upload" className="space-y-6">
          <EmailUploadTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}