import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

interface ApplicationNotesTabProps {
  applicationId: string
}

export const ApplicationNotesTab: React.FC<ApplicationNotesTabProps> = ({ applicationId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Notes functionality will be implemented here.</p>
      </CardContent>
    </Card>
  )
}