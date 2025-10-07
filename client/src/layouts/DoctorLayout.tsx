// src/layouts/DoctorLayout.tsx
import { Outlet } from "react-router-dom";
// import DoctorSidebar from "../components/doctor/DoctorSidebar";
// import DoctorNavbar from "../components/doctor/DoctorNavbar";

function DoctorLayout() {
  return (
    <div className="flex min-h-screen">
      {/* <DoctorSidebar /> */}
      <div className="flex flex-col flex-1">
        {/* <DoctorNavbar /> */}
        <main className="p-4 flex-1">
          <Outlet /> {/* Doctor routes render here */}
        </main>
      </div>
    </div>
  );
}

export default DoctorLayout;
