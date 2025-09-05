import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function JVExportConfig() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>JV Export Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Journal voucher export component</p>
      </CardContent>
    </Card>
  );
}