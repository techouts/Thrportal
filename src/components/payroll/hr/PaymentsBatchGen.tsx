import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PaymentsBatchGen() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Payments Batch Generation</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Payments batch generation component</p>
      </CardContent>
    </Card>
  );
}