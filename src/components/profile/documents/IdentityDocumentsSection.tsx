import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Upload, FileText, Loader2, CreditCard, Eye, EyeOff, Trash2 } from 'lucide-react'
import type { IdentityDocuments, IdentityDocument } from '@/types/employeeDocuments'
import { updateIdentityDocuments, uploadEmployeeDocument, deleteEmployeeDocument } from '@/services/employeeDocumentService'
import { DeleteConfirmationDialog } from '@/components/timesheet/DeleteConfirmationDialog'

interface IdentityDocumentsSectionProps {
  data: IdentityDocuments
  isOwnProfile: boolean
  userId: string
  onUpdate: () => void
}

const identityTypes = [
  { key: 'aadhaar', label: 'Aadhaar Card', maskPattern: (n: string) => n.replace(/(\d{4})(\d{4})(\d{4})/, 'XXXX XXXX $3') },
  { key: 'pan', label: 'PAN Card', maskPattern: (n: string) => n.replace(/^(.{5})(.{4})(.)$/, 'XXXXX$2X') },
  { key: 'voter_id', label: 'Voter ID', maskPattern: (n: string) => n.replace(/^(.{3})(.*)(.{3})$/, 'XXX$2XXX') },
] as const

export default function IdentityDocumentsSection({ data, isOwnProfile, userId, onUpdate }: IdentityDocumentsSectionProps) {
  const { toast } = useToast()
  const [editingType, setEditingType] = useState<string | null>(null)
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [revealedNumbers, setRevealedNumbers] = useState<Set<string>>(new Set())
  const [numberInput, setNumberInput] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingDocType, setDeletingDocType] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentUploadType, setCurrentUploadType] = useState<string | null>(null)

  const handleSaveNumber = async (type: string) => {
    if (!numberInput.trim()) {
      toast({ title: 'Error', description: 'Please enter a valid number.', variant: 'destructive' })
      return
    }

    const updated: IdentityDocuments = {
      ...data,
      [type]: { ...(data[type as keyof IdentityDocuments] || {}), number: numberInput.trim() }
    }

    const success = await updateIdentityDocuments(userId, updated)
    if (success) {
      toast({ title: 'Saved', description: 'Document number updated.' })
      setEditingType(null)
      setNumberInput('')
      onUpdate()
    } else {
      toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' })
    }
  }

  const handleUploadClick = (type: string) => {
    setCurrentUploadType(type)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUploadType) return

    setUploadingType(currentUploadType)
    const url = await uploadEmployeeDocument(userId, file, 'identity', currentUploadType)

    if (url) {
      const updated: IdentityDocuments = {
        ...data,
        [currentUploadType]: { ...(data[currentUploadType as keyof IdentityDocuments] || {}), document_url: url }
      }
      await updateIdentityDocuments(userId, updated)
      toast({ title: 'Uploaded', description: 'Document uploaded successfully.' })
      onUpdate()
    } else {
      toast({ title: 'Error', description: 'Upload failed.', variant: 'destructive' })
    }
    setUploadingType(null)
    setCurrentUploadType(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDeleteDocument = async (type: string) => {
    const doc = data[type as keyof IdentityDocuments]
    if (doc?.document_url) {
      await deleteEmployeeDocument(doc.document_url)
    }
    const updated: IdentityDocuments = {
      ...data,
      [type]: { number: doc?.number || '' }
    }
    await updateIdentityDocuments(userId, updated)
    toast({ title: 'Deleted', description: 'Document removed.' })
    onUpdate()
  }

  const toggleReveal = (type: string) => {
    const newSet = new Set(revealedNumbers)
    if (newSet.has(type)) {
      newSet.delete(type)
    } else {
      newSet.add(type)
    }
    setRevealedNumbers(newSet)
  }

  const getMaskedNumber = (type: typeof identityTypes[number], doc?: IdentityDocument) => {
    if (!doc?.number) return 'Not provided'
    if (revealedNumbers.has(type.key)) return doc.number
    return type.maskPattern(doc.number)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Identity Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
        />

        {identityTypes.map((type) => {
          const doc = data[type.key as keyof IdentityDocuments]

          return (
            <Card key={type.key} className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">{type.label}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono text-sm">
                      {getMaskedNumber(type, doc)}
                    </span>
                    {doc?.number && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleReveal(type.key)}
                      >
                        {revealedNumbers.has(type.key) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {doc?.document_url ? (
                    <>
                      <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                        <Badge variant="secondary" className="gap-1 cursor-pointer">
                          <FileText className="h-3 w-3" />
                          View
                        </Badge>
                      </a>
                      {isOwnProfile && (
                        <Button variant="ghost" size="icon" onClick={() => {
                          setDeletingDocType(type.key)
                          setDeleteDialogOpen(true)
                        }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </>
                  ) : isOwnProfile ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUploadClick(type.key)}
                      disabled={uploadingType === type.key}
                    >
                      {uploadingType === type.key ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </>
                      )}
                    </Button>
                  ) : null}

                  {isOwnProfile && (
                    <Dialog open={editingType === type.key} onOpenChange={(open) => {
                      if (!open) {
                        setEditingType(null)
                        setNumberInput('')
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingType(type.key)
                            setNumberInput(doc?.number || '')
                          }}
                        >
                          {doc?.number ? 'Edit' : 'Add'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Enter {type.label} Number</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>{type.label} Number</Label>
                            <Input
                              value={numberInput}
                              onChange={(e) => setNumberInput(e.target.value)}
                              placeholder={type.key === 'aadhaar' ? 'XXXX XXXX XXXX' : type.key === 'pan' ? 'ABCDE1234F' : 'ABC1234567'}
                            />
                          </div>
                          <Button onClick={() => handleSaveNumber(type.key)} className="w-full">
                            Save
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </CardContent>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Document"
        description={`Are you sure you want to delete your ${identityTypes.find(t => t.key === deletingDocType)?.label || 'identity document'}?`}
        warningMessage="This action cannot be undone."
        onConfirm={() => {
          if (deletingDocType) handleDeleteDocument(deletingDocType)
          setDeleteDialogOpen(false)
          setDeletingDocType(null)
        }}
      />
    </Card>
  )
}
