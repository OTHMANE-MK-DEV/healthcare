// components/PatientRoute.tsx
import PrivateRoute from './PrivateRoute';

interface PatientRouteProps {
  children: React.ReactNode;
}

export default function PatientRoute({ children }: PatientRouteProps) {
  return (
    <PrivateRoute allowedRoles={['patient']}>
      {children}
    </PrivateRoute>
  );
}