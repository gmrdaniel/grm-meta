
import { LayoutDashboard, UserCircle, Wallet, Folder, FolderOpen, Users } from "lucide-react";
import { NavigationItem } from "./types";

export const creatorNavigationItems: NavigationItem[] = [
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
];

export const adminNavigationItems: NavigationItem[] = [
  {
    icon: <LayoutDashboard size={24} />,
    label: "Dashboard",
    shortLabel: "Dashboard",
    to: "/admin/dashboard",
  },
  {
    icon: <FolderOpen size={24} />,
    label: "Proyectos",
    shortLabel: "Proyectos",
    to: "/admin/projects",
  },
  {
    icon: <Users size={24} />,
    label: "Inventario",
    shortLabel: "Inventario",
    to: "/admin/inventory",
  },
];
