import { Outlet } from "react-router-dom";
import { LayoutDashboard, UsersIcon } from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const patientMenu = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/admin",
    description: "Patient Overview"
  },
  {
    icon: UsersIcon,
    label: "Users",
    href: "/admin/users",
    description: "users managements"
  },
];

function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 ">
        {/* Sidebar */}
        <DashboardSidebar 
          brand={{ name: "Health", highlight: "Care", panel: "Suptech" }}
          menu={patientMenu}
        />
        
        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-x-hidden">
          {/* Navbar */}
          <DashboardNavbar 
            userRole="patient"
            notificationCount={4}
          />
          
          {/* Main content with proper spacing */}
          <main className="flex-1 w-full p-4 pt-[74px] m-0 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default AdminLayout;