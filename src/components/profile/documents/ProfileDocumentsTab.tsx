import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Briefcase, GraduationCap, CreditCard, FileText, Loader2 } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { getEmployeeDocuments } from '@/services/employeeDocumentService'
import type { EmployeeDocuments } from '@/types/employeeDocuments'
import PreviousEmploymentSection from './PreviousEmploymentSection'
import EducationalDocumentsSection from './EducationalDocumentsSection'
import IdentityDocumentsSection from './IdentityDocumentsSection'
import OfferLetterSection from './OfferLetterSection'

interface ProfileDocumentsTabProps {
  isOwnProfile?: boolean
  employeeId?: string
}

const folders = [
  { id: 'previous-employment', label: 'Previous Employment', icon: Briefcase },
  { id: 'educational', label: 'Educational Documents', icon: GraduationCap },
  { id: 'identity', label: 'Identity Documents', icon: CreditCard },
  { id: 'offer-letter', label: 'Offer Letter', icon: FileText },
]

export default function ProfileDocumentsTab({ isOwnProfile = true, employeeId }: ProfileDocumentsTabProps) {
  const { user } = useAuth()
  const [selectedFolder, setSelectedFolder] = useState('previous-employment')
  const [documents, setDocuments] = useState<EmployeeDocuments | null>(null)
  const [loading, setLoading] = useState(true)

  const userId = employeeId || user?.id

  useEffect(() => {
    async function fetchDocuments() {
      if (!userId) {
        setLoading(false)
        return
      }

      setLoading(true)
      const data = await getEmployeeDocuments(userId)
      setDocuments(data)
      setLoading(false)
    }

    fetchDocuments()
  }, [userId])

  const handleDocumentsUpdate = async () => {
    if (!userId) return
    const data = await getEmployeeDocuments(userId)
    setDocuments(data)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Sidebar */}
      <div className="col-span-12 md:col-span-3">
        <Card className="p-2">
          <nav className="space-y-1">
            {folders.map((folder) => {
              const Icon = folder.icon
              return (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left",
                    selectedFolder === folder.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{folder.label}</span>
                </button>
              )
            })}
          </nav>
        </Card>
      </div>

      {/* Content Area */}
      <div className="col-span-12 md:col-span-9">
        {selectedFolder === 'previous-employment' && (
          <PreviousEmploymentSection 
            data={documents?.work_experience || []}
            isOwnProfile={isOwnProfile}
            userId={userId || ''}
            onUpdate={handleDocumentsUpdate}
          />
        )}
        {selectedFolder === 'educational' && (
          <EducationalDocumentsSection 
            data={documents?.education_details || []}
            isOwnProfile={isOwnProfile}
            userId={userId || ''}
            onUpdate={handleDocumentsUpdate}
          />
        )}
        {selectedFolder === 'identity' && (
          <IdentityDocumentsSection 
            data={documents?.identity_documents || {}}
            isOwnProfile={isOwnProfile}
            userId={userId || ''}
            onUpdate={handleDocumentsUpdate}
          />
        )}
        {selectedFolder === 'offer-letter' && (
          <OfferLetterSection 
            url={documents?.offer_letter_url}
            isOwnProfile={isOwnProfile}
            userId={userId || ''}
            onUpdate={handleDocumentsUpdate}
          />
        )}
      </div>
    </div>
  )
}
