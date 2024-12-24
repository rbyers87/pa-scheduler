import {
  Calendar,
  Clock,
  Users,
  FileText,
  Settings,
  LogOut,
  Grid,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { title: "Index", icon: Grid, path: "/" },
  { title: "Schedule", icon: Calendar, path: "/schedule" },
  { title: "Time Off", icon: Clock, path: "/time-off" },
  { title: "Employees", icon: Users, path: "/employees" },
  { title: "Reports", icon: FileText, path: "/reports" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { signOut, accessToken } = useAuth();

  const handleLogout = async () => {
    if (accessToken) {
      console.log("Logging out, accessToken available:", accessToken);
      await signOut();
      navigate("/login", { replace: true });
    } else {
      console.log("No accessToken available, logging out");
      await signOut();
      navigate("/login", { replace: true });
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>AppSidebar file Scheduler</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={() => navigate(item.path)}>
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="text-red-500">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
