import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import { Provider as JotaiProvider } from 'jotai';
import { RBACGuard } from "@/components/guards/RBACGuard";

// Import all page components
import PortalPage from "./pages/Portal/PortalPage";
import MePage from "./pages/Me/MePage";
import FinancePage from "./pages/Me/FinancePage";
import HiringPage from "./pages/Hiring/HiringPage";
import ProjectPage from "./pages/Project/ProjectPage";
import OrgPage from "./pages/Org/OrgPage";
import HRPage from "./pages/HR/HRPage";
import ManagementPage from "./pages/Management/ManagementPage";
import ReportsPage from "./pages/Reports/ReportsPage";
import AdminPage from "./pages/Admin/AdminPage";

// Import MyTeam and expense pages
import MyTeamPage from "./pages/MyTeam/MyTeamPage";
import ExpensesPage from "./pages/Me/ExpensesPage";
import TeamExpensesPage from "./pages/MyTeam/ExpensesPage";
import HRExpensesPage from "./pages/HR/ExpensesPage";

// Import IJP pages
import IJPPage from "./pages/Me/IJPPage";
import MyTeamIJPPage from "./pages/MyTeam/IJPPage";
import HRIJPPage from "./pages/HR/IJPPage";

// Import Leave pages
import LeavePage from "./pages/Me/LeavePage";
import MyTeamLeavePage from "./pages/MyTeam/LeavePage";
import HRLeavePage from "./pages/HR/LeavePage";

// Import Attendance pages
import AttendancePage from "./pages/Me/AttendancePage";
import MyTeamAttendancePage from "./pages/MyTeam/AttendancePage";
import HRAttendancePage from "./pages/HR/AttendancePage";

// Import Performance pages
import PerformancePage from "./pages/Me/PerformancePage";
import MyTeamPerformancePage from "./pages/MyTeam/PerformancePage";
import HRPerformancePage from "./pages/HR/PerformancePage";

// Import Learning pages
import LearningPage from "./pages/Me/LearningPage";
import MyTeamLearningPage from "./pages/MyTeam/LearningPage";
import HRLearningPage from "./pages/HR/LearningPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <JotaiProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <RBACGuard route="/Portal/Dashboard">
                <MainLayout>
                  <PortalPage />
                </MainLayout>
              </RBACGuard>
            } />
            
            {/* Portal Routes */}
            <Route path="/Portal/Dashboard" element={
              <RBACGuard route="/Portal/Dashboard">
                <MainLayout>
                  <PortalPage />
                </MainLayout>
              </RBACGuard>
            } />
            
            {/* Me Routes */}
            <Route path="/Me/Dashboard" element={
              <RBACGuard route="/Me/Dashboard">
                <MainLayout>
                  <MePage defaultTab="Dashboard" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Me/Profile" element={
              <RBACGuard route="/Me/Profile">
                <MainLayout>
                  <MePage defaultTab="Profile" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Me/Attendance" element={
              <RBACGuard route="/Me/Attendance">
                <MainLayout>
                  <AttendancePage />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Me/Leave" element={
              <RBACGuard route="/Me/Leave">
                <MainLayout>
                  <LeavePage />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Me/Timesheet" element={
              <RBACGuard route="/Me/Timesheet">
                <MainLayout>
                  <MePage defaultTab="Timesheet" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Me/Expenses" element={
              <RBACGuard route="/Me/Expenses">
                <MainLayout>
                  <ExpensesPage />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Me/Performance" element={
              <RBACGuard route="/Me/Performance">
                <MainLayout>
                  <MePage defaultTab="Performance" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Me/IJP" element={
              <RBACGuard route="/Me/IJP">
                <MainLayout>
                  <IJPPage />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Me/Referrals" element={
              <RBACGuard route="/Me/Referrals">
                <MainLayout>
                  <MePage defaultTab="Referrals" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Me/Helpdesk" element={
              <RBACGuard route="/Me/Helpdesk">
                <MainLayout>
                  <MePage defaultTab="Helpdesk" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Me/Finance" element={
              <RBACGuard route="/Me/Finance">
                <MainLayout>
                  <FinancePage />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Me/Learning" element={
              <RBACGuard route="/Me/Learning">
                <MainLayout>
                  <LearningPage />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/MyTeam/Learning" element={
              <RBACGuard route="/MyTeam/Learning">
                <MainLayout>
                  <MyTeamLearningPage />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/HR/Learning" element={
              <RBACGuard route="/HR/Learning">
                <MainLayout>
                  <HRLearningPage />
                </MainLayout>
              </RBACGuard>
            } />

            {/* MyTeam Routes */}
            <Route path="/MyTeam/Dashboard" element={
              <RBACGuard route="/MyTeam/Dashboard">
                <MainLayout>
                  <MyTeamPage defaultTab="Dashboard" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/MyTeam/Leave" element={
              <RBACGuard route="/MyTeam/Leave">
                <MainLayout>
                  <MyTeamLeavePage />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/MyTeam/Attendance" element={
              <RBACGuard route="/MyTeam/Attendance">
                <MainLayout>
                  <MyTeamAttendancePage />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/MyTeam/Timesheet" element={
              <RBACGuard route="/MyTeam/Timesheet">
                <MainLayout>
                  <MyTeamPage defaultTab="Timesheet" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/MyTeam/Expenses" element={
              <RBACGuard route="/MyTeam/Expenses">
                <MainLayout>
                  <TeamExpensesPage />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/MyTeam/Performance" element={
              <RBACGuard route="/MyTeam/Performance">
                <MainLayout>
                  <MyTeamPage defaultTab="Performance" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/MyTeam/ProfileChanges" element={
              <RBACGuard route="/MyTeam/ProfileChanges">
                <MainLayout>
                  <MyTeamPage defaultTab="ProfileChanges" />
                </MainLayout>
              </RBACGuard>
            } />

            <Route path="/MyTeam/IJP" element={
              <RBACGuard route="/MyTeam/IJP">
                <MainLayout>
                  <MyTeamIJPPage />
                </MainLayout>
              </RBACGuard>
            } />

            {/* Hiring Routes */}
            <Route path="/Hiring/Dashboard" element={
              <RBACGuard route="/Hiring/Dashboard">
                <MainLayout>
                  <HiringPage defaultTab="Dashboard" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Hiring/JobRequisitions" element={
              <RBACGuard route="/Hiring/JobRequisitions">
                <MainLayout>
                  <HiringPage defaultTab="JobRequisitions" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Hiring/Assignment" element={
              <RBACGuard route="/Hiring/Assignment">
                <MainLayout>
                  <HiringPage defaultTab="Assignment" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Hiring/Applications" element={
              <RBACGuard route="/Hiring/Applications">
                <MainLayout>
                  <HiringPage defaultTab="Applications" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Hiring/Pipeline" element={
              <RBACGuard route="/Hiring/Pipeline">
                <MainLayout>
                  <HiringPage defaultTab="Pipeline" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Hiring/FollowUp" element={
              <RBACGuard route="/Hiring/FollowUp">
                <MainLayout>
                  <HiringPage defaultTab="FollowUp" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Hiring/BGV" element={
              <RBACGuard route="/Hiring/BGV">
                <MainLayout>
                  <HiringPage defaultTab="BGV" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Hiring/Settings" element={
              <RBACGuard route="/Hiring/Settings">
                <MainLayout>
                  <HiringPage defaultTab="Settings" />
                </MainLayout>
              </RBACGuard>
            } />

            {/* Project Routes */}
            <Route path="/Project/Dashboard" element={
              <RBACGuard route="/Project/Dashboard">
                <MainLayout>
                  <ProjectPage defaultTab="Dashboard" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Project/Clients" element={
              <RBACGuard route="/Project/Clients">
                <MainLayout>
                  <ProjectPage defaultTab="Clients" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Project/Projects" element={
              <RBACGuard route="/Project/Projects">
                <MainLayout>
                  <ProjectPage defaultTab="Projects" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Project/Assignments" element={
              <RBACGuard route="/Project/Assignments">
                <MainLayout>
                  <ProjectPage defaultTab="Assignments" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Project/Tasks" element={
              <RBACGuard route="/Project/Tasks">
                <MainLayout>
                  <ProjectPage defaultTab="Tasks" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Project/Bench" element={
              <RBACGuard route="/Project/Bench">
                <MainLayout>
                  <ProjectPage defaultTab="Bench" />
                </MainLayout>
              </RBACGuard>
            } />

            {/* Org Routes */}
            <Route path="/Org/EmployeeDirectory" element={
              <RBACGuard route="/Org/EmployeeDirectory">
                <MainLayout>
                  <OrgPage defaultTab="EmployeeDirectory" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Org/OrgStructure" element={
              <RBACGuard route="/Org/OrgStructure">
                <MainLayout>
                  <OrgPage defaultTab="OrgStructure" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Org/PolicyHub" element={
              <RBACGuard route="/Org/PolicyHub">
                <MainLayout>
                  <OrgPage defaultTab="PolicyHub" />
                </MainLayout>
              </RBACGuard>
            } />

            {/* HR Routes */}
            <Route path="/HR/Performance" element={
              <RBACGuard route="/HR/Performance">
                <MainLayout>
                  <HRPage defaultTab="Performance" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/HR/Leave" element={
              <RBACGuard route="/HR/Leave">
                <MainLayout>
                  <HRLeavePage />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/HR/Attendance" element={
              <RBACGuard route="/HR/Attendance">
                <MainLayout>
                  <HRAttendancePage />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/HR/Expenses" element={
              <RBACGuard route="/HR/Expenses">
                <MainLayout>
                  <HRExpensesPage />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/HR/Timesheet" element={
              <RBACGuard route="/HR/Timesheet">
                <MainLayout>
                  <HRPage defaultTab="Timesheet" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/HR/Hiring" element={
              <RBACGuard route="/HR/Hiring">
                <MainLayout>
                  <HRPage defaultTab="Hiring" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/HR/Succession" element={
              <RBACGuard route="/HR/Succession">
                <MainLayout>
                  <HRPage defaultTab="Succession" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/HR/OnOffboarding" element={
              <RBACGuard route="/HR/OnOffboarding">
                <MainLayout>
                  <HRPage defaultTab="OnOffboarding" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/HR/Reports" element={
              <RBACGuard route="/HR/Reports">
                <MainLayout>
                  <HRPage defaultTab="Reports" />
                </MainLayout>
              </RBACGuard>
            } />

            <Route path="/HR/IJP" element={
              <RBACGuard route="/HR/IJP">
                <MainLayout>
                  <HRIJPPage />
                </MainLayout>
              </RBACGuard>
            } />

            {/* Management Routes */}
            <Route path="/Management/Dashboard" element={
              <RBACGuard route="/Management/Dashboard">
                <MainLayout>
                  <ManagementPage defaultTab="Dashboard" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Management/Scorecards" element={
              <RBACGuard route="/Management/Scorecards">
                <MainLayout>
                  <ManagementPage defaultTab="Scorecards" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Management/Forecasts" element={
              <RBACGuard route="/Management/Forecasts">
                <MainLayout>
                  <ManagementPage defaultTab="Forecasts" />
                </MainLayout>
              </RBACGuard>
            } />

            {/* Reports Routes */}
            <Route path="/Reports/Mine" element={
              <RBACGuard route="/Reports/Mine">
                <MainLayout>
                  <ReportsPage defaultTab="Mine" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Reports/Shared" element={
              <RBACGuard route="/Reports/Shared">
                <MainLayout>
                  <ReportsPage defaultTab="Shared" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Reports/Builder" element={
              <RBACGuard route="/Reports/Builder">
                <MainLayout>
                  <ReportsPage defaultTab="Builder" />
                </MainLayout>
              </RBACGuard>
            } />

            {/* Admin Routes */}
            <Route path="/Admin/Tenant" element={
              <RBACGuard route="/Admin/Tenant">
                <MainLayout>
                  <AdminPage defaultTab="Tenant" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Admin/Access" element={
              <RBACGuard route="/Admin/Access">
                <MainLayout>
                  <AdminPage defaultTab="Access" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Admin/Integrations" element={
              <RBACGuard route="/Admin/Integrations">
                <MainLayout>
                  <AdminPage defaultTab="Integrations" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Admin/Audit" element={
              <RBACGuard route="/Admin/Audit">
                <MainLayout>
                  <AdminPage defaultTab="Audit" />
                </MainLayout>
              </RBACGuard>
            } />
            <Route path="/Admin/Security" element={
              <RBACGuard route="/Admin/Security">
                <MainLayout>
                  <AdminPage defaultTab="Security" />
                </MainLayout>
              </RBACGuard>
            } />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </JotaiProvider>
  </QueryClientProvider>
);

export default App;