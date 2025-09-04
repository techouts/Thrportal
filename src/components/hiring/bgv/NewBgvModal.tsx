import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText } from 'lucide-react'
import { BgvService } from '@/services/bgvService'
import { BgvCase } from '@/types/bgv'
import { useToast } from '@/hooks/use-toast'

interface NewBgvModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<BgvCase>) => void
}

export function NewBgvModal({ open, onOpenChange, onSubmit }: NewBgvModalProps) {
  const [formData, setFormData] = useState({
    candidateId: '',
    candidateName: '',
    jdId: '',
    client: '',
    project: '',
    recruiterId: '',
    packageCode: 'IND_STANDARD',
    vendorIds: [] as string[],
    consentCaptured: false,
    signedName: '',
    documents: [] as File[]
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!formData.candidateName || !formData.jdId || !formData.client) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    if (!formData.consentCaptured || !formData.signedName) {
      toast({
        title: "Consent Required",
        description: "Digital consent must be captured before creating BGV case",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      
      // Generate consent PDF
      const consentPdfUrl = await BgvService.generateConsentPdf(formData.candidateName, formData.signedName)
      
      const bgvData: Partial<BgvCase> = {
        candidateId: formData.candidateId,
        candidateName: formData.candidateName,
        jdId: formData.jdId,
        client: formData.client,
        project: formData.project,
        recruiterId: formData.recruiterId,
        packageCode: formData.packageCode,
        vendorIds: formData.vendorIds,
        consent: {
          captured: true,
          signedName: formData.signedName,
          consentPdfUrl,
          timestamp: new Date().toISOString(),
          ip: '192.168.1.100' // Mock IP
        }
      }

      await BgvService.createBgvCase(bgvData)
      onSubmit(bgvData)
      
      // Reset form
      setFormData({
        candidateId: '',
        candidateName: '',
        jdId: '',
        client: '',
        project: '',
        recruiterId: '',
        packageCode: 'IND_STANDARD',
        vendorIds: [],
        consentCaptured: false,
        signedName: '',
        documents: []
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create BGV case",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
    const validFiles = Array.from(files).filter(file => {
      const isValidType = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
      return isValidType && isValidSize
    })

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...validFiles]
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New BGV Case</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="candidateId">Candidate ID</Label>
                  <Input
                    id="candidateId"
                    value={formData.candidateId}
                    onChange={(e) => setFormData(prev => ({ ...prev, candidateId: e.target.value }))}
                    placeholder="CAND-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidateName">Candidate Name *</Label>
                  <Input
                    id="candidateName"
                    value={formData.candidateName}
                    onChange={(e) => setFormData(prev => ({ ...prev, candidateName: e.target.value }))}
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jdId">JD ID *</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, jdId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select JD" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JD-2024-001">JD-2024-001 - Software Engineer</SelectItem>
                      <SelectItem value="JD-2024-002">JD-2024-002 - Product Manager</SelectItem>
                      <SelectItem value="JD-2024-003">JD-2024-003 - Data Scientist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, client: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TechCorp">TechCorp</SelectItem>
                      <SelectItem value="FinanceMax">FinanceMax</SelectItem>
                      <SelectItem value="RetailPlus">RetailPlus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Input
                    id="project"
                    value={formData.project}
                    onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                    placeholder="Digital Banking"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recruiterId">Recruiter</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, recruiterId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recruiter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rec-001">Alice Recruiter</SelectItem>
                      <SelectItem value="rec-002">Bob Talent</SelectItem>
                      <SelectItem value="rec-003">Carol Sourcer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package & Vendors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Package & Vendors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>BGV Package</Label>
                <Select 
                  value={formData.packageCode}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, packageCode: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IND_BASIC">India Basic - ID/KYC, Address, Employment, Education</SelectItem>
                    <SelectItem value="IND_STANDARD">India Standard - Basic + Criminal/Court + References</SelectItem>
                    <SelectItem value="IND_EXTENDED">India Extended - Standard + UAN/EPFO + Additional Employment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Preferred Vendors</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['vendor-001', 'vendor-002', 'vendor-003'].map(vendorId => (
                    <div key={vendorId} className="flex items-center space-x-2">
                      <Checkbox 
                        id={vendorId}
                        checked={formData.vendorIds.includes(vendorId)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({ ...prev, vendorIds: [...prev.vendorIds, vendorId] }))
                          } else {
                            setFormData(prev => ({ ...prev, vendorIds: prev.vendorIds.filter(id => id !== vendorId) }))
                          }
                        }}
                      />
                      <Label htmlFor={vendorId} className="text-sm">Vendor {vendorId.split('-')[1]}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Digital Consent */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Digital Consent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="consent"
                  checked={formData.consentCaptured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consentCaptured: !!checked }))}
                />
                <Label htmlFor="consent" className="text-sm">
                  I consent to background verification as per company policy and applicable laws
                </Label>
              </div>

              {formData.consentCaptured && (
                <div className="space-y-2">
                  <Label htmlFor="signedName">Type your full name to sign *</Label>
                  <Input
                    id="signedName"
                    value={formData.signedName}
                    onChange={(e) => setFormData(prev => ({ ...prev, signedName: e.target.value }))}
                    placeholder="Type your full legal name"
                  />
                  <p className="text-xs text-muted-foreground">
                    By typing your name, you are providing a legal electronic signature
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Required Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="documents" className="cursor-pointer">
                    <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      Upload documents
                    </span>
                    <Input
                      id="documents"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, JPG, PNG up to 10MB each
                  </p>
                </div>
              </div>

              {formData.documents.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Documents</Label>
                  {formData.documents.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      <span>{file.name}</span>
                      <span className="text-muted-foreground">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Required:</strong> Govt ID (PAN/Aadhaar masked), Address proof, Education certificates, Employment letters, Latest resume</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create BGV Case'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}