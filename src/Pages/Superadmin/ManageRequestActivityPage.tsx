import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../Libs/axios';

export default function ManageRequestActivityPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ================= Pagination State =================
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // ================= Modal State =================
  type ModalStateType = 'none' | 'confirmApprove' | 'successApprove' | 'rejectReason' | 'confirmReject' | 'successReject';
  const [modalState, setModalState] = useState<ModalStateType>('none');
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/superadmin/activity-requests');
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

  // ฟังก์ชันแปลงประเภทกิจกรรมเป็นภาษาไทย
  const renderActivityType = (type: string) => {
    switch (type) {
      case 'PERFORMANCE_MUSIC': return 'การแสดง ดนตรี และความบันเทิง';
      case 'EXHIBITION_ART': return 'นิทรรศการและศิลปะ';
      case 'FOOD_DRINK_FESTIVAL': return 'เทศกาลอาหารและเครื่องดื่ม';
      case 'MARKET_FAIR': return 'ตลาดและงานแฟร์';
      case 'TRAINING_SEMINAR': return 'การศึกษาและอบรม';
      case 'SPORT_RECREATION': return 'กีฬาและนันทนาการ';
      case 'COMMUNITY_TOURISM': return 'การท่องเที่ยวชุมชน';
      case 'CULTURAL_FESTIVAL': return 'เทศกาลประเพณีและวัฒนธรรม';
      default: return type || '-';
    }
  };

  // ฟังก์ชันแปลงวันที่แบบสั้น
  const formatShortDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = (d.getFullYear() + 543).toString().slice(-2);
    return `${day} ${month} ${year}`;
  };

  const formatShortDateRange = (start: string, end: string) => {
    if (!start && !end) return '-';
    if (start && !end) return formatShortDate(start);
    if (!start && end) return formatShortDate(end);
    return `${formatShortDate(start)} - ${formatShortDate(end)}`;
  };

  const renderLocation = (locationObj: any) => {
    if (!locationObj) return '-';
    const parts = [];
    if (locationObj.name) parts.push(locationObj.name);
    if (locationObj.province) parts.push(`จ.${locationObj.province}`);
    return parts.join(', ') || '-';
  };

  // ================= Pagination Logic =================
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const emptyRowsCount = rowsPerPage - currentItems.length;

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); 
  };

  // ================= Handlers สำหรับ อนุมัติ / ปฏิเสธ =================
  const removeActivityFromState = (id: number) => {
    setData(prev => prev.filter(item => item.id !== id));
    if (currentItems.length === 1 && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleApprove = async () => {
    if (selectedActivityId === null) return;
    setIsProcessing(true);
    try {
      await api.patch(`/superadmin/activity-requests/${selectedActivityId}/approve`);
      removeActivityFromState(selectedActivityId);
      setModalState('successApprove');
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.response?.data?.message || err.message}`);
      setModalState('none');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (selectedActivityId === null) return;
    setIsProcessing(true);
    try {
      await api.patch(`/superadmin/activity-requests/${selectedActivityId}/reject`, {
        reason: rejectReason
      });
      removeActivityFromState(selectedActivityId);
      setModalState('successReject');
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.response?.data?.message || err.message}`);
      setModalState('none');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setModalState('none');
    setSelectedActivityId(null);
    setRejectReason('');
  };

  return (
    <div className="w-full space-y-6 relative">
      
      <h1 className="text-[24px] font-bold text-[#712874]">อนุมัติกิจกรรม</h1>

      {/* ================= Filter Card ================= */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-[13px] text-gray-500 mb-1.5">ค้นหาด้วยชื่อกิจกรรม</label>
            <input type="text" placeholder="พิมพ์คำค้นหา" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#712874] focus:ring-1 focus:ring-[#712874] transition-colors" />
          </div>
          <div>
            <label className="block text-[13px] text-gray-500 mb-1.5">ค้นหาด้วยประเภทกิจกรรม</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#712874] bg-white transition-colors">
              <option>ทุกประเภท</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] text-gray-500 mb-1.5">ค้นหาด้วยภูมิภาค</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#712874] bg-white transition-colors">
              <option>ภูมิภาค</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] text-gray-500 mb-1.5">ค้นหาด้วยจังหวัด</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#712874] bg-white transition-colors">
              <option>ทุกจังหวัด</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[13px] text-gray-500 mb-1.5">ค้นหาด้วยอำเภอ</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#712874] bg-white transition-colors">
              <option>ทุกอำเภอ</option>
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[13px] text-gray-500 mb-1.5">ค้นหาด้วยตำบล</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#712874] bg-white transition-colors">
              <option>ทุกตำบล</option>
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[13px] text-gray-500 mb-1.5">วันที่เริ่มกิจกรรม</label>
            <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-[#712874] transition-colors" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[13px] text-gray-500 mb-1.5">วันที่สิ้นสุดกิจกรรม</label>
            <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-[#712874] transition-colors" />
          </div>
          
          <div className="flex space-x-2 pb-[1px] shrink-0">
              <button className="bg-purple-50 text-[#712874] font-medium px-4 py-2 rounded-lg text-[13px] hover:bg-purple-100 transition-colors">
                ล้างค่า
              </button>
              <button className="bg-[#712874] text-white font-medium px-5 py-2 rounded-lg text-[13px] hover:bg-purple-900 transition-colors">
                ค้นหากิจกรรม
              </button>
          </div>
        </div>
      </div>

      {/* ================= Table Card ================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F5F8] text-[#712874] text-[14px] border-b border-gray-100">
                <th className="py-4 px-6 font-semibold w-[25%]">ชื่อกิจกรรม</th>
                <th className="py-4 px-6 font-semibold w-[20%]">ประเภท</th>
                <th className="py-4 px-6 font-semibold w-[20%]">สถานที่</th>
                <th className="py-4 px-6 font-semibold w-[20%]">วันเวลา</th>
                <th className="py-4 px-6 font-semibold text-center w-[15%]">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-[14px]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">กำลังโหลดข้อมูล...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-red-500">{error}</td>
                </tr>
              ) : currentItems && currentItems.length > 0 ? (
                <>
                  {currentItems.map((item: any, index: number) => (
                    <tr key={`data-${index}`} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      {/* ⭐ เพิ่ม Link ไปหน้า Detail ตาม Request */}
                      <td className="py-4 px-6 font-medium text-[#712874] hover:underline cursor-pointer">
                        <Link to={`/superadmin/activity-requests/${item.id}`}>
                          {item.name || '-'}
                        </Link>
                      </td>
                      <td className="py-4 px-6">{renderActivityType(item.activityType)}</td>
                      <td className="py-4 px-6">{renderLocation(item.location)}</td>
                      <td className="py-4 px-6">{formatShortDateRange(item.startDate, item.dueDate)}</td>
                      <td className="py-4 px-6 flex justify-center space-x-2">
                        
                        {/* ปุ่มปฏิเสธ */}
                        <button 
                          onClick={() => {
                            setSelectedActivityId(item.id);
                            setRejectReason('');
                            setModalState('rejectReason');
                          }}
                          className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-md text-[13px] font-medium hover:border-[#712874] hover:text-[#712874] transition-colors bg-white"
                        >
                          ปฏิเสธ
                        </button>

                        {/* ปุ่มอนุมัติ */}
                        <button 
                          onClick={() => {
                            setSelectedActivityId(item.id);
                            setModalState('confirmApprove');
                          }}
                          className="bg-[#712874] text-white px-4 py-1.5 rounded-md text-[13px] font-medium hover:bg-purple-900 transition-colors"
                        >
                          อนุมัติ
                        </button>

                      </td>
                    </tr>
                  ))}
                  
                  {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, index) => (
                    <tr key={`empty-${index}`} className="border-b border-gray-50 h-[53px]">
                      <td className="py-4 px-6">&nbsp;</td><td className="py-4 px-6">&nbsp;</td><td className="py-4 px-6">&nbsp;</td><td className="py-4 px-6">&nbsp;</td><td className="py-4 px-6">&nbsp;</td>
                    </tr>
                  ))}
                </>
              ) : (
                <>
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500 h-[53px] border-b border-gray-50">
                      ไม่พบคำร้องขออนุมัติกิจกรรม
                    </td>
                  </tr>
                  {Array.from({ length: rowsPerPage - 1 }).map((_, index) => (
                    <tr key={`empty-no-data-${index}`} className="border-b border-gray-50 h-[53px]">
                      <td colSpan={5}>&nbsp;</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
        
        {/* ================= Pagination / Footer ================= */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-[13px] text-gray-600 bg-[#FAFAFA]">
          <div className="flex items-center space-x-6">
            <span>ทั้งหมด {data.length} แถว</span>
            <div className="flex items-center space-x-2">
              <span>จำนวนแถวต่อหน้า</span>
              <select 
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#712874] bg-white cursor-pointer"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span>
              {data.length === 0 ? 0 : indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, data.length)} จาก {data.length}
            </span>
            <div className="flex space-x-1">
              <button 
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 1}
                className={`p-1.5 transition-colors rounded ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-[#712874] hover:bg-purple-50'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button 
                onClick={() => handlePageChange('next')}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`p-1.5 transition-colors rounded ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-[#712874] hover:bg-purple-50'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* ================= MODALS SECTION ================= */}

      {/* 1. Modal: ยืนยันการอนุมัติกิจกรรม */}
      {modalState === 'confirmApprove' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[420px] p-10 flex flex-col items-center shadow-xl animate-fade-in-up">
            <div className="w-[64px] h-[64px] rounded-full border-[3px] border-black flex items-center justify-center mb-6">
              <span className="text-[36px] font-bold text-black leading-none">!</span>
            </div>
            <h3 className="text-[20px] font-bold text-gray-900 mb-3">ยืนยันการอนุมัติกิจกรรม</h3>
            <p className="text-[14px] text-gray-500 mb-8 text-center">คุณต้องการยืนยันการอนุมัติกิจกรรมหรือไม่</p>
            <div className="flex space-x-4 w-full justify-center">
              <button onClick={closeModal} disabled={isProcessing} className="px-6 py-2.5 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors w-[120px]">
                ยกเลิก
              </button>
              <button onClick={handleApprove} disabled={isProcessing} className="px-6 py-2.5 bg-[#5B1F54] text-white rounded-lg text-[14px] font-medium hover:bg-[#461740] transition-colors w-[120px] flex justify-center items-center">
                {isProcessing ? 'รอสักครู่...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: อนุมัติกิจกรรมสำเร็จ */}
      {modalState === 'successApprove' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[420px] p-10 flex flex-col items-center shadow-xl animate-fade-in-up">
            <div className="w-[76px] h-[76px] rounded-full bg-[#6B2A68] flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-[20px] font-bold text-gray-900 mb-3">อนุมัติกิจกรรมสำเร็จ</h3>
            <p className="text-[14px] text-gray-500 mb-8 text-center">กิจกรรมถูกอนุมัติ</p>
            <button onClick={closeModal} className="px-8 py-2.5 bg-[#4A154B] text-white rounded-lg text-[14px] font-medium hover:bg-[#340f35] transition-colors w-[140px]">
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* 3. Modal: ปฏิเสธคำขออนุมัติ (กรอกเหตุผล) */}
      {modalState === 'rejectReason' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[420px] p-10 flex flex-col items-center shadow-xl animate-fade-in-up">
            <div className="w-[64px] h-[64px] rounded-full border-[3px] border-black flex items-center justify-center mb-6">
              <span className="text-[36px] font-bold text-black leading-none">!</span>
            </div>
            <h3 className="text-[20px] font-bold text-gray-900 mb-3">ปฏิเสธคำขออนุมัติ</h3>
            <p className="text-[14px] text-gray-500 mb-6 text-center">กรุณากรอกเหตุผลการปฏิเสธ</p>
            
            <textarea 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="ประเภทไม่ถูก"
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#712874] resize-none mb-8"
            ></textarea>

            <div className="flex space-x-4 w-full justify-center">
              <button onClick={closeModal} className="px-6 py-2.5 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors w-[120px]">
                ยกเลิก
              </button>
              <button 
                onClick={() => setModalState('confirmReject')} 
                disabled={!rejectReason.trim()}
                className="px-6 py-2.5 bg-[#5B1F54] text-white rounded-lg text-[14px] font-medium hover:bg-[#461740] disabled:opacity-50 transition-colors w-[120px]"
              >
                ส่ง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: ยืนยันการปฏิเสธกิจกรรม */}
      {modalState === 'confirmReject' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[420px] p-10 flex flex-col items-center shadow-xl animate-fade-in-up">
            <div className="w-[64px] h-[64px] rounded-full border-[3px] border-black flex items-center justify-center mb-6">
              <span className="text-[36px] font-bold text-black leading-none">!</span>
            </div>
            <h3 className="text-[20px] font-bold text-gray-900 mb-3">ยืนยันการปฏิเสธกิจกรรม</h3>
            <p className="text-[14px] text-gray-500 mb-8 text-center">คุณต้องการยืนยันการปฏิเสธกิจกรรมหรือไม่</p>
            <div className="flex space-x-4 w-full justify-center">
              <button onClick={() => setModalState('rejectReason')} disabled={isProcessing} className="px-6 py-2.5 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors w-[120px]">
                ยกเลิก
              </button>
              <button onClick={handleReject} disabled={isProcessing} className="px-6 py-2.5 bg-[#5B1F54] text-white rounded-lg text-[14px] font-medium hover:bg-[#461740] transition-colors w-[120px] flex justify-center items-center">
                {isProcessing ? 'รอสักครู่...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: ปฏิเสธกิจกรรมสำเร็จ */}
      {modalState === 'successReject' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[420px] p-10 flex flex-col items-center shadow-xl animate-fade-in-up">
            <div className="w-[76px] h-[76px] rounded-full bg-[#6B2A68] flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-[20px] font-bold text-gray-900 mb-3">ปฏิเสธกิจกรรมสำเร็จ</h3>
            <p className="text-[14px] text-gray-500 mb-8 text-center">กิจกรรมถูกปฏิเสธ</p>
            <button onClick={closeModal} className="px-8 py-2.5 bg-[#4A154B] text-white rounded-lg text-[14px] font-medium hover:bg-[#340f35] transition-colors w-[140px]">
              ปิด
            </button>
          </div>
        </div>
      )}

    </div>
  );
}