export type MenuItem = { 
  label: string; 
  route: string; 
  requiresAny?: string[] 
};

export type MenuSection = { 
  label: string; 
  requiresAny?: string[]; 
  items?: MenuItem[];
  route?: string;
};

export const MENU: MenuSection[] = [
  { 
    label: "Home", 
    route: "/Home"
  },
  { 
    label: "Me", 
    items: [
      { label: "Dashboard",   route: "/Me/Dashboard" },
      { label: "Profile",     route: "/Me/Profile" },
      { label: "Attendance",  route: "/Me/Attendance", requiresAny: ["attendance.read"] },
      { label: "Leave",       route: "/Me/Leave", requiresAny: ["leave.requests.read", "leave.balance.read"] },
      { label: "Timesheet",   route: "/Me/Timesheet", requiresAny: ["timesheets.read"] },
      { label: "Expenses",    route: "/Me/Expenses", requiresAny: ["expenses.read", "expenses.submit"] },
      { label: "Finance",     route: "/Me/Finance", requiresAny: ["finance.payslips.read"] },
      { label: "Learning",    route: "/Me/Learning", requiresAny: ["learning.read"] },
      { label: "Recognition", route: "/Me/Recognition", requiresAny: ["recognition.read"] },
      { label: "IJP",         route: "/Me/IJP", requiresAny: ["ijp.postings.read"] },
      { label: "Helpdesk",    route: "/Me/Helpdesk", requiresAny: ["helpdesk.tickets.read_own"] }
    ] 
  },
  { 
    label: "My Team", 
    requiresAny: ["team.*", "leave.approvals.*", "timesheets.approvals.*", "performance.reviews.create"],
    items: [
      { label: "Dashboard",       route: "/MyTeam/Dashboard" },
      { label: "Leave",           route: "/MyTeam/Leave" },
      { label: "Attendance",      route: "/MyTeam/Attendance" },
      { label: "Timesheet",       route: "/MyTeam/Timesheet" },
      { label: "Expenses",        route: "/MyTeam/Expenses" },
      { label: "Performance",     route: "/MyTeam/Performance" },
      { label: "Recognition",     route: "/MyTeam/Recognition" },
      { label: "Learning",        route: "/MyTeam/Learning" },
      { label: "Profile Changes", route: "/MyTeam/ProfileChanges" },
      { label: "IJP",             route: "/MyTeam/IJP" }
    ] 
  },
  { 
    label: "Management", 
    requiresAny: ["management.*", "ownership.*"],
    items: [
      { label: "Dashboard", route: "/Management/Dashboard" },
      { label: "Primary Queues", route: "/Management/PrimaryQueues" },
      { label: "Escalations", route: "/Management/Escalations" }
    ] 
  },
  { 
    label: "Hiring", 
    requiresAny: ["hiring.*", "applications.*"],
    items: [
      { label: "Dashboard",       route: "/Hiring/Dashboard" },
      { label: "JDs",             route: "/Hiring/JDs" },
      { label: "Approvals",       route: "/Hiring/Approvals" },
      { label: "Candidates",      route: "/Hiring/Candidates" },
      { label: "Ownership",       route: "/Hiring/Ownership" },
      { label: "Applications",    route: "/Hiring/Applications" },
      { label: "Pipeline",        route: "/Hiring/Pipeline" },
      { label: "Scheduling",      route: "/Hiring/Scheduling" },
      { label: "FollowUp",        route: "/Hiring/FollowUp" },
      { label: "Settings",        route: "/Hiring/Settings" }
    ] 
  },
  { 
    label: "CRM", 
    requiresAny: ["crm.*"],
    items: [
      { label: "Dashboard",       route: "/CRM/Home" },
      { label: "Client Desk",     route: "/CRM/ClientDesk" },
      { label: "Contracts",       route: "/CRM/Contracts", requiresAny: ["contracts.*", "crm.*"] },
      { label: "Opportunities",   route: "/CRM/Opportunities" },
      { label: "Interactions",    route: "/CRM/Interactions" },
      { label: "Reports",         route: "/CRM/Reports" },
      { label: "Integrations",    route: "/CRM/Integrations" },
      { label: "Demo Overview",   route: "/CRM/Demo" }
    ] 
  },
  { 
    label: "Projects", 
    items: [ 
      { label: "Project Board", route: "/Projects/Board" },
      { label: "Assignments", route: "/Projects/Assignments" },
      { label: "Tasks", route: "/Projects/Tasks" },
      { label: "Bench", route: "/Projects/Bench", requiresAny: ["bench.*", "projects.bench.read"] },
      { label: "Client Desk", route: "/CRM/ClientDesk" },
      { label: "Reports", route: "/Projects/Reports" }
    ] 
  },
  { 
    label: "Org", 
    items: [
      { label: "Employee Directory", route: "/Org/EmployeeDirectory" },
      { label: "Org Structure",      route: "/Org/OrgStructure" },
      { label: "Policy Hub",         route: "/Org/PolicyHub" }
    ] 
  },
  {
    label: "Reports",
    requiresAny: ["reports.read", "reports.*"],
    items: [
      { label: "Dashboard", route: "/Reports/Dashboard", requiresAny: ["reports.read"] },
      { label: "Custom Reports", route: "/Reports/Builder", requiresAny: ["reports.create"] },
      { label: "Scheduled", route: "/Reports/Scheduled", requiresAny: ["reports.schedule"] }
    ]
  },
  {
    label: "Analytics",
    requiresAny: ["analytics.read", "analytics.*", "reports.*"],
    items: [
      { label: "Dashboard", route: "/Analytics/Dashboard", requiresAny: ["analytics.read"] },
      { label: "Business Intelligence", route: "/Analytics/BI", requiresAny: ["analytics.advanced"] },
      { label: "Forecasting", route: "/Analytics/Forecasting", requiresAny: ["analytics.projections"] }
    ]
  },
  { 
    label: "HR", 
    requiresAny: ["hr.*", "employees.*", "leave.*", "attendance.*"],
    items: [
      { label: "Performance",     route: "/HR/Performance" },
      { label: "Leave",           route: "/HR/Leave" },
      { label: "Attendance",      route: "/HR/Attendance" },
      { label: "Recognition",     route: "/HR/Recognition" },
      { label: "Expenses",        route: "/HR/Expenses" },
      { label: "Learning",        route: "/HR/Learning" },
      { label: "IJP",             route: "/HR/IJP" },
      { label: "Helpdesk",        route: "/HR/Helpdesk" },
      { label: "On/Offboarding",  route: "/HR/OnOffboarding" },
      { label: "Reports",         route: "/HR/Reports" }
    ] 
  },
  { 
    label: "Finance", 
    requiresAny: ["finance.*", "payroll.*"],
    items: [
      { label: "Payroll", route: "/Finance/Payroll" },
      { label: "Invoices", route: "/Finance/Invoices", requiresAny: ["finance.invoices.*", "finance.*"] }
    ] 
  },
  { 
    label: "IT", 
    requiresAny: ["it.*", "helpdesk.dashboard.read"],
    items: [ 
      { label: "Helpdesk", route: "/IT/Helpdesk" } 
    ] 
  },
  { 
    label: "Admin", 
    requiresAny: ["admin.*", "*"],
    items: [
      { label: "Tenant",       route: "/Admin/Tenant" },
      { label: "Access",       route: "/Admin/Access" },
      { label: "Integrations", route: "/Admin/Integrations" },
      { label: "Audit",        route: "/Admin/Audit" },
      { label: "Security",     route: "/Admin/Security" }
    ] 
  }
];