import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ReconcileTable() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Reconciliation</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Reconciliation table component</p>
      </CardContent>
    </Card>
  );
}