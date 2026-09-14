/**
 * คำอธิบาย : Component สำหรับแสดงตารางรายการกิจกรรม 
 * รองรับการใช้งาน 3 โหมด: จัดการกิจกรรม (manage), อนุมัติคำขอ (request), และประวัติ (history)
 * สามารถปรับเปลี่ยนการแสดงผลปุ่ม Action (ลบ, แก้ไข, อนุมัติ) ได้ตามโหมดและสิทธิ์ (Admin/Superadmin)
 */

import { Link } from 'react-router-dom';

// ประกาศ Type สำหรับ Props ที่รับเข้ามา
interface ActivityTableProps {
  mode: 'manage' | 'request' | 'history'; 
  isAdmin?: boolean; 
  data: any[];
  loading: boolean;
  error: string | null;
  emptyRowsCount: number;
  rowsPerPage: number;
  ACTIVITY_TYPE_MAP: Record<string, string>;
  openDeleteConfirm?: (id: number) => void;
  openRejectModal?: (id: number) => void;
  openApproveConfirm?: (id: number) => void;
}

/**
 * คำอธิบาย : ฟังก์ชัน Component ตารางสำหรับแสดงและจัดการรายการกิจกรรม
 * Input: props (ActivityTableProps) - ข้อมูลกิจกรรม, โหมดการแสดงผล, สิทธิ์แอดมิน, และฟังก์ชันสำหรับ Modal
 * Output: ตาราง HTML (Table) ที่แสดงข้อมูลกิจกรรมพร้อมปุ่ม Action ตามโหมดที่ระบุ
 */
export default function ActivityTable({
  mode, isAdmin = false, data, loading, error, emptyRowsCount, rowsPerPage, ACTIVITY_TYPE_MAP,
  openDeleteConfirm, openRejectModal, openApproveConfirm
}: ActivityTableProps) {

  // ================= Helper Functions =================

  /**
   * คำอธิบาย : ฟังก์ชันจัดรูปแบบสถานที่จัดกิจกรรมให้เป็นข้อความที่อ่านง่าย (จังหวัด, อำเภอ, ตำบล)
   * Input: item (Object ข้อมูลกิจกรรม 1 แถว)
   * Output: string (ข้อความที่อยู่แบบย่อ เช่น "ชื่อสถานที่, ต.หมูสี, อ.ปากช่อง, จ.นครราชสีมา")
   */
  const renderLocation = (item: any) => {
    const locName = item.location?.name || item.locationName;
    const subDistrict = item.location?.subDistrict || item.location?.subdistrict || item.location?.tambon || item.subDistrict || item.subdistrict || item.tambon;
    const district = item.location?.district || item.location?.amphure || item.location?.amphoe || item.district || item.amphure || item.amphoe;
    const province = item.location?.province || item.province || item.location?.provinceName;
    const parts: string[] = [];
    if (locName) parts.push(locName);
    if (subDistrict) parts.push(`ต.${String(subDistrict).replace(/^(ตำบล|ต\.)/g, '').trim()}`);
    if (district) parts.push(`อ.${String(district).replace(/^(อำเภอ|อ\.)/g, '').trim()}`);
    if (province) parts.push(`จ.${String(province).replace(/^(จังหวัด|จ\.)/g, '').trim()}`);
    return parts.length > 0 ? parts.join(', ') : '-';
  };

  /**
   * คำอธิบาย : ฟังก์ชันแปลงสถานะภาษาอังกฤษให้เป็นภาษาไทยสำหรับแสดงผล
   * Input: status (string)
   * Output: string (สถานะภาษาไทย)
   */
  const renderStatus = (status: string) => {
    switch (status) {
      case 'PUBLISH': return 'เผยแพร่';
      case 'UNPUBLISH': return 'ไม่เผยแพร่';
      case 'DRAFT': return 'แบบร่าง';
      default: return status || 'ไม่ระบุ';
    }
  };

  /**
   * คำอธิบาย : ฟังก์ชันจัดรูปแบบวันที่แบบย่อ สำหรับแสดงในตาราง
   * Input: start (วันที่เริ่มต้น), end (วันที่สิ้นสุด)
   * Output: string (ตัวอย่าง: "1 ม.ค. 67 - 5 ม.ค. 67")
   */
  const formatShortDateRange = (start: string, end: string) => {
    if (!start && !end) return '-';
    const format = (dateString: string) => {
      const d = new Date(dateString);
      const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      return `${d.getDate()} ${months[d.getMonth()]} ${(d.getFullYear() + 543).toString().slice(-2)}`;
    };
    if (start && !end) return format(start);
    if (!start && end) return format(end);
    return `${format(start)} - ${format(end)}`;
  };

  /**
   * คำอธิบาย : ฟังก์ชันจัดรูปแบบราคา หากเป็น 0 หรือว่างให้แสดงคำว่า "ฟรี"
   * Input: price (จำนวนเงิน)
   * Output: string
   */
  const formatPrice = (price: any) => {
    if (price === null || price === undefined || Number(price) === 0) {
      return 'ฟรี';
    }
    return `${Number(price).toLocaleString()} บาท`;
  };

  /**
   * คำอธิบาย : ฟังก์ชันสร้าง URL สำหรับกดดูรายละเอียดกิจกรรม (แยกตาม Role และ Mode)
   * Input: id (ID ของกิจกรรม)
   * Output: string (URL Path)
   */
  const getLinkPath = (id: number) => {
    const basePath = isAdmin ? '/admin' : '/superadmin';
    if (mode === 'manage') return `${basePath}/activity/${id}`;
    if (mode === 'request') return `${basePath}/activity-requests/${id}`;
    return `${basePath}/activity/history/${id}`; 
  };

  /**
   * คำอธิบาย : ฟังก์ชันสร้าง URL สำหรับกดแก้ไขกิจกรรม (แยกตาม Role)
   * Input: id (ID ของกิจกรรม)
   * Output: string (URL Path)
   */
  const getEditLinkPath = (id: number) => {
    const basePath = isAdmin ? '/admin' : '/superadmin';
    return `${basePath}/activity/${id}/edit`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#F8F5F8] text-[#712874] text-[14px] border-b border-gray-100">
            <th className="py-4 px-6 font-semibold w-[25%]">ชื่อกิจกรรม</th>
            <th className="py-4 px-6 font-semibold w-[18%]">ประเภท</th>
            <th className="py-4 px-6 font-semibold w-[27%]">สถานที่</th>
            
            {/* สลับคอลัมน์ตาม Mode */}
            {mode === 'manage' && <th className="py-4 px-6 font-semibold w-[15%]">สถานะ</th>}
            {mode === 'request' && <th className="py-4 px-6 font-semibold w-[15%]">วันเวลา</th>}
            {mode === 'history' && <th className="py-4 px-6 font-semibold w-[20%]">วันเวลา</th>}

            {mode === 'history' ? (
              <th className="py-4 px-6 font-semibold w-[10%]">ค่าเข้าชม</th>
            ) : (
              <th className="py-4 px-6 font-semibold text-center w-[15%]">จัดการ</th>
            )}
          </tr>
        </thead>
        <tbody className="text-gray-700 text-[14px]">
          {loading ? (
            <tr><td colSpan={5} className="py-12 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
          ) : error ? (
            <tr><td colSpan={5} className="py-12 text-center text-red-500">{error}</td></tr>
          ) : data && data.length > 0 ? (
            <>
              {data.map((item: any, index: number) => (
                <tr 
                  key={`data-${index}`} 
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  
                  {/* ชื่อกิจกรรม (UI เดียวกันทุกหน้า มีขีดเส้นใต้ตอน Hover) */}
                  <td className="py-4 px-6 font-medium text-[#712874] hover:underline cursor-pointer">
                    <Link to={getLinkPath(item.id)}>
                      {item.name || '-'}
                    </Link>
                  </td>
                  
                  {/* ประเภท & สถานที่ */}
                  <td className="py-4 px-6">{ACTIVITY_TYPE_MAP[item.activityType] || item.activityType || '-'}</td>
                  <td className="py-4 px-6">{renderLocation(item)}</td>
                  
                  {/* สถานะ หรือ วันเวลา */}
                  {mode === 'manage' && <td className="py-4 px-6">{renderStatus(item.statusActivity)}</td>}
                  {(mode === 'request' || mode === 'history') && <td className="py-4 px-6">{formatShortDateRange(item.startDate, item.dueDate)}</td>}
                  
                  {/* ปุ่มจัดการ หรือ ค่าเข้าชม */}
                  {mode === 'history' ? (
                    <td className="py-4 px-6 font-medium">{formatPrice(item.price)}</td>
                  ) : (
                    <td className="py-4 px-6 flex justify-center space-x-2">
                      {mode === 'manage' && (
                        <>
                          <Link to={getEditLinkPath(item.id)} className="text-gray-400 hover:text-blue-600 transition-colors" title="แก้ไข">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </Link>
                          <button onClick={(e) => { e.preventDefault(); openDeleteConfirm?.(item.id); }} className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer" title="ลบ">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </>
                      )}
                      {mode === 'request' && (
                        <>
                          <button onClick={(e) => { e.preventDefault(); openRejectModal?.(item.id); }} className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-md text-[13px] font-medium hover:border-[#712874] hover:text-[#712874] transition-colors bg-white">
                            ปฏิเสธ
                          </button>
                          <button onClick={(e) => { e.preventDefault(); openApproveConfirm?.(item.id); }} className="bg-[#712874] text-white px-4 py-1.5 rounded-md text-[13px] font-medium hover:bg-purple-900 transition-colors">
                            อนุมัติ
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              
              {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, index) => (
                <tr key={`empty-${index}`} className="border-b border-gray-50 h-[53px]">
                  <td colSpan={5}>&nbsp;</td>
                </tr>
              ))}
            </>
          ) : (
            <>
              <tr><td colSpan={5} className="py-4 text-center text-gray-500 h-[53px] border-b border-gray-50">ไม่พบข้อมูล</td></tr>
              {Array.from({ length: rowsPerPage - 1 }).map((_, index) => (
                <tr key={`empty-no-data-${index}`} className="border-b border-gray-50 h-[53px]"><td colSpan={5}>&nbsp;</td></tr>
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}