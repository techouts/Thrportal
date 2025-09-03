import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import { Provider as JotaiProvider } from 'jotai';

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
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          } />
          <Route path="/Portal/Dashboard" element={
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          } />
          {/* Placeholder routes for all HR sections */}
          <Route path="/Portal/*" element={
            <MainLayout>
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Portal Module</h1>
                <p className="text-muted-foreground">This section is under development</p>
              </div>
            </MainLayout>
          } />
          <Route path="/Me/*" element={
            <MainLayout>
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">My Profile</h1>
                <p className="text-muted-foreground">This section is under development</p>
              </div>
            </MainLayout>
          } />
          <Route path="/MyTeam/*" element={
            <MainLayout>
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">My Team</h1>
                <p className="text-muted-foreground">This section is under development</p>
              </div>
            </MainLayout>
          } />
          <Route path="/Hiring/*" element={
            <MainLayout>
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Hiring</h1>
                <p className="text-muted-foreground">This section is under development</p>
              </div>
            </MainLayout>
          } />
          <Route path="/Project/*" element={
            <MainLayout>
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Projects</h1>
                <p className="text-muted-foreground">This section is under development</p>
              </div>
            </MainLayout>
          } />
          <Route path="/Org/*" element={
            <MainLayout>
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Organization</h1>
                <p className="text-muted-foreground">This section is under development</p>
              </div>
            </MainLayout>
          } />
          <Route path="/HR/*" element={
            <MainLayout>
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">HR Management</h1>
                <p className="text-muted-foreground">This section is under development</p>
              </div>
            </MainLayout>
          } />
          <Route path="/Management/*" element={
            <MainLayout>
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Management</h1>
                <p className="text-muted-foreground">This section is under development</p>
              </div>
            </MainLayout>
          } />
          <Route path="/Reports/*" element={
            <MainLayout>
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Reports</h1>
                <p className="text-muted-foreground">This section is under development</p>
              </div>
            </MainLayout>
          } />
          <Route path="/Admin/*" element={
            <MainLayout>
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Administration</h1>
                <p className="text-muted-foreground">This section is under development</p>
              </div>
            </MainLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </JotaiProvider>
  </QueryClientProvider>
);

export default App;
