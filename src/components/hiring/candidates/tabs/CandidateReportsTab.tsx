import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Users, TrendingUp, Target, AlertTriangle } from 'lucide-react';
import { candidatesService } from '@/services/candidatesService';
import { CandidateReports } from '@/types/candidates';
import { ChartKit } from '@/components/shared/ChartKit';
import { KPICard } from '@/components/shared/KPICard';

export function CandidateReportsTab() {
  const [reports, setReports] = useState<CandidateReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadReports();
  }, [timeRange]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await candidatesService.getReports();
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reports) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Failed to load reports</p>
        </CardContent>
      </Card>
    );
  }

  const conversionFunnelData = [
    { stage: 'Sourced', count: 1250, percentage: 100 },
    { stage: 'Shortlisted', count: 725, percentage: 58 },
    { stage: 'Submitted', count: 486, percentage: 39 },
    { stage: 'Interview', count: 379, percentage: 30 },
    { stage: 'Offer', count: 246, percentage: 20 },
    { stage: 'Joined', count: 190, percentage: 15 }
  ];

  const pipelineData = Object.entries(reports.pipelineHealth.candidatesByStage).map(([stage, count]) => ({
    stage,
    count,
    percentage: (count / reports.pipelineHealth.totalCandidates * 100).toFixed(1)
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Candidate Reports & Analytics</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="sources">Source Analytics</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Candidates"
              value={reports.pipelineHealth.totalCandidates.toLocaleString()}
              icon={Users}
              trend={{ direction: "up", value: "8.2%", label: "vs last month" }}
            />
            <KPICard
              title="Conversion Rate"
              value={`${reports.conversionMetrics.overallConversion}%`}
              icon={Target}
              trend={{ direction: "down", value: "2.1%", label: "vs last month" }}
            />
            <KPICard
              title="Active Candidates"
              value={Object.values(reports.pipelineHealth.candidatesByStage)
                .slice(0, 7)
                .reduce((sum, count) => sum + count, 0)
                .toLocaleString()}
              icon={TrendingUp}
              trend={{ direction: "up", value: "5.7%", label: "vs last month" }}
            />
            <KPICard
              title="Bottlenecks"
              value={reports.pipelineHealth.bottlenecks.length.toString()}
              icon={AlertTriangle}
              trend={{ direction: "neutral", value: "0", label: "identified" }}
            />
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Candidate Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnelData.map((item) => (
                  <div key={item.stage} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.count.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartKit
                  type="pie"
                  data={pipelineData}
                  dataKey="count"
                  xAxisKey="stage"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(reports.conversionMetrics).map(([metric, value]) => {
                    if (metric === 'overallConversion') return null;
                    return (
                      <div key={metric} className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize">
                          {metric.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-bold">{value}%</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Recruiter Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Recruiter Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Recruiter</th>
                      <th className="text-right p-2">Sourced</th>
                      <th className="text-right p-2">Shortlisted</th>
                      <th className="text-right p-2">Submitted</th>
                      <th className="text-right p-2">Offers</th>
                      <th className="text-right p-2">Joined</th>
                      <th className="text-right p-2">Conversion</th>
                      <th className="text-right p-2">Avg TAT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.recruiterStats.map((stat) => (
                      <tr key={stat.recruiterId} className="border-b">
                        <td className="p-2 font-medium">{stat.recruiterName}</td>
                        <td className="p-2 text-right">{stat.candidatesSourced}</td>
                        <td className="p-2 text-right">{stat.candidatesShortlisted}</td>
                        <td className="p-2 text-right">{stat.candidatesSubmitted}</td>
                        <td className="p-2 text-right">{stat.offersExtended}</td>
                        <td className="p-2 text-right">{stat.candidatesJoined}</td>
                        <td className="p-2 text-right">{stat.conversionRate}%</td>
                        <td className="p-2 text-right">{stat.avgTimeToSubmit}d</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          {/* Source Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Source Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Source</th>
                      <th className="text-right p-2">Total</th>
                      <th className="text-right p-2">Shortlist %</th>
                      <th className="text-right p-2">Submit %</th>
                      <th className="text-right p-2">Offer %</th>
                      <th className="text-right p-2">Join %</th>
                      <th className="text-right p-2">Quality Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.sourceAnalytics.map((source) => (
                      <tr key={source.source} className="border-b">
                        <td className="p-2 font-medium">{source.source}</td>
                        <td className="p-2 text-right">{source.totalCandidates}</td>
                        <td className="p-2 text-right">{source.shortlistedRate}%</td>
                        <td className="p-2 text-right">{source.submissionRate}%</td>
                        <td className="p-2 text-right">{source.offerRate}%</td>
                        <td className="p-2 text-right">{source.joinRate}%</td>
                        <td className="p-2 text-right">{source.avgQualityScore}/10</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Source Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Candidate Sources Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartKit
                type="bar"
                data={reports.sourceAnalytics}
                dataKey="totalCandidates"
                xAxisKey="source"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          {/* Rejection Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client-Driven Rejections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(reports.rejectionAnalysis.clientDriven.reasons).map(([reason, count]) => (
                    <div key={reason} className="flex justify-between items-center">
                      <span className="text-sm">{reason}</span>
                      <div className="text-sm font-medium">{count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Candidate-Driven Rejections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(reports.rejectionAnalysis.candidateDriven.reasons).map(([reason, count]) => (
                    <div key={reason} className="flex justify-between items-center">
                      <span className="text-sm">{reason}</span>
                      <div className="text-sm font-medium">{count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Rejection Reasons */}
          <Card>
            <CardHeader>
              <CardTitle>Top Rejection Reasons</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartKit
                type="bar"
                data={reports.rejectionAnalysis.topReasons}
                dataKey="count"
                xAxisKey="reason"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}