import { 
  ShoppingBag, 
  EarthIcon,
  Activity,
  AlertCircle
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import DashboardUserButton from "./dashboard-user-button";
import { Button } from "@/components/ui/button";


interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  description: string;
}

interface DashboardSidebarProps {
  brand: {
    name: string;
    highlight: string;
    panel: string;
  };
  menu: SidebarItem[];
}

const DashboardSidebar = ({ brand, menu }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar className="border-r border-gray-100 bg-white shadow-lg">
      <SidebarHeader className="bg-gradient-to-br from-lime-500 via-lime-600 to-lime-600 p-6">
        <Link 
          to="/admin" 
          className="flex flex-col items-center space-y-3 hover:opacity-90 transition-all duration-300 group"
        >
          {/* Logo */}
          <div className="relative">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-orange-200/50 transition-all duration-300 group-hover:scale-105">
              <Activity className="w-8 h-8 text-lime-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          
          {/* Brand */}
          <div className="text-center">
            <div className="text-2xl font-black text-white tracking-wide">
              {brand.name}<span className="text-amber-200">{brand.highlight}</span>
            </div>
            <div className="text-sm text-lime-100 font-medium bg-white/20 px-3 py-1 rounded-full">
              {brand.panel}
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <div className="px-4 py-2 bg-gradient-to-r from-lime-50 to-amber-50">
        <div className="h-px bg-gradient-to-r from-transparent via-lime-200 to-transparent"></div>
      </div>

      {/* Menu */}
      <SidebarContent className="bg-white px-3 py-4">
        <SidebarGroup>
          <div className="px-3 py-2 mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Management
            </h3>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menu.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild
                      className={cn(
                        "group relative h-14 rounded-xl transition-all duration-300 border-2 border-transparent p-3",
                        "hover:bg-gradient-to-r hover:from-lime-50 hover:to-amber-50 hover:border-lime-200",
                        "hover:shadow-md hover:scale-[1.02]",
                        isActive 
                          ? "bg-gradient-to-r from-lime-50 to-amber-50 border-lime-200 text-lime-700 shadow-sm" 
                          : "text-gray-700 hover:text-lime-700"
                      )}
                      isActive={isActive}
                    >
                      <Link to={item.href} className="flex items-center w-full">
                        <div className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-xl mr-3 transition-all duration-300",
                          isActive 
                            ? "bg-lime-500 shadow-sm" 
                            : "bg-gray-100 group-hover:bg-lime-100"
                        )}>
                          <item.icon className={cn(
                            "w-5 h-5 transition-colors duration-300",
                            isActive 
                              ? "text-white" 
                              : "text-gray-600 group-hover:text-lime-600"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-black tracking-wide truncate">
                            {item.label}
                          </div>
                          <div className={cn(
                            "text-xs truncate transition-colors duration-300",
                            isActive 
                              ? "text-lime-600/80" 
                              : "text-gray-500 group-hover:text-lime-600/80"
                          )}>
                            {item.description}
                          </div>
                        </div>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-10 bg-lime-500 rounded-r-full"></div>
                        )}
                        {/* <div className={cn(
                          "absolute right-3 w-2 h-2 rounded-full transition-all duration-300",
                          isActive 
                            ? "bg-lime-400" 
                            : "bg-transparent group-hover:bg-lime-300"
                        )}></div> */}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 bg-gradient-to-r from-gray-50 to-lime-50/30 border-t border-lime-100">
        <Button 
          className="mb-3 h-12 bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white border-none shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] rounded-xl font-semibold" 
          onClick={() => navigate("/")}
        >
          <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg mr-3">
            <AlertCircle className="w-5 h-5" />
          </div>
          <span>Alert</span>
        </Button>
        
        <div className="rounded-xl border border-lime-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:border-lime-200">
          <DashboardUserButton />
        </div>
        
        <div className="text-center mt-3 pt-3 border-t border-lime-100">
          <p className="text-xs text-gray-500 font-medium">
            {/* Powered by <span className="text-lime-600 font-semibold">StyleStore</span> */}
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default DashboardSidebar;
