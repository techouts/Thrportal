import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { moduleRegistry } from '@/lib/moduleRegistry'

interface AdminPageProps {
  defaultTab: string
}

export default function AdminPage({ defaultTab }: AdminPageProps) {
  const moduleSpec = moduleRegistry.getModuleSpec(`/Admin/${defaultTab}`) || 
    moduleRegistry.registerModuleSpec(`/Admin/${defaultTab}`, {
      brdStatus: 'draft',
      promptStatus: 'pending',
      description: `Administration - ${defaultTab}`
    })

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Admin - ${defaultTab}`}
        breadcrumbs={[
          { label: 'Admin', href: '/Admin/Tenant' },
          { label: defaultTab, href: `/Admin/${defaultTab}` }
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