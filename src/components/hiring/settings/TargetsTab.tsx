import { useState, useEffect } from 'react'
import { Plus, Save, History, Users, Calendar, Target } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/DataTable'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/auth/AuthContext'

interface RecruiterTarget {
  id: string
  recruiterId: string
  recruiterName: string
  period: string
  periodType: 'month' | 'quarter' | 'custom'
  submissions: number
  shortlists: number
  interviews: number
  offers: number
  joins: number
  slaCompliance: number
}

interface TeamTarget {
  period: string
  submissions: number
  shortlists: number
  interviews: number
  offers: number
  joins: number
  slaCompliance: number
  isOverride: boolean
}

interface TargetChangeLog {
  id: string
  recruiterName: string
  period: string
  metric: string
  oldValue: number
  newValue: number
  changedBy: string
  timestamp: string
}

export function TargetsTab() {
  const { user, can } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01')
  const [periodType, setPeriodType] = useState<'month' | 'quarter' | 'custom'>('month')
  const [selectedRecruiters, setSelectedRecruiters] = useState<string[]>([])
  const [recruiterTargets, setRecruiterTargets] = useState<RecruiterTarget[]>([])
  const [teamTarget, setTeamTarget] = useState<TeamTarget | null>(null)
  const [changeLogs, setChangeLogs] = useState<TargetChangeLog[]>([])

  // Available recruiters (mock data)
  const recruiters = [
    { id: 'rec1', name: 'Sarah Johnson', email: 'sarah@company.com' },
    { id: 'rec2', name: 'Mike Chen', email: 'mike@company.com' },
    { id: 'rec3', name: 'Emily Davis', email: 'emily@company.com' },
    { id: 'rec4', name: 'Alex Rodriguez', email: 'alex@company.com' }
  ]

  useEffect(() => {
    loadTargets()
    loadChangeLogs()
  }, [selectedPeriod])

  const loadTargets = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const mockTargets: RecruiterTarget[] = [
        {
          id: '1',
          recruiterId: 'rec1',
          recruiterName: 'Sarah Johnson',
          period: selectedPeriod,
          periodType,
          submissions: 25,
          shortlists: 15,
          interviews: 8,
          offers: 3,
          joins: 2,
          slaCompliance: 95
        },
        {
          id: '2',
          recruiterId: 'rec2',
          recruiterName: 'Mike Chen',
          period: selectedPeriod,
          periodType,
          submissions: 20,
          shortlists: 12,
          interviews: 6,
          offers: 2,
          joins: 2,
          slaCompliance: 90
        }
      ]
      
      setRecruiterTargets(mockTargets)
      
      // Calculate team target as rollup
      const calculatedTeamTarget: TeamTarget = {
        period: selectedPeriod,
        submissions: mockTargets.reduce((sum, t) => sum + t.submissions, 0),
        shortlists: mockTargets.reduce((sum, t) => sum + t.shortlists, 0),
        interviews: mockTargets.reduce((sum, t) => sum + t.interviews, 0),
        offers: mockTargets.reduce((sum, t) => sum + t.offers, 0),
        joins: mockTargets.reduce((sum, t) => sum + t.joins, 0),
        slaCompliance: Math.round(mockTargets.reduce((sum, t) => sum + t.slaCompliance, 0) / mockTargets.length),
        isOverride: false
      }
      
      setTeamTarget(calculatedTeamTarget)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load targets',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadChangeLogs = async () => {
    // Mock change logs
    const mockLogs: TargetChangeLog[] = [
      {
        id: '1',
        recruiterName: 'Sarah Johnson',
        period: '2024-01',
        metric: 'Submissions',
        oldValue: 20,
        newValue: 25,
        changedBy: 'John Manager',
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        recruiterName: 'Mike Chen',
        period: '2024-01',
        metric: 'SLA Compliance',
        oldValue: 85,
        newValue: 90,
        changedBy: 'Jane Smith',
        timestamp: '2024-01-14T14:20:00Z'
      }
    ]
    
    setChangeLogs(mockLogs)
  }

  const updateRecruiterTarget = (recruiterId: string, field: keyof RecruiterTarget, value: number) => {
    setRecruiterTargets(prev => 
      prev.map(target => 
        target.recruiterId === recruiterId 
          ? { ...target, [field]: value }
          : target
      )
    )
  }

  const addRecruiterTarget = (recruiterId: string) => {
    const recruiter = recruiters.find(r => r.id === recruiterId)
    if (!recruiter) return

    const newTarget: RecruiterTarget = {
      id: Date.now().toString(),
      recruiterId,
      recruiterName: recruiter.name,
      period: selectedPeriod,
      periodType,
      submissions: 0,
      shortlists: 0,
      interviews: 0,
      offers: 0,
      joins: 0,
      slaCompliance: 90
    }

    setRecruiterTargets(prev => [...prev, newTarget])
  }

  const saveTargets = async () => {
    setSaving(true)
    try {
      // Here you would save to the recruiter_target table
      // await targetService.saveRecruiterTargets(recruiterTargets)
      // await targetService.saveTeamTarget(teamTarget)
      
      toast({
        title: 'Success',
        description: 'Targets saved successfully'
      })
      
      // Refresh change logs
      loadChangeLogs()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save targets',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const recalculateTeamTarget = () => {
    if (!teamTarget) return

    const calculated: TeamTarget = {
      period: selectedPeriod,
      submissions: recruiterTargets.reduce((sum, t) => sum + t.submissions, 0),
      shortlists: recruiterTargets.reduce((sum, t) => sum + t.shortlists, 0),
      interviews: recruiterTargets.reduce((sum, t) => sum + t.interviews, 0),
      offers: recruiterTargets.reduce((sum, t) => sum + t.offers, 0),
      joins: recruiterTargets.reduce((sum, t) => sum + t.joins, 0),
      slaCompliance: Math.round(recruiterTargets.reduce((sum, t) => sum + t.slaCompliance, 0) / recruiterTargets.length),
      isOverride: false
    }

    setTeamTarget(calculated)
  }

  const changeLogColumns = [
    {
      id: 'recruiterName',
      header: 'Recruiter',
      accessor: 'recruiterName' as const
    },
    {
      id: 'period',
      header: 'Period',
      accessor: 'period' as const
    },
    {
      id: 'metric',
      header: 'Metric',
      accessor: 'metric' as const
    },
    {
      id: 'change',
      header: 'Change',
      accessor: 'oldValue' as const,
      cell: (value: any, row: TargetChangeLog) => (
        <span className="font-mono">
          {row.oldValue} → {row.newValue}
        </span>
      )
    },
    {
      id: 'changedBy',
      header: 'Changed By',
      accessor: 'changedBy' as const
    },
    {
      id: 'timestamp',
      header: 'When',
      accessor: 'timestamp' as const,
      cell: (value: any, row: TargetChangeLog) => new Date(row.timestamp).toLocaleDateString()
    }
  ]

  const canEditTargets = can('hiring.settings.targets.edit')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Targets</h2>
          <p className="text-muted-foreground">
            Set and track recruiter and team performance targets
          </p>
        </div>
        {canEditTargets && (
          <Button onClick={saveTargets} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Targets'}
          </Button>
        )}
      </div>

      <Tabs defaultValue="configure" className="space-y-6">
        <TabsList>
          <TabsTrigger value="configure">Configure Targets</TabsTrigger>
          <TabsTrigger value="team">Team Rollup</TabsTrigger>
          <TabsTrigger value="logs">Change Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-6">
          {/* Period Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Period Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="periodType">Period Type</Label>
                  <Select value={periodType} onValueChange={(value) => setPeriodType(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="quarter">Quarter</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="period">Period</Label>
                  <Input
                    id="period"
                    type={periodType === 'month' ? 'month' : 'date'}
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    disabled={!canEditTargets}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={loadTargets} variant="outline">
                    Load Period
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recruiter Targets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recruiter Targets
              </CardTitle>
              <CardDescription>
                Set individual performance targets for each recruiter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {canEditTargets && (
                <div className="flex items-center gap-2">
                  <Select onValueChange={addRecruiterTarget}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Add recruiter..." />
                    </SelectTrigger>
                    <SelectContent>
                      {recruiters
                        .filter(r => !recruiterTargets.find(t => t.recruiterId === r.id))
                        .map(recruiter => (
                          <SelectItem key={recruiter.id} value={recruiter.id}>
                            {recruiter.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={recalculateTeamTarget} variant="outline" size="sm">
                    Recalculate Team
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                {recruiterTargets.map(target => (
                  <div key={target.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{target.recruiterName}</h4>
                      <Badge variant="outline">{target.period}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div>
                        <Label>Submissions</Label>
                        <Input
                          type="number"
                          value={target.submissions}
                          onChange={(e) => updateRecruiterTarget(target.recruiterId, 'submissions', Number(e.target.value))}
                          disabled={!canEditTargets}
                        />
                      </div>
                      <div>
                        <Label>Shortlists</Label>
                        <Input
                          type="number"
                          value={target.shortlists}
                          onChange={(e) => updateRecruiterTarget(target.recruiterId, 'shortlists', Number(e.target.value))}
                          disabled={!canEditTargets}
                        />
                      </div>
                      <div>
                        <Label>Interviews</Label>
                        <Input
                          type="number"
                          value={target.interviews}
                          onChange={(e) => updateRecruiterTarget(target.recruiterId, 'interviews', Number(e.target.value))}
                          disabled={!canEditTargets}
                        />
                      </div>
                      <div>
                        <Label>Offers</Label>
                        <Input
                          type="number"
                          value={target.offers}
                          onChange={(e) => updateRecruiterTarget(target.recruiterId, 'offers', Number(e.target.value))}
                          disabled={!canEditTargets}
                        />
                      </div>
                      <div>
                        <Label>Joins</Label>
                        <Input
                          type="number"
                          value={target.joins}
                          onChange={(e) => updateRecruiterTarget(target.recruiterId, 'joins', Number(e.target.value))}
                          disabled={!canEditTargets}
                        />
                      </div>
                      <div>
                        <Label>SLA %</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={target.slaCompliance}
                          onChange={(e) => updateRecruiterTarget(target.recruiterId, 'slaCompliance', Number(e.target.value))}
                          disabled={!canEditTargets}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Target Rollup
              </CardTitle>
              <CardDescription>
                Auto-calculated team targets based on individual recruiter targets
                {can('hiring.settings.targets.override') && ' (Override allowed)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teamTarget && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Team Target for {teamTarget.period}</h4>
                    {teamTarget.isOverride && (
                      <Badge variant="secondary">Manual Override</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div>
                      <Label>Submissions</Label>
                      <Input
                        type="number"
                        value={teamTarget.submissions}
                        onChange={(e) => setTeamTarget(prev => prev ? { ...prev, submissions: Number(e.target.value), isOverride: true } : null)}
                        disabled={!can('hiring.settings.targets.override')}
                      />
                    </div>
                    <div>
                      <Label>Shortlists</Label>
                      <Input
                        type="number"
                        value={teamTarget.shortlists}
                        onChange={(e) => setTeamTarget(prev => prev ? { ...prev, shortlists: Number(e.target.value), isOverride: true } : null)}
                        disabled={!can('hiring.settings.targets.override')}
                      />
                    </div>
                    <div>
                      <Label>Interviews</Label>
                      <Input
                        type="number"
                        value={teamTarget.interviews}
                        onChange={(e) => setTeamTarget(prev => prev ? { ...prev, interviews: Number(e.target.value), isOverride: true } : null)}
                        disabled={!can('hiring.settings.targets.override')}
                      />
                    </div>
                    <div>
                      <Label>Offers</Label>
                      <Input
                        type="number"
                        value={teamTarget.offers}
                        onChange={(e) => setTeamTarget(prev => prev ? { ...prev, offers: Number(e.target.value), isOverride: true } : null)}
                        disabled={!can('hiring.settings.targets.override')}
                      />
                    </div>
                    <div>
                      <Label>Joins</Label>
                      <Input
                        type="number"
                        value={teamTarget.joins}
                        onChange={(e) => setTeamTarget(prev => prev ? { ...prev, joins: Number(e.target.value), isOverride: true } : null)}
                        disabled={!can('hiring.settings.targets.override')}
                      />
                    </div>
                    <div>
                      <Label>SLA %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={teamTarget.slaCompliance}
                        onChange={(e) => setTeamTarget(prev => prev ? { ...prev, slaCompliance: Number(e.target.value), isOverride: true } : null)}
                        disabled={!can('hiring.settings.targets.override')}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Target Change Logs
              </CardTitle>
              <CardDescription>
                Track all changes made to performance targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={changeLogs}
                columns={changeLogColumns}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}