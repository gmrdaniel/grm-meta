import { useState } from "react";
import { UserCircle, Wallet, LayoutDashboard, Menu, X, LogOut, Package, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/auth");
    }
  };

  const creatorNavigationItems = [
    {
      icon: <UserCircle size={24} />,
      label: "Perfil",
      shortLabel: "Perfil",
      to: "/creator/profile",
    },
    {
      icon: <Wallet size={24} />,
      label: "Datos Bancarios",
      shortLabel: "Banco",
      to: "/creator/bankDetail",
    },
    {
      icon: <Inbox size={24} />,
      label: "Servicios Pendientes",
      shortLabel: "Pendientes",
      to: "/creator/pending-services",
    },
    {
      icon: <LayoutDashboard size={24} />,
      label: "Mis Campañas",
      shortLabel: "Campañas",
      to: "/creator/campaigns",
    },
  ];

  const adminNavigationItems = [
    {
      icon: <LayoutDashboard size={24} />,
      label: "Dashboard",
      shortLabel: "Dashboard",
      to: "/admin/dashboard",
    },
    {
      icon: <UserCircle size={24} />,
      label: "Creators",
      shortLabel: "Creators",
      to: "/admin/creators",
    },
    {
      icon: <Package size={24} />,
      label: "Services",
      shortLabel: "Services",
      to: "/admin/services",
    },
    {
      icon: <Inbox size={24} />,
      label: "Creator Services",
      shortLabel: "Creator Services",
      to: "/admin/creator-services",
    },
  ];

  const navigationItems = isAdminRoute ? adminNavigationItems : creatorNavigationItems;

  // Mobile menu for creators
  if (!isAdminRoute && isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 z-50">
        <div className="flex justify-around items-center h-16 px-4">
          {navigationItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center w-16 py-1 rounded-2xl transition-all",
                "text-gray-500 hover:text-gray-900",
                location.pathname === item.to && "text-gray-900"
              )}
            >
              <span className={cn(
                "p-2 rounded-xl transition-all",
                location.pathname === item.to && "bg-gray-100/80"
              )}>
                {item.icon}
              </span>
              <span className="text-xs mt-1 font-medium">{item.shortLabel}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center w-16 py-1 rounded-2xl transition-all text-red-500 hover:text-red-600"
          >
            <span className="p-2 rounded-xl transition-all">
              <LogOut size={24} />
            </span>
            <span className="text-xs mt-1 font-medium">Salir</span>
          </button>
        </div>
      </nav>
    );
  }

  // Desktop sidebar for admin and creator (when not mobile)
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

type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
  expanded: boolean;
};

function NavItem({ icon, label, to, active, expanded }: NavItemProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center p-3 rounded-xl transition-all duration-200",
        "hover:bg-gray-100/50 group",
        active && "bg-gray-100/50 shadow-sm"
      )}
    >
      <span
        className={cn(
          "text-gray-600 group-hover:text-gray-900 transition-colors",
          active && "text-gray-900"
        )}
      >
        {icon}
      </span>
      {expanded && (
        <span
          className={cn(
            "ml-3 text-gray-600 group-hover:text-gray-900 transition-colors animate-fadeIn",
            "font-medium",
            active && "text-gray-900"
          )}
        >
          {label}
        </span>
      )}
    </Link>
  );
}
