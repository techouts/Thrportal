import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PayrollMastersManager() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Masters Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Masters manager component</p>
      </CardContent>
    </Card>
  );
}