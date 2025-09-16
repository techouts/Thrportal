export type MenuItem = { 
  label: string; 
  route: string; 
  requiresAny?: string[] 
};

export type MenuSection = { 
  label: string; 
  requiresAny?: string[]; 
  items?: MenuItem[] 
};

export const MENU: MenuSection[] = [
  { 
    label: "Home", 
    items: [ 
      { label: "Home", route: "/Home" } 
    ] 
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
    requiresAny: ["team.management.read"],
    items: [
      { label: "Dashboard",       route: "/MyTeam/Dashboard", requiresAny: ["team.management.read"] },
      { label: "Leave",           route: "/MyTeam/Leave", requiresAny: ["team.leave.read"] },
      { label: "Attendance",      route: "/MyTeam/Attendance", requiresAny: ["team.attendance.read"] },
      { label: "Timesheet",       route: "/MyTeam/Timesheet", requiresAny: ["team.timesheets.read"] },
      { label: "Expenses",        route: "/MyTeam/Expenses", requiresAny: ["team.expenses.read"] },
      { label: "Performance",     route: "/MyTeam/Performance", requiresAny: ["team.performance.read"] },
      { label: "Recognition",     route: "/MyTeam/Recognition", requiresAny: ["team.recognition.read"] },
      { label: "Learning",        route: "/MyTeam/Learning", requiresAny: ["team.learning.read"] },
      { label: "Profile Changes", route: "/MyTeam/ProfileChanges", requiresAny: ["team.profile_changes.read"] },
      { label: "IJP",             route: "/MyTeam/IJP", requiresAny: ["team.ijp.read"] }
    ] 
  },
  { 
    label: "Hiring", 
    requiresAny: ["hiring.read"],
    items: [
      { label: "Dashboard",       route: "/Hiring/Dashboard", requiresAny: ["hiring.dashboard.read"] },
      { label: "JDs",             route: "/Hiring/JDs", requiresAny: ["hiring.jds.read"] },
      { label: "Approvals",       route: "/Hiring/Approvals", requiresAny: ["hiring.approvals.read"] },
      { label: "Candidates",      route: "/Hiring/Candidates", requiresAny: ["hiring.candidates.read"] },
      { label: "Ownership",       route: "/Hiring/Ownership", requiresAny: ["hiring.ownership.read"] },
      { label: "Applications",    route: "/Hiring/Applications", requiresAny: ["hiring.applications.read"] },
      { label: "Pipeline",        route: "/Hiring/Pipeline", requiresAny: ["hiring.pipeline.read"] },
      { label: "FollowUp",        route: "/Hiring/FollowUp", requiresAny: ["hiring.followup.read"] },
      { label: "Settings",        route: "/Hiring/Settings", requiresAny: ["hiring.settings.read"] }
    ] 
  },
  { 
    label: "CRM", 
    requiresAny: ["crm.read"],
    items: [
      { label: "Dashboard",       route: "/CRM/Home", requiresAny: ["crm.dashboard.read"] },
      { label: "Clients",         route: "/CRM/Clients", requiresAny: ["crm.clients.read"] },
      { label: "Accounts",        route: "/CRM/Accounts", requiresAny: ["crm.accounts.read"] },
      { label: "Projects",        route: "/CRM/Projects", requiresAny: ["crm.projects.read"] },
      { label: "Opportunities",   route: "/CRM/Opportunities", requiresAny: ["crm.opportunities.read"] },
      { label: "Interactions",    route: "/CRM/Interactions", requiresAny: ["crm.interactions.read"] },
      { label: "Reports",         route: "/CRM/Reports", requiresAny: ["crm.reports.read"] },
      { label: "Integrations",    route: "/CRM/Integrations", requiresAny: ["crm.integrations.read"] },
      { label: "Demo Overview",   route: "/CRM/Demo", requiresAny: ["crm.demo.read"] }
    ] 
  },
  { 
    label: "Projects", 
    requiresAny: ["projects.read"],
    items: [ 
      { label: "Dashboard", route: "/Projects/Dashboard", requiresAny: ["projects.dashboard.read"] },
      { label: "Clients", route: "/Projects/Clients", requiresAny: ["projects.clients.read"] },
      { label: "Projects", route: "/Projects/Projects", requiresAny: ["projects.projects.read"] },
      { label: "Assignments", route: "/Projects/Assignments", requiresAny: ["projects.assignments.read"] },
      { label: "Tasks", route: "/Projects/Tasks", requiresAny: ["projects.tasks.read"] },
      { label: "Bench", route: "/Projects/Bench", requiresAny: ["projects.bench.read"] }
    ] 
  },
  { 
    label: "Org", 
    items: [
      { label: "Employee Directory", route: "/Org/EmployeeDirectory", requiresAny: ["employees.read"] },
      { label: "Org Structure",      route: "/Org/OrgStructure", requiresAny: ["org.structure.read"] },
      { label: "Policy Hub",         route: "/Org/PolicyHub", requiresAny: ["org.policies.read"] }
    ] 
  },
  { 
    label: "HR", 
    requiresAny: ["hr.read"],
    items: [
      { label: "Performance",     route: "/HR/Performance", requiresAny: ["hr.performance.read"] },
      { label: "Leave",           route: "/HR/Leave", requiresAny: ["hr.leave.read"] },
      { label: "Attendance",      route: "/HR/Attendance", requiresAny: ["hr.attendance.read"] },
      { label: "Recognition",     route: "/HR/Recognition", requiresAny: ["hr.recognition.read"] },
      { label: "Expenses",        route: "/HR/Expenses", requiresAny: ["hr.expenses.read"] },
      { label: "Learning",        route: "/HR/Learning", requiresAny: ["hr.learning.read"] },
      { label: "IJP",             route: "/HR/IJP", requiresAny: ["hr.ijp.read"] },
      { label: "Helpdesk",        route: "/HR/Helpdesk", requiresAny: ["hr.helpdesk.read"] },
      { label: "On/Offboarding",  route: "/HR/OnOffboarding", requiresAny: ["hr.onboarding.read"] },
      { label: "Reports",         route: "/HR/Reports", requiresAny: ["hr.reports.read"] }
    ] 
  },
  { 
    label: "Finance", 
    requiresAny: ["finance.read"],
    items: [
      { label: "Payroll", route: "/Finance/Payroll", requiresAny: ["finance.payroll.read"] }
    ] 
  },
  { 
    label: "IT", 
    requiresAny: ["it.read"],
    items: [ 
      { label: "Helpdesk", route: "/IT/Helpdesk", requiresAny: ["it.helpdesk.read"] } 
    ] 
  },
  { 
    label: "Admin", 
    requiresAny: ["admin.read"],
    items: [
      { label: "Tenant",       route: "/Admin/Tenant", requiresAny: ["admin.tenant.read"] },
      { label: "Access",       route: "/Admin/Access", requiresAny: ["admin.access.read"] },
      { label: "Integrations", route: "/Admin/Integrations", requiresAny: ["admin.integrations.read"] },
      { label: "Audit",        route: "/Admin/Audit", requiresAny: ["admin.audit.read"] },
      { label: "Security",     route: "/Admin/Security", requiresAny: ["admin.security.read"] }
    ] 
  }
];