import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { candidatesService } from '@/services/candidatesService';
import type { CandidateExperience } from '@/types/candidates';
import { Briefcase } from 'lucide-react';

interface CandidateExperienceTabProps {
  candidateId: string;
}

export function CandidateExperienceTab({ candidateId }: CandidateExperienceTabProps) {
  const [experiences, setExperiences] = useState<CandidateExperience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperiences();
  }, [candidateId]);

  const loadExperiences = async () => {
    try {
      const data = await candidatesService.getCandidateExperience(candidateId);
      setExperiences(data);
    } catch (error) {
      console.error('Failed to load experience:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Work Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Experience</CardTitle>
      </CardHeader>
      <CardContent>
        {experiences.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No work experience found</p>
        ) : (
          <div className="space-y-6">
            {experiences.map((exp) => (
              <div key={exp.id} className="border-l-2 border-primary pl-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <h3 className="font-semibold">{exp.designation}</h3>
                      {exp.isCurrent && <Badge>Current</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-sm">{exp.description}</p>
                )}
                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {exp.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
