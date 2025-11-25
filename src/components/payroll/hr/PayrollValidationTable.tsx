import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, User, CreditCard, Calculator, Eye } from 'lucide-react';
import { ExceptionBucket } from '@/stores/payrollStore';

interface PayrollValidationTableProps {
  exceptions: ExceptionBucket;
}

export function PayrollValidationTable({ exceptions }: PayrollValidationTableProps) {
  const getSeverityColor = (severity: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (severity) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-orange-100 text-orange-800';
      case 'LOW': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MISSING_PAN': return <User className="w-4 h-4" />;
      case 'INVALID_BANK': return <CreditCard className="w-4 h-4" />;
      case 'NEGATIVE_NET': return <Calculator className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const totalExceptions = Object.values(exceptions).flat().length;

  if (totalExceptions === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Payroll Validation</h2>
          <p className="text-muted-foreground">Review and resolve payroll exceptions</p>
        </div>

        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-green-600" />
                </div>
                <p className="font-medium">No validation issues found</p>
                <p className="text-sm text-muted-foreground">All payroll data is valid and ready for processing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payroll Validation</h2>
          <p className="text-muted-foreground">Review and resolve payroll exceptions</p>
        </div>
        <Badge variant="destructive" className="text-sm">
          {totalExceptions} Exception{totalExceptions !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{exceptions.missingPan.length}</p>
                <p className="text-xs text-muted-foreground">Missing PAN</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{exceptions.invalidBank.length}</p>
                <p className="text-xs text-muted-foreground">Invalid Bank</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{exceptions.negativeNet.length}</p>
                <p className="text-xs text-muted-foreground">Negative Net</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{exceptions.validationErrors.length}</p>
                <p className="text-xs text-muted-foreground">Other Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Exceptions ({totalExceptions})</TabsTrigger>
          <TabsTrigger value="missing-pan">Missing PAN ({exceptions.missingPan.length})</TabsTrigger>
          <TabsTrigger value="invalid-bank">Invalid Bank ({exceptions.invalidBank.length})</TabsTrigger>
          <TabsTrigger value="negative-net">Negative Net ({exceptions.negativeNet.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>All Validation Exceptions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(exceptions).flat().map((exception) => (
                    <TableRow key={exception.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(exception.type)}
                          <span className="text-sm">{exception.type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{exception.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{exception.employeeId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{exception.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getSeverityColor(exception.severity)}>
                          {exception.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missing-pan">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Missing PAN Exceptions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exceptions.missingPan.map((exception) => (
                    <TableRow key={exception.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{exception.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{exception.employeeId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{exception.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getSeverityColor(exception.severity)}>
                          {exception.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invalid-bank">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Invalid Bank Exceptions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exceptions.invalidBank.map((exception) => (
                    <TableRow key={exception.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{exception.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{exception.employeeId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{exception.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getSeverityColor(exception.severity)}>
                          {exception.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="negative-net">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Negative Net Salary Exceptions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exceptions.negativeNet.map((exception) => (
                    <TableRow key={exception.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{exception.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{exception.employeeId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{exception.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getSeverityColor(exception.severity)}>
                          {exception.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}