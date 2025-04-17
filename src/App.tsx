import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProjects from "./pages/admin/projects";
import AdminProjectDetail from "./pages/admin/projects/[id]";
import AdminInventory from "./pages/admin/inventory";
import AdminInventoryStats from "./pages/admin/inventory-stats";
import AdminRecurrentTasks from "./pages/admin/recurrent-tasks";
import AdminInvitations from "./pages/admin/invitations";
import AdminTasks from "./pages/admin/tasks";
import AdminTaskCreate from "./pages/admin/tasks/create";
import AdminTest from "./pages/admin/test";
import AdminCreateEmail from "./pages/admin/create-email"; 
import AdminNotificationSettings from "./pages/admin/notification-settings";
import AdminNotificationLogs from "./pages/admin/notification-logs";
import CreatorDashboard from "./pages/creator/Dashboard";
import CreatorProfile from "./pages/creator/Profile";
import InvitationPage from "./pages/invite/[url]/[id]";
import MetaWelcomePage from "./pages/meta/welcome/[invitation_code]";
import CompleteProfilePage from "./pages/meta/completeProfile/[invitation_code]";
import FbCreationPage from "./pages/meta/FbCreation/[invitation_code]";
import InvitationStepperPage from "./pages/meta/invitation/[invitation_code]";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/auth" replace />} />
              <Route path="/auth" element={<Auth />} />
              
              <Route path="/invite/:url/:id" element={<InvitationPage />} />
              <Route path="/meta/invitation/:invitation_code?" element={<InvitationStepperPage />} />
              <Route path="/meta/welcome/:invitation_code?" element={<MetaWelcomePage />} />
              <Route path="/meta/completeProfile/:invitation_code" element={<CompleteProfilePage />} />
              <Route path="/meta/FbCreation/:invitation_code" element={<FbCreationPage />} />
              
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/projects"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminProjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/projects/:id"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminProjectDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/inventory"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminInventory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/inventory-stats"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminInventoryStats />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/recurrent-tasks"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminRecurrentTasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/invitations"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminInvitations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/create-email"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminCreateEmail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notification-settings"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminNotificationSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notification-logs"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminNotificationLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tasks"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminTasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tasks/create"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminTaskCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/test"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminTest />
                  </ProtectedRoute>
                }
              />

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

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
