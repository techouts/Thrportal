import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { candidatesService } from '@/services/candidatesService';
import type { CandidateOffer } from '@/types/candidates';
import { DollarSign } from 'lucide-react';

interface CandidateOfferTabProps {
  candidateId: string;
}

export function CandidateOfferTab({ candidateId }: CandidateOfferTabProps) {
  const [offers, setOffers] = useState<CandidateOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, [candidateId]);

  const loadOffers = async () => {
    try {
      const data = await candidatesService.getCandidateOffers(candidateId);
      setOffers(data);
    } catch (error) {
      console.error('Failed to load offers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Offer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Offer Details</CardTitle>
      </CardHeader>
      <CardContent>
        {offers.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No offers found</p>
        ) : (
          <div className="space-y-6">
            {offers.map((offer) => (
              <div key={offer.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{offer.designation}</h3>
                    <p className="text-sm text-muted-foreground">{offer.location}</p>
                  </div>
                  <Badge>{offer.status}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Annual CTC</label>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <p className="font-semibold">{offer.ctc.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Joining Date</label>
                    <p className="font-medium">{new Date(offer.joiningDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
