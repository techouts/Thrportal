// Finance Module Types

export type TaxRegime = 'OLD' | 'NEW';
export type FinancialYear = string; // Format: "2023-24"
export type TaxSection = '80C' | '80D' | '80CCD' | '80E' | '80G' | 'HRA' | 'LTA' | 'HOME_LOAN' | 'PT' | 'OTHER';
export type DeclarationStatus = 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED' | 'LOCKED';
export type ProofStatus = 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';

// Summary Types
export interface FinanceSummary {
  employeeId: string;
  financialYear: FinancialYear;
  regime: TaxRegime;
  grossEarnings: number;
  netTakeHome: number;
  tdsDeducted: number;
  contributions: number;
  reimbursements: number;
  annualizedCTC: number;
  earningsBreakdown: EarningsBreakdown;
  deductionsBreakdown: DeductionsBreakdown;
  monthlyData: MonthlyFinanceData[];
}

export interface EarningsBreakdown {
  basicSalary: number;
  hra: number;
  allowances: number;
  bonus: number;
  incentives: number;
  overtime: number;
  reimbursements: number;
}

export interface DeductionsBreakdown {
  tds: number;
  pf: number;
  esi: number;
  professionalTax: number;
  insurance: number;
  loans: number;
  other: number;
}

export interface MonthlyFinanceData {
  month: string;
  year: number;
  grossPay: number;
  netPay: number;
  tds: number;
  deductions: number;
  workingDays: number;
  paidDays: number;
}

// Payslip Types
export interface Payslip {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  payPeriod: string;
  grossSalary: number;
  netSalary: number;
  earnings: PayslipEarning[];
  deductions: PayslipDeduction[];
  workingDays: number;
  paidDays: number;
  lop: number;
  status: 'DRAFT' | 'PROCESSED' | 'PUBLISHED';
  generatedAt: string;
  pdfUrl?: string;
}

export interface PayslipEarning {
  head: string;
  amount: number;
  isFixed: boolean;
  isStatutory: boolean;
}

export interface PayslipDeduction {
  head: string;
  amount: number;
  isStatutory: boolean;
  section?: TaxSection;
}

// Tax Declaration Types
export interface TaxDeclaration {
  id: string;
  employeeId: string;
  financialYear: FinancialYear;
  regime: TaxRegime;
  section: TaxSection;
  declaredAmount: number;
  proofSubmitted: boolean;
  verifiedAmount?: number;
  status: DeclarationStatus;
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  payrollEffectMonth?: number;
  proofs: DeclarationProof[];
}

export interface DeclarationProof {
  id: string;
  declarationId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  description?: string;
  amount: number;
  uploadedAt: string;
  status: ProofStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

// Form 16 Types
export interface Form16 {
  id: string;
  employeeId: string;
  financialYear: FinancialYear;
  partA: Form16PartA;
  partB: Form16PartB;
  generatedAt: string;
  publishedAt?: string;
  pdfUrl?: string;
  status: 'DRAFT' | 'GENERATED' | 'PUBLISHED';
}

export interface Form16PartA {
  employerName: string;
  employerTAN: string;
  employeeUAN: string;
  employeePAN: string;
  totalTaxDeducted: number;
  quarterlyBreakdown: QuarterlyTDS[];
}

export interface Form16PartB {
  grossSalary: number;
  exemptions: number;
  deductions: TaxDeduction[];
  taxableIncome: number;
  taxLiability: number;
  tdsDeducted: number;
  refundDue: number;
}

export interface QuarterlyTDS {
  quarter: string;
  amount: number;
  challanNumber?: string;
  dateOfDeposit?: string;
}

export interface TaxDeduction {
  section: TaxSection;
  declaredAmount: number;
  verifiedAmount: number;
  exemptedAmount: number;
}

// Tax Calculation Types
export interface TaxProjection {
  financialYear: FinancialYear;
  regime: TaxRegime;
  grossIncome: number;
  exemptions: number;
  deductions: number;
  taxableIncome: number;
  taxLiability: number;
  tdsDeducted: number;
  projectedTDS: number;
  refundDue: number;
  shortfall: number;
  monthlyTDS: number;
  remainingMonths: number;
}

export interface RegimeComparison {
  oldRegime: TaxProjection;
  newRegime: TaxProjection;
  savings: number;
  recommendation: TaxRegime;
}

// Calculator Types
export interface HRACalculation {
  cityType: 'METRO' | 'NON_METRO';
  basicSalary: number;
  hraReceived: number;
  rentPaid: number;
  exemption: number;
  taxableHRA: number;
  breakdown: {
    actualHRA: number;
    cityBasedLimit: number;
    rentMinusBasic: number;
    exemptAmount: number;
  };
}

export interface TDSCalculation {
  grossSalary: number;
  exemptions: number;
  deductions: number;
  taxableIncome: number;
  taxLiability: number;
  monthlyTDS: number;
  effectiveRate: number;
}

// Investment Planner Types
export interface InvestmentPlan {
  section: TaxSection;
  targetAmount: number;
  currentAmount: number;
  gap: number;
  suggestions: InvestmentSuggestion[];
}

export interface InvestmentSuggestion {
  instrument: string;
  minAmount: number;
  maxAmount: number;
  taxBenefit: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  liquidity: 'HIGH' | 'MEDIUM' | 'LOW';
  returns: string;
}

// Audit & Settings Types
export interface FinanceAuditLog {
  id: string;
  employeeId: string;
  action: string;
  entityType: 'DECLARATION' | 'PROOF' | 'PAYSLIP' | 'FORM16';
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface PayrollSettings {
  currentFY: FinancialYear;
  declarationDeadline: string;
  proofSubmissionDeadline: string;
  defaultRegime: TaxRegime;
  ptSlabs: PTSlab[];
  tdsSlabs: TDSSlab[];
  cessRate: number;
  form16PublishDate?: string;
}

export interface PTSlab {
  state: string;
  minSalary: number;
  maxSalary: number;
  ptAmount: number;
}

export interface TDSSlab {
  regime: TaxRegime;
  minIncome: number;
  maxIncome?: number;
  rate: number;
  cess: number;
}

// API Response Types
export type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
};

export interface FinanceFilters {
  period: 'YTD' | 'FY' | 'MONTH';
  financialYear?: FinancialYear;
  month?: number;
  year?: number;
}

export interface StatementFilters {
  type: 'PAYSLIP' | 'FORM16' | 'CERTIFICATE';
  fromMonth?: number;
  fromYear?: number;
  toMonth?: number;
  toYear?: number;
}