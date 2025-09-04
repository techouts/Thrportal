import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Mail, MessageSquare, Phone, Plus, Clock, TrendingUp, AlertTriangle } from 'lucide-react'
import { hiringService } from '@/services/hiringService'
import { useToast } from '@/hooks/use-toast'
import type { JobDescription, FollowUp, HiringFilters } from '@/types/hiring'

interface FollowUpTabProps {
  filters: HiringFilters
}

export function FollowUpTab({ filters }: FollowUpTabProps) {
  const [jds, setJds] = useState<JobDescription[]>([])
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newFollowUp, setNewFollowUp] = useState({
    jdId: '',
    type: 'email' as 'email' | 'whatsapp' | 'call',
    notes: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [jdData] = await Promise.all([
          hiringService.getJobDescriptions(filters)
        ])
        
        setJds(jdData)
        
        // Generate mock follow-ups
        const mockFollowUps: FollowUp[] = jdData.slice(0, 15).map((jd, i) => ({
          id: `followup-${i + 1}`,
          jdId: jd.id,
          type: ['email', 'whatsapp', 'call'][Math.floor(Math.random() * 3)] as any,
          date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          recruiter: jd.assignedRecruiter,
          notes: `Follow-up notes for ${jd.title}`,
          effectiveness: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any
        }))
        setFollowUps(mockFollowUps)
      } catch (error) {
        console.error('Failed to load follow-up data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters])

  const delayAlerts = jds.map(jd => {
    const daysSinceSubmission = Math.floor(
      (new Date().getTime() - new Date(jd.submittedDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    return {
      jd,
      daysSinceSubmission,
      alertLevel: daysSinceSubmission >= 7 ? 'high' : daysSinceSubmission >= 5 ? 'medium' : daysSinceSubmission >= 3 ? 'low' : 'none'
    }
  }).filter(item => item.alertLevel !== 'none')

  const followUpTypeData = [
    { type: 'Email', count: followUps.filter(f => f.type === 'email').length },
    { type: 'WhatsApp', count: followUps.filter(f => f.type === 'whatsapp').length },
    { type: 'Call', count: followUps.filter(f => f.type === 'call').length }
  ]

  const effectivenessData = [
    { effectiveness: 'High', count: followUps.filter(f => f.effectiveness === 'high').length },
    { effectiveness: 'Medium', count: followUps.filter(f => f.effectiveness === 'medium').length },
    { effectiveness: 'Low', count: followUps.filter(f => f.effectiveness === 'low').length }
  ]

  const handleAddFollowUp = () => {
    if (!newFollowUp.jdId || !newFollowUp.notes) {
      toast({
        title: "Missing Information",
        description: "Please select a JD and add notes",
        variant: "destructive"
      })
      return
    }

    const followUp: FollowUp = {
      id: `followup-${Date.now()}`,
      jdId: newFollowUp.jdId,
      type: newFollowUp.type,
      date: new Date().toISOString(),
      recruiter: 'Current User',
      notes: newFollowUp.notes,
      effectiveness: 'medium'
    }

    setFollowUps([followUp, ...followUps])
    setNewFollowUp({ jdId: '', type: 'email', notes: '' })
    setShowAddDialog(false)
    
    toast({
      title: "Follow-up Added",
      description: `${newFollowUp.type.charAt(0).toUpperCase() + newFollowUp.type.slice(1)} follow-up logged successfully`
    })
  }

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'default'
    }
  }

  const getFollowUpIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />
      case 'call': return <Phone className="h-4 w-4" />
      default: return <Mail className="h-4 w-4" />
    }
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Follow-ups</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{followUps.length}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">This week</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">High Priority Alerts</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {delayAlerts.filter(a => a.alertLevel === 'high').length}
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">≥7 days delay</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Medium Priority</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {delayAlerts.filter(a => a.alertLevel === 'medium').length}
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">5-6 days delay</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Effectiveness Score</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {Math.round((followUps.filter(f => f.effectiveness === 'high').length / followUps.length) * 100)}%
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">High effectiveness</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Follow-up Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Follow-up Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={followUpTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2E5BFF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Effectiveness Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Follow-up Effectiveness</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={effectivenessData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="effectiveness" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#30C85A" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Delay Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Delay Alerts & Follow-up Required</CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Follow-up
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Follow-up Activity</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={newFollowUp.jdId} onValueChange={(value) => setNewFollowUp({...newFollowUp, jdId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select JD" />
                  </SelectTrigger>
                  <SelectContent>
                    {jds.slice(0, 10).map(jd => (
                      <SelectItem key={jd.id} value={jd.id}>
                        {jd.id} - {jd.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={newFollowUp.type} onValueChange={(value: any) => setNewFollowUp({...newFollowUp, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Follow-up Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                  </SelectContent>
                </Select>
                
                <Textarea 
                  placeholder="Follow-up notes..."
                  value={newFollowUp.notes}
                  onChange={(e) => setNewFollowUp({...newFollowUp, notes: e.target.value})}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddFollowUp}>Log Follow-up</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>JD ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Days Since Submission</TableHead>
                <TableHead>Alert Level</TableHead>
                <TableHead>Last Follow-up</TableHead>
                <TableHead>Action Required</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {delayAlerts.slice(0, 10).map(({ jd, daysSinceSubmission, alertLevel }) => {
                const lastFollowUp = followUps.find(f => f.jdId === jd.id)
                
                return (
                  <TableRow key={jd.id}>
                    <TableCell className="font-medium">{jd.id}</TableCell>
                    <TableCell>{jd.title}</TableCell>
                    <TableCell>{jd.client}</TableCell>
                    <TableCell>
                      <Badge variant={getAlertColor(alertLevel)}>
                        <Clock className="h-3 w-3 mr-1" />
                        {daysSinceSubmission}d
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getAlertColor(alertLevel)}>
                        {alertLevel.charAt(0).toUpperCase() + alertLevel.slice(1)} Priority
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lastFollowUp ? (
                        <div className="flex items-center space-x-2">
                          {getFollowUpIcon(lastFollowUp.type)}
                          <span className="text-sm">
                            {Math.floor((Date.now() - new Date(lastFollowUp.date).getTime()) / (1000 * 60 * 60 * 24))}d ago
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline">No follow-up</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={alertLevel === 'high' ? 'destructive' : 'secondary'}>
                        {alertLevel === 'high' ? 'Immediate' : 'Schedule'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Follow-up Log */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Follow-up Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>JD ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Recruiter</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Effectiveness</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {followUps.slice(0, 10).map((followUp) => (
                <TableRow key={followUp.id}>
                  <TableCell>{new Date(followUp.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{followUp.jdId}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getFollowUpIcon(followUp.type)}
                      <span className="capitalize">{followUp.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{followUp.recruiter}</TableCell>
                  <TableCell className="max-w-xs truncate">{followUp.notes}</TableCell>
                  <TableCell>
                    <Badge variant={
                      followUp.effectiveness === 'high' ? 'default' :
                      followUp.effectiveness === 'medium' ? 'secondary' :
                      'outline'
                    }>
                      {followUp.effectiveness}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}