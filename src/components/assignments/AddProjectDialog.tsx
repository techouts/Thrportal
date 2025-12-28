import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { allocationService, ProjectOption } from '@/services/allocationService';

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  employeeName: string;
  onSuccess: () => void;
}

export function AddProjectDialog({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  onSuccess,
}: AddProjectDialogProps) {
  const { toast } = useToast();
  
  // Form state
  const [projectId, setProjectId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [resourceType, setResourceType] = useState<'ACTIVE' | 'SHADOW'>('ACTIVE');
  const [allocationPct, setAllocationPct] = useState('100');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  
  // Date picker popover states
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
  // Search state
  const [projectSearch, setProjectSearch] = useState('');
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Duplicate check state
  const [hasDuplicate, setHasDuplicate] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch roles
  const { data: roles = [] } = useQuery({
    queryKey: ['roles-catalog'],
    queryFn: () => allocationService.getRoles(),
  });

  // Debounced project search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (projectSearch.length >= 2) {
        setIsSearching(true);
        const results = await allocationService.searchProjects(projectSearch);
        setProjectOptions(results);
        setIsSearching(false);
      } else if (projectSearch.length === 0 && !selectedProject) {
        setProjectOptions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [projectSearch, selectedProject]);

  // Handle project selection - persist selected project and check for duplicates
  const handleProjectChange = useCallback(async (value: string) => {
    setProjectId(value);
    const selected = projectOptions.find(p => p.id === value);
    if (selected) {
      setSelectedProject(selected);
      // Check for existing allocation
      setIsCheckingDuplicate(true);
      const exists = await allocationService.checkExistingAllocation(employeeId, value);
      setHasDuplicate(exists);
      setIsCheckingDuplicate(false);
    } else {
      setSelectedProject(null);
      setHasDuplicate(false);
    }
  }, [projectOptions, employeeId]);

  // Combined options that always include the selected project
  const combinedProjectOptions = useMemo(() => {
    const options = projectOptions.map(p => ({
      value: p.id,
      label: `${p.name} (${p.clientName})`,
    }));
    
    // Always include selected project if it exists and isn't already in options
    if (selectedProject && !projectOptions.find(p => p.id === selectedProject.id)) {
      options.unshift({
        value: selectedProject.id,
        label: `${selectedProject.name} (${selectedProject.clientName})`,
      });
    }
    
    return options;
  }, [projectOptions, selectedProject]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setProjectId('');
      setRoleId('');
      setResourceType('ACTIVE');
      setAllocationPct('100');
      setStartDate(undefined);
      setEndDate(undefined);
      setProjectSearch('');
      setProjectOptions([]);
      setSelectedProject(null);
      setHasDuplicate(false);
      setErrors({});
      setStartDateOpen(false);
      setEndDateOpen(false);
    }
  }, [open]);

  // Validation
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!projectId) {
      newErrors.project = 'Project is required';
    }
    if (hasDuplicate) {
      newErrors.project = 'Employee already has an active allocation to this project';
    }
    if (!roleId) {
      newErrors.role = 'Role is required';
    }
    
    const pctValue = parseInt(allocationPct, 10);
    if (isNaN(pctValue) || pctValue < 1 || pctValue > 100) {
      newErrors.allocationPct = 'Allocation must be between 1% and 100%';
    }
    
    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (startDate && endDate && endDate <= startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [projectId, hasDuplicate, roleId, allocationPct, startDate, endDate]);

  // Submit handler
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await allocationService.createAllocation({
        resourceId: employeeId,
        projectId,
        roleId,
        resourceType,
        allocationPct: parseInt(allocationPct, 10),
        startDate: format(startDate!, 'yyyy-MM-dd'),
        endDate: format(endDate!, 'yyyy-MM-dd'),
      });

      toast({
        title: 'Success',
        description: 'Project added successfully',
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating allocation:', error);
      toast({
        title: 'Error',
        description: 'Failed to add project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Project to {employeeName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Project Search */}
          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Combobox
              options={combinedProjectOptions}
              value={projectId}
              onChange={handleProjectChange}
              placeholder="Search projects..."
              searchPlaceholder="Type to search projects..."
              emptyMessage={isSearching ? 'Searching...' : 'No projects found. Type at least 2 characters.'}
              onSearchChange={setProjectSearch}
            />
            {errors.project && (
              <p className="text-sm text-destructive">{errors.project}</p>
            )}
            {isCheckingDuplicate && (
              <p className="text-sm text-muted-foreground">Checking existing allocations...</p>
            )}
            {!isCheckingDuplicate && hasDuplicate && (
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>Employee already has an active allocation to this project</span>
              </div>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Combobox
              options={roles.map(r => ({ value: r.id, label: r.name }))}
              value={roleId}
              onChange={setRoleId}
              placeholder="Select role..."
              searchPlaceholder="Search roles..."
              emptyMessage="No roles found."
            />
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role}</p>
            )}
          </div>

          {/* Resource Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Resource Type *</Label>
            <Select
              value={resourceType}
              onValueChange={(value: 'ACTIVE' | 'SHADOW') => setResourceType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SHADOW">Shadow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Allocation Percentage */}
          <div className="space-y-2">
            <Label htmlFor="allocation">Allocation Percentage *</Label>
            <div className="relative">
              <Input
                id="allocation"
                type="number"
                min={1}
                max={100}
                value={allocationPct}
                onChange={(e) => setAllocationPct(e.target.value)}
                placeholder="Enter allocation %"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
            {errors.allocationPct && (
              <p className="text-sm text-destructive">{errors.allocationPct}</p>
            )}
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal min-w-0',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {startDate ? format(startDate, 'PP') : 'Pick a date'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setStartDateOpen(false);
                      setEndDateOpen(true);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal min-w-0',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {endDate ? format(endDate, 'PP') : 'Pick a date'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setEndDateOpen(false);
                    }}
                    disabled={(date) => startDate ? date <= startDate : false}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || hasDuplicate}>
            {isSubmitting ? 'Adding...' : 'Add Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
