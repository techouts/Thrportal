import { atom } from 'jotai'
import type { Employee, LeaveRequest, Attendance } from '@/types'

// Simple atoms without dependencies
export const employeesAtom = atom<Employee[]>([])
export const selectedEmployeeAtom = atom<Employee | null>(null)
export const employeesLoadingAtom = atom(false)
export const employeesErrorAtom = atom<string | null>(null)

export const leaveRequestsAtom = atom<LeaveRequest[]>([])
export const leaveRequestsLoadingAtom = atom(false)
export const leaveRequestsErrorAtom = atom<string | null>(null)

export const attendanceRecordsAtom = atom<Attendance[]>([])
export const attendanceLoadingAtom = atom(false)
export const attendanceErrorAtom = atom<string | null>(null)

export const employeeFiltersAtom = atom({
  department: 'all',
  status: 'all',
  search: '',
})

// Derived atom
export const filteredEmployeesAtom = atom((get) => {
  const employees = get(employeesAtom)
  const filters = get(employeeFiltersAtom)
  
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
})