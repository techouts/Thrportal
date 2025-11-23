import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Edit, Save, X } from 'lucide-react'
import { ApplicationsService } from '@/services/applicationsService'
import { toast } from 'sonner'

interface ApplicationNotesTabProps {
  applicationId: string
}

export const ApplicationNotesTab: React.FC<ApplicationNotesTabProps> = ({ applicationId }) => {
  const [notes, setNotes] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotes()
  }, [applicationId])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const application = await ApplicationsService.getApplicationById(applicationId)
      const currentNotes = application?.notes || ''
      setNotes(currentNotes)
      setEditNotes(currentNotes)
    } catch (error) {
      console.error('Error loading notes:', error)
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditNotes(notes)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditNotes(notes)
    setIsEditing(false)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await ApplicationsService.updateApplicationNotes(applicationId, editNotes)
      setNotes(editNotes)
      setIsEditing(false)
      toast.success('Notes saved successfully')
    } catch (error: any) {
      console.error('Error saving notes:', error)
      toast.error('Failed to save notes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notes
          </CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {isEditing && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Add notes about this application..."
              className="min-h-[200px]"
            />
            <div className="text-xs text-muted-foreground">
              {editNotes.length} characters
            </div>
          </div>
        ) : (
          <div>
            {notes ? (
              <p className="whitespace-pre-wrap text-sm">{notes}</p>
            ) : (
              <p className="text-muted-foreground italic">No notes added yet</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
