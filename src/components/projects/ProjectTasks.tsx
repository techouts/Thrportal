import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, Search, Calendar, Download, CheckSquare, Clock } from 'lucide-react'
import { mockTasks } from '@/mocks/projectData'

export function ProjectTasks() {
  const [searchQuery, setSearchQuery] = useState('')
  const tasks = mockTasks

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success'
      case 'in_progress': return 'bg-primary' 
      case 'not_started': return 'bg-muted'
      case 'blocked': return 'bg-destructive'
      default: return 'bg-muted'
    }
  }

  const taskData = tasks.map(t => ({
    name: t.name.substring(0, 15) + '...',
    estimated: t.est_hours,
    actual: t.actual_hours || 0
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
        <p className="text-muted-foreground">Manage project tasks and deliverables</p>
      </div>

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tasks..." className="pl-8 w-64" />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Gantt View
              </Button>
              <Button variant="outline">Import Template</Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Stage/Phase</TableHead>
                  <TableHead>Est. Hours</TableHead>
                  <TableHead>Actual Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Billable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{task.name}</div>
                        <div className="text-sm text-muted-foreground">{task.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{task.project_name}</TableCell>
                    <TableCell>{task.stage} / {task.phase}</TableCell>
                    <TableCell>{task.est_hours}h</TableCell>
                    <TableCell>{task.actual_hours || 0}h</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.billable ? (
                        <CheckSquare className="h-4 w-4 text-success" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estimated vs Actual Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="estimated" fill="hsl(var(--primary))" name="Estimated" />
                  <Bar dataKey="actual" fill="hsl(var(--success))" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}