import { ExpenseClaim, ExpenseLine, Receipt, PolicyCategory, PolicyLimits, ApprovalRule, ValidationError, CardTransaction, ImportMapping, AuditLog, ExpenseDashboardMetrics, TeamExpenseMetrics } from '@/types/expenses'

// Mock data for development
const mockCategories: PolicyCategory[] = [
  { id: 'cat-travel', name: 'Travel', glCode: 'GL001', isActive: true, alcoholAllowed: false, billableDefault: true, receiptThreshold: 200, perDayLimit: 5000, deadlineDays: 30 },
  { id: 'cat-meals', name: 'Meals', glCode: 'GL002', isActive: true, alcoholAllowed: false, billableDefault: false, receiptThreshold: 200, perDayLimit: 1500, deadlineDays: 30 },
  { id: 'cat-hotel', name: 'Hotel', glCode: 'GL003', isActive: true, alcoholAllowed: false, billableDefault: true, receiptThreshold: 200, perNightLimit: 8000, deadlineDays: 30 },
  { id: 'cat-ride', name: 'Ride-hailing', glCode: 'GL004', isActive: true, alcoholAllowed: false, billableDefault: true, receiptThreshold: 200, deadlineDays: 30 },
  { id: 'cat-office', name: 'Office Supplies', glCode: 'GL005', isActive: true, alcoholAllowed: false, billableDefault: false, receiptThreshold: 200, deadlineDays: 30 },
  { id: 'cat-communication', name: 'Communication', glCode: 'GL006', isActive: true, alcoholAllowed: false, billableDefault: false, receiptThreshold: 200, deadlineDays: 30 },
  { id: 'cat-training', name: 'Training', glCode: 'GL007', isActive: true, alcoholAllowed: false, billableDefault: false, receiptThreshold: 200, deadlineDays: 30 },
  { id: 'cat-perdiem', name: 'Per-diem', glCode: 'GL008', isActive: true, alcoholAllowed: false, billableDefault: false, receiptThreshold: 0, deadlineDays: 30 },
  { id: 'cat-mileage', name: 'Mileage', glCode: 'GL009', isActive: true, alcoholAllowed: false, billableDefault: true, receiptThreshold: 0, deadlineDays: 30 }
]

const mockExpenseClaims: ExpenseClaim[] = [
  {
    id: 'claim-001',
    employeeId: 'emp-001',
    employeeName: 'John Doe',
    status: 'SUBMITTED',
    totalInINR: 15750,
    currencyBreakdown: { 'INR': 15750 },
    hasExceptions: false,
    createdAt: '2024-01-15T10:00:00Z',
    submittedAt: '2024-01-15T14:30:00Z',
    lines: []
  },
  {
    id: 'claim-002',
    employeeId: 'emp-001',
    employeeName: 'John Doe',
    status: 'APPROVED',
    totalInINR: 8520,
    currencyBreakdown: { 'INR': 8520 },
    hasExceptions: false,
    createdAt: '2024-01-10T09:00:00Z',
    submittedAt: '2024-01-10T11:00:00Z',
    approvedAt: '2024-01-11T15:30:00Z',
    lines: []
  },
  {
    id: 'claim-003',
    employeeId: 'emp-002',
    employeeName: 'Jane Smith',
    status: 'RETURNED',
    totalInINR: 25680,
    currencyBreakdown: { 'INR': 25680 },
    hasExceptions: true,
    createdAt: '2024-01-12T08:00:00Z',
    submittedAt: '2024-01-12T16:00:00Z',
    approverComments: 'Missing receipts for hotel expenses. Please attach valid invoices.',
    lines: []
  }
]

class ExpensesService {
  // Employee endpoints
  async getEmployeeClaims(employeeId: string): Promise<ExpenseClaim[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockExpenseClaims.filter(claim => claim.employeeId === employeeId))
      }, 500)
    })
  }

  async getEmployeeDashboard(employeeId: string): Promise<ExpenseDashboardMetrics> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalSpend: 50270,
          pendingAmount: 15750,
          approvedAmount: 25520,
          rejectedAmount: 9000,
          spendByCategory: {
            'Travel': 25000,
            'Meals': 8750,
            'Hotel': 12500,
            'Ride-hailing': 4020
          },
          reimbursableVsCorp: {
            reimbursable: 42270,
            corporate: 8000
          },
          averageApprovalTime: 1.5,
          exceptionsCount: 2
        })
      }, 500)
    })
  }

  async createExpenseClaim(data: Partial<ExpenseClaim>): Promise<ExpenseClaim> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newClaim: ExpenseClaim = {
          id: `claim-${Date.now()}`,
          employeeId: data.employeeId || 'emp-001',
          status: 'DRAFT',
          totalInINR: 0,
          currencyBreakdown: {},
          hasExceptions: false,
          createdAt: new Date().toISOString(),
          lines: [],
          ...data
        }
        resolve(newClaim)
      }, 300)
    })
  }

  async updateExpenseClaim(id: string, data: Partial<ExpenseClaim>): Promise<ExpenseClaim> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const claim = mockExpenseClaims.find(c => c.id === id)
        if (claim) {
          Object.assign(claim, data)
          resolve(claim)
        }
      }, 300)
    })
  }

  async submitExpenseClaim(id: string): Promise<{ success: boolean; errors?: ValidationError[] }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock validation
        resolve({ success: true })
      }, 800)
    })
  }

  async addExpenseLine(claimId: string, line: Partial<ExpenseLine>): Promise<ExpenseLine> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newLine: ExpenseLine = {
          id: `line-${Date.now()}`,
          claimId,
          categoryId: line.categoryId || 'cat-travel',
          date: line.date || new Date().toISOString().split('T')[0],
          vendorName: line.vendorName || '',
          description: line.description || '',
          city: line.city || '',
          country: line.country || 'India',
          amount: line.amount || 0,
          currency: line.currency || 'INR',
          amountInINR: line.amount || 0,
          paymentMode: line.paymentMode || 'CASH',
          corpCard: line.corpCard || false,
          perDiem: line.perDiem || false,
          receiptIds: line.receiptIds || [],
          ...line
        }
        resolve(newLine)
      }, 300)
    })
  }

  async uploadReceipt(file: File): Promise<Receipt> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const receipt: Receipt = {
          id: `receipt-${Date.now()}`,
          fileUri: URL.createObjectURL(file),
          fileName: file.name,
          fileHash: `hash-${Date.now()}`,
          uploadedBy: 'current-user',
          createdAt: new Date().toISOString(),
          extractedText: 'Sample extracted text from OCR...',
          parsedFields: {
            vendor: 'Sample Vendor',
            amount: '250.00',
            date: new Date().toISOString().split('T')[0],
            gstNo: 'GST123456789'
          },
          ocrConfidence: 0.85
        }
        resolve(receipt)
      }, 1000)
    })
  }

  // Manager endpoints
  async getTeamExpenses(managerId: string): Promise<ExpenseClaim[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockExpenseClaims.filter(claim => claim.status === 'SUBMITTED' || claim.status === 'RETURNED'))
      }, 500)
    })
  }

  async getTeamDashboard(managerId: string): Promise<TeamExpenseMetrics> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalSpend: 125680,
          pendingAmount: 41430,
          approvedAmount: 67250,
          rejectedAmount: 17000,
          spendByCategory: {
            'Travel': 62500,
            'Meals': 21875,
            'Hotel': 31250,
            'Ride-hailing': 10055
          },
          reimbursableVsCorp: {
            reimbursable: 105680,
            corporate: 20000
          },
          averageApprovalTime: 2.1,
          exceptionsCount: 5,
          teamMemberCount: 8,
          unsubmittedItems: 12,
          agingBuckets: {
            '0-2 days': 15,
            '3-7 days': 8,
            '8-15 days': 3,
            '15+ days': 1
          }
        })
      }, 500)
    })
  }

  async approveExpense(claimId: string, comment?: string): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 500)
    })
  }

  async returnExpense(claimId: string, comment: string): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 500)
    })
  }

  async rejectExpense(claimId: string, comment: string): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 500)
    })
  }

  // HR/Finance endpoints
  async getPolicyCategories(): Promise<PolicyCategory[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockCategories)
      }, 300)
    })
  }

  async updatePolicyCategory(id: string, data: Partial<PolicyCategory>): Promise<PolicyCategory> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const category = mockCategories.find(c => c.id === id)
        if (category) {
          Object.assign(category, data)
          resolve(category)
        }
      }, 300)
    })
  }

  async getPolicyLimits(): Promise<PolicyLimits[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'limits-001',
            categoryId: 'cat-travel',
            receiptThreshold: 200,
            perDayLimit: 5000,
            deadlineDays: 30,
            mileageRate: 12,
            perDiemTables: {
              'A1': { tier: 'A1', weekdayRate: 1200, weekendRate: 1500, currency: 'INR' },
              'A': { tier: 'A', weekdayRate: 1000, weekendRate: 1200, currency: 'INR' },
              'B': { tier: 'B', weekdayRate: 800, weekendRate: 1000, currency: 'INR' },
              'C': { tier: 'C', weekdayRate: 600, weekendRate: 800, currency: 'INR' }
            },
            gstItcRules: {
              'meals': false,
              'hotel': false,
              'travel': true,
              'office': true
            }
          }
        ])
      }, 300)
    })
  }

  async getApprovalMatrix(): Promise<ApprovalRule[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'rule-001',
            l1Role: 'manager',
            l2Role: 'finance',
            amountThreshold: 25000,
            flagConditions: ['alcohol', 'international_travel'],
            escalationHours: 168 // 7 days
          }
        ])
      }, 300)
    })
  }

  // Import functions
  async importCreditCardStatement(file: File, mapping: ImportMapping): Promise<CardTransaction[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'txn-001',
            statementId: 'stmt-001',
            txnDate: '2024-01-15',
            amount: 250,
            currency: 'INR',
            merchant: 'UBER EATS',
            rawDesc: 'UBER EATS BANGALORE'
          },
          {
            id: 'txn-002',
            statementId: 'stmt-001',
            txnDate: '2024-01-16',
            amount: 180,
            currency: 'INR',
            merchant: 'SWIGGY',
            rawDesc: 'SWIGGY DELHI'
          }
        ])
      }, 1000)
    })
  }

  async parseOCR(file: File): Promise<{ extractedText: string; parsedFields: Record<string, any>; confidence: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          extractedText: 'INVOICE\nVendor: Sample Restaurant\nDate: 2024-01-15\nAmount: ₹250.00\nGSTIN: 29ABCDE1234F1Z5',
          parsedFields: {
            vendor: 'Sample Restaurant',
            amount: '250.00',
            date: '2024-01-15',
            gstNo: '29ABCDE1234F1Z5',
            invoiceNo: 'INV-001'
          },
          confidence: 0.87
        })
      }, 2000)
    })
  }

  // Export functions
  async exportToZoho(filters: any): Promise<Blob> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const csvContent = 'GLCode,CostCenter,Vendor,InvoiceNo,InvoiceDate,Taxable,CGST,SGST,IGST,Total,Currency,FXRate,Project,EmployeeId\nGL001,CC001,Sample Vendor,INV-001,2024-01-15,212.50,22.50,22.50,0,250.00,INR,1.0,PRJ-001,EMP-001'
        const blob = new Blob([csvContent], { type: 'text/csv' })
        resolve(blob)
      }, 1000)
    })
  }

  async exportGSTReport(filters: any): Promise<Blob> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const csvContent = 'GSTIN,InvoiceNo,InvoiceDate,TaxableValue,CGST,SGST,IGST,PlaceOfSupply,ITCEligible\n29ABCDE1234F1Z5,INV-001,2024-01-15,212.50,22.50,22.50,0,Karnataka,No'
        const blob = new Blob([csvContent], { type: 'text/csv' })
        resolve(blob)
      }, 1000)
    })
  }

  async exportReimbursements(filters: any): Promise<Blob> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const csvContent = 'EmployeeId,EmployeeName,ClaimId,Amount,Currency,PaymentMode,BankAccount\nEMP-001,John Doe,CLM-001,15750,INR,NEFT,1234567890'
        const blob = new Blob([csvContent], { type: 'text/csv' })
        resolve(blob)
      }, 1000)
    })
  }
}

export const expensesService = new ExpensesService()