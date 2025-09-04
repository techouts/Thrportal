import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Clock, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import { hiringService } from '@/services/hiringService'
import type { JobDescription, Submission, HiringFilters } from '@/types/hiring'

interface JDInsightsTabProps {
  filters: HiringFilters
}

export function JDInsightsTab({ filters }: JDInsightsTabProps) {
  const [jds, setJds] = useState<JobDescription[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [jdData, submissionData] = await Promise.all([
          hiringService.getJobDescriptions(filters),
          hiringService.getSubmissions(filters)
        ])
        
        setJds(jdData)
        setSubmissions(submissionData)
      } catch (error) {
        console.error('Failed to load JD insights data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters])

  const rejectionReasons = submissions
    .filter(s => s.rejectionReason)
    .reduce((acc, s) => {
      acc[s.rejectionReason!] = (acc[s.rejectionReason!] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const rejectionData = Object.entries(rejectionReasons).map(([reason, count]) => ({
    reason,
    count
  }))

  const feedbackDelays = jds.map(jd => {
    const daysSinceSubmission = Math.floor(
      (new Date().getTime() - new Date(jd.submittedDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    return {
      id: jd.id,
      title: jd.title,
      client: jd.client || 'N/A',
      daysSinceSubmission,
      feedbackReceived: !!jd.feedbackDate,
      delayCategory: daysSinceSubmission > 7 ? 'high' : daysSinceSubmission > 5 ? 'medium' : daysSinceSubmission > 3 ? 'low' : 'none'
    }
  })

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
      {/* JD Lifecycle Table */}
      <Card>
        <CardHeader>
          <CardTitle>JD Lifecycle Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>JD ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Interviews</TableHead>
                <TableHead>Offers</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Reopen Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jds.slice(0, 10).map((jd) => (
                <TableRow key={jd.id}>
                  <TableCell className="font-medium">{jd.id}</TableCell>
                  <TableCell>{jd.title}</TableCell>
                  <TableCell>{jd.client || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={
                      jd.status === 'joined' ? 'default' : 
                      jd.status === 'offered' ? 'secondary' : 
                      jd.status === 'rejected' ? 'destructive' : 
                      'outline'
                    }>
                      {jd.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{jd.submissions}</TableCell>
                  <TableCell>{jd.interviews}</TableCell>
                  <TableCell>{jd.offers}</TableCell>
                  <TableCell>{jd.joined}</TableCell>
                  <TableCell>
                    {jd.reopenCount > 0 && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-600">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        {jd.reopenCount}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rejection Reasons Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Rejection Reasons Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rejectionData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="reason" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#FF6B6B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Feedback Delay Tracker */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback Delay Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedbackDelays.slice(0, 8).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {item.feedbackReceived ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className={`h-4 w-4 ${
                          item.delayCategory === 'high' ? 'text-red-500' :
                          item.delayCategory === 'medium' ? 'text-orange-500' :
                          item.delayCategory === 'low' ? 'text-yellow-500' :
                          'text-green-500'
                        }`} />
                      )}
                      <span className="font-medium text-sm">{item.id}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.client || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      item.delayCategory === 'high' ? 'destructive' :
                      item.delayCategory === 'medium' ? 'secondary' :
                      item.delayCategory === 'low' ? 'outline' :
                      'default'
                    }>
                      <Clock className="h-3 w-3 mr-1" />
                      {item.daysSinceSubmission}d
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}