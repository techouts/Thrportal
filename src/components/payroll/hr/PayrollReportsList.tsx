import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PayrollReportsList() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Payroll Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Payroll reports component</p>
      </CardContent>
    </Card>
  );
}