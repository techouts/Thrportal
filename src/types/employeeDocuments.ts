// Employee Documents Types

export interface WorkExperience {
  id: string;
  company: string;
  job_title: string;
  from_date: string; // YYYY-MM format
  to_date: string | null; // null if current
  location: string;
  document_url?: string;
}

export interface EducationDetail {
  id: string;
  degree: string;
  branch: string;
  from_year: number;
  to_year: number;
  cgpa?: number;
  university: string;
  document_url?: string;
}

export interface IdentityDocument {
  number: string;
  document_url?: string;
}

export interface IdentityDocuments {
  aadhaar?: IdentityDocument;
  pan?: IdentityDocument;
  voter_id?: IdentityDocument;
}

export interface EmployeeDocuments {
  work_experience: WorkExperience[];
  education_details: EducationDetail[];
  identity_documents: IdentityDocuments;
  offer_letter_url?: string;
}
