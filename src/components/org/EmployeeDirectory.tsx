import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, MapPin, Building, Users, RotateCcw, UserPlus } from 'lucide-react';
import Fuse from 'fuse.js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { mockEmployees, mockSearchFilters } from '@/mocks/orgData';
import type { EmployeeCard } from '@/types/org';
import { useAuth } from '@/auth/AuthContext';
import { InviteEmployeeModal } from '@/components/employees/InviteEmployeeModal';

const INVITE_ROLES = new Set(['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER']);

interface EmployeeDirectoryProps {
  className?: string;
}

export function EmployeeDirectory({ className }: EmployeeDirectoryProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canInvite = !!user && INVITE_ROLES.has(user.role);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManager, setSelectedManager] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const pageSize = 24;

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => new Fuse(mockEmployees, {
    keys: ['display_name', 'title', 'department_name', 'city', 'country', 'manager.name'],
    threshold: 0.4,
    includeScore: true
  }), []);

  // Debounced search effect
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedManager, selectedDepartment, selectedCity, selectedCountry]);

  // Filter and search employees
  const filteredEmployees = useMemo(() => {
    let results = mockEmployees;

    // Apply filters first
    if (selectedManager !== 'all') {
      results = results.filter(emp => emp.manager?.id === selectedManager);
    }
    if (selectedDepartment !== 'all') {
      results = results.filter(emp => emp.department_name === selectedDepartment);
    }
    if (selectedCity !== 'all') {
      results = results.filter(emp => emp.city === selectedCity);
    }
    if (selectedCountry !== 'all') {
      results = results.filter(emp => emp.country === selectedCountry);
    }

    // Apply search if query exists
    if (searchQuery.trim()) {
      const fuseResults = fuse.search(searchQuery);
      const searchIds = new Set(fuseResults.map(result => result.item.id));
      results = results.filter(emp => searchIds.has(emp.id));
    }

    return results;
  }, [searchQuery, selectedManager, selectedDepartment, selectedCity, selectedCountry, fuse]);

  // Pagination
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(startIndex, startIndex + pageSize);
  }, [filteredEmployees, currentPage]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedManager('all');
    setSelectedDepartment('all');
    setSelectedCity('all');
    setSelectedCountry('all');
    setCurrentPage(1);
  };

  const handleViewProfile = (employeeId: string) => {
    navigate(`/Me/Profile/${employeeId}`);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return <EmployeeDirectorySkeleton />;
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Employee Directory</h1>
          {canInvite && (
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Employee
            </Button>
          )}
        </div>
        <InviteEmployeeModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
        
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={selectedManager} onValueChange={setSelectedManager}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Managers</SelectItem>
                {mockSearchFilters.managers.map(manager => (
                  <SelectItem key={manager.id} value={manager.id}>{manager.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {mockSearchFilters.departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {mockSearchFilters.cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {mockSearchFilters.countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {filteredEmployees.length} employees found
          </p>
          <div className="flex gap-1">
            <Toggle
              pressed={viewMode === 'grid'}
              onPressedChange={() => setViewMode('grid')}
              size="sm"
            >
              <Grid className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={viewMode === 'list'}
              onPressedChange={() => setViewMode('list')}
              size="sm"
            >
              <List className="h-4 w-4" />
            </Toggle>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No employees found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button variant="outline" onClick={handleReset}>
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "space-y-2"
          }>
            {paginatedEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                viewMode={viewMode}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 2 + i;
                    }
                    if (currentPage > totalPages - 3) {
                      pageNum = totalPages - 4 + i;
                    }
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface EmployeeCardProps {
  employee: EmployeeCard;
  viewMode: 'grid' | 'list';
  onViewProfile: (id: string) => void;
}

function EmployeeCard({ employee, viewMode, onViewProfile }: EmployeeCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (viewMode === 'list') {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={employee.avatar_url} />
              <AvatarFallback>{getInitials(employee.display_name)}</AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-medium">{employee.display_name}</h3>
              <p className="text-sm text-muted-foreground">{employee.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary">{employee.department_name}</Badge>
            
            {(employee.city || employee.country) && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                {[employee.city, employee.country].filter(Boolean).join(', ')}
              </div>
            )}

            {employee.manager && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-3 w-3 mr-1" />
                {employee.manager.name}
              </div>
            )}

            <Button size="sm" onClick={() => onViewProfile(employee.id)}>
              View Profile
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="text-center space-y-3">
        <Avatar className="h-16 w-16 mx-auto">
          <AvatarImage src={employee.avatar_url} />
          <AvatarFallback>{getInitials(employee.display_name)}</AvatarFallback>
        </Avatar>
        
        <div>
          <h3 className="font-medium text-sm">{employee.display_name}</h3>
          <p className="text-xs text-muted-foreground">{employee.title}</p>
        </div>

        <div className="space-y-2">
          <Badge variant="secondary" className="text-xs">{employee.department_name}</Badge>
          
          {(employee.city || employee.country) && (
            <div className="flex items-center justify-center text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              {[employee.city, employee.country].filter(Boolean).join(', ')}
            </div>
          )}

          {employee.manager && (
            <div className="flex items-center justify-center text-xs text-muted-foreground">
              <Users className="h-3 w-3 mr-1" />
              {employee.manager.name}
            </div>
          )}
        </div>

        <Button size="sm" className="w-full" onClick={() => onViewProfile(employee.id)}>
          View Profile
        </Button>
      </div>
    </Card>
  );
}

function EmployeeDirectorySkeleton() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <Skeleton className="h-10 flex-1" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="text-center space-y-3">
              <Skeleton className="h-16 w-16 rounded-full mx-auto" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 mx-auto" />
                <Skeleton className="h-3 w-32 mx-auto" />
              </div>
              <Skeleton className="h-6 w-20 mx-auto" />
              <Skeleton className="h-8 w-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}