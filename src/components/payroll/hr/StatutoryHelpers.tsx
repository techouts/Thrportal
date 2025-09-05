import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StatutoryHelpers() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Statutory Helpers</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Statutory helpers component</p>
      </CardContent>
    </Card>
  );
}