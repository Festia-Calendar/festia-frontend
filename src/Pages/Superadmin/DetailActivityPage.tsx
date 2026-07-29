import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../Libs/axios';
import logo from '../../assets/logoadmin.png';

export default function DetailActivityPage() {
  const { id } = useParams(); // รับ ID จาก URL
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<{ fname?: string; lname?: string } | null>(null);

  useEffect(() => {
    // ดึงข้อมูล User จาก localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    const fetchDetail = async () => {
      try {
        const response = await api.get(`/superadmin/activity/${id}`);
        setData(response.data.data || response.data);
      } catch (error) {
        console.error("Fetch detail error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const fullName = currentUser ? `${currentUser.fname || ''} ${currentUser.lname || ''}`.trim() : 'Admin';

  // ================= Helper Functions สำหรับแปลงวันที่และเวลา =================
  const formatThaiDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatThaiTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
  };

  const formatThaiDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return `${formatThaiDate(dateString)} ${formatThaiTime(dateString)}`;
  };
  // =========================================================================

  const mockActivity = {
    name: "เทศกาลผีตาโขน ประจำปี 2569",
    tagline: "ร่วมสืบสานประเพณีละเล่นหน้ากากผีตาโขน...",
    startDate: "26 มิ.ย. 2569",
    locationDetail: "วัดโพนชัย อ.ด่านซ้าย จ.เลย",
    latlng: "17.2764, 101.1472",
    mapLink: "https://maps.app.goo.gl/...",
    contact: "012-345-1221",
    price: "ฟรี",
    description: "งานประเพณีบุญหลวงและการละเล่นผีตาโขน...",
    schedules: [],
    createdBy: null,
    createdAt: null,
    updatedBy: null,
    updatedAt: null
  };

  const activity = data || mockActivity;

  return (
    <div className="flex h-screen bg-[#FDFBF7] font-sarabun text-gray-800">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10 shrink-0">
        <div className="h-16 flex items-center justify-center border-b border-gray-100 mt-4 mb-2">
          <div className="flex flex-col items-center">
              <img src={logo} alt="Festia Logo" className="w-16 h-auto" />
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/superadmin/activity" className="flex items-center px-4 py-3 bg-purple-50 text-[#6C256B] rounded-lg font-semibold border-l-4 border-[#6C256B]">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            จัดการกิจกรรม
          </Link>
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
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=c7d2fe&color=3730a3`} alt="Profile" className="w-full h-full object-cover"/>
            </div>
            <span className="font-semibold text-gray-700">{fullName}</span>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 lg:px-12">
          
          <div className="flex items-center space-x-4 mb-6">
            <Link to="/superadmin/activity" className="text-gray-400 hover:text-[#6C256B] transition-colors">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </Link>
            <h1 className="text-2xl font-bold text-[#6C256B]">รายละเอียดกิจกรรม</h1>
          </div>

          {loading ? (
             <p className="text-center text-gray-500 mt-10">กำลังโหลดข้อมูล...</p>
          ) : (
            <div className="space-y-6 w-full">
              
              {/* 1. Header Section (Poster & Info) */}
              <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Poster Left */}
                  <div className="lg:col-span-4 flex flex-col space-y-4">
                    <div className="w-full h-[400px] bg-gray-900 rounded-xl overflow-hidden relative shadow-md flex items-center justify-center">
                      <span className="text-white font-bold text-xl">ไม่มีรูปภาพ</span>
                    </div>
                    {/* Thumbnails จำลอง */}
                    <div className="grid grid-cols-4 gap-2">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="aspect-square bg-gray-200 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 flex items-center justify-center text-xs text-gray-500">
                          รูป {i}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Info Right */}
                  <div className="lg:col-span-8 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-3xl font-bold text-gray-800 leading-tight">{activity.name}</h2>
                      <button className="flex items-center space-x-2 bg-[#6C256B] text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-900 transition-colors shadow-sm shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        <span>แก้ไข</span>
                      </button>
                    </div>
                    
                    <p className="text-[#6C256B] font-medium text-lg border-l-4 border-[#6C256B] pl-4 mb-6">
                      {activity.tagline}
                    </p>

                    <div className="grid grid-cols-[140px_1fr] gap-y-4 text-sm text-gray-700 mb-6">
                      <span className="font-semibold text-gray-500">วันที่</span>
                      <span>{formatThaiDate(activity.startDate)}</span>
                      
                      <span className="font-semibold text-gray-500">สถานที่จัดงาน</span>
                      <span>{activity.location?.name || '-'}</span>
                      
                      <span className="font-semibold text-gray-500">ละติจูด ลองจิจูด</span>
                      <span>{activity.location?.latitude ? `${activity.location.latitude}, ${activity.location.longitude}` : '-'}</span>
                      
                      <span className="font-semibold text-gray-500">แผนที่</span>
                      {activity.location?.latitude && activity.location?.longitude ? (
                        <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${activity.location.latitude},${activity.location.longitude}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline break-all text-xs"
                        >
                            {`https://www.google.com/maps/search/?api=1&query=${activity.location.latitude},${activity.location.longitude}`}
                        </a>
                      ) : (
                        <span>-</span>
                      )}
                      
                      <span className="font-semibold text-gray-500">ติดต่อ</span>
                      <span>{activity.phone || '-'}</span>
                      
                      <span className="font-semibold text-gray-500">ค่าเข้าชม</span>
                      <span className="text-green-600 font-semibold">{Number(activity.price) === 0 ? 'ฟรี' : `${activity.price} บาท`}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* 2. Description Section */}
              <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
                <h3 className="text-lg font-bold text-[#6C256B] mb-4 border-b border-gray-100 pb-2">รายละเอียดกิจกรรม</h3>
                <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                  {activity.description}
                </p>
              </div>

              {/* 3. Schedule Section */}
              <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
                <h3 className="text-lg font-bold text-[#6C256B] mb-6 border-b border-gray-100 pb-2">กำหนดการกิจกรรม</h3>
                
                <div className="space-y-6">
                  {activity.schedules && activity.schedules.length > 0 ? (
                    activity.schedules.map((schedule: any, idx: number) => (
                      <div key={idx} className="flex flex-col md:flex-row md:space-x-6 border-b border-dashed border-gray-200 pb-6 last:border-0 last:pb-0">
                        <div className="w-48 shrink-0 text-[#6C256B] font-semibold text-sm mb-2 md:mb-0">
                          <span>{formatThaiDate(schedule.startDateTime)}</span><br/>
                          <span className="text-gray-500">{formatThaiTime(schedule.startDateTime)} - {formatThaiTime(schedule.endDateTime)}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 text-sm font-semibold mb-1">{schedule.title}</p>
                          <p className="text-gray-600 text-sm mb-3">{schedule.description}</p>
                          {/* Schedule Thumbnails จำลอง */}
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4].map((imgIdx) => (
                              <div key={imgIdx} className="w-20 h-14 bg-gray-200 rounded-md overflow-hidden border border-gray-200 flex items-center justify-center text-[10px] text-gray-500">
                                รูปย่อย {imgIdx}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">ไม่มีกำหนดการ</p>
                  )}
                </div>
              </div>

              {/* 4. Footer Meta */}
              <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row justify-between text-sm text-gray-500">
                <div className="flex space-x-6 mb-2 md:mb-0">
                  <span className="font-semibold text-[#6C256B]">สร้างโดย</span>
                  <span>{activity.createdBy ? `${activity.createdBy.fname} ${activity.createdBy.lname}` : '-'}</span>
                  <span>{formatThaiDateTime(activity.createdAt)}</span>
                </div>
                <div className="flex space-x-6">
                  <span className="font-semibold text-[#6C256B]">แก้ไขล่าสุดโดย</span>
                  <span>{activity.updatedBy ? `${activity.updatedBy.fname} ${activity.updatedBy.lname}` : '-'}</span>
                  <span>{formatThaiDateTime(activity.updatedAt)}</span>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}