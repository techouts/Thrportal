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
      { label: "Home", route: "/Home", requiresAny: ["portal.announcements.read"] } 
    ] 
  },
  { 
    label: "Me", 
    items: [
      { label: "Dashboard",  route: "/Me/Dashboard",  requiresAny: ["portal.announcements.read"] },
      { label: "Profile",    route: "/Me/Profile",    requiresAny: ["employees.read"] },
      { label: "Attendance", route: "/Me/Attendance", requiresAny: ["attendance.read","attendance.clock_in"] },
      { label: "Leave",      route: "/Me/Leave",      requiresAny: ["leave.requests.*","leave.balance.read"] },
      { label: "Timesheet",  route: "/Me/Timesheet",  requiresAny: ["timesheets.read"] },
      { label: "Expenses",   route: "/Me/Expenses",   requiresAny: ["finance.tax_declarations.read","finance.investment_planner.read"] },
      { label: "Finance",    route: "/Me/Finance",    requiresAny: ["finance.payslips.read"] },
      { label: "Learning",   route: "/Me/Learning",   requiresAny: ["performance.goals.read"] },
      { label: "Recognition",route: "/Me/Recognition",requiresAny: ["performance.feedback_requests.read"] },
      { label: "IJP",        route: "/Me/IJP",        requiresAny: ["ijp.postings.read"] },
      { label: "Helpdesk",   route: "/Me/Helpdesk",   requiresAny: ["helpdesk.tickets.read_own"] }
    ] 
  },
  { 
    label: "My Team", 
    requiresAny: ["attendance.team.read","leave.team.calendar.read","performance.reviews.create"], 
    items: [
      { label: "Dashboard",      route: "/MyTeam/Dashboard",     requiresAny: ["attendance.team.read","leave.team.calendar.read"] },
      { label: "Leave",          route: "/MyTeam/Leave",         requiresAny: ["leave.approvals.*","leave.team.calendar.read"] },
      { label: "Attendance",     route: "/MyTeam/Attendance",    requiresAny: ["attendance.team.read"] },
      { label: "Timesheet",      route: "/MyTeam/Timesheet",     requiresAny: ["timesheets.approvals.*","timesheets.projects.read"] },
      { label: "Expenses",       route: "/MyTeam/Expenses",      requiresAny: ["finance.audit_logs.read"] },
      { label: "Performance",    route: "/MyTeam/Performance",   requiresAny: ["performance.reviews.create"] },
      { label: "Recognition",    route: "/MyTeam/Recognition",   requiresAny: ["performance.feedback_requests.read"] },
      { label: "Learning",       route: "/MyTeam/Learning",      requiresAny: ["performance.goals.read"] },
      { label: "Profile Changes",route: "/MyTeam/ProfileChanges",requiresAny: ["employees.update"] },
      { label: "IJP",            route: "/MyTeam/IJP",           requiresAny: ["ijp.applications.read_team"] }
    ] 
  },
  { 
    label: "Hiring", 
    requiresAny: ["hiring.requisitions.read","applications.pipeline.read"], 
    items: [
      { label: "Dashboard",       route: "/Hiring/Dashboard",       requiresAny: ["hiring.dashboard.read","hiring.requisitions.read"] },
      { label: "Job Requisitions",route: "/Hiring/JobRequisitions", requiresAny: ["hiring.requisitions.read"] },
      { label: "Assignment",      route: "/Hiring/Assignment",      requiresAny: ["applications.submissions.*"] },
      { label: "Applications",    route: "/Hiring/Applications",    requiresAny: ["applications.pipeline.read"] },
      { label: "Pipeline",        route: "/Hiring/Pipeline",        requiresAny: ["applications.pipeline.read"] },
      { label: "FollowUp",        route: "/Hiring/FollowUp",        requiresAny: ["applications.pipeline.read"] },
      { label: "BGV",             route: "/Hiring/BGV",             requiresAny: ["bgv.cases.read"] },
      { label: "Settings",        route: "/Hiring/Settings",        requiresAny: ["hiring.settings.*"] },
      { label: "Offers (HM)",     route: "/Hiring/Offers",          requiresAny: ["offers.create","offers.approve","candidates.sensitive.read"] }
    ] 
  },
  { 
    label: "Projects", 
    items: [ 
      { label: "Dashboard", route: "/Projects", requiresAny: ["projects.read","projects.*.read"] } 
    ] 
  },
  { 
    label: "Org", 
    items: [
      { label: "Employee Directory", route: "/Org/EmployeeDirectory", requiresAny: ["employees.directory.read","employees.read"] },
      { label: "Org Structure",      route: "/Org/OrgStructure",      requiresAny: ["employees.read"] },
      { label: "Policy Hub",         route: "/Org/PolicyHub",         requiresAny: ["portal.announcements.read"] }
    ] 
  },
  { 
    label: "HR", 
    requiresAny: ["leave.policies.read","attendance.policies.read","performance.cycles.create","employees.*"], 
    items: [
      { label: "Performance",   route: "/HR/Performance",   requiresAny: ["performance.cycles.create"] },
      { label: "Leave",         route: "/HR/Leave",         requiresAny: ["leave.policies.read"] },
      { label: "Attendance",    route: "/HR/Attendance",    requiresAny: ["attendance.policies.read"] },
      { label: "Recognition",   route: "/HR/Recognition",   requiresAny: ["performance.feedback_requests.read"] },
      { label: "Expenses",      route: "/HR/Expenses",      requiresAny: ["finance.audit_logs.read"] },
      { label: "Learning",      route: "/HR/Learning",      requiresAny: ["performance.goals.read"] },
      { label: "IJP",           route: "/HR/IJP",           requiresAny: ["ijp.postings.read"] },
      { label: "Helpdesk",      route: "/HR/Helpdesk",      requiresAny: ["helpdesk.dashboard.read"] },
      { label: "On/Offboarding",route: "/HR/OnOffboarding", requiresAny: ["onboarding.*","offboarding.*","onboarding.employees.read","offboarding.employees.read"] },
      { label: "Reports",       route: "/HR/Reports",       requiresAny: ["leave.reports.read","attendance.reports.read"] }
    ] 
  },
  { 
    label: "Finance", 
    requiresAny: ["finance.reports.read","payroll.runs.read"], 
    items: [
      { label: "Payroll", route: "/Finance/Payroll", requiresAny: ["payroll.runs.read","finance.reports.read"] }
    ] 
  },
  { 
    label: "IT", 
    requiresAny: ["helpdesk.dashboard.read"], 
    items: [ 
      { label: "Helpdesk", route: "/IT/Helpdesk", requiresAny: ["helpdesk.dashboard.read"] } 
    ] 
  },
  { 
    label: "Admin", 
    requiresAny: ["*"], 
    items: [
      { label: "Tenant",       route: "/Admin/Tenant",       requiresAny: ["*"] },
      { label: "Access",       route: "/Admin/Access",       requiresAny: ["*"] },
      { label: "Integrations", route: "/Admin/Integrations", requiresAny: ["*"] },
      { label: "Audit",        route: "/Admin/Audit",        requiresAny: ["*"] },
      { label: "Security",     route: "/Admin/Security",     requiresAny: ["*"] }
    ] 
  }
];