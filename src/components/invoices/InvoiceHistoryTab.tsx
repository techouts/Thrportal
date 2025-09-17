import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Eye, FileText, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvoiceHistoryItem {
  id: string;
  invoiceNumber: string;
  client: string;
  project: string;
  amount: number;
  currency: string;
  period: string;
  status: 'approved' | 'paid' | 'rejected';
  submittedDate: string;
  approvedDate?: string;
  paidDate?: string;
  validationResults: {
    preCheckPassed: boolean;
    finalCheckPassed: boolean;
    overrideApplied: boolean;
  };
  poReference?: string;
  sowReference?: string;
}

export function InvoiceHistoryTab() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('last_30_days');

  const invoiceHistory: InvoiceHistoryItem[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      client: 'TechCorp Inc',
      project: 'E-commerce Platform',
      amount: 125000,
      currency: 'USD',
      period: 'Mar 2024',
      status: 'paid',
      submittedDate: '2024-04-01',
      approvedDate: '2024-04-03',
      paidDate: '2024-04-15',
      validationResults: {
        preCheckPassed: true,
        finalCheckPassed: true,
        overrideApplied: false
      },
      poReference: 'PO-2024-0001',
      sowReference: 'SOW-ECOMMERCE-001'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      client: 'StartupInc',
      project: 'Mobile App Development',
      amount: 75000,
      currency: 'USD',
      period: 'Mar 2024',
      status: 'approved',
      submittedDate: '2024-04-02',
      approvedDate: '2024-04-05',
      validationResults: {
        preCheckPassed: false,
        finalCheckPassed: true,
        overrideApplied: true
      },
      poReference: 'PO-2024-0002',
      sowReference: 'SOW-MOBILE-001'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      client: 'RetailCorp',
      project: 'Data Analytics Platform',
      amount: 95000,
      currency: 'USD',
      period: 'Feb 2024',
      status: 'rejected',
      submittedDate: '2024-03-01',
      validationResults: {
        preCheckPassed: false,
        finalCheckPassed: false,
        overrideApplied: false
      },
      sowReference: 'SOW-ANALYTICS-001'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'paid':
        return <Badge variant="outline" className="border-green-500 text-green-700">Paid</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    toast({
      title: "View Invoice",
      description: `Opening invoice details for ${invoiceId}`,
    });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Download Started",
      description: `Downloading invoice ${invoiceId}`,
    });
  };

  const handleExportHistory = () => {
    toast({
      title: "Export Started",
      description: "Generating invoice history export...",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Invoice History</h2>
          <p className="text-muted-foreground">Track processed invoices and their validation results</p>
        </div>
        <Button onClick={handleExportHistory} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export History
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="techcorp">TechCorp Inc</SelectItem>
                <SelectItem value="startup">StartupInc</SelectItem>
                <SelectItem value="retail">RetailCorp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                <SelectItem value="last_year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Apply Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">$2.1M</p>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">92%</p>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-green-500 rounded-full" />
              <div>
                <p className="text-2xl font-bold">18</p>
                <p className="text-sm text-muted-foreground">Paid This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History ({invoiceHistory.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoiceHistory.map((invoice) => (
              <div key={invoice.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{invoice.invoiceNumber}</h3>
                      {getStatusBadge(invoice.status)}
                      {invoice.validationResults.overrideApplied && (
                        <Badge variant="outline" className="text-orange-600">Override Applied</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>{invoice.client} • {invoice.project}</p>
                      <p>Period: {invoice.period}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {invoice.amount.toLocaleString()} {invoice.currency}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted: {invoice.submittedDate}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 p-3 bg-muted/50 rounded">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Validation Results</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${invoice.validationResults.preCheckPassed ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span>Pre-Check</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${invoice.validationResults.finalCheckPassed ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span>Final Check</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">References</p>
                    <div className="space-y-1 text-xs">
                      {invoice.poReference && <p>PO: {invoice.poReference}</p>}
                      {invoice.sowReference && <p>SOW: {invoice.sowReference}</p>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                    <div className="space-y-1 text-xs">
                      {invoice.approvedDate && <p>Approved: {invoice.approvedDate}</p>}
                      {invoice.paidDate && <p>Paid: {invoice.paidDate}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewInvoice(invoice.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvoice(invoice.id)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}