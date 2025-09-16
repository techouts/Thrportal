import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Filter, BarChart3, PieChart, TrendingUp } from 'lucide-react'
import { ChartKit } from '@/components/shared/ChartKit'
import { DataTable } from '@/components/shared/DataTable'
import { pipelineService } from '@/services/pipelineService'

export function PipelineReportsTab() {
  const [activeReport, setActiveReport] = useState('jd-pipeline')
  const [filters, setFilters] = useState({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    client: '',
    recruiter: ''
  })

  const handleExport = async (reportType: string, format: 'excel' | 'pdf' = 'excel') => {
    try {
      await pipelineService.exportPipelineReport(reportType, { ...filters, format })
      console.log(`Exporting ${reportType} as ${format}`)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const mockJDPipelineData = [
    {
      jdTitle: 'Senior React Developer',
      client: 'TechCorp Inc',
      submissions: 25,
      shortlistPercent: 68,
      interviewPercent: 45,
      offerPercent: 28,
      joinPercent: 20,
      daysToFirstSubmission: 2,
      daysToOffer: 15,
      daysToJoin: 22
    },
    {
      jdTitle: 'Product Manager',
      client: 'InnovateCo',
      submissions: 18,
      shortlistPercent: 72,
      interviewPercent: 50,
      offerPercent: 33,
      joinPercent: 22,
      daysToFirstSubmission: 1,
      daysToOffer: 12,
      daysToJoin: 18
    }
  ]

  const mockRoundEfficiencyData = [
    {
      jdTitle: 'Senior React Developer',
      round: 'Technical',
      submitToSchedule: 2.5,
      scheduleToFeedback: 3.2,
      passPercent: 75,
      failPercent: 20,
      noShowPercent: 5
    },
    {
      jdTitle: 'Product Manager',
      round: 'Client',
      submitToSchedule: 3.0,
      scheduleToFeedback: 4.5,
      passPercent: 65,
      failPercent: 30,
      noShowPercent: 5
    }
  ]

  const mockSLAComplianceData = [
    {
      stage: 'Feedback Pending',
      onTimePercent: 72,
      overdueCount: 12,
      avgOverdueDays: 3.5,
      escalations: 4
    },
    {
      stage: 'Interview Schedule',
      onTimePercent: 85,
      overdueCount: 8,
      avgOverdueDays: 2.1,
      escalations: 2
    }
  ]

  const mockRecruiterConversionData = [
    {
      recruiter: 'Alice Smith',
      asSubmitter: { shortlist: 68, offer: 28, join: 18 },
      asPrimary: { shortlist: 72, offer: 32, join: 22 }
    },
    {
      recruiter: 'Bob Johnson',
      asSubmitter: { shortlist: 62, offer: 25, join: 16 },
      asPrimary: { shortlist: 70, offer: 30, join: 20 }
    }
  ]

  const mockClientResponsivenessData = [
    {
      client: 'TechCorp Inc',
      avgFeedbackTime: 3.2,
      overdueResponses: 5,
      acceptanceRate: 78
    },
    {
      client: 'InnovateCo',
      avgFeedbackTime: 2.8,
      overdueResponses: 3,
      acceptanceRate: 82
    }
  ]

  const jdPipelineColumns = [
    { accessorKey: 'jdTitle', header: 'JD Title' },
    { accessorKey: 'client', header: 'Client' },
    { accessorKey: 'submissions', header: 'Submissions' },
    { accessorKey: 'shortlistPercent', header: 'Shortlist %', cell: ({ row }: any) => `${row.original.shortlistPercent}%` },
    { accessorKey: 'interviewPercent', header: 'Interview %', cell: ({ row }: any) => `${row.original.interviewPercent}%` },
    { accessorKey: 'offerPercent', header: 'Offer %', cell: ({ row }: any) => `${row.original.offerPercent}%` },
    { accessorKey: 'joinPercent', header: 'Join %', cell: ({ row }: any) => `${row.original.joinPercent}%` },
    { accessorKey: 'daysToFirstSubmission', header: 'Days to First Sub' },
    { accessorKey: 'daysToOffer', header: 'Days to Offer' },
    { accessorKey: 'daysToJoin', header: 'Days to Join' }
  ]

  const roundEfficiencyColumns = [
    { accessorKey: 'jdTitle', header: 'JD Title' },
    { accessorKey: 'round', header: 'Round' },
    { accessorKey: 'submitToSchedule', header: 'Submit→Schedule (days)' },
    { accessorKey: 'scheduleToFeedback', header: 'Schedule→Feedback (days)' },
    { accessorKey: 'passPercent', header: 'Pass %', cell: ({ row }: any) => `${row.original.passPercent}%` },
    { accessorKey: 'failPercent', header: 'Fail %', cell: ({ row }: any) => `${row.original.failPercent}%` },
    { accessorKey: 'noShowPercent', header: 'No-show %', cell: ({ row }: any) => `${row.original.noShowPercent}%` }
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input 
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input 
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, end: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label>Client</Label>
              <Select value={filters.client} onValueChange={(value) => setFilters(prev => ({ ...prev, client: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Clients</SelectItem>
                  <SelectItem value="TechCorp Inc">TechCorp Inc</SelectItem>
                  <SelectItem value="InnovateCo">InnovateCo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Recruiter</Label>
              <Select value={filters.recruiter} onValueChange={(value) => setFilters(prev => ({ ...prev, recruiter: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Recruiters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Recruiters</SelectItem>
                  <SelectItem value="Alice Smith">Alice Smith</SelectItem>
                  <SelectItem value="Bob Johnson">Bob Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports */}
      <Tabs value={activeReport} onValueChange={setActiveReport} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="jd-pipeline">JD Pipeline</TabsTrigger>
          <TabsTrigger value="round-efficiency">Round Efficiency</TabsTrigger>
          <TabsTrigger value="sla-compliance">SLA Compliance</TabsTrigger>
          <TabsTrigger value="recruiter-conversion">Recruiter Conversion</TabsTrigger>
          <TabsTrigger value="client-responsiveness">Client Responsiveness</TabsTrigger>
        </TabsList>

        <TabsContent value="jd-pipeline">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  JD Pipeline Report
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => handleExport('jd-pipeline', 'excel')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button onClick={() => handleExport('jd-pipeline', 'pdf')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable columns={jdPipelineColumns} data={mockJDPipelineData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="round-efficiency">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Round Efficiency Report
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => handleExport('round-efficiency', 'excel')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button onClick={() => handleExport('round-efficiency', 'pdf')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable columns={roundEfficiencyColumns} data={mockRoundEfficiencyData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla-compliance">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>SLA Compliance Report</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => handleExport('sla-compliance', 'excel')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button onClick={() => handleExport('sla-compliance', 'pdf')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ChartKit
                type="bar"
                data={mockSLAComplianceData.map(item => ({
                  name: item.stage,
                  onTime: item.onTimePercent,
                  overdue: 100 - item.onTimePercent
                }))}
                config={{
                  xField: 'name',
                  yField: ['onTime', 'overdue'],
                  stackField: 'type',
                  colors: ['#10b981', '#ef4444']
                }}
              />
              <DataTable 
                columns={[
                  { accessorKey: 'stage', header: 'Stage' },
                  { accessorKey: 'onTimePercent', header: 'On-time %', cell: ({ row }: any) => `${row.original.onTimePercent}%` },
                  { accessorKey: 'overdueCount', header: 'Overdue Count' },
                  { accessorKey: 'avgOverdueDays', header: 'Avg Overdue Days' },
                  { accessorKey: 'escalations', header: 'Escalations' }
                ]} 
                data={mockSLAComplianceData} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recruiter-conversion">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recruiter Conversion Report</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => handleExport('recruiter-conversion', 'excel')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button onClick={() => handleExport('recruiter-conversion', 'pdf')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">As Submitter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartKit
                      type="bar"
                      data={mockRecruiterConversionData.map(item => ({
                        name: item.recruiter,
                        shortlist: item.asSubmitter.shortlist,
                        offer: item.asSubmitter.offer,
                        join: item.asSubmitter.join
                      }))}
                      config={{
                        xField: 'name',
                        yField: ['shortlist', 'offer', 'join'],
                        stackField: 'type'
                      }}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">As Primary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartKit
                      type="bar"
                      data={mockRecruiterConversionData.map(item => ({
                        name: item.recruiter,
                        shortlist: item.asPrimary.shortlist,
                        offer: item.asPrimary.offer,
                        join: item.asPrimary.join
                      }))}
                      config={{
                        xField: 'name',
                        yField: ['shortlist', 'offer', 'join'],
                        stackField: 'type'
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="client-responsiveness">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Client Responsiveness Report</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => handleExport('client-responsiveness', 'excel')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button onClick={() => handleExport('client-responsiveness', 'pdf')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={[
                  { accessorKey: 'client', header: 'Client' },
                  { accessorKey: 'avgFeedbackTime', header: 'Avg Feedback Time (days)' },
                  { accessorKey: 'overdueResponses', header: 'Overdue Responses' },
                  { accessorKey: 'acceptanceRate', header: 'Acceptance Rate (%)', cell: ({ row }: any) => `${row.original.acceptanceRate}%` }
                ]} 
                data={mockClientResponsivenessData} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}