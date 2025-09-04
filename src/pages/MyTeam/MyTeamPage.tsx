import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { moduleRegistry } from '@/lib/moduleRegistry'

interface MyTeamPageProps {
  defaultTab: string
}

export default function MyTeamPage({ defaultTab }: MyTeamPageProps) {
  const moduleSpec = moduleRegistry.getModuleSpec(`/MyTeam/${defaultTab}`) || 
    moduleRegistry.registerModuleSpec(`/MyTeam/${defaultTab}`, {
      brdStatus: 'draft',
      promptStatus: 'pending',
      description: `Team management - ${defaultTab}`
    })

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`My Team - ${defaultTab}`}
        breadcrumbs={[
          { label: 'My Team', href: '/MyTeam/Dashboard' },
          { label: defaultTab, href: `/MyTeam/${defaultTab}` }
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