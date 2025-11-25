import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/auth/AuthContext';

export interface FilterState {
  [key: string]: any;
}

export interface UseAdvancedFilterOptions {
  defaultFilters?: FilterState;
  storageKey?: string;
  debounceMs?: number;
}

export function useAdvancedFilter<T>(
  data: T[],
  filterFunction: (item: T, filters: FilterState) => boolean,
  options: UseAdvancedFilterOptions = {}
) {
  const { can } = useAuth();
  const { defaultFilters = {}, storageKey, debounceMs = 300 } = options;

  const [filters, setFilters] = useState<FilterState>(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(`filter_${storageKey}`);
        return saved ? JSON.parse(saved) : defaultFilters;
      } catch {
        return defaultFilters;
      }
    }
    return defaultFilters;
  });

  const [savedFilters, setSavedFilters] = useState<{ name: string; filters: FilterState }[]>(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(`saved_filters_${storageKey}`);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Debounced filters for performance
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [filters, debounceMs]);

  // Save filters to localStorage
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(`filter_${storageKey}`, JSON.stringify(filters));
    }
  }, [filters, storageKey]);

  // Save saved filters to localStorage
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(`saved_filters_${storageKey}`, JSON.stringify(savedFilters));
    }
  }, [savedFilters, storageKey]);

  // Filter the data based on current filters and permissions
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Apply user-defined filter function
      if (!filterFunction(item, debouncedFilters)) {
        return false;
      }

      // Apply role-based filtering if needed
      // This can be extended based on specific requirements
      return true;
    });
  }, [data, debouncedFilters, filterFunction]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  const handleSave = (name: string, filterState: FilterState) => {
    const newSavedFilter = { name, filters: filterState };
    setSavedFilters(prev => {
      const existing = prev.findIndex(f => f.name === name);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newSavedFilter;
        return updated;
      }
      return [...prev, newSavedFilter];
    });
  };

  const handleDeleteSaved = (name: string) => {
    setSavedFilters(prev => prev.filter(f => f.name !== name));
  };

  // Get filter statistics
  const getFilterStats = () => {
    const totalItems = data.length;
    const filteredItems = filteredData.length;
    const activeFilters = Object.values(filters).filter(val => {
      if (typeof val === 'boolean') return val;
      if (Array.isArray(val)) return val.length > 0;
      return val !== '' && val !== null && val !== undefined;
    }).length;

    return {
      totalItems,
      filteredItems,
      hiddenItems: totalItems - filteredItems,
      activeFilters,
      filteringActive: activeFilters > 0
    };
  };

  return {
    filters,
    filteredData,
    savedFilters,
    handleFilterChange,
    handleReset,
    handleSave,
    handleDeleteSaved,
    getFilterStats,
    // Utility functions for role-based filtering
    canFilter: (permission: string) => can(permission),
    hasAnyPermission: (permissions: string[]) => permissions.some(p => can(p))
  };
}