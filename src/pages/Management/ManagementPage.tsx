import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { moduleRegistry } from '@/lib/moduleRegistry'

interface ManagementPageProps {
  defaultTab: string
}

export default function ManagementPage({ defaultTab }: ManagementPageProps) {
  const moduleSpec = moduleRegistry.getModuleSpec(`/Management/${defaultTab}`) || 
    moduleRegistry.registerModuleSpec(`/Management/${defaultTab}`, {
      brdStatus: 'draft',
      promptStatus: 'pending',
      description: `Management - ${defaultTab}`
    })

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Management - ${defaultTab}`}
        breadcrumbs={[
          { label: 'Management', href: '/Management/Dashboard' },
          { label: defaultTab, href: `/Management/${defaultTab}` }
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