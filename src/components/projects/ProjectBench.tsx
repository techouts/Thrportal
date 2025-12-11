import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { mockForecastData } from '@/mocks/projectData'
import { benchService, BenchResource } from '@/services/benchService'

interface ShadowAllocation {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  avatarUrl?: string;
  targetProject: string;
  startDate: string;
  allocationPct: number;
}

export function ProjectBench() {
  const [benchEmployees, setBenchEmployees] = useState<BenchResource[]>([])
  const [shadowAllocations, setShadowAllocations] = useState<ShadowAllocation[]>([])
  const [loading, setLoading] = useState(true)
  const forecastData = mockForecastData

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [benchData, shadowData] = await Promise.all([
          benchService.getBenchResources(),
          benchService.getShadowAllocations()
        ])
        setBenchEmployees(benchData)
        setShadowAllocations(shadowData)
      } catch (error) {
        console.error('Error fetching bench data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bench Management</h2>
        <p className="text-muted-foreground">Monitor resource availability and forecast needs</p>
      </div>

      <Tabs defaultValue="idle" className="space-y-6">
        <TabsList>
          <TabsTrigger value="idle">Idle</TabsTrigger>
          <TabsTrigger value="shadow">Shadow</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="idle" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bench Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : benchEmployees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No employees currently on bench
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Available From</TableHead>
                      <TableHead>Bench Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {benchEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={employee.avatarUrl} />
                              <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{employee.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{employee.role}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {employee.skills.length > 0 ? (
                              employee.skills.slice(0, 3).map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-xs">No skills listed</span>
                            )}
                            {employee.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{employee.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(employee.availableFrom).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={employee.benchDays > 14 ? 'destructive' : 'secondary'}>
                            {employee.benchDays} days
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={employee.status === 'unallocated' ? 'destructive' : 'outline'}>
                            {employee.status === 'unallocated' ? 'Unallocated' : 'Rolling Off'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <ArrowRight className="h-4 w-4 mr-1" />
                              Shadow
                            </Button>
                            <Button size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Allocate
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shadow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shadow Allocations</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : shadowAllocations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No shadow allocations found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Target Project</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Allocation %</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shadowAllocations.map((allocation) => (
                      <TableRow key={allocation.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={allocation.avatarUrl} />
                              <AvatarFallback>{getInitials(allocation.employeeName)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{allocation.employeeName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{allocation.role}</TableCell>
                        <TableCell>{allocation.targetProject}</TableCell>
                        <TableCell>{new Date(allocation.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{allocation.allocationPct}%</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                            <Button size="sm" variant="outline">
                              Release
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Forecast Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">87%</div>
                <p className="text-xs text-muted-foreground">Last 4 weeks</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Shadow Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">76%</div>
                <p className="text-xs text-muted-foreground">Next 4 weeks</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Hiring Signal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">3</div>
                <p className="text-xs text-muted-foreground">Roles needed</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>4-Week Forecast Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Needed</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Shadow Coverage</TableHead>
                    <TableHead>Gap</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecastData.map((forecast, index) => {
                    const gap = forecast.needed - forecast.available
                    return (
                      <TableRow key={index}>
                        <TableCell>{forecast.week}</TableCell>
                        <TableCell>{forecast.role}</TableCell>
                        <TableCell>{forecast.needed}</TableCell>
                        <TableCell>{forecast.available}</TableCell>
                        <TableCell>
                          <Badge variant={forecast.shadow_coverage >= 80 ? 'default' : 'destructive'}>
                            {forecast.shadow_coverage}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={gap > 0 ? 'destructive' : gap < 0 ? 'secondary' : 'default'}>
                            {gap > 0 ? `+${gap}` : gap}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
