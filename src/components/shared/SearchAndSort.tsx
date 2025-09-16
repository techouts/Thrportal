import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, SortAsc, SortDesc, X, Filter } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';

export interface SortOption {
  value: string;
  label: string;
  requiresPermission?: string[];
}

export interface QuickFilter {
  value: string;
  label: string;
  count?: number;
  requiresPermission?: string[];
}

interface SearchAndSortProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortValue?: string;
  onSortChange?: (value: string) => void;
  sortDirection?: 'asc' | 'desc';
  onSortDirectionChange?: (direction: 'asc' | 'desc') => void;
  sortOptions?: SortOption[];
  quickFilters?: QuickFilter[];
  selectedQuickFilters?: string[];
  onQuickFilterChange?: (filters: string[]) => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  resultCount?: number;
  totalCount?: number;
}

export function SearchAndSort({
  searchValue,
  onSearchChange,
  sortValue,
  onSortChange,
  sortDirection = 'asc',
  onSortDirectionChange,
  sortOptions = [],
  quickFilters = [],
  selectedQuickFilters = [],
  onQuickFilterChange,
  placeholder = "Search...",
  className = "",
  showFilters = true,
  resultCount,
  totalCount
}: SearchAndSortProps) {
  const { can } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);

  // Filter options based on permissions
  const visibleSortOptions = sortOptions.filter(option => {
    if (!option.requiresPermission) return true;
    return option.requiresPermission.some(permission => can(permission));
  });

  const visibleQuickFilters = quickFilters.filter(filter => {
    if (!filter.requiresPermission) return true;
    return filter.requiresPermission.some(permission => can(permission));
  });

  const handleQuickFilterToggle = (filterValue: string) => {
    if (!onQuickFilterChange) return;
    
    const newFilters = selectedQuickFilters.includes(filterValue)
      ? selectedQuickFilters.filter(f => f !== filterValue)
      : [...selectedQuickFilters, filterValue];
    
    onQuickFilterChange(newFilters);
  };

  const clearSearch = () => {
    onSearchChange('');
  };

  const toggleSortDirection = () => {
    if (onSortDirectionChange) {
      onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="pl-10 pr-10"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Sort Controls */}
        {visibleSortOptions.length > 0 && onSortChange && (
          <div className="flex items-center space-x-2">
            <Select value={sortValue} onValueChange={onSortChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {visibleSortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {onSortDirectionChange && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortDirection}
                className="px-3"
              >
                {sortDirection === 'asc' ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        )}

        {/* Result Count */}
        {(resultCount !== undefined || totalCount !== undefined) && (
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {resultCount !== undefined && totalCount !== undefined ? (
              searchValue || selectedQuickFilters.length > 0 ? (
                `${resultCount} of ${totalCount} results`
              ) : (
                `${totalCount} total`
              )
            ) : resultCount !== undefined ? (
              `${resultCount} results`
            ) : (
              `${totalCount} total`
            )}
          </div>
        )}
      </div>

      {/* Quick Filters */}
      {showFilters && visibleQuickFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Quick filters:</span>
          </div>
          
          {visibleQuickFilters.map(filter => {
            const isSelected = selectedQuickFilters.includes(filter.value);
            return (
              <Badge
                key={filter.value}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => handleQuickFilterToggle(filter.value)}
              >
                {filter.label}
                {filter.count !== undefined && (
                  <span className="ml-1 text-xs opacity-70">
                    ({filter.count})
                  </span>
                )}
                {isSelected && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Active Filters Summary */}
      {(searchValue || selectedQuickFilters.length > 0) && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Active filters:</span>
          {searchValue && (
            <Badge variant="secondary" className="text-xs">
              Search: "{searchValue}"
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="ml-1 h-3 w-3 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedQuickFilters.map(filterValue => {
            const filter = visibleQuickFilters.find(f => f.value === filterValue);
            return filter ? (
              <Badge key={filterValue} variant="secondary" className="text-xs">
                {filter.label}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickFilterToggle(filterValue)}
                  className="ml-1 h-3 w-3 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}