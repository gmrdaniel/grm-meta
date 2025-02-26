
import { LayoutDashboard, UserCircle, Wallet, Package, Inbox, DollarSign, Terminal, History } from "lucide-react";
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
    icon: <Package size={24} />,
    label: "Services",
    shortLabel: "Services",
    to: "/admin/services",
  },
  {
    icon: <Inbox size={24} />,
    label: "Creator Services",
    shortLabel: "Creator Services",
    to: "/admin/creator-services",
  },
  {
    icon: <DollarSign size={24} />,
    label: "Service Payments",
    shortLabel: "Payments",
    to: "/admin/service-payments",
  },
  {
    icon: <Package size={24} />,
    label: "Post Types",
    shortLabel: "Post Types",
    to: "/admin/post-types",
  },
  {
    icon: <DollarSign size={24} />,
    label: "Creator Rates",
    shortLabel: "Rates",
    to: "/admin/rates",
  },
  {
    icon: <History size={24} />,
    label: "Audit Logs",
    shortLabel: "Logs",
    to: "/admin/audit-logs",
  },
  {
    icon: <Terminal size={24} />,
    label: "Utilidades",
    shortLabel: "Utils",
    to: "/admin/utilidades",
  },
];
