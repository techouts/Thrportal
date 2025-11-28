import { PageHeader } from '@/components/shared/PageHeader'
import { HiringDashboard } from '@/components/hiring/HiringDashboard'
import { JobRequisitionsModule } from '@/components/hiring/requisitions/JobRequisitionsModule'

import { ApplicationsModule } from '@/components/hiring/applications/ApplicationsModule'
import { PipelineModule } from '@/components/hiring/pipeline/PipelineModule'

import { JDManagementModule } from '@/components/hiring/jds/JDManagementModule'
import { ApprovalsModule } from '@/components/hiring/approvals/ApprovalsModule'
import { CandidatesModule } from '@/components/hiring/candidates/CandidatesModule'
import { OwnershipModule } from '@/components/hiring/ownership/OwnershipModule'
import { Card, CardContent } from '@/components/ui/card'

interface HiringPageProps {
  defaultTab: string
}

export default function HiringPage({ defaultTab }: HiringPageProps) {
  switch (defaultTab) {
    case 'Dashboard':
      return <HiringDashboard />
    case 'JobRequisitions':
      // Legacy - redirect to JDs
      return <JDManagementModule />
    case 'JDs':
      return <JDManagementModule />
    case 'Approvals':
      return <ApprovalsModule />
    case 'Candidates':
      return <CandidatesModule />
    case 'Ownership':
      return <OwnershipModule />
    case 'Assignment':
      // Redirect to Ownership - this case should not be reached due to routing
      return <OwnershipModule />
    case 'Applications':
      return <ApplicationsModule />
    case 'Pipeline':
      return <PipelineModule />
    case 'Settings':
      // Redirect to new settings structure
      return (
        <Card>
          <CardContent className="pt-6">
            <PageHeader
              title="Settings Moved"
              description="Hiring Settings have been reorganized. Please use the new Settings navigation."
            />
          </CardContent>
        </Card>
      )
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