import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { hiringExtendedService } from '@/services/hiringExtendedService';
import { JDValidationError } from '@/types/hiring-extended';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  ok: boolean;
  errors: JDValidationError[];
}

export function ExcelJDTab() {
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [parsedData, setParsedData] = useState<Array<Record<string, any>>>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValidationResult(null);
      setParsedData([]);
      setProgress(0);
    }
  };

  const mockParseExcel = (file: File): Array<Record<string, any>> => {
    // Mock Excel parsing - in real implementation, use a library like xlsx
    return [
      {
        job_title: 'Senior React Developer',
        department: 'Engineering',
        business_unit: 'Product Development',
        openings: 2,
        recruiter_owner_email: 'recruiter@company.com',
        hiring_manager_email: 'hm@company.com',
        position_type: 'EXTERNAL',
        min_ctc_annual: 1200000,
        max_ctc_annual: 1800000,
        currency: 'INR',
        location: 'Bangalore',
        employment_type: 'Full-time',
        min_exp_years: 3,
        max_exp_years: 6,
        skills_primary: 'React,JavaScript,TypeScript',
        skills_secondary: 'Node.js,AWS,GraphQL',
        job_description: 'We are looking for a Senior React Developer...'
      },
      {
        job_title: '', // Missing required field
        department: 'Engineering',
        business_unit: 'Platform',
        openings: 0, // Invalid value
        recruiter_owner_email: 'recruiter2@company.com',
        hiring_manager_email: 'hm2@company.com',
        position_type: 'INTERNAL',
        min_ctc_annual: 1500000,
        max_ctc_annual: 1000000, // Invalid range
        currency: 'INR'
      }
    ];
  };

  const validateData = async () => {
    if (!file) return;

    setIsValidating(true);
    try {
      // Mock parsing the Excel file
      const data = mockParseExcel(file);
      setParsedData(data);

      // Validate the parsed data
      const result = await hiringExtendedService.validateBulkJDs(data);
      setValidationResult(result);

      if (result.ok) {
        toast({
          title: "Validation Successful",
          description: `${data.length} records are ready for import`
        });
      } else {
        toast({
          title: "Validation Failed",
          description: `Found ${result.errors.length} errors that need to be fixed`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate Excel file",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const createJDs = async () => {
    if (!validationResult?.ok || !parsedData.length) return;

    setIsCreating(true);
    setProgress(0);

    try {
      const result = await hiringExtendedService.createBulkJDs(parsedData);
      
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast({
        title: "Import Complete",
        description: `Successfully created ${result.created.length} JDs. ${result.failed.length} failed.`
      });

      if (result.failed.length > 0) {
        // Show failed records
        console.log('Failed records:', result.failed);
      }

      // Reset form
      setFile(null);
      setValidationResult(null);
      setParsedData([]);
      setProgress(0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create JDs",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const downloadTemplate = () => {
    // Mock download template
    const csvContent = `job_title,department,business_unit,openings,recruiter_owner_email,hiring_manager_email,position_type,min_ctc_annual,max_ctc_annual,currency,location,employment_type,min_exp_years,max_exp_years,skills_primary,skills_secondary,job_description
Senior React Developer,Engineering,Product Development,2,recruiter@company.com,hm@company.com,EXTERNAL,1200000,1800000,INR,Bangalore,Full-time,3,6,"React,JavaScript,TypeScript","Node.js,AWS,GraphQL","We are looking for a Senior React Developer..."`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jd_bulk_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Bulk Import from Excel
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="excel-file">Upload Excel File</Label>
            <div className="flex items-center gap-4">
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button 
                onClick={validateData} 
                disabled={!file || isValidating}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isValidating ? 'Validating...' : 'Validate'}
              </Button>
            </div>
          </div>

          {file && (
            <div className="text-sm text-muted-foreground">
              Selected file: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        {validationResult && (
          <div className="space-y-4">
            {validationResult.ok ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Validation successful! {parsedData.length} records are ready for import.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Validation failed with {validationResult.errors.length} errors. Please fix the errors below before importing.
                </AlertDescription>
              </Alert>
            )}

            {!validationResult.ok && validationResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Validation Errors:</h4>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Column</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResult.errors.map((error, index) => (
                        <TableRow key={index}>
                          <TableCell>{error.row}</TableCell>
                          <TableCell>{error.col}</TableCell>
                          <TableCell>{error.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button variant="outline" onClick={() => {
                  // Export error report as CSV
                  const csvContent = [
                    'Row,Column,Error',
                    ...validationResult.errors.map(e => `${e.row},${e.col},"${e.message}"`)
                  ].join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'validation_errors.csv';
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Error Report
                </Button>
              </div>
            )}

            {validationResult.ok && (
              <div className="space-y-4">
                {isCreating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Creating JDs...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}
                
                <Button 
                  onClick={createJDs} 
                  disabled={isCreating}
                  className="w-full"
                >
                  {isCreating ? 'Creating JDs...' : `Create ${parsedData.length} JDs`}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Instructions:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Download the template to see the required format</li>
            <li>Fill in all required fields: job_title, department, business_unit, openings</li>
            <li>Ensure min_ctc_annual ≤ max_ctc_annual</li>
            <li>Use comma-separated values for skills</li>
            <li>Maximum 5,000 rows per file</li>
            <li>All validation errors must be fixed before importing</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}