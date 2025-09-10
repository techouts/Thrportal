export const ROLES = [
  "EMPLOYEE","MANAGER","MANAGEMENT","ADMIN",
  "RECRUITER","HIRING_MANAGER",
  "PROJECT_LEAD","DELIVERY_HEAD",
  "HR_LEAD","HR_MANAGER",
  "PAYROLL_SPECIALIST","FINANCE_ANALYST",
  "IT_HELPDESK","AUDITOR_RO","DPO_PRIVACY","VIEWER"
] as const;

export type Role = typeof ROLES[number];

export const ROLE_ALIASES: Record<string, Role> = {
  Manager: "MANAGER",
  Admin: "ADMIN",
  Management: "MANAGEMENT",
  HR_ADMIN: "HR_MANAGER",
  FINANCE_ADMIN: "FINANCE_ANALYST",
  IT_ADMIN: "IT_HELPDESK",
  HIRING_ADMIN: "HIRING_MANAGER"
};

export const FEATURE_FLAGS = [
  "admin_portal","wfh_rules","hiring_ai_matcher"
] as const;