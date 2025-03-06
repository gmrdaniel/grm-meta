
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavigationItem } from "./types";

interface MobileSidebarProps {
  navigationItems: NavigationItem[];
  currentPath: string;
  onLogout: () => void;
}

export function MobileSidebar({ navigationItems, currentPath, onLogout }: MobileSidebarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 z-50">
      <div className="flex justify-around items-center h-16 px-4">
        {navigationItems.map((item) => {
          const linkContent = (
            <>
              <span className={cn(
                "p-2 rounded-xl transition-all",
                currentPath === item.to && "bg-gray-100/80",
                item.disabled && "opacity-50"
              )}>
                {item.icon}
              </span>
              <span className="text-xs mt-1 font-medium">{item.shortLabel || item.label.substring(0, 4)}</span>
            </>
          );

          if (item.disabled) {
            return (
              <div
                key={item.to}
                className={cn(
                  "flex flex-col items-center justify-center w-16 py-1 rounded-2xl transition-all",
                  "text-gray-400 cursor-not-allowed opacity-60"
                )}
              >
                {linkContent}
              </div>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center w-16 py-1 rounded-2xl transition-all",
                "text-gray-500 hover:text-gray-900",
                currentPath === item.to && "text-gray-900"
              )}
            >
              {linkContent}
            </Link>
          );
        })}
        <button
          onClick={onLogout}
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
