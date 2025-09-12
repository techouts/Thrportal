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
                <Route path="/Me/*" element={
                  <ProtectedRoute required={["employees.read"]}>
                    <MainLayout><MePage defaultTab="Dashboard" /></MainLayout>
                  </ProtectedRoute>
                } />

                {/* My Team Section */}
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
                  <ProtectedRoute required={["applications.pipeline.read"]}>
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