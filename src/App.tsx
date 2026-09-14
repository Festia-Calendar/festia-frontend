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
import HistoryActivityPage from "./Pages/Superadmin/ManageHistoryActivityPage.tsx";
import DetailHistoryActivityPage from "./Pages/Superadmin/DetailHistoryActivityPage.tsx";
import DashboardSuperAdmin from "./Pages/Superadmin/DashboardPage.tsx";

import AdminLayout from './Layouts/Admin/AdminLayout.tsx';
import AdminManageActivityPage from './Pages/Admin/ManageActivityPage.tsx';
import AdminDetailActivityPage from './Pages/Admin/DetailActivityPage.tsx';
import AdminHistoryActivityPage from './Pages/Admin/ManageHistoryActivityPage.tsx';
import AdminDetailHistoryActivityPage from './Pages/Admin/DetailHistoryActivityPage.tsx';
import DashboardAdmin from './Pages/Admin/DashboardPage.tsx';
import EditActivityPageAdmin from './Pages/Admin/EditActivityPage.tsx';
import CreateActivityPageAdmin from './Pages/Admin/CreateActivityPage.tsx';

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/activity/:id" element={<DetailActivityPageUser />} />
        <Route path="/admin/login" element={<LoginAdminPage />} />


        {/* Route ของ Superadmin */}
        <Route path="/superadmin" element={<SuperadminLayout />}>

          <Route path="/superadmin/activity" element={<ManageActivitySuperAdmin />} />

          <Route path="/superadmin/activity/:id" element={<DetailActivityPage />} />

          <Route path="/superadmin/activity/:id/edit" element={<EditActivityPage />} />

          <Route path="/superadmin/activity/create" element={<CreateActivityPage />} />

          <Route path="/superadmin/activity-requests/approve" element={<ManageRequestActivityPage />} />

          <Route path="/superadmin/activity-requests/:id" element={<DetailRequestActivityPage />} />

          <Route path="/superadmin/activity/history" element={<HistoryActivityPage />} />

          <Route path="/superadmin/activity/history/:id" element={<DetailHistoryActivityPage />} />

          <Route path="/superadmin/dashboard" element={<DashboardSuperAdmin />} />

          <Route path="/superadmin/settings" element={<SettingPage />} />
          
        </Route>

        {/* Route ของ admin */}
        <Route path="/admin" element={<AdminLayout />}>

          <Route path="/admin/activity" element={<AdminManageActivityPage />} />

          <Route path="/admin/activity/:id" element={<AdminDetailActivityPage />} />

          <Route path="/admin/activity/:id/edit" element={<EditActivityPageAdmin />} />

          <Route path="/admin/activity/create" element={<CreateActivityPageAdmin />} />

          <Route path="/admin/activity/history" element={<AdminHistoryActivityPage />} />

          <Route path="/admin/activity/history/:id" element={<AdminDetailHistoryActivityPage />} />

          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          
        </Route>

      </Routes>
  );
}