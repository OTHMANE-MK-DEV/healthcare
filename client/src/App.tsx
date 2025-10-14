// App.tsx
import { Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";

// Layouts
import PatientLayout from "./layouts/PatientLayout";
import DoctorLayout from "./layouts/DoctorLayout";
import AdminLayout from "./layouts/AdminLayout";

// Route Components
import PatientRoute from "./components/PatientRoute";
import DoctorRoute from "./components/DoctorRoute";
import AdminRoute from "./components/AdminRoute";
import DoctorPatientRoute from "./components/DoctorPatientRoute";
import PublicRoute from "./components/PublicRoute"; // Add this

// Example pages
import ECGRealtime from "./pages/patient/ECGRealtime";
import { Button } from "./components/ui/button";
import Planning from "./pages/patient/Planning";
import HealthcareLogin from "./pages/auth/Login";
import HealthcareRegister from "./pages/auth/Register";
import History from "./pages/patient/History";
import PatientOverview from "./pages/patient/Overview";
import DoctorOverview from "./pages/doctor/Overview";
import AdminOverview from "./pages/admin/Overview";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Unauthorized from "./pages/Unauthorized";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
// import UserManagementDashboard from "./pages/admin/Users";
import UserManagement from "./pages/admin/Users";
import UserDetails from "./pages/admin/Users/UserDetails";
import CreateUser from "./pages/admin/Users/CreateUser";
import UpdateUser from "./pages/admin/Users/UpdateUser";
import MyDoctors from "./pages/patient/MyDoctors";
import DoctorPlanning from "./pages/doctor/Planning";
import PatientRDVsPage from "./pages/patient/RDVs";

function App() {
  return (
    <Routes>
      {/* Public Routes - Only accessible when NOT logged in */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <div className="flex min-h-screen flex-col items-center justify-center">
              <h1 className="text-2xl mb-4">Home Page</h1>
              <Button>Click me</Button>
            </div>
          </PublicRoute>
        }
      />
      
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <HealthcareLogin />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <HealthcareRegister />
          </PublicRoute>
        } 
      />

      <Route path="/forgot-password" element={<PublicRoute> <ForgotPassword /> </PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      
      {/* Verify email can be accessed by anyone with the token */}
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Patient Routes - Protected */}
      <Route
        path="/patient/*"
        element={
          <PatientRoute>
            <PatientLayout />
          </PatientRoute>
        }
      >
        <Route index element={<PatientOverview />} />
        <Route path="planning" element={<Planning />} />
        <Route path="histories" element={<History />} />
        <Route path="my-doctors" element={<MyDoctors />} />
        <Route path="appointments" element={<PatientRDVsPage />} />
      </Route>

      {/* ECG Route - Accessible by both patients and doctors */}
      <Route
        path="/patient/ecg"
        element={
          <DoctorPatientRoute>
            <ECGRealtime />
          </DoctorPatientRoute>
        }
      />

      {/* Doctor Routes - Protected */}
      <Route
        path="/doctor"
        element={
          <DoctorRoute>
            <DoctorLayout />
          </DoctorRoute>
        }
      >
        <Route index element={<DoctorOverview />} />
        <Route path="patients" element={<div className="flex min-h-screen flex-col items-center justify-center">
              <h1 className="text-2xl mb-4">patients</h1>
            </div>} />
        
        <Route path="appointments" element={<DoctorPlanning />} />
      </Route>

      {/* Admin Routes - Protected */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="users/create" element={<CreateUser />} />
        <Route path="users/:id" element={<UserDetails />} />
        <Route path="users/:id/edit" element={<UpdateUser />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;