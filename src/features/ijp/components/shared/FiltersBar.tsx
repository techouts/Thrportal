import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Search, Filter } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import type { PostingFilters } from '../../types';
import { useState, useEffect } from 'react';

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface FiltersBarProps {
  filters: PostingFilters;
  onFiltersChange: (filters: PostingFilters) => void;
  showRecommendedToggle?: boolean;
}

const businessUnits = [
  'Technology', 'Digital', 'Analytics', 'Cloud', 'AI/ML', 'Product', 'Engineering'
];

const departments = [
  'Engineering', 'Product', 'Sales', 'Marketing', 'Operations', 'Finance', 'HR'
];

const locations = [
  'Bangalore', 'Mumbai', 'Pune', 'Hyderabad', 'Chennai', 'Delhi', 'Remote'
];

const levels = [
  'Junior', 'Mid-Level', 'Senior', 'Lead', 'Principal', 'Manager', 'Director'
];

const skills = [
  'React', 'Node.js', 'TypeScript', 'Python', 'Java', 'AWS', 'Docker', 'Kubernetes',
  'Machine Learning', 'Data Science', 'Product Management', 'UI/UX Design'
];

const workModes = [
  'Onsite', 'Remote', 'Hybrid'
];

const postedRanges = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 3 months' },
  { value: 'all', label: 'All time' }
];

export function FiltersBar({ filters, onFiltersChange, showRecommendedToggle = false }: FiltersBarProps) {
  const [search, setSearch] = useState(filters.search || '');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch, filters, onFiltersChange]);

  const handleFilterChange = (key: keyof PostingFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleSkillToggle = (skill: string) => {
    const currentSkills = filters.skills || [];
    const updatedSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    
    handleFilterChange('skills', updatedSkills);
  };

  const clearFilter = (key: keyof PostingFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({ search: filters.search });
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    key !== 'search' && filters[key as keyof PostingFilters] !== undefined
  );

  const getActiveFiltersCount = () => {
    return Object.keys(filters).filter(key => 
      key !== 'search' && filters[key as keyof PostingFilters] !== undefined
    ).length;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search job postings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Quick Filters Row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Filter Postings</SheetTitle>
            </SheetHeader>
            
            <div className="space-y-6 mt-6">
              {/* Business Unit */}
              <div className="space-y-2">
                <Label>Business Unit</Label>
                <Select
                  value={filters.bu || ''}
                  onValueChange={(value) => handleFilterChange('bu', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Business Units</SelectItem>
                    {businessUnits.map((bu) => (
                      <SelectItem key={bu} value={bu}>{bu}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={filters.dept || ''}
                  onValueChange={(value) => handleFilterChange('dept', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Location</Label>
                <Select
                  value={filters.location || ''}
                  onValueChange={(value) => handleFilterChange('location', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level */}
              <div className="space-y-2">
                <Label>Level</Label>
                <Select
                  value={filters.level || ''}
                  onValueChange={(value) => handleFilterChange('level', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Work Mode */}
              <div className="space-y-2">
                <Label>Work Mode</Label>
                <Select
                  value={filters.workMode || ''}
                  onValueChange={(value) => handleFilterChange('workMode', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select work mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Work Modes</SelectItem>
                    {workModes.map((mode) => (
                      <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Posted Range */}
              <div className="space-y-2">
                <Label>Posted</Label>
                <Select
                  value={filters.postedRange || ''}
                  onValueChange={(value) => handleFilterChange('postedRange', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All time</SelectItem>
                    {postedRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {skills.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={skill}
                        checked={(filters.skills || []).includes(skill)}
                        onCheckedChange={() => handleSkillToggle(skill)}
                      />
                      <Label
                        htmlFor={skill}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {skill}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Only Toggle */}
              {showRecommendedToggle && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recommended-only"
                    checked={filters.recommendedOnly || false}
                    onCheckedChange={(checked) => handleFilterChange('recommendedOnly', checked)}
                  />
                  <Label htmlFor="recommended-only">Only Recommended</Label>
                </div>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Quick filter chips for mobile */}
        <div className="flex items-center gap-2 flex-wrap">
          {filters.bu && (
            <Badge variant="secondary" className="gap-1">
              BU: {filters.bu}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => clearFilter('bu')}
              />
            </Badge>
          )}
          {filters.dept && (
            <Badge variant="secondary" className="gap-1">
              Dept: {filters.dept}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => clearFilter('dept')}
              />
            </Badge>
          )}
          {filters.location && (
            <Badge variant="secondary" className="gap-1">
              Location: {filters.location}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => clearFilter('location')}
              />
            </Badge>
          )}
          {filters.skills && filters.skills.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Skills: {filters.skills.length}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => clearFilter('skills')}
              />
            </Badge>
          )}
        </div>

        {/* Recommended Only Toggle (mobile) */}
        {showRecommendedToggle && (
          <div className="flex items-center space-x-2 ml-auto">
            <Switch
              id="recommended-mobile"
              checked={filters.recommendedOnly || false}
              onCheckedChange={(checked) => handleFilterChange('recommendedOnly', checked)}
            />
            <Label htmlFor="recommended-mobile" className="text-sm">
              Recommended Only
            </Label>
          </div>
        )}
      </div>
    </div>
  );
}