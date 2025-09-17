import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import type { SchedulingFilters as FiltersType } from '@/types/scheduling'

interface SchedulingFiltersProps {
  filters: FiltersType
  onFiltersChange: (filters: FiltersType) => void
}

interface Client {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
  client_id: string
}

export function SchedulingFilters({ filters, onFiltersChange }: SchedulingFiltersProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [localFilters, setLocalFilters] = useState<FiltersType>(filters)

  useEffect(() => {
    loadClients()
    loadProjects()
  }, [])

  useEffect(() => {
    if (localFilters.client_id) {
      setFilteredProjects(projects.filter(p => p.client_id === localFilters.client_id))
    } else {
      setFilteredProjects(projects)
    }
  }, [localFilters.client_id, projects])

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_clients')
        .select('id, name')
        .order('name')

      if (error) {
        console.error('Error loading clients:', error)
        return
      }

      setClients(data || [])
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_projects')
        .select('id, name, client_id')
        .order('name')

      if (error) {
        console.error('Error loading projects:', error)
        return
      }

      setProjects(data || [])
    } catch (error) {
      console.error('Error loading projects:', error)
    }
  }

  const handleFilterChange = (key: keyof FiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    
    // Clear project filter if client changes
    if (key === 'client_id') {
      newFilters.project_id = undefined
    }
    
    setLocalFilters(newFilters)
  }

  const handleStatusToggle = (status: string) => {
    const currentStatuses = localFilters.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status]
    
    handleFilterChange('status', newStatuses.length > 0 ? newStatuses : undefined)
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
  }

  const clearFilters = () => {
    const emptyFilters: FiltersType = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Client Filter */}
      <div className="space-y-2">
        <Label htmlFor="client">Client</Label>
        <Select
          value={localFilters.client_id || ""}
          onValueChange={(value) => handleFilterChange('client_id', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All clients</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Project Filter */}
      <div className="space-y-2">
        <Label htmlFor="project">Project</Label>
        <Select
          value={localFilters.project_id || ""}
          onValueChange={(value) => handleFilterChange('project_id', value || undefined)}
          disabled={!localFilters.client_id}
        >
          <SelectTrigger>
            <SelectValue placeholder={localFilters.client_id ? "All projects" : "Select client first"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All projects</SelectItem>
            {filteredProjects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mode Filter */}
      <div className="space-y-2">
        <Label htmlFor="mode">Mode</Label>
        <Select
          value={localFilters.mode || ""}
          onValueChange={(value) => handleFilterChange('mode', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All modes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All modes</SelectItem>
            <SelectItem value="virtual">Virtual</SelectItem>
            <SelectItem value="onsite">Onsite</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date From */}
      <div className="space-y-2">
        <Label htmlFor="date_from">From Date</Label>
        <Input
          id="date_from"
          type="date"
          value={localFilters.date_from || ""}
          onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
        />
      </div>

      {/* Date To */}
      <div className="space-y-2">
        <Label htmlFor="date_to">To Date</Label>
        <Input
          id="date_to"
          type="date"
          value={localFilters.date_to || ""}
          onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
        />
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <Label>Status</Label>
        <div className="flex flex-wrap gap-2">
          {['available', 'booked', 'used', 'expired', 'cancelled'].map((status) => {
            const isSelected = localFilters.status?.includes(status) || false
            return (
              <Badge
                key={status}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => handleStatusToggle(status)}
              >
                {status}
                {isSelected && <X className="h-3 w-3 ml-1" />}
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 md:col-span-2 lg:col-span-3">
        <Button onClick={applyFilters}>Apply Filters</Button>
        <Button variant="outline" onClick={clearFilters}>Clear All</Button>
      </div>
    </div>
  )
}