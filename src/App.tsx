
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Auth from "./pages/Auth";
import Projects from "./pages/Projects";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import ClientDashboard from "./pages/ClientDashboard";
import ClientTeam from "./pages/ClientTeam";
import ClientMarketing from "./pages/ClientMarketing";
import ClientBranding from "./pages/ClientBranding";
import ClientCommunity from "./pages/ClientCommunity";
import { ClientLayout } from "./components/ClientLayout";
import { Layout } from "./components/Layout";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/auth" element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              } />
              
              {/* Ruta principal redirige al dashboard */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              } />
              
              {/* Rutas protegidas del sistema principal */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute>
                  <Layout>
                    <Projects />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <Layout>
                    <Calendar />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Rutas del sistema cliente */}
              <Route path="/projects/:id" element={
                <ProtectedRoute>
                  <ClientLayout>
                    <ClientDashboard />
                  </ClientLayout>
                </ProtectedRoute>
              } />
              <Route path="/projects/:id/team" element={
                <ProtectedRoute>
                  <ClientLayout>
                    <ClientTeam />
                  </ClientLayout>
                </ProtectedRoute>
              } />
              <Route path="/projects/:id/marketing" element={
                <ProtectedRoute>
                  <ClientLayout>
                    <ClientMarketing />
                  </ClientLayout>
                </ProtectedRoute>
              } />
              <Route path="/projects/:id/branding" element={
                <ProtectedRoute>
                  <ClientLayout>
                    <ClientBranding />
                  </ClientLayout>
                </ProtectedRoute>
              } />
              <Route path="/projects/:id/community" element={
                <ProtectedRoute>
                  <ClientLayout>
                    <ClientCommunity />
                  </ClientLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
