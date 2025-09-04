import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { moduleRegistry } from '@/lib/moduleRegistry'

interface OrgPageProps {
  defaultTab: string
}

export default function OrgPage({ defaultTab }: OrgPageProps) {
  const moduleSpec = moduleRegistry.getModuleSpec(`/Org/${defaultTab}`) || 
    moduleRegistry.registerModuleSpec(`/Org/${defaultTab}`, {
      brdStatus: 'draft',
      promptStatus: 'pending',
      description: `Organization - ${defaultTab}`
    })

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Organization - ${defaultTab}`}
        breadcrumbs={[
          { label: 'Org', href: '/Org/EmployeeDirectory' },
          { label: defaultTab, href: `/Org/${defaultTab}` }
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