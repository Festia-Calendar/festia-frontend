/**
 * คำอธิบาย : โครงสร้างหลัก (Layout) สำหรับส่วนของ Admin
 * ประกอบด้วย Sidebar สำหรับแสดงเมนูนำทาง (Navigation) และ Topbar สำหรับแสดงโปรไฟล์ผู้ใช้งาน
 * ใช้แสดงครอบทุกหน้าในส่วนของ Admin โดยเนื้อหาแต่ละหน้าจะถูกแสดงตรงส่วน <Outlet />
 */

import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logoadmin.png';

/**
 * คำอธิบาย : ฟังก์ชัน โครงสร้างหน้าสำหรับ Admin
 * Input: -
 * Output: UI หลักที่มี Sidebar (ซ้าย), Topbar (บน), และพื้นที่แสดงเนื้อหา (ขวา)
 */
export default function AdminLayout() {
  const [currentUser, setCurrentUser] = useState<{ fname?: string; lname?: string } | null>(null);
  const location = useLocation();

  /**
   * คำอธิบาย : Hook สำหรับดึงข้อมูลผู้ใช้งาน (User) ที่เก็บไว้ใน localStorage หลังจาก Login
   * เพื่อนำมาแสดงชื่อโปรไฟล์ที่มุมขวาบน
   * Input: -
   * Output: -
   */
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const fullName = currentUser ? `${currentUser.fname || ''} ${currentUser.lname || ''}`.trim() : 'Admin';

  /**
   * คำอธิบาย : ฟังก์ชันเช็คว่าหน้าปัจจุบันตรงกับเมนูไหนใน Sidebar เพื่อกำหนดสไตล์ให้เมนูนั้นเด่นขึ้น (Active)
   * Input: path (URL ของเมนูที่ต้องการตรวจสอบ)
   * Output: string (CSS class name สำหรับกำหนดสไตล์ของปุ่มเมนู)
   */
  const getMenuClass = (path: string) => {
    let isActive = false;
    const pathname = location.pathname;

    if (path === '/admin/activity') {
      // หน้าจัดการกิจกรรม (รวมถึงหน้า create, edit, detail แต่ต้องไม่ใช่ history)
      isActive = pathname.startsWith('/admin/activity') && !pathname.includes('/history');
    } else if (path === '/admin/activity/history') {
      // หน้าประวัติกิจกรรม (ครอบคลุมทั้งตารางและรายละเอียด)
      isActive = pathname.includes('/activity/history');
    } else {
      // หน้าอื่นๆ ทั่วไป (เช่น dashboard)
      isActive = pathname.startsWith(path);
    }

    // ถ้า Active ให้เป็นสีม่วง / ถ้าไม่ให้เป็นสีเทาปกติ
    return isActive
      ? "flex items-center px-6 py-3 bg-purple-50 text-[#712874] font-semibold border-l-4 border-[#712874]"
      : "flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 font-medium transition-colors border-l-4 border-transparent";
  };

  return (
    // โครงสร้างหลัก
    <div className="fixed inset-0 flex bg-[#FDFBF7] font-sarabun text-gray-800">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-20">
        <div className="h-[76px] flex items-center justify-center border-b border-gray-100 flex-shrink-0">
          <img src={logo} alt="Festia Logo" className="w-24 h-auto" />
        </div>
        
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          
          <Link to="/admin/activity" className={getMenuClass('/admin/activity')}>
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            จัดการกิจกรรม
          </Link>

          <Link to="/admin/activity/history" className={getMenuClass('/admin/activity/history')}>
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            ประวัติกิจกรรม
          </Link>

          <Link to="/admin/dashboard" className={getMenuClass('/admin/dashboard')}>
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            รายงาน
          </Link>

        </nav>

        <div className="border-t border-gray-100 py-4 space-y-1 flex-shrink-0">
          <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="flex items-center w-full px-6 py-3 text-gray-600 hover:bg-gray-50 font-medium transition-colors text-left border-l-4 border-transparent">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* ================= RIGHT AREA ================= */}
      <div className="flex flex-col flex-1 min-w-0 bg-[#FDFBF7]">
        
        {/* TOPBAR */}
        <header className="h-[76px] flex-shrink-0 flex justify-end items-center px-10 z-10 border-b border-transparent">
          <div className="flex items-center space-x-3 cursor-pointer bg-white py-1.5 px-4 rounded-full shadow-sm border border-gray-100">
             <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200 bg-blue-100 flex items-center justify-center">
               <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=c7d2fe&color=3730a3`} alt="Profile" className="w-full h-full object-cover"/>
            </div>
            <span className="font-semibold text-gray-700 text-[13px]">{fullName}</span>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto px-10 pb-20 pt-2">
          {/* <Outlet /> คือจุดที่ React Router จะดึงหน้าเพจอื่นๆ มาแสดง */}
          <Outlet />
        </main>

      </div>
    </div>
  );
}