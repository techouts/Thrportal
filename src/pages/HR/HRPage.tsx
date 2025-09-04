import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { moduleRegistry } from '@/lib/moduleRegistry'

interface HRPageProps {
  defaultTab: string
}

export default function HRPage({ defaultTab }: HRPageProps) {
  const moduleSpec = moduleRegistry.getModuleSpec(`/HR/${defaultTab}`) || 
    moduleRegistry.registerModuleSpec(`/HR/${defaultTab}`, {
      brdStatus: 'draft',
      promptStatus: 'pending',
      description: `HR management - ${defaultTab}`
    })

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`HR - ${defaultTab}`}
        breadcrumbs={[
          { label: 'HR', href: '/HR/Performance' },
          { label: defaultTab, href: `/HR/${defaultTab}` }
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