export const DEV_AUTH_MODE = true; // flip via env at build

export const DEV_USERS = [
  { email: "admin@dev.local",        display_name: "Akhil Admin",         role: "ADMIN",              password: "DevOnly!2025", mfa_enabled: true },
  { email: "mgmt@dev.local",         display_name: "Mona Management",     role: "MANAGEMENT",         password: "DevOnly!2025", mfa_enabled: false },
  { email: "viewer@dev.local",       display_name: "Vikas Viewer",        role: "VIEWER",             password: "DevOnly!2025", mfa_enabled: false },
  { email: "manager@dev.local",      display_name: "Maya Manager",        role: "MANAGER",            password: "DevOnly!2025", mfa_enabled: false },
  { email: "employee@dev.local",     display_name: "Esha Employee",       role: "EMPLOYEE",           password: "DevOnly!2025", mfa_enabled: false },
  { email: "recruiter@dev.local",    display_name: "Ravi Recruiter",      role: "RECRUITER",          password: "DevOnly!2025", mfa_enabled: false },
  { email: "hiringmgr@dev.local",    display_name: "Hari HiringMgr",      role: "HIRING_MANAGER",     password: "DevOnly!2025", mfa_enabled: false },
  { email: "staffingmgr@dev.local",  display_name: "Sara StaffingMgr",    role: "STAFFING_MANAGER",   password: "DevOnly!2025", mfa_enabled: false },
  { email: "pl@dev.local",           display_name: "Pooja ProjectLead",   role: "PROJECT_LEAD",       password: "DevOnly!2025", mfa_enabled: false },
  { email: "dh@dev.local",           display_name: "Dev DeliveryHead",    role: "DELIVERY_HEAD",      password: "DevOnly!2025", mfa_enabled: false },
  { email: "hrlead@dev.local",       display_name: "Hema HR Lead",        role: "HR_LEAD",            password: "DevOnly!2025", mfa_enabled: false },
  { email: "hrmgr@dev.local",        display_name: "Harsh HR Manager",    role: "HR_MANAGER",         password: "DevOnly!2025", mfa_enabled: false },
  { email: "payroll@dev.local",      display_name: "Pia Payroll",         role: "PAYROLL_SPECIALIST", password: "DevOnly!2025", mfa_enabled: false },
  { email: "fin@dev.local",          display_name: "Farah Finance",       role: "FINANCE_ANALYST",    password: "DevOnly!2025", mfa_enabled: false },
  { email: "it@dev.local",           display_name: "Inder IT",            role: "IT_HELPDESK",        password: "DevOnly!2025", mfa_enabled: false },
  { email: "auditor@dev.local",      display_name: "Arun Auditor",        role: "AUDITOR_RO",         password: "DevOnly!2025", mfa_enabled: false },
  { email: "dpo@dev.local",          display_name: "Deepa DPO",           role: "DPO_PRIVACY",        password: "DevOnly!2025", mfa_enabled: false }
] as const;