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
  ExternalLink,
  BrainCircuit
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { jobRequisitionsService } from '@/services/jobRequisitionsService'
import type { JobRequisition } from '@/types/jobRequisitions'

interface SmartUploadCandidatesModalProps {
  open: boolean
  onClose: () => void
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
  action: 'create_candidate' | 'create_application_only' | 'skip' | 'exclude'
  duplicateReason?: string
  missingFields?: string[]
  errorMessage?: string
  included: boolean
  existingCandidateId?: string
}

export function SmartUploadCandidatesModal({ open, onClose }: SmartUploadCandidatesModalProps) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1)
  const [selectedJD, setSelectedJD] = useState<JobRequisition | null>(null)
  const [source, setSource] = useState<string>('')
  const [availableJDs, setAvailableJDs] = useState<JobRequisition[]>([])
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
    successList: Array<{ 
      candidateName: string
      candidateId: string
      applicationId?: string 
    }>
    errorList: Array<{ fileName: string; reason: string }>
    batchId: string
  } | null>(null)

  React.useEffect(() => {
    if (open) {
      loadAvailableJDs()
    }
  }, [open])

  const loadAvailableJDs = async () => {
    try {
      const jds = await jobRequisitionsService.getJobRequisitions({ status: 'Approved' })
      setAvailableJDs(jds)
    } catch (error) {
      console.error('Failed to load JDs:', error)
    }
  }

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

    // Mock parsed results with deduplication logic
    const mockParsedResumes: ParsedResume[] = files.map((file, index) => {
      const isDuplicate = Math.random() < 0.25
      const hasMissingFields = Math.random() < 0.2
      const hasError = Math.random() < 0.05

      let status: ParsedResume['status'] = 'parsed'
      let action: ParsedResume['action'] = 'create_candidate'
      
      if (hasError) {
        status = 'error'
        action = 'exclude'
      } else if (isDuplicate) {
        status = 'duplicate'
        action = selectedJD ? 'create_application_only' : 'skip'
      } else if (hasMissingFields) {
        status = 'missing_fields'
        action = 'create_candidate'
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
        duplicateReason: isDuplicate ? 'Email already exists in database' : undefined,
        missingFields: hasMissingFields ? ['location'] : undefined,
        errorMessage: hasError ? 'Failed to parse resume - corrupted file' : undefined,
        included: !hasError,
        existingCandidateId: isDuplicate ? `CAND-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : undefined
      }
    })

    setParsedResumes(mockParsedResumes)
    setProcessing(false)
  }, [source, files, selectedJD, toast])

  const handleCreate = useCallback(async () => {
    setCurrentStep(5)
    setProcessing(true)

    // Simulate creation process
    await new Promise(resolve => setTimeout(resolve, 3000))

    const includedResumes = parsedResumes.filter(resume => resume.included && resume.action !== 'exclude')
    const batchId = `BATCH-${Date.now()}`
    
    setResults({
      newCandidates: includedResumes.filter(r => r.action === 'create_candidate').length,
      newApplications: selectedJD ? includedResumes.filter(r => r.action !== 'skip').length : 0,
      duplicatesSkipped: parsedResumes.filter(r => r.status === 'duplicate' && !r.included).length,
      errors: parsedResumes.filter(r => r.status === 'error').length,
      batchId,
      successList: includedResumes.map((resume, index) => ({
        candidateName: resume.candidateName || 'Unknown',
        candidateId: resume.existingCandidateId || `CAND-${Date.now()}-${index}`,
        applicationId: (selectedJD && resume.action !== 'skip') ? `APP-${Date.now()}-${index}` : undefined
      })),
      errorList: parsedResumes
        .filter(r => r.status === 'error')
        .map(r => ({ fileName: r.fileName, reason: r.errorMessage || 'Unknown error' }))
    })

    setProcessing(false)
    setCurrentStep(6)

    toast({
      title: "Smart Upload Complete",
      description: `Successfully processed ${includedResumes.length} candidates`,
    })
  }, [parsedResumes, selectedJD, toast])

  const resetModal = useCallback(() => {
    setCurrentStep(1)
    setSelectedJD(null)
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

  const updateResumeField = useCallback((resumeId: string, field: keyof ParsedResume, value: string) => {
    setParsedResumes(prev => 
      prev.map(resume => 
        resume.id === resumeId ? { ...resume, [field]: value } : resume
      )
    )
  }, [])

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <BrainCircuit className="h-12 w-12 mx-auto text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2">Smart Upload - Candidates</h3>
        <p className="text-muted-foreground">Upload resumes, auto-create candidates and optionally link to JDs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Step 1: Select JD & Source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="jd-select" className="text-sm font-medium">
              Target JD (Optional but Recommended)
            </Label>
            <Select value={selectedJD?.id || ''} onValueChange={(value) => {
              const jd = availableJDs.find(j => j.id === value)
              setSelectedJD(jd || null)
            }}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select JD to auto-create applications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No JD selected</SelectItem>
                {availableJDs.map((jd) => (
                  <SelectItem key={jd.id} value={jd.id}>
                    {jd.jobTitle} - {jd.isInternal ? 'Internal' : jd.clientName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              If selected, applications will be auto-created for successful candidates
            </p>
          </div>

          {selectedJD && (
            <Card className="bg-muted/50">
              <CardContent className="pt-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">JD Title:</span>
                    <span>{selectedJD.jobTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Client:</span>
                    <span>{selectedJD.isInternal ? 'Internal' : selectedJD.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Primary Recruiter:</span>
                    <span>{selectedJD.hiringManager}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <Label htmlFor="source" className="text-sm font-medium">Source *</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select candidate source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Job Board">Job Board</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Recruiter Upload">Recruiter Upload</SelectItem>
                <SelectItem value="IJP">Internal Job Posting</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={() => setCurrentStep(2)} 
          disabled={!source}
          className="min-w-[100px]"
        >
          Next: Upload Files
        </Button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Step 2: Upload Resume Files</h3>
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
            <RefreshCw className="h-12 w-12 text-primary animate-spin" />
          ) : (
            <CheckCircle className="h-12 w-12 text-green-500" />
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {processing ? 'Step 3: Parsing & Deduplicating...' : 'Step 3: Review Parsed Results'}
        </h3>
        <p className="text-muted-foreground">
          {processing 
            ? 'AI is extracting candidate information and checking for duplicates' 
            : 'Review and confirm the parsed information before creating candidates'}
        </p>
      </div>

      {!processing && parsedResumes.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {parsedResumes.filter(r => r.status === 'parsed').length}
              </div>
              <div className="text-muted-foreground">Successfully Parsed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-amber-600">
                {parsedResumes.filter(r => r.status === 'duplicate').length}
              </div>
              <div className="text-muted-foreground">Duplicates Found</div>
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
              <div className="text-muted-foreground">Parse Errors</div>
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
                        {resume.status === 'duplicate' ? 'Existing Candidate' : resume.status}
                      </Badge>
                    </div>
                  </div>

                  {resume.status !== 'error' && (
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={resume.candidateName || ''}
                          onChange={(e) => updateResumeField(resume.id, 'candidateName', e.target.value)}
                          className="h-7"
                          placeholder="Missing"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Email</Label>
                        <Input
                          value={resume.email || ''}
                          onChange={(e) => updateResumeField(resume.id, 'email', e.target.value)}
                          className="h-7"
                          placeholder="Missing"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Phone</Label>
                        <Input
                          value={resume.phone || ''}
                          onChange={(e) => updateResumeField(resume.id, 'phone', e.target.value)}
                          className="h-7"
                          placeholder="Missing"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Location</Label>
                        <Input
                          value={resume.location || ''}
                          onChange={(e) => updateResumeField(resume.id, 'location', e.target.value)}
                          className="h-7"
                          placeholder="Missing"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label className="text-xs">Skills</Label>
                        <div className="flex flex-wrap gap-1">
                          {resume.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {resume.skills.length === 0 && (
                            <span className="text-xs text-muted-foreground">None extracted</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {resume.duplicateReason && (
                    <Alert className="mb-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Duplicate detected: {resume.duplicateReason} (ID: {resume.existingCandidateId})
                      </AlertDescription>
                    </Alert>
                  )}

                  {resume.missingFields && resume.missingFields.length > 0 && (
                    <Alert className="mb-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Missing fields: {resume.missingFields.join(', ')} - please fill above
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
                          <SelectItem value="create_candidate">
                            Create New Candidate{selectedJD ? ' + Application' : ''}
                          </SelectItem>
                          {resume.status === 'duplicate' && (
                            <SelectItem value="create_application_only">
                              Create Application Only (Use Existing Candidate)
                            </SelectItem>
                          )}
                          <SelectItem value="skip">
                            Skip (Don't Create)
                          </SelectItem>
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
          disabled={processing || parsedResumes.filter(r => r.included && r.action !== 'exclude').length === 0}
          className="min-w-[100px]"
        >
          Continue to Confirm
        </Button>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Step 4: Confirm Creation</h3>
        <p className="text-muted-foreground">Review the summary before creating candidates and applications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Creation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {parsedResumes.filter(r => r.included && r.action === 'create_candidate').length}
              </div>
              <div className="text-sm text-muted-foreground">New Candidates</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {selectedJD ? parsedResumes.filter(r => r.included && r.action !== 'skip' && r.action !== 'exclude').length : 0}
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
                {parsedResumes.filter(r => r.status === 'error' || r.action === 'exclude').length}
              </div>
              <div className="text-sm text-muted-foreground">Excluded/Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedJD && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Applications will be created for JD: <strong>{selectedJD.jobTitle}</strong>
            <br />
            Submitter: Current User | Primary Recruiter: {selectedJD.hiringManager}
          </AlertDescription>
        </Alert>
      )}

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
            'Create Candidates & Applications'
          )}
        </Button>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center items-center gap-2 mb-4">
        <RefreshCw className="h-12 w-12 text-primary animate-spin" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Step 5: Creating Records...</h3>
      <p className="text-muted-foreground">Please wait while we create candidate profiles and applications</p>
      
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          • Creating candidate records
        </div>
        <div className="text-sm text-muted-foreground">
          • Storing resume files
        </div>
        {selectedJD && (
          <div className="text-sm text-muted-foreground">
            • Creating application links
          </div>
        )}
        <div className="text-sm text-muted-foreground">
          • Setting ownership rules
        </div>
        <div className="text-sm text-muted-foreground">
          • Generating audit logs
        </div>
      </div>
    </div>
  )

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Smart Upload Complete!</h3>
        <p className="text-muted-foreground">Your candidates and applications have been created successfully</p>
      </div>

      {results && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Final Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
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
              <div className="text-xs text-muted-foreground">
                Batch ID: {results.batchId}
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
                          Candidate
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                        {item.applicationId && (
                          <Button size="sm" variant="outline" className="h-6 text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            Application
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        )}
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Smart Upload - Candidates</DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step}
              </div>
              {step < 6 && (
                <div className={`w-12 h-0.5 mx-1 ${
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
        {currentStep === 6 && renderStep6()}
      </DialogContent>
    </Dialog>
  )
}