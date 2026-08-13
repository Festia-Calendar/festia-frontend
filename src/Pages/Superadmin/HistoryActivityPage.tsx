import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../Libs/axios';

export default function HistoryActivityPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ================= Pagination State =================
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/superadmin/activity/histories');
      const activities = response.data.data || response.data;
      setData(activities);
    } catch (err: any) {
      setError(err.message || 'ดึงข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  // ================= Helper Functions =================
  const formatActivityType = (type: string) => {
    switch (type) {
      case 'CULTURAL_FESTIVAL': return 'เทศกาลประเพณีและวัฒนธรรม';
      case 'EXHIBITION_ART': return 'นิทรรศการและศิลปะ';
      case 'PERFORMANCE_MUSIC': return 'การแสดง ดนตรี และความบันเทิง';
      case 'FOOD_DRINK_FESTIVAL': return 'เทศกาลอาหารและเครื่องดื่ม';
      case 'MARKET_FAIR': return 'ตลาดนัดช้อปปิ้ง และงานแฟร์';
      case 'TRAINING_SEMINAR': return 'การอบรมและเสวนา';
      case 'SPORT_RECREATION': return 'กีฬา นันทนาการ';
      case 'COMMUNITY_TOURISM': return 'ท่องเที่ยวชุมชน';
      default: return type || '-';
    }
  };

  const formatDateRange = (start: string, end: string) => {
    if (!start || !end) return '-';
    
    const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    
    const startDate = new Date(start);
    const endDate = new Date(end);

    const startStr = `${startDate.getDate()} ${thaiMonths[startDate.getMonth()]} ${(startDate.getFullYear() + 543).toString().slice(-2)}`;
    const endStr = `${endDate.getDate()} ${thaiMonths[endDate.getMonth()]} ${(endDate.getFullYear() + 543).toString().slice(-2)}`;

    return `${startStr} - ${endStr}`;
  };

  const formatPrice = (price: any) => {
    if (price === null || price === undefined || Number(price) === 0) {
      return 'ฟรี';
    }
    return `${Number(price).toLocaleString()} บาท`;
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

  return (
    <div className="w-full space-y-6 relative">
      
      <h1 className="text-[24px] font-bold text-[#712874]">ประวัติกิจกรรม</h1>

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
                <th className="py-4 px-6 font-semibold w-[25%]">สถานที่</th>
                <th className="py-4 px-6 font-semibold w-[20%]">วันเวลา</th>
                <th className="py-4 px-6 font-semibold w-[10%]">ค่าเข้าชม</th>
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
                    <tr 
                      key={`data-${index}`} 
                      onClick={() => navigate(`/superadmin/activity/history/${item.id}`)}
                      className="border-b border-gray-50 hover:bg-purple-50/50 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6 font-medium text-gray-800">{item.name || '-'}</td>
                      <td className="py-4 px-6">{formatActivityType(item.activityType)}</td>
                      <td className="py-4 px-6">{item.location?.name || '-'}</td>
                      <td className="py-4 px-6">{formatDateRange(item.startDate, item.dueDate)}</td>
                      <td className="py-4 px-6 font-medium">{formatPrice(item.price)}</td>
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
                    <td colSpan={5} className="py-4 text-center text-gray-500 h-[53px] border-b border-gray-50">ไม่พบข้อมูลประวัติกิจกรรม</td>
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

    </div>
  );
}