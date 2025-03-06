import { useState } from "react";
import { Menu, X, LogOut, Home, Users, Settings, ListChecks, Database, LayoutDashboard, FileText, DollarSign, Boxes, BarChart, Clock, KeyRound, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NavItem } from "./sidebar/NavItem";
import { MobileSidebar } from "./sidebar/MobileSidebar";
import { getSidebarItems } from "./sidebar/navigation-items";
import type { NavigationItem } from "./sidebar/types";

export function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const role = isAdminRoute ? "admin" : "creator";

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/auth");
    }
  };

  const navigationItems: NavigationItem[] = getSidebarItems(role).map(item => ({
    icon: item.icon,
    label: item.title,
    to: item.href,
    disabled: item.disabled
  }));

  if (!isAdminRoute && isMobile) {
    return (
      <MobileSidebar
        navigationItems={navigationItems}
        currentPath={location.pathname}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <aside
      className={cn(
        "h-screen transition-all duration-300 ease-in-out backdrop-blur-xl",
        "bg-white/80 border-r border-gray-200/50",
        expanded ? "w-64" : "w-16"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
          {expanded && (
            <h2 className="text-xl font-medium text-gray-800 animate-fadeIn">
              {isAdminRoute ? "Panel Admin" : "Panel Creador"}
            </h2>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-gray-100/50 rounded-xl transition-colors"
          >
            {expanded ? (
              <X size={20} className="text-gray-600" />
            ) : (
              <Menu size={20} className="text-gray-600" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <NavItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              active={location.pathname === item.to}
              expanded={expanded}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200/50">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center w-full p-3 rounded-xl transition-all duration-200",
              "hover:bg-red-50 text-red-600 group"
            )}
          >
            <LogOut size={24} />
            {expanded && (
              <span className="ml-3 font-medium animate-fadeIn">
                Cerrar Sesión
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
