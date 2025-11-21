import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share } from 'lucide-react';
import { ownershipService } from '@/services/ownershipService';
import { TalentPoolOwnership } from '@/types/ownership';

export function TalentPoolsOwnershipTab() {
  const [pools, setPools] = useState<TalentPoolOwnership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    setLoading(true);
    try {
      const data = await ownershipService.getTalentPoolOwnerships();
      setPools(data);
    } catch (error) {
      console.error('Failed to load talent pools:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Talent Pool Ownership</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage access controls and ownership for talent pools
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Pool Name</th>
                    <th className="text-left p-2">Owner</th>
                    <th className="text-left p-2">Candidates</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pools.map((pool) => (
                    <tr key={pool.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{pool.poolName}</td>
                      <td className="p-2">{pool.owner}</td>
                      <td className="p-2">{pool.candidateCount}</td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}