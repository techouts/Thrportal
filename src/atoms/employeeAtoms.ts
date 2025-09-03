import { atom } from 'jotai'
import { Employee, LeaveRequest, Attendance } from '@/types'

// Employee management state
export const employeesAtom = atom<Employee[]>([])
export const selectedEmployeeAtom = atom<Employee | null>(null)
export const employeesLoadingAtom = atom<boolean>(false)
export const employeesErrorAtom = atom<string | null>(null)

// Leave management state
export const leaveRequestsAtom = atom<LeaveRequest[]>([])
export const pendingLeaveRequestsAtom = atom<LeaveRequest[]>([])
export const leaveLoadingAtom = atom<boolean>(false)
export const leaveErrorAtom = atom<string | null>(null)

// Attendance state
export const attendanceRecordsAtom = atom<Attendance[]>([])
export const todayAttendanceAtom = atom<Attendance | null>(null)
export const attendanceLoadingAtom = atom<boolean>(false)
export const attendanceErrorAtom = atom<string | null>(null)

// Filters and search
export const employeeFiltersAtom = atom<{
  department: string
  status: string
  search: string
}>({
  department: 'all',
  status: 'all',
  search: '',
})

// Derived atoms
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

export const activeEmployeesCountAtom = atom((get) => {
  const employees = get(employeesAtom)
  return employees.filter(emp => emp.status === 'active').length
})

export const departmentsAtom = atom((get) => {
  const employees = get(employeesAtom)
  const departments = Array.from(new Set(employees.map(emp => emp.department)))
  return departments.sort()
})

export const pendingLeaveCountAtom = atom((get) => {
  const leaveRequests = get(leaveRequestsAtom)
  return leaveRequests.filter(request => request.status === 'pending').length
})