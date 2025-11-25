import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  CheckCircle2, 
  Lock, 
  Plus, 
  Eye, 
  Clock,
  Users,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { usePayrollRunStore } from '@/stores/payrollStore';
import { PayrollRun } from '@/services/payrollService';
import { toast } from 'sonner';

interface PayrollRunsTableProps {
  runs: PayrollRun[];
}

export function PayrollRunsTable({ runs }: PayrollRunsTableProps) {
  const [newRunPeriod, setNewRunPeriod] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { createRun, simulateRun, validateRun, approveRun, lockRun, loading } = usePayrollRunStore();

  const handleCreateRun = async () => {
    if (!newRunPeriod) {
      toast.error('Please enter a valid period');
      return;
    }

    try {
      await createRun(newRunPeriod);
      setShowCreateDialog(false);
      setNewRunPeriod('');
      toast.success('Payroll run created successfully');
    } catch (error) {
      toast.error('Failed to create payroll run');
    }
  };

  const handleAction = async (action: string, runId: string) => {
    try {
      switch (action) {
        case 'simulate':
          await simulateRun(runId);
          toast.success('Payroll simulation completed');
          break;
        case 'validate':
          await validateRun(runId);
          toast.success('Payroll validation completed');
          break;
        case 'approve':
          await approveRun(runId);
          toast.success('Payroll run approved');
          break;
        case 'lock':
          await lockRun(runId);
          toast.success('Payroll run locked');
          break;
      }
    } catch (error) {
      toast.error(`Failed to ${action} payroll run`);
    }
  };

  const getStatusColor = (status: PayrollRun['status']) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'LOCKED': return 'bg-blue-100 text-blue-800';
      case 'APPROVED': return 'bg-purple-100 text-purple-800';
      case 'VALIDATED': return 'bg-orange-100 text-orange-800';
      case 'SIMULATED': return 'bg-yellow-100 text-yellow-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: PayrollRun['status']) => {
    switch (status) {
      case 'PAID': return <CheckCircle2 className="w-3 h-3" />;
      case 'LOCKED': return <Lock className="w-3 h-3" />;
      case 'APPROVED': return <CheckCircle2 className="w-3 h-3" />;
      case 'VALIDATED': return <AlertTriangle className="w-3 h-3" />;
      case 'SIMULATED': return <Play className="w-3 h-3" />;
      case 'DRAFT': return <Clock className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getAvailableActions = (status: PayrollRun['status']) => {
    switch (status) {
      case 'DRAFT': return ['simulate'];
      case 'SIMULATED': return ['validate'];
      case 'VALIDATED': return ['approve'];
      case 'APPROVED': return ['lock'];
      default: return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payroll Runs</h2>
          <p className="text-muted-foreground">Create and manage payroll processing cycles</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Run
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Payroll Run</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="period">Period (YYYY-MM)</Label>
                <Input
                  id="period"
                  placeholder="2024-04"
                  value={newRunPeriod}
                  onChange={(e) => setNewRunPeriod(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRun} disabled={loading}>
                  Create Run
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Payroll Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Gross Amount</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Exceptions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => (
                <TableRow key={run.id}>
                  <TableCell className="font-medium">{run.period}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(run.status)}>
                      {getStatusIcon(run.status)}
                      <span className="ml-1">{run.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {run.employeeCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      ₹{(run.totalGross / 10000000).toFixed(1)}Cr
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      ₹{(run.totalNet / 10000000).toFixed(1)}Cr
                    </div>
                  </TableCell>
                  <TableCell>
                    {run.exceptionCount > 0 ? (
                      <Badge variant="destructive" className="text-xs">
                        {run.exceptionCount}
                      </Badge>
                    ) : (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        0
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(run.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3" />
                      </Button>
                      {getAvailableActions(run.status).map((action) => (
                        <Button
                          key={action}
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(action, run.id)}
                          disabled={loading}
                        >
                          {action === 'simulate' && <Play className="w-3 h-3" />}
                          {action === 'validate' && <CheckCircle2 className="w-3 h-3" />}
                          {action === 'approve' && <CheckCircle2 className="w-3 h-3" />}
                          {action === 'lock' && <Lock className="w-3 h-3" />}
                          <span className="ml-1 capitalize">{action}</span>
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {runs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="w-8 h-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No payroll runs found</p>
                      <p className="text-sm text-muted-foreground">Create your first payroll run to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {loading && (
        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing payroll run...</span>
                <span>Please wait</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}