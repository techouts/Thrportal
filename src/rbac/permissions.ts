export type Permission = string; // e.g., "attendance.read", "payroll.export"

export const roleToPermissionPatterns: Record<string, string[]> = {
  ADMIN: ["*"],

  MANAGEMENT: [
    "portal.announcements.read",
    "employees.directory.read","employees.analytics.read","employees.read",
    "leave.reports.read","attendance.reports.read",
    "performance.cycles.read","performance.reviews.read",
    "projects.*.read","timesheets.*.read","timesheets.export.*",
    "hiring.dashboard.read","hiring.requisitions.read","applications.pipeline.read","applications.submissions.*",
    "finance.payroll.read","finance.reports.read",
    "jds.approve.management","jds.reports.read","crm.kpis.read"
    // no admin/security/roles/integrations
  ],

  VIEWER: [
    "portal.announcements.read",
    "employees.directory.read","employees.read",        // server will redacted PII where needed
    "leave.reports.read","attendance.reports.read",
    "projects.*.read","hiring.requisitions.read","applications.pipeline.read","applications.submissions.*",
    "finance.reports.read"                                // no exports, no bank files
  ],

  EMPLOYEE: [
    "portal.announcements.read",
    "employees.read",
    "attendance.read","attendance.clock_in","attendance.logs.read",
    "leave.requests.*","leave.balance.read",
    "timesheets.read","timesheets.submit",
    "finance.payslips.read","finance.payslips.download","finance.tax_declarations.read","finance.investment_planner.read",
    "performance.goals.*","performance.feedback_requests.*",
    "ijp.postings.read","ijp.applications.create",
    "helpdesk.tickets.read_own","helpdesk.tickets.create"
  ],

  MANAGER: [
    "portal.announcements.read",
    "employees.read","employees.update",
    "attendance.read","attendance.clock_in","attendance.team.read","attendance.approvals.*",
    "leave.requests.*","leave.balance.read","leave.team.calendar.read","leave.approvals.*",
    "timesheets.read","timesheets.approvals.*","timesheets.projects.read",
    "finance.payslips.read","finance.tax_declarations.read","finance.investment_planner.read","finance.audit_logs.read",
    "performance.goals.*","performance.feedback_requests.*","performance.reviews.create","performance.meetings.*",
    "ijp.postings.read","ijp.applications.read_team","ijp.applications.approve","ijp.applications.create",
    "hiring.dashboard.read","hiring.requisitions.read",
    "applications.pipeline.read","applications.submissions.*",
    "helpdesk.tickets.read_own","helpdesk.tickets.create"
  ],

  RECRUITER: [
    "portal.announcements.read",
    "hiring.dashboard.read","hiring.requisitions.read","hiring.requisitions.create",
    "applications.submissions.*","applications.pipeline.read",
    "interviews.schedule.*","bgv.cases.create","bgv.cases.read",
    "jds.create","jds.bulk_import","jds.smart_import",
    "candidates.create","resumes.create","applications.rank",
    "email.campaigns.send","ownership.assign","mapping.propose",
    "crm.interactions.*","followup.tasks.*"
  ],

  HIRING_MANAGER: [
    "portal.announcements.read",
    "hiring.dashboard.read","hiring.requisitions.approve","hiring.requisitions.read",
    "applications.pipeline.read","applications.submissions.*","offers.create","offers.approve",
    "bgv.cases.read","hiring.settings.*",
    "candidates.sensitive.read","jds.create","crm.read"
  ],

  STAFFING_MANAGER: [
    "portal.announcements.read",
    "hiring.dashboard.read","hiring.requisitions.read",
    "jds.approve.external","mapping.approve",
    "applications.pipeline.read","applications.submissions.*",
    "crm.kpis.read","crm.*","ownership.*"
  ],

  PROJECT_LEAD: [
    "portal.announcements.read",
    "projects.read","projects.*.read","projects.assignments.update",
    "timesheets.read","timesheets.approvals.*",
    "bench.requests.create","staffing.requests.create"
  ],

  DELIVERY_HEAD: [
    "portal.announcements.read",
    "projects.*","timesheets.*.read","timesheets.export.*","bench.*","staffing.*"
  ],

  HR_LEAD: [
    "portal.announcements.read",
    "employees.read","employees.letters.create",
    "leave.adjustments.update","attendance.adjustments.update",
    "onboarding.employees.read","offboarding.employees.read"
  ],

  HR_MANAGER: [
    "portal.announcements.read",
    "employees.*","leave.*","attendance.*",
    "onboarding.*","offboarding.*","performance.*",
    "policy.*","letters.*","bgv.*","ijp.*","payroll.runs.read",
    "hiring.*","applications.*","hiring.settings.*",
    "finance.audit_logs.read","helpdesk.dashboard.read","helpdesk.tickets.*",
    "jds.approve.internal","jds.publish","crm.kpis.read",
    "candidates.*","resumes.*","ownership.*"
  ],

  PAYROLL_SPECIALIST: [
    "portal.announcements.read",
    "payroll.runs.read","payroll.runs.create","payroll.runs.approve",
    "payroll.bank_file.generate","payroll.statutory.generate","finance.payslips.generate",
    "finance.payroll.read"
  ],

  FINANCE_ANALYST: [
    "portal.announcements.read",
    "finance.reports.read","finance.payroll.read","finance.jv.export","finance.audit_logs.read","payroll.runs.read",
    "employees.read","employees.directory.read"
  ],

  IT_HELPDESK: [
    "portal.announcements.read",
    "helpdesk.dashboard.read","helpdesk.tickets.read_queue",
    "helpdesk.tickets.assign","helpdesk.tickets.update_status"
  ],

  AUDITOR_RO: [
    "portal.announcements.read",
    "employees.read","leave.reports.read","attendance.reports.read",
    "finance.reports.read","payroll.runs.read"
  ],

  DPO_PRIVACY: [
    "portal.announcements.read",
    "privacy.dsr.read","privacy.dsr.fulfill","employees.pii.view","employees.pii.export"
  ]
};

export function matchPermission(patterns: string[], perm: Permission): boolean {
  if (patterns.includes("*")) return true;
  return patterns.some(p => {
    if (p.endsWith(".*")) { 
      const ns = p.slice(0,-2); 
      return perm === ns || perm.startsWith(ns+"."); 
    }
    return p === perm;
  });
}