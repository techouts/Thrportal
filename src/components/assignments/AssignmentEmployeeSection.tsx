import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Edit, Trash2, User, Calendar } from 'lucide-react';
import { ScorecardPanel } from '@/components/assignments/ScorecardPanel';
import { Combobox } from '@/components/ui/combobox';
import { useToast } from '@/hooks/use-toast';
import { allocationService, EmployeeDetails, EmployeeAllocation, ResourceOption } from '@/services/allocationService';

export function AssignmentEmployeeSection() {
  const { toast } = useToast();
  
  // Search state
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeOptions, setEmployeeOptions] = useState<{ value: string; label: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Selected employee state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedEmployeeLabel, setSelectedEmployeeLabel] = useState<string>('');
  
  // Fetched data state
  const [employeeDetails, setEmployeeDetails] = useState<EmployeeDetails | null>(null);
  const [employeeAllocations, setEmployeeAllocations] = useState<EmployeeAllocation[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Search employees when search term changes
  useEffect(() => {
    const searchEmployees = async () => {
      if (employeeSearch.length < 2) {
        setEmployeeOptions([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await allocationService.searchResources(employeeSearch);
        setEmployeeOptions(
          results.map((r: ResourceOption) => ({
            value: r.id,
            label: r.employeeCode 
              ? `${r.displayName} (${r.employeeCode})`
              : r.displayName
          }))
        );
      } catch (error) {
        console.error('Error searching employees:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchEmployees, 300);
    return () => clearTimeout(debounceTimer);
  }, [employeeSearch]);

  // Fetch employee details and allocations when selected
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!selectedEmployeeId) {
        setEmployeeDetails(null);
        setEmployeeAllocations([]);
        return;
      }

      setIsLoadingDetails(true);
      try {
        const [details, allocations] = await Promise.all([
          allocationService.getEmployeeById(selectedEmployeeId),
          allocationService.getEmployeeAllocations(selectedEmployeeId)
        ]);
        
        setEmployeeDetails(details);
        setEmployeeAllocations(allocations);
      } catch (error) {
        console.error('Error fetching employee data:', error);
        toast({
          title: "Error",
          description: "Failed to load employee data",
          variant: "destructive"
        });
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchEmployeeData();
  }, [selectedEmployeeId, toast]);

  // Calculate total utilization from allocations
  const totalUtilization = useMemo(() => {
    return employeeAllocations.reduce((sum, a) => sum + a.allocationPct, 0);
  }, [employeeAllocations]);

  // Scorecard data
  const scorecardData = useMemo(() => {
    if (!selectedEmployeeId || !employeeDetails) return {};
    
    const totalAllocations = employeeAllocations.length;
    const shadowAllocations = employeeAllocations.filter(a => a.type === 'SHADOW').length;
    const isDedicated = totalUtilization >= 70;
    const isOverallocated = totalUtilization > 100;
    
    return {
      totalAllocations,
      currentUtilization: totalUtilization,
      shadowAllocations,
      isDedicated,
      isOverallocated,
      benchDays: 0, // Placeholder
      monthlyCost: 0, // Placeholder
      topSkills: [] // Skipped for now
    };
  }, [selectedEmployeeId, employeeDetails, employeeAllocations, totalUtilization]);

  const handleEmployeeSelect = useCallback((value: string) => {
    setSelectedEmployeeId(value);
    const selected = employeeOptions.find(opt => opt.value === value);
    setSelectedEmployeeLabel(selected?.label || '');
  }, [employeeOptions]);

  const handleAddProject = () => {
    toast({
      title: "Add Project",
      description: "Project selection dialog would open here",
    });
  };

  const handleReleaseToBench = () => {
    toast({
      title: "Release to Bench",
      description: "Employee will be moved to bench pool",
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Ongoing';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-4 gap-6 h-full">
      {/* Main Content - 3 columns */}
      <div className="col-span-3 space-y-6">
        {/* Employee Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="max-w-md">
              <label className="text-sm font-medium mb-2 block">Search Employee</label>
              <Combobox
                options={employeeOptions}
                value={selectedEmployeeId}
                onChange={handleEmployeeSelect}
                onSearchChange={setEmployeeSearch}
                placeholder="Search by employee name or ID..."
                searchPlaceholder="Type to search..."
                emptyMessage={isSearching ? "Searching..." : "No employees found"}
              />
            </div>
          </CardContent>
        </Card>

        {isLoadingDetails && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">Loading employee data...</div>
            </CardContent>
          </Card>
        )}

        {selectedEmployeeId && employeeDetails && !isLoadingDetails && (
          <>
            {/* Employee Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-xl font-semibold">{employeeDetails.displayName}</div>
                      <div className="text-muted-foreground">
                        {employeeDetails.roleTitle || 'No Role'} • {employeeDetails.department || 'No Department'}
                      </div>
                      {employeeDetails.employeeCode && (
                        <div className="text-sm text-muted-foreground">
                          ID: {employeeDetails.employeeCode}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Button onClick={handleAddProject} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Project
                    </Button>
                    <Button variant="outline" onClick={handleReleaseToBench}>
                      Release to Bench
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="w-48">
                    <div className="text-sm font-medium mb-2">Total Utilization</div>
                    <Progress value={Math.min(totalUtilization, 100)} className="w-full" />
                    <div className="text-sm text-center mt-1">
                      {totalUtilization}%
                      {totalUtilization > 100 && (
                        <Badge variant="destructive" className="ml-2">Over-allocated</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Allocations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Project Allocations
                  <Badge variant="secondary">{employeeAllocations.length} projects</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {employeeAllocations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active allocations found for this employee.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {employeeAllocations.map((allocation) => (
                      <div key={allocation.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{allocation.projectName}</div>
                          <div className="text-sm text-muted-foreground">
                            {allocation.clientName}
                          </div>
                        </div>
                        
                        <div className="w-32">
                          <div className="text-sm font-medium mb-2">Allocation</div>
                          <Progress value={allocation.allocationPct} className="w-full" />
                          <div className="text-xs text-center mt-1">{allocation.allocationPct}%</div>
                        </div>

                        <div className="w-32">
                          <Badge variant={allocation.type === 'ACTIVE' ? 'default' : 'secondary'}>
                            {allocation.type}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDate(allocation.startDate)} - {formatDate(allocation.endDate)}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Scorecard Panel - 1 column */}
      <div className="col-span-1">
        {selectedEmployeeId && employeeDetails && (
          <ScorecardPanel
            type="employee"
            data={scorecardData}
          />
        )}
      </div>
    </div>
  );
}
