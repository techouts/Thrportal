import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ComplianceTables() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Compliance Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Compliance tables component</p>
      </CardContent>
    </Card>
  );
}