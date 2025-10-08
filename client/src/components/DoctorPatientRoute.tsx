// components/DoctorPatientRoute.tsx
import PrivateRoute from './PrivateRoute';

interface DoctorPatientRouteProps {
  children: React.ReactNode;
}

export default function DoctorPatientRoute({ children }: DoctorPatientRouteProps) {
  return (
    <PrivateRoute allowedRoles={['medecin', 'patient']}>
      {children}
    </PrivateRoute>
  );
}