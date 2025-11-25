import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AuditLogViewer() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Audit log viewer component</p>
      </CardContent>
    </Card>
  );
}