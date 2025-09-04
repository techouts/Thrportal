import { faker } from '@faker-js/faker'

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || true

// Mock data generators
export const mockEmployee = () => ({
  id: faker.string.uuid(),
  employeeId: faker.string.alphanumeric(6).toUpperCase(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  avatar: faker.image.avatar(),
  department: faker.helpers.arrayElement(['Engineering', 'HR', 'Sales', 'Marketing', 'Finance']),
  position: faker.person.jobTitle(),
  manager: faker.person.fullName(),
  location: faker.location.city(),
  startDate: faker.date.past({ years: 5 }).toISOString(),
  status: faker.helpers.arrayElement(['active', 'inactive', 'pending']) as 'active' | 'inactive' | 'pending',
  salary: faker.number.int({ min: 50000, max: 150000 })
})

export const mockLeaveRequest = (employeeId?: string) => ({
  id: faker.string.uuid(),
  employeeId: employeeId || faker.string.uuid(),
  type: faker.helpers.arrayElement(['vacation', 'sick', 'personal', 'maternity', 'paternity']) as any,
  startDate: faker.date.future().toISOString(),
  endDate: faker.date.future().toISOString(),
  days: faker.number.int({ min: 1, max: 14 }),
  reason: faker.lorem.sentence(),
  status: faker.helpers.arrayElement(['pending', 'approved', 'rejected']) as any,
  approvedBy: faker.person.fullName(),
  createdAt: faker.date.recent().toISOString()
})

export const mockAttendance = (employeeId?: string) => ({
  id: faker.string.uuid(),
  employeeId: employeeId || faker.string.uuid(),
  date: faker.date.recent().toISOString().split('T')[0],
  checkIn: faker.date.recent().toISOString(),
  checkOut: faker.date.recent().toISOString(),
  breakTime: faker.number.int({ min: 30, max: 90 }),
  totalHours: faker.number.float({ min: 6, max: 10, fractionDigits: 1 }),
  status: faker.helpers.arrayElement(['present', 'absent', 'half-day', 'late']) as any,
  location: faker.helpers.arrayElement(['Office', 'Remote', 'Client Site'])
})

export const mockProject = () => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  description: faker.lorem.paragraph(),
  client: faker.company.name(),
  status: faker.helpers.arrayElement(['active', 'on-hold', 'completed']) as any,
  startDate: faker.date.past().toISOString(),
  endDate: faker.date.future().toISOString(),
  budget: faker.number.int({ min: 10000, max: 500000 }),
  teamSize: faker.number.int({ min: 2, max: 15 })
})

export const mockTask = (projectId?: string) => ({
  id: faker.string.uuid(),
  projectId: projectId || faker.string.uuid(),
  title: faker.lorem.words(3),
  description: faker.lorem.paragraph(),
  assigneeId: faker.string.uuid(),
  status: faker.helpers.arrayElement(['todo', 'in-progress', 'review', 'done']) as any,
  priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']) as any,
  dueDate: faker.date.future().toISOString(),
  estimatedHours: faker.number.int({ min: 1, max: 40 }),
  actualHours: faker.number.int({ min: 0, max: 45 })
})

export const mockJobRequisition = () => ({
  id: faker.string.uuid(),
  title: faker.person.jobTitle(),
  department: faker.helpers.arrayElement(['Engineering', 'HR', 'Sales', 'Marketing', 'Finance']),
  location: faker.location.city(),
  type: faker.helpers.arrayElement(['full-time', 'part-time', 'contract']) as any,
  experience: faker.helpers.arrayElement(['entry', 'mid', 'senior', 'lead']) as any,
  description: faker.lorem.paragraphs(3),
  requirements: Array.from({ length: 5 }, () => faker.lorem.sentence()),
  salary: {
    min: faker.number.int({ min: 40000, max: 80000 }),
    max: faker.number.int({ min: 80000, max: 150000 })
  },
  status: faker.helpers.arrayElement(['draft', 'open', 'on-hold', 'filled', 'cancelled']) as any,
  createdAt: faker.date.recent().toISOString(),
  closingDate: faker.date.future().toISOString()
})

export const mockApplication = (requisitionId?: string) => ({
  id: faker.string.uuid(),
  requisitionId: requisitionId || faker.string.uuid(),
  candidateName: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  experience: faker.number.int({ min: 0, max: 15 }),
  currentCompany: faker.company.name(),
  currentSalary: faker.number.int({ min: 30000, max: 120000 }),
  expectedSalary: faker.number.int({ min: 40000, max: 150000 }),
  noticePeriod: faker.number.int({ min: 0, max: 90 }),
  status: faker.helpers.arrayElement(['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']) as any,
  appliedAt: faker.date.recent().toISOString(),
  resumeUrl: faker.internet.url()
})

// Mock API functions
export const mockApiCall = <T>(data: T, delay = 500): Promise<{ data: T; success: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data, success: true })
    }, delay)
  })
}

export const mockPaginatedApiCall = <T>(
  data: T[],
  page = 1,
  limit = 10,
  delay = 500
): Promise<{
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  success: boolean
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = (page - 1) * limit
      const end = start + limit
      const paginatedData = data.slice(start, end)
      
      resolve({
        data: paginatedData,
        pagination: {
          page,
          limit,
          total: data.length,
          totalPages: Math.ceil(data.length / limit)
        },
        success: true
      })
    }, delay)
  })
}

// Generate mock datasets
export const generateMockEmployees = (count = 50) => 
  Array.from({ length: count }, mockEmployee)

export const generateMockLeaveRequests = (count = 100) =>
  Array.from({ length: count }, () => mockLeaveRequest())

export const generateMockAttendance = (count = 200) =>
  Array.from({ length: count }, () => mockAttendance())

export const generateMockProjects = (count = 20) =>
  Array.from({ length: count }, mockProject)

export const generateMockJobRequisitions = (count = 15) =>
  Array.from({ length: count }, mockJobRequisition)

export const generateMockApplications = (count = 80) =>
  Array.from({ length: count }, () => mockApplication())