import React, { useState, useEffect, useCallback } from 'react';
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
import { CalendarIcon, Info } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { allocationService, ResourceOption, ResourceAllocation } from '@/services/allocationService';

interface AddResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess: () => void;
}

export function AddResourceDialog({
  open,
  onOpenChange,
  projectId,
  onSuccess,
}: AddResourceDialogProps) {
  const { toast } = useToast();
  
  // Form state
  const [resourceId, setResourceId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [resourceType, setResourceType] = useState<'ACTIVE' | 'SHADOW'>('ACTIVE');
  const [allocationPct, setAllocationPct] = useState('100');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  
  // Search state
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceOptions, setResourceOptions] = useState<ResourceOption[]>([]);
  const [selectedResource, setSelectedResource] = useState<ResourceOption | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Existing allocations state
  const [existingAllocations, setExistingAllocations] = useState<ResourceAllocation[]>([]);
  const [isLoadingAllocations, setIsLoadingAllocations] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch roles
  const { data: roles = [] } = useQuery({
    queryKey: ['roles-catalog'],
    queryFn: () => allocationService.getRoles(),
  });

  // Debounced resource search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (resourceSearch.length >= 2) {
        setIsSearching(true);
        const results = await allocationService.searchResources(resourceSearch);
        setResourceOptions(results);
        setIsSearching(false);
      } else if (resourceSearch.length === 0 && !selectedResource) {
        setResourceOptions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [resourceSearch, selectedResource]);

  // Handle resource selection - persist selected resource and fetch allocations
  const handleResourceChange = useCallback(async (value: string) => {
    setResourceId(value);
    const selected = resourceOptions.find(r => r.id === value);
    if (selected) {
      setSelectedResource(selected);
      // Fetch existing allocations for this resource
      setIsLoadingAllocations(true);
      const allocations = await allocationService.getActiveAllocationsForResource(value);
      setExistingAllocations(allocations);
      setIsLoadingAllocations(false);
    } else {
      setExistingAllocations([]);
    }
  }, [resourceOptions]);

  // Combined options that always include the selected resource
  const combinedResourceOptions = React.useMemo(() => {
    const options = resourceOptions.map(r => ({
      value: r.id,
      label: r.displayName + (r.email ? ` (${r.email})` : ''),
    }));
    
    // Always include selected resource if it exists and isn't already in options
    if (selectedResource && !resourceOptions.find(r => r.id === selectedResource.id)) {
      options.unshift({
        value: selectedResource.id,
        label: selectedResource.displayName + (selectedResource.email ? ` (${selectedResource.email})` : ''),
      });
    }
    
    return options;
  }, [resourceOptions, selectedResource]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setResourceId('');
      setRoleId('');
      setResourceType('ACTIVE');
      setAllocationPct('100');
      setStartDate(undefined);
      setEndDate(undefined);
      setResourceSearch('');
      setResourceOptions([]);
      setSelectedResource(null);
      setExistingAllocations([]);
      setErrors({});
    }
  }, [open]);

  // Validation
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!resourceId) {
      newErrors.resource = 'Resource is required';
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
  }, [resourceId, roleId, allocationPct, startDate, endDate]);

  // Submit handler
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await allocationService.createAllocation({
        resourceId,
        projectId,
        roleId,
        resourceType,
        allocationPct: parseInt(allocationPct, 10),
        startDate: format(startDate!, 'yyyy-MM-dd'),
        endDate: format(endDate!, 'yyyy-MM-dd'),
      });

      toast({
        title: 'Success',
        description: 'Resource added successfully',
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating allocation:', error);
      toast({
        title: 'Error',
        description: 'Failed to add resource. Please try again.',
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
          <DialogTitle>Add Resource</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Resource Search */}
          <div className="space-y-2">
            <Label htmlFor="resource">Resource *</Label>
            <Combobox
              options={combinedResourceOptions}
              value={resourceId}
              onChange={handleResourceChange}
              placeholder="Search by name..."
              searchPlaceholder="Type to search resources..."
              emptyMessage={isSearching ? 'Searching...' : 'No resources found. Type at least 2 characters.'}
              onSearchChange={setResourceSearch}
            />
            {errors.resource && (
              <p className="text-sm text-destructive">{errors.resource}</p>
            )}
            {/* Existing Allocations Display */}
            {isLoadingAllocations && (
              <p className="text-sm text-muted-foreground">Loading allocations...</p>
            )}
            {!isLoadingAllocations && existingAllocations.length > 0 && (
              <div className="space-y-1">
                {existingAllocations.map((allocation, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
                    <Info className="h-4 w-4 flex-shrink-0" />
                    <span>
                      Allocated to "{allocation.projectName}" with {allocation.allocationPct}% allocation
                    </span>
                  </div>
                ))}
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
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
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Resource'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
