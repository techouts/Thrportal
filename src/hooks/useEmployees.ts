import { useState, useCallback, useEffect, useMemo } from 'react'
import { JsonApiService } from '@/services/jsonApiService'
import type { Employee } from '@/types'
import { toast } from 'sonner'

// Simple hook without Jotai for testing
export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [filters, setFilters] = useState({
    department: 'all',
    status: 'all',
    search: '',
  })

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesDepartment = filters.department === 'all' || employee.department === filters.department
      const matchesStatus = filters.status === 'all' || employee.status === filters.status
      const matchesSearch = !filters.search || 
        employee.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
        employee.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(filters.search.toLowerCase())
      
      return matchesDepartment && matchesStatus && matchesSearch
    })
  }, [employees, filters])

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
  }, [])

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({ department: 'all', status: 'all', search: '' })
  }, [])

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