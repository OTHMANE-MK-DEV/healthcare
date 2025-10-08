// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";

// Layouts
import PatientLayout from "./layouts/PatientLayout";
import DoctorLayout from "./layouts/DoctorLayout";
import AdminLayout from "./layouts/AdminLayout";

// Example pages
import ECGRealtime from "./pages/patient/ECGRealtime";
import { Button } from "./components/ui/button";
import Planning from "./pages/patient/Planning";
import HealthcareLogin from "./pages/auth/Login";
import HealthcareRegister from "./pages/auth/Register";
import History from "./pages/patient/History";
// import PatientDashboard from "./pages/patient/PatientDashboard";
// import DoctorDashboard from "./pages/doctor/DoctorDashboard";
// import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  return (
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex min-h-screen flex-col items-center justify-center">
              <h1 className="text-2xl mb-4">Home Page</h1>
              <Button>Click me</Button>
            </div>
          }
        />
        {/* Patient routes */}
        <Route element={<PatientLayout />}>
          {/* <Route path="/patient/dashboard" element={<PatientDashboard />} /> */}
          <Route
            path="/patient"
            element={
              <div className="flex min-h-full flex-col items-center justify-center">
                <h1 className="text-2xl mb-4">Patient</h1>
              </div>
            }
          />
          <Route path="/patient/planning" element={<Planning />} />
          <Route path="/patient/histories" element={<History />} />
        </Route>
        <Route path="/patient/ecg" element={<ECGRealtime />} />

        {/* Doctor routes */}
        <Route element={<DoctorLayout />}>
          {/* <Route path="/doctor/dashboard" element={<DoctorDashboard />} /> */}
        </Route>

        {/* Admin routes */}
        <Route element={<AdminLayout />}>
          {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
        </Route>

        <Route path="/login" element={<HealthcareLogin />} />
        <Route path="/register" element={<HealthcareRegister />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
  );
}

export default App;
