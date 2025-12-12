import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, CheckSquare, Clock, Search, FileText, Upload } from 'lucide-react'
import { taskService, TaskItem } from '@/services/taskService'
import { allocationService, ProjectOption } from '@/services/allocationService'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { AddTaskDialog } from './AddTaskDialog'
import { ImportTasksDialog } from './ImportTasksDialog'
import { useIsMobile } from '@/hooks/use-mobile'

export function ProjectTasks() {
  const isMobile = useIsMobile()
  const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(null)
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  // Search projects when query changes
  useEffect(() => {
    const searchProjects = async () => {
      if (searchQuery.length < 2) {
        setProjectOptions([])
        return
      }

      setIsSearching(true)
      try {
        const results = await allocationService.searchProjects(searchQuery)
        setProjectOptions(results)
      } catch (error) {
        console.error('Error searching projects:', error)
        setProjectOptions([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounce = setTimeout(searchProjects, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  // Fetch tasks when project is selected
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedProject) {
        setTasks([])
        return
      }

      setIsLoadingTasks(true)
      try {
        const taskData = await taskService.getTasksByProject(selectedProject.id)
        setTasks(taskData)
      } catch (error) {
        console.error('Error fetching tasks:', error)
        setTasks([])
      } finally {
        setIsLoadingTasks(false)
      }
    }

    fetchTasks()
  }, [selectedProject])

  const handleSelectProject = (project: ProjectOption) => {
    setSelectedProject(project)
    setOpen(false)
    setSearchQuery('')
  }

  const handleRefreshTasks = async () => {
    if (!selectedProject) return
    setIsLoadingTasks(true)
    try {
      const taskData = await taskService.getTasksByProject(selectedProject.id)
      setTasks(taskData)
    } catch (error) {
      console.error('Error refreshing tasks:', error)
    } finally {
      setIsLoadingTasks(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
        <p className="text-muted-foreground">Manage project tasks and deliverables</p>
      </div>

      {/* Project Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Project *</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full max-w-md justify-between"
            >
              {selectedProject ? (
                <span>{selectedProject.name}</span>
              ) : (
                <span className="text-muted-foreground">Search and select a project...</span>
              )}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full max-w-md p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Type to search projects..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                {isSearching ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                ) : searchQuery.length < 2 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Type at least 2 characters to search
                  </div>
                ) : projectOptions.length === 0 ? (
                  <CommandEmpty>No projects found.</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {projectOptions.map((project) => (
                      <CommandItem
                        key={project.id}
                        value={project.id}
                        onSelect={() => handleSelectProject(project)}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{project.name}</span>
                          {project.clientName && (
                            <span className="text-xs text-muted-foreground">
                              {project.clientName}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Conditional Content */}
      {!selectedProject ? (
        // State 1: No project selected
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a project to view tasks</h3>
            <p className="text-muted-foreground text-center">
              Use the search above to find and select a project
            </p>
          </CardContent>
        </Card>
      ) : isLoadingTasks ? (
        // Loading state
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading tasks...</p>
          </CardContent>
        </Card>
      ) : tasks.length === 0 ? (
        // State 2: Project selected, no tasks
        <div className="space-y-4">
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import Template
            </Button>
            <Button onClick={() => setIsAddTaskDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks available</h3>
              <p className="text-muted-foreground text-center">
                No tasks have been created for this project.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        // State 3: Project selected, has tasks
        <div className="space-y-4">
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import Template
            </Button>
            <Button onClick={() => setIsAddTaskDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
          {isMobile ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <Card key={task.id} className="p-4">
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium">{task.name}</h4>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <span>Est: {task.estHours}h</span>
                      <span>Actual: {task.actualHours ?? 0}h</span>
                      {task.billable ? (
                        <CheckSquare className="h-4 w-4 text-success" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Est. Hours</TableHead>
                      <TableHead>Actual Hours</TableHead>
                      <TableHead>Billable</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.name}</div>
                            {task.description && (
                              <div className="text-sm text-muted-foreground">{task.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{task.estHours}h</TableCell>
                        <TableCell>{task.actualHours ?? 0}h</TableCell>
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
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Add Task Dialog */}
      {selectedProject && (
        <>
          <AddTaskDialog
            open={isAddTaskDialogOpen}
            onOpenChange={setIsAddTaskDialogOpen}
            projectId={selectedProject.id}
            projectName={selectedProject.name}
            onSuccess={handleRefreshTasks}
          />
          <ImportTasksDialog
            open={isImportDialogOpen}
            onOpenChange={setIsImportDialogOpen}
            projectId={selectedProject.id}
            onSuccess={handleRefreshTasks}
          />
        </>
      )}
    </div>
  )
}
