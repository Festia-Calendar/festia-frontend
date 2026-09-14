/**
 * คำอธิบาย : Component สำหรับหน้าจอ "การตั้งค่าระบบ" (Setting Page)
 * ทำหน้าที่จัดการตั้งค่าสถานะเปิด/ปิดระบบ (Online) และการจัดการรูปภาพแบนเนอร์หน้าแรก (Banner Management) เช่น การอัปโหลดเพิ่มและการลบรูปภาพ
 */

import React, { useState, useEffect } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';

// Import Services
import { settingService } from '../../Services/setting.service';

// Import Modal Component
import Modal, { type ModalStateType } from '../../Components/Modal';

/**
 * คำอธิบาย : ฟังก์ชัน Component หลักสำหรับหน้าจอการตั้งค่า
 * Input: -
 * Output: UI จัดการเปิด/ปิดระบบ และแผงควบคุมอัปโหลด/ลบรูปภาพ Banner
 */
export default function SettingPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ================= Modal States =================
  const [modalState, setModalState] = useState<ModalStateType>('none');
  const [bannerToDelete, setBannerToDelete] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const IMAGE_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:3000";

  /**
   * คำอธิบาย : Hook สำหรับดึงรายการรูปภาพ Banner และ สถานะของระบบ เมื่อโหลดหน้าเว็บครั้งแรก
   * Input: -
   * Output: -
   */
  useEffect(() => {
    fetchBanners();
    fetchSystemStatus();
  }, []);

  // ================= System Status Handlers =================

  /**
   * คำอธิบาย : ฟังก์ชันดึงสถานะการเปิด/ปิดระบบจาก Backend
   */
  const fetchSystemStatus = async () => {
    try {
      const result = await settingService.getServerStatus();
      if (!result.error && result.data) {
        setIsOnline(result.data.serverOnline);
      }
    } catch (error) {
      console.error("Error fetching system status:", error);
    }
  };

  /**
   * คำอธิบาย : เปิด Modal ยืนยันการเปิด/ปิดระบบ
   */
  const openToggleConfirm = () => {
    setModalState('confirmToggleStatus'); 
  };

  /**
   * คำอธิบาย : ฟังก์ชันยืนยันการเปิด/ปิดระบบ ส่งไปยัง API
   */
  const handleConfirmToggle = async () => {
    setIsProcessing(true);
    try {
      if (isOnline) {
        const result = await settingService.disableServer();
        if (!result.error) setIsOnline(false);
      } else {
        const result = await settingService.enableServer();
        if (!result.error) setIsOnline(true);
      }
      setModalState('successToggleStatus');
    } catch (error: any) {
      console.error("Error toggling server status:", error);
      alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการปรับเปลี่ยนสถานะระบบ");
      setModalState('none');
    } finally {
      setIsProcessing(false);
    }
  };


  // ================= Banner Handlers =================

  /**
   * คำอธิบาย : ฟังก์ชันดึงรายการรูปภาพ Banner จาก Backend ผ่าน settingService
   */
  const fetchBanners = async () => {
    try {
      const result = await settingService.getBanners();
      if (!result.error) {
        setBanners(result.data);
      }
    } catch (error: any) {
      console.error("Error fetching banners:", error);
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized: กรุณาเข้าสู่ระบบใหม่");
      }
    }
  };

  /**
   * คำอธิบาย : ฟังก์ชันอัปโหลดรูปภาพ Banner ใหม่เข้าสู่ระบบ
   */
  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (banners.length >= 5) {
      alert("อัปโหลดรูปภาพได้สูงสุด 5 รูปเท่านั้น");
      return;
    }

    setIsLoading(true);

    try {
      const result = await settingService.uploadBanner(file);
      if (!result.error) {
        fetchBanners();
      } else {
        alert(result.message);
      }
    } catch (error: any) {
      console.error("Error uploading banner:", error);
      if (error.response && error.response.status === 401) {
        alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
      } else {
        alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
      }
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  /**
   * คำอธิบาย : ฟังก์ชันเปิดหน้าต่างยืนยันการลบรูปภาพ Banner
   */
  const openDeleteConfirm = (id: number) => {
    setBannerToDelete(id);
    setModalState('confirmDeleteBanner');
  };

  /**
   * คำอธิบาย : ฟังก์ชันยืนยันการลบรูปภาพ Banner
   */
  const handleDeleteBanner = async () => {
    if (bannerToDelete === null) return;
    
    setIsProcessing(true);
    try {
      const result = await settingService.deleteBanner(bannerToDelete);

      if (!result.error) {
        setBanners(prev => prev.filter(item => item.id !== bannerToDelete));
        setModalState('successDeleteBanner');
      } else {
        alert(result.message || "ลบรูปภาพไม่สำเร็จ");
        setModalState('none');
      }
    } catch (error: any) {
      console.error("Error deleting banner:", error);
      alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      setModalState('none');
    } finally {
      setIsProcessing(false);
      setBannerToDelete(null);
    }
  };

  /**
   * คำอธิบาย : ฟังก์ชันสร้างและปรับปรุง URL ของรูปภาพ
   */
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    let cleanPath = imagePath.replace(/\\/g, '/');
    if (!cleanPath.includes('uploads/')) {
      cleanPath = cleanPath.startsWith('/') ? `uploads${cleanPath}` : `uploads/${cleanPath}`;
    }
    const finalUrl = cleanPath.startsWith('/') ? `${IMAGE_BASE_URL}${cleanPath}` : `${IMAGE_BASE_URL}/${cleanPath}`;
    return `${finalUrl}?t=${new Date().getTime()}`;
  };

  return (
    <div className="w-full space-y-6 relative">
      <h1 className="text-[24px] font-bold text-[#712874]">การตั้งค่า</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        
        {/* Section เปิด/ปิดระบบ */}
        <section className="mb-10">
          <h3 className="text-[16px] font-bold text-[#712874] mb-4">การเปิด / ปิดระบบ</h3>
          <div className="flex items-center gap-4">
            <span className="text-[14px] text-gray-600 font-medium">เปิดให้บริการ (Online)</span>
            <button 
              onClick={openToggleConfirm}
              className={`w-14 h-7 rounded-full p-1 transition-colors relative flex items-center ${isOnline ? 'bg-[#712874]' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${isOnline ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
          </div>
        </section>

        {/* Section เพิ่ม/แก้ไขรูปภาพ */}
        <section>
          <h3 className="text-[16px] font-bold text-[#712874] mb-4">การเพิ่ม / แก้ไขรูปภาพ</h3>
          
          <div className="relative pl-8">
            <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-orange-400" />
            
            <div className="flex items-center mb-6 relative">
              <div className="absolute left-[-32px] w-5 h-5 bg-orange-500 rounded-full" />
              <p className="text-[14px] text-gray-600 font-medium">รูปภาพในหน้าหลัก</p>
            </div>
            
            <div className="flex flex-wrap gap-4 pb-4">
              
              {/* รายการรูปภาพที่อัปโหลดแล้ว */}
              {banners.map((banner: any) => (
                <div key={banner.id} className="relative group w-48 h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                  <img 
                    src={getImageUrl(banner.image)} 
                    alt="Banner" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/192x128?text=Image+Not+Found'; }}
                  />
                  <button 
                    onClick={() => openDeleteConfirm(banner.id)}
                    className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white transition-all cursor-pointer hover:bg-black/70"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              ))}

              {/* กล่องอัปโหลดรูปภาพ */}
              {banners.length < 5 && (
                <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <ImagePlus className="text-gray-500 mb-2" size={28} />
                  <span className="text-[13px] font-semibold text-gray-600">{banners.length}/5</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleUploadBanner}
                    disabled={isLoading}
                  />
                </label>
              )}

            </div>
            {isLoading && <p className="text-[13px] text-[#712874] mt-2">กำลังอัปโหลดรูปภาพ...</p>}
          </div>
        </section>

      </div>

      {/* Modal */}
      <Modal 
        modalState={modalState} 
        setModalState={setModalState} 
        isProcessing={isProcessing}
        handleDeleteBanner={handleDeleteBanner} 
        handleToggleStatus={handleConfirmToggle}
        isOnline={isOnline}
      />

    </div>
  );
}