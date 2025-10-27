import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { candidatesService } from '@/services/candidatesService';
import type { CandidateEducation } from '@/types/candidates';
import { GraduationCap } from 'lucide-react';

interface CandidateEducationTabProps {
  candidateId: string;
}

export function CandidateEducationTab({ candidateId }: CandidateEducationTabProps) {
  const [education, setEducation] = useState<CandidateEducation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEducation();
  }, [candidateId]);

  const loadEducation = async () => {
    try {
      const data = await candidatesService.getCandidateEducation(candidateId);
      setEducation(data);
    } catch (error) {
      console.error('Failed to load education:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
      </CardHeader>
      <CardContent>
        {education.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No education details found</p>
        ) : (
          <div className="space-y-6">
            {education.map((edu) => (
              <div key={edu.id} className="border-l-2 border-primary pl-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      <h3 className="font-semibold">{edu.degree} in {edu.field}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground">
                      {edu.startYear} - {edu.endYear || 'Present'}
                    </span>
                    <Badge variant="outline" className="ml-2">{edu.type}</Badge>
                  </div>
                </div>
                {edu.grade && (
                  <p className="text-sm"><span className="font-medium">Grade:</span> {edu.grade}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
