
import { LayoutDashboard, UserCircle, Wallet, Package, Inbox, DollarSign, Terminal, BadgeDollarSign } from "lucide-react";
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

export const adminNavigationItems: NavigationItem[] = [
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
    icon: <BadgeDollarSign size={24} />,
    label: "Creator Rates",
    shortLabel: "Rates",
    to: "/admin/rates",
  },
  {
    icon: <Terminal size={24} />,
    label: "Utilidades",
    shortLabel: "Utils",
    to: "/admin/utilidades",
  },
];
