import { Home, Users, Settings, ListChecks, Database, LayoutDashboard, FileText, DollarSign, Boxes, BarChart, Clock, KeyRound, ClipboardList } from 'lucide-react';

export type UserRole = "admin" | "creator";

export interface SidebarItem {
  title: string;
  icon: keyof typeof Icons;
  href: string;
  disabled?: boolean;
}

const Icons = {
  Home,
  Users,
  Settings,
  ListChecks,
  Database,
  LayoutDashboard,
  FileText,
  DollarSign,
  Boxes,
  BarChart,
  Clock,
  KeyRound,
  ClipboardList
};

export function getSidebarItems(role: UserRole): SidebarItem[] {
  // Admin navigation
  if (role === "admin") {
    return [
      {
        title: "Dashboard",
        icon: "LayoutDashboard",
        href: "/admin/dashboard",
      },
      {
        title: "Creators",
        icon: "Users",
        href: "/admin/creators",
      },
      {
        title: "Services",
        icon: "Boxes",
        href: "/admin/services",
      },
      {
        title: "Creator Rates",
        icon: "DollarSign",
        href: "/admin/creator-rates",
      },
      {
        title: "Service Payments",
        icon: "BarChart",
        href: "/admin/service-payments",
      },
      {
        title: "Post Types",
        icon: "FileText",
        href: "/admin/post-types",
      },
      {
        title: "Audit Logs",
        icon: "Clock",
        href: "/admin/audit-logs",
      },
      {
        title: "Utilities",
        icon: "Settings",
        href: "/admin/utilities",
      },
      {
        title: "Database Migrations",
        icon: "Database",
        href: "/admin/db-migrations",
      },
    ];
  }

  // Creator navigation
  return [
    {
      title: "Dashboard",
      icon: "LayoutDashboard",
      href: "/creator/dashboard",
    },
    {
      title: "Profile",
      icon: "Users",
      href: "/creator/profile",
    },
    {
      title: "Services",
      icon: "Boxes",
      href: "/creator/services",
    },
    {
      title: "Bank Detail",
      icon: "KeyRound",
      href: "/creator/bank-detail",
    },
    {
      title: "Campaigns",
      icon: "ClipboardList",
      href: "/creator/campaigns",
    },
  ];
}
