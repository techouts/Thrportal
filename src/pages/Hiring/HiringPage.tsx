import { PageHeader } from '@/components/shared/PageHeader'
import { HiringDashboard } from '@/components/hiring/HiringDashboard'
import { JobRequisitionsModule } from '@/components/hiring/requisitions/JobRequisitionsModule'
import { AssignmentModule } from '@/components/hiring/assignment/AssignmentModule'
import { ApplicationsModule } from '@/components/hiring/applications/ApplicationsModule'
import { PipelineModule } from '@/components/hiring/pipeline/PipelineModule'
import { FollowupModule } from '@/components/hiring/followup/FollowupModule'
import BGVPage from './BGVPage'
import HiringSettingsPage from './HiringSettingsPage'
import { Card, CardContent } from '@/components/ui/card'

interface HiringPageProps {
  defaultTab: string
}

export default function HiringPage({ defaultTab }: HiringPageProps) {
  switch (defaultTab) {
    case 'Dashboard':
      return <HiringDashboard />
    case 'JobRequisitions':
      return <JobRequisitionsModule />
    case 'Assignment':
      return <AssignmentModule />
    case 'Applications':
      return <ApplicationsModule />
    case 'Pipeline':
      return <PipelineModule />
    case 'FollowUp':
      return <FollowupModule />
    case 'BGV':
      return <BGVPage />
    case 'Settings':
      return <HiringSettingsPage />
    default:
      return (
        <Card>
          <CardContent className="pt-6">
            <PageHeader
              title={`${defaultTab} Module`}
              description="Module content will be implemented here"
            />
          </CardContent>
        </Card>
      )
  }
}