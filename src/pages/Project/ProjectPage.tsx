import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { moduleRegistry } from '@/lib/moduleRegistry'

interface ProjectPageProps {
  defaultTab: string
}

export default function ProjectPage({ defaultTab }: ProjectPageProps) {
  const moduleSpec = moduleRegistry.getModuleSpec(`/Project/${defaultTab}`) || 
    moduleRegistry.registerModuleSpec(`/Project/${defaultTab}`, {
      brdStatus: 'draft',
      promptStatus: 'pending',
      description: `Project management - ${defaultTab}`
    })

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Projects - ${defaultTab}`}
        breadcrumbs={[
          { label: 'Projects', href: '/Project/Dashboard' },
          { label: defaultTab, href: `/Project/${defaultTab}` }
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