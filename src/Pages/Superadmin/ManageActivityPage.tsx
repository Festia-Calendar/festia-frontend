import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../Libs/axios';
import logo from '../../assets/logoadmin.png'; 

// สามารถแยก Navbar / Sidebar ไปเป็น Layout Component ได้ในอนาคต
export default function ManageActivitySuperAdmin() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 1. สร้าง State สำหรับเก็บข้อมูล User ที่ Login
  const [currentUser, setCurrentUser] = useState<{ fname?: string; lname?: string } | null>(null);

  useEffect(() => {
    // 2. ดึงข้อมูล User จาก localStorage เมื่อโหลดหน้านี้
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    const fetchData = async () => {
      try {
        const response = await api.get('/superadmin/activities');
        // สมมติว่า Backend ส่งกลับมาในรูปแบบ { data: [...] } หรือเป็น Array โดยตรง
        const activities = response.data.data || response.data;
        setData(activities);
      } catch (err: any) {
        setError(err.message || 'ดึงข้อมูลไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ฟังก์ชันแปลงสถานะภาษาอังกฤษเป็นภาษาไทย (อ้างอิงจาก Seed Data)
  const renderStatus = (status: string) => {
    switch (status) {
      case 'PUBLISH': return 'เผยแพร่';
      case 'UNPUBLISH': return 'ไม่เผยแพร่';
      case 'DRAFT': return 'แบบร่าง';
      default: return status || 'ไม่ระบุ';
    }
  };

  // 3. เตรียมตัวแปรชื่อ-นามสกุล สำหรับนำไปแสดงผล
  const fullName = currentUser 
    ? `${currentUser.fname || ''} ${currentUser.lname || ''}`.trim() 
    : 'กำลังโหลด...';

  return (
    <div className="flex h-screen bg-[#FDFBF7] font-sarabun text-gray-800">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-100 mt-4 mb-2">
          <div className="flex flex-col items-center">
              <img src={logo} alt="Festia Logo" className="w-16 h-auto" />
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {/* Active Menu */}
          <a href="#" className="flex items-center px-4 py-3 bg-purple-50 text-[#6C256B] rounded-lg font-semibold border-l-4 border-[#6C256B]">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            จัดการกิจกรรม
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            อนุมัติกิจกรรม
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            ประวัติกิจกรรม
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            รายงาน
          </a>
        </nav>

        {/* Bottom Menu */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <a href="#" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            การตั้งค่า
          </a>
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/'; }}
            className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Topbar */}
        <header className="h-20 bg-white flex justify-end items-center px-8 shadow-sm z-0">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 bg-blue-100 rounded-full overflow-hidden border border-blue-200">
              {/* 4. นำชื่อที่ได้มาสร้างรูปโปรไฟล์อัตโนมัติ */}
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=c7d2fe&color=3730a3`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* 5. แสดงชื่อ-นามสกุล */}
            <span className="font-semibold text-gray-700">{fullName}</span>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          
          <h1 className="text-2xl font-bold text-[#6C256B] mb-6">จัดการกิจกรรม</h1>

          {/* Filter Card */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">ค้นหาด้วยชื่อกิจกรรม</label>
                <input type="text" placeholder="พิมพ์คำค้นหา" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C256B]" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">ค้นหาด้วยประเภทกิจกรรม</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C256B] bg-white appearance-none">
                  <option>ทุกประเภท</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">ค้นหาด้วยภูมิภาค</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C256B] bg-white appearance-none">
                  <option>ภูมิภาค</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">ค้นหาด้วยจังหวัด</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C256B] bg-white appearance-none">
                  <option>ทุกจังหวัด</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm text-gray-500 mb-1">ค้นหาด้วยอำเภอ</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C256B] bg-white appearance-none">
                  <option>ทุกอำเภอ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">ค้นหาด้วยตำบล</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6C256B] bg-white appearance-none">
                  <option>ทุกตำบล</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">วันที่เริ่มกิจกรรม</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-[#6C256B]" />
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-sm text-gray-500 mb-1">วันที่สิ้นสุดกิจกรรม</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-[#6C256B]" />
                </div>
                <div className="flex space-x-2 pb-0 mb-0">
                    <button className="bg-purple-100 text-[#6C256B] font-medium px-4 py-2 rounded-lg text-sm hover:bg-purple-200 transition-colors h-[38px] mt-[24px]">
                    ล้างค่า
                    </button>
                    <button className="bg-[#6C256B] text-white font-medium px-6 py-2 rounded-lg text-sm hover:bg-purple-900 transition-colors h-[38px] mt-[24px]">
                    ค้นหากิจกรรม
                    </button>
                </div>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <div className="flex justify-end mb-4">
            <button className="bg-[#6C256B] text-white font-medium px-6 py-2.5 rounded-xl text-sm hover:bg-purple-900 transition-colors shadow-sm">
              สร้างกิจกรรมใหม่
            </button>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-purple-50 text-[#6C256B] text-sm">
                    <th className="py-4 px-6 font-semibold w-1/4">ชื่อกิจกรรม</th>
                    <th className="py-4 px-6 font-semibold w-1/5">ประเภท</th>
                    <th className="py-4 px-6 font-semibold w-1/4">สถานที่</th>
                    <th className="py-4 px-6 font-semibold">สถานะ</th>
                    <th className="py-4 px-6 font-semibold text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-red-500">{error}</td>
                    </tr>
                  ) : data && data.length > 0 ? (
                    data.map((item: any, index: number) => (
                      <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 font-medium text-[#6C256B] hover:underline cursor-pointer">
                          <Link to={`/superadmin/activity/${item.id}`}>
                            {item.name || '-'}
                          </Link>
                        </td>
                        <td className="py-4 px-6">{item.activityType || item.type || '-'}</td>
                        <td className="py-4 px-6">{item.location?.name || '-'}</td>
                        <td className="py-4 px-6">{renderStatus(item.statusActivity)}</td>
                        <td className="py-4 px-6 flex justify-center space-x-3">
                          <button className="text-gray-400 hover:text-blue-600 transition-colors" title="แก้ไข">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </button>
                          <button className="text-gray-400 hover:text-red-600 transition-colors" title="ลบ">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                     // Fallback mock data ถ้าไม่มีข้อมูลจาก Backend เพื่อให้แสดงหน้าตาเหมือนในรูป
                     <>
                        <tr className="border-b border-gray-50">
                            <td className="py-4 px-6">นิทรรศการสัญจร "ชีวิต เวลา ยืดหยุ่น"</td>
                            <td className="py-4 px-6">นิทรรศการและศิลปะ</td>
                            <td className="py-4 px-6">ณ หอศิลป์บ้านจิม, จ.กรุงเทพ</td>
                            <td className="py-4 px-6">เผยแพร่</td>
                            <td className="py-4 px-6 flex justify-center space-x-3">
                                <button className="text-gray-400 hover:text-blue-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                                <button className="text-gray-400 hover:text-red-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                            </td>
                        </tr>
                        <tr className="border-b border-gray-50">
                            <td className="py-4 px-6">Monster Music Festival 2026</td>
                            <td className="py-4 px-6">การแสดง ดนตรี และความบันเทิง</td>
                            <td className="py-4 px-6">ศูนย์การประชุมแห่งชาติสิริกิติ์ จ.เลย</td>
                            <td className="py-4 px-6">ไม่เผยแพร่</td>
                            <td className="py-4 px-6 flex justify-center space-x-3">
                                <button className="text-gray-400 hover:text-blue-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                                <button className="text-gray-400 hover:text-red-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                            </td>
                        </tr>
                     </>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination / Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600 bg-white">
              <div className="flex items-center space-x-4">
                <span>ทั้งหมด {data?.length || 2} แถว</span>
                <div className="flex items-center space-x-2">
                  <span>จำนวนแถวต่อหน้า</span>
                  <select className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#6C256B]">
                    <option>10</option>
                    <option>20</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span>1-2 จาก 2</span>
                <div className="flex space-x-1">
                  <button className="p-1 text-gray-400 hover:text-[#6C256B] disabled:opacity-50"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg></button>
                  <button className="p-1 text-gray-400 hover:text-[#6C256B]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></button>
                </div>
              </div>
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}