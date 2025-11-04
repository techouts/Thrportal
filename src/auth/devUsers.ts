export const DEV_AUTH_MODE = true; // flip via env at build

// Fixed UUIDs for dev users (synced with database)
export const DEV_USER_ID_MAP: Record<string, string> = {
  "admin@dev.local": "11111111-1111-1111-1111-111111111111",
  "mgmt@dev.local": "22222222-2222-2222-2222-222222222222",
  "viewer@dev.local": "33333333-3333-3333-3333-333333333333",
  "manager@dev.local": "44444444-4444-4444-4444-444444444444",
  "employee@dev.local": "55555555-5555-5555-5555-555555555555",
  "recruiter@dev.local": "66666666-6666-6666-6666-666666666666",
  "hiringmgr@dev.local": "77777777-7777-7777-7777-777777777777",
  "staffingmgr@dev.local": "88888888-8888-8888-8888-888888888888",
  "pl@dev.local": "99999999-9999-9999-9999-999999999999",
  "dh@dev.local": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "hrlead@dev.local": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  "hrmgr@dev.local": "cccccccc-cccc-cccc-cccc-cccccccccccc",
  "finmgr@dev.local": "dddddddd-dddd-dddd-dddd-dddddddddddd",
  "payroll@dev.local": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
  "fin@dev.local": "ffffffff-ffff-ffff-ffff-ffffffffffff",
  "it@dev.local": "10101010-1010-1010-1010-101010101010",
  "auditor@dev.local": "20202020-2020-2020-2020-202020202020",
  "dpo@dev.local": "30303030-3030-3030-3030-303030303030"
};

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
  { email: "finmgr@dev.local",       display_name: "Finn Finance Mgr",    role: "FINANCE_MANAGER",    password: "DevOnly!2025", mfa_enabled: false },
  { email: "payroll@dev.local",      display_name: "Pia Payroll",         role: "PAYROLL_SPECIALIST", password: "DevOnly!2025", mfa_enabled: false },
  { email: "fin@dev.local",          display_name: "Farah Finance",       role: "FINANCE_ANALYST",    password: "DevOnly!2025", mfa_enabled: false },
  { email: "it@dev.local",           display_name: "Inder IT",            role: "IT_HELPDESK",        password: "DevOnly!2025", mfa_enabled: false },
  { email: "auditor@dev.local",      display_name: "Arun Auditor",        role: "AUDITOR_RO",         password: "DevOnly!2025", mfa_enabled: false },
  { email: "dpo@dev.local",          display_name: "Deepa DPO",           role: "DPO_PRIVACY",        password: "DevOnly!2025", mfa_enabled: false }
] as const;