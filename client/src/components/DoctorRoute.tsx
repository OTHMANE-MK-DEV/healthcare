// components/DoctorRoute.tsx
import PrivateRoute from './PrivateRoute';

interface DoctorRouteProps {
  children: React.ReactNode;
}

export default function DoctorRoute({ children }: DoctorRouteProps) {
  return (
    <PrivateRoute allowedRoles={['medecin']}>
      {children}
    </PrivateRoute>
  );
}