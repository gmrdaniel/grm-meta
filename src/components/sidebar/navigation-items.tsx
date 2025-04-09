
import { Home, Package, PenSquare, User, Users, Mail, TestTube, CheckSquare, Plus, Bell } from "lucide-react";

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
  },
  {
    label: "Email Creator",
    shortLabel: "Email",
    icon: <Mail size={24} />,
    to: "/admin/create-email",
  },
  {
    label: "Notification Logs",
    shortLabel: "Logs",
    icon: <Bell size={24} />,
    to: "/admin/log-notification",
  },
  {
    label: "Tasks",
    shortLabel: "Tasks",
    icon: <CheckSquare size={24} />,
    to: "/admin/tasks",
  },
  {
    label: "Create Task",
    shortLabel: "New Task",
    icon: <Plus size={24} />,
    to: "/admin/tasks/create",
  },
  {
    label: "Test Services",
    shortLabel: "Test",
    icon: <TestTube size={24} />,
    to: "/admin/test",
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
