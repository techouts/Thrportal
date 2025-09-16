import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Map } from 'lucide-react'

interface ApplicationMappingTabProps {
  applicationId: string
  candidateId: string
  jdId: string
}

export const ApplicationMappingTab: React.FC<ApplicationMappingTabProps> = ({ 
  applicationId, 
  candidateId, 
  jdId 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5" />
          Mapping Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Advanced mapping functionality for finding best JDs for candidates and vice versa will be implemented here.
        </p>
      </CardContent>
    </Card>
  )
}