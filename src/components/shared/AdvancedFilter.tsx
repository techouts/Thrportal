import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Filter, ChevronDown, X, Search, Save, RotateCcw } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { useVisible } from '@/hooks/useVisible';

export interface FilterConfig {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'checkbox' | 'date' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
  requiresPermission?: string[];
}

export interface FilterState {
  [key: string]: any;
}

interface AdvancedFilterProps {
  title?: string;
  filters: FilterConfig[];
  value: FilterState;
  onChange: (filters: FilterState) => void;
  onReset?: () => void;
  onSave?: (name: string, filters: FilterState) => void;
  savedFilters?: { name: string; filters: FilterState }[];
  className?: string;
  collapsible?: boolean;
  showSaveLoad?: boolean;
}

export function AdvancedFilter({
  title = "Advanced Filters",
  filters,
  value,
  onChange,
  onReset,
  onSave,
  savedFilters = [],
  className = "",
  collapsible = true,
  showSaveLoad = true
}: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { can } = useAuth();

  // Filter out filters based on permissions
  const visibleFilters = filters.filter(filter => {
    if (!filter.requiresPermission) return true;
    return filter.requiresPermission.some(permission => can(permission));
  });

  const handleFilterChange = (filterId: string, newValue: any) => {
    onChange({ ...value, [filterId]: newValue });
  };

  const handleReset = () => {
    const resetState: FilterState = {};
    visibleFilters.forEach(filter => {
      resetState[filter.id] = filter.type === 'checkbox' ? false : '';
    });
    onChange(resetState);
    onReset?.();
  };

  const handleSave = () => {
    if (saveFilterName.trim() && onSave) {
      onSave(saveFilterName.trim(), value);
      setSaveFilterName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoadSaved = (savedFilter: { name: string; filters: FilterState }) => {
    onChange(savedFilter.filters);
  };

  const getActiveFilterCount = () => {
    return Object.values(value).filter(val => {
      if (typeof val === 'boolean') return val;
      if (Array.isArray(val)) return val.length > 0;
      return val !== '' && val !== null && val !== undefined;
    }).length;
  };

  const renderFilterInput = (filter: FilterConfig) => {
    const currentValue = value[filter.id];

    switch (filter.type) {
      case 'text':
        return (
          <Input
            placeholder={filter.placeholder}
            value={currentValue || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={filter.placeholder}
            value={currentValue || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
          />
        );

      case 'select':
        return (
          <Select value={currentValue || ''} onValueChange={(val) => handleFilterChange(filter.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {filter.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const selectedValues = currentValue || [];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {selectedValues.map((val: string) => {
                const option = filter.options?.find(opt => opt.value === val);
                return (
                  <Badge key={val} variant="secondary" className="text-xs">
                    {option?.label || val}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => {
                        const newValues = selectedValues.filter((v: string) => v !== val);
                        handleFilterChange(filter.id, newValues);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
            <Select
              value=""
              onValueChange={(val) => {
                if (val && !selectedValues.includes(val)) {
                  handleFilterChange(filter.id, [...selectedValues, val]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={filter.placeholder || 'Select options...'} />
              </SelectTrigger>
              <SelectContent>
                {filter.options?.filter(opt => !selectedValues.includes(opt.value)).map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={currentValue || false}
              onCheckedChange={(checked) => handleFilterChange(filter.id, checked)}
            />
            <Label className="text-sm">{filter.label}</Label>
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={currentValue || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
          />
        );

      default:
        return null;
    }
  };

  const FilterContent = () => (
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleFilters.map(filter => (
          <div key={filter.id} className="space-y-2">
            {filter.type !== 'checkbox' && (
              <Label htmlFor={filter.id} className="text-sm font-medium">
                {filter.label}
              </Label>
            )}
            {renderFilterInput(filter)}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>

        {showSaveLoad && (
          <>
            <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
              <Save className="h-4 w-4 mr-1" />
              Save Filter
            </Button>

            {savedFilters.length > 0 && (
              <Select value="" onValueChange={(val) => {
                const saved = savedFilters.find(f => f.name === val);
                if (saved) handleLoadSaved(saved);
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Load saved..." />
                </SelectTrigger>
                <SelectContent>
                  {savedFilters.map(saved => (
                    <SelectItem key={saved.name} value={saved.name}>
                      {saved.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </>
        )}

        {showSaveDialog && (
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Filter name..."
              value={saveFilterName}
              onChange={(e) => setSaveFilterName(e.target.value)}
              className="w-32"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <Button size="sm" onClick={handleSave}>Save</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSaveDialog(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  );

  if (collapsible) {
    return (
      <Card className={className}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="hover:bg-muted/50 cursor-pointer">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>{title}</span>
                  {getActiveFilterCount() > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {getActiveFilterCount()} active
                    </Badge>
                  )}
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <FilterContent />
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span>{title}</span>
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="text-xs">
              {getActiveFilterCount()} active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <FilterContent />
    </Card>
  );
}