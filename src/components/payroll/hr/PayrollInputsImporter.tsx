import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileSpreadsheet, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ImportItem {
  id: string;
  type: 'ATTENDANCE' | 'OVERTIME' | 'VARIABLE_PAY' | 'DEDUCTIONS';
  fileName: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  uploadedAt: string;
  recordCount?: number;
  errorCount?: number;
}

export function PayrollInputsImporter() {
  const [uploading, setUploading] = useState(false);
  const [imports, setImports] = useState<ImportItem[]>([
    {
      id: 'imp_001',
      type: 'ATTENDANCE',
      fileName: 'attendance_march_2024.xlsx',
      status: 'COMPLETED',
      uploadedAt: '2024-04-01T10:00:00Z',
      recordCount: 255,
      errorCount: 0
    },
    {
      id: 'imp_002',
      type: 'OVERTIME',
      fileName: 'overtime_march_2024.xlsx',
      status: 'COMPLETED',
      uploadedAt: '2024-04-01T10:30:00Z',
      recordCount: 45,
      errorCount: 2
    },
    {
      id: 'imp_003',
      type: 'VARIABLE_PAY',
      fileName: 'variable_pay_march_2024.xlsx',
      status: 'PROCESSING',
      uploadedAt: '2024-04-01T11:00:00Z',
      recordCount: 180
    }
  ]);

  const handleFileUpload = async (type: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newImport: ImportItem = {
        id: `imp_${Date.now()}`,
        type: type as any,
        fileName: files[0].name,
        status: 'PROCESSING',
        uploadedAt: new Date().toISOString(),
        recordCount: Math.floor(Math.random() * 300) + 50
      };

      setImports(prev => [newImport, ...prev]);
      toast.success('File uploaded successfully');

      // Simulate processing completion
      setTimeout(() => {
        setImports(prev => prev.map(imp => 
          imp.id === newImport.id 
            ? { ...imp, status: 'COMPLETED' as const, errorCount: Math.floor(Math.random() * 5) }
            : imp
        ));
      }, 3000);

    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: ImportItem['status']) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ImportItem['status']) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 className="w-3 h-3" />;
      case 'PROCESSING': return <Clock className="w-3 h-3" />;
      case 'FAILED': return <AlertTriangle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Payroll Inputs</h2>
        <p className="text-muted-foreground">Import attendance, overtime, and variable pay data</p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attendance */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  Attendance Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload monthly attendance data for all employees
                </p>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    id="attendance-upload"
                    onChange={(e) => handleFileUpload('ATTENDANCE', e.target.files)}
                  />
                  <label htmlFor="attendance-upload" className="cursor-pointer">
                    <p className="text-sm font-medium mb-1">Click to upload</p>
                    <p className="text-xs text-muted-foreground">Excel or CSV files only</p>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Overtime */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  Overtime Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload overtime hours and rates
                </p>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    id="overtime-upload"
                    onChange={(e) => handleFileUpload('OVERTIME', e.target.files)}
                  />
                  <label htmlFor="overtime-upload" className="cursor-pointer">
                    <p className="text-sm font-medium mb-1">Click to upload</p>
                    <p className="text-xs text-muted-foreground">Excel or CSV files only</p>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Variable Pay */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  Variable Pay
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload incentives, bonuses, and allowances
                </p>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    id="variable-upload"
                    onChange={(e) => handleFileUpload('VARIABLE_PAY', e.target.files)}
                  />
                  <label htmlFor="variable-upload" className="cursor-pointer">
                    <p className="text-sm font-medium mb-1">Click to upload</p>
                    <p className="text-xs text-muted-foreground">Excel or CSV files only</p>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  Deductions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload loan recoveries and other deductions
                </p>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    id="deductions-upload"
                    onChange={(e) => handleFileUpload('DEDUCTIONS', e.target.files)}
                  />
                  <label htmlFor="deductions-upload" className="cursor-pointer">
                    <p className="text-sm font-medium mb-1">Click to upload</p>
                    <p className="text-xs text-muted-foreground">Excel or CSV files only</p>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Import History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {imports.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.type.replace('_', ' ')} • {new Date(item.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {item.recordCount && (
                        <div className="text-right">
                          <p className="text-sm font-medium">{item.recordCount} records</p>
                          {item.errorCount !== undefined && (
                            <p className="text-xs text-muted-foreground">
                              {item.errorCount} errors
                            </p>
                          )}
                        </div>
                      )}
                      <Badge variant="secondary" className={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1">{item.status}</span>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {uploading && (
        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>Processing</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}