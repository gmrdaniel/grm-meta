
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import CreatorDashboard from "./pages/creator/Dashboard";
import CreatorProfile from "./pages/creator/Profile";
import CreatorBankDetail from "./pages/creator/BankDetail";
import PendingServices from "./pages/creator/PendingServices";
import Creators from "./pages/admin/Creators";
import CreatorDetail from "./pages/admin/CreatorDetail";
import Services from "./pages/admin/Services";
import CreatorServices from "./pages/admin/CreatorServices";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/creators"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Creators />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/creators/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <CreatorDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/services"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Services />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/creator-services"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <CreatorServices />
                </ProtectedRoute>
              }
            />

            {/* Creator routes */}
            <Route
              path="/creator/dashboard"
              element={
                <ProtectedRoute allowedRoles={["creator"]}>
                  <CreatorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/profile"
              element={
                <ProtectedRoute allowedRoles={["creator"]}>
                  <CreatorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/bankDetail"
              element={
                <ProtectedRoute allowedRoles={["creator"]}>
                  <CreatorBankDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/pending-services"
              element={
                <ProtectedRoute allowedRoles={["creator"]}>
                  <PendingServices />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
