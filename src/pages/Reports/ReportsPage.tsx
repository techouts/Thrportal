import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { moduleRegistry } from '@/lib/moduleRegistry'

interface ReportsPageProps {
  defaultTab: string
}

export default function ReportsPage({ defaultTab }: ReportsPageProps) {
  const moduleSpec = moduleRegistry.getModuleSpec(`/Reports/${defaultTab}`) || 
    moduleRegistry.registerModuleSpec(`/Reports/${defaultTab}`, {
      brdStatus: 'draft',
      promptStatus: 'pending',
      description: `Reports - ${defaultTab}`
    })

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Reports - ${defaultTab}`}
        breadcrumbs={[
          { label: 'Reports', href: '/Reports/Mine' },
          { label: defaultTab, href: `/Reports/${defaultTab}` }
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