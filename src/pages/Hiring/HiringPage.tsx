import { PageHeader } from '@/components/shared/PageHeader'
import { HiringDashboard } from '@/components/hiring/HiringDashboard'
import { JobRequisitionsModule } from '@/components/hiring/requisitions/JobRequisitionsModule'
import { AssignmentModule } from '@/components/hiring/assignment/AssignmentModule'
import { ApplicationsModule } from '@/components/hiring/applications/ApplicationsModule'
import { PipelineModule } from '@/components/hiring/pipeline/PipelineModule'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { moduleRegistry } from '@/lib/moduleRegistry'

interface HiringPageProps {
  defaultTab: string
}

export default function HiringPage({ defaultTab }: HiringPageProps) {
  const moduleSpec = moduleRegistry.getModuleSpec(`/Hiring/${defaultTab}`) || 
    moduleRegistry.registerModuleSpec(`/Hiring/${defaultTab}`, {
      brdStatus: 'draft',
      promptStatus: 'pending',
      description: `Hiring management - ${defaultTab}`
    })

  if (defaultTab === 'Dashboard') {
    return <HiringDashboard />
  }

  if (defaultTab === 'JobRequisitions') {
    return <JobRequisitionsModule />
  }

  if (defaultTab === 'Assignment') {
    return <AssignmentModule />
  }

  if (defaultTab === 'Applications') {
    return <ApplicationsModule />
  }

  if (defaultTab === 'Pipeline') {
    return <PipelineModule />
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Hiring - ${defaultTab}`}
        breadcrumbs={[
          { label: 'Hiring', href: '/Hiring/Dashboard' },
          { label: defaultTab, href: `/Hiring/${defaultTab}` }
        ]}
        moduleSpec={moduleSpec}
      />

      <Card>
        <CardHeader>
          <CardTitle>{defaultTab}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {defaultTab} functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}