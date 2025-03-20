
import { Home, Package, PenSquare, User, Users, Mail } from "lucide-react";

export const adminNavigationItems = [
  {
    label: "Dashboard",
    icon: Home,
    to: "/admin/dashboard",
  },
  {
    label: "Projects",
    icon: PenSquare,
    to: "/admin/projects",
  },
  {
    label: "Inventory",
    icon: Package,
    to: "/admin/inventory",
  },
  {
    label: "Invitations",
    icon: Mail,
    to: "/admin/invitations",
  }
];

export const creatorNavigationItems = [
  {
    label: "Dashboard",
    icon: Home,
    to: "/creator/dashboard",
  },
  {
    label: "Profile",
    icon: User,
    to: "/creator/profile",
  }
];
