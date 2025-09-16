import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { OnOffboardingService } from '@/services/onoffboardingService';
import type { OnboardingCandidate } from '@/types/onoffboarding';
import { useToast } from '@/hooks/use-toast';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Shield, 
  Calendar,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export const OnboardingCandidatePipelineTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<OnboardingCandidate[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<OnboardingCandidate | null>(null);
  const [dropoutReason, setDropoutReason] = useState('');
  const [dropoutComments, setDropoutComments] = useState('');
  const [dropoutDialogOpen, setDropoutDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const response = await OnOffboardingService.getOnboardingCandidates();
      if (response.success) {
        setCandidates(response.data);
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast({
        title: "Error",
        description: "Failed to load candidates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDropout = async () => {
    if (!selectedCandidate || !dropoutReason) return;

    try {
      const response = await OnOffboardingService.markCandidateDropout(
        selectedCandidate.id,
        dropoutReason as any,
        dropoutComments
      );
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Candidate marked as dropout and synced with Hiring Pipeline",
        });
        setDropoutDialogOpen(false);
        setDropoutReason('');
        setDropoutComments('');
        setSelectedCandidate(null);
        loadCandidates();
      }
    } catch (error) {
      console.error('Error marking dropout:', error);
      toast({
        title: "Error",
        description: "Failed to mark candidate as dropout",
        variant: "destructive",
      });
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'offer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pre_onboarding': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'bgv': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'day_1': return 'bg-green-100 text-green-800 border-green-200';
      case 'post_joining': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'dropout': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBgvStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'in_progress': return 'text-yellow-600';
      case 'initiated': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStageSteps = (stage: string) => {
    const steps = ['offer', 'pre_onboarding', 'bgv', 'day_1', 'post_joining', 'completed'];
    const currentIndex = steps.indexOf(stage);
    return steps.map((step, index) => ({
      step,
      completed: index < currentIndex,
      current: index === currentIndex,
      upcoming: index > currentIndex
    }));
  };

  const filteredCandidates = candidates.filter(candidate => {
    if (filter === 'all') return true;
    if (filter === 'active') return candidate.status !== 'dropped_out';
    if (filter === 'dropout') return candidate.status === 'dropped_out';
    return candidate.stage === filter;
  });

  const candidateCounts = {
    all: candidates.length,
    offer: candidates.filter(c => c.stage === 'offer').length,
    pre_onboarding: candidates.filter(c => c.stage === 'pre_onboarding').length,
    bgv: candidates.filter(c => c.stage === 'bgv').length,
    day_1: candidates.filter(c => c.stage === 'day_1').length,
    post_joining: candidates.filter(c => c.stage === 'post_joining').length,
    completed: candidates.filter(c => c.stage === 'completed').length,
    dropout: candidates.filter(c => c.status === 'dropped_out').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Candidate Pipeline</h3>
          <p className="text-sm text-muted-foreground">
            Track candidates from offer to successful onboarding
          </p>
        </div>
        <Button variant="outline" onClick={loadCandidates}>
          Refresh
        </Button>
      </div>

      {/* Stage Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card 
          className={`cursor-pointer transition-colors ${filter === 'all' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('all')}
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{candidateCounts.all}</div>
            <div className="text-xs text-muted-foreground">All Candidates</div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-colors ${filter === 'offer' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('offer')}
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{candidateCounts.offer}</div>
            <div className="text-xs text-muted-foreground">Offer</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${filter === 'pre_onboarding' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('pre_onboarding')}
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{candidateCounts.pre_onboarding}</div>
            <div className="text-xs text-muted-foreground">Pre-Onboarding</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${filter === 'bgv' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('bgv')}
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{candidateCounts.bgv}</div>
            <div className="text-xs text-muted-foreground">BGV</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${filter === 'day_1' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('day_1')}
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{candidateCounts.day_1}</div>
            <div className="text-xs text-muted-foreground">Day 1</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${filter === 'post_joining' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('post_joining')}
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{candidateCounts.post_joining}</div>
            <div className="text-xs text-muted-foreground">Post-Joining</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${filter === 'completed' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('completed')}
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{candidateCounts.completed}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${filter === 'dropout' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('dropout')}
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{candidateCounts.dropout}</div>
            <div className="text-xs text-muted-foreground">Dropouts</div>
          </CardContent>
        </Card>
      </div>

      {/* Candidates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{candidate.candidateName}</CardTitle>
                  <CardDescription className="text-sm">
                    {candidate.position} • {candidate.department}
                  </CardDescription>
                </div>
                <Badge className={getStageColor(candidate.stage)}>
                  {candidate.stage.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Pipeline Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{candidate.completionPercentage}%</span>
                </div>
                <Progress value={candidate.completionPercentage} className="h-2" />
              </div>

              {/* Stage Steps */}
              <div className="flex items-center justify-between text-xs">
                {getStageSteps(candidate.stage).map((step, index) => (
                  <div key={step.step} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full border-2 ${
                      step.completed 
                        ? 'bg-green-500 border-green-500' 
                        : step.current 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'bg-gray-200 border-gray-300'
                    }`} />
                    {index < getStageSteps(candidate.stage).length - 1 && (
                      <div className={`w-8 h-0.5 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Key Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Joining Date</div>
                  <div className="font-medium">{candidate.joiningDate}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Assigned To</div>
                  <div className="font-medium">{candidate.assignedTo}</div>
                </div>
              </div>

              {/* BGV Status */}
              {candidate.bgvStatus && candidate.stage !== 'dropout' && (
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4" />
                  <span className="text-muted-foreground">BGV:</span>
                  <span className={getBgvStatusColor(candidate.bgvStatus)}>
                    {candidate.bgvStatus.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              )}

              {/* Documents Status */}
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                <span className="text-muted-foreground">Documents:</span>
                <span className="font-medium">
                  {candidate.documentsUploaded}/{candidate.totalDocuments}
                </span>
              </div>

              {/* Compliance Checks */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">India Compliance</div>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <div className={`flex items-center gap-1 ${candidate.complianceChecks.pan ? 'text-green-600' : 'text-red-600'}`}>
                    {candidate.complianceChecks.pan ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    PAN
                  </div>
                  <div className={`flex items-center gap-1 ${candidate.complianceChecks.aadhaar ? 'text-green-600' : 'text-red-600'}`}>
                    {candidate.complianceChecks.aadhaar ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    Aadhaar
                  </div>
                  <div className={`flex items-center gap-1 ${candidate.complianceChecks.pfUan ? 'text-green-600' : 'text-red-600'}`}>
                    {candidate.complianceChecks.pfUan ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    PF/UAN
                  </div>
                  <div className={`flex items-center gap-1 ${candidate.complianceChecks.esic ? 'text-green-600' : 'text-red-600'}`}>
                    {candidate.complianceChecks.esic ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    ESIC
                  </div>
                  <div className={`flex items-center gap-1 ${candidate.complianceChecks.posh ? 'text-green-600' : 'text-red-600'}`}>
                    {candidate.complianceChecks.posh ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    POSH
                  </div>
                  <div className={`flex items-center gap-1 ${candidate.complianceChecks.dpdp ? 'text-green-600' : 'text-red-600'}`}>
                    {candidate.complianceChecks.dpdp ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    DPDP
                  </div>
                </div>
              </div>

              {/* Dropout Info */}
              {candidate.status === 'dropped_out' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-red-700">
                    <UserX className="h-4 w-4" />
                    <span className="font-medium">Dropped Out</span>
                  </div>
                  <div className="text-sm text-red-600">
                    <div><strong>Reason:</strong> {candidate.dropoutReason?.replace('_', ' ')}</div>
                    <div><strong>Date:</strong> {candidate.dropoutDate}</div>
                    {candidate.dropoutComments && (
                      <div><strong>Comments:</strong> {candidate.dropoutComments}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              {candidate.status !== 'dropped_out' && (
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      setSelectedCandidate(candidate);
                      setDropoutDialogOpen(true);
                    }}
                  >
                    Mark Dropout
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
          <p className="text-muted-foreground">
            {filter === 'all' 
              ? 'No candidates in the pipeline yet.' 
              : `No candidates in ${filter.replace('_', ' ')} stage.`}
          </p>
        </div>
      )}

      {/* Dropout Dialog */}
      <Dialog open={dropoutDialogOpen} onOpenChange={setDropoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Candidate as Dropout</DialogTitle>
            <DialogDescription>
              This will mark {selectedCandidate?.candidateName} as dropped out and sync the status back to the Hiring Pipeline.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Dropout Reason *</Label>
              <Select value={dropoutReason} onValueChange={setDropoutReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="better_offer">Better Offer</SelectItem>
                  <SelectItem value="compensation">Compensation Issues</SelectItem>
                  <SelectItem value="relocation">Relocation Issues</SelectItem>
                  <SelectItem value="bgv_fail">BGV Failed</SelectItem>
                  <SelectItem value="candidate_declined">Candidate Declined</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                value={dropoutComments}
                onChange={(e) => setDropoutComments(e.target.value)}
                placeholder="Additional details about the dropout..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDropoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDropout}
              disabled={!dropoutReason}
            >
              Mark as Dropout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};