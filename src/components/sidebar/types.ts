
import { LucideIcon } from "lucide-react";

export interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  shortLabel?: string;
  to: string;
  disabled?: boolean;
}

export interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
  expanded: boolean;
  disabled?: boolean;
}
