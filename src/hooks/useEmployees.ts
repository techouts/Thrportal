import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { 
  employeesAtom, 
  employeesLoadingAtom, 
  employeesErrorAtom,
  filteredEmployeesAtom,
  employeeFiltersAtom,
  selectedEmployeeAtom
} from '@/atoms/employeeAtoms'
import { JsonApiService } from '@/services'
import { Employee } from '@/types'
import { toast } from 'sonner'

export const useEmployees = () => {
  const [employees, setEmployees] = useAtom(employeesAtom)
  const [loading, setLoading] = useAtom(employeesLoadingAtom)
  const [error, setError] = useAtom(employeesErrorAtom)
  const filteredEmployees = useAtomValue(filteredEmployeesAtom)
  const [filters, setFilters] = useAtom(employeeFiltersAtom)
  const [selectedEmployee, setSelectedEmployee] = useAtom(selectedEmployeeAtom)

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await JsonApiService.getEmployees()
      setEmployees(response.data)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load employees'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [setEmployees, setLoading, setError])

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [setFilters])

  const clearFilters = useCallback(() => {
    setFilters({ department: 'all', status: 'all', search: '' })
  }, [setFilters])

  useEffect(() => {
    if (employees.length === 0) {
      loadEmployees()
    }
  }, [employees.length, loadEmployees])

  return {
    employees,
    filteredEmployees,
    selectedEmployee,
    loading,
    error,
    filters,
    actions: {
      loadEmployees,
      updateFilters,
      clearFilters,
      setSelectedEmployee,
    }
  }
}