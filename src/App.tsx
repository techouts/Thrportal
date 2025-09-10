import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import SignIn from "./pages/Auth/SignIn";
import SignOut from "./pages/Auth/SignOut";
import Forbidden from "./pages/Forbidden";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from 'jotai';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <JotaiProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/Auth/SignIn" replace />} />
                <Route path="/Auth/SignIn" element={<SignIn />} />
                <Route path="/Auth/SignOut" element={<SignOut />} />
                <Route path="/403" element={<Forbidden />} />

                <Route path="/Home" element={
                  <ProtectedRoute required={["portal.announcements.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Home Dashboard</h1>
                        <p className="text-muted-foreground">Welcome to the HRMS Portal</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Me/Dashboard" element={
                  <ProtectedRoute required={["portal.announcements.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">My Dashboard</h1>
                        <p className="text-muted-foreground">Your personal dashboard</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Me/Profile" element={
                  <ProtectedRoute required={["employees.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">My Profile</h1>
                        <p className="text-muted-foreground">Manage your personal information</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Me/Attendance" element={
                  <ProtectedRoute required={["attendance.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">My Attendance</h1>
                        <p className="text-muted-foreground">Attendance tracking and clock-in functionality</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Me/Leave" element={
                  <ProtectedRoute required={["leave.requests.*"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">My Leave</h1>
                        <p className="text-muted-foreground">Request and manage your leave</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Me/Timesheet" element={
                  <ProtectedRoute required={["timesheets.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">My Timesheet</h1>
                        <p className="text-muted-foreground">Log your working hours</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Me/Finance/Summary" element={
                  <ProtectedRoute required={["finance.payslips.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">My Finance</h1>
                        <p className="text-muted-foreground">View payslips and financial information</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Me/IJP" element={
                  <ProtectedRoute required={["ijp.postings.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Internal Job Postings</h1>
                        <p className="text-muted-foreground">Browse and apply for internal positions</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/MyTeam/Dashboard" element={
                  <ProtectedRoute required={["attendance.team.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Team Dashboard</h1>
                        <p className="text-muted-foreground">Overview of your team's activities</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/MyTeam/Leave" element={
                  <ProtectedRoute required={["leave.approvals.*"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Team Leave Management</h1>
                        <p className="text-muted-foreground">Manage your team's leave requests</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/MyTeam/Performance" element={
                  <ProtectedRoute required={["performance.reviews.create"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Team Performance</h1>
                        <p className="text-muted-foreground">Conduct performance reviews and meetings</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Hiring/Dashboard" element={
                  <ProtectedRoute required={["hiring.dashboard.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Hiring Dashboard</h1>
                        <p className="text-muted-foreground">Recruitment pipeline and analytics</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Hiring/JobRequisitions" element={
                  <ProtectedRoute required={["hiring.requisitions.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Job Requisitions</h1>
                        <p className="text-muted-foreground">Manage job openings and requirements</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Hiring/Applications" element={
                  <ProtectedRoute required={["applications.pipeline.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Applications</h1>
                        <p className="text-muted-foreground">Review candidate applications</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Hiring/BGV" element={
                  <ProtectedRoute required={["bgv.cases.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Background Verification</h1>
                        <p className="text-muted-foreground">Manage background verification cases</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Hiring/Offers" element={
                  <ProtectedRoute required={["offers.create"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Offers (Hiring Manager)</h1>
                        <p className="text-muted-foreground">Create and approve job offers</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Projects" element={
                  <ProtectedRoute required={["projects.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Projects Dashboard</h1>
                        <p className="text-muted-foreground">Manage projects and assignments</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Org/EmployeeDirectory" element={
                  <ProtectedRoute required={["employees.directory.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Employee Directory</h1>
                        <p className="text-muted-foreground">Browse company directory</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Org/OrgStructure" element={
                  <ProtectedRoute required={["employees.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Organization Structure</h1>
                        <p className="text-muted-foreground">View organizational hierarchy</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Org/PolicyHub" element={
                  <ProtectedRoute required={["portal.announcements.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Policy Hub</h1>
                        <p className="text-muted-foreground">Company policies and announcements</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/HR/Performance" element={
                  <ProtectedRoute required={["performance.cycles.create"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">HR Performance Management</h1>
                        <p className="text-muted-foreground">Manage performance cycles and reviews</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/HR/Leave" element={
                  <ProtectedRoute required={["leave.policies.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">HR Leave Management</h1>
                        <p className="text-muted-foreground">Manage leave policies and approvals</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/HR/Attendance" element={
                  <ProtectedRoute required={["attendance.policies.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">HR Attendance Management</h1>
                        <p className="text-muted-foreground">Manage attendance policies and tracking</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/HR/OnOffboarding" element={
                  <ProtectedRoute required={["onboarding.*"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">On/Offboarding</h1>
                        <p className="text-muted-foreground">Manage employee onboarding and offboarding</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/HR/Payroll" element={
                  <ProtectedRoute required={["payroll.runs.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">HR Payroll</h1>
                        <p className="text-muted-foreground">Manage payroll runs and approvals</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Finance/Payroll" element={
                  <ProtectedRoute required={["finance.reports.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Finance Payroll</h1>
                        <p className="text-muted-foreground">Financial payroll reports and analytics</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/IT/Helpdesk" element={
                  <ProtectedRoute required={["helpdesk.dashboard.read"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">IT Helpdesk</h1>
                        <p className="text-muted-foreground">Manage IT support tickets</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Admin/Tenant" element={
                  <ProtectedRoute required={["*"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Tenant Management</h1>
                        <p className="text-muted-foreground">Manage tenant settings and configuration</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Admin/Access" element={
                  <ProtectedRoute required={["*"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Access Management</h1>
                        <p className="text-muted-foreground">Manage user roles and permissions</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Admin/Integrations" element={
                  <ProtectedRoute required={["*"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Integrations</h1>
                        <p className="text-muted-foreground">Configure external integrations</p>
                      </div>
                    </Shell>
                  </ProtectedRoute>
                } />

                <Route path="/Admin/Security" element={
                  <ProtectedRoute required={["*"]}>
                    <Shell>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Admin Security</h1>
                        <p className="text-muted-foreground">Security settings and access controls</p>
                      </div>
                    </Shell>
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