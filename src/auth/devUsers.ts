export const DEV_AUTH_MODE = true; // flip via env at build

// Fixed UUIDs for dev users (synced with database)
export const DEV_USER_ID_MAP: Record<string, string> = {
  "admin@dev.local": "fd017bbb-a24e-45fd-bf6c-6cc8e71279df",
  "mgmt@dev.local": "22222222-2222-2222-2222-222222222222",
  "viewer@dev.local": "33333333-3333-3333-3333-333333333333",
  "manager@dev.local": "df3ef83c-faf6-4712-be51-de7b292f1ed5",
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
  "dpo@dev.local": "30303030-3030-3030-3030-303030303030",
  "opshr@dev.local": "544b4c1c-c390-4d44-bf39-eb02c00aabf9"
};

export const DEV_USERS = [
  { email: "admin@dev.local",        display_name: "Akhil Admin",         roles: ["ADMIN"],                         password: "DevOnly!2025", mfa_enabled: true },
  { email: "mgmt@dev.local",         display_name: "Mona Management",     roles: ["MANAGEMENT"],                    password: "DevOnly!2025", mfa_enabled: false },
  { email: "viewer@dev.local",       display_name: "Vikas Viewer",        roles: ["VIEWER"],                        password: "DevOnly!2025", mfa_enabled: false },
  { email: "manager@dev.local",      display_name: "Maya Manager",        roles: ["MANAGER"],                       password: "DevOnly!2025", mfa_enabled: false },
  { email: "employee@dev.local",     display_name: "Esha Employee",       roles: ["EMPLOYEE"],                      password: "DevOnly!2025", mfa_enabled: false },
  { email: "recruiter@dev.local",    display_name: "Ravi Recruiter",      roles: ["RECRUITER"],                     password: "DevOnly!2025", mfa_enabled: false },
  { email: "hiringmgr@dev.local",    display_name: "Hari HiringMgr",      roles: ["HIRING_MANAGER"],                password: "DevOnly!2025", mfa_enabled: false },
  { email: "staffingmgr@dev.local",  display_name: "Sara StaffingMgr",    roles: ["STAFFING_MANAGER"],              password: "DevOnly!2025", mfa_enabled: false },
  { email: "pl@dev.local",           display_name: "Pooja ProjectLead",   roles: ["PROJECT_LEAD"],                  password: "DevOnly!2025", mfa_enabled: false },
  { email: "dh@dev.local",           display_name: "Dev DeliveryHead",    roles: ["DELIVERY_HEAD"],                 password: "DevOnly!2025", mfa_enabled: false },
  { email: "hrlead@dev.local",       display_name: "Hema HR Lead",        roles: ["HR_LEAD"],                       password: "DevOnly!2025", mfa_enabled: false },
  { email: "hrmgr@dev.local",        display_name: "Harsh HR Manager",    roles: ["HR_MANAGER", "HIRING_MANAGER"],  password: "DevOnly!2025", mfa_enabled: false },
  { email: "finmgr@dev.local",       display_name: "Finn Finance Mgr",    roles: ["FINANCE_MANAGER"],               password: "DevOnly!2025", mfa_enabled: false },
  { email: "payroll@dev.local",      display_name: "Pia Payroll",         roles: ["PAYROLL_SPECIALIST"],            password: "DevOnly!2025", mfa_enabled: false },
  { email: "fin@dev.local",          display_name: "Farah Finance",       roles: ["FINANCE_ANALYST"],               password: "DevOnly!2025", mfa_enabled: false },
  { email: "it@dev.local",           display_name: "Inder IT",            roles: ["IT_HELPDESK"],                   password: "DevOnly!2025", mfa_enabled: false },
  { email: "auditor@dev.local",      display_name: "Arun Auditor",        roles: ["AUDITOR_RO"],                    password: "DevOnly!2025", mfa_enabled: false },
  { email: "dpo@dev.local",          display_name: "Deepa DPO",           roles: ["DPO_PRIVACY"],                   password: "DevOnly!2025", mfa_enabled: false },
  { email: "opshr@dev.local",        display_name: "Ops HR User",         roles: ["OPERATIONS_HR"],                 password: "DevOnly!2025", mfa_enabled: false }
] as const;
