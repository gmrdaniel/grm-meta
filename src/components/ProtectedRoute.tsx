
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ProtectedRouteProps = {
  allowedRoles: string[];
  children?: ReactNode;
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    async function getUserRole() {
      if (!user) {
        setRoleLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setUserRole(data.role);
      } catch (error: any) {
        toast.error("Error fetching user role");
        console.error("Error:", error.message);
      } finally {
        setRoleLoading(false);
      }
    }

    getUserRole();
  }, [user]);

  if (loading || roleLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    // Redirect admin to admin dashboard if trying to access creator routes
    if (userRole === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Redirect creator to creator dashboard if trying to access admin routes
    if (userRole === "creator") {
      return <Navigate to="/creator/dashboard" replace />;
    }
    // Fallback to auth page if role is invalid
    return <Navigate to="/auth" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
