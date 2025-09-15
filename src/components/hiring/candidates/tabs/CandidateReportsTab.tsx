import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Users, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SourceAnalytics {
  source: string;
  totalCandidates: number;
  shortlistedRate: number;
  submissionRate: number;
  offerRate: number;
  joinRate: number;
  avgQualityScore: number;
}

interface OwnershipDistribution {
  recruiterName: string;
  candidateCount: number;
  activeCount: number;
  newThisMonth: number;
  conversionRate: number;
}

interface ComplianceMetrics {
  totalCandidates: number;
  withConsent: number;
  gdprCompliant: number;
  bgvCompleted: number;
  consentPercentage: number;
  gdprPercentage: number;
  bgvPercentage: number;
}

interface DuplicateCandidate {
  candidateId: string;
  candidateName: string;
  email: string;
  phone: string;
  duplicateReason: 'Email' | 'Phone' | 'Resume Hash';
  confidence: number;
  potentialDuplicates: string[];
}

export function CandidateReportsTab() {
  const [loading, setLoading] = useState(true);
  const [sourceData, setSourceData] = useState<SourceAnalytics[]>([]);
  const [ownershipData, setOwnershipData] = useState<OwnershipDistribution[]>([]);
  const [complianceData, setComplianceData] = useState<ComplianceMetrics | null>(null);
  const [duplicatesData, setDuplicatesData] = useState<DuplicateCandidate[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    loadReportsData();
  }, [selectedPeriod]);

  const loadReportsData = async () => {
    setLoading(true);
    
    // Mock source analytics
    const mockSourceData: SourceAnalytics[] = [
      {
        source: 'LinkedIn',
        totalCandidates: 245,
        shortlistedRate: 68,
        submissionRate: 45,
        offerRate: 25,
        joinRate: 18,
        avgQualityScore: 8.2
      },
      {
        source: 'Job Board',
        totalCandidates: 180,
        shortlistedRate: 42,
        submissionRate: 28,
        offerRate: 16,
        joinRate: 12,
        avgQualityScore: 6.8
      },
      {
        source: 'Referral',
        totalCandidates: 95,
        shortlistedRate: 78,
        submissionRate: 65,
        offerRate: 45,
        joinRate: 38,
        avgQualityScore: 9.1
      },
      {
        source: 'Internal Pool',
        totalCandidates: 67,
        shortlistedRate: 85,
        submissionRate: 72,
        offerRate: 52,
        joinRate: 41,
        avgQualityScore: 8.9
      },
      {
        source: 'Direct Application',
        totalCandidates: 134,
        shortlistedRate: 35,
        submissionRate: 22,
        offerRate: 12,
        joinRate: 9,
        avgQualityScore: 5.8
      }
    ];

    // Mock ownership distribution
    const mockOwnershipData: OwnershipDistribution[] = [
      {
        recruiterName: 'Sarah Johnson',
        candidateCount: 145,
        activeCount: 89,
        newThisMonth: 23,
        conversionRate: 22.5
      },
      {
        recruiterName: 'Mike Rodriguez',
        candidateCount: 128,
        activeCount: 76,
        newThisMonth: 18,
        conversionRate: 19.8
      },
      {
        recruiterName: 'Lisa Thompson',
        candidateCount: 112,
        activeCount: 68,
        newThisMonth: 15,
        conversionRate: 25.1
      },
      {
        recruiterName: 'John Anderson',
        candidateCount: 98,
        activeCount: 54,
        newThisMonth: 12,
        conversionRate: 18.7
      },
      {
        recruiterName: 'Unassigned',
        candidateCount: 87,
        activeCount: 87,
        newThisMonth: 34,
        conversionRate: 0
      }
    ];

    // Mock compliance metrics
    const mockComplianceData: ComplianceMetrics = {
      totalCandidates: 570,
      withConsent: 485,
      gdprCompliant: 512,
      bgvCompleted: 234,
      consentPercentage: 85.1,
      gdprPercentage: 89.8,
      bgvPercentage: 41.1
    };

    // Mock duplicates
    const mockDuplicatesData: DuplicateCandidate[] = [
      {
        candidateId: 'candidate-123',
        candidateName: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0123',
        duplicateReason: 'Email',
        confidence: 95,
        potentialDuplicates: ['candidate-456', 'candidate-789']
      },
      {
        candidateId: 'candidate-234',
        candidateName: 'Emily Chen',
        email: 'e.chen@company.com',
        phone: '+1-555-0234',
        duplicateReason: 'Resume Hash',
        confidence: 87,
        potentialDuplicates: ['candidate-567']
      }
    ];

    setSourceData(mockSourceData);
    setOwnershipData(mockOwnershipData);
    setComplianceData(mockComplianceData);
    setDuplicatesData(mockDuplicatesData);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Candidate Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights into candidate sourcing and management</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="source" className="space-y-6">
        <TabsList>
          <TabsTrigger value="source">Source Analytics</TabsTrigger>
          <TabsTrigger value="ownership">Ownership Distribution</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Dashboard</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicate Detection</TabsTrigger>
        </TabsList>

        <TabsContent value="source" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Candidate Source Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Source</th>
                      <th className="text-left p-3 font-medium">Total Candidates</th>
                      <th className="text-left p-3 font-medium">Shortlisted %</th>
                      <th className="text-left p-3 font-medium">Submission %</th>
                      <th className="text-left p-3 font-medium">Offer %</th>
                      <th className="text-left p-3 font-medium">Join %</th>
                      <th className="text-left p-3 font-medium">Quality Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sourceData.map((source) => (
                      <tr key={source.source} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{source.source}</td>
                        <td className="p-3">{source.totalCandidates}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${source.shortlistedRate}%` }}
                              />
                            </div>
                            <span className="text-sm">{source.shortlistedRate}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${source.submissionRate}%` }}
                              />
                            </div>
                            <span className="text-sm">{source.submissionRate}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full" 
                                style={{ width: `${source.offerRate}%` }}
                              />
                            </div>
                            <span className="text-sm">{source.offerRate}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-orange-500 h-2 rounded-full" 
                                style={{ width: `${source.joinRate}%` }}
                              />
                            </div>
                            <span className="text-sm">{source.joinRate}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={source.avgQualityScore >= 8 ? 'default' : 'secondary'}>
                            {source.avgQualityScore}/10
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ownership" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recruiter-wise Candidate Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Recruiter</th>
                      <th className="text-left p-3 font-medium">Total Candidates</th>
                      <th className="text-left p-3 font-medium">Active</th>
                      <th className="text-left p-3 font-medium">New This Month</th>
                      <th className="text-left p-3 font-medium">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ownershipData.map((recruiter) => (
                      <tr key={recruiter.recruiterName} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">
                          {recruiter.recruiterName === 'Unassigned' ? (
                            <span className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                              {recruiter.recruiterName}
                            </span>
                          ) : (
                            recruiter.recruiterName
                          )}
                        </td>
                        <td className="p-3">{recruiter.candidateCount}</td>
                        <td className="p-3">{recruiter.activeCount}</td>
                        <td className="p-3">
                          <Badge variant="secondary">+{recruiter.newThisMonth}</Badge>
                        </td>
                        <td className="p-3">
                          {recruiter.conversionRate > 0 ? (
                            <Badge variant={recruiter.conversionRate >= 20 ? 'default' : 'secondary'}>
                              {recruiter.conversionRate}%
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {complianceData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Consent Coverage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{complianceData.consentPercentage}%</div>
                    <p className="text-sm text-muted-foreground">
                      {complianceData.withConsent} of {complianceData.totalCandidates} candidates
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">GDPR Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{complianceData.gdprPercentage}%</div>
                    <p className="text-sm text-muted-foreground">
                      {complianceData.gdprCompliant} of {complianceData.totalCandidates} candidates
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">BGV Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">{complianceData.bgvPercentage}%</div>
                    <p className="text-sm text-muted-foreground">
                      {complianceData.bgvCompleted} of {complianceData.totalCandidates} candidates
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Candidates without consent</h4>
                        <p className="text-sm text-muted-foreground">Require immediate attention</p>
                      </div>
                      <Badge variant="destructive">{complianceData.totalCandidates - complianceData.withConsent}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Non-GDPR compliant</h4>
                        <p className="text-sm text-muted-foreground">Data handling review needed</p>
                      </div>
                      <Badge variant="secondary">{complianceData.totalCandidates - complianceData.gdprCompliant}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Pending BGV</h4>
                        <p className="text-sm text-muted-foreground">Background verification pending</p>
                      </div>
                      <Badge variant="outline">{complianceData.totalCandidates - complianceData.bgvCompleted}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="duplicates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Suspected Duplicate Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {duplicatesData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Candidate</th>
                          <th className="text-left p-3 font-medium">Contact Info</th>
                          <th className="text-left p-3 font-medium">Duplicate Reason</th>
                          <th className="text-left p-3 font-medium">Confidence</th>
                          <th className="text-left p-3 font-medium">Potential Matches</th>
                          <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {duplicatesData.map((duplicate) => (
                          <tr key={duplicate.candidateId} className="border-b hover:bg-muted/50">
                            <td className="p-3">
                              <div>
                                <div className="font-medium">{duplicate.candidateName}</div>
                                <div className="text-sm text-muted-foreground">{duplicate.candidateId}</div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="text-sm">
                                <div>{duplicate.email}</div>
                                <div className="text-muted-foreground">{duplicate.phone}</div>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline">{duplicate.duplicateReason}</Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant={duplicate.confidence >= 90 ? 'destructive' : 'secondary'}>
                                {duplicate.confidence}%
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="text-sm">
                                {duplicate.potentialDuplicates.join(', ')}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">Review</Button>
                                <Button variant="outline" size="sm">Merge</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No Duplicates Found</h3>
                    <p className="text-muted-foreground">All candidates appear to be unique.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}