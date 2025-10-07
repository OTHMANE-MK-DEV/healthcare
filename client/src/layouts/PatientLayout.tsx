import { Outlet } from "react-router-dom";
import { LayoutDashboard, Activity, Calendar, BookCheck, History } from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const patientMenu = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/patient",
    description: "Patient Overview"
  },
  {
    icon: Activity,
    label: "ECG",
    href: "/patient/ecg",
    description: "View ECG Data"
  },
  {
    icon: Calendar,
    label: "Doctor Planning",
    href: "/patient/planning",
    description: "Doctor Schedule"
  },
  {
    icon: BookCheck,
    label: "RDVs",
    href: "/patient/appointments",
    description: "Appointments"
  },
  {
    icon: History,
    label: "History",
    href: "/patient/history",
    description: "Medical History"
  }
];

function PatientLayout() {
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

export default PatientLayout;