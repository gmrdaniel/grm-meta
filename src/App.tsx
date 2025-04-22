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
import AdminInvitations from "./pages/admin/invitations";
import AdminTasks from "./pages/admin/tasks";
import AdminTest from "./pages/admin/test";
import CreatorDashboard from "./pages/creator/Dashboard";
import CreatorProfile from "./pages/creator/Profile";
import InvitationStepperPage from "./pages/meta/invitation/[invitation_code]";
import InvitationStepperPagePinterest from "./pages/pinterest/invitation/[invitation_code]";
import NotificationLogs from "./pages/admin/notification-logs";
import NotificationSettings from "./pages/admin/notification-settings";


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <>
              <Routes>
                <Route path="/" element={<Navigate to="/auth" replace />} />
                <Route path="/auth" element={<Auth />} />

                {/* Public routes */}
                <Route
                  path="/meta/invitation/:invitation_code?"
                  element={<InvitationStepperPage />}
                />
                 <Route
                  path="/pinterest/invitation/:invitation_code?"
                  element={<InvitationStepperPagePinterest />}
                />
                

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
                  path="/admin/invitations"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminInvitations />
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
                  path="/admin/test"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminTest />
                    </ProtectedRoute>
                  }
                  
                />
                <Route
                  path="/admin/notification-logs"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <NotificationLogs />
                    </ProtectedRoute>
                  }
                  
                />
                <Route
                  path="/admin/notification-settings"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <NotificationSettings />
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

                <Route path="*" element={<NotFound />} />
              </Routes>
            </>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
