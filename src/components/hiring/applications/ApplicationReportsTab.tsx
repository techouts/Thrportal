import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, Users, Target, Clock, AlertTriangle } from 'lucide-react';

interface JDPipelineReport {
  jdId: string;
  jdTitle: string;
  client: string;
  submissions: number;
  shortlistPercent: number;
  interviewPercent: number;
  offerPercent: number;
  joinPercent: number;
  conversionRate: number;
}

interface RecruiterConversionReport {
  recruiterId: string;
  recruiterName: string;
  type: 'Submitter' | 'Primary';
  submissions: number;
  joins: number;
  conversionRate: number;
  credits: number;
}

interface SLAComplianceReport {
  metric: string;
  target: string;
  actual: string;
  compliance: number;
  status: 'Good' | 'Warning' | 'Critical';
}

interface ClientSPOCReport {
  client: string;
  spoc: string;
  avgFeedbackTime: number;
  acceptanceRate: number;
  pendingFeedback: number;
  responseTime: 'Fast' | 'Average' | 'Slow';
}

export function ApplicationReportsTab() {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [jdPipelineData, setJdPipelineData] = useState<JDPipelineReport[]>([]);
  const [recruiterData, setRecruiterData] = useState<RecruiterConversionReport[]>([]);
  const [slaData, setSlaData] = useState<SLAComplianceReport[]>([]);
  const [clientData, setClientData] = useState<ClientSPOCReport[]>([]);

  useEffect(() => {
    loadReportsData();
  }, [selectedPeriod]);

  const loadReportsData = async () => {
    setLoading(true);
    
    // Mock JD Pipeline data
    const mockJDPipeline: JDPipelineReport[] = [
      {
        jdId: 'jd-001',
        jdTitle: 'Senior React Developer',
        client: 'TechCorp Inc',
        submissions: 25,
        shortlistPercent: 68,
        interviewPercent: 45,
        offerPercent: 25,
        joinPercent: 18,
        conversionRate: 18
      },
      {
        jdId: 'jd-002',
        jdTitle: 'Python Backend Engineer',
        client: 'DataFlow Solutions',
        submissions: 18,
        shortlistPercent: 72,
        interviewPercent: 55,
        offerPercent: 33,
        joinPercent: 28,
        conversionRate: 28
      },
      {
        jdId: 'jd-003',
        jdTitle: 'Full Stack Developer',
        client: 'StartupXYZ',
        submissions: 32,
        shortlistPercent: 62,
        interviewPercent: 38,
        offerPercent: 22,
        joinPercent: 16,
        conversionRate: 16
      },
      {
        jdId: 'jd-004',
        jdTitle: 'DevOps Engineer',
        client: 'CloudTech Ltd',
        submissions: 15,
        shortlistPercent: 80,
        interviewPercent: 60,
        offerPercent: 40,
        joinPercent: 33,
        conversionRate: 33
      }
    ];

    // Mock Recruiter Conversion data
    const mockRecruiterData: RecruiterConversionReport[] = [
      {
        recruiterId: 'rec-001',
        recruiterName: 'Sarah Johnson',
        type: 'Submitter',
        submissions: 45,
        joins: 12,
        conversionRate: 26.7,
        credits: 45
      },
      {
        recruiterId: 'rec-001',
        recruiterName: 'Sarah Johnson',
        type: 'Primary',
        submissions: 32,
        joins: 8,
        conversionRate: 25.0,
        credits: 8
      },
      {
        recruiterId: 'rec-002',
        recruiterName: 'Mike Rodriguez',
        type: 'Submitter',
        submissions: 38,
        joins: 9,
        conversionRate: 23.7,
        credits: 38
      },
      {
        recruiterId: 'rec-002',
        recruiterName: 'Mike Rodriguez',
        type: 'Primary',
        submissions: 28,
        joins: 7,
        conversionRate: 25.0,
        credits: 7
      }
    ];

    // Mock SLA Compliance data
    const mockSLAData: SLAComplianceReport[] = [
      {
        metric: 'First Submission',
        target: '< 48 hours',
        actual: '36 hours',
        compliance: 85,
        status: 'Good'
      },
      {
        metric: 'Client Feedback',
        target: '< 72 hours',
        actual: '96 hours',
        compliance: 65,
        status: 'Warning'
      },
      {
        metric: 'Offer Turnaround',
        target: '< 5 days',
        actual: '7 days',
        compliance: 45,
        status: 'Critical'
      },
      {
        metric: 'Interview Scheduling',
        target: '< 24 hours',
        actual: '18 hours',
        compliance: 92,
        status: 'Good'
      }
    ];

    // Mock Client SPOC data
    const mockClientData: ClientSPOCReport[] = [
      {
        client: 'TechCorp Inc',
        spoc: 'Alice Johnson',
        avgFeedbackTime: 2.5,
        acceptanceRate: 68,
        pendingFeedback: 3,
        responseTime: 'Fast'
      },
      {
        client: 'DataFlow Solutions',
        spoc: 'Bob Smith',
        avgFeedbackTime: 4.2,
        acceptanceRate: 72,
        pendingFeedback: 1,
        responseTime: 'Average'
      },
      {
        client: 'StartupXYZ',
        spoc: 'Carol Wilson',
        avgFeedbackTime: 6.8,
        acceptanceRate: 45,
        pendingFeedback: 8,
        responseTime: 'Slow'
      },
      {
        client: 'CloudTech Ltd',
        spoc: 'David Brown',
        avgFeedbackTime: 1.8,
        acceptanceRate: 85,
        pendingFeedback: 0,
        responseTime: 'Fast'
      }
    ];

    setJdPipelineData(mockJDPipeline);
    setRecruiterData(mockRecruiterData);
    setSlaData(mockSLAData);
    setClientData(mockClientData);
    setLoading(false);
  };

  const getSLAStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Good': return 'default';
      case 'Warning': return 'secondary';
      case 'Critical': return 'destructive';
      default: return 'secondary';
    }
  };

  const getResponseTimeBadgeVariant = (responseTime: string) => {
    switch (responseTime) {
      case 'Fast': return 'default';
      case 'Average': return 'secondary';
      case 'Slow': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Application Reports</h2>
          <p className="text-muted-foreground">Comprehensive analytics and performance metrics</p>
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

      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pipeline">JD Pipeline</TabsTrigger>
          <TabsTrigger value="recruiter">Recruiter Performance</TabsTrigger>
          <TabsTrigger value="sla">SLA Compliance</TabsTrigger>
          <TabsTrigger value="client">Client SPOC</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                JD Pipeline Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">JD</th>
                      <th className="text-left p-3 font-medium">Client</th>
                      <th className="text-left p-3 font-medium">Submissions</th>
                      <th className="text-left p-3 font-medium">Shortlist %</th>
                      <th className="text-left p-3 font-medium">Interview %</th>
                      <th className="text-left p-3 font-medium">Offer %</th>
                      <th className="text-left p-3 font-medium">Join %</th>
                      <th className="text-left p-3 font-medium">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jdPipelineData.map((jd) => (
                      <tr key={jd.jdId} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{jd.jdTitle}</div>
                            <div className="text-sm text-muted-foreground">{jd.jdId}</div>
                          </div>
                        </td>
                        <td className="p-3">{jd.client}</td>
                        <td className="p-3 font-medium">{jd.submissions}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2 max-w-16">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${jd.shortlistPercent}%` }}
                              />
                            </div>
                            <span className="text-sm">{jd.shortlistPercent}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2 max-w-16">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${jd.interviewPercent}%` }}
                              />
                            </div>
                            <span className="text-sm">{jd.interviewPercent}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2 max-w-16">
                              <div 
                                className="bg-purple-500 h-2 rounded-full" 
                                style={{ width: `${jd.offerPercent}%` }}
                              />
                            </div>
                            <span className="text-sm">{jd.offerPercent}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2 max-w-16">
                              <div 
                                className="bg-orange-500 h-2 rounded-full" 
                                style={{ width: `${jd.joinPercent}%` }}
                              />
                            </div>
                            <span className="text-sm">{jd.joinPercent}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={jd.conversionRate >= 25 ? 'default' : 'secondary'}>
                            {jd.conversionRate}%
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

        <TabsContent value="recruiter" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recruiter Conversion Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Recruiter</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Submissions</th>
                      <th className="text-left p-3 font-medium">Joins</th>
                      <th className="text-left p-3 font-medium">Conversion Rate</th>
                      <th className="text-left p-3 font-medium">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recruiterData.map((recruiter, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{recruiter.recruiterName}</td>
                        <td className="p-3">
                          <Badge variant={recruiter.type === 'Primary' ? 'default' : 'secondary'}>
                            {recruiter.type}
                          </Badge>
                        </td>
                        <td className="p-3">{recruiter.submissions}</td>
                        <td className="p-3">{recruiter.joins}</td>
                        <td className="p-3">
                          <Badge variant={recruiter.conversionRate >= 25 ? 'default' : 'secondary'}>
                            {recruiter.conversionRate}%
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span className="font-medium">
                            {recruiter.type === 'Primary' ? recruiter.credits * 0.25 : recruiter.credits * 1.0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium mb-2">Credit Allocation Rules</div>
                <div className="text-sm text-muted-foreground">
                  • Submitter Credit: 1.0 per submission<br />
                  • Primary Credit: 0.25 per submission managed
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                SLA Compliance Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {slaData.map((sla, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{sla.metric}</div>
                      <div className="text-sm text-muted-foreground">
                        Target: {sla.target} | Actual: {sla.actual}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{sla.compliance}%</div>
                        <div className="text-sm text-muted-foreground">Compliance</div>
                      </div>
                      <Badge variant={getSLAStatusBadgeVariant(sla.status)}>
                        {sla.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 border rounded-lg bg-yellow-50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">SLA Improvement Areas</span>
                </div>
                <div className="text-sm text-yellow-700">
                  • Client feedback turnaround needs attention<br />
                  • Offer processing time exceeds target significantly
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="client" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Client SPOC Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Client</th>
                      <th className="text-left p-3 font-medium">SPOC</th>
                      <th className="text-left p-3 font-medium">Avg Feedback Time</th>
                      <th className="text-left p-3 font-medium">Acceptance Rate</th>
                      <th className="text-left p-3 font-medium">Pending Feedback</th>
                      <th className="text-left p-3 font-medium">Response Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientData.map((client, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{client.client}</td>
                        <td className="p-3">{client.spoc}</td>
                        <td className="p-3">{client.avgFeedbackTime} days</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2 max-w-16">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${client.acceptanceRate}%` }}
                              />
                            </div>
                            <span className="text-sm">{client.acceptanceRate}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          {client.pendingFeedback > 0 ? (
                            <Badge variant="destructive">{client.pendingFeedback}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge variant={getResponseTimeBadgeVariant(client.responseTime)}>
                            {client.responseTime}
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
      </Tabs>
    </div>
  );
}