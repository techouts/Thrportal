import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

interface ApplicationDocumentsTabProps {
  applicationId: string
}

export const ApplicationDocumentsTab: React.FC<ApplicationDocumentsTabProps> = ({ applicationId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Documents functionality will be implemented here.</p>
      </CardContent>
    </Card>
  )
}