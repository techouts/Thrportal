import React, { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Download,
  RefreshCw,
  User,
  Mail,
  Phone,
  MapPin,
  Tag,
  ExternalLink
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { JobRequisition } from '@/types/jobRequisitions'

interface SmartUploadModalProps {
  open: boolean
  onClose: () => void
  jobRequisition: JobRequisition
}

interface ParsedResume {
  id: string
  fileName: string
  candidateName?: string
  email?: string
  phone?: string
  location?: string
  skills: string[]
  status: 'parsed' | 'duplicate' | 'missing_fields' | 'error'
  action: 'create_both' | 'create_application_only' | 'exclude'
  duplicateReason?: string
  missingFields?: string[]
  errorMessage?: string
  included: boolean
}

interface UploadStep {
  step: 1 | 2 | 3 | 4 | 5
}

export function SmartUploadModal({ open, onClose, jobRequisition }: SmartUploadModalProps) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<UploadStep['step']>(1)
  const [source, setSource] = useState<string>('')
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [parsedResumes, setParsedResumes] = useState<ParsedResume[]>([])
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<{
    newCandidates: number
    newApplications: number
    duplicatesSkipped: number
    errors: number
    successList: Array<{ candidateName: string; candidateId: string; applicationId: string }>
    errorList: Array<{ fileName: string; reason: string }>
  } | null>(null)

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    if (selectedFiles.length > 10) {
      toast({
        title: "Too many files",
        description: "Maximum 10 files allowed",
        variant: "destructive"
      })
      return
    }
    
    const validFiles = selectedFiles.filter(file => {
      const ext = file.name.toLowerCase().split('.').pop()
      return ext && ['pdf', 'doc', 'docx'].includes(ext)
    })
    
    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid file format",
        description: "Only PDF, DOC, and DOCX files are allowed",
        variant: "destructive"
      })
    }
    
    setFiles(validFiles)
  }, [toast])

  const handleUpload = useCallback(async () => {
    if (!source) {
      toast({
        title: "Source required",
        description: "Please select a source before uploading",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    setCurrentStep(2)

    // Simulate file upload with progress
    for (const file of files) {
      const fileId = file.name
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }))
      }
    }

    setUploading(false)
    setCurrentStep(3)

    // Simulate parsing and deduplication
    setProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock parsed results
    const mockParsedResumes: ParsedResume[] = files.map((file, index) => {
      const isDuplicate = Math.random() < 0.2
      const hasMissingFields = Math.random() < 0.3
      const hasError = Math.random() < 0.1

      let status: ParsedResume['status'] = 'parsed'
      let action: ParsedResume['action'] = 'create_both'
      
      if (hasError) {
        status = 'error'
        action = 'exclude'
      } else if (isDuplicate) {
        status = 'duplicate'
        action = 'create_application_only'
      } else if (hasMissingFields) {
        status = 'missing_fields'
        action = 'create_both'
      }

      return {
        id: `resume-${index}`,
        fileName: file.name,
        candidateName: hasError ? undefined : `Candidate ${index + 1}`,
        email: hasError ? undefined : `candidate${index + 1}@example.com`,
        phone: hasError ? undefined : `+91 98765 4321${index}`,
        location: hasMissingFields ? undefined : `City ${index + 1}`,
        skills: hasError ? [] : [`Skill ${index + 1}`, `Technology ${index + 1}`],
        status,
        action,
        duplicateReason: isDuplicate ? 'Email already exists' : undefined,
        missingFields: hasMissingFields ? ['location'] : undefined,
        errorMessage: hasError ? 'Failed to parse resume' : undefined,
        included: !hasError
      }
    })

    setParsedResumes(mockParsedResumes)
    setProcessing(false)
  }, [source, files, toast])

  const handleCreate = useCallback(async () => {
    setCurrentStep(4)
    setProcessing(true)

    // Simulate creation process
    await new Promise(resolve => setTimeout(resolve, 3000))

    const includedResumes = parsedResumes.filter(resume => resume.included && resume.action !== 'exclude')
    
    setResults({
      newCandidates: includedResumes.filter(r => r.action === 'create_both').length,
      newApplications: includedResumes.length,
      duplicatesSkipped: parsedResumes.filter(r => r.status === 'duplicate' && !r.included).length,
      errors: parsedResumes.filter(r => r.status === 'error').length,
      successList: includedResumes.map((resume, index) => ({
        candidateName: resume.candidateName || 'Unknown',
        candidateId: `CAND-${Date.now()}-${index}`,
        applicationId: `APP-${Date.now()}-${index}`
      })),
      errorList: parsedResumes
        .filter(r => r.status === 'error')
        .map(r => ({ fileName: r.fileName, reason: r.errorMessage || 'Unknown error' }))
    })

    setProcessing(false)
    setCurrentStep(5)

    toast({
      title: "Smart Upload Complete",
      description: `Successfully created ${includedResumes.length} applications`,
    })
  }, [parsedResumes, toast])

  const resetModal = useCallback(() => {
    setCurrentStep(1)
    setSource('')
    setFiles([])
    setUploading(false)
    setUploadProgress({})
    setParsedResumes([])
    setProcessing(false)
    setResults(null)
  }, [])

  const handleClose = useCallback(() => {
    resetModal()
    onClose()
  }, [resetModal, onClose])

  const updateResumeAction = useCallback((resumeId: string, action: ParsedResume['action']) => {
    setParsedResumes(prev => 
      prev.map(resume => 
        resume.id === resumeId ? { ...resume, action } : resume
      )
    )
  }, [])

  const toggleResumeIncluded = useCallback((resumeId: string) => {
    setParsedResumes(prev => 
      prev.map(resume => 
        resume.id === resumeId ? { ...resume, included: !resume.included } : resume
      )
    )
  }, [])

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Smart Upload for JD</h3>
        <p className="text-muted-foreground">Upload up to 10 resumes and auto-create candidates and applications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">JD Context (Pre-selected)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium">JD Title:</span>
            <span className="text-sm">{jobRequisition.jobTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Client:</span>
            <span className="text-sm">{jobRequisition.isInternal ? 'Internal' : jobRequisition.clientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Primary Recruiter:</span>
            <span className="text-sm">{jobRequisition.hiringManager}</span>
          </div>
        </CardContent>
      </Card>

      <div>
        <Label htmlFor="source" className="text-sm font-medium">Source *</Label>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Job Board">Job Board</SelectItem>
            <SelectItem value="Referral">Referral</SelectItem>
            <SelectItem value="Recruiter Upload">Recruiter Upload</SelectItem>
            <SelectItem value="IJP">Internal Job Posting</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={() => setCurrentStep(2)} 
          disabled={!source}
          className="min-w-[100px]"
        >
          Next
        </Button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Upload Files</h3>
        <p className="text-muted-foreground">Select up to 10 resume files (.pdf, .doc, .docx)</p>
      </div>

      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
        <Input
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <Label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground mt-1">Maximum 10 files, PDF/DOC/DOCX only</p>
        </Label>
      </div>

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Selected Files ({files.length}/10)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  {uploading && (
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Progress value={uploadProgress[file.name] || 0} className="w-16" />
                      <span className="text-xs">{uploadProgress[file.name] || 0}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          Back
        </Button>
        <Button 
          onClick={handleUpload} 
          disabled={files.length === 0 || uploading}
          className="min-w-[100px]"
        >
          {uploading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload & Parse'
          )}
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          {processing ? (
            <RefreshCw className="h-12 w-12 text-muted-foreground animate-spin" />
          ) : (
            <CheckCircle className="h-12 w-12 text-green-500" />
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {processing ? 'Parsing & Deduplicating...' : 'Review Parsed Results'}
        </h3>
        <p className="text-muted-foreground">
          {processing 
            ? 'Please wait while we process your resumes' 
            : 'Review and confirm the parsed information'}
        </p>
      </div>

      {!processing && parsedResumes.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {parsedResumes.filter(r => r.status === 'parsed').length}
              </div>
              <div className="text-muted-foreground">Parsed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-amber-600">
                {parsedResumes.filter(r => r.status === 'duplicate').length}
              </div>
              <div className="text-muted-foreground">Duplicates</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {parsedResumes.filter(r => r.status === 'missing_fields').length}
              </div>
              <div className="text-muted-foreground">Missing Fields</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">
                {parsedResumes.filter(r => r.status === 'error').length}
              </div>
              <div className="text-muted-foreground">Errors</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {parsedResumes.map((resume) => (
              <Card key={resume.id} className={!resume.included ? 'opacity-50' : ''}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={resume.included}
                        onCheckedChange={() => toggleResumeIncluded(resume.id)}
                        disabled={resume.status === 'error'}
                      />
                      <div>
                        <div className="font-medium text-sm">{resume.fileName}</div>
                        {resume.candidateName && (
                          <div className="text-sm text-muted-foreground">{resume.candidateName}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        resume.status === 'parsed' ? 'default' :
                        resume.status === 'duplicate' ? 'secondary' :
                        resume.status === 'missing_fields' ? 'outline' : 'destructive'
                      }>
                        {resume.status}
                      </Badge>
                    </div>
                  </div>

                  {resume.status !== 'error' && (
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>{resume.email || 'Missing'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{resume.phone || 'Missing'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{resume.location || 'Missing'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <span>{resume.skills.join(', ') || 'None'}</span>
                      </div>
                    </div>
                  )}

                  {resume.duplicateReason && (
                    <Alert className="mb-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Duplicate found: {resume.duplicateReason}
                      </AlertDescription>
                    </Alert>
                  )}

                  {resume.missingFields && resume.missingFields.length > 0 && (
                    <Alert className="mb-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Missing fields: {resume.missingFields.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}

                  {resume.errorMessage && (
                    <Alert variant="destructive" className="mb-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{resume.errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  {resume.status !== 'error' && (
                    <div>
                      <Label className="text-xs">Action:</Label>
                      <Select
                        value={resume.action}
                        onValueChange={(value) => updateResumeAction(resume.id, value as ParsedResume['action'])}
                      >
                        <SelectTrigger className="mt-1 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="create_both">Create Candidate + Application</SelectItem>
                          <SelectItem value="create_application_only">Create Application Only</SelectItem>
                          <SelectItem value="exclude">Exclude</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(2)} disabled={processing}>
          Back
        </Button>
        <Button 
          onClick={() => setCurrentStep(4)} 
          disabled={processing || parsedResumes.filter(r => r.included).length === 0}
          className="min-w-[100px]"
        >
          Continue
        </Button>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Confirm Creation</h3>
        <p className="text-muted-foreground">Review the summary before creating candidates and applications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {parsedResumes.filter(r => r.included && r.action === 'create_both').length}
              </div>
              <div className="text-sm text-muted-foreground">New Candidates</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {parsedResumes.filter(r => r.included && r.action !== 'exclude').length}
              </div>
              <div className="text-sm text-muted-foreground">New Applications</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">
                {parsedResumes.filter(r => !r.included && r.status === 'duplicate').length}
              </div>
              <div className="text-sm text-muted-foreground">Duplicates Skipped</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {parsedResumes.filter(r => r.status === 'error').length}
              </div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(3)}>
          Back
        </Button>
        <Button 
          onClick={handleCreate}
          disabled={processing}
          className="min-w-[100px]"
        >
          {processing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create'
          )}
        </Button>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Upload Complete!</h3>
        <p className="text-muted-foreground">Your candidates and applications have been created successfully</p>
      </div>

      {results && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Results Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">{results.newCandidates}</div>
                  <div className="text-sm text-muted-foreground">New Candidates</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{results.newApplications}</div>
                  <div className="text-sm text-muted-foreground">New Applications</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">{results.duplicatesSkipped}</div>
                  <div className="text-sm text-muted-foreground">Duplicates Skipped</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{results.errors}</div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {results.successList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Successfully Created ({results.successList.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {results.successList.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{item.candidateName}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-6 text-xs">
                          <User className="h-3 w-3 mr-1" />
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {results.errorList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Errors ({results.errorList.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {results.errorList.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{item.fileName}</span>
                      <span className="text-red-500 text-xs">{item.reason}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Error CSV
                  </Button>
                  <Button size="sm" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Re-upload Failed Only
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="flex justify-end">
        <Button onClick={handleClose} className="min-w-[100px]">
          Close
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Smart Upload - {jobRequisition.jobTitle}</DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step}
              </div>
              {step < 5 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  currentStep > step ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </DialogContent>
    </Dialog>
  )
}