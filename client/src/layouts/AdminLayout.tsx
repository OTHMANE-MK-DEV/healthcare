// src/layouts/AdminLayout.tsx
import { Outlet } from "react-router-dom";
// import AdminSidebar from "../components/admin/AdminSidebar";
// import AdminNavbar from "../components/admin/AdminNavbar";

function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      {/* <AdminSidebar /> */}
      <div className="flex flex-col flex-1">
        {/* <AdminNavbar /> */}
        <main className="p-4 flex-1">
          <Outlet /> {/* Admin routes render here */}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
