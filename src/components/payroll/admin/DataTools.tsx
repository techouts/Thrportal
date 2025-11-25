import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DataTools() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Data Management Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Data tools component</p>
      </CardContent>
    </Card>
  );
}