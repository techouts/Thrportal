import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function IntegrationConfig() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Integration Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Integration config component</p>
      </CardContent>
    </Card>
  );
}