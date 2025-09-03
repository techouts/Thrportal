import { useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { 
  employeesAtom, 
  employeesLoadingAtom, 
  employeesErrorAtom,
  filteredEmployeesAtom,
  employeeFiltersAtom,
  selectedEmployeeAtom
} from '@/atoms/employeeAtoms'
import { EmployeeService, mockEmployees } from '@/services/employeeService'
import { Employee } from '@/types'
import { toast } from 'sonner'

export const useEmployees = () => {
  const [employees, setEmployees] = useAtom(employeesAtom)
  const [loading, setLoading] = useAtom(employeesLoadingAtom)
  const [error, setError] = useAtom(employeesErrorAtom)
  const [filteredEmployees] = useAtom(filteredEmployeesAtom)
  const [filters, setFilters] = useAtom(employeeFiltersAtom)
  const [selectedEmployee, setSelectedEmployee] = useAtom(selectedEmployeeAtom)

  // Load employees
  const loadEmployees = useCallback(async (params?: {
    page?: number
    limit?: number
    department?: string
    status?: string
    search?: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      // For now, use mock data. Replace with actual API call when backend is ready
      // const response = await EmployeeService.getEmployees(params)
      // setEmployees(response.data)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setEmployees(mockEmployees)
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load employees'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [setEmployees, setLoading, setError])

  // Get employee by ID
  const getEmployee = useCallback(async (id: string): Promise<Employee | null> => {
    try {
      setLoading(true)
      setError(null)
      
      // For now, use mock data. Replace with actual API call when backend is ready
      // const response = await EmployeeService.getEmployeeById(id)
      // return response.data
      
      const employee = mockEmployees.find(emp => emp.id === id)
      setSelectedEmployee(employee || null)
      return employee || null
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load employee'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setSelectedEmployee])

  // Create employee
  const createEmployee = useCallback(async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true)
      setError(null)
      
      // For now, simulate creation. Replace with actual API call when backend is ready
      // const response = await EmployeeService.createEmployee(employeeData)
      // const newEmployee = response.data
      
      const newEmployee: Employee = {
        ...employeeData,
        id: Date.now().toString(),
      }
      
      setEmployees(prev => [...prev, newEmployee])
      
      toast.success('Employee created successfully')
      
      return newEmployee
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create employee'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [setEmployees, setLoading, setError])

  // Update employee
  const updateEmployee = useCallback(async (id: string, updates: Partial<Employee>) => {
    try {
      setLoading(true)
      setError(null)
      
      // For now, simulate update. Replace with actual API call when backend is ready
      // const response = await EmployeeService.updateEmployee(id, updates)
      // const updatedEmployee = response.data
      
      setEmployees(prev => prev.map(emp => 
        emp.id === id ? { ...emp, ...updates } : emp
      ))
      
      toast.success('Employee updated successfully')
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update employee'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [setEmployees, setLoading, setError])

  // Delete employee
  const deleteEmployee = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // For now, simulate deletion. Replace with actual API call when backend is ready
      // await EmployeeService.deleteEmployee(id)
      
      setEmployees(prev => prev.filter(emp => emp.id !== id))
      
      toast.success('Employee deleted successfully')
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete employee'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [setEmployees, setLoading, setError])

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [setFilters])

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      department: 'all',
      status: 'all',
      search: '',
    })
  }, [setFilters])

  // Load employees on mount
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
      getEmployee,
      createEmployee,
      updateEmployee,
      deleteEmployee,
      updateFilters,
      clearFilters,
      setSelectedEmployee,
    }
  }
}