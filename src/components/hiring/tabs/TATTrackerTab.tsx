import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Clock, AlertTriangle, TrendingUp, Target } from 'lucide-react'
import { hiringService } from '@/services/hiringService'
import type { TATMetrics, JobDescription, HiringFilters } from '@/types/hiring'

interface TATTrackerTabProps {
  filters: HiringFilters
}

export function TATTrackerTab({ filters }: TATTrackerTabProps) {
  const [tatMetrics, setTatMetrics] = useState<TATMetrics | null>(null)
  const [jds, setJds] = useState<JobDescription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [tatData, jdData] = await Promise.all([
          hiringService.getTATMetrics(),
          hiringService.getJobDescriptions(filters)
        ])
        
        setTatMetrics(tatData)
        setJds(jdData)
      } catch (error) {
        console.error('Failed to load TAT data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters])

  if (loading || !tatMetrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const stageData = [
    { stage: 'JD → Submission', days: tatMetrics.jdToSubmission, sla: 5 },
    { stage: 'Submission → Interview', days: tatMetrics.submissionToInterview, sla: 3 },
    { stage: 'Interview → Feedback', days: tatMetrics.interviewToFeedback, sla: 2 },
    { stage: 'Offer → Joining', days: tatMetrics.offerToJoining, sla: 14 }
  ]

  const clientTATData = Object.entries(tatMetrics.clientAvgTAT).map(([client, tat]) => ({
    name: client,
    tat
  }))

  const recruiterTATData = Object.entries(tatMetrics.recruiterAvgTAT).map(([recruiter, tat]) => ({
    name: recruiter,
    tat
  }))

  return (
    <div className="space-y-6">
      {/* TAT Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stageData.map((stage, index) => (
          <Card key={index} className={`bg-gradient-to-br ${
            stage.days > stage.sla 
              ? 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800'
              : 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    stage.days > stage.sla 
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {stage.stage}
                  </p>
                  <p className={`text-2xl font-bold ${
                    stage.days > stage.sla 
                      ? 'text-red-900 dark:text-red-100'
                      : 'text-green-900 dark:text-green-100'
                  }`}>
                    {stage.days}d
                  </p>
                  <p className={`text-xs ${
                    stage.days > stage.sla 
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-green-700 dark:text-green-300'
                  }`}>
                    SLA: {stage.sla}d
                  </p>
                </div>
                {stage.days > stage.sla ? (
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                ) : (
                  <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TAT by Stage Chart */}
        <Card>
          <CardHeader>
            <CardTitle>TAT by Hiring Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`${value} days`, name === 'days' ? 'Actual TAT' : 'SLA']} />
                <Bar dataKey="days" fill="#2E5BFF" name="Actual TAT" />
                <Bar dataKey="sla" fill="#FF6B6B" name="SLA" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Client TAT Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Client TAT Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clientTATData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} days`, 'Avg TAT']} />
                <Bar dataKey="tat" fill="#30C85A" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SLA Breach Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>SLA Breach Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>JD ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Recruiter</TableHead>
                <TableHead>Current Stage</TableHead>
                <TableHead>Days in Stage</TableHead>
                <TableHead>SLA Status</TableHead>
                <TableHead>Overall TAT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jds.slice(0, 10).map((jd) => {
                const overallTAT = Math.floor(
                  (new Date().getTime() - new Date(jd.createdDate).getTime()) / (1000 * 60 * 60 * 24)
                )
                const daysInCurrentStage = Math.floor(
                  (new Date().getTime() - new Date(jd.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
                )
                
                return (
                  <TableRow key={jd.id}>
                    <TableCell className="font-medium">{jd.id}</TableCell>
                    <TableCell>{jd.title}</TableCell>
                    <TableCell>{jd.client}</TableCell>
                    <TableCell>{jd.assignedRecruiter}</TableCell>
                    <TableCell>
                      <Badge variant={
                        jd.status === 'joined' ? 'default' : 
                        jd.status === 'offered' ? 'secondary' : 
                        'outline'
                      }>
                        {jd.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{daysInCurrentStage}d</TableCell>
                    <TableCell>
                      <Badge variant={jd.slaBreached ? 'destructive' : 'default'}>
                        {jd.slaBreached ? (
                          <>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Breached
                          </>
                        ) : (
                          <>
                            <Target className="h-3 w-3 mr-1" />
                            On Track
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={overallTAT > 20 ? 'destructive' : overallTAT > 15 ? 'secondary' : 'default'}>
                        <Clock className="h-3 w-3 mr-1" />
                        {overallTAT}d
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recruiter TAT Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Recruiter TAT Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={recruiterTATData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} days`, 'Avg TAT']} />
                <Bar dataKey="tat" fill="#2E5BFF" />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="space-y-3">
              <h4 className="font-semibold">TAT Benchmarks</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">Excellent (≤8 days)</span>
                  <Badge variant="default">
                    <Target className="h-3 w-3 mr-1" />
                    Target
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">Good (8-12 days)</span>
                  <Badge variant="secondary">Acceptable</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">Needs Improvement (&gt;12 days)</span>
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Review
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}