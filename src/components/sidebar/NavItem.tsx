
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NavItemProps } from "./types";

export function NavItem({ icon, label, to, active, expanded, disabled }: NavItemProps) {
  const linkContent = (
    <>
      <span
        className={cn(
          "text-gray-600 group-hover:text-gray-900 transition-colors",
          active && "text-gray-900",
          disabled && "text-gray-400"
        )}
      >
        {icon}
      </span>
      {expanded && (
        <span
          className={cn(
            "ml-3 text-gray-600 group-hover:text-gray-900 transition-colors animate-fadeIn",
            "font-medium",
            active && "text-gray-900",
            disabled && "text-gray-400"
          )}
        >
          {label}
        </span>
      )}
    </>
  );

  if (disabled) {
    return (
      <div
        className={cn(
          "flex items-center p-3 rounded-xl transition-all duration-200",
          "cursor-not-allowed opacity-60"
        )}
      >
        {linkContent}
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center p-3 rounded-xl transition-all duration-200",
        "hover:bg-gray-100/50 group",
        active && "bg-gray-100/50 shadow-sm"
      )}
    >
      {linkContent}
    </Link>
  );
}
