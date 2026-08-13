import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../Libs/axios';

// ⭐ Import รูปภาพ Facebook และ Line จาก assets
import facebookIcon from '../../assets/facebook.png'; 
import lineIcon from '../../assets/line.png'; 

export default function DetailRequestActivityPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // State สำหรับมีเดียหลักที่แสดงอยู่
  const [activeImage, setActiveImage] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ================= Modal States =================
  type ModalStateType = 'none' | 'confirmApprove' | 'successApprove' | 'rejectReason' | 'confirmReject' | 'successReject';
  const [modalState, setModalState] = useState<ModalStateType>('none');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const BACKEND_URL = 'http://localhost:3000'; 
  
  const getImageUrl = (path: string) => {
    if (!path) return '';
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
      try {
        // ยิง API ดึงรายละเอียดกิจกรรมที่รออนุมัติ
        const response = await api.get(`/superadmin/activity-requests/${id}`);
        const activityData = response.data.data || response.data;
        setData(activityData);

        const cover = activityData.activityFile?.find((f: any) => f.type === 'COVER')?.filePath;
        if (cover) {
          setActiveImage(cover);
        } else {
          const firstMedia = activityData.activityFile?.filter((f: any) => f.type === 'GALLERY' || f.type === 'VIDEO')?.[0]?.filePath;
          if (firstMedia) setActiveImage(firstMedia);
        }

      } catch (error) {
        console.error("Fetch detail error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail(); else setLoading(false);
  }, [id]);

  // ================= Handlers อนุมัติ / ปฏิเสธ =================
  const handleApprove = async () => {
    if (!id) return;
    setIsProcessing(true);
    try {
      await api.patch(`/superadmin/activity-requests/${id}/approve`);
      setModalState('successApprove');
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.response?.data?.message || err.message}`);
      setModalState('none');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    setIsProcessing(true);
    try {
      await api.patch(`/superadmin/activity-requests/${id}/reject`, {
        reason: rejectReason
      });
      setModalState('successReject');
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.response?.data?.message || err.message}`);
      setModalState('none');
    } finally {
      setIsProcessing(false);
    }
  };

  // ⭐ เพิ่มฟังก์ชันแปลงวันที่แบบช่วง (Range)
  const formatDateRange = (startStr: string, endStr: string) => {
    if (!startStr) return '-';
    const startDate = new Date(startStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    if (!endStr) return startDate;
    const endDate = new Date(endStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    
    // ถ้าวันเริ่มกับวันจบเป็นวันเดียวกัน ให้แสดงแค่วันเดียว
    if (startDate === endDate) return startDate;
    return `${startDate} - ${endDate}`;
  };

  const formatThaiDateOnly = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatThaiTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  const formatThaiDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return `${formatThaiDateOnly(dateString)} ${formatThaiTime(dateString)} น.`;
  };

  const formatScheduleDateTime = (start: string, end: string) => {
    if (!start || !end) return '-';
    const startDate = new Date(start);
    const datePart = startDate.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
    const startTime = formatThaiTime(start);
    const endTime = formatThaiTime(end);
    return `${datePart} ${startTime} - ${endTime} น.`;
  };

  const activity = data;

  if (loading) {
    return <p className="text-center text-gray-500 mt-10">กำลังโหลดข้อมูล...</p>;
  }

  if (!activity) {
    return <p className="text-center text-gray-500 mt-10">ไม่พบข้อมูลคำร้องขออนุมัติกิจกรรม</p>;
  }

  const allMedia = activity.activityFile?.filter((f: any) => f.type === 'COVER' || f.type === 'GALLERY' || f.type === 'VIDEO') || [];

  return (
    <div className="w-full max-w-[1100px] mx-auto space-y-8 relative pb-12">
      
      {/* Header & Back Button */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => navigate(-1)}
          className="text-[#712874] hover:opacity-75 transition-opacity p-1 cursor-pointer flex items-center justify-center"
          title="ย้อนกลับ"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-[24px] font-bold text-[#712874]">รายละเอียดคำขออนุมัติกิจกรรม</h1>
      </div>
      
      {/* 1. Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Poster Left */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col space-y-3">
          <div className="w-full aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden relative shadow-md flex items-center justify-center">
            {activeImage ? (
              isVideoFile(activeImage) ? (
                <video 
                  src={getImageUrl(activeImage)} 
                  className="w-full h-full object-contain bg-black" 
                  controls 
                  preload="metadata"
                />
              ) : (
                <img 
                  onClick={() => setPreviewImage(getImageUrl(activeImage))}
                  src={getImageUrl(activeImage)} 
                  alt="Active Media" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" 
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x800/EEE/31343C?text=Image+Error'; }}
                />
              )
            ) : (
              <div className="text-gray-400 text-sm">ไม่มีรูปภาพปก</div>
            )}
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2">
            {allMedia.slice(0, 4).map((media: any, idx: number) => {
              const isSelected = activeImage === media.filePath;
              return (
                <div 
                  key={idx} 
                  onClick={() => setActiveImage(media.filePath)}
                  className={`relative aspect-[4/3] bg-black rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${isSelected ? 'border-[#712874] ring-2 ring-[#712874]/30' : 'border-gray-200 hover:opacity-80'}`}
                >
                   {isVideoFile(media.filePath) ? (
                     <>
                        <video 
                          src={getImageUrl(media.filePath)} 
                          className="w-full h-full object-cover opacity-70" 
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <svg className="w-6 h-6 text-white/90 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
                        </div>
                     </>
                   ) : (
                     <img 
                        src={getImageUrl(media.filePath)} 
                        alt={`Thumbnail ${idx}`} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/EEE/31343C?text=Error'; }}
                      />
                   )}
                </div>
              );
            })}
            {Array.from({ length: Math.max(0, 4 - allMedia.length) }).map((_, idx) => (
              <div key={`empty-${idx}`} className="aspect-[4/3] bg-[#F5F5F5] rounded-lg border border-gray-200"></div>
            ))}
          </div>
        </div>

        {/* Info Right */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-[32px] font-bold text-[#712874] leading-tight pr-4">{activity.name}</h2>
              
              {/* ปุ่ม อนุมัติ / ปฏิเสธ ด้านขวาบน */}
              <div className="flex items-center space-x-2 shrink-0 mt-1">
                <button 
                  onClick={() => {
                    setRejectReason('');
                    setModalState('rejectReason');
                  }}
                  className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:border-[#712874] hover:text-[#712874] transition-colors bg-white shadow-sm"
                >
                  ปฏิเสธ
                </button>
                <button 
                  onClick={() => setModalState('confirmApprove')}
                  className="bg-[#712874] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-900 transition-colors shadow-sm"
                >
                  อนุมัติ
                </button>
              </div>
            </div>
            
            <p className="text-[#712874] font-semibold text-[15px] border-l-4 border-[#712874] pl-3 mb-6 whitespace-pre-line leading-relaxed">
              {activity.tagline}
            </p>

            {/* INFO BOX */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
                <div className="grid grid-cols-[120px_1fr] gap-y-3.5 text-[14px] text-gray-800 items-center">
                  <span className="font-semibold text-gray-600">วันที่</span>
                  {/* ⭐ ใช้วันที่แบบ Range */}
                  <span>{formatDateRange(activity.startDate, activity.dueDate)}</span>
                  
                  <span className="font-semibold text-gray-600">สถานที่จัดงาน</span>
                  <span>{activity.location?.name || '-'}</span>
                  
                  <span className="font-semibold text-gray-600">ละติจูด ลองจิจูด</span>
                  <span>{activity.location?.latitude ? `${activity.location.latitude} , ${activity.location.longitude}` : '-'}</span>
                  
                  <span className="font-semibold text-gray-600">แผนที่</span>
                  {activity.location?.latitude && activity.location?.longitude ? (
                      <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${activity.location.latitude},${activity.location.longitude}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-gray-500 hover:text-blue-600 hover:underline break-all"
                      >
                          {`https://maps.app.goo.gl/search/${activity.location.latitude},${activity.location.longitude}`}
                      </a>
                  ) : (
                      <span>-</span>
                  )}
                  
                  <span className="font-semibold text-gray-600">ติดต่อ</span>
                  <span>{activity.phone || '-'}</span>

                  {/* ⭐ เพิ่มส่วนแสดง Social Media แบบไอคอน */}
                  {(activity.facebookUrl || activity.lineUrl) && (
                    <>
                      <span className="font-semibold text-gray-600">โซเชียลมีเดีย</span>
                      <div className="flex items-center gap-3">
                        {activity.facebookUrl && (
                          <a href={activity.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" title="Facebook">
                            <img src={facebookIcon} alt="Facebook" className="w-8 h-8 object-contain" />
                          </a>
                        )}
                        {activity.lineUrl && (
                          <a href={activity.lineUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" title="LINE">
                            <img src={lineIcon} alt="LINE" className="w-8 h-8 object-contain" />
                          </a>
                        )}
                      </div>
                    </>
                  )}
                  
                  <span className="font-semibold text-gray-600">ค่าเข้าชม</span>
                  <span className="text-green-600 font-bold">{Number(activity.price) === 0 ? 'ฟรี' : `${activity.price} บาท`}</span>
                </div>
            </div>
          </div>

          {/* OpenStreetMap Iframe */}
          {activity.location?.latitude && activity.location?.longitude && (
              <div className="w-full h-44 rounded-xl overflow-hidden shadow-sm border border-gray-200 mt-auto">
                   <iframe 
                      title="OpenStreetMap"
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      scrolling="no" 
                      marginHeight={0} 
                      marginWidth={0} 
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${activity.location.longitude - 0.01}%2C${activity.location.latitude - 0.01}%2C${activity.location.longitude + 0.01}%2C${activity.location.latitude + 0.01}&layer=mapnik&marker=${activity.location.latitude}%2C${activity.location.longitude}`}
                  ></iframe>
              </div>
          )}
        </div>
      </div>

      {/* 2. Description Section */}
      <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-[18px] font-bold text-[#712874] mb-5 pb-3 border-b border-dashed border-gray-200">
            รายละเอียดกิจกรรม
        </h3>
        <p className="text-gray-700 leading-relaxed text-[14px] whitespace-pre-line px-2">
          {activity.description}
        </p>
      </div>

      {/* 3. Schedule Section */}
      <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-[18px] font-bold text-[#712874] mb-6 pb-3 border-b border-dashed border-gray-200">
            กำหนดการกิจกรรม
        </h3>
        
        <div className="space-y-8 px-2">
          {activity.schedules && activity.schedules.length > 0 ? (
            activity.schedules.map((schedule: any, idx: number) => (
              <div key={idx} className="flex flex-col md:flex-row md:space-x-8 border-b border-dashed border-gray-200 pb-8 last:border-0 last:pb-0">
                
                <div className="w-48 shrink-0 text-[#712874] font-semibold text-[14px] mb-2 md:mb-0 pt-0.5">
                   <span>{formatScheduleDateTime(schedule.startDateTime, schedule.endDateTime)}</span>
                </div>

                <div className="flex-1">
                  {schedule.title && (
                      <p className="text-gray-800 text-[14px] font-semibold mb-1.5">{schedule.title}</p>
                  )}
                  {schedule.description && (
                      <p className="text-gray-600 text-[14px] mb-4">{schedule.description}</p>
                  )}
                  
                  {/* Schedule Images / Videos */}
                  {schedule.files && schedule.files.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {schedule.files.map((file: any, fileIdx: number) => (
                        <div 
                          key={fileIdx} 
                          onClick={() => setPreviewImage(getImageUrl(file.filePath))}
                          className="relative w-[120px] h-[80px] bg-black rounded-lg overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center"
                        >
                           {isVideoFile(file.filePath) ? (
                             <>
                                <video 
                                  src={getImageUrl(file.filePath)} 
                                  className="w-full h-full object-cover opacity-70" 
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white/90 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
                                </div>
                             </>
                           ) : (
                             <img 
                                src={getImageUrl(file.filePath)} 
                                alt={`Schedule file`} 
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
            <p className="text-gray-500 text-[14px] py-2">ไม่มีกำหนดการ</p>
          )}
        </div>
      </div>

      {/* 4. Footer Meta */}
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

      {/* ================== Modal สำหรับดูรูปขนาดใหญ่ / วิดีโอ ================== */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black flex items-center justify-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
            {isVideoFile(previewImage) ? (
               <video 
                  src={previewImage} 
                  className="max-w-full max-h-[85vh] object-contain rounded-lg" 
                  controls 
                  autoPlay
               />
            ) : (
               <img 
                  src={previewImage} 
                  alt="Preview Large" 
                  className="max-w-full max-h-[85vh] object-contain rounded-lg" 
               />
            )}
          </div>
        </div>
      )}

      {/* ================== MODALS SECTION ================== */}

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
              <button onClick={() => setModalState('none')} disabled={isProcessing} className="px-6 py-2.5 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors w-[120px]">
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
            <p className="text-[14px] text-gray-500 mb-8 text-center">กิจกรรมถูกอนุมัติเรียบร้อยแล้ว</p>
            <button onClick={() => navigate('/superadmin/activity-requests')} className="px-8 py-2.5 bg-[#4A154B] text-white rounded-lg text-[14px] font-medium hover:bg-[#340f35] transition-colors w-[140px]">
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
              placeholder="ระบุเหตุผล..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#712874] resize-none mb-8"
            ></textarea>

            <div className="flex space-x-4 w-full justify-center">
              <button onClick={() => setModalState('none')} className="px-6 py-2.5 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors w-[120px]">
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
            <p className="text-[14px] text-gray-500 mb-8 text-center">กิจกรรมถูกปฏิเสธเรียบร้อยแล้ว</p>
            <button onClick={() => navigate('/superadmin/activity-requests')} className="px-8 py-2.5 bg-[#4A154B] text-white rounded-lg text-[14px] font-medium hover:bg-[#340f35] transition-colors w-[140px]">
              ปิด
            </button>
          </div>
        </div>
      )}

    </div>
  );
}