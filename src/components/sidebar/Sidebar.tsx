
import { Link, useLocation } from "react-router-dom";
import {
  Landmark,
  UserRound,
  Calendar,
  FileText,
  PlusSquare,
  BarChart,
  Settings,
  LogOut,
  Users,
  Pill,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sidebar as ShadcnSidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";

type Role = "admin" | "doctor" | "pharmacist" | "patient";

interface SidebarProps {
  role?: Role;
}

export function Sidebar({ role = "admin" }: SidebarProps) {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  // Prefix routes with the role
  const getRoutePath = (path: string) => `/${role}${path}`;

  const roleNavItems = {
    admin: [
      {
        to: getRoutePath("/dashboard"),
        icon: <BarChart className="h-5 w-5" />,
        label: "Dashboard",
      },
      {
        to: getRoutePath("/patients"),
        icon: <UserRound className="h-5 w-5" />,
        label: "Patients",
      },
      {
        to: getRoutePath("/appointments"),
        icon: <Calendar className="h-5 w-5" />,
        label: "Appointments",
      },
      {
        to: getRoutePath("/medical-records"),
        icon: <FileText className="h-5 w-5" />,
        label: "Medical Records",
      },
      {
        to: getRoutePath("/prescriptions"),
        icon: <PlusSquare className="h-5 w-5" />,
        label: "Prescriptions",
      },
      {
        to: getRoutePath("/users"),
        icon: <Users className="h-5 w-5" />,
        label: "User Management",
      },
    ],
    doctor: [
      {
        to: getRoutePath("/dashboard"),
        icon: <BarChart className="h-5 w-5" />,
        label: "Dashboard",
      },
      {
        to: getRoutePath("/patients"),
        icon: <UserRound className="h-5 w-5" />,
        label: "Patients",
      },
      {
        to: getRoutePath("/appointments"),
        icon: <Calendar className="h-5 w-5" />,
        label: "Appointments",
      },
      {
        to: getRoutePath("/medical-records"),
        icon: <FileText className="h-5 w-5" />,
        label: "Medical Records",
      },
      {
        to: getRoutePath("/prescriptions"),
        icon: <PlusSquare className="h-5 w-5" />,
        label: "Prescriptions",
      },
    ],
    pharmacist: [
      {
        to: getRoutePath("/dashboard"),
        icon: <BarChart className="h-5 w-5" />,
        label: "Dashboard",
      },
      {
        to: getRoutePath("/prescriptions"),
        icon: <Pill className="h-5 w-5" />,
        label: "Prescriptions",
      },
      {
        to: getRoutePath("/inventory"),
        icon: <Pill className="h-5 w-5" />,
        label: "Inventory",
      },
      {
        to: getRoutePath("/patients"),
        icon: <UserRound className="h-5 w-5" />,
        label: "Patients",
      },
      {
        to: getRoutePath("/consultations"),
        icon: <Calendar className="h-5 w-5" />,
        label: "Consultations",
      },
    ],
    patient: [
      {
        to: getRoutePath("/dashboard"),
        icon: <BarChart className="h-5 w-5" />,
        label: "Dashboard",
      },
      {
        to: getRoutePath("/appointments"),
        icon: <Calendar className="h-5 w-5" />,
        label: "My Appointments",
      },
      {
        to: getRoutePath("/medical-records"),
        icon: <FileText className="h-5 w-5" />,
        label: "My Records",
      },
      {
        to: getRoutePath("/prescriptions"),
        icon: <PlusSquare className="h-5 w-5" />,
        label: "My Prescriptions",
      },
    ],
  };

  const bottomNavItems = [
    {
      to: "/login",
      icon: <LogOut className="h-5 w-5" />,
      label: "Logout",
      logout: ()=>{ localStorage.clear(); },
    },
  ];

  const navItems = roleNavItems[role];

  return (
    <ShadcnSidebar>
      <SidebarHeader className="py-4">
        <div className="flex items-center gap-2 px-4">
          <Stethoscope className="h-6 w-6 text-sidebar-primary" />
          {!isCollapsed && (
            <span className="text-lg font-bold text-sidebar-foreground">
              HealthHub
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.to)}
                tooltip={item.label}
              >
                <Link to={item.to}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {bottomNavItems.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.to)}
                tooltip={item.label}
                onClick={item.logout}
              >
                <Link to={item.to}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
