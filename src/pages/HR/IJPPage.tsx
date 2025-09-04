import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { RBACGuard } from '@/components/guards/RBACGuard';

export default function HRIJPPage() {
  return (
    <RBACGuard permission="hr:ijp:manage" fallback={<div>Access denied</div>}>
      <div className="container mx-auto py-6 space-y-6">
        <PageHeader
          title="IJP Administration"
          description="Manage internal job postings, pipeline, and settings"
        />

        <Tabs defaultValue="postings" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="postings">Postings</TabsTrigger>
            <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="postings" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              IJP postings management coming soon.
            </div>
          </TabsContent>

          <TabsContent value="pipelines" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              Pipeline kanban coming soon.
            </div>
          </TabsContent>

          <TabsContent value="scheduling" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              Interview scheduling coming soon.
            </div>
          </TabsContent>

          <TabsContent value="offers" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              Offer management coming soon.
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              IJP reports coming soon.
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              IJP settings coming soon.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RBACGuard>
  );
}