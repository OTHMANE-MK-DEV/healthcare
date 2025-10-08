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
import { ChevronDownIcon, LogOutIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  isApproved: boolean;
}

interface ProfileData {
  id?: string;
  nom?: string;
  prenom?: string;
  CIN?: string;
  sexe?: string;
  age?: number;
  contact?: string;
}

const DashboardUserButton = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Load user data from localStorage
  useEffect(() => {
    const loadUserData = () => {
      const userString = localStorage.getItem('user');
      if (userString) {
        try {
          const userData: UserData = JSON.parse(userString);
          setUser(userData);
          
          // Try to load profile data if available
          const profileString = localStorage.getItem('profile');
          if (profileString) {
            const profileData: ProfileData = JSON.parse(profileString);
            setProfile(profileData);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    loadUserData();

    // Listen for storage changes (in case user logs out in another tab)
    const handleStorageChange = () => {
      loadUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5001/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all user data from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
      localStorage.removeItem('token');
      setUser(null);
      setProfile(null);
      navigate('/login');
    }
  };

  // Display name logic: use profile name if available, otherwise username
  const displayName = profile?.prenom && profile?.nom 
    ? `${profile.prenom} ${profile.nom}`
    : user?.username || 'User';

  // Display role with proper formatting
  const displayRole = user?.role 
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'User';

  // If no user data, don't render the component
  if (!user) {
    return null;
  }

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger className="rounded-lg border border-border/10 p-3 w-full flex gap-x-2 items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 bg-lime-500 text-white rounded-full text-sm font-medium">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-medium truncate w-full">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate w-full">
                {user.email}
              </p>
            </div>
          </div>
          <ChevronDownIcon className="size-4 shrink-0" />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerDescription>
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center w-16 h-16 bg-lime-500 text-white rounded-full text-xl font-medium">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">{displayName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-lime-100 text-lime-800">
                      {displayRole}
                    </span>
                    {user.role === 'medecin' && !user.isApproved && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ml-1">
                        Pending Approval
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="flex flex-col gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2"
            >
              <User className="size-4"/>
              View Profile
            </Button>
            <Button 
              variant="destructive"
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
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 bg-lime-500 text-white rounded-full text-sm font-medium">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
            <p className="text-sm font-medium truncate w-full">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground truncate w-full">
              {user.email}
            </p>
          </div>
        </div>
        <ChevronDownIcon className="size-4 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right" className="w-72">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-lime-500 text-white rounded-full text-sm font-medium">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col gap-0.5 overflow-hidden flex-1 min-w-0">
                <span className="font-medium truncate">{displayName}</span>
                <span className="text-sm font-normal text-muted-foreground truncate">
                  {user.email}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-lime-100 text-lime-800">
                {displayRole}
              </span>
              {user.role === 'medecin' && !user.isApproved && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending Approval
                </span>
              )}
              {!user.isVerified && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Unverified
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate('/profile')}
          className="cursor-pointer flex items-center gap-2"
        >
          <User className="size-4"/>
          View Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer flex items-center justify-between text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Logout
          <LogOutIcon className="size-4"/>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DashboardUserButton