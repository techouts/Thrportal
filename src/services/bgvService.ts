import { BgvCase, BgvException, BgvFilters, BgvSettings, BgvPackage, SlaProfile } from '@/types/bgv'

// Mock data for BGV cases
const mockBgvCases: BgvCase[] = [
  {
    id: 'bgv-001',
    candidateId: 'cand-001',
    candidateName: 'Priya Sharma',
    jdId: 'JD-2024-001',
    client: 'TechCorp',
    project: 'Digital Banking',
    recruiterId: 'rec-001',
    packageCode: 'IND_STANDARD',
    vendorIds: ['vendor-001'],
    status: 'IN_PROGRESS',
    overallOutcome: undefined,
    consent: {
      captured: true,
      signedName: 'Priya Sharma',
      consentPdfUrl: '/documents/consent-001.pdf',
      timestamp: '2024-01-15T10:30:00Z',
      ip: '192.168.1.100'
    },
    slaDueAt: '2024-01-22T18:00:00Z',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-18T14:20:00Z',
    documents: [],
    checks: [],
    exceptions: [],
    history: []
  },
  {
    id: 'bgv-002',
    candidateId: 'cand-002',
    candidateName: 'Rahul Kumar',
    jdId: 'JD-2024-002',
    client: 'FinanceMax',
    project: 'Investment Platform',
    recruiterId: 'rec-002',
    packageCode: 'IND_EXTENDED',
    vendorIds: ['vendor-002'],
    status: 'AWAITING_DOCS',
    overallOutcome: undefined,
    consent: {
      captured: true,
      signedName: 'Rahul Kumar',
      timestamp: '2024-01-16T09:15:00Z'
    },
    slaDueAt: '2024-01-25T18:00:00Z',
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-17T16:45:00Z',
    documents: [],
    checks: [],
    exceptions: [],
    history: []
  }
]

const mockExceptions: BgvException[] = [
  {
    id: 'exc-001',
    bgvCaseId: 'bgv-001',
    type: 'MISSING_DOCS',
    reason: 'Candidate unable to provide PAN card due to family dispute over documents',
    requestedBy: 'rec-001',
    approverRole: 'HR_MANAGER',
    status: 'PENDING',
    updatedAt: '2024-01-18T11:30:00Z'
  }
]

const mockSettings: BgvSettings[] = [
  {
    id: 'set-001',
    client: 'TechCorp',
    project: 'Digital Banking',
    allowedVendors: ['vendor-001', 'vendor-002'],
    selectionMode: 'MULTIPLE_ALLOWED',
    defaultPackage: 'IND_STANDARD',
    slaProfileId: 'sla-001',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

const mockPackages: BgvPackage[] = [
  {
    code: 'IND_BASIC',
    name: 'India Basic',
    description: 'ID/KYC, Address, Employment (last 1), Education (highest)',
    checks: ['ID_KYC', 'ADDRESS', 'EMPLOYMENT', 'EDUCATION'],
    defaultSla: {
      id: 'sla-basic',
      name: 'Basic SLA',
      idKycDays: 1,
      addressDays: 3,
      educationDays: 5,
      employmentDays: 5,
      criminalDays: 0,
      courtDays: 0,
      uanEpfoDays: 0,
      referencesDays: 0
    }
  },
  {
    code: 'IND_STANDARD',
    name: 'India Standard',
    description: 'Basic + Criminal/Court + References (2)',
    checks: ['ID_KYC', 'ADDRESS', 'EMPLOYMENT', 'EDUCATION', 'CRIMINAL', 'COURT', 'REFERENCES'],
    defaultSla: {
      id: 'sla-standard',
      name: 'Standard SLA',
      idKycDays: 1,
      addressDays: 3,
      educationDays: 5,
      employmentDays: 5,
      criminalDays: 7,
      courtDays: 10,
      uanEpfoDays: 0,
      referencesDays: 3
    }
  },
  {
    code: 'IND_EXTENDED',
    name: 'India Extended',
    description: 'Standard + UAN/EPFO + Additional Employment (up to 3)',
    checks: ['ID_KYC', 'ADDRESS', 'EMPLOYMENT', 'EDUCATION', 'CRIMINAL', 'COURT', 'UAN_EPFO', 'REFERENCES'],
    defaultSla: {
      id: 'sla-extended',
      name: 'Extended SLA',
      idKycDays: 1,
      addressDays: 3,
      educationDays: 5,
      employmentDays: 5,
      criminalDays: 7,
      courtDays: 10,
      uanEpfoDays: 2,
      referencesDays: 3
    }
  }
]

export const BgvService = {
  // BGV Cases
  async getBgvCases(filters: BgvFilters = {}): Promise<BgvCase[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockBgvCases.filter(bgv => {
      if (filters.client && bgv.client !== filters.client) return false
      if (filters.status && bgv.status !== filters.status) return false
      if (filters.candidate && !bgv.candidateName.toLowerCase().includes(filters.candidate.toLowerCase())) return false
      return true
    })
  },

  async createBgvCase(data: Partial<BgvCase>): Promise<BgvCase> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newCase: BgvCase = {
      id: `bgv-${Date.now()}`,
      candidateId: data.candidateId || '',
      candidateName: data.candidateName || '',
      jdId: data.jdId || '',
      client: data.client || '',
      project: data.project || '',
      recruiterId: data.recruiterId || '',
      packageCode: data.packageCode || 'IND_BASIC',
      vendorIds: data.vendorIds || [],
      status: 'PENDING',
      consent: {
        captured: false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: [],
      checks: [],
      exceptions: [],
      history: []
    }
    mockBgvCases.push(newCase)
    return newCase
  },

  async updateBgvCase(id: string, data: Partial<BgvCase>): Promise<BgvCase> {
    await new Promise(resolve => setTimeout(resolve, 500))
    const index = mockBgvCases.findIndex(bgv => bgv.id === id)
    if (index === -1) throw new Error('BGV case not found')
    
    mockBgvCases[index] = { ...mockBgvCases[index], ...data, updatedAt: new Date().toISOString() }
    return mockBgvCases[index]
  },

  // Exceptions
  async getExceptions(filters: BgvFilters = {}): Promise<BgvException[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockExceptions
  },

  async createException(data: Partial<BgvException>): Promise<BgvException> {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newException: BgvException = {
      id: `exc-${Date.now()}`,
      bgvCaseId: data.bgvCaseId || '',
      type: data.type || 'OTHER',
      reason: data.reason || '',
      requestedBy: data.requestedBy || '',
      approverRole: data.approverRole || 'HR_MANAGER',
      status: 'PENDING',
      updatedAt: new Date().toISOString()
    }
    mockExceptions.push(newException)
    return newException
  },

  async approveException(id: string, decisionNote: string): Promise<BgvException> {
    await new Promise(resolve => setTimeout(resolve, 500))
    const index = mockExceptions.findIndex(exc => exc.id === id)
    if (index === -1) throw new Error('Exception not found')
    
    mockExceptions[index] = {
      ...mockExceptions[index],
      status: 'APPROVED',
      decisionNote,
      updatedAt: new Date().toISOString()
    }
    return mockExceptions[index]
  },

  // Settings
  async getSettings(): Promise<BgvSettings[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockSettings
  },

  async updateSettings(data: Partial<BgvSettings>): Promise<BgvSettings> {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newSetting: BgvSettings = {
      id: `set-${Date.now()}`,
      client: data.client || '',
      project: data.project || '',
      allowedVendors: data.allowedVendors || [],
      selectionMode: data.selectionMode || 'SINGLE_ONLY',
      defaultPackage: data.defaultPackage,
      slaProfileId: data.slaProfileId,
      updatedAt: new Date().toISOString()
    }
    mockSettings.push(newSetting)
    return newSetting
  },

  // Packages
  async getPackages(): Promise<BgvPackage[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockPackages
  },

  // Utilities
  async uploadDocument(file: File, bgvCaseId: string, kind: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return `/documents/${bgvCaseId}/${file.name}`
  },

  async generateConsentPdf(candidateName: string, signedName: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800))
    return `/documents/consent-${candidateName.replace(' ', '-')}.pdf`
  }
}