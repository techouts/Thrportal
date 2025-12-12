import { useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Upload, FileText, Loader2, Trash2, File } from 'lucide-react'
import { uploadEmployeeDocument, updateOfferLetterUrl, deleteEmployeeDocument } from '@/services/employeeDocumentService'

interface OfferLetterSectionProps {
  url?: string | null
  isOwnProfile: boolean
  userId: string
  onUpdate: () => void
}

export default function OfferLetterSection({ url, isOwnProfile, userId, onUpdate }: OfferLetterSectionProps) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const uploadedUrl = await uploadEmployeeDocument(userId, file, 'offer-letter')

    if (uploadedUrl) {
      const success = await updateOfferLetterUrl(userId, uploadedUrl)
      if (success) {
        toast({ title: 'Uploaded', description: 'Offer letter uploaded successfully.' })
        onUpdate()
      } else {
        toast({ title: 'Error', description: 'Failed to save URL.', variant: 'destructive' })
      }
    } else {
      toast({ title: 'Error', description: 'Upload failed.', variant: 'destructive' })
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async () => {
    if (!url) return

    await deleteEmployeeDocument(url)
    const success = await updateOfferLetterUrl(userId, null)
    if (success) {
      toast({ title: 'Deleted', description: 'Offer letter removed.' })
      onUpdate()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Offer Letter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
        />

        {url ? (
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Offer Letter</p>
                <p className="text-sm text-muted-foreground">Company offer letter document</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Badge variant="secondary" className="gap-1 cursor-pointer">
                  <FileText className="h-3 w-3" />
                  View
                </Badge>
              </a>
              {isOwnProfile && (
                <Button variant="ghost" size="icon" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No offer letter uploaded yet.</p>
            {isOwnProfile && (
              <Button onClick={handleUploadClick} disabled={uploading}>
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload Offer Letter
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
