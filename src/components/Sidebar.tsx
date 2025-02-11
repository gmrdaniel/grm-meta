
import { useState } from "react";
import { UserCircle, Wallet, LayoutDashboard, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

export function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
        expanded ? "w-64" : "w-16"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          {expanded && (
            <h2 className="text-xl font-semibold animate-fadeIn">Panel Creador</h2>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {expanded ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={<UserCircle size={20} />} 
            label="Perfil" 
            to="/creator/profile"
            active={location.pathname === "/creator/profile"}
            expanded={expanded} 
          />
          <NavItem 
            icon={<Wallet size={20} />} 
            label="Datos Bancarios" 
            to="/creator/bankDetail"
            active={location.pathname === "/creator/bankDetail"}
            expanded={expanded} 
          />
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Mis Campañas" 
            to="/creator/campaigns"
            active={location.pathname === "/creator/campaigns"}
            expanded={expanded} 
          />
        </nav>
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
        "flex items-center p-3 rounded-lg transition-all duration-200",
        "hover:bg-gray-100 group",
        active && "bg-gray-100"
      )}
    >
      <span className="text-gray-600 group-hover:text-gray-900">{icon}</span>
      {expanded && (
        <span className="ml-3 text-gray-600 group-hover:text-gray-900 animate-fadeIn">
          {label}
        </span>
      )}
    </Link>
  );
}
