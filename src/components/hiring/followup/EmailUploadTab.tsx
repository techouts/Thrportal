import { useState } from 'react'
import { Upload, Download, FileText, Check, X, Eye, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/shared/DataTable'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { FollowupService } from '@/services/followupService'
import { EmailIngestPreview } from '@/types/followup'
import { useToast } from '@/hooks/use-toast'

export function EmailUploadTab() {
  const [emailPreviews, setEmailPreviews] = useState<EmailIngestPreview[]>([])
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const fileArray = Array.from(files)
      const previews = await FollowupService.uploadEmails(fileArray)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      setEmailPreviews(previews)
      setSelectedEmails(previews.map(p => p.messageId))
      
      toast({
        title: "Success",
        description: `${previews.length} emails parsed successfully`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse emails",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleProcessEmails = async () => {
    const selectedPreviews = emailPreviews.filter(p => selectedEmails.includes(p.messageId))
    
    if (selectedPreviews.length === 0) {
      toast({
        title: "Warning",
        description: "Please select emails to process",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    
    try {
      await FollowupService.processEmailIngest(selectedPreviews)
      toast({
        title: "Success",
        description: `${selectedPreviews.length} emails processed successfully`
      })
      setEmailPreviews([])
      setSelectedEmails([])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process emails",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const EmailPreviewDialog = ({ email }: { email: EmailIngestPreview }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Email Preview - {email.subject}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Email Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Email Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Subject:</span> {email.subject}
                </div>
                <div>
                  <span className="font-medium">To:</span> {email.to.join(', ')}
                </div>
                {email.cc.length > 0 && (
                  <div>
                    <span className="font-medium">CC:</span> {email.cc.join(', ')}
                  </div>
                )}
                <div>
                  <span className="font-medium">Sent:</span> {new Date(email.sentAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Detected Information</h4>
              <div className="space-y-2 text-sm">
                {email.detectedJdCode ? (
                  <div>
                    <span className="font-medium">JD Code:</span> 
                    <Badge variant="outline" className="ml-2">{email.detectedJdCode}</Badge>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No JD code detected</div>
                )}
                {email.guessedClient ? (
                  <div>
                    <span className="font-medium">Client:</span> 
                    <Badge variant="outline" className="ml-2">{email.guessedClient}</Badge>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No client detected</div>
                )}
              </div>
            </div>
          </div>

          {/* Attachments */}
          {email.attachments.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Attachments ({email.attachments.length})</h4>
              <div className="space-y-2">
                {email.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 border rounded">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{attachment.fileName}</div>
                      <div className="text-xs text-muted-foreground">
                        {attachment.mime} • {(attachment.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parsed Candidates */}
          {email.parsedCandidates && email.parsedCandidates.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Parsed Candidates ({email.parsedCandidates.length})</h4>
              <div className="space-y-2">
                {email.parsedCandidates.map((candidate, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 border rounded">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{candidate.name}</div>
                      {candidate.email && (
                        <div className="text-xs text-muted-foreground">{candidate.email}</div>
                      )}
                    </div>
                    {candidate.matchScore && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          candidate.matchScore > 80 ? 'bg-green-100 text-green-700' : 
                          candidate.matchScore > 60 ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'
                        }`}
                      >
                        {candidate.matchScore}% match
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )

  const columns = [
    {
      id: 'select',
      header: '',
      accessor: 'messageId' as keyof EmailIngestPreview,
      cell: (item: EmailIngestPreview) => {
        if (!item) return <div>-</div>
        return (
          <Checkbox
            checked={selectedEmails.includes(item.messageId)}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedEmails(prev => [...prev, item.messageId])
              } else {
                setSelectedEmails(prev => prev.filter(id => id !== item.messageId))
              }
            }}
          />
        )
      }
    },
    {
      id: 'subject',
      header: 'Subject',
      accessor: 'subject' as keyof EmailIngestPreview,
      cell: (item: EmailIngestPreview) => {
        if (!item) return <div>-</div>
        return (
          <div className="max-w-xs">
            <div className="font-medium truncate">{item.subject}</div>
            <div className="text-sm text-muted-foreground">
              {new Date(item.sentAt).toLocaleDateString()}
            </div>
          </div>
        )
      }
    },
    {
      id: 'recipients',
      header: 'Recipients',
      accessor: 'to' as keyof EmailIngestPreview,
      cell: (item: EmailIngestPreview) => {
        if (!item || !item.to) return <div>-</div>
        return (
          <div className="text-sm">
            <div>{item.to.slice(0, 2).join(', ')}</div>
            {item.to.length > 2 && (
              <div className="text-muted-foreground">+{item.to.length - 2} more</div>
            )}
          </div>
        )
      }
    },
    {
      id: 'detection',
      header: 'Detection',
      accessor: 'detectedJdCode' as keyof EmailIngestPreview,
      cell: (item: EmailIngestPreview) => {
        if (!item) return <div>-</div>
        return (
          <div className="space-y-1">
            {item.detectedJdCode ? (
              <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                {item.detectedJdCode}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs bg-red-100 text-red-700">
                No JD
              </Badge>
            )}
            {item.guessedClient && (
              <div>
                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                  {item.guessedClient}
                </Badge>
              </div>
            )}
          </div>
        )
      }
    },
    {
      id: 'attachments',
      header: 'Attachments',
      accessor: 'attachments' as keyof EmailIngestPreview,
      cell: (item: EmailIngestPreview) => {
        if (!item || !item.attachments) return <div>-</div>
        return (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{item.attachments.length}</span>
          </div>
        )
      }
    },
    {
      id: 'candidates',
      header: 'Candidates',
      accessor: 'parsedCandidates' as keyof EmailIngestPreview,
      cell: (item: EmailIngestPreview) => {
        if (!item || !item.parsedCandidates) return <div>-</div>
        return (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{item.parsedCandidates.length}</span>
          </div>
        )
      }
    },
    {
      id: 'confidence',
      header: 'Confidence',
      accessor: 'parsedCandidates' as keyof EmailIngestPreview,
      cell: (item: EmailIngestPreview) => {
        if (!item) return <div>-</div>
        
        // Calculate overall confidence based on detection success
        let confidence = 0
        if (item.detectedJdCode) confidence += 40
        if (item.guessedClient) confidence += 30
        if (item.parsedCandidates && item.parsedCandidates.length > 0) confidence += 30
        
        const color = confidence > 80 ? 'text-green-600' : confidence > 50 ? 'text-yellow-600' : 'text-red-600'
        
        return (
          <div className={`text-sm font-medium ${color}`}>
            {confidence}%
          </div>
        )
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'messageId' as keyof EmailIngestPreview,
      cell: (item: EmailIngestPreview) => {
        if (!item) return <div>-</div>
        return (
          <div className="flex items-center gap-1">
            <EmailPreviewDialog email={item} />
            <Select defaultValue="no-action">
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue placeholder="Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-action">Select Action</SelectItem>
                <SelectItem value="edit-jd">Edit JD Code</SelectItem>
                <SelectItem value="edit-client">Edit Client</SelectItem>
                <SelectItem value="exclude">Exclude</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
      }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Smart Email Upload</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <div className="mt-4">
                <label className="cursor-pointer">
                  <span className="text-lg font-medium">Upload Email Files</span>
                  <input
                    type="file"
                    multiple
                    accept=".eml,.msg,.mbox"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-muted-foreground mt-2">
                  Supports .eml, .msg, and .mbox files. Drag and drop or click to select.
                </p>
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Parsing emails...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium mb-2">1. Upload Emails</h4>
              <p className="text-sm text-muted-foreground">
                Upload email files containing candidate submissions and client communications
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium mb-2">2. Smart Parsing</h4>
              <p className="text-sm text-muted-foreground">
                AI automatically detects JD codes, clients, and extracts candidate information
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium mb-2">3. Review & Process</h4>
              <p className="text-sm text-muted-foreground">
                Review parsed data, make corrections, and process into the system
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parsed Emails Table */}
      {emailPreviews.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Parsed Emails ({emailPreviews.length})</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedEmails.length === emailPreviews.length) {
                        setSelectedEmails([])
                      } else {
                        setSelectedEmails(emailPreviews.map(e => e.messageId))
                      }
                    }}
                  >
                    {selectedEmails.length === emailPreviews.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    onClick={handleProcessEmails}
                    disabled={selectedEmails.length === 0 || isProcessing}
                  >
                    {isProcessing ? 'Processing...' : `Process Selected (${selectedEmails.length})`}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={emailPreviews}
                columns={columns}
                loading={false}
              />
            </CardContent>
          </Card>

          {/* Processing Summary */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {emailPreviews.filter(e => e.detectedJdCode).length}
                  </div>
                  <p className="text-sm text-muted-foreground">JD Codes Detected</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {emailPreviews.filter(e => e.guessedClient).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Clients Identified</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {emailPreviews.reduce((sum, e) => sum + (e.parsedCandidates?.length || 0), 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Candidates Found</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {emailPreviews.reduce((sum, e) => sum + e.attachments.length, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Attachments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}