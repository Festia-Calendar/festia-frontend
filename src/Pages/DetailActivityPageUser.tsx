/**
 * คำอธิบาย : Component สำหรับหน้าแสดงรายละเอียดของกิจกรรม (Detail Activity Page) สำหรับผู้ใช้งานทั่วไป
 * ทำหน้าที่แสดงข้อมูลทั้งหมดของกิจกรรมที่ผู้ใช้เลือกดู เช่น รูปแบบแบนเนอร์/โปสเตอร์, สถานที่จัดงาน, วันเวลา, ข้อมูลการติดต่อ, แผนที่ (OpenStreetMap), และกำหนดการย่อย พร้อมกับมีส่วนแสดงกิจกรรมที่เกี่ยวข้องด้วย
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Phone, X } from 'lucide-react';

// Import Services & Components
import { homeService } from '../Services/home.service';
import RelatedActivityCard from '../Components/RelatedActivityCard';

import logo from '../assets/logo.png'; 
import facebookIcon from '../assets/facebook.png'; 
import lineIcon from '../assets/line.png'; 

/**
 * คำอธิบาย : ฟังก์ชัน Component หลักสำหรับเรนเดอร์หน้าจอรายละเอียดกิจกรรม
 * Input: -
 * Output: UI แสดงข้อมูลรายละเอียดของกิจกรรม, กำหนดการ, โซเชียลมีเดีย, แผนที่ และกิจกรรมอื่นๆ ที่น่าสนใจ
 */
export default function DetailActivityPageUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState<any>(null);
  const [relatedActivities, setRelatedActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [activeImage, setActiveImage] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'; 
  
  /**
   * คำอธิบาย : ฟังก์ชันจัดการและแปลง URL ของรูปภาพ/วิดีโอ เพื่อให้สามารถแสดงผลได้ถูกต้อง
   * Input: path (string) - ที่อยู่ของไฟล์ (File Path)
   * Output: string (URL เต็มที่สามารถนำไปใช้กับแท็ก img หรือ video ได้)
   */
  const getImageUrl = (path: string) => {
    if (!path) return 'https://placehold.co/600x800/EEE/31343C?text=No+Image';
    if (path.startsWith('http') || path.startsWith('data:image')) return path;
    let cleanPath = path.replace(/\\/g, '/');
    if (!cleanPath.includes('uploads/')) cleanPath = `uploads/${cleanPath.replace(/^\//, '')}`;
    return `${BACKEND_URL}/${cleanPath.replace(/^\//, '')}`;
  };

  /**
   * คำอธิบาย : ฟังก์ชันตรวจสอบนามสกุลไฟล์ ว่าเป็นไฟล์วิดีโอหรือไม่
   * Input: path (string)
   * Output: boolean (True หากเป็นวิดีโอ, False หากไม่ใช่)
   */
  const isVideoFile = (path: string) => {
    if (!path) return false;
    return path.split('?')[0].match(/\.(mp4|mov|m4v|webm)$/i) !== null;
  };

  /**
   * คำอธิบาย : Hook สำหรับดึงข้อมูลรายละเอียดกิจกรรมจากเซิร์ฟเวอร์ เมื่อโหลดหน้าเว็บหรือเกิดการเปลี่ยน URL id
   * Input: -
   * Output: -
   */
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      window.scrollTo(0, 0); 
      try {
        const result = await homeService.getActivityDetail(id!);
        setData(result.activity);
        setRelatedActivities(result.relatedActivities);

        const cover = result.activity.activityFile?.find((f: any) => f.type === 'COVER')?.filePath;
        if (cover) {
          setActiveImage(cover);
        } else {
          const firstMedia = result.activity.activityFile?.filter((f: any) => f.type === 'GALLERY' || f.type === 'VIDEO')?.[0]?.filePath;
          if (firstMedia) setActiveImage(firstMedia);
        }
      } catch (error) {
        console.error("Fetch detail error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  /**
   * คำอธิบาย : ฟังก์ชันแปลงรูปแบบช่วงวันที่เพื่อการแสดงผล (เช่น 1 ม.ค. 2026 - 5 ม.ค. 2026)
   * Input: startStr (string), endStr (string)
   * Output: string
   */
  const formatDateRange = (startStr: string, endStr: string) => {
    if (!startStr) return '-';
    const s = new Date(startStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    const e = endStr ? new Date(endStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : s;
    return s === e ? s : `${s} - ${e}`;
  };

  /**
   * คำอธิบาย : ฟังก์ชันจัดรูปแบบการแสดงผลวันเวลาของกำหนดการย่อย (Schedule)
   * Input: start (string), end (string)
   * Output: string (เช่น "1 ม.ค. 09:00 - 12:00 น.")
   */
  const formatScheduleDateTime = (start: string, end: string) => {
    if (!start || !end) return '-';
    const d = new Date(start);
    const datePart = d.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
    const sTime = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const eTime = new Date(end).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    return `${datePart} ${sTime} - ${eTime} น.`;
  };

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับจัดการราคาค่าเข้าชม หากไม่มีค่าหรือเป็น 0 จะแสดงผลเป็นคำว่า "ฟรี"
   * Input: price (any)
   * Output: string
   */
  const formatPrice = (price: any) => (!price || Number(price) === 0) ? 'ฟรี' : `${Number(price).toLocaleString()} บาท`;

  if (loading) return <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center"><p className="text-gray-500">กำลังโหลดข้อมูล...</p></div>;
  if (!data) return <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center flex-col gap-4"><p className="text-gray-500">ไม่พบข้อมูลกิจกรรม</p><button onClick={() => navigate(-1)} className="text-[#712874] underline">กลับไปหน้าก่อนหน้า</button></div>;

  const allMedia = data.activityFile?.filter((f: any) => f.type === 'COVER' || f.type === 'GALLERY' || f.type === 'VIDEO') || [];

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm relative z-20">
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <img src={logo} alt="Festia Logo" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold text-[#712874]">Festia Calendar</span>
        </Link>
      </nav>

      {/* Main Content */}
      <div className="max-w-[1100px] mx-auto px-4 py-8 space-y-8">
        
        {/* Back Button */}
        <div className="flex items-center space-x-2">
          <button onClick={() => navigate(-1)} className="text-[#712874] hover:opacity-70 transition-opacity p-1 -ml-1 cursor-pointer flex items-center justify-center" title="ย้อนกลับ">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-[18px] font-bold text-[#712874]">ย้อนกลับ</h1>
        </div>

        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Poster Left */}
          <div className="md:col-span-5 flex flex-col space-y-3">
            <div className="w-full aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative shadow-md flex items-center justify-center cursor-pointer" onClick={() => activeImage && setPreviewImage(getImageUrl(activeImage))}>
              {activeImage ? (
                isVideoFile(activeImage) ? (
                  <video src={getImageUrl(activeImage)} className="w-full h-full object-contain bg-black" controls preload="metadata" onClick={(e) => e.stopPropagation()} />
                ) : (
                  <img src={getImageUrl(activeImage)} alt={data.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x800/EEE/31343C?text=Image+Error'; }} />
                )
              ) : <div className="text-gray-400 text-sm">ไม่มีรูปภาพปก</div>}
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              {allMedia.slice(0, 5).map((media: any, idx: number) => {
                const isSelected = activeImage === media.filePath;
                return (
                  <div key={idx} onClick={() => setActiveImage(media.filePath)} className={`aspect-square bg-black rounded-xl overflow-hidden cursor-pointer transition-all relative ${isSelected ? 'border-2 border-[#712874] ring-2 ring-[#712874]/20' : 'border border-gray-200 hover:opacity-80'}`}>
                    {isVideoFile(media.filePath) ? (
                       <><video src={getImageUrl(media.filePath)} className="w-full h-full object-cover opacity-70 bg-black" preload="metadata" /><div className="absolute inset-0 flex items-center justify-center pointer-events-none"><svg className="w-6 h-6 text-white/90 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg></div></>
                     ) : (
                       <img src={getImageUrl(media.filePath)} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover bg-gray-100" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/EEE/31343C?text=Error'; }} />
                     )}
                  </div>
                );
              })}
              {Array.from({ length: Math.max(0, 5 - allMedia.length) }).map((_, idx) => <div key={`empty-${idx}`} className="aspect-square bg-[#F5F5F5] rounded-xl border border-gray-200"></div>)}
            </div>
          </div>

          {/* Info Right */}
          <div className="md:col-span-7 flex flex-col pt-2">
            <h1 className="text-[32px] font-bold text-[#712874] leading-tight mb-4">{data.name}</h1>
            <p className="text-[#712874] font-semibold text-[15px] border-l-4 border-[#712874] pl-3 mb-8 whitespace-pre-line leading-relaxed">{data.tagline}</p>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6 flex flex-col justify-center">
                <div className="grid grid-cols-[120px_1fr] gap-y-4 text-[14px] text-gray-800 items-center">
                  <span className="font-bold text-[#712874]">วันที่</span><span>{formatDateRange(data.startDate, data.dueDate)}</span>
                  <span className="font-bold text-[#712874]">สถานที่จัดงาน</span><span>{data.location?.name || '-'}</span>
                  <span className="font-bold text-[#712874]">ละติจูด ลองจิจูด</span><span>{data.location?.latitude ? `${data.location.latitude} , ${data.location.longitude}` : '-'}</span>
                  <span className="font-bold text-[#712874]">แผนที่</span>
                  {data.location?.latitude && data.location?.longitude ? (
                      <a href={`https://maps.app.goo.gl/search/${data.location.latitude},${data.location.longitude}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#712874] hover:underline break-all truncate block">
                          {`https://maps.app.goo.gl/search/${data.location.latitude},${data.location.longitude}`}
                      </a>
                  ) : <span>-</span>}
                  <span className="font-bold text-[#712874]">ติดต่อ</span><span>{data.phone || '-'}</span>

                  {(data.facebookUrl || data.lineUrl) && (
                    <>
                      <span className="font-bold text-[#712874]">โซเชียลมีเดีย</span>
                      <div className="flex items-center gap-3">
                        {data.facebookUrl && <a href={data.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" title="Facebook"><img src={facebookIcon} alt="Facebook" className="w-8 h-8 object-contain" /></a>}
                        {data.lineUrl && <a href={data.lineUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" title="LINE"><img src={lineIcon} alt="LINE" className="w-8 h-8 object-contain" /></a>}
                      </div>
                    </>
                  )}
                  <span className="font-bold text-[#712874]">ค่าเข้าชม</span><span className="text-green-600 font-bold">{formatPrice(data.price)}</span>
                </div>
            </div>

            {data.location?.latitude && data.location?.longitude && (
                <div className="w-full h-[200px] rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                     <iframe title="OpenStreetMap" width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0} src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.location.longitude - 0.01}%2C${data.location.latitude - 0.01}%2C${data.location.longitude + 0.01}%2C${data.location.latitude + 0.01}&layer=mapnik&marker=${data.location.latitude}%2C${data.location.longitude}`}></iframe>
                </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white p-8 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100">
          <h3 className="text-[18px] font-bold text-[#712874] mb-5 pb-3 border-b border-dashed border-gray-200">รายละเอียดกิจกรรม</h3>
          <p className="text-gray-600 leading-relaxed text-[15px] whitespace-pre-line px-2">{data.description || '-'}</p>
        </div>

        {/* Schedule Section */}
        <div className="bg-white p-8 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100">
          <h3 className="text-[18px] font-bold text-[#712874] mb-6 pb-3 border-b border-dashed border-gray-200">กำหนดการกิจกรรม</h3>
          <div className="space-y-8 px-2">
            {data.schedules && data.schedules.length > 0 ? (
              data.schedules.map((schedule: any, idx: number) => (
                <div key={idx} className="flex flex-col md:flex-row md:space-x-8 border-b border-dashed border-gray-200 pb-8 last:border-0 last:pb-0">
                  <div className="w-48 shrink-0 text-[#712874] font-semibold text-[14px] mb-2 md:mb-0 pt-0.5">
                     <span>{formatScheduleDateTime(schedule.startDateTime, schedule.endDateTime)}</span>
                  </div>
                  <div className="flex-1">
                    {schedule.title && <p className="text-gray-800 text-[14px] font-bold mb-1.5">{schedule.title}</p>}
                    {schedule.description && <p className="text-gray-600 text-[14px] mb-4">{schedule.description}</p>}
                    {schedule.files && schedule.files.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {schedule.files.map((file: any, fileIdx: number) => (
                          <div key={fileIdx} onClick={() => setPreviewImage(getImageUrl(file.filePath))} className="relative w-[120px] h-[80px] bg-black rounded-lg overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center">
                             {isVideoFile(file.filePath) ? (
                               <><video src={getImageUrl(file.filePath)} className="w-full h-full object-cover opacity-70 bg-black" preload="metadata" /><div className="absolute inset-0 flex items-center justify-center pointer-events-none"><svg className="w-6 h-6 text-white/90 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg></div></>
                             ) : (
                               <img src={getImageUrl(file.filePath)} alt="Schedule" className="w-full h-full object-cover bg-gray-100" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/EEE/31343C?text=Error'; }} />
                             )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : <p className="text-gray-500 text-[14px] py-2">ไม่มีกำหนดการระบุไว้</p>}
          </div>
        </div>

        {/* Related Activities Section */}
        {relatedActivities.length > 0 && (
          <div className="pt-8">
            <h3 className="text-[20px] font-bold text-[#712874] mb-6 pl-2">กิจกรรมที่คุณอาจสนใจ</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {relatedActivities.map((act: any, idx: number) => (
                <RelatedActivityCard 
                  key={idx} 
                  activity={act} 
                  getImageUrl={getImageUrl} 
                  formatDateRange={formatDateRange} 
                  formatPrice={formatPrice} 
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#712874] text-white pt-10 pb-6 px-8 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-purple-800 pb-8 mb-6">
          <div>
            <h3 className="text-xl font-bold mb-3">ช่วยเหลือ</h3>
            <div className="flex items-center gap-2 text-purple-200"><Phone size={18} /><span>08x-xxx-xxx</span></div>
          </div>
          <div>
            <Link to="/admin/login" className="bg-white text-[#712874] px-6 py-2.5 rounded-full font-medium text-sm hover:bg-gray-100 transition shadow-md">
              เข้าสู่ระบบ Admin
            </Link>
          </div>
        </div>
        <div className="text-center text-purple-300 text-sm">© 2026 Festia Calendar. All rights reserved.</div>
      </footer>

      {/* Modal ดูรูปใหญ่ */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 transition-opacity" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl flex items-center justify-center bg-black" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"><X size={20} /></button>
            {isVideoFile(previewImage) ? (
               <video src={previewImage} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" controls autoPlay />
            ) : (
               <img src={previewImage} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}