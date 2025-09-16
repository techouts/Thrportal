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
    items: [
      { label: "Dashboard",      route: "/MyTeam/Dashboard" },
      { label: "Leave",          route: "/MyTeam/Leave" },
      { label: "Attendance",     route: "/MyTeam/Attendance" },
      { label: "Timesheet",      route: "/MyTeam/Timesheet" },
      { label: "Expenses",       route: "/MyTeam/Expenses" },
      { label: "Performance",    route: "/MyTeam/Performance" },
      { label: "Recognition",    route: "/MyTeam/Recognition" },
      { label: "Learning",       route: "/MyTeam/Learning" },
      { label: "Profile Changes",route: "/MyTeam/ProfileChanges" },
      { label: "IJP",            route: "/MyTeam/IJP" }
    ] 
  },
  { 
    label: "Hiring", 
    items: [
      { label: "Dashboard",       route: "/Hiring/Dashboard" },
      { label: "JDs",             route: "/Hiring/JDs" },
      { label: "Approvals",       route: "/Hiring/Approvals" },
      { label: "Candidates",      route: "/Hiring/Candidates" },
      { label: "Ownership",       route: "/Hiring/Ownership" },
      { label: "Applications",    route: "/Hiring/Applications" },
      { label: "Pipeline",        route: "/Hiring/Pipeline" },
      { label: "FollowUp",        route: "/Hiring/FollowUp" },
      { label: "Settings",        route: "/Hiring/Settings" }
    ] 
  },
  { 
    label: "CRM", 
    items: [
      { label: "Dashboard",       route: "/CRM/Home" },
      { label: "Clients",         route: "/CRM/Clients" },
      { label: "Accounts",        route: "/CRM/Accounts" },
      { label: "Projects",        route: "/CRM/Projects" },
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
      { label: "Dashboard", route: "/Projects/Dashboard" },
      { label: "Clients", route: "/Projects/Clients" },
      { label: "Projects", route: "/Projects/Projects" },
      { label: "Assignments", route: "/Projects/Assignments" },
      { label: "Tasks", route: "/Projects/Tasks" },
      { label: "Bench", route: "/Projects/Bench" }
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
    label: "HR", 
    items: [
      { label: "Performance",   route: "/HR/Performance" },
      { label: "Leave",         route: "/HR/Leave" },
      { label: "Attendance",    route: "/HR/Attendance" },
      { label: "Recognition",   route: "/HR/Recognition" },
      { label: "Expenses",      route: "/HR/Expenses" },
      { label: "Learning",      route: "/HR/Learning" },
      { label: "IJP",           route: "/HR/IJP" },
      { label: "Helpdesk",      route: "/HR/Helpdesk" },
      { label: "On/Offboarding",route: "/HR/OnOffboarding" },
      { label: "Reports",       route: "/HR/Reports" }
    ] 
  },
  { 
    label: "Finance", 
    items: [
      { label: "Payroll", route: "/Finance/Payroll" }
    ] 
  },
  { 
    label: "IT", 
    items: [ 
      { label: "Helpdesk", route: "/IT/Helpdesk" } 
    ] 
  },
  { 
    label: "Admin", 
    items: [
      { label: "Tenant",       route: "/Admin/Tenant" },
      { label: "Access",       route: "/Admin/Access" },
      { label: "Integrations", route: "/Admin/Integrations" },
      { label: "Audit",        route: "/Admin/Audit" },
      { label: "Security",     route: "/Admin/Security" }
    ] 
  }
];