import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Download, 
  FileText, 
  Calendar, 
  ExternalLink,
  Archive,
  Shield,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { Payslip, Form16 } from '@/types/finance';
import { financeService } from '@/services/financeService';
import { useAuth } from '@/auth/AuthContext';
import { toast } from 'sonner';
import { format, subMonths } from 'date-fns';

export function StatementsTab() {
  const { user: currentUser } = useAuth();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [form16List, setForm16List] = useState<Form16[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslips, setSelectedPayslips] = useState<string[]>([]);
  const [downloadingPayslips, setDownloadingPayslips] = useState(false);
  const [downloadingForm16, setDownloadingForm16] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadStatements();
    }
  }, [currentUser]);

  const loadStatements = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const now = new Date();
      const twelveMonthsAgo = subMonths(now, 12);
      
      const [payslipsResponse, form16Response] = await Promise.all([
        financeService.getPayslips(
          currentUser.employeeId,
          twelveMonthsAgo.getMonth() + 1,
          twelveMonthsAgo.getFullYear(),
          now.getMonth() + 1,
          now.getFullYear()
        ),
        financeService.getForm16List(currentUser.employeeId)
      ]);

      if (payslipsResponse.success) {
        setPayslips(payslipsResponse.data);
      }

      if (form16Response.success) {
        setForm16List(form16Response.data);
      }
    } catch (error) {
      toast.error('Failed to load statements');
    } finally {
      setLoading(false);
    }
  };

  const handlePayslipSelection = (payslipId: string, checked: boolean) => {
    if (checked) {
      setSelectedPayslips([...selectedPayslips, payslipId]);
    } else {
      setSelectedPayslips(selectedPayslips.filter(id => id !== payslipId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayslips(payslips.map(p => p.id));
    } else {
      setSelectedPayslips([]);
    }
  };

  const downloadSelectedPayslips = async () => {
    setDownloadingPayslips(true);
    try {
      // Mock bulk download
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Downloaded ${selectedPayslips.length} payslips`);
      setSelectedPayslips([]);
    } catch (error) {
      toast.error('Failed to download payslips');
    } finally {
      setDownloadingPayslips(false);
    }
  };

  const downloadForm16 = async (form16Id: string) => {
    setDownloadingForm16(form16Id);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Form 16 downloaded successfully');
    } catch (error) {
      toast.error('Failed to download Form 16');
    } finally {
      setDownloadingForm16(null);
    }
  };

  const downloadSinglePayslip = async (payslipId: string) => {
    try {
      const response = await financeService.downloadPayslip(payslipId);
      if (response.success) {
        // In a real app, this would trigger a file download
        toast.success('Payslip downloaded successfully');
      }
    } catch (error) {
      toast.error('Failed to download payslip');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="rounded-2xl animate-pulse">
              <CardHeader><div className="h-4 bg-muted rounded w-24" /></CardHeader>
              <CardContent><div className="h-8 bg-muted rounded w-16" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Access Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              AIS (Annual Information Statement)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View your AIS from Income Tax Department
            </p>
            <Button variant="outline" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Access AIS Portal
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Form 26AS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Tax Credit Statement from Income Tax Department
            </p>
            <Button variant="outline" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              View 26AS
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Document Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Payslips:</span>
                <span className="font-medium">8+ years</span>
              </div>
              <div className="flex justify-between">
                <span>Form 16:</span>
                <span className="font-medium">8+ years</span>
              </div>
              <div className="flex justify-between">
                <span>Certificates:</span>
                <span className="font-medium">Permanent</span>
              </div>
            </div>
            <Badge variant="outline" className="mt-2 text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Digitally Watermarked
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Payslips Section */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Payslips
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="select-all"
                checked={selectedPayslips.length === payslips.length && payslips.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select All ({payslips.length})
              </label>
            </div>
            {selectedPayslips.length > 0 && (
              <Button 
                onClick={downloadSelectedPayslips} 
                disabled={downloadingPayslips}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Selected ({selectedPayslips.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payslips.map((payslip) => (
              <div key={payslip.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={selectedPayslips.includes(payslip.id)}
                    onCheckedChange={(checked) => handlePayslipSelection(payslip.id, checked as boolean)}
                  />
                  <div>
                    <div className="font-medium">{payslip.payPeriod}</div>
                    <div className="text-sm text-muted-foreground">
                      Net Pay: ₹{payslip.netSalary.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge 
                    className={
                      payslip.status === 'PUBLISHED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {payslip.status === 'PUBLISHED' ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {payslip.status}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    Generated: {format(new Date(payslip.generatedAt), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 w-8 p-0"
                      onClick={() => downloadSinglePayslip(payslip.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {payslips.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No payslips available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form 16 Section */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Form 16 (TDS Certificate)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {form16List.map((form16) => (
              <div key={form16.id} className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-lg">Financial Year {form16.financialYear}</h4>
                    <p className="text-sm text-muted-foreground">
                      TDS Certificate for Assessment Year {parseInt(form16.financialYear.split('-')[1]) + 1}-{parseInt(form16.financialYear.split('-')[1]) + 2}
                    </p>
                  </div>
                  <Badge 
                    className={
                      form16.status === 'PUBLISHED' 
                        ? 'bg-green-100 text-green-800' 
                        : form16.status === 'GENERATED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {form16.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Part A */}
                  <div className="space-y-3">
                    <h5 className="font-medium">Part A - TDS Summary</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Employer TAN:</span>
                        <span className="font-medium">{form16.partA.employerTAN}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Employee PAN:</span>
                        <span className="font-medium">{form16.partA.employeePAN}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total TDS:</span>
                        <span className="font-medium">₹{form16.partA.totalTaxDeducted.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Part B */}
                  <div className="space-y-3">
                    <h5 className="font-medium">Part B - Computation</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Gross Salary:</span>
                        <span className="font-medium">₹{form16.partB.grossSalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxable Income:</span>
                        <span className="font-medium">₹{form16.partB.taxableIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax Liability:</span>
                        <span className="font-medium">₹{form16.partB.taxLiability.toLocaleString()}</span>
                      </div>
                      {form16.partB.refundDue > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Refund Due:</span>
                          <span className="font-medium">₹{form16.partB.refundDue.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {form16.publishedAt ? (
                      <>Published on: {format(new Date(form16.publishedAt), 'MMM dd, yyyy')}</>
                    ) : (
                      <>Generated on: {format(new Date(form16.generatedAt), 'MMM dd, yyyy')}</>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => downloadForm16(form16.id)}
                      disabled={downloadingForm16 === form16.id || form16.status !== 'PUBLISHED'}
                    >
                      {downloadingForm16 === form16.id ? (
                        <div className="w-4 h-4 mr-1 animate-spin border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Download className="w-4 h-4 mr-1" />
                      )}
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {form16List.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No Form 16 available. Form 16 is typically published after the financial year end.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="rounded-2xl shadow-sm border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              All documents are digitally watermarked and audit-logged for security
            </li>
            <li className="flex items-start gap-2">
              <Archive className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Documents are retained for 8+ years as per compliance requirements
            </li>
            <li className="flex items-start gap-2">
              <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Form 16 is typically published by May 31st after the financial year ends
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0" />
              For tax filing, cross-verify TDS details with Form 26AS from IT Department
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}