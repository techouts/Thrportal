import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function BankBatchList() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Bank Batch Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Bank batch list component</p>
      </CardContent>
    </Card>
  );
}