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
import HiringPage from "./pages/Hiring/HiringPage";
import ProjectPage from "./pages/Project/ProjectPage";
import OrgPage from "./pages/Org/OrgPage";
import HRPage from "./pages/HR/HRPage";
import PayrollPage from "./pages/Finance/PayrollPage";
import HelpdeskPage from "./pages/IT/HelpdeskPage";
import AdminPage from "./pages/Admin/AdminPage";

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
                  <ProtectedRoute required={["portal.announcements.read"]}>
                    <MainLayout><DashboardPage /></MainLayout>
                  </ProtectedRoute>
                } />

                {/* Me Section */}
                <Route path="/Me/Dashboard" element={
                  <ProtectedRoute required={["portal.announcements.read"]}>
                    <MainLayout><MePage defaultTab="Dashboard" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Me/Profile" element={
                  <ProtectedRoute required={["employees.read"]}>
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

                {/* Hiring Section */}
                <Route path="/Hiring/Dashboard" element={
                  <ProtectedRoute required={["hiring.dashboard.read"]}>
                    <MainLayout><HiringPage defaultTab="Dashboard" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Hiring/JobRequisitions" element={
                  <ProtectedRoute required={["hiring.requisitions.read"]}>
                    <MainLayout><HiringPage defaultTab="JobRequisitions" /></MainLayout>
                  </ProtectedRoute>
                } />
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
                <Route path="/Hiring/Assignment" element={
                  <ProtectedRoute required={["applications.submissions.*"]}>
                    <MainLayout><HiringPage defaultTab="Assignment" /></MainLayout>
                  </ProtectedRoute>
                } />
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
                <Route path="/Hiring/BGV" element={
                  <ProtectedRoute required={["bgv.cases.read"]}>
                    <MainLayout><HiringPage defaultTab="BGV" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Hiring/Settings" element={
                  <ProtectedRoute required={["hiring.settings.*"]}>
                    <MainLayout><HiringPage defaultTab="Settings" /></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/Hiring/*" element={
                  <ProtectedRoute required={["hiring.dashboard.read"]}>
                    <MainLayout><HiringPage defaultTab="Dashboard" /></MainLayout>
                  </ProtectedRoute>
                } />

                {/* CRM Section */}
                <Route path="/CRM/Dashboard" element={
                  <ProtectedRoute required={["crm.kpis.read"]}>
                    <MainLayout><div>CRM Dashboard</div></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/CRM/Clients" element={
                  <ProtectedRoute required={["crm.clients.*"]}>
                    <MainLayout><div>CRM Clients</div></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/CRM/Accounts" element={
                  <ProtectedRoute required={["crm.accounts.*"]}>
                    <MainLayout><div>CRM Accounts</div></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/CRM/Projects" element={
                  <ProtectedRoute required={["crm.projects.*"]}>
                    <MainLayout><div>CRM Projects</div></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/CRM/Interactions" element={
                  <ProtectedRoute required={["crm.interactions.*"]}>
                    <MainLayout><div>CRM Interactions</div></MainLayout>
                  </ProtectedRoute>
                } />
                <Route path="/CRM/*" element={
                  <ProtectedRoute required={["crm.kpis.read"]}>
                    <MainLayout><div>CRM Dashboard</div></MainLayout>
                  </ProtectedRoute>
                } />

                {/* Projects */}
                <Route path="/Projects" element={
                  <ProtectedRoute required={["projects.read"]}>
                    <MainLayout><ProjectPage defaultTab="Dashboard" /></MainLayout>
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
                    <MainLayout><HRPage defaultTab="OnOffboarding" /></MainLayout>
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

                {/* Finance */}
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