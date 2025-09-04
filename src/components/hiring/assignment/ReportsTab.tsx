import { useState, useEffect } from 'react'
import { BarChart, Calendar, Download, TrendingUp, Users, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/DataTable'
import { ChartKit } from '@/components/shared/ChartKit'
import { assignmentService } from '@/services/assignmentService'
import type { RecruiterLoad, JDBurnReport } from '@/types/assignment'

export function ReportsTab() {
  const [recruiterLoads, setRecruiterLoads] = useState<RecruiterLoad[]>([])
  const [burnReport, setBurnReport] = useState<JDBurnReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReportsData()
  }, [])

  const loadReportsData = async () => {
    setLoading(true)
    try {
      const [loadData, burnData] = await Promise.all([
        assignmentService.getRecruiterLoads(),
        assignmentService.getBurnReport()
      ])
      setRecruiterLoads(loadData)
      setBurnReport(burnData)
    } catch (error) {
      console.error('Failed to load reports data:', error)
    } finally {
      setLoading(false)
    }
  }

  const recruiterColumns = [
    {
      id: 'recruiter',
      header: 'Recruiter',
      accessor: 'recruiterName' as keyof RecruiterLoad,
      cell: (item: RecruiterLoad) => (
        <div>
          <div className="font-medium">{item.recruiterName}</div>
          <Badge 
            variant={item.bandwidth === 'Overloaded' ? 'destructive' : 
                    item.bandwidth === 'High' ? 'secondary' : 'default'}
            className="text-xs mt-1"
          >
            {item.bandwidth} Load
          </Badge>
        </div>
      )
    },
    {
      id: 'jdCount',
      header: 'Total JDs',
      accessor: 'assignedJDs' as keyof RecruiterLoad,
      cell: (item: RecruiterLoad) => (
        <div className="text-center font-semibold">
          {item.assignedJDs}
        </div>
      )
    },
    {
      id: 'priorityMix',
      header: 'Priority Mix',
      accessor: 'urgentJDs' as keyof RecruiterLoad,
      cell: (item: RecruiterLoad) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs">
              {item.urgentJDs} Urgent
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs">
              {item.standardJDs} Standard
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {item.bulkJDs} Bulk
            </Badge>
          </div>
        </div>
      )
    },
    {
      id: 'performance',
      header: 'Performance',
      accessor: 'fillRate' as keyof RecruiterLoad,
      cell: (item: RecruiterLoad) => (
        <div className="space-y-1">
          <div className="text-sm">
            <span className="font-medium">{item.fillRate}%</span> Fill Rate
          </div>
          <div className="text-sm text-muted-foreground">
            {item.avgTAT} days avg TAT
          </div>
        </div>
      )
    }
  ]

  const burnColumns = [
    {
      id: 'jdInfo',
      header: 'JD Details',
      accessor: 'jdId' as keyof JDBurnReport,
      cell: (item: JDBurnReport) => (
        <div>
          <div className="font-medium">{item.jdId}</div>
          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
            {item.title}
          </div>
        </div>
      )
    },
    {
      id: 'recruiters',
      header: 'Recruiters',
      accessor: 'recruiters' as keyof JDBurnReport,
      cell: (item: JDBurnReport) => (
        <div className="space-y-1">
          {item.recruiters.map(recruiter => (
            <Badge key={recruiter} variant="outline" className="text-xs">
              {recruiter}
            </Badge>
          ))}
        </div>
      )
    },
    {
      id: 'metrics',
      header: 'Submission Metrics',
      accessor: 'profilesSent' as keyof JDBurnReport,
      cell: (item: JDBurnReport) => (
        <div className="space-y-1">
          <div className="text-sm">
            <span className="font-medium">{item.profilesSent}</span> Profiles
          </div>
          <div className="text-sm">
            <span className="font-medium">{item.interviews}</span> Interviews
          </div>
          <div className="text-sm">
            <span className="font-medium">{item.offers}</span> Offers
          </div>
        </div>
      )
    },
    {
      id: 'efficiency',
      header: 'Efficiency',
      accessor: 'efficiency' as keyof JDBurnReport,
      cell: (item: JDBurnReport) => (
        <div className="flex items-center gap-2">
          <div className={`text-sm font-medium ${
            item.efficiency >= 80 ? 'text-green-600' :
            item.efficiency >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {item.efficiency}%
          </div>
          <Badge 
            variant={item.efficiency >= 80 ? 'default' : 
                    item.efficiency >= 60 ? 'secondary' : 'destructive'}
            className="text-xs"
          >
            {item.status}
          </Badge>
        </div>
      )
    }
  ]

  // Mock chart data
  const workloadData = recruiterLoads.map(r => ({
    name: r.recruiterName.split(' ')[0],
    urgent: r.urgentJDs,
    standard: r.standardJDs,
    bulk: r.bulkJDs
  }))

  const performanceData = recruiterLoads.map(r => ({
    name: r.recruiterName.split(' ')[0],
    fillRate: r.fillRate,
    avgTAT: r.avgTAT
  }))

  return (
    <div className="space-y-6">
      {/* Report Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Assignment Reports</h2>
          <p className="text-muted-foreground">
            Performance metrics and workload analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartKit
          type="bar"
          title="Recruiter Workload Distribution"
          data={workloadData}
          dataKey="urgent"
          xAxisKey="name"
          height={300}
          showGrid={true}
          showLegend={true}
        />
        
        <ChartKit
          type="line"
          title="Performance Metrics"
          data={performanceData}
          dataKey="fillRate"
          xAxisKey="name"
          height={300}
          showGrid={true}
          showLegend={true}
        />
      </div>

      {/* Recruiter Load Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recruiter Load Report
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={recruiterLoads}
            columns={recruiterColumns}
            loading={loading}
            searchable={false}
          />
        </CardContent>
      </Card>

      {/* JD Burn Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            JD Performance Report
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={burnReport}
            columns={burnColumns}
            loading={loading}
            searchable={true}
          />
        </CardContent>
      </Card>

      {/* Summary Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-lg font-bold">
                  {Math.round(recruiterLoads.reduce((sum, r) => sum + r.fillRate, 0) / recruiterLoads.length)}%
                </div>
                <p className="text-xs text-muted-foreground">Avg Fill Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-lg font-bold">
                  {Math.round(recruiterLoads.reduce((sum, r) => sum + r.avgTAT, 0) / recruiterLoads.length)}
                </div>
                <p className="text-xs text-muted-foreground">Avg TAT (days)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-lg font-bold">
                  {recruiterLoads.filter(r => r.bandwidth === 'Overloaded').length}
                </div>
                <p className="text-xs text-muted-foreground">Overloaded Recruiters</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}