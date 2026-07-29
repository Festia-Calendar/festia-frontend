import { Routes, Route } from "react-router-dom"; 
import ManageActivitySuperAdmin from "./Pages/Superadmin/ManageActivityPage.tsx";
import LoginAdminPage from "./Pages/Auth/LoginAdminPage.tsx";
import DetailActivityPage from "./Pages/Superadmin/DetailActivityPage.tsx";

function App() {
  return (
    <Routes>
      {/* หน้า Login เป็นหน้าแรก */}
      <Route path="/" element={<LoginAdminPage />} />
      
      {/* หน้า Manage Activity สำหรับ Super Admin */}
      <Route path="/superadmin/activity" element={<ManageActivitySuperAdmin />} />

      {/* หน้า Detail Activity สำหรับ Super Admin */}
      <Route path="/superadmin/activity/:id" element={<DetailActivityPage />} />
    </Routes>
  );
}

export default App;