import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle, CheckCircle, Edit } from 'lucide-react';
import { JobDescription, JDParseResult } from '@/types/hiring-extended';
import { hiringExtendedService } from '@/services/hiringExtendedService';
import { useToast } from '@/hooks/use-toast';

export function SmartJDTab() {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [parseResult, setParseResult] = useState<JDParseResult | null>(null);
  const [editableFields, setEditableFields] = useState<Partial<JobDescription>>({});
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.doc') && !selectedFile.name.endsWith('.docx')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or Word document",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
      setParseResult(null);
      setEditableFields({});
      setProgress(0);
    }
  };

  const parseDocument = async () => {
    if (!file) return;

    setIsParsing(true);
    setProgress(0);

    try {
      // Simulate parsing progress
      for (let i = 0; i <= 90; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Convert file to text (mock implementation)
      const fileContent = await file.text();
      
      const result = await hiringExtendedService.parseSmartJD(fileContent, file.name);
      setParseResult(result);
      setEditableFields(result.draft);
      setProgress(100);

      toast({
        title: "Parsing Complete",
        description: `Document parsed with ${Math.round(result.confidence * 100)}% confidence`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse document",
        variant: "destructive"
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleFieldEdit = (field: string, value: any) => {
    setEditableFields(prev => ({ ...prev, [field]: value }));
  };

  const createJD = async () => {
    if (!parseResult || !editableFields) return;

    // Validate required fields
    const requiredFields = ['job_title', 'department', 'business_unit', 'openings', 'recruiter_owner_email', 'hiring_manager_email'];
    const missingFields = requiredFields.filter(field => !editableFields[field as keyof JobDescription]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      await hiringExtendedService.createJD({
        ...editableFields,
        approval_required: true,
        status: 'Draft',
        jd_source: 'Smart',
        approval_path: editableFields.position_type === 'INTERNAL' ? 'INTERNAL' : 'EXTERNAL',
        created_by: 'current_user@company.com'
      } as Omit<JobDescription, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>);

      toast({
        title: "Success",
        description: "Job Description created successfully from parsed document"
      });

      // Reset form
      setFile(null);
      setParseResult(null);
      setEditableFields({});
      setProgress(0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create Job Description",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return <Badge variant="default">High Confidence</Badge>;
    if (confidence >= 0.6) return <Badge variant="secondary">Medium Confidence</Badge>;
    return <Badge variant="destructive">Low Confidence</Badge>;
  };

  const isFieldUncertain = (field: string) => {
    return parseResult?.uncertainFields.includes(field);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Document Parser</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document-file">Upload Document</Label>
            <div className="flex items-center gap-4">
              <Input
                id="document-file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button 
                onClick={parseDocument} 
                disabled={!file || isParsing}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {isParsing ? 'Parsing...' : 'Parse'}
              </Button>
            </div>
          </div>

          {file && (
            <div className="text-sm text-muted-foreground">
              Selected file: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}

          {isParsing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Parsing document...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>

        {parseResult && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Parsed Fields</h3>
                {getConfidenceBadge(parseResult.confidence)}
              </div>
              <div className="text-sm text-muted-foreground">
                Confidence: {Math.round(parseResult.confidence * 100)}%
              </div>
            </div>

            {parseResult.uncertainFields.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Some fields have low confidence and require review: {parseResult.uncertainFields.join(', ')}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parsed_job_title" className="flex items-center gap-2">
                  Job Title *
                  {isFieldUncertain('job_title') && <AlertCircle className="h-4 w-4 text-destructive" />}
                </Label>
                <Input
                  id="parsed_job_title"
                  value={editableFields.job_title || ''}
                  onChange={(e) => handleFieldEdit('job_title', e.target.value)}
                  className={isFieldUncertain('job_title') ? 'border-destructive' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parsed_department" className="flex items-center gap-2">
                  Department *
                  {isFieldUncertain('department') && <AlertCircle className="h-4 w-4 text-destructive" />}
                </Label>
                <Input
                  id="parsed_department"
                  value={editableFields.department || ''}
                  onChange={(e) => handleFieldEdit('department', e.target.value)}
                  className={isFieldUncertain('department') ? 'border-destructive' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parsed_business_unit">Business Unit *</Label>
                <Input
                  id="parsed_business_unit"
                  value={editableFields.business_unit || ''}
                  onChange={(e) => handleFieldEdit('business_unit', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parsed_openings">Number of Openings *</Label>
                <Input
                  id="parsed_openings"
                  type="number"
                  min="1"
                  value={editableFields.openings || ''}
                  onChange={(e) => handleFieldEdit('openings', parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parsed_min_exp">Min Experience (Years)</Label>
                <Input
                  id="parsed_min_exp"
                  type="number"
                  value={editableFields.min_exp_years || ''}
                  onChange={(e) => handleFieldEdit('min_exp_years', parseInt(e.target.value) || undefined)}
                  className={isFieldUncertain('min_exp_years') ? 'border-destructive' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parsed_max_exp">Max Experience (Years)</Label>
                <Input
                  id="parsed_max_exp"
                  type="number"
                  value={editableFields.max_exp_years || ''}
                  onChange={(e) => handleFieldEdit('max_exp_years', parseInt(e.target.value) || undefined)}
                  className={isFieldUncertain('max_exp_years') ? 'border-destructive' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parsed_recruiter">Recruiter Owner Email *</Label>
                <Input
                  id="parsed_recruiter"
                  type="email"
                  value={editableFields.recruiter_owner_email || ''}
                  onChange={(e) => handleFieldEdit('recruiter_owner_email', e.target.value)}
                  placeholder="recruiter@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parsed_hm">Hiring Manager Email *</Label>
                <Input
                  id="parsed_hm"
                  type="email"
                  value={editableFields.hiring_manager_email || ''}
                  onChange={(e) => handleFieldEdit('hiring_manager_email', e.target.value)}
                  placeholder="hm@company.com"
                />
              </div>
            </div>

            {editableFields.skills_primary && editableFields.skills_primary.length > 0 && (
              <div className="space-y-2">
                <Label>Primary Skills (Extracted)</Label>
                <div className="flex flex-wrap gap-2">
                  {editableFields.skills_primary.map((skill, index) => (
                    <Badge key={index} variant="default">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {parseResult.suggestions.length > 0 && (
              <div className="space-y-2">
                <Label>AI Suggestions</Label>
                <div className="bg-muted p-3 rounded-md">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {parseResult.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleFieldEdit('status', 'Draft')}>
                Save as Draft
              </Button>
              <Button onClick={createJD} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create JD'}
              </Button>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Supported formats:</strong> PDF, DOC, DOCX</p>
          <p><strong>How it works:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Upload a job description document</li>
            <li>AI extracts key information automatically</li>
            <li>Review and edit fields with low confidence</li>
            <li>Missing required fields must be filled manually</li>
            <li>Create the JD once all fields are complete</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}