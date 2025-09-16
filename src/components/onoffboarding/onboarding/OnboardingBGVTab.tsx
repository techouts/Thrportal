import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { OnOffboardingService } from '@/services/onoffboardingService';
import type { BGVCase } from '@/types/onoffboarding';
import { useToast } from '@/hooks/use-toast';
import { Shield, Clock, CheckCircle, XCircle, TrendingUp, DollarSign } from 'lucide-react';

export const OnboardingBGVTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [bgvCases, setBgvCases] = useState<BGVCase[]>([]);
  const [stats, setStats] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    loadBGVData();
  }, []);

  const loadBGVData = async () => {
    try {
      const [casesResponse, statsResponse] = await Promise.all([
        OnOffboardingService.getBGVCases(),
        OnOffboardingService.getBGVStats()
      ]);

      if (casesResponse.success) {
        setBgvCases(casesResponse.data);
      }
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading BGV data:', error);
      toast({
        title: "Error",
        description: "Failed to load BGV data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'initiated': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCheckStatusIcon = (status: string) => {
    switch (status) {
      case 'clear': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'adverse': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Background Verification</h3>
          <p className="text-sm text-muted-foreground">
            Monitor BGV progress, costs, and compliance
          </p>
        </div>
        <Button variant="outline" onClick={loadBGVData}>
          Refresh
        </Button>
      </div>

      {/* BGV Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingVerifications || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg TAT (Days)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgTAT || 0}</div>
            <p className="text-xs text-muted-foreground">
              Target: 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failureRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.failedCases || 0} failed out of {stats.totalCases || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalCost?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg ₹{stats.avgCostPerCase || 0} per case
            </p>
          </CardContent>
        </Card>
      </div>

      {/* BGV Cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bgvCases.map((bgvCase) => (
          <Card key={bgvCase.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{bgvCase.candidateName}</CardTitle>
                  <CardDescription className="text-sm">
                    {bgvCase.position} • {bgvCase.department}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(bgvCase.status)}>
                  {bgvCase.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Vendor</div>
                  <div className="font-medium">{bgvCase.vendor}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">TAT</div>
                  <div className="font-medium">{bgvCase.tat} days</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Verification Checks</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Identity</span>
                    {getCheckStatusIcon(bgvCase.checks.identity)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Education</span>
                    {getCheckStatusIcon(bgvCase.checks.education)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Employment</span>
                    {getCheckStatusIcon(bgvCase.checks.employment)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Criminal</span>
                    {getCheckStatusIcon(bgvCase.checks.criminal)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Overall Result</span>
                <span className="text-sm font-bold">
                  {bgvCase.overallResult.toUpperCase()}
                </span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {bgvCases.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No BGV cases found</h3>
          <p className="text-muted-foreground">
            No background verification cases in progress.
          </p>
        </div>
      )}
    </div>
  );
};