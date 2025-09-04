import { ApiResponse } from '@/types/attendance';
import { 
  FinanceSummary, 
  FinanceFilters, 
  Payslip, 
  Form16, 
  TaxDeclaration, 
  TaxProjection, 
  RegimeComparison,
  HRACalculation,
  TDSCalculation,
  InvestmentPlan,
  DeclarationProof,
  FinancialYear,
  TaxRegime,
  TaxSection
} from '@/types/finance';

export class FinanceService {
  private static instance: FinanceService;

  static getInstance(): FinanceService {
    if (!FinanceService.instance) {
      FinanceService.instance = new FinanceService();
    }
    return FinanceService.instance;
  }

  // Summary APIs
  async getFinanceSummary(employeeId: string, filters: FinanceFilters): Promise<ApiResponse<FinanceSummary>> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockSummary: FinanceSummary = {
      employeeId,
      financialYear: "2023-24",
      regime: 'OLD',
      grossEarnings: 1200000,
      netTakeHome: 980000,
      tdsDeducted: 125000,
      contributions: 95000,
      reimbursements: 45000,
      annualizedCTC: 1350000,
      earningsBreakdown: {
        basicSalary: 600000,
        hra: 300000,
        allowances: 150000,
        bonus: 100000,
        incentives: 50000,
        overtime: 0,
        reimbursements: 45000
      },
      deductionsBreakdown: {
        tds: 125000,
        pf: 72000,
        esi: 0,
        professionalTax: 2400,
        insurance: 15000,
        loans: 0,
        other: 5600
      },
      monthlyData: this.generateMonthlyData()
    };

    return {
      data: mockSummary,
      message: 'Finance summary retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  private generateMonthlyData() {
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    return months.map((month, index) => ({
      month,
      year: index < 9 ? 2023 : 2024,
      grossPay: 100000 + Math.random() * 10000,
      netPay: 82000 + Math.random() * 8000,
      tds: 10500 + Math.random() * 2000,
      deductions: 18000 + Math.random() * 2000,
      workingDays: 22,
      paidDays: 22
    }));
  }

  // Payslip APIs
  async getPayslips(employeeId: string, fromMonth: number, fromYear: number, toMonth: number, toYear: number): Promise<ApiResponse<Payslip[]>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const payslips: Payslip[] = [];
    for (let i = 0; i < 12; i++) {
      payslips.push({
        id: `payslip_${i}`,
        employeeId,
        month: (fromMonth + i) % 12 + 1,
        year: fromYear + Math.floor((fromMonth + i) / 12),
        payPeriod: `${new Date(0, (fromMonth + i) % 12).toLocaleString('default', { month: 'long' })} ${fromYear + Math.floor((fromMonth + i) / 12)}`,
        grossSalary: 100000,
        netSalary: 82000,
        earnings: [
          { head: 'Basic Salary', amount: 50000, isFixed: true, isStatutory: false },
          { head: 'HRA', amount: 25000, isFixed: true, isStatutory: false },
          { head: 'Allowances', amount: 15000, isFixed: true, isStatutory: false },
          { head: 'Bonus', amount: 10000, isFixed: false, isStatutory: false }
        ],
        deductions: [
          { head: 'TDS', amount: 10500, isStatutory: true },
          { head: 'PF', amount: 6000, isStatutory: true },
          { head: 'Professional Tax', amount: 200, isStatutory: true },
          { head: 'Insurance', amount: 1300, isStatutory: false }
        ],
        workingDays: 22,
        paidDays: 22,
        lop: 0,
        status: 'PUBLISHED',
        generatedAt: new Date().toISOString(),
        pdfUrl: `/api/payslips/${i}/download`
      });
    }

    return {
      data: payslips,
      message: 'Payslips retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async downloadPayslip(payslipId: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      data: { downloadUrl: `/api/payslips/${payslipId}/download` },
      message: 'Payslip download URL generated',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // Form 16 APIs
  async getForm16List(employeeId: string): Promise<ApiResponse<Form16[]>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const form16List: Form16[] = [
      {
        id: 'form16_2023_24',
        employeeId,
        financialYear: '2023-24',
        partA: {
          employerName: 'Tech Company Ltd',
          employerTAN: 'BLRT01234F',
          employeeUAN: '123456789012',
          employeePAN: 'ABCDE1234F',
          totalTaxDeducted: 125000,
          quarterlyBreakdown: [
            { quarter: 'Q1', amount: 30000, challanNumber: 'CH001', dateOfDeposit: '2023-06-15' },
            { quarter: 'Q2', amount: 32000, challanNumber: 'CH002', dateOfDeposit: '2023-09-15' },
            { quarter: 'Q3', amount: 31000, challanNumber: 'CH003', dateOfDeposit: '2023-12-15' },
            { quarter: 'Q4', amount: 32000, challanNumber: 'CH004', dateOfDeposit: '2024-03-15' }
          ]
        },
        partB: {
          grossSalary: 1200000,
          exemptions: 300000,
          deductions: [
            { section: '80C', declaredAmount: 150000, verifiedAmount: 150000, exemptedAmount: 150000 },
            { section: '80D', declaredAmount: 25000, verifiedAmount: 25000, exemptedAmount: 25000 },
            { section: 'HRA', declaredAmount: 200000, verifiedAmount: 180000, exemptedAmount: 180000 }
          ],
          taxableIncome: 720000,
          taxLiability: 125000,
          tdsDeducted: 125000,
          refundDue: 0
        },
        generatedAt: '2024-05-15T10:00:00Z',
        publishedAt: '2024-05-20T10:00:00Z',
        pdfUrl: '/api/form16/2023-24/download',
        status: 'PUBLISHED'
      },
      {
        id: 'form16_2022_23',
        employeeId,
        financialYear: '2022-23',
        partA: {
          employerName: 'Tech Company Ltd',
          employerTAN: 'BLRT01234F',
          employeeUAN: '123456789012',
          employeePAN: 'ABCDE1234F',
          totalTaxDeducted: 115000,
          quarterlyBreakdown: [
            { quarter: 'Q1', amount: 28000, challanNumber: 'CH101', dateOfDeposit: '2022-06-15' },
            { quarter: 'Q2', amount: 29000, challanNumber: 'CH102', dateOfDeposit: '2022-09-15' },
            { quarter: 'Q3', amount: 28000, challanNumber: 'CH103', dateOfDeposit: '2022-12-15' },
            { quarter: 'Q4', amount: 30000, challanNumber: 'CH104', dateOfDeposit: '2023-03-15' }
          ]
        },
        partB: {
          grossSalary: 1100000,
          exemptions: 280000,
          deductions: [
            { section: '80C', declaredAmount: 150000, verifiedAmount: 150000, exemptedAmount: 150000 },
            { section: '80D', declaredAmount: 20000, verifiedAmount: 20000, exemptedAmount: 20000 },
            { section: 'HRA', declaredAmount: 180000, verifiedAmount: 160000, exemptedAmount: 160000 }
          ],
          taxableIncome: 670000,
          taxLiability: 115000,
          tdsDeducted: 115000,
          refundDue: 0
        },
        generatedAt: '2023-05-15T10:00:00Z',
        publishedAt: '2023-05-20T10:00:00Z',
        pdfUrl: '/api/form16/2022-23/download',
        status: 'PUBLISHED'
      }
    ];

    return {
      data: form16List,
      message: 'Form 16 list retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // Tax Declaration APIs
  async getTaxDeclarations(employeeId: string, financialYear: FinancialYear): Promise<ApiResponse<TaxDeclaration[]>> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const declarations: TaxDeclaration[] = [
      {
        id: 'decl_80c',
        employeeId,
        financialYear,
        regime: 'OLD',
        section: '80C',
        declaredAmount: 150000,
        proofSubmitted: true,
        verifiedAmount: 150000,
        status: 'VERIFIED',
        submittedAt: '2023-12-15T10:00:00Z',
        verifiedAt: '2024-01-20T15:30:00Z',
        payrollEffectMonth: 1,
        proofs: [
          {
            id: 'proof_ppf',
            declarationId: 'decl_80c',
            fileName: 'PPF_Statement_2023.pdf',
            fileUrl: '/api/proofs/ppf_statement.pdf',
            fileSize: 245678,
            fileType: 'application/pdf',
            description: 'PPF Annual Statement',
            amount: 100000,
            uploadedAt: '2023-12-15T10:00:00Z',
            status: 'VERIFIED',
            verifiedBy: 'HR001',
            verifiedAt: '2024-01-20T15:30:00Z'
          }
        ]
      },
      {
        id: 'decl_80d',
        employeeId,
        financialYear,
        regime: 'OLD',
        section: '80D',
        declaredAmount: 25000,
        proofSubmitted: false,
        status: 'SUBMITTED',
        submittedAt: '2023-11-20T14:00:00Z',
        payrollEffectMonth: 12,
        proofs: []
      },
      {
        id: 'decl_hra',
        employeeId,
        financialYear,
        regime: 'OLD',
        section: 'HRA',
        declaredAmount: 200000,
        proofSubmitted: true,
        verifiedAmount: 180000,
        status: 'VERIFIED',
        submittedAt: '2023-10-30T09:00:00Z',
        verifiedAt: '2024-01-15T11:00:00Z',
        payrollEffectMonth: 11,
        proofs: [
          {
            id: 'proof_rent',
            declarationId: 'decl_hra',
            fileName: 'Rent_Receipts_2023.pdf',
            fileUrl: '/api/proofs/rent_receipts.pdf',
            fileSize: 1234567,
            fileType: 'application/pdf',
            description: 'Annual Rent Receipts',
            amount: 180000,
            uploadedAt: '2023-10-30T09:00:00Z',
            status: 'VERIFIED',
            verifiedBy: 'HR001',
            verifiedAt: '2024-01-15T11:00:00Z'
          }
        ]
      }
    ];

    return {
      data: declarations,
      message: 'Tax declarations retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async submitDeclaration(declaration: Partial<TaxDeclaration>): Promise<ApiResponse<TaxDeclaration>> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newDeclaration: TaxDeclaration = {
      id: `decl_${Date.now()}`,
      employeeId: declaration.employeeId!,
      financialYear: declaration.financialYear!,
      regime: declaration.regime!,
      section: declaration.section!,
      declaredAmount: declaration.declaredAmount!,
      proofSubmitted: false,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      payrollEffectMonth: declaration.payrollEffectMonth,
      proofs: []
    };

    return {
      data: newDeclaration,
      message: 'Declaration submitted successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // Tax Calculation APIs
  async calculateTaxProjection(employeeId: string, regime: TaxRegime, declarations: TaxDeclaration[]): Promise<ApiResponse<TaxProjection>> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const projection: TaxProjection = {
      financialYear: '2023-24',
      regime,
      grossIncome: 1200000,
      exemptions: 300000,
      deductions: 175000,
      taxableIncome: 725000,
      taxLiability: regime === 'OLD' ? 125000 : 135000,
      tdsDeducted: 85000,
      projectedTDS: regime === 'OLD' ? 125000 : 135000,
      refundDue: 0,
      shortfall: regime === 'OLD' ? 40000 : 50000,
      monthlyTDS: regime === 'OLD' ? 10000 : 12500,
      remainingMonths: 4
    };

    return {
      data: projection,
      message: 'Tax projection calculated successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async compareRegimes(employeeId: string, declarations: TaxDeclaration[]): Promise<ApiResponse<RegimeComparison>> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const oldRegime: TaxProjection = {
      financialYear: '2023-24',
      regime: 'OLD',
      grossIncome: 1200000,
      exemptions: 300000,
      deductions: 175000,
      taxableIncome: 725000,
      taxLiability: 125000,
      tdsDeducted: 85000,
      projectedTDS: 125000,
      refundDue: 0,
      shortfall: 40000,
      monthlyTDS: 10000,
      remainingMonths: 4
    };

    const newRegime: TaxProjection = {
      financialYear: '2023-24',
      regime: 'NEW',
      grossIncome: 1200000,
      exemptions: 50000,
      deductions: 0,
      taxableIncome: 1150000,
      taxLiability: 135000,
      tdsDeducted: 85000,
      projectedTDS: 135000,
      refundDue: 0,
      shortfall: 50000,
      monthlyTDS: 12500,
      remainingMonths: 4
    };

    const comparison: RegimeComparison = {
      oldRegime,
      newRegime,
      savings: newRegime.taxLiability - oldRegime.taxLiability,
      recommendation: oldRegime.taxLiability < newRegime.taxLiability ? 'OLD' : 'NEW'
    };

    return {
      data: comparison,
      message: 'Regime comparison completed successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // Calculator APIs
  async calculateHRA(basicSalary: number, hraReceived: number, rentPaid: number, cityType: 'METRO' | 'NON_METRO'): Promise<ApiResponse<HRACalculation>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const cityBasedLimit = cityType === 'METRO' ? basicSalary * 0.5 : basicSalary * 0.4;
    const rentMinusBasic = Math.max(0, rentPaid - basicSalary * 0.1);
    const exemptAmount = Math.min(hraReceived, cityBasedLimit, rentMinusBasic);
    
    const calculation: HRACalculation = {
      cityType,
      basicSalary,
      hraReceived,
      rentPaid,
      exemption: exemptAmount,
      taxableHRA: hraReceived - exemptAmount,
      breakdown: {
        actualHRA: hraReceived,
        cityBasedLimit,
        rentMinusBasic,
        exemptAmount
      }
    };

    return {
      data: calculation,
      message: 'HRA calculation completed successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async calculateTDS(grossSalary: number, exemptions: number, deductions: number): Promise<ApiResponse<TDSCalculation>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const taxableIncome = Math.max(0, grossSalary - exemptions - deductions);
    let taxLiability = 0;
    
    // Tax slab calculation (FY 2023-24 old regime)
    if (taxableIncome > 250000) {
      if (taxableIncome <= 500000) {
        taxLiability = (taxableIncome - 250000) * 0.05;
      } else if (taxableIncome <= 1000000) {
        taxLiability = 12500 + (taxableIncome - 500000) * 0.2;
      } else {
        taxLiability = 112500 + (taxableIncome - 1000000) * 0.3;
      }
    }
    
    // Add cess
    taxLiability *= 1.04;
    
    const calculation: TDSCalculation = {
      grossSalary,
      exemptions,
      deductions,
      taxableIncome,
      taxLiability,
      monthlyTDS: taxLiability / 12,
      effectiveRate: (taxLiability / grossSalary) * 100
    };

    return {
      data: calculation,
      message: 'TDS calculation completed successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async getInvestmentPlanner(targetSections: TaxSection[]): Promise<ApiResponse<InvestmentPlan[]>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const plans: InvestmentPlan[] = targetSections.map(section => ({
      section,
      targetAmount: section === '80C' ? 150000 : section === '80D' ? 25000 : 50000,
      currentAmount: section === '80C' ? 100000 : section === '80D' ? 15000 : 20000,
      gap: section === '80C' ? 50000 : section === '80D' ? 10000 : 30000,
      suggestions: [
        {
          instrument: section === '80C' ? 'PPF' : section === '80D' ? 'Health Insurance' : 'NSC',
          minAmount: 500,
          maxAmount: section === '80C' ? 150000 : section === '80D' ? 25000 : 50000,
          taxBenefit: section === '80C' ? 150000 : section === '80D' ? 25000 : 50000,
          riskLevel: 'LOW',
          liquidity: section === '80C' ? 'LOW' : 'MEDIUM',
          returns: section === '80C' ? '7.1%' : section === '80D' ? 'Insurance Coverage' : '6.8%'
        }
      ]
    }));

    return {
      data: plans,
      message: 'Investment planner data retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // File Upload APIs
  async uploadProof(declarationId: string, file: File, description: string, amount: number): Promise<ApiResponse<DeclarationProof>> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const proof: DeclarationProof = {
      id: `proof_${Date.now()}`,
      declarationId,
      fileName: file.name,
      fileUrl: `/api/proofs/${declarationId}/${file.name}`,
      fileSize: file.size,
      fileType: file.type,
      description,
      amount,
      uploadedAt: new Date().toISOString(),
      status: 'SUBMITTED'
    };

    return {
      data: proof,
      message: 'Proof uploaded successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }
}

export const financeService = FinanceService.getInstance();