import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Phone, X } from 'lucide-react';
import logo from '../assets/logo.png'; // ปรับ path ตามจริง
// ⭐ Import รูปภาพ Facebook และ Line จาก assets
import facebookIcon from '../assets/facebook.png'; 
import lineIcon from '../assets/line.png'; 

export default function DetailActivityPageUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [relatedActivities, setRelatedActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // State สำหรับรูปภาพหลักที่แสดงอยู่
  const [activeImage, setActiveImage] = useState<string>('');
  // State สำหรับเปิด Modal ดูรูปใหญ่
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const BACKEND_URL = 'http://localhost:3000'; 
  
  const getImageUrl = (path: string) => {
    if (!path) return 'https://placehold.co/600x800/EEE/31343C?text=No+Image';
    if (path.startsWith('http') || path.startsWith('data:image')) {
      return path;
    }
    let cleanPath = path.replace(/\\/g, '/');
    if (!cleanPath.includes('uploads/')) {
      cleanPath = `uploads/${cleanPath.replace(/^\//, '')}`;
    }
    return `${BACKEND_URL}/${cleanPath.replace(/^\//, '')}`;
  };

  const isVideoFile = (path: string) => {
    if (!path) return false;
    const cleanPath = path.split('?')[0]; 
    return cleanPath.match(/\.(mp4|mov|m4v|webm)$/i) !== null;
  };

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      window.scrollTo(0, 0); // เลื่อนกลับไปบนสุดเมื่อเปลี่ยนหน้า
      try {
        const response = await fetch(`http://localhost:3000/api/home/activity/${id}`);
        const result = await response.json();
        
        if (!result.error && result.data) {
          const activityData = result.data.activity;
          setData(activityData);

          // นำกิจกรรมที่เกี่ยวข้องมาสุ่ม (Shuffle) เพื่อให้แสดงผลแบบสุ่มในหมวดหมู่เดียวกัน
          if (result.data.relatedActivities && Array.isArray(result.data.relatedActivities)) {
            const shuffledRelated = [...result.data.relatedActivities].sort(() => 0.5 - Math.random());
            setRelatedActivities(shuffledRelated);
          }

          // ตั้งค่ารูป/วิดีโอปกเริ่มต้น
          const cover = activityData.activityFile?.find((f: any) => f.type === 'COVER')?.filePath;
          if (cover) {
            setActiveImage(cover);
          } else {
            const firstMedia = activityData.activityFile?.filter((f: any) => f.type === 'GALLERY' || f.type === 'VIDEO')?.[0]?.filePath;
            if (firstMedia) setActiveImage(firstMedia);
          }
        }
      } catch (error) {
        console.error("Fetch detail error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    } else {
      setLoading(false);
    }
  }, [id]);

  const formatDateRange = (startStr: string, endStr: string) => {
    if (!startStr) return '-';
    const startDate = new Date(startStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    if (!endStr) return startDate;
    const endDate = new Date(endStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    
    // ถ้าวันเริ่มกับวันจบเป็นวันเดียวกัน ให้แสดงแค่วันเดียว
    if (startDate === endDate) return startDate;
    return `${startDate} - ${endDate}`;
  };

  const formatThaiTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  const formatScheduleDateTime = (start: string, end: string) => {
    if (!start || !end) return '-';
    const startDate = new Date(start);
    const datePart = startDate.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
    const startTime = formatThaiTime(start);
    const endTime = formatThaiTime(end);
    return `${datePart} ${startTime} - ${endTime} น.`;
  };

  const formatPrice = (price: any) => {
    if (price === null || price === undefined || Number(price) === 0) {
      return 'ฟรี';
    }
    return `${Number(price).toLocaleString()} บาท`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
        <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center flex-col gap-4">
        <p className="text-gray-500">ไม่พบข้อมูลกิจกรรม</p>
        <button onClick={() => navigate(-1)} className="text-[#712874] underline">กลับไปหน้าก่อนหน้า</button>
      </div>
    );
  }

  const allMedia = data.activityFile?.filter((f: any) => f.type === 'COVER' || f.type === 'GALLERY' || f.type === 'VIDEO') || [];

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans">
      
      {/* ================= Navbar ================= */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm relative z-20">
        <Link 
          to="/" 
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img src={logo} alt="Festia Logo" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold text-[#712874]">Festia Calendar</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/register" className="px-6 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition">
            ลงทะเบียน
          </Link>
          <Link to="/login" className="px-6 py-2 text-sm font-medium text-white bg-[#712874] rounded-full hover:bg-purple-900 transition">
            เข้าสู่ระบบ
          </Link>
        </div>
      </nav>

      {/* ================= Main Content ================= */}
      <div className="max-w-[1100px] mx-auto px-4 py-8 space-y-8">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-800 font-bold hover:text-[#712874] transition-colors"
        >
          <ChevronLeft size={20} strokeWidth={2.5} className="mr-1" />
          ย้อนกลับ
        </button>

        {/* 1. Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Poster Left */}
          <div className="md:col-span-5 flex flex-col space-y-3">
            <div 
              className="w-full aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative shadow-md flex items-center justify-center cursor-pointer" 
              onClick={() => activeImage && setPreviewImage(getImageUrl(activeImage))}
            >
              {activeImage ? (
                isVideoFile(activeImage) ? (
                  <video 
                    src={getImageUrl(activeImage)} 
                    className="w-full h-full object-contain bg-black" 
                    controls 
                    preload="metadata"
                    onClick={(e) => e.stopPropagation()} 
                  />
                ) : (
                  <img 
                    src={getImageUrl(activeImage)} 
                    alt={data.name} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x800/EEE/31343C?text=Image+Error'; }}
                  />
                )
              ) : (
                <div className="text-gray-400 text-sm">ไม่มีรูปภาพปก</div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2.5">
              {allMedia.slice(0, 4).map((media: any, idx: number) => {
                const isSelected = activeImage === media.filePath;
                return (
                  <div 
                    key={idx} 
                    onClick={() => setActiveImage(media.filePath)}
                    className={`aspect-square bg-black rounded-xl overflow-hidden cursor-pointer transition-all relative ${isSelected ? 'border-2 border-[#712874] ring-2 ring-[#712874]/20' : 'border border-gray-200 hover:opacity-80'}`}
                  >
                    {isVideoFile(media.filePath) ? (
                       <>
                          <video 
                            src={getImageUrl(media.filePath)} 
                            className="w-full h-full object-cover opacity-70 bg-black" 
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <svg className="w-6 h-6 text-white/90 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
                          </div>
                       </>
                     ) : (
                       <img 
                          src={getImageUrl(media.filePath)} 
                          alt={`Thumbnail ${idx}`} 
                          className="w-full h-full object-cover bg-gray-100" 
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/EEE/31343C?text=Error'; }}
                        />
                     )}
                  </div>
                );
              })}
              {Array.from({ length: Math.max(0, 4 - allMedia.length) }).map((_, idx) => (
                <div key={`empty-${idx}`} className="aspect-square bg-[#F5F5F5] rounded-xl border border-gray-200"></div>
              ))}
            </div>
          </div>

          {/* Info Right */}
          <div className="md:col-span-7 flex flex-col pt-2">
            <h1 className="text-[32px] font-bold text-[#712874] leading-tight mb-4">
              {data.name}
            </h1>
            
            <p className="text-[#712874] font-semibold text-[15px] border-l-4 border-[#712874] pl-3 mb-8 whitespace-pre-line leading-relaxed">
              {data.tagline}
            </p>

            {/* INFO BOX */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6 flex flex-col justify-center">
                <div className="grid grid-cols-[120px_1fr] gap-y-4 text-[14px] text-gray-800 items-center">
                  <span className="font-bold text-[#712874]">วันที่</span>
                  <span>{formatDateRange(data.startDate, data.dueDate)}</span>
                  
                  <span className="font-bold text-[#712874]">สถานที่จัดงาน</span>
                  <span>{data.location?.name || '-'}</span>
                  
                  <span className="font-bold text-[#712874]">ละติจูด ลองจิจูด</span>
                  <span>{data.location?.latitude ? `${data.location.latitude} , ${data.location.longitude}` : '-'}</span>
                  
                  <span className="font-bold text-[#712874]">แผนที่</span>
                  {data.location?.latitude && data.location?.longitude ? (
                      <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${data.location.latitude},${data.location.longitude}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-gray-600 hover:text-[#712874] hover:underline break-all truncate block"
                      >
                          {`https://maps.app.goo.gl/search/${data.location.latitude},${data.location.longitude}`}
                      </a>
                  ) : (
                      <span>-</span>
                  )}
                  
                  <span className="font-bold text-[#712874]">ติดต่อ</span>
                  <span>{data.phone || '-'}</span>

                  {/* ⭐ ใช้รูปภาพจาก Assets แทน SVG */}
                  {(data.facebookUrl || data.lineUrl) && (
                    <>
                      <span className="font-bold text-[#712874]">โซเชียลมีเดีย</span>
                      <div className="flex items-center gap-3">
                        {data.facebookUrl && (
                          <a href={data.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" title="Facebook">
                            <img src={facebookIcon} alt="Facebook" className="w-8 h-8 object-contain" />
                          </a>
                        )}
                        {data.lineUrl && (
                          <a href={data.lineUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" title="LINE">
                            <img src={lineIcon} alt="LINE" className="w-8 h-8 object-contain" />
                          </a>
                        )}
                      </div>
                    </>
                  )}
                  
                  <span className="font-bold text-[#712874]">ค่าเข้าชม</span>
                  <span className="text-green-600 font-bold">{formatPrice(data.price)}</span>
                </div>
            </div>

            {/* OpenStreetMap Iframe */}
            {data.location?.latitude && data.location?.longitude && (
                <div className="w-full h-[200px] rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                     <iframe 
                        title="OpenStreetMap"
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight={0} 
                        marginWidth={0} 
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.location.longitude - 0.01}%2C${data.location.latitude - 0.01}%2C${data.location.longitude + 0.01}%2C${data.location.latitude + 0.01}&layer=mapnik&marker=${data.location.latitude}%2C${data.location.longitude}`}
                    ></iframe>
                </div>
            )}
          </div>
        </div>

        {/* 2. Description Section */}
        <div className="bg-white p-8 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100">
          <h3 className="text-[18px] font-bold text-[#712874] mb-5 pb-3 border-b border-dashed border-gray-200">
              รายละเอียดกิจกรรม
          </h3>
          <p className="text-gray-600 leading-relaxed text-[15px] whitespace-pre-line px-2">
            {data.description || '-'}
          </p>
        </div>

        {/* 3. Schedule Section */}
        <div className="bg-white p-8 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100">
          <h3 className="text-[18px] font-bold text-[#712874] mb-6 pb-3 border-b border-dashed border-gray-200">
              กำหนดการกิจกรรม
          </h3>
          
          <div className="space-y-8 px-2">
            {data.schedules && data.schedules.length > 0 ? (
              data.schedules.map((schedule: any, idx: number) => (
                <div key={idx} className="flex flex-col md:flex-row md:space-x-8 border-b border-dashed border-gray-200 pb-8 last:border-0 last:pb-0">
                  
                  <div className="w-48 shrink-0 text-[#712874] font-semibold text-[14px] mb-2 md:mb-0 pt-0.5">
                     <span>{formatScheduleDateTime(schedule.startDateTime, schedule.endDateTime)}</span>
                  </div>

                  <div className="flex-1">
                    {schedule.title && (
                        <p className="text-gray-800 text-[14px] font-bold mb-1.5">{schedule.title}</p>
                    )}
                    {schedule.description && (
                        <p className="text-gray-600 text-[14px] mb-4">{schedule.description}</p>
                    )}
                    
                    {/* Schedule Images/Videos */}
                    {schedule.files && schedule.files.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {schedule.files.map((file: any, fileIdx: number) => (
                          <div 
                            key={fileIdx} 
                            onClick={() => setPreviewImage(getImageUrl(file.filePath))}
                            className="relative w-[120px] h-[80px] bg-black rounded-lg overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center"
                          >
                             {isVideoFile(file.filePath) ? (
                               <>
                                  <video 
                                    src={getImageUrl(file.filePath)} 
                                    className="w-full h-full object-cover opacity-70 bg-black" 
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <svg className="w-6 h-6 text-white/90 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
                                  </div>
                               </>
                             ) : (
                               <img 
                                  src={getImageUrl(file.filePath)} 
                                  alt={`Schedule ${idx} file ${fileIdx}`} 
                                  className="w-full h-full object-cover bg-gray-100" 
                                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/EEE/31343C?text=Error'; }}
                                />
                             )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-[14px] py-2">ไม่มีกำหนดการระบุไว้</p>
            )}
          </div>
        </div>

        {/* 4. Related Activities Section */}
        {relatedActivities.length > 0 && (
          <div className="pt-8">
            <h3 className="text-[20px] font-bold text-[#712874] mb-6 pl-2">
                กิจกรรมที่คุณอาจสนใจ
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {relatedActivities.map((act: any, idx: number) => (
                <Link 
                  key={idx} 
                  to={`/activity/${act.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex flex-col sm:flex-row hover:shadow-md transition-all duration-300 group"
                >
                  <div className="w-full sm:w-[160px] h-[200px] sm:h-auto flex-shrink-0 relative overflow-hidden">
                    <img 
                      src={act.activityFile?.[0]?.filePath ? getImageUrl(act.activityFile[0].filePath) : 'https://placehold.co/300x400/f3f4f6/a1a1aa?text=No+Image'} 
                      alt={act.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  
                  <div className="p-5 flex flex-col justify-center w-full">
                    <h4 className="text-[16px] font-bold text-[#712874] mb-1.5 line-clamp-1">{act.name}</h4>
                    <p className="text-[13px] text-gray-500 mb-4 line-clamp-2 min-h-[38px] border-b border-gray-100 pb-3">
                      {act.tagline || act.description || '-'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[12px]">
                      <div>
                        <span className="block font-bold text-[#712874] mb-0.5">วันที่</span>
                        <span className="text-gray-600">{formatDateRange(act.startDate, act.dueDate)}</span>
                      </div>
                      <div>
                        <span className="block font-bold text-[#712874] mb-0.5">สถานที่</span>
                        <span className="text-gray-600 truncate block pr-2" title={act.location?.name}>
                          {act.location?.name || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="block font-bold text-[#712874] mb-0.5">ค่าเข้าชม</span>
                        <span className="text-green-600 font-bold">{formatPrice(act.price)}</span>
                      </div>
                      <div>
                        <span className="block font-bold text-[#712874] mb-0.5">ติดต่อ</span>
                        <span className="text-gray-600 truncate block pr-2">{act.phone || '-'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ================= Footer ================= */}
      <footer className="bg-[#712874] text-white pt-10 pb-6 px-8 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-purple-800 pb-8 mb-6">
          <div>
            <h3 className="text-xl font-bold mb-3">ช่วยเหลือ</h3>
            <div className="flex items-center gap-2 text-purple-200">
              <Phone size={18} />
              <span>08x-xxx-xxx</span>
            </div>
          </div>
          <div>
            <Link to="/admin/login" className="bg-white text-[#712874] px-6 py-2.5 rounded-full font-medium text-sm hover:bg-gray-100 transition shadow-md">
              เข้าสู่ระบบ Admin
            </Link>
          </div>
        </div>
        <div className="text-center text-purple-300 text-sm">
          © 2026 Festia Calendar. All rights reserved.
        </div>
      </footer>

      {/* ================== Modal ดูรูปใหญ่ / วิดีโอ ================== */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 transition-opacity" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl flex items-center justify-center bg-black" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            {isVideoFile(previewImage) ? (
               <video 
                  src={previewImage} 
                  className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
                  controls 
                  autoPlay
               />
            ) : (
               <img 
                  src={previewImage} 
                  alt="Preview Large" 
                  className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
               />
            )}
          </div>
        </div>
      )}

    </div>
  );
}