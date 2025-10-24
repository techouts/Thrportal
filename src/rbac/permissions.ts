export type Permission = string; // e.g., "attendance.read", "payroll.export"

export const roleToPermissionPatterns: Record<string, string[]> = {
  ADMIN: [
    "*",
    "admin.read","admin.tenant.read","admin.access.read",
    "admin.integrations.read","admin.audit.read","admin.security.read",
    "reports.*","analytics.*"
  ],

  MANAGEMENT: [
    "portal.announcements.read",
    "employees.directory.read","employees.analytics.read","employees.read",
    "leave.reports.read","attendance.reports.read",
    "performance.cycles.read","performance.reviews.read",
    "projects.*","timesheets.*.read","timesheets.export.*",
    "hiring.*","hiring.dashboard.read","hiring.requisitions.read",
    "applications.*","applications.pipeline.read","applications.submissions.*",
    "jds.*","jds.create","jds.read","jds.approve.management","jds.reports.read",
    "candidates.*","resumes.*","ownership.*",
    "finance.payroll.read","finance.reports.read",
    "crm.*","crm.integrations.read","crm.demo.read","crm.kpis.read",
    "reports.*","analytics.*"
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
    "employees.read","org.structure.read","org.policies.read",
    "attendance.read","attendance.clock_in","attendance.logs.read",
    "leave.requests.*","leave.balance.read","leave.requests.read",
    "timesheets.read","timesheets.submit",
    "expenses.read","expenses.submit",
    "finance.payslips.read","finance.payslips.download","finance.tax_declarations.read","finance.investment_planner.read",
    "performance.goals.*","performance.feedback_requests.*",
    "learning.read","recognition.read",
    "ijp.postings.read","ijp.applications.create",
    "helpdesk.tickets.read_own","helpdesk.tickets.create",
    "projects.read","projects.dashboard.read","projects.tasks.read","projects.assignments.read",
    "crm.projects.read"
  ],

  MANAGER: [
    "portal.announcements.read",
    "employees.read","employees.update","org.structure.read","org.policies.read",
    "team.management.read","team.leave.read","team.attendance.read","team.timesheets.read","team.expenses.read",
    "team.performance.read","team.recognition.read","team.learning.read","team.profile_changes.read","team.ijp.read",
    "attendance.read","attendance.clock_in","attendance.team.read","attendance.approvals.*",
    "leave.requests.*","leave.balance.read","leave.team.calendar.read","leave.approvals.*",
    "timesheets.read","timesheets.approvals.*","timesheets.projects.read",
    "finance.payslips.read","finance.tax_declarations.read","finance.investment_planner.read","finance.audit_logs.read",
    "performance.goals.*","performance.feedback_requests.*","performance.reviews.create","performance.meetings.*",
    "ijp.postings.read","ijp.applications.read_team","ijp.applications.approve","ijp.applications.create",
    "hiring.dashboard.read","hiring.requisitions.read",
    "applications.pipeline.read","applications.submissions.*",
    "helpdesk.tickets.read_own","helpdesk.tickets.create",
    "projects.read","projects.dashboard.read","projects.clients.read","projects.projects.read","projects.assignments.read","projects.tasks.read","projects.bench.read",
    "crm.projects.read","crm.projects.update","crm.clients.read",
    "reports.read","analytics.read"
  ],

  RECRUITER: [
    "portal.announcements.read",
    "hiring.read","hiring.dashboard.read","hiring.jds.read","hiring.candidates.read",
    "hiring.applications.read","hiring.pipeline.read","hiring.followup.read",
    "hiring.requisitions.read","hiring.requisitions.create",
    "applications.submissions.*","applications.pipeline.read",
    "interviews.schedule.*","bgv.cases.create","bgv.cases.read",
    "jds.create","jds.bulk_import","jds.smart_import",
    "candidates.create","resumes.create","applications.rank",
    "email.campaigns.send","ownership.assign","mapping.propose",
    "crm.interactions.*","crm.opportunities.*","followup.tasks.*"
  ],

  HIRING_MANAGER: [
    "portal.announcements.read",
    "hiring.read","hiring.dashboard.read","hiring.jds.read","hiring.approvals.read",
    "hiring.candidates.read","hiring.ownership.read","hiring.applications.read","hiring.pipeline.read",
    "hiring.followup.read","hiring.settings.read",
    "hiring.requisitions.approve","hiring.requisitions.read",
    "applications.pipeline.read","applications.submissions.*","offers.create","offers.approve",
    "bgv.cases.read","hiring.settings.*",
    "candidates.sensitive.read","candidates.create","resumes.create","applications.rank",
    "ownership.assign","mapping.propose","jds.create","crm.read"
  ],

  STAFFING_MANAGER: [
    "portal.announcements.read",
    "hiring.*","hiring.dashboard.read","hiring.requisitions.read","hiring.settings.*",
    "jds.*","jds.create","jds.read","jds.approve.external",
    "candidates.*","resumes.*","applications.*",
    "applications.pipeline.read","applications.submissions.*","applications.rank",
    "mapping.approve","ownership.*","crm.*"
  ],

  PROJECT_LEAD: [
    "portal.announcements.read",
    "projects.*","timesheets.read","timesheets.approvals.*",
    "bench.requests.create","staffing.requests.create",
    "crm.projects.*","crm.clients.read","crm.accounts.read",
    "crm.opportunities.read","crm.spocs.read","crm.interactions.create"
  ],

  DELIVERY_HEAD: [
    "portal.announcements.read",
    "projects.*","timesheets.*","bench.*","staffing.*",
    "crm.*","crm.reports.export","crm.analytics.read",
    "reports.*","analytics.*"
  ],

  HR_LEAD: [
    "portal.announcements.read",
    "employees.read","employees.letters.create",
    "leave.adjustments.update","attendance.adjustments.update",
    "onboarding.employees.read","offboarding.employees.read"
  ],

  HR_MANAGER: [
    "portal.announcements.read",
    "hr.read","hr.performance.read","hr.leave.read","hr.attendance.read",
    "hr.recognition.read","hr.expenses.read","hr.learning.read","hr.ijp.read",
    "hr.helpdesk.read","hr.onboarding.read","hr.reports.read",
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
    "finance.read","finance.payroll.read",
    "finance.reports.read","finance.jv.export","finance.audit_logs.read","payroll.runs.read",
    "employees.read","employees.directory.read"
  ],

  IT_HELPDESK: [
    "portal.announcements.read",
    "it.read","it.helpdesk.read",
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