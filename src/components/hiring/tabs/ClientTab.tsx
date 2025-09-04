import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Mail, MessageSquare, Phone, AlertTriangle, Clock, Flag } from 'lucide-react'
import { hiringService } from '@/services/hiringService'
import { useToast } from '@/hooks/use-toast'
import type { Client, JobDescription, HiringFilters } from '@/types/hiring'

interface ClientTabProps {
  filters: HiringFilters
}

export function ClientTab({ filters }: ClientTabProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [jds, setJds] = useState<JobDescription[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [clientData, jdData] = await Promise.all([
          hiringService.getClients(),
          hiringService.getJobDescriptions(filters)
        ])
        
        setClients(clientData)
        setJds(jdData)
      } catch (error) {
        console.error('Failed to load client data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters])

  const feedbackDelayData = clients.map(client => ({
    name: client.name,
    avgDelayDays: client.avgFeedbackTime,
    delayedCount: client.delayedFeedbacks
  }))

  const handleFollowUp = (type: 'email' | 'whatsapp' | 'call', jdId: string) => {
    toast({
      title: "Follow-up Logged",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} follow-up logged for JD ${jdId}`
    })
  }

  const handleEscalate = (jdId: string) => {
    toast({
      title: "JD Escalated",
      description: `JD ${jdId} has been escalated to management`,
      variant: "destructive"
    })
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
      {/* Client Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Clients</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{clients.length}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Active clients</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Delayed Feedbacks</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {clients.reduce((sum, c) => sum + c.delayedFeedbacks, 0)}
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">Across all clients</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Avg Feedback Time</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {Math.round(clients.reduce((sum, c) => sum + c.avgFeedbackTime, 0) / clients.length)}d
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">Average across clients</p>
              </div>
              <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Conversions</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {clients.reduce((sum, c) => sum + c.conversions, 0)}
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">Submissions to joins</p>
              </div>
              <Flag className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* JD Tracker by Client */}
        <Card>
          <CardHeader>
            <CardTitle>Client Performance Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Active JDs</TableHead>
                  <TableHead>Avg Feedback</TableHead>
                  <TableHead>Delayed</TableHead>
                  <TableHead>Conversion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.activeJDs}</TableCell>
                    <TableCell>
                      <Badge variant={client.avgFeedbackTime > 5 ? 'destructive' : client.avgFeedbackTime > 3 ? 'secondary' : 'default'}>
                        {client.avgFeedbackTime}d
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {client.delayedFeedbacks > 0 && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {client.delayedFeedbacks}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{Math.round((client.conversions / client.totalSubmissions) * 100)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Feedback Delay Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback Delay Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={feedbackDelayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgDelayDays" fill="#FF6B6B" name="Avg Delay (days)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* No Feedback Alerts & Manual Follow-up */}
      <Card>
        <CardHeader>
          <CardTitle>Follow-up Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>JD ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Days Since Submission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Follow-up Actions</TableHead>
                <TableHead>Escalate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jds.slice(0, 8).map((jd) => {
                const daysSinceSubmission = Math.floor(
                  (new Date().getTime() - new Date(jd.submittedDate).getTime()) / (1000 * 60 * 60 * 24)
                )
                
                return (
                  <TableRow key={jd.id}>
                    <TableCell className="font-medium">{jd.id}</TableCell>
                    <TableCell>{jd.title}</TableCell>
                    <TableCell>{jd.client}</TableCell>
                    <TableCell>
                      <Badge variant={daysSinceSubmission > 7 ? 'destructive' : daysSinceSubmission > 5 ? 'secondary' : 'default'}>
                        <Clock className="h-3 w-3 mr-1" />
                        {daysSinceSubmission}d
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={jd.feedbackDate ? 'default' : 'destructive'}>
                        {jd.feedbackDate ? 'Feedback Received' : 'No Feedback'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleFollowUp('email', jd.id)}
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleFollowUp('whatsapp', jd.id)}
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleFollowUp('call', jd.id)}
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant={jd.escalated ? "destructive" : "outline"} 
                        size="sm"
                        onClick={() => handleEscalate(jd.id)}
                        disabled={jd.escalated}
                      >
                        <Flag className="h-3 w-3" />
                      </Button>
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