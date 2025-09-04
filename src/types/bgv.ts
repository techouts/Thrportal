// BGV Types
export interface BgvCase {
  id: string
  candidateId: string
  candidateName: string
  jdId: string
  client: string
  project: string
  recruiterId: string
  packageCode: string
  vendorIds: string[]
  status: BgvStatus
  overallOutcome?: BgvOutcome
  consent: {
    captured: boolean
    signedName?: string
    consentPdfUrl?: string
    timestamp?: string
    ip?: string
  }
  slaDueAt?: string
  createdAt: string
  updatedAt: string
  closedAt?: string
  documents: BgvDocument[]
  checks: BgvCheck[]
  exceptions: BgvException[]
  history: BgvHistory[]
}

export type BgvStatus = 'PENDING' | 'IN_PROGRESS' | 'AWAITING_DOCS' | 'ON_HOLD' | 'REVIEW' | 'COMPLETED' | 'CANCELLED'
export type BgvOutcome = 'GREEN' | 'AMBER' | 'RED' | 'INCONCLUSIVE'

export interface BgvCheck {
  id: string
  bgvCaseId: string
  type: BgvCheckType
  status: BgvStatus
  notes?: string
  vendorId?: string
  slaDueAt?: string
  updatedAt: string
}

export type BgvCheckType = 'ID_KYC' | 'ADDRESS' | 'EDUCATION' | 'EMPLOYMENT' | 'CRIMINAL' | 'COURT' | 'UAN_EPFO' | 'REFERENCES'

export interface BgvDocument {
  id: string
  bgvCaseId: string
  kind: DocKind
  url: string
  fileName: string
  sizeBytes: number
  uploadedBy: string
  uploadedAt: string
  pii: boolean
}

export type DocKind = 'CONSENT' | 'ID_PROOF' | 'EDU_PROOF' | 'EMP_LETTER' | 'VENDOR_REPORT' | 'OTHER'

export interface BgvException {
  id: string
  bgvCaseId: string
  type: ExceptionType
  reason: string
  requestedBy: string
  approverRole: ApproverRole
  status: ApprovalStatus
  decisionNote?: string
  attachmentUrl?: string
  updatedAt: string
}

export type ExceptionType = 'WAIVER' | 'PARTIAL_PASS' | 'EXPEDITE' | 'REVERIFICATION' | 'VENDOR_SWITCH' | 'MISSING_DOCS' | 'NAME_DOB_MISMATCH' | 'OTHER'
export type ApproverRole = 'HR_MANAGER' | 'STAFFING_MANAGER'
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface BgvSettings {
  id: string
  client: string
  project: string
  allowedVendors: string[]
  selectionMode: VendorSelectionMode
  defaultPackage?: string
  slaProfileId?: string
  updatedAt: string
}

export type VendorSelectionMode = 'SINGLE_ONLY' | 'MULTIPLE_ALLOWED'

export interface SlaProfile {
  id: string
  name: string
  idKycDays: number
  addressDays: number
  educationDays: number
  employmentDays: number
  criminalDays: number
  courtDays: number
  uanEpfoDays: number
  referencesDays: number
}

export interface BgvHistory {
  id: string
  bgvCaseId: string
  actorId: string
  action: string
  meta?: any
  createdAt: string
}

export interface BgvFilters {
  client?: string
  project?: string
  jdId?: string
  candidate?: string
  recruiter?: string
  vendor?: string
  status?: BgvStatus
  dateRange?: {
    start: string
    end: string
  }
}

export interface BgvPackage {
  code: string
  name: string
  description: string
  checks: BgvCheckType[]
  defaultSla: SlaProfile
}