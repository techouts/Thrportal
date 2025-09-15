import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CandidateProfile } from '@/types/candidates';

interface CandidateComplianceTabProps {
  candidate: CandidateProfile;
}

export function CandidateComplianceTab({ candidate }: CandidateComplianceTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance & Consent</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Consent Status</label>
            <p>{candidate.consent ? 'Provided' : 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium">GDPR Compliant</label>
            <p>{candidate.gdprCompliant ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}