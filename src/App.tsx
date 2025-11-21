import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from 'jotai';
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SignIn from "./pages/Auth/SignIn";
import SignOut from "./pages/Auth/SignOut";
import Forbidden from "./pages/Forbidden";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MainLayout } from "./components/layout/MainLayout";

// Import existing pages
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/Home/HomePage";
import MePage from "./pages/Me/MePage";
import MyTeamPage from "./pages/MyTeam/MyTeamPage";
import ManagementPage from "./pages/Management/ManagementPage";
import HiringPage from "./pages/Hiring/HiringPage";
import SchedulingPage from "./pages/Hiring/SchedulingPage";
import HiringSettingsPage from "./pages/Hiring/HiringSettingsPage";
import ProjectPage from "./pages/Project/ProjectPage";
import OrgPage from "./pages/Org/OrgPage";
import HRPage from "./pages/HR/HRPage";
import OnOffboardingPage from "./pages/HR/OnOffboardingPage";
import PayrollPage from "./pages/Finance/PayrollPage";
import HelpdeskPage from "./pages/IT/HelpdeskPage";
import AdminPage from "./pages/Admin/AdminPage";

// CRM Pages
import CRMHomePage from "./pages/CRM/CRMHomePage";
import CRMClientsPage from "./pages/CRM/CRMClientsPage";
import { CRMAccountsPage } from "./pages/CRM/CRMAccountsPage";
import { CRMProjectsPage } from "./pages/CRM/CRMProjectsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { CRMOpportunitiesPage } from "./pages/CRM/CRMOpportunitiesPage";
import { CRMInteractionsPage } from "./pages/CRM/CRMInteractionsPage";
import CRMReportsPage from "./pages/CRM/CRMReportsPage";
import { ProjectAssignmentsPage } from "./pages/Project/ProjectAssignmentsPage";
import { ProjectReportsPage } from "./pages/Project/ProjectReportsPage";
import { CRMContractsPage } from "./pages/CRM/CRMContractsPage";
import { ProjectContractsPage } from "./pages/Project/ProjectContractsPage";
import { FinanceInvoicesPage } from "./pages/Finance/FinanceInvoicesPage";
import { ClientDeskPage } from "./pages/CRM/ClientDeskPage";
import { ProjectBoardPage } from "./pages/Project/ProjectBoardPage";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <JotaiProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/Home" replace />} />
                <Route path="/Auth/SignIn" element={<SignIn />} />
                <Route path="/Auth/SignOut" element={<SignOut />} />
                <Route path="/403" element={<Forbidden />} />

                {/* Home */}
                <Route path="/Home" element={
                  <ProtectedRoute>
                    <MainLayout><HomePage /></MainLayout>
                  </ProtectedRoute>
                } />

                {/* Dashboard */}
                <Route path="/Dashboard" element={
                  <ProtectedRoute>
                    <MainLayout><DashboardPage /></MainLayout>
                  </ProtectedRoute>
                } />

                {/* Me Section */}
                <Route path="/Me/Dashboard" element={
                  <ProtectedRoute>
                    <MainLayout><MePage defaultTab="Dashboard" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Me/Profile" element={
                  <ProtectedRoute>
                    <MainLayout><MePage defaultTab="Profile" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Me/Attendance" element={
                  <ProtectedRoute required={["attendance.read"]}>
                    <MainLayout><MePage defaultTab="Attendance" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Me/Leave" element={
                  <ProtectedRoute required={["leave.requests.*"]}>
                    <MainLayout><MePage defaultTab="Leave" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Me/Timesheet" element={
                  <ProtectedRoute required={["timesheets.read"]}>
                    <MainLayout><MePage defaultTab="Timesheet" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Me/Expenses" element={
                  <ProtectedRoute required={["finance.tax_declarations.read"]}>
                    <MainLayout><MePage defaultTab="Expenses" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Me/Finance" element={
                  <ProtectedRoute required={["finance.payslips.read"]}>
                    <MainLayout><MePage defaultTab="Finance" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Me/Learning" element={
                  <ProtectedRoute required={["performance.goals.read"]}>
                    <MainLayout><MePage defaultTab="Learning" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Me/Recognition" element={
                  <ProtectedRoute required={["performance.feedback_requests.read"]}>
                    <MainLayout><MePage defaultTab="Recognition" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Me/IJP" element={
                  <ProtectedRoute required={["ijp.postings.read"]}>
                    <MainLayout><MePage defaultTab="IJP" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Me/Helpdesk" element={
                  <ProtectedRoute required={["helpdesk.tickets.read_own"]}>
                    <MainLayout><MePage defaultTab="Helpdesk" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Me/*" element={
                  <ProtectedRoute required={["employees.read"]}>
                    <MainLayout><MePage defaultTab="Dashboard" /></MainLayout>
                  </ProtectedRoute>
                } />

                {/* My Team Section */}
                <Route path="/MyTeam/Dashboard" element={
                  <ProtectedRoute required={["attendance.team.read"]}>
                    <MainLayout><MyTeamPage defaultTab="Dashboard" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/MyTeam/Leave" element={
                  <ProtectedRoute required={["leave.approvals.*"]}>
                    <MainLayout><MyTeamPage defaultTab="Leave" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/MyTeam/Attendance" element={
                  <ProtectedRoute required={["attendance.team.read"]}>
                    <MainLayout><MyTeamPage defaultTab="Attendance" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/MyTeam/Timesheet" element={
                  <ProtectedRoute required={["timesheets.approvals.*"]}>
                    <MainLayout><MyTeamPage defaultTab="Timesheet" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/MyTeam/Expenses" element={
                  <ProtectedRoute required={["finance.audit_logs.read"]}>
                    <MainLayout><MyTeamPage defaultTab="Expenses" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/MyTeam/Performance" element={
                  <ProtectedRoute required={["performance.reviews.create"]}>
                    <MainLayout><MyTeamPage defaultTab="Performance" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/MyTeam/Recognition" element={
                  <ProtectedRoute required={["performance.feedback_requests.read"]}>
                    <MainLayout><MyTeamPage defaultTab="Recognition" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/MyTeam/Learning" element={
                  <ProtectedRoute required={["performance.goals.read"]}>
                    <MainLayout><MyTeamPage defaultTab="Learning" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/MyTeam/ProfileChanges" element={
                  <ProtectedRoute required={["employees.update"]}>
                    <MainLayout><MyTeamPage defaultTab="ProfileChanges" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/MyTeam/IJP" element={
                  <ProtectedRoute required={["ijp.applications.read_team"]}>
                    <MainLayout><MyTeamPage defaultTab="IJP" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/MyTeam/*" element={
                  <ProtectedRoute required={["attendance.team.read", "leave.team.calendar.read", "performance.reviews.create"]}>
                    <MainLayout><MyTeamPage defaultTab="Dashboard" /></MainLayout>
                  </ProtectedRoute>
                } />

                {/* Management Section */}
                <Route path="/Management/Dashboard" element={
                  <ProtectedRoute required={["management.*", "ownership.*"]}>
                    <MainLayout><ManagementPage defaultTab="Dashboard" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Management/PrimaryQueues" element={
                  <ProtectedRoute required={["management.*", "ownership.*"]}>
                    <MainLayout><ManagementPage defaultTab="PrimaryQueues" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Management/Escalations" element={
                  <ProtectedRoute required={["management.*", "ownership.*"]}>
                    <MainLayout><ManagementPage defaultTab="Escalations" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Management/*" element={
                  <ProtectedRoute required={["management.*", "ownership.*"]}>
                    <MainLayout><ManagementPage defaultTab="Dashboard" /></MainLayout>
                  </ProtectedRoute>
                } />

                {/* Hiring Section */}
                <Route path="/Hiring/Dashboard" element={
                  <ProtectedRoute required={["hiring.dashboard.read"]}>
                    <MainLayout><HiringPage defaultTab="Dashboard" /></MainLayout>
                  </ProtectedRoute>
                } />
                {/* Legacy Job Requisitions redirect to JDs */}
                <Route path="/Hiring/JobRequisitions" element={<Navigate to="/Hiring/JDs" replace />} />
                <Route path="/Hiring/Requisitions" element={<Navigate to="/Hiring/JDs" replace />} />
                <Route path="/Hiring/Requisitions/:id" element={<Navigate to="/Hiring/JDs" replace />} />
                <Route path="/Hiring/JDs" element={
                  <ProtectedRoute required={["jds.create", "jds.read"]}>
                    <MainLayout><HiringPage defaultTab="JDs" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Hiring/Approvals" element={
                  <ProtectedRoute required={["jds.approve.internal", "jds.approve.external", "jds.approve.management"]}>
                    <MainLayout><HiringPage defaultTab="Approvals" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Hiring/Candidates" element={
                  <ProtectedRoute required={["candidates.create", "resumes.create", "applications.rank"]}>
                    <MainLayout><HiringPage defaultTab="Candidates" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Hiring/Ownership" element={
                  <ProtectedRoute required={["ownership.assign", "mapping.propose", "mapping.approve"]}>
                    <MainLayout><HiringPage defaultTab="Ownership" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Hiring/Assignment" element={<Navigate to="/Hiring/Ownership" replace />} />
                <Route path="/Hiring/Assignment/Manage" element={<Navigate to="/Hiring/Ownership" replace />} />
                <Route path="/Hiring/Assignment/Unassigned" element={<Navigate to="/Hiring/Ownership?view=unassigned" replace />} />
                <Route path="/Hiring/Assignment/Unattended" element={<Navigate to="/Hiring/Ownership?view=unattended" replace />} />
                <Route path="/Hiring/Assignment/Reports" element={<Navigate to="/Hiring/Ownership" replace />} />
                <Route path="/Hiring/Applications" element={
                  <ProtectedRoute required={["applications.pipeline.read"]}>
                    <MainLayout><HiringPage defaultTab="Applications" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Hiring/Pipeline" element={
                  <ProtectedRoute required={["applications.pipeline.read"]}>
                    <MainLayout><HiringPage defaultTab="Pipeline" /></MainLayout>
                  </ProtectedRoute>
                } />
                 <Route path="/Hiring/FollowUp" element={
                   <ProtectedRoute required={["applications.pipeline.read", "followup.tasks.*"]}>
                     <MainLayout><HiringPage defaultTab="FollowUp" /></MainLayout>
                   </ProtectedRoute>
                 } />
                 <Route path="/Hiring/Scheduling" element={
                   <ProtectedRoute required={["hiring.*", "applications.*"]}>
                     <MainLayout><SchedulingPage /></MainLayout>
                   </ProtectedRoute>
                 } />
                {/* New nested Hiring Settings routes */}
                <Route path="/Hiring/Settings" element={
                  <ProtectedRoute required={["hiring.settings.*"]}>
                    <MainLayout><HiringSettingsPage /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Hiring/Settings/:topTab" element={
                  <ProtectedRoute required={["hiring.settings.*"]}>
                    <MainLayout><HiringSettingsPage /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Hiring/Settings/:topTab/:subTab" element={
                  <ProtectedRoute required={["hiring.settings.*"]}>
                    <MainLayout><HiringSettingsPage /></MainLayout>
                  </ProtectedRoute>
                } />
                
                {/* Legacy Hiring Settings redirects */}
                <Route path="/Hiring/Settings/Targets" element={<Navigate to="/Hiring/Settings/performance/targets?redirected=true" replace />} />
                <Route path="/Hiring/Settings/Approval-Rules" element={<Navigate to="/Hiring/Settings/workflow/approvals?redirected=true" replace />} />
                <Route path="/Hiring/Settings/JD-Parser" element={<Navigate to="/Hiring/Settings/content/parser?redirected=true" replace />} />
                <Route path="/Hiring/Settings/Offer-Matrix" element={<Navigate to="/Hiring/Settings/content/offers?redirected=true" replace />} />
                <Route path="/Hiring/Settings/SLA" element={<Navigate to="/Hiring/Settings/workflow/sla?redirected=true" replace />} />
                <Route path="/Hiring/Settings/Rejection-Reasons" element={<Navigate to="/Hiring/Settings/content/reject-reasons?redirected=true" replace />} />
                <Route path="/Hiring/Settings/Feedback-Followups" element={<Navigate to="/Hiring/Settings/workflow/feedback?redirected=true" replace />} />
                <Route path="/Hiring/Settings/Compliance-Vendors" element={<Navigate to="/Hiring/Settings/compliance/vendors?redirected=true" replace />} />
                <Route path="/Hiring/Settings/Global-Defaults" element={<Navigate to="/Hiring/Settings/defaults/global?redirected=true" replace />} />
                <Route path="/Hiring/Pipeline/Settings" element={<Navigate to="/Hiring/Settings/workflow/pipeline?redirected=true" replace />} />
                <Route path="/Hiring/*" element={
                  <ProtectedRoute required={["jds.create", "jds.read"]}>
                    <MainLayout><HiringPage defaultTab="JDs" /></MainLayout>
                  </ProtectedRoute>
                } />

                {/* CRM Section */}
                <Route path="/CRM/ClientDesk" element={
                  <ProtectedRoute required={["crm.read"]}>
                    <MainLayout><ClientDeskPage /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/CRM/Contracts" element={
                  <ProtectedRoute required={["contracts.*"]}>
                    <MainLayout><CRMContractsPage /></MainLayout>
                  </ProtectedRoute>
                } />
                
                {/* Legacy CRM redirects to Client Desk */}
                <Route path="/CRM/Clients" element={<Navigate to="/CRM/ClientDesk" replace />} />
                <Route path="/CRM/Accounts" element={<Navigate to="/CRM/ClientDesk" replace />} />
                <Route path="/CRM/Projects" element={<Navigate to="/CRM/ClientDesk" replace />} />
                <Route path="/CRM/SPOCs" element={<Navigate to="/CRM/ClientDesk" replace />} />
                
                <Route path="/CRM/*" element={
                  <ProtectedRoute required={["crm.read"]}>
                    <MainLayout><CRMHomePage /></MainLayout>
                  </ProtectedRoute>
                } />

                {/* Projects */}
                <Route path="/Projects" element={<Navigate to="/Projects/Board" replace />} />
                <Route path="/Projects/Board" element={
                  <ProtectedRoute required={["projects.read"]}>
                    <MainLayout><ProjectBoardPage /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Projects/Contracts" element={
                  <ProtectedRoute required={["projects.contracts.read"]}>
                    <MainLayout><ProjectContractsPage /></MainLayout>
                  </ProtectedRoute>
                } />
                
                {/* Legacy Projects redirects to Client Desk */}
                <Route path="/Projects/Dashboard" element={<Navigate to="/Projects/Board" replace />} />
                <Route path="/Projects/Clients" element={<Navigate to="/CRM/ClientDesk" replace />} />
                <Route path="/Projects/Projects" element={<Navigate to="/CRM/ClientDesk" replace />} />
                <Route path="/Projects/Assignments" element={
                  <ProtectedRoute required={["projects.read"]}>
                    <MainLayout><ProjectAssignmentsPage /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Projects/Reports" element={
                  <ProtectedRoute required={["projects.read"]}>
                    <MainLayout><ProjectReportsPage /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Projects/Tasks" element={
                  <ProtectedRoute required={["projects.read"]}>
                    <MainLayout><ProjectPage defaultTab="Tasks" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Projects/Bench" element={
                  <ProtectedRoute required={["projects.read"]}>
                    <MainLayout><ProjectPage defaultTab="Bench" /></MainLayout>
                  </ProtectedRoute>
                } />

                {/* Organization */}
                <Route path="/Org/*" element={
                  <ProtectedRoute required={["employees.directory.read", "employees.read"]}>
                    <MainLayout><OrgPage defaultTab="Structure" /></MainLayout>
                  </ProtectedRoute>
                } />

                {/* HR Section */}
                <Route path="/HR/Performance" element={
                  <ProtectedRoute required={["performance.cycles.create"]}>
                    <MainLayout><HRPage defaultTab="Performance" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/HR/Leave" element={
                  <ProtectedRoute required={["leave.policies.read"]}>
                    <MainLayout><HRPage defaultTab="Leave" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/HR/Attendance" element={
                  <ProtectedRoute required={["attendance.policies.read"]}>
                    <MainLayout><HRPage defaultTab="Attendance" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/HR/Recognition" element={
                  <ProtectedRoute required={["performance.feedback_requests.read"]}>
                    <MainLayout><HRPage defaultTab="Recognition" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/HR/Expenses" element={
                  <ProtectedRoute required={["finance.audit_logs.read"]}>
                    <MainLayout><HRPage defaultTab="Expenses" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/HR/Learning" element={
                  <ProtectedRoute required={["performance.goals.read"]}>
                    <MainLayout><HRPage defaultTab="Learning" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/HR/IJP" element={
                  <ProtectedRoute required={["ijp.postings.read"]}>
                    <MainLayout><HRPage defaultTab="IJP" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/HR/Helpdesk" element={
                  <ProtectedRoute required={["helpdesk.dashboard.read"]}>
                    <MainLayout><HRPage defaultTab="Helpdesk" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/HR/OnOffboarding" element={
                  <ProtectedRoute required={["onboarding.*"]}>
                    <MainLayout><OnOffboardingPage /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/HR/Reports" element={
                  <ProtectedRoute required={["leave.reports.read"]}>
                    <MainLayout><HRPage defaultTab="Reports" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/HR/*" element={
                  <ProtectedRoute required={["employees.*"]}>
                    <MainLayout><HRPage defaultTab="Performance" /></MainLayout>
                  </ProtectedRoute>
                } />
                
                {/* Reports */}
                <Route path="/Reports" element={<Navigate to="/Reports/Dashboard" replace />} />
                <Route path="/Reports/Dashboard" element={
                  <ProtectedRoute required={["reports.read"]}>
                    <MainLayout><ReportsPage /></MainLayout>
                  </ProtectedRoute>
                } />

                {/* Analytics */}
                <Route path="/Analytics" element={<Navigate to="/Analytics/Dashboard" replace />} />
                <Route path="/Analytics/Dashboard" element={
                  <ProtectedRoute required={["analytics.read"]}>
                    <MainLayout><AnalyticsPage /></MainLayout>
                  </ProtectedRoute>
                } />
                {/* Finance */}
                <Route path="/Finance/Invoices" element={
                  <ProtectedRoute required={["finance.invoices.*"]}>
                    <MainLayout><FinanceInvoicesPage /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Finance/*" element={
                  <ProtectedRoute required={["finance.reports.read"]}>
                    <MainLayout><PayrollPage /></MainLayout>
                  </ProtectedRoute>
                } />

                {/* IT */}
                <Route path="/IT/*" element={
                  <ProtectedRoute required={["helpdesk.dashboard.read"]}>
                    <MainLayout><HelpdeskPage /></MainLayout>
                  </ProtectedRoute>
                } />

                {/* Admin */}
                <Route path="/Admin/*" element={
                  <ProtectedRoute required={["*"]}>
                    <MainLayout><AdminPage defaultTab="Tenant" /></MainLayout>
                  </ProtectedRoute>
                } />

                {/* Global wildcard redirects for legacy maintenance routes */}
                <Route path="/*/Clients" element={<Navigate to="/CRM/ClientDesk" replace />} />
                <Route path="/*/Accounts" element={<Navigate to="/CRM/ClientDesk" replace />} />
                <Route path="/*/Projects" element={<Navigate to="/CRM/ClientDesk" replace />} />
                <Route path="/*/SPOCs" element={<Navigate to="/CRM/ClientDesk" replace />} />

                {/* Catch all for 404 */}
                <Route path="*" element={<Navigate to="/403" replace />} />
              </Routes>
              <Toaster />
              <Sonner />
            </BrowserRouter>
          </AuthProvider>
        </JotaiProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;