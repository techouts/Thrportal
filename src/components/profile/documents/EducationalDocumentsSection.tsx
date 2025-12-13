import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Plus, Upload, Trash2, FileText, Loader2, GraduationCap } from 'lucide-react'
import type { EducationDetail } from '@/types/employeeDocuments'
import { updateEducationDetails, uploadEmployeeDocument, deleteEmployeeDocument } from '@/services/employeeDocumentService'
import { DeleteConfirmationDialog } from '@/components/timesheet/DeleteConfirmationDialog'

interface EducationalDocumentsSectionProps {
  data: EducationDetail[]
  isOwnProfile: boolean
  userId: string
  onUpdate: () => void
}

export default function EducationalDocumentsSection({ data, isOwnProfile, userId, onUpdate }: EducationalDocumentsSectionProps) {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingEntry, setDeletingEntry] = useState<EducationDetail | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<EducationDetail>>({
    degree: '',
    branch: '',
    from_year: new Date().getFullYear() - 4,
    to_year: new Date().getFullYear(),
    cgpa: undefined,
    university: ''
  })

  const handleAddEducation = async () => {
    if (!formData.degree || !formData.branch || !formData.university) {
      toast({
        title: 'Validation Error',
        description: 'Degree, Branch, and University are required.',
        variant: 'destructive'
      })
      return
    }

    setSaving(true)
    const newEntry: EducationDetail = {
      id: crypto.randomUUID(),
      degree: formData.degree,
      branch: formData.branch,
      from_year: formData.from_year || new Date().getFullYear() - 4,
      to_year: formData.to_year || new Date().getFullYear(),
      cgpa: formData.cgpa,
      university: formData.university
    }

    const updated = [...data, newEntry]
    const success = await updateEducationDetails(userId, updated)

    if (success) {
      toast({ title: 'Success', description: 'Education added.' })
      setFormData({ degree: '', branch: '', from_year: new Date().getFullYear() - 4, to_year: new Date().getFullYear(), cgpa: undefined, university: '' })
      setIsDialogOpen(false)
      onUpdate()
    } else {
      toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const entry = data.find(e => e.id === id)
    if (entry?.document_url) {
      await deleteEmployeeDocument(entry.document_url)
    }
    const updated = data.filter(e => e.id !== id)
    const success = await updateEducationDetails(userId, updated)
    if (success) {
      toast({ title: 'Deleted', description: 'Education removed.' })
      onUpdate()
    }
  }

  const handleUploadClick = (id: string) => {
    setCurrentUploadId(id)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUploadId) return

    setUploadingId(currentUploadId)
    const url = await uploadEmployeeDocument(userId, file, 'education', currentUploadId)

    if (url) {
      const updated = data.map(entry =>
        entry.id === currentUploadId ? { ...entry, document_url: url } : entry
      )
      await updateEducationDetails(userId, updated)
      toast({ title: 'Uploaded', description: 'Document uploaded successfully.' })
      onUpdate()
    } else {
      toast({ title: 'Error', description: 'Upload failed.', variant: 'destructive' })
    }
    setUploadingId(null)
    setCurrentUploadId(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Educational Documents
        </CardTitle>
        {isOwnProfile && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Education</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Degree *</Label>
                  <Input
                    value={formData.degree}
                    onChange={(e) => setFormData(p => ({ ...p, degree: e.target.value }))}
                    placeholder="e.g. B.Tech"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Branch *</Label>
                  <Input
                    value={formData.branch}
                    onChange={(e) => setFormData(p => ({ ...p, branch: e.target.value }))}
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From Year</Label>
                    <Input
                      type="number"
                      min={1980}
                      max={new Date().getFullYear()}
                      value={formData.from_year}
                      onChange={(e) => setFormData(p => ({ ...p, from_year: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To Year</Label>
                    <Input
                      type="number"
                      min={1980}
                      max={new Date().getFullYear() + 6}
                      value={formData.to_year}
                      onChange={(e) => setFormData(p => ({ ...p, to_year: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CGPA/Percentage</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.cgpa || ''}
                      onChange={(e) => setFormData(p => ({ ...p, cgpa: parseFloat(e.target.value) || undefined }))}
                      placeholder="e.g. 8.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>University *</Label>
                    <Input
                      value={formData.university}
                      onChange={(e) => setFormData(p => ({ ...p, university: e.target.value }))}
                      placeholder="e.g. JNTU"
                    />
                  </div>
                </div>
                <Button onClick={handleAddEducation} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Add Education
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={handleFileChange}
        />
        {data.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No education records added yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Degree</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>CGPA</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Documents</TableHead>
                {isOwnProfile && <TableHead className="w-[100px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.degree}</TableCell>
                  <TableCell>{entry.branch}</TableCell>
                  <TableCell>{entry.from_year}</TableCell>
                  <TableCell>{entry.to_year}</TableCell>
                  <TableCell>{entry.cgpa || '-'}</TableCell>
                  <TableCell>{entry.university}</TableCell>
                  <TableCell>
                    {entry.document_url ? (
                      <a href={entry.document_url} target="_blank" rel="noopener noreferrer">
                        <Badge variant="secondary" className="gap-1 cursor-pointer">
                          <FileText className="h-3 w-3" />
                          View
                        </Badge>
                      </a>
                    ) : isOwnProfile ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUploadClick(entry.id)}
                        disabled={uploadingId === entry.id}
                      >
                        {uploadingId === entry.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </>
                        )}
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  {isOwnProfile && (
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setDeletingEntry(entry)
                        setDeleteDialogOpen(true)
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Education Record"
        description={`Are you sure you want to delete this education record${deletingEntry?.degree ? ` for "${deletingEntry.degree} - ${deletingEntry.university}"` : ''}?`}
        warningMessage="This will also remove any uploaded documents for this entry."
        onConfirm={() => {
          if (deletingEntry) handleDelete(deletingEntry.id)
          setDeleteDialogOpen(false)
          setDeletingEntry(null)
        }}
      />
    </Card>
  )
}
