export interface ExpenseClaim {
  id: string
  employeeId: string
  employeeName?: string
  status: 'DRAFT' | 'SUBMITTED' | 'RETURNED' | 'APPROVED' | 'PAID' | 'REJECTED'
  totalInINR: number
  currencyBreakdown: Record<string, number>
  projectId?: string
  clientId?: string
  costCenterId?: string
  hasExceptions: boolean
  createdAt: string
  submittedAt?: string
  approvedAt?: string
  paidAt?: string
  approverComments?: string
  lines: ExpenseLine[]
}

export interface ExpenseLine {
  id: string
  claimId: string
  categoryId: string
  categoryName?: string
  date: string
  vendorName: string
  description: string
  city: string
  country: string
  amount: number
  currency: string
  fxRateUsed?: number
  amountInINR: number
  paymentMode: 'CASH' | 'CARD' | 'UPI' | 'NET_BANKING' | 'CORP_CARD'
  corpCard: boolean
  mileageKm?: number
  perDiem: boolean
  advanceRef?: string
  gstinVendor?: string
  invoiceNo?: string
  invoiceDate?: string
  placeOfSupply?: string
  taxableValue?: number
  cgst?: number
  sgst?: number
  igst?: number
  cess?: number
  receiptIds: string[]
  receipts?: Receipt[]
  validationErrors?: ValidationError[]
  flags?: string[]
}

export interface Receipt {
  id: string
  fileUri: string
  fileName: string
  fileHash: string
  extractedText?: string
  parsedFields?: Record<string, any>
  ocrConfidence?: number
  uploadedBy: string
  createdAt: string
}

export interface PolicyCategory {
  id: string
  name: string
  glCode: string
  isActive: boolean
  alcoholAllowed: boolean
  billableDefault: boolean
  receiptThreshold: number
  perDayLimit?: number
  perNightLimit?: number
  deadlineDays: number
}

export interface PolicyLimits {
  id: string
  categoryId: string
  receiptThreshold: number
  perNightLimit?: number
  perDayLimit?: number
  deadlineDays: number
  mileageRate?: number
  perDiemTables: Record<string, PerDiemRate>
  gstItcRules: Record<string, boolean>
}

export interface PerDiemRate {
  tier: 'A1' | 'A' | 'B' | 'C' | 'INTERNATIONAL'
  weekdayRate: number
  weekendRate: number
  currency: string
}

export interface FxRate {
  id: string
  date: string
  currency: string
  rate: number
}

export interface ApprovalRule {
  id: string
  l1Role: string
  l2Role: string
  amountThreshold: number
  flagConditions: string[]
  escalationHours: number
}

export interface ValidationError {
  type: 'HARD' | 'SOFT'
  field: string
  message: string
  code: string
}

export interface CardTransaction {
  id: string
  statementId: string
  txnDate: string
  amount: number
  currency: string
  merchant: string
  rawDesc: string
  matchedLineId?: string
  matchScore?: number
}

export interface ImportMapping {
  id: string
  userId: string
  provider: 'CREDIT_CARD' | 'UBER' | 'SWIGGY' | 'ZOMATO'
  fieldMappings: Record<string, string>
  isDefault: boolean
}

export interface AuditLog {
  id: string
  actorId: string
  actorName: string
  action: string
  entityType: string
  entityId: string
  before?: Record<string, any>
  after?: Record<string, any>
  timestamp: string
  ip?: string
}

// Form types
export interface ExpenseLineForm {
  categoryId: string
  date: string
  vendorName: string
  description: string
  city: string
  country: string
  amount: number
  currency: string
  paymentMode: 'CASH' | 'CARD' | 'UPI' | 'NET_BANKING' | 'CORP_CARD'
  corpCard: boolean
  mileageKm?: number
  perDiem: boolean
  advanceRef?: string
  gstinVendor?: string
  invoiceNo?: string
  invoiceDate?: string
  placeOfSupply?: string
  taxableValue?: number
  cgst?: number
  sgst?: number
  igst?: number
  cess?: number
  receiptIds: string[]
}

// Dashboard types
export interface ExpenseDashboardMetrics {
  totalSpend: number
  pendingAmount: number
  approvedAmount: number
  rejectedAmount: number
  spendByCategory: Record<string, number>
  reimbursableVsCorp: {
    reimbursable: number
    corporate: number
  }
  averageApprovalTime: number
  exceptionsCount: number
}

export interface TeamExpenseMetrics extends ExpenseDashboardMetrics {
  teamMemberCount: number
  unsubmittedItems: number
  agingBuckets: Record<string, number>
}