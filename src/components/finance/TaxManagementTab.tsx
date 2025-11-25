import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  RefreshCw,
  Calculator,
  Download,
  Eye,
  Edit,
  Plus
} from 'lucide-react';
import { TaxDeclaration, TaxSection, TaxRegime, DeclarationStatus } from '@/types/finance';
import { financeService } from '@/services/financeService';
import { useAuth } from '@/auth/AuthContext';
import { toast } from 'sonner';

interface TaxManagementTabProps {
  declarations: TaxDeclaration[];
  loading: boolean;
  onRefresh: () => void;
}

export function TaxManagementTab({ declarations, loading, onRefresh }: TaxManagementTabProps) {
  const { user: currentUser } = useAuth();
  const [selectedRegime, setSelectedRegime] = useState<TaxRegime>('OLD');
  const [editingDeclaration, setEditingDeclaration] = useState<TaxDeclaration | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const taxSections = [
    { section: '80C' as TaxSection, name: 'Section 80C', limit: 150000, description: 'PPF, ELSS, Life Insurance, etc.' },
    { section: '80D' as TaxSection, name: 'Section 80D', limit: 25000, description: 'Health Insurance Premiums' },
    { section: '80CCD' as TaxSection, name: 'Section 80CCD(1B)', limit: 50000, description: 'NPS Additional Deduction' },
    { section: 'HRA' as TaxSection, name: 'HRA Exemption', limit: 999999, description: 'House Rent Allowance' },
    { section: 'LTA' as TaxSection, name: 'LTA Exemption', limit: 999999, description: 'Leave Travel Allowance' },
    { section: 'HOME_LOAN' as TaxSection, name: 'Home Loan Interest', limit: 200000, description: 'Interest on Home Loan' }
  ];

  const getStatusColor = (status: DeclarationStatus) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'VERIFIED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'LOCKED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: DeclarationStatus) => {
    switch (status) {
      case 'VERIFIED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECTED': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'SUBMITTED': return <Upload className="h-4 w-4 text-blue-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleSubmitDeclaration = async (declarationData: Partial<TaxDeclaration>) => {
    if (!currentUser) return;

    setSubmitting(true);
    try {
      await financeService.submitDeclaration({
        ...declarationData,
        employeeId: currentUser.employeeId,
        financialYear: '2023-24',
        regime: selectedRegime
      });
      toast.success('Declaration submitted successfully');
      setIsDialogOpen(false);
      setEditingDeclaration(null);
      onRefresh();
    } catch (error) {
      toast.error('Failed to submit declaration');
    } finally {
      setSubmitting(false);
    }
  };

  const getDeclarationForSection = (section: TaxSection) => {
    return declarations.find(d => d.section === section);
  };

  const totalDeclaredAmount = declarations.reduce((sum, d) => sum + d.declaredAmount, 0);
  const verifiedAmount = declarations.reduce((sum, d) => sum + (d.verifiedAmount || 0), 0);
  const pendingVerification = declarations.filter(d => d.status === 'SUBMITTED').length;

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
      {/* Tax Regime Selection */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Tax Regime Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label>Select Tax Regime for FY 2023-24</Label>
              <Select value={selectedRegime} onValueChange={(value: TaxRegime) => setSelectedRegime(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OLD">Old Tax Regime (with deductions)</SelectItem>
                  <SelectItem value="NEW">New Tax Regime (lower rates, no deductions)</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">
                {selectedRegime === 'OLD' 
                  ? 'Higher tax rates but allows deductions under various sections'
                  : 'Lower tax rates but no deductions allowed (except standard deduction)'
                }
              </div>
            </div>
            <div className="space-y-4">
              <Button variant="outline" className="w-full">
                <Calculator className="w-4 h-4 mr-2" />
                Compare Tax Regimes
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Generate Form 12BB
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Declared</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalDeclaredAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All sections</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{verifiedAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Approved by HR</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{pendingVerification}</div>
              {pendingVerification > 0 && (
                <Badge variant="destructive" className="text-xs">Action Required</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tax Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{Math.round(verifiedAmount * 0.3).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Estimated savings</p>
          </CardContent>
        </Card>
      </div>

      {/* Declaration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {taxSections.map((sectionInfo) => {
          const declaration = getDeclarationForSection(sectionInfo.section);
          const utilizationPercentage = declaration 
            ? (declaration.declaredAmount / sectionInfo.limit) * 100
            : 0;

          return (
            <Card key={sectionInfo.section} className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  {sectionInfo.name}
                  {declaration && getStatusIcon(declaration.status)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{sectionInfo.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {declaration ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Declared Amount:</span>
                        <span className="font-medium">₹{declaration.declaredAmount.toLocaleString()}</span>
                      </div>
                      
                      {sectionInfo.limit < 999999 && (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Utilization</span>
                              <span>{utilizationPercentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={Math.min(utilizationPercentage, 100)} className="h-2" />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Limit: ₹{sectionInfo.limit.toLocaleString()}
                          </div>
                        </>
                      )}

                      <Badge className={getStatusColor(declaration.status)}>
                        {declaration.status}
                      </Badge>

                      {declaration.verifiedAmount && declaration.verifiedAmount !== declaration.declaredAmount && (
                        <div className="text-sm text-orange-600">
                          Verified: ₹{declaration.verifiedAmount.toLocaleString()}
                        </div>
                      )}

                      {declaration.rejectionReason && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          <AlertTriangle className="w-4 h-4 inline mr-1" />
                          {declaration.rejectionReason}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingDeclaration(declaration);
                            setIsDialogOpen(true);
                          }}
                          disabled={declaration.status === 'LOCKED'}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        
                        {declaration.proofs.length > 0 && (
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            Proofs
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-muted-foreground">
                        No declaration submitted
                      </div>
                      {sectionInfo.limit < 999999 && (
                        <div className="text-sm text-muted-foreground">
                          Limit: ₹{sectionInfo.limit.toLocaleString()}
                        </div>
                      )}
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setEditingDeclaration({
                            section: sectionInfo.section,
                            declaredAmount: 0
                          } as TaxDeclaration);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Declare
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Declaration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDeclaration?.id ? 'Edit' : 'Add'} Tax Declaration
            </DialogTitle>
          </DialogHeader>
          
          {editingDeclaration && (
            <DeclarationForm 
              declaration={editingDeclaration}
              onSubmit={handleSubmitDeclaration}
              onCancel={() => setIsDialogOpen(false)}
              loading={submitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface DeclarationFormProps {
  declaration: TaxDeclaration;
  onSubmit: (data: Partial<TaxDeclaration>) => void;
  onCancel: () => void;
  loading: boolean;
}

function DeclarationForm({ declaration, onSubmit, onCancel, loading }: DeclarationFormProps) {
  const [formData, setFormData] = useState({
    section: declaration.section,
    declaredAmount: declaration.declaredAmount || 0,
    payrollEffectMonth: declaration.payrollEffectMonth || new Date().getMonth() + 1,
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Section</Label>
          <Input value={formData.section} disabled />
        </div>
        
        <div className="space-y-2">
          <Label>Declared Amount</Label>
          <Input 
            type="number"
            value={formData.declaredAmount}
            onChange={(e) => setFormData({ ...formData, declaredAmount: Number(e.target.value) })}
            placeholder="Enter amount"
            min="0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Payroll Effect Month</Label>
          <Select 
            value={formData.payrollEffectMonth.toString()} 
            onValueChange={(value) => setFormData({ ...formData, payrollEffectMonth: Number(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Description (Optional)</Label>
          <Textarea 
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Additional details"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
          {declaration.id ? 'Update' : 'Submit'} Declaration
        </Button>
      </div>
    </form>
  );
}