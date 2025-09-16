import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/DataTable'
import { ChartKit } from '@/components/shared/ChartKit'
import { BarChart3, TrendingUp, Users, Clock, Download } from 'lucide-react'

export function PipelineReportsTab() {
  const [activeTab, setActiveTab] = useState('jd-pipeline')

  // Mock data
  const mockJDPipelineData = [
    {
      jdTitle: 'Senior React Developer',
      client: 'TechCorp Inc',
      submissions: 25,
      shortlistPercent: 60,
      interviewPercent: 40,
      offerPercent: 20,
      joinPercent: 15,
      daysToFirstSubmission: 3,
      daysToOffer: 15,
      daysToJoin: 22
    },
    {
      jdTitle: 'DevOps Engineer',
      client: 'CloudTech',
      submissions: 18,
      shortlistPercent: 55,
      interviewPercent: 35,
      offerPercent: 18,
      joinPercent: 12,
      daysToFirstSubmission: 5,
      daysToOffer: 18,
      daysToJoin: 25
    }
  ]

  const mockRoundEfficiencyData = [
    {
      jdTitle: 'Senior React Developer',
      round: 'Technical Round',
      submitToSchedule: 2,
      scheduleToFeedback: 3,
      passPercent: 65,
      failPercent: 30,
      noShowPercent: 5
    },
    {
      jdTitle: 'DevOps Engineer',
      round: 'HR Round',
      submitToSchedule: 1,
      scheduleToFeedback: 2,
      passPercent: 70,
      failPercent: 25,
      noShowPercent: 5
    }
  ]

  const mockSlaComplianceData = [
    {
      stage: 'Feedback Pending',
      onTimePercent: 75,
      overdueCount: 28,
      avgOverdueDays: 4.2,
      escalations: 8
    },
    {
      stage: 'Interview Schedule',
      onTimePercent: 85,
      overdueCount: 12,
      avgOverdueDays: 2.1,
      escalations: 3
    }
  ]

  const mockRecruiterConversionData = [
    {
      recruiter: 'Alice Smith',
      shortlistPercent: 65,
      offerPercent: 28,
      joinPercent: 18
    },
    {
      recruiter: 'Bob Johnson',
      shortlistPercent: 58,
      offerPercent: 22,
      joinPercent: 15
    }
  ]

  const mockClientResponsivenessData = [
    {
      client: 'TechCorp Inc',
      avgFeedbackTime: 3.2,
      overdueResponses: 5,
      acceptanceRate: 75
    },
    {
      client: 'CloudTech',
      avgFeedbackTime: 4.1,
      overdueResponses: 8,
      acceptanceRate: 68
    }
  ]

  // Chart data
  const slaComplianceChartData = [
    { name: 'Feedback Pending', onTime: 75, overdue: 25 },
    { name: 'Interview Schedule', onTime: 85, overdue: 15 },
    { name: 'Offer Release', onTime: 90, overdue: 10 }
  ]

  const recruiterConversionChartData = [
    { name: 'Alice Smith', shortlist: 65, offer: 28, join: 18 },
    { name: 'Bob Johnson', shortlist: 58, offer: 22, join: 15 }
  ]

  const handleExport = (reportType: string, format: string) => {
    console.log(`Exporting ${reportType} as ${format}`)
  }

  // Column definitions
  const jdPipelineColumns = [
    { id: 'jdTitle', header: 'JD Title', accessor: 'jdTitle' as keyof typeof mockJDPipelineData[0] },
    { id: 'client', header: 'Client', accessor: 'client' as keyof typeof mockJDPipelineData[0] },
    { id: 'submissions', header: 'Submissions', accessor: 'submissions' as keyof typeof mockJDPipelineData[0] },
    { 
      id: 'shortlistPercent', 
      header: 'Shortlist %',
      accessor: 'shortlistPercent' as keyof typeof mockJDPipelineData[0],
      cell: (value: any) => `${value}%`
    },
    { 
      id: 'interviewPercent', 
      header: 'Interview %',
      accessor: 'interviewPercent' as keyof typeof mockJDPipelineData[0],
      cell: (value: any) => `${value}%`
    },
    { 
      id: 'offerPercent', 
      header: 'Offer %',
      accessor: 'offerPercent' as keyof typeof mockJDPipelineData[0],
      cell: (value: any) => `${value}%`
    },
    { 
      id: 'joinPercent', 
      header: 'Join %',
      accessor: 'joinPercent' as keyof typeof mockJDPipelineData[0],
      cell: (value: any) => `${value}%`
    },
    { id: 'daysToFirstSubmission', header: 'Days to First Submission', accessor: 'daysToFirstSubmission' as keyof typeof mockJDPipelineData[0] },
    { id: 'daysToOffer', header: 'Days to Offer', accessor: 'daysToOffer' as keyof typeof mockJDPipelineData[0] },
    { id: 'daysToJoin', header: 'Days to Join', accessor: 'daysToJoin' as keyof typeof mockJDPipelineData[0] }
  ]

  const roundEfficiencyColumns = [
    { id: 'jdTitle', header: 'JD Title', accessor: 'jdTitle' as keyof typeof mockRoundEfficiencyData[0] },
    { id: 'round', header: 'Round', accessor: 'round' as keyof typeof mockRoundEfficiencyData[0] },
    { id: 'submitToSchedule', header: 'Submit to Schedule (Days)', accessor: 'submitToSchedule' as keyof typeof mockRoundEfficiencyData[0] },
    { id: 'scheduleToFeedback', header: 'Schedule to Feedback (Days)', accessor: 'scheduleToFeedback' as keyof typeof mockRoundEfficiencyData[0] },
    { 
      id: 'passPercent', 
      header: 'Pass %',
      accessor: 'passPercent' as keyof typeof mockRoundEfficiencyData[0],
      cell: (value: any) => `${value}%`
    },
    { 
      id: 'failPercent', 
      header: 'Fail %',
      accessor: 'failPercent' as keyof typeof mockRoundEfficiencyData[0],
      cell: (value: any) => `${value}%`
    },
    { 
      id: 'noShowPercent', 
      header: 'No Show %',
      accessor: 'noShowPercent' as keyof typeof mockRoundEfficiencyData[0],
      cell: (value: any) => `${value}%`
    }
  ]

  const slaComplianceColumns = [
    { id: 'stage', header: 'Stage', accessor: 'stage' as keyof typeof mockSlaComplianceData[0] },
    { id: 'onTimePercent', header: 'On Time %', accessor: 'onTimePercent' as keyof typeof mockSlaComplianceData[0] },
    { id: 'overdueCount', header: 'Overdue Count', accessor: 'overdueCount' as keyof typeof mockSlaComplianceData[0] },
    { id: 'avgOverdueDays', header: 'Avg Overdue Days', accessor: 'avgOverdueDays' as keyof typeof mockSlaComplianceData[0] },
    { id: 'escalations', header: 'Escalations', accessor: 'escalations' as keyof typeof mockSlaComplianceData[0] }
  ]

  const recruiterConversionColumns = [
    { id: 'recruiter', header: 'Recruiter', accessor: 'recruiter' as keyof typeof mockRecruiterConversionData[0] },
    { 
      id: 'shortlistPercent', 
      header: 'Shortlist %',
      accessor: 'shortlistPercent' as keyof typeof mockRecruiterConversionData[0],
      cell: (value: any) => `${value}%`
    },
    { 
      id: 'offerPercent', 
      header: 'Offer %',
      accessor: 'offerPercent' as keyof typeof mockRecruiterConversionData[0],
      cell: (value: any) => `${value}%`
    },
    { 
      id: 'joinPercent', 
      header: 'Join %',
      accessor: 'joinPercent' as keyof typeof mockRecruiterConversionData[0],
      cell: (value: any) => `${value}%`
    }
  ]

  const clientResponsivenessColumns = [
    { id: 'client', header: 'Client', accessor: 'client' as keyof typeof mockClientResponsivenessData[0] },
    { id: 'avgFeedbackTime', header: 'Avg Feedback Time (Days)', accessor: 'avgFeedbackTime' as keyof typeof mockClientResponsivenessData[0] },
    { id: 'overdueResponses', header: 'Overdue Responses', accessor: 'overdueResponses' as keyof typeof mockClientResponsivenessData[0] },
    { id: 'acceptanceRate', header: 'Acceptance Rate (%)', accessor: 'acceptanceRate' as keyof typeof mockClientResponsivenessData[0] }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pipeline Reports</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  SLA Compliance Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartKit
                  type="bar"
                  data={slaComplianceChartData}
                  dataKey="onTime"
                  xAxisKey="name"
                />
              </CardContent>
            </Card>
            
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
              <CardContent>
                <DataTable columns={slaComplianceColumns} data={mockSlaComplianceData} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recruiter-conversion">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recruiter Performance - As Submitter</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartKit
                    type="bar"
                    data={recruiterConversionChartData}
                    dataKey="shortlist"
                    xAxisKey="name"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recruiter Performance - As Primary</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartKit
                    type="bar"
                    data={recruiterConversionChartData}
                    dataKey="shortlist"
                    xAxisKey="name"
                  />
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recruiter Conversion Report
                  </CardTitle>
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
                <DataTable columns={recruiterConversionColumns} data={mockRecruiterConversionData} />
              </CardContent>
            </Card>
          </div>
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
              <DataTable columns={clientResponsivenessColumns} data={mockClientResponsivenessData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}