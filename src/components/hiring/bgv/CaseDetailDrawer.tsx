import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Upload, FileText, Clock, User, Calendar, Download } from 'lucide-react'
import { BgvCase } from '@/types/bgv'
import { useToast } from '@/hooks/use-toast'

interface CaseDetailDrawerProps {
  case: BgvCase
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function CaseDetailDrawer({ case: bgvCase, open, onOpenChange, onUpdate }: CaseDetailDrawerProps) {
  const [selectedTab, setSelectedTab] = useState('summary')
  const [notes, setNotes] = useState('')
  const { toast } = useToast()

  const getStatusBadge = (status: BgvCase['status']) => {
    const variants = {
      'PENDING': { color: 'bg-gray-100 text-gray-700' },
      'IN_PROGRESS': { color: 'bg-blue-100 text-blue-700' },
      'AWAITING_DOCS': { color: 'bg-yellow-100 text-yellow-700' },
      'ON_HOLD': { color: 'bg-orange-100 text-orange-700' },
      'REVIEW': { color: 'bg-purple-100 text-purple-700' },
      'COMPLETED': { color: 'bg-green-100 text-green-700' },
      'CANCELLED': { color: 'bg-red-100 text-red-700' }
    }
    return variants[status] || { color: 'bg-gray-100 text-gray-700' }
  }

  const getCheckStatus = (type: string) => {
    // Mock check statuses based on package
    const mockStatuses = {
      'ID_KYC': 'COMPLETED',
      'ADDRESS': 'IN_PROGRESS',
      'EDUCATION': 'PENDING',
      'EMPLOYMENT': 'IN_PROGRESS',
      'CRIMINAL': 'PENDING',
      'COURT': 'PENDING',
      'UAN_EPFO': 'PENDING',
      'REFERENCES': 'PENDING'
    }
    return mockStatuses[type as keyof typeof mockStatuses] || 'PENDING'
  }

  const getPackageChecks = (packageCode: string) => {
    const packages = {
      'IND_BASIC': ['ID_KYC', 'ADDRESS', 'EMPLOYMENT', 'EDUCATION'],
      'IND_STANDARD': ['ID_KYC', 'ADDRESS', 'EMPLOYMENT', 'EDUCATION', 'CRIMINAL', 'COURT', 'REFERENCES'],
      'IND_EXTENDED': ['ID_KYC', 'ADDRESS', 'EMPLOYMENT', 'EDUCATION', 'CRIMINAL', 'COURT', 'UAN_EPFO', 'REFERENCES']
    }
    return packages[packageCode as keyof typeof packages] || []
  }

  const handleStatusUpdate = (newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `BGV case status updated to ${newStatus.replace('_', ' ')}`
    })
    onUpdate()
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    toast({
      title: "Files Uploaded",
      description: `${files.length} file(s) uploaded successfully`
    })
    onUpdate()
  }

  const mockDocuments = [
    { name: 'PAN_Card_Masked.pdf', type: 'ID_PROOF', uploadedAt: '2024-01-15T10:30:00Z', size: '245 KB' },
    { name: 'Address_Proof.pdf', type: 'ADDRESS_PROOF', uploadedAt: '2024-01-15T10:31:00Z', size: '189 KB' },
    { name: 'Employment_Letter.pdf', type: 'EMP_LETTER', uploadedAt: '2024-01-15T10:32:00Z', size: '156 KB' },
    { name: 'Consent_Form.pdf', type: 'CONSENT', uploadedAt: '2024-01-15T10:30:00Z', size: '89 KB' }
  ]

  const mockHistory = [
    { action: 'CREATED', actor: 'Alice Recruiter', timestamp: '2024-01-15T10:30:00Z', meta: 'BGV case created' },
    { action: 'CONSENT_CAPTURED', actor: 'System', timestamp: '2024-01-15T10:30:00Z', meta: 'Digital consent captured' },
    { action: 'DOC_UPLOAD', actor: 'Alice Recruiter', timestamp: '2024-01-15T10:31:00Z', meta: 'Documents uploaded' },
    { action: 'STATUS_CHANGE', actor: 'Bob Vendor', timestamp: '2024-01-16T09:15:00Z', meta: 'Status changed to In Progress' }
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[800px] sm:max-w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>BGV Case Details - {bgvCase.candidateName}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Case Summary Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">{bgvCase.candidateName}</h3>
                  <p className="text-sm text-muted-foreground">{bgvCase.candidateId}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusBadge(bgvCase.status).color}>
                      {bgvCase.status.replace('_', ' ')}
                    </Badge>
                    {bgvCase.overallOutcome && (
                      <Badge className={
                        bgvCase.overallOutcome === 'GREEN' ? 'bg-green-100 text-green-700' :
                        bgvCase.overallOutcome === 'AMBER' ? 'bg-amber-100 text-amber-700' :
                        bgvCase.overallOutcome === 'RED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {bgvCase.overallOutcome}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    <div><strong>JD:</strong> {bgvCase.jdId}</div>
                    <div><strong>Client:</strong> {bgvCase.client}</div>
                    <div><strong>Project:</strong> {bgvCase.project}</div>
                    <div><strong>Package:</strong> {bgvCase.packageCode}</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Select onValueChange={handleStatusUpdate}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="AWAITING_DOCS">Awaiting Docs</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="REVIEW">Under Review</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </Button>
                
                <Button variant="outline" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  Reassign
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="checks">Checks</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Case Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Created:</strong> {new Date(bgvCase.createdAt).toLocaleString()}
                    </div>
                    <div>
                      <strong>Updated:</strong> {new Date(bgvCase.updatedAt).toLocaleString()}
                    </div>
                    <div>
                      <strong>SLA Due:</strong> {bgvCase.slaDueAt ? new Date(bgvCase.slaDueAt).toLocaleString() : 'Not set'}
                    </div>
                    <div>
                      <strong>Vendors:</strong> {bgvCase.vendorIds.join(', ')}
                    </div>
                  </div>

                  {bgvCase.consent.captured && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">Digital Consent Captured</span>
                      </div>
                      <div className="text-sm text-green-600 mt-1">
                        Signed by: {bgvCase.consent.signedName} • {bgvCase.consent.timestamp ? new Date(bgvCase.consent.timestamp).toLocaleString() : ''}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add case notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                  <Button className="mt-2" size="sm">
                    Save Note
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="checks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Checks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getPackageChecks(bgvCase.packageCode).map(checkType => {
                      const status = getCheckStatus(checkType)
                      const statusBadge = getStatusBadge(status as any)
                      
                      return (
                        <div key={checkType} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{checkType.replace('_', ' ')}</div>
                            <div className="text-sm text-muted-foreground">
                              {checkType === 'ID_KYC' && 'PAN/Aadhaar verification'}
                              {checkType === 'ADDRESS' && 'Current address verification'}
                              {checkType === 'EDUCATION' && 'Education qualification check'}
                              {checkType === 'EMPLOYMENT' && 'Employment history verification'}
                              {checkType === 'CRIMINAL' && 'Criminal background check'}
                              {checkType === 'COURT' && 'Court records verification'}
                              {checkType === 'UAN_EPFO' && 'UAN/EPFO verification'}
                              {checkType === 'REFERENCES' && 'Reference verification'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={statusBadge.color}>
                              {status.replace('_', ' ')}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Clock className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium">{doc.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {doc.type.replace('_', ' ')} • {doc.size} • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload More Documents
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Case History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockHistory.map((entry, index) => (
                      <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="font-medium">{entry.action.replace('_', ' ')}</div>
                          <div className="text-sm text-muted-foreground">{entry.meta}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            by {entry.actor} • {new Date(entry.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}