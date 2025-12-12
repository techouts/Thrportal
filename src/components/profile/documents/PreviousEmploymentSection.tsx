import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Plus, Upload, Trash2, FileText, Loader2, Briefcase } from 'lucide-react'
import type { WorkExperience } from '@/types/employeeDocuments'
import { updateWorkExperience, uploadEmployeeDocument, deleteEmployeeDocument } from '@/services/employeeDocumentService'

interface PreviousEmploymentSectionProps {
  data: WorkExperience[]
  isOwnProfile: boolean
  userId: string
  onUpdate: () => void
}

export default function PreviousEmploymentSection({ data, isOwnProfile, userId, onUpdate }: PreviousEmploymentSectionProps) {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<WorkExperience>>({
    company: '',
    job_title: '',
    from_date: '',
    to_date: '',
    location: ''
  })

  const handleAddExperience = async () => {
    if (!formData.company || !formData.job_title || !formData.from_date) {
      toast({
        title: 'Validation Error',
        description: 'Company, Job Title, and From date are required.',
        variant: 'destructive'
      })
      return
    }

    setSaving(true)
    const newEntry: WorkExperience = {
      id: crypto.randomUUID(),
      company: formData.company,
      job_title: formData.job_title,
      from_date: formData.from_date,
      to_date: formData.to_date || null,
      location: formData.location || ''
    }

    const updated = [...data, newEntry]
    const success = await updateWorkExperience(userId, updated)

    if (success) {
      toast({ title: 'Success', description: 'Work experience added.' })
      setFormData({ company: '', job_title: '', from_date: '', to_date: '', location: '' })
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
    const success = await updateWorkExperience(userId, updated)
    if (success) {
      toast({ title: 'Deleted', description: 'Experience removed.' })
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
    const url = await uploadEmployeeDocument(userId, file, 'work-experience', currentUploadId)

    if (url) {
      const updated = data.map(entry =>
        entry.id === currentUploadId ? { ...entry, document_url: url } : entry
      )
      await updateWorkExperience(userId, updated)
      toast({ title: 'Uploaded', description: 'Document uploaded successfully.' })
      onUpdate()
    } else {
      toast({ title: 'Error', description: 'Upload failed.', variant: 'destructive' })
    }
    setUploadingId(null)
    setCurrentUploadId(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const [year, month] = dateStr.split('-')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Previous Employment
        </CardTitle>
        {isOwnProfile && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Work Experience</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData(p => ({ ...p, company: e.target.value }))}
                    placeholder="e.g. Google"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input
                    value={formData.job_title}
                    onChange={(e) => setFormData(p => ({ ...p, job_title: e.target.value }))}
                    placeholder="e.g. Senior Developer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From *</Label>
                    <Input
                      type="month"
                      value={formData.from_date}
                      onChange={(e) => setFormData(p => ({ ...p, from_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Input
                      type="month"
                      value={formData.to_date || ''}
                      onChange={(e) => setFormData(p => ({ ...p, to_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g. Hyderabad"
                  />
                </div>
                <Button onClick={handleAddExperience} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Add Experience
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
          <p className="text-muted-foreground text-center py-8">No work experience added yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Documents</TableHead>
                {isOwnProfile && <TableHead className="w-[100px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.company}</TableCell>
                  <TableCell>{entry.job_title}</TableCell>
                  <TableCell>{formatDate(entry.from_date)}</TableCell>
                  <TableCell>{entry.to_date ? formatDate(entry.to_date) : 'Present'}</TableCell>
                  <TableCell>{entry.location || '-'}</TableCell>
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
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
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
    </Card>
  )
}
