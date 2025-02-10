
import { useState } from "react";
import { LayoutDashboard, Users, Settings, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [expanded, setExpanded] = useState(true);

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
            <h2 className="text-xl font-semibold animate-fadeIn">Admin Hub</h2>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {expanded ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active expanded={expanded} />
          <NavItem icon={<Users size={20} />} label="Users" expanded={expanded} />
          <NavItem icon={<Settings size={20} />} label="Settings" expanded={expanded} />
        </nav>
      </div>
    </aside>
  );
}

type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  expanded: boolean;
};

function NavItem({ icon, label, active, expanded }: NavItemProps) {
  return (
    <a
      href="#"
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
    </a>
  );
}
