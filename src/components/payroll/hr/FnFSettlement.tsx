import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function FnFSettlement() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>F&F Settlement</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">F&F settlement component</p>
      </CardContent>
    </Card>
  );
}