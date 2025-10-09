import { Outlet } from "react-router-dom";
import { LayoutDashboard, UsersIcon, CalendarIcon, BellIcon, ThermometerIcon } from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const DoctorMenu = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/doctor",
    description: "Overview of patients and today's appointments"
  },
  {
    icon: UsersIcon,
    label: "Patients",
    href: "/doctor/patients",
    description: "Search and manage patients"
  },
  {
    icon: ThermometerIcon,
    label: "Threshold Management",
    href: "/doctor/thresholds",
    description: "Update alert thresholds for patients"
  },
  {
    icon: CalendarIcon,
    label: "Planning / RDVs",
    href: "/doctor/appointments",
    description: "Manage your schedule"
  },
  {
    icon: BellIcon,
    label: "Alerts",
    href: "/doctor/alerts",
    description: "See urgent alerts with patient location"
  }
];

function DoctorLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 ">
        {/* Sidebar */}
        <DashboardSidebar 
          brand={{ name: "Health", highlight: "Care", panel: "Suptech" }}
          menu={DoctorMenu}
        />
        
        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-x-hidden">
          {/* Navbar */}
          <DashboardNavbar 
            userRole="doctor"
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

export default DoctorLayout;