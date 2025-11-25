import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PayrollApprovalsList() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Payroll Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Payroll approvals component</p>
      </CardContent>
    </Card>
  );
}