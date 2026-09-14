/**
 * คำอธิบาย : Component สำหรับหน้าจอแสดงรายละเอียดกิจกรรมสำหรับสิทธิ์ Admin (Admin Detail Activity Page)
 * ทำหน้าที่แสดงข้อมูลทั้งหมดของกิจกรรมที่ Admin รับผิดชอบ เช่น โปสเตอร์, สถานที่, ข้อมูลการติดต่อ, และกำหนดการย่อย พร้อมกับปุ่มเชื่อมโยงไปยังหน้าแก้ไข
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

// Import Services
import { activityService } from '../../Services/activity.service';

// Import Components
import ActivityMediaViewer from '../../Components/ActivityMediaViewer';

// Import รูปภาพ Facebook และ Line จาก assets
import facebookIcon from '../../assets/facebook.png'; 
import lineIcon from '../../assets/line.png'; 

/**
 * คำอธิบาย : ฟังก์ชัน Component หลักสำหรับหน้ารายละเอียดกิจกรรมของ Admin
 * Input: -
 * Output: UI รายละเอียดกิจกรรมสำหรับ Admin พร้อมส่วนแสดงสื่อ, ข้อมูลรายละเอียด, กำหนดการ และลิงก์หน้าแก้ไข
 */
export default function AdminDetailActivityPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // State สำหรับเปิด Modal ดูรูปใหญ่ของส่วนกำหนดการ (Schedule)
  const [previewScheduleImage, setPreviewScheduleImage] = useState<string | null>(null);

  // ตั้งค่า Backend URL สำหรับรูปภาพ
  const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'; 
  
  /**
   * คำอธิบาย : แปลงและจัดการ URL ของรูปภาพเพื่อให้สามารถแสดงผลได้ถูกต้อง
   * Input: path (string) - เส้นทางของไฟล์รูปภาพ
   * Output: string (URL ที่สมบูรณ์สำหรับนำไปใช้งาน)
   */
  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:image')) return path;
    let cleanPath = path.replace(/\\/g, '/');
    if (!cleanPath.includes('uploads/')) cleanPath = `uploads/${cleanPath.replace(/^\//, '')}`;
    return `${BACKEND_URL}/${cleanPath.replace(/^\//, '')}`;
  };

  /**
   * คำอธิบาย : ตรวจสอบว่าไฟล์ใน path นั้นเป็นไฟล์วิดีโอหรือไม่ จากนามสกุลไฟล์
   * Input: path (string)
   * Output: boolean (True หากเป็นวิดีโอ, False หากไม่ใช่)
   */
  const isVideoFile = (path: string) => {
    if (!path) return false;
    const cleanPath = path.split('?')[0]; 
    return cleanPath.match(/\.(mp4|mov|m4v|webm)$/i) !== null;
  };

  /**
   * คำอธิบาย : Hook สำหรับดึงข้อมูลรายละเอียดกิจกรรมของ Admin จาก Backend ผ่าน activityService
   * Input: -
   * Output: -
   */
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        if (!id) return;
        const responseData = await activityService.getAdminActivityById(id);
        setData(responseData.data || responseData);
      } catch (error) {
        console.error("Fetch detail error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // ================= Formatting Helpers =================

  /**
   * คำอธิบาย : จัดรูปแบบช่วงวันที่ (Start Date - End Date) ให้แสดงเป็นภาษาไทย
   * Input: startStr (string), endStr (string)
   * Output: string
   */
  const formatDateRange = (startStr: string, endStr: string) => {
    if (!startStr) return '-';
    const startDate = new Date(startStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    if (!endStr) return startDate;
    const endDate = new Date(endStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    if (startDate === endDate) return startDate;
    return `${startDate} - ${endDate}`;
  };

  /**
   * คำอธิบาย : จัดรูปแบบวันที่และเวลาเต็มรูปแบบในภาษาไทย
   * Input: dateString (string)
   * Output: string
   */
  const formatThaiDateTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const dOnly = date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    const tOnly = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    return `${dOnly} ${tOnly} น.`;
  };

  /**
   * คำอธิบาย : จัดรูปแบบช่วงเวลาของกำหนดการย่อย
   * Input: start (string), end (string)
   * Output: string
   */
  const formatScheduleDateTime = (start: string, end: string) => {
    if (!start || !end) return '-';
    const startDate = new Date(start);
    const datePart = startDate.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
    const startTime = startDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(end).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    return `${datePart} ${startTime} - ${endTime} น.`;
  };

  if (loading) return <p className="text-center text-gray-500 mt-10">กำลังโหลดข้อมูล...</p>;
  if (!data) return <p className="text-center text-gray-500 mt-10">ไม่พบข้อมูลกิจกรรม</p>;

  const activity = data;
  const allMedia = activity.activityFile?.filter((f: any) => f.type === 'COVER' || f.type === 'GALLERY' || f.type === 'VIDEO') || [];

  return (
    <div className="w-full max-w-[1100px] mx-auto space-y-8 relative pb-10">
      
      {/* Header & Back Button */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => navigate('/admin/activity')}
          className="text-[#712874] hover:opacity-70 transition-opacity p-1 -ml-1 cursor-pointer flex items-center justify-center"
          title="ย้อนกลับ"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-[24px] font-bold text-[#712874]">รายละเอียดกิจกรรม</h1>
      </div>
      
      {/* กล่องแจ้งเตือนกรณีถูกปฏิเสธ (REJECTED) */}
      {activity.statusApprove === 'REJECTED' && (
        <div className="bg-[#FFF5F5] border border-red-200 rounded-2xl p-6 flex items-start space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 mt-0.5">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <div>
            <h4 className="text-[16px] font-bold text-gray-900 mb-1">ปฏิเสธคำขอ</h4>
            <p className="text-[14px] text-gray-600">
              <span className="font-semibold text-gray-700">เหตุผลปฏิเสธคำขอ : </span> 
              {activity.rejectReason || 'ไม่มีระบุเหตุผล'}
            </p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* รูปซ้ายมือ */}
        <div className="md:col-span-5 lg:col-span-4">
          <ActivityMediaViewer 
            mediaFiles={allMedia} 
            getImageUrl={getImageUrl} 
            isVideoFile={isVideoFile} 
          />
        </div>

        {/* ข้อมูลขวามือ */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-[32px] font-bold text-[#712874] leading-tight pr-4">{activity.name}</h2>
              
              <Link 
                to={`/admin/activity/${activity.id}/edit`}
                className="flex items-center space-x-1.5 bg-[#712874] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-900 transition-colors shadow-sm shrink-0 mt-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                <span>แก้ไข</span>
              </Link>
            </div>
            
            <p className="text-[#712874] font-semibold text-[15px] border-l-4 border-[#712874] pl-3 mb-6 whitespace-pre-line leading-relaxed">
              {activity.tagline}
            </p>

            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
                <div className="grid grid-cols-[120px_1fr] gap-y-3.5 text-[14px] text-gray-800 items-center">
                  <span className="font-semibold text-gray-600">วันที่</span>
                  <span>{formatDateRange(activity.startDate, activity.dueDate)}</span>
                  
                  <span className="font-semibold text-gray-600">สถานที่จัดงาน</span>
                  <span>{activity.location?.name || '-'}</span>
                  
                  <span className="font-semibold text-gray-600">ละติจูด ลองจิจูด</span>
                  <span>{activity.location?.latitude ? `${activity.location.latitude} , ${activity.location.longitude}` : '-'}</span>
                  
                  <span className="font-semibold text-gray-600">แผนที่</span>
                  {activity.location?.latitude && activity.location?.longitude ? (
                      <a href={`https://maps.app.goo.gl/search/${activity.location.latitude},${activity.location.longitude}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 hover:underline break-all">
                          {`https://maps.app.goo.gl/search/${activity.location.latitude},${activity.location.longitude}`}
                      </a>
                  ) : (<span>-</span>)}
                  
                  <span className="font-semibold text-gray-600">ติดต่อ</span>
                  <span>{activity.phone || '-'}</span>

                  {(activity.facebookUrl || activity.lineUrl) && (
                    <>
                      <span className="font-semibold text-gray-600">โซเชียลมีเดีย</span>
                      <div className="flex items-center gap-3">
                        {activity.facebookUrl && (
                          <a href={activity.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform"><img src={facebookIcon} alt="Facebook" className="w-8 h-8 object-contain" /></a>
                        )}
                        {activity.lineUrl && (
                          <a href={activity.lineUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform"><img src={lineIcon} alt="LINE" className="w-8 h-8 object-contain" /></a>
                        )}
                      </div>
                    </>
                  )}
                  
                  <span className="font-semibold text-gray-600">ค่าเข้าชม</span>
                  <span className="text-green-600 font-bold">{Number(activity.price) === 0 ? 'ฟรี' : `${activity.price} บาท`}</span>
                </div>
            </div>
          </div>

          {/* แผนที่ OpenStreetMap */}
          {activity.location?.latitude && activity.location?.longitude && (
              <div className="w-full h-44 rounded-xl overflow-hidden shadow-sm border border-gray-200 mt-auto">
                   <iframe title="OpenStreetMap" width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0} src={`https://www.openstreetmap.org/export/embed.html?bbox=${activity.location.longitude - 0.01}%2C${activity.location.latitude - 0.01}%2C${activity.location.longitude + 0.01}%2C${activity.location.latitude + 0.01}&layer=mapnik&marker=${activity.location.latitude}%2C${activity.location.longitude}`}></iframe>
              </div>
          )}
        </div>
      </div>

      {/* รายละเอียดกิจกรรม */}
      <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-[18px] font-bold text-[#712874] mb-5 pb-3 border-b border-dashed border-gray-200">รายละเอียดกิจกรรม</h3>
        <p className="text-gray-700 leading-relaxed text-[14px] whitespace-pre-line px-2">{activity.description}</p>
      </div>

      {/* กำหนดการกิจกรรม */}
      <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-[18px] font-bold text-[#712874] mb-6 pb-3 border-b border-dashed border-gray-200">กำหนดการกิจกรรม</h3>
        <div className="space-y-8 px-2">
          {activity.schedules && activity.schedules.length > 0 ? (
            activity.schedules.map((schedule: any, idx: number) => (
              <div key={idx} className="flex flex-col md:flex-row md:space-x-8 border-b border-dashed border-gray-200 pb-8 last:border-0 last:pb-0">
                <div className="w-48 shrink-0 text-[#712874] font-semibold text-[14px] mb-2 md:mb-0 pt-0.5">
                   <span>{formatScheduleDateTime(schedule.startDateTime, schedule.endDateTime)}</span>
                </div>
                <div className="flex-1">
                  {schedule.title && <p className="text-gray-800 text-[14px] font-semibold mb-1.5">{schedule.title}</p>}
                  {schedule.description && <p className="text-gray-600 text-[14px] mb-4">{schedule.description}</p>}
                  
                  {/* Schedule Media */}
                  {schedule.files && schedule.files.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {schedule.files.map((file: any, fileIdx: number) => (
                        <div 
                          key={fileIdx} 
                          onClick={() => setPreviewScheduleImage(getImageUrl(file.filePath))}
                          className="relative w-[120px] h-[80px] bg-black rounded-lg overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 flex items-center justify-center"
                        >
                           {isVideoFile(file.filePath) ? (
                             <><video src={getImageUrl(file.filePath)} className="w-full h-full object-cover opacity-70" /><div className="absolute inset-0 flex items-center justify-center"><svg className="w-6 h-6 text-white/90 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg></div></>
                           ) : (<img src={getImageUrl(file.filePath)} alt="Schedule file" className="w-full h-full object-cover bg-gray-100" />)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (<p className="text-gray-500 text-[14px] py-2">ไม่มีกำหนดการ</p>)}
        </div>
      </div>

      {/* Footer Meta */}
      <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between text-[13px] text-gray-500 font-medium mt-6">
        <div className="flex items-center space-x-6 mb-2 md:mb-0">
          <span className="font-bold text-[#712874]">สร้างโดย</span>
          <span className="text-gray-800">{activity.createdBy ? `${activity.createdBy.fname} ${activity.createdBy.lname}` : '-'}</span>
          <span>{formatThaiDateTime(activity.createdAt)}</span>
        </div>
        <div className="flex items-center space-x-6">
          <span className="font-bold text-[#712874]">แก้ไขล่าสุดโดย</span>
          <span className="text-gray-800">{activity.updatedBy ? `${activity.updatedBy.fname} ${activity.updatedBy.lname}` : '-'}</span>
          <span>{formatThaiDateTime(activity.updatedAt)}</span>
        </div>
      </div>

      {/* Modal ดูรูปใหญ่ของ Schedule */}
      {previewScheduleImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewScheduleImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black flex items-center justify-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewScheduleImage(null)} className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold transition-colors cursor-pointer">✕</button>
            {isVideoFile(previewScheduleImage) ? (
               <video src={previewScheduleImage} className="max-w-full max-h-[85vh] object-contain rounded-lg" controls autoPlay />
            ) : (<img src={previewScheduleImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg" />)}
          </div>
        </div>
      )}

    </div>
  );
}