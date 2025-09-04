import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Download, TrendingUp, Clock, AlertTriangle, Target } from 'lucide-react'
import { jobRequisitionsService } from '@/services/jobRequisitionsService'
import { useToast } from '@/hooks/use-toast'
import type { JobRequisitionAnalytics } from '@/types/jobRequisitions'

interface ReportsTabProps {
  filters: any
}

export function ReportsTab({ filters }: ReportsTabProps) {
  const [analytics, setAnalytics] = useState<JobRequisitionAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'pdf'>('xlsx')
  const { toast } = useToast()

  useEffect(() => {
    loadAnalytics()
  }, [filters])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const data = await jobRequisitionsService.getAnalytics()
      setAnalytics(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const fileName = await jobRequisitionsService.exportData(exportFormat, filters)
      toast({
        title: "Export Successful",
        description: `Data exported as ${fileName}`
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive"
      })
    }
  }

  const pieColors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--muted))', 'hsl(var(--accent))']

  if (loading || !analytics) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Export Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">JD Analytics Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive insights into job requisition trends and performance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExport} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.openVsClosed.open + analytics.openVsClosed.closed}</div>
                <div className="text-sm text-muted-foreground">Total JDs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.openVsClosed.open}</div>
                <div className="text-sm text-muted-foreground">Open JDs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.avgTATToFirstSubmission}</div>
                <div className="text-sm text-muted-foreground">Avg TAT (days)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.agingJDs.filter(jd => jd.daysPending > 7).length}</div>
                <div className="text-sm text-muted-foreground">Aging JDs ({'>'}7d)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* JD Volume Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>JD Volume Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.volumeOverTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis className="text-xs" />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Open vs Closed JDs */}
        <Card>
          <CardHeader>
            <CardTitle>Open vs Closed JDs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Open', value: analytics.openVsClosed.open },
                    { name: 'Closed', value: analytics.openVsClosed.closed }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                >
                  {[
                    { name: 'Open', value: analytics.openVsClosed.open },
                    { name: 'Closed', value: analytics.openVsClosed.closed }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills in Demand */}
        <Card>
          <CardHeader>
            <CardTitle>Top Skills in Demand</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topSkills} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="skill" type="category" className="text-xs" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Hiring Departments */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Hiring Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topDepartments}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="department" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Aging JDs Table */}
      <Card>
        <CardHeader>
          <CardTitle>JD Aging Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>JD ID</TableHead>
                <TableHead>Days Pending</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.agingJDs.map((jd) => (
                <TableRow key={jd.id}>
                  <TableCell className="font-medium">{jd.title}</TableCell>
                  <TableCell className="font-mono text-sm">{jd.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${jd.daysPending > 15 ? 'text-red-600' : jd.daysPending > 7 ? 'text-orange-600' : 'text-green-600'}`}>
                        {jd.daysPending} days
                      </span>
                      {jd.daysPending > 15 && (
                        <Badge variant="destructive" className="text-xs">
                          Critical
                        </Badge>
                      )}
                      {jd.daysPending > 7 && jd.daysPending <= 15 && (
                        <Badge variant="secondary" className="text-xs">
                          Warning
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Pending</Badge>
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