import { Routes, Route } from "react-router-dom"; 
import HomePage from "./Pages/HomePage.tsx";
import DetailActivityPageUser from "./Pages/DetailActivityPageUser.tsx";
import SuperadminLayout from './Layouts/Superadmin/SuperAdminLayout.tsx';
import ManageActivitySuperAdmin from "./Pages/Superadmin/ManageActivityPage.tsx";
import LoginAdminPage from "./Pages/Auth/LoginAdminPage.tsx";
import DetailActivityPage from "./Pages/Superadmin/DetailActivityPage.tsx";
import ManageRequestActivityPage from "./Pages/Superadmin/ManageRequestActivityPage.tsx";
import DetailRequestActivityPage from "./Pages/Superadmin/DetailRequestActivityPage.tsx";
import CreateActivityPage from "./Pages/Superadmin/CreateActivityPage.tsx";
import EditActivityPage from "./Pages/Superadmin/EditActivityPage.tsx";
import SettingPage from "./Pages/Superadmin/SettingPage.tsx";
import HistoryActivityPage from "./Pages/Superadmin/HistoryActivityPage.tsx";
import HistoryDetailActivityPage from "./Pages/Superadmin/HistoryDetailActivityPage.tsx";

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/activity/:id" element={<DetailActivityPageUser />} />
        <Route path="/admin/login" element={<LoginAdminPage />} />


        {/* ครอบ Route ของ Superadmin ด้วย Layout */}
        <Route path="/superadmin" element={<SuperadminLayout />}>

          <Route path="/superadmin/activity" element={<ManageActivitySuperAdmin />} />

          <Route path="/superadmin/activity/:id" element={<DetailActivityPage />} />

          <Route path="/superadmin/activity/:id/edit" element={<EditActivityPage />} />

          <Route path="/superadmin/activity/create" element={<CreateActivityPage />} />

          <Route path="/superadmin/activity-requests/approve" element={<ManageRequestActivityPage />} />

          <Route path="/superadmin/activity-requests/:id" element={<DetailRequestActivityPage />} />

          <Route path="/superadmin/activity/history" element={<HistoryActivityPage />} />

          <Route path="/superadmin/activity/history/:id" element={<HistoryDetailActivityPage />} />

          <Route path="/superadmin/dashboard" element={<DetailActivityPage />} />

          <Route path="/superadmin/settings" element={<SettingPage />} />
          
        </Route>

      </Routes>
  );
}