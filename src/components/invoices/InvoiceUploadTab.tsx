import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Check, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParsedInvoice {
  id: string;
  fileName: string;
  status: 'parsing' | 'success' | 'failed';
  parsedData?: {
    invoiceNumber: string;
    amount: number;
    currency: string;
    poReference?: string;
    periodStart: string;
    periodEnd: string;
    resourceCount: number;
  };
  validationMessages: string[];
}

export function InvoiceUploadTab() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [uploadedInvoices, setUploadedInvoices] = useState<ParsedInvoice[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const newInvoice: ParsedInvoice = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        status: 'parsing',
        validationMessages: []
      };

      setUploadedInvoices(prev => [...prev, newInvoice]);

      // Simulate parsing process
      setTimeout(() => {
        setUploadedInvoices(prev => prev.map(inv => 
          inv.id === newInvoice.id 
            ? {
                ...inv,
                status: 'success',
                parsedData: {
                  invoiceNumber: 'INV-2024-001',
                  amount: 125000,
                  currency: 'USD',
                  poReference: 'PO-2024-0001',
                  periodStart: '2024-03-01',
                  periodEnd: '2024-03-31',
                  resourceCount: 5
                },
                validationMessages: [
                  'Invoice amount matches SOW allocation',
                  'All resources have valid assignments',
                  'PO reference found and valid'
                ]
              }
            : inv
        ));
      }, 2000);
    });

    toast({
      title: "File Upload",
      description: `${files.length} file(s) uploaded for parsing`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'parsing':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'parsing':
        return <Badge variant="secondary">Parsing...</Badge>;
      case 'success':
        return <Badge variant="default">Parsed Successfully</Badge>;
      case 'failed':
        return <Badge variant="destructive">Parse Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Invoice Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Client and Project Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Client</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="techcorp">TechCorp Inc</SelectItem>
                  <SelectItem value="startup">StartupInc</SelectItem>
                  <SelectItem value="retail">RetailCorp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Project</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="ecommerce">E-commerce Platform</SelectItem>
                  <SelectItem value="mobile">Mobile App Development</SelectItem>
                  <SelectItem value="analytics">Data Analytics Platform</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Invoice Files</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop PDF files here, or click to browse
            </p>
            <div className="text-sm text-muted-foreground mb-4">
              Supported formats: PDF (max 10MB per file)
            </div>
            <Input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="invoice-upload"
            />
            <Button asChild>
              <label htmlFor="invoice-upload" className="cursor-pointer">
                Choose Files
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Parsing Results */}
      {uploadedInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Parsing Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedInvoices.map((invoice) => (
                <div key={invoice.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">{invoice.fileName}</span>
                      {getStatusIcon(invoice.status)}
                    </div>
                    {getStatusBadge(invoice.status)}
                  </div>

                  {invoice.status === 'parsing' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Parsing invoice data...</span>
                        <span>60%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                  )}

                  {invoice.status === 'success' && invoice.parsedData && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Invoice #:</span>
                          <p className="font-medium">{invoice.parsedData.invoiceNumber}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Amount:</span>
                          <p className="font-medium">
                            {invoice.parsedData.amount.toLocaleString()} {invoice.parsedData.currency}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">PO Reference:</span>
                          <p className="font-medium">{invoice.parsedData.poReference || 'Not found'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Resources:</span>
                          <p className="font-medium">{invoice.parsedData.resourceCount}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Validation Results:</p>
                        <div className="space-y-1">
                          {invoice.validationMessages.map((message, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Check className="h-3 w-3 text-green-500" />
                              <span>{message}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm">Create Draft Invoice</Button>
                        <Button variant="outline" size="sm">Review Details</Button>
                      </div>
                    </div>
                  )}

                  {invoice.status === 'failed' && (
                    <div className="text-sm">
                      <p className="text-red-600 mb-2">Failed to parse invoice. Please check the file format and try again.</p>
                      <Button variant="outline" size="sm">Retry</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}