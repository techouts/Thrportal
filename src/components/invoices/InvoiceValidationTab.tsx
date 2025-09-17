import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Check, X, Eye, FileText, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
}

interface InvoiceForValidation {
  id: string;
  invoiceNumber: string;
  client: string;
  project: string;
  amount: number;
  currency: string;
  period: string;
  status: 'draft' | 'pre_check' | 'final_check' | 'approved' | 'rejected';
  validationStage: 'pre_check' | 'final_check';
  issues: ValidationIssue[];
  matchingData: {
    assignments: number;
    timesheets: number;
    sowCap: number;
    poBalance: number;
  };
}

export function InvoiceValidationTab() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const invoices: InvoiceForValidation[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      client: 'TechCorp Inc',
      project: 'E-commerce Platform',
      amount: 125000,
      currency: 'USD',
      period: 'Mar 2024',
      status: 'pre_check',
      validationStage: 'pre_check',
      issues: [
        {
          type: 'warning',
          message: 'Shadow resource billed without client approval',
          details: 'Employee John Doe (Shadow) has 40 hours billed but no client approval flag set'
        },
        {
          type: 'info',
          message: 'All regular assignments validated successfully'
        }
      ],
      matchingData: {
        assignments: 8,
        timesheets: 640,
        sowCap: 500000,
        poBalance: 125000
      }
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      client: 'StartupInc',
      project: 'Mobile App Development',
      amount: 75000,
      currency: 'USD',
      period: 'Mar 2024',
      status: 'final_check',
      validationStage: 'final_check',
      issues: [
        {
          type: 'error',
          message: 'PO balance exceeded',
          details: 'Invoice amount (75,000) exceeds remaining PO balance (50,000)'
        }
      ],
      matchingData: {
        assignments: 5,
        timesheets: 400,
        sowCap: 300000,
        poBalance: 50000
      }
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      client: 'RetailCorp',
      project: 'Data Analytics Platform',
      amount: 95000,
      currency: 'USD',
      period: 'Mar 2024',
      status: 'approved',
      validationStage: 'final_check',
      issues: [],
      matchingData: {
        assignments: 7,
        timesheets: 560,
        sowCap: 400000,
        poBalance: 95000
      }
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'pre_check':
        return <Badge variant="outline">Pre-Check</Badge>;
      case 'final_check':
        return <Badge variant="outline">Final Check</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleRunValidation = (invoiceId: string) => {
    toast({
      title: "Validation Started",
      description: `Running 3-point validation for invoice ${invoiceId}`,
    });
  };

  const handleApproveInvoice = (invoiceId: string) => {
    toast({
      title: "Invoice Approved",
      description: `Invoice ${invoiceId} has been approved for processing`,
    });
  };

  const handleRejectInvoice = (invoiceId: string) => {
    toast({
      title: "Invoice Rejected",
      description: `Invoice ${invoiceId} has been rejected and returned for revision`,
    });
  };

  const handleRequestOverride = (invoiceId: string) => {
    toast({
      title: "Override Requested",
      description: `Override request submitted for invoice ${invoiceId} - routed to Finance/Leadership`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Invoice Validation</h2>
          <p className="text-muted-foreground">3-point validation: Assignments vs Timesheets vs Invoice</p>
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pre_check">Pre-Check</SelectItem>
            <SelectItem value="final_check">Final Check</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Validation Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5" />
                      <h3 className="font-medium">{invoice.invoiceNumber}</h3>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      <p>{invoice.client} • {invoice.project}</p>
                      <p>{invoice.amount.toLocaleString()} {invoice.currency} • {invoice.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Validation Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-semibold">{invoice.matchingData.assignments}</p>
                    <p className="text-xs text-muted-foreground">Assignments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{invoice.matchingData.timesheets}h</p>
                    <p className="text-xs text-muted-foreground">Timesheet Hours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">
                      {((invoice.amount / invoice.matchingData.sowCap) * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">SOW Utilization</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">
                      {invoice.matchingData.poBalance.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">PO Balance</p>
                  </div>
                </div>

                {/* Validation Issues */}
                {invoice.issues.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">Validation Issues:</p>
                    {invoice.issues.map((issue, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded border ${getIssueColor(issue.type)}`}
                      >
                        <div className="flex items-start gap-2">
                          {getIssueIcon(issue.type)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{issue.message}</p>
                            {issue.details && (
                              <p className="text-xs mt-1 opacity-80">{issue.details}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t">
                  {invoice.status === 'pre_check' && (
                    <>
                      <Button size="sm" onClick={() => handleRunValidation(invoice.id)}>
                        <Clock className="h-4 w-4 mr-1" />
                        Run Final Check
                      </Button>
                      {invoice.issues.some(i => i.type === 'error' || i.type === 'warning') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRequestOverride(invoice.id)}
                        >
                          Request Override
                        </Button>
                      )}
                    </>
                  )}
                  
                  {invoice.status === 'final_check' && (
                    <>
                      {invoice.issues.filter(i => i.type === 'error').length === 0 ? (
                        <Button
                          size="sm"
                          onClick={() => handleApproveInvoice(invoice.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve Invoice
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRequestOverride(invoice.id)}
                        >
                          Request Override
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectInvoice(invoice.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}

                  {invoice.status === 'approved' && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Validation Complete
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}