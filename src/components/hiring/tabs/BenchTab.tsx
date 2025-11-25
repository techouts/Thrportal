import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, Calendar, TrendingUp, UserCheck } from 'lucide-react'
import { hiringService } from '@/services/hiringService'
import type { BenchResource, HiringFilters } from '@/types/hiring'

interface BenchTabProps {
  filters: HiringFilters
}

export function BenchTab({ filters }: BenchTabProps) {
  const [benchResources, setBenchResources] = useState<BenchResource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const benchData = await hiringService.getBenchResources()
        setBenchResources(benchData)
      } catch (error) {
        console.error('Failed to load bench data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters])

  const benchTrendData = Array.from({ length: 7 }, (_, i) => ({
    week: `Week ${i + 1}`,
    available: Math.floor(Math.random() * 10) + 15,
    shadow: Math.floor(Math.random() * 5) + 5,
    rollingOff: Math.floor(Math.random() * 3) + 2
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'default'
      case 'shadow': return 'secondary' 
      case 'rolling-off': return 'destructive'
      default: return 'outline'
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

  const totalBench = benchResources.length
  const availableCount = benchResources.filter(r => r.status === 'available').length
  const shadowCount = benchResources.filter(r => r.shadowAssigned).length
  const rollingOffCount = benchResources.filter(r => r.rollOffDate).length

  return (
    <div className="space-y-6">
      {/* Bench Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Bench</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalBench}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Resources available</p>
              </div>
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Available</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{availableCount}</p>
                <p className="text-xs text-green-700 dark:text-green-300">Ready for deployment</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Shadow Assigned</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{shadowCount}</p>
                <p className="text-xs text-orange-700 dark:text-orange-300">In training</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Rolling Off</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">{rollingOffCount}</p>
                <p className="text-xs text-red-700 dark:text-red-300">Next 90 days</p>
              </div>
              <Calendar className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bench Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Bench Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={benchTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="available" stroke="#30C85A" strokeWidth={2} />
                <Line type="monotone" dataKey="shadow" stroke="#2E5BFF" strokeWidth={2} />
                <Line type="monotone" dataKey="rollingOff" stroke="#FF6B6B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skill Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Skill-wise Bench Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['React', 'Java', 'Python', 'DevOps', 'Data Science'].map((skill, index) => {
                const count = benchResources.filter(r => r.skill === skill).length
                const percentage = Math.round((count / totalBench) * 100)
                
                return (
                  <div key={skill} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{skill}</Badge>
                      <span className="text-sm font-medium">{count} resources</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-primary" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{percentage}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bench Resources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bench Resource Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Business Unit</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Available From</TableHead>
                <TableHead>Roll-off Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {benchResources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">{resource.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{resource.skill}</Badge>
                  </TableCell>
                  <TableCell>{resource.businessUnit}</TableCell>
                  <TableCell>{resource.city}</TableCell>
                  <TableCell>{resource.experience}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(resource.status)}>
                      {resource.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(resource.availabilityDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {resource.rollOffDate ? (
                      <Badge variant="destructive">
                        {new Date(resource.rollOffDate).toLocaleDateString()}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
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