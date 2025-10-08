// components/PublicRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const location = useLocation();
  
  // Get user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  if (user) {
    // Redirect to appropriate dashboard based on role
    let redirectPath = '/';
    switch (user.role) {
      case 'patient':
        redirectPath = '/patient';
        break;
      case 'medecin':
        redirectPath = '/doctor';
        break;
      case 'admin':
        redirectPath = '/admin';
        break;
      default:
        redirectPath = '/';
    }
    
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}