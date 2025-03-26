
export interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  shortLabel: string;
  to: string;
}

export interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
  expanded: boolean;
}
