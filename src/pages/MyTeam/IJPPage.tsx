import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { RBACGuard } from '@/components/guards/RBACGuard';

export default function MyTeamIJPPage() {
  return (
    <RBACGuard permission="team:view" fallback={<div>Access denied</div>}>
      <div className="container mx-auto py-6 space-y-6">
        <PageHeader
          title="Team IJP Management"
          description="Manage your team's internal job applications and provide feedback"
        />

        <Tabs defaultValue="applications" className="w-full">
          <TabsList>
            <TabsTrigger value="applications">Team Applications</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="feedback">Feedback Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              Team applications view coming soon.
            </div>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              Approval queue coming soon.
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              Feedback tasks coming soon.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RBACGuard>
  );
}