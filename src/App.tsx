import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Public Pages
import HomePage from "./pages/HomePage";
import DemoPage from "./pages/DemoPage";
import PublicCatalog from "./pages/PublicCatalog";
import PublicVehicleDetail from "./pages/PublicVehicleDetail";
import LoginPage from "./pages/LoginPage";
import SubscribePage from "./pages/SubscribePage";
import PastDuePage from "./pages/PastDuePage";
import NotFound from "./pages/NotFound";
import AdminMaster from "./pages/AdminMaster";

// Admin Pages
import MainLayout from "./components/admin/MainLayout";
import Dashboard from "./pages/admin/Dashboard";
import VehicleCatalog from "./pages/admin/VehicleCatalog";
import CRMKanban from "./pages/admin/CRMKanban";
import AddVehicle from "./pages/admin/AddVehicle";
import StoreSettings from "./pages/admin/StoreSettings";
import Vendedores from "./pages/admin/Vendedores";

const queryClient = new QueryClient();

const SistemaRedirect = () => {
  const { lojaSlug, loading, isLoggedIn } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (lojaSlug) return <Navigate to={`/${lojaSlug}/dashboard`} replace />;
  return <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider queryClient={queryClient}>
        <DataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/demo" element={<DemoPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/assinar" element={<SubscribePage />} />
                <Route path="/inadimplente" element={<PastDuePage />} />

                <Route path="/loja/:lojaSlug" element={<PublicCatalog />} />
                <Route path="/loja/:lojaSlug/veiculo/:id" element={<PublicVehicleDetail />} />

                <Route path="/sistema" element={<SistemaRedirect />} />
                <Route path="/sistema/*" element={<SistemaRedirect />} />

                {/* Super Admin (rota oculta — somente owners autorizados) */}
                <Route path="/admin-master" element={<AdminMaster />} />
                <Route path="/admin-master/:section" element={<AdminMaster />} />

                <Route path="/:lojaSlug" element={<MainLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="catalogo" element={<VehicleCatalog />} />
                  <Route path="crm" element={<CRMKanban />} />
                  <Route path="vendedores" element={<Vendedores />} />
                  <Route path="adicionar" element={<AddVehicle />} />
                  <Route path="configuracoes" element={<StoreSettings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
