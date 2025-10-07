import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftClose, PanelLeft, Bell } from "lucide-react";
import DashboardCommand from "./dashboard-command";

interface DashboardNavbarProps {
  userRole: "admin" | "doctor" | "patient";
  notificationCount?: number;
}

const DashboardNavbar = ({ userRole, notificationCount = 0 }: DashboardNavbarProps) => {
  const {state, toggleSidebar, isMobile, openMobile} = useSidebar();
  const [commandOpen, setCommandOpen] = useState<boolean>(false);

  useEffect(()=>{
    const down = (e:KeyboardEvent) => {
      if(e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    }
    
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  },[])

  // Role display configuration
  const roleConfig = {
    admin: {
      label: "Administrator",
      color: "bg-red-100 text-red-800 border-red-200",
      badgeColor: "bg-red-500"
    },
    doctor: {
      label: "Doctor",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      badgeColor: "bg-blue-500"
    },
    patient: {
      label: "Patient",
      color: "bg-green-100 text-green-800 border-green-200",
      badgeColor: "bg-green-500"
    }
  };

  const currentRole = roleConfig[userRole];

  // Determine left offset based on sidebar state
  const getNavbarLeftClass = () => {
    if (isMobile) return 'left-0';
    if (state === 'collapsed') return 'left-0'; // Collapsed sidebar width
    return 'left-[var(--sidebar-width)]'; // Expanded sidebar width
  };

  return (
    <>
      <DashboardCommand open={commandOpen} setOpen={setCommandOpen} />
      <nav className={`flex items-center justify-between px-4 py-3 border-b fixed top-0 right-0 z-30 bg-white transition-all duration-300 ease-in-out ${getNavbarLeftClass()}`}>
        {/* Left side - Sidebar toggle */}
        <div className="flex items-center gap-x-2">
          <Button className="size-9" variant={"outline"} onClick={toggleSidebar}>
            {(state === "collapsed" || (isMobile && !openMobile))
              ? <PanelLeft className="size-4"/>
              : <PanelLeftClose className="size-4"/>
            }
          </Button>
        </div>

        {/* Right side - Role badge and notifications */}
        <div className="flex items-center gap-x-2 sm:gap-x-3">
          {/* User Role Badge */}
          <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full border ${currentRole.color} text-xs sm:text-sm font-medium whitespace-nowrap`}>
            <div className={`w-2 h-2 rounded-full ${currentRole.badgeColor} flex-shrink-0`}></div>
            <span className="hidden sm:inline">{currentRole.label}</span>
            <span className="sm:hidden">{currentRole.label.slice(0, 3)}</span>
          </div>

          {/* Notifications */}
          <Button 
            variant="ghost"
            size="icon"
            className="relative size-9 flex-shrink-0"
            onClick={() => console.log("Open notifications")}
          >
            <Bell className="size-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full px-1">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </Button>
        </div>
      </nav>
    </>
  )
}

export default DashboardNavbar;