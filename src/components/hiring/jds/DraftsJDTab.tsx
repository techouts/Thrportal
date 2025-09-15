import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Send } from 'lucide-react';
import { JobDescription } from '@/types/hiring-extended';
import { hiringExtendedService } from '@/services/hiringExtendedService';
import { useToast } from '@/hooks/use-toast';

export function DraftsJDTab() {
  const [drafts, setDrafts] = useState<JobDescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      const jds = await hiringExtendedService.getJDs({ status: 'Draft' });
      setDrafts(jds);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load drafts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitForApproval = async (jdId: string) => {
    try {
      // In a real implementation, this would update the JD status
      toast({
        title: "Success",
        description: "JD submitted for approval"
      });
      await loadDrafts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit JD",
        variant: "destructive"
      });
    }
  };

  const deleteDraft = async (jdId: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;
    
    try {
      // In a real implementation, this would delete the JD
      toast({
        title: "Success",
        description: "Draft deleted successfully"
      });
      await loadDrafts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete draft",
        variant: "destructive"
      });
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'Manual':
        return <Badge variant="default">Manual</Badge>;
      case 'Excel':
        return <Badge variant="secondary">Excel</Badge>;
      case 'Smart':
        return <Badge variant="outline">AI Parsed</Badge>;
      default:
        return <Badge variant="secondary">{source}</Badge>;
    }
  };

  const formatCurrency = (amount: number | undefined, currency: string) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading drafts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Draft Job Descriptions</CardTitle>
      </CardHeader>
      <CardContent>
        {drafts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No drafts found. Create a JD using Manual, Excel, or Smart tabs.
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Openings</TableHead>
                  <TableHead>CTC Range</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drafts.map((draft) => (
                  <TableRow key={draft.id}>
                    <TableCell className="font-medium">
                      {draft.job_title}
                    </TableCell>
                    <TableCell>{draft.department}</TableCell>
                    <TableCell>{draft.openings}</TableCell>
                    <TableCell>
                      {draft.min_ctc_annual && draft.max_ctc_annual ? (
                        <>
                          {formatCurrency(draft.min_ctc_annual, draft.currency)} - {formatCurrency(draft.max_ctc_annual, draft.currency)}
                        </>
                      ) : (
                        'Not specified'
                      )}
                    </TableCell>
                    <TableCell>{getSourceBadge(draft.jd_source)}</TableCell>
                    <TableCell>
                      {new Date(draft.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            // Navigate to edit mode
                            toast({
                              title: "Info",
                              description: "Edit functionality would open the form with pre-filled data"
                            });
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => submitForApproval(draft.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteDraft(draft.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}