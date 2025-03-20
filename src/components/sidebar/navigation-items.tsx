
import { Home, Package, PenSquare, User, Users, Mail } from "lucide-react";

export const adminNavigationItems = [
  {
    label: "Dashboard",
    shortLabel: "Home",
    icon: <Home size={24} />,
    to: "/admin/dashboard",
  },
  {
    label: "Projects",
    shortLabel: "Projects",
    icon: <PenSquare size={24} />,
    to: "/admin/projects",
  },
  {
    label: "Inventory",
    shortLabel: "Inventory",
    icon: <Package size={24} />,
    to: "/admin/inventory",
  },
  {
    label: "Invitations",
    shortLabel: "Invite",
    icon: <Mail size={24} />,
    to: "/admin/invitations",
  }
];

export const creatorNavigationItems = [
  {
    label: "Dashboard",
    shortLabel: "Home",
    icon: <Home size={24} />,
    to: "/creator/dashboard",
  },
  {
    label: "Profile",
    shortLabel: "Profile",
    icon: <User size={24} />,
    to: "/creator/profile",
  }
];
