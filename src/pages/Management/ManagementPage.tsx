import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { moduleRegistry } from '@/lib/moduleRegistry'
import { PrimaryFollowUpQueue } from '@/components/hiring/ownership/tabs/PrimaryFollowUpQueue'
import { EscalationsTab } from '@/components/hiring/ownership/tabs/EscalationsTab'

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
        title="Management"
        breadcrumbs={[
          { label: 'Management', href: '/Management/Dashboard' },
          { label: defaultTab, href: `/Management/${defaultTab}` }
        ]}
        moduleSpec={moduleSpec}
      />

      <Tabs defaultValue={defaultTab.toLowerCase()} className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="primaryqueues">Primary Queues</TabsTrigger>
          <TabsTrigger value="escalations">Escalations</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Management dashboard overview will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="primaryqueues">
          <PrimaryFollowUpQueue />
        </TabsContent>

        <TabsContent value="escalations">
          <EscalationsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}