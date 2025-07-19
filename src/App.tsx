
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Calendar from "./pages/Calendar";
import Team from "./pages/Team";
import Documents from "./pages/Documents";
import TimeTracking from "./pages/TimeTracking";
import NotFound from "./pages/NotFound";
import ClientLayout from "./components/ClientLayout";
import ClientDashboard from "./pages/ClientDashboard";
import ClientCommunity from "./pages/ClientCommunity";
import ClientMarketing from "./pages/ClientMarketing";
import ClientBranding from "./pages/ClientBranding";
import ClientTeam from "./pages/ClientTeam";
import Presentation from "./pages/Presentation";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SidebarProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/presentation/:linkId" element={<Presentation />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/projects/:id" element={<ProjectDetail />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/time-tracking" element={<TimeTracking />} />
                      <Route
                        path="/projects/:id/*"
                        element={
                          <ClientLayout>
                            <Routes>
                              <Route path="dashboard" element={<ClientDashboard />} />
                              <Route path="community" element={<ClientCommunity />} />
                              <Route path="marketing" element={<ClientMarketing />} />
                              <Route path="branding" element={<ClientBranding />} />
                              <Route path="team" element={<ClientTeam />} />
                            </Routes>
                          </ClientLayout>
                        }
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
