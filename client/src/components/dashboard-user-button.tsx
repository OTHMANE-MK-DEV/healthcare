import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger
} from "@/components/ui/drawer";
import { ChevronDownIcon, LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

// Static user data
const staticUser = {
  name: "Othmane",
  email: "othmane@gmail.com",
  image: null // You can add an image URL here if needed
};

const DashboardUserButton = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on component mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Mock logout function
  const handleLogout = () => {
    console.log("Logging out...");
    // Add your logout logic here
    // For now, just navigate to login page
    navigate("/login");
  };

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger className="rounded-lg border border-border/10 p-3 w-full flex gap-x-2 items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden">
          <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
            <p className="text-sm font-medium truncate w-full">
              {staticUser.name}
            </p>
            <p className="text-xs text-muted-foreground truncate w-full">
              {staticUser.email}
            </p>
          </div>
          <ChevronDownIcon className="size-4 shrink-0" />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerDescription>
              <div className="flex flex-col items-center">
                <p className="text-lg font-semibold text-foreground">{staticUser.name}</p>
                <p className="text-sm text-muted-foreground">{staticUser.email}</p>
              </div>
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button 
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOutIcon className="size-4"/>
              Logout
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-lg border border-border/10 p-3 w-full flex gap-x-2 items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden">
        <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
          <p className="text-sm font-medium truncate w-full">
            {staticUser.name}
          </p>
          <p className="text-xs text-muted-foreground truncate w-full">
            {staticUser.email}
          </p>
        </div>
        <ChevronDownIcon className="size-4 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right" className="w-72">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-medium truncate">{staticUser.name}</span>
            <span className="text-sm font-normal text-muted-foreground truncate">
              {staticUser.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer flex items-center justify-between"
        >
          Logout
          <LogOutIcon className="size-4"/>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DashboardUserButton