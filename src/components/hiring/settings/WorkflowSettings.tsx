import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApprovalRulesTab } from './ApprovalRulesTab'
import { FeedbackFollowupsTab } from './FeedbackFollowupsTab'
import { SLATab } from './SLATab'
import { PipelineSettingsTab } from '@/components/hiring/pipeline/PipelineSettingsTab'
import { CheckSquare, MessageSquare, Clock, GitBranch } from 'lucide-react'

interface WorkflowSettingsProps {
  activeSubTab?: string
}

export function WorkflowSettings({ activeSubTab }: WorkflowSettingsProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(activeSubTab || 'approvals')

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    navigate(`/Hiring/Settings/workflow/${value}`)
  }

  const subTabs = [
    { id: 'approvals', label: 'Approvals', icon: CheckSquare },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'sla', label: 'SLA', icon: Clock },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Workflow Configuration</h3>
        <p className="text-muted-foreground">
          Configure approval workflows, SLA timers, feedback processes, and pipeline controls
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          {subTabs.map(tab => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="approvals" className="space-y-6">
          <ApprovalRulesTab />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <FeedbackFollowupsTab />
        </TabsContent>

        <TabsContent value="sla" className="space-y-6">
          <SLATab />
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <PipelineSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}