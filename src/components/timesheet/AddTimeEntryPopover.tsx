import React, { useState, useEffect } from 'react'
import { Plus, Search, ChevronRight } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { ProjectAssignment, ProjectTask } from '@/types/timesheet'

interface AddTimeEntryPopoverProps {
  projects: ProjectAssignment[]
  onSelectEntry: (project: ProjectAssignment, task: ProjectTask) => void
  getTasks: (projectId: string) => Promise<ProjectTask[]>
  disabled?: boolean
}

export function AddTimeEntryPopover({
  projects,
  onSelectEntry,
  getTasks,
  disabled = false
}: AddTimeEntryPopoverProps) {
  const [open, setOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectAssignment | null>(null)
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [projectSearch, setProjectSearch] = useState('')
  const [taskSearch, setTaskSearch] = useState('')
  const [loadingTasks, setLoadingTasks] = useState(false)

  // Filter projects based on search
  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.code.toLowerCase().includes(projectSearch.toLowerCase())
  )

  // Filter tasks based on search
  const filteredTasks = tasks.filter(t =>
    t.name.toLowerCase().includes(taskSearch.toLowerCase()) ||
    t.code.toLowerCase().includes(taskSearch.toLowerCase())
  )

  // Load tasks when project is selected
  useEffect(() => {
    if (selectedProject) {
      setLoadingTasks(true)
      getTasks(selectedProject.projectId)
        .then(setTasks)
        .finally(() => setLoadingTasks(false))
    }
  }, [selectedProject, getTasks])

  // Reset state when popover closes
  useEffect(() => {
    if (!open) {
      setSelectedProject(null)
      setTasks([])
      setProjectSearch('')
      setTaskSearch('')
    }
  }, [open])

  const handleSelectTask = (task: ProjectTask) => {
    if (selectedProject) {
      onSelectEntry(selectedProject, task)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={() => setOpen(true)}
          disabled={disabled}
          className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Add Time Entry
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] p-0" align="start">
        <div className="flex h-[400px]">
          {/* Left Column - Projects */}
          <div className="w-1/2 border-r flex flex-col">
            <div className="p-2 border-b">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Projects
              </span>
            </div>
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-1">
                {filteredProjects.map((project) => (
                  <button
                    key={project.projectId}
                    onClick={() => setSelectedProject(project)}
                    className={cn(
                      "w-full flex items-center justify-between p-2 rounded-md text-left text-sm hover:bg-muted transition-colors",
                      selectedProject?.projectId === project.projectId && "bg-muted"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{project.name}</div>
                      {/* <div className="text-xs text-muted-foreground">{project.code}</div> */}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
                {filteredProjects.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No projects found
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Column - Tasks */}
          <div className="w-1/2 flex flex-col">
            <div className="p-2 border-b">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Phase/Tasks
              </span>
            </div>
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search phase/task"
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className="pl-8 h-8 text-sm"
                  disabled={!selectedProject}
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-1">
                {!selectedProject ? (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    Select a project first
                  </div>
                ) : loadingTasks ? (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    Loading tasks...
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No tasks found
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <button
                      key={task.taskId}
                      onClick={() => handleSelectTask(task)}
                      className="w-full flex items-center p-2 rounded-md text-left text-sm hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{task.name}</div>
                        {/* <div className="text-xs text-muted-foreground">{task.code}</div> */}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
