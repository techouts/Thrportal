import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { User, TrendingUp, Clock, Target } from 'lucide-react'
import { hiringService } from '@/services/hiringService'
import type { Recruiter, JobDescription, HiringFilters } from '@/types/hiring'

interface RecruiterTabProps {
  filters: HiringFilters
}

export function RecruiterTab({ filters }: RecruiterTabProps) {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([])
  const [jds, setJds] = useState<JobDescription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [recruiterData, jdData] = await Promise.all([
          hiringService.getRecruiters(),
          hiringService.getJobDescriptions(filters)
        ])
        
        setRecruiters(recruiterData)
        setJds(jdData)
      } catch (error) {
        console.error('Failed to load recruiter data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters])

  // Generate weekly submissions trend data
  const weeklyTrendData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    submissions: Math.floor(Math.random() * 10) + 5
  }))

  const getLoadIndexColor = (loadIndex: number) => {
    if (loadIndex >= 90) return 'destructive'
    if (loadIndex >= 70) return 'secondary'
    return 'default'
  }

  const getIdleDaysColor = (idleDays: number) => {
    if (idleDays >= 5) return 'destructive'
    if (idleDays >= 3) return 'secondary'
    return 'default'
  }

  if (loading) {
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

  return (
    <div className="space-y-6">
      {/* Recruiter Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Recruiters</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{recruiters.length}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Active recruiters</p>
              </div>
              <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Avg Weekly Submissions</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {Math.round(recruiters.reduce((sum, r) => sum + r.weeklySubmissions, 0) / recruiters.length)}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">Per recruiter</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Avg Load Index</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {Math.round(recruiters.reduce((sum, r) => sum + r.loadIndex, 0) / recruiters.length)}%
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">Capacity utilization</p>
              </div>
              <Target className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Avg Conversion</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {Math.round(recruiters.reduce((sum, r) => sum + r.offerConversion, 0) / recruiters.length)}%
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">Submission to offer</p>
              </div>
              <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned JDs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recruiter Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recruiter</TableHead>
                  <TableHead>Assigned JDs</TableHead>
                  <TableHead>Weekly Subs</TableHead>
                  <TableHead>Idle Days</TableHead>
                  <TableHead>Load Index</TableHead>
                  <TableHead>Conversion %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recruiters.map((recruiter) => (
                  <TableRow key={recruiter.id}>
                    <TableCell className="font-medium">{recruiter.name}</TableCell>
                    <TableCell>{recruiter.assignedJDs}</TableCell>
                    <TableCell>{recruiter.weeklySubmissions}</TableCell>
                    <TableCell>
                      <Badge variant={getIdleDaysColor(recruiter.idleDays)}>
                        {recruiter.idleDays}d
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getLoadIndexColor(recruiter.loadIndex)}>
                        {recruiter.loadIndex}%
                      </Badge>
                    </TableCell>
                    <TableCell>{recruiter.offerConversion}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Weekly Submissions Graph */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Submissions Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="submissions" 
                  stroke="#2E5BFF" 
                  strokeWidth={3}
                  dot={{ fill: '#2E5BFF', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* My Assigned JDs (for individual recruiters) */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned JDs Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>JD ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Days Since Creation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jds.slice(0, 8).map((jd) => {
                const daysSinceCreation = Math.floor(
                  (new Date().getTime() - new Date(jd.createdDate).getTime()) / (1000 * 60 * 60 * 24)
                )
                
                return (
                  <TableRow key={jd.id}>
                    <TableCell className="font-medium">{jd.id}</TableCell>
                    <TableCell>{jd.title}</TableCell>
                    <TableCell>{jd.client}</TableCell>
                    <TableCell>
                      <Badge variant={
                        jd.priority === 'urgent' ? 'destructive' : 
                        jd.priority === 'normal' ? 'default' : 
                        'outline'
                      }>
                        {jd.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        jd.status === 'joined' ? 'default' : 
                        jd.status === 'offered' ? 'secondary' : 
                        'outline'
                      }>
                        {jd.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{jd.submissions}</TableCell>
                    <TableCell>
                      {Math.floor((new Date().getTime() - new Date(jd.lastActivity).getTime()) / (1000 * 60 * 60 * 24))}d ago
                    </TableCell>
                    <TableCell>
                      <Badge variant={daysSinceCreation > 30 ? 'destructive' : daysSinceCreation > 15 ? 'secondary' : 'default'}>
                        <Clock className="h-3 w-3 mr-1" />
                        {daysSinceCreation}d
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}