import React, { useState, useEffect } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';

export default function SettingPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ================= Delete Modal State =================
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [bannerToDelete, setBannerToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // ดึง Token
  const token = localStorage.getItem('token') || ""; 
  
  const API_BASE_URL = "http://localhost:3000/api";
  const IMAGE_BASE_URL = "http://localhost:3000";

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/superadmin/banners`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        console.error("Unauthorized: กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      const result = await response.json();
      if (!result.error) {
        setBanners(result.data);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (banners.length >= 5) {
      alert("อัปโหลดรูปภาพได้สูงสุด 5 รูปเท่านั้น");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("banner", file);

    try {
      const response = await fetch(`${API_BASE_URL}/superadmin/banner`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (response.status === 401) {
        alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
        setIsLoading(false);
        return;
      }

      const result = await response.json();
      if (!result.error) {
        fetchBanners();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error uploading banner:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ================= Delete Handlers =================
  const openDeleteConfirm = (id: number) => {
    setBannerToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setBannerToDelete(null);
  };

  const handleDeleteBanner = async () => {
    if (bannerToDelete === null) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/superadmin/banner/${bannerToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (!result.error) {
        setBanners(prev => prev.filter(item => item.id !== bannerToDelete));
        setIsConfirmModalOpen(false);
        setIsSuccessModalOpen(true);
      } else {
        alert(result.message || "ลบรูปภาพไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsDeleting(false);
      setBannerToDelete(null);
    }
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    
    let cleanPath = imagePath.replace(/\\/g, '/');

    if (!cleanPath.includes('uploads/')) {
      cleanPath = cleanPath.startsWith('/') ? `uploads${cleanPath}` : `uploads/${cleanPath}`;
    }

    const finalUrl = cleanPath.startsWith('/') 
      ? `${IMAGE_BASE_URL}${cleanPath}` 
      : `${IMAGE_BASE_URL}/${cleanPath}`;
      
    return finalUrl;
  };

  return (
    <div className="w-full space-y-6 relative">
      <h1 className="text-[24px] font-bold text-[#712874]">การตั้งค่า</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        
        {/* Section 1: เปิด/ปิดระบบ */}
        <section className="mb-10">
          <h3 className="text-[16px] font-bold text-[#712874] mb-4">การเปิด / ปิดระบบ</h3>
          <div className="flex items-center gap-4">
            <span className="text-[14px] text-gray-600 font-medium">เปิดให้บริการ (Online)</span>
            {/* Toggle Switch */}
            <button 
              onClick={() => setIsOnline(!isOnline)}
              className={`w-14 h-7 rounded-full p-1 transition-colors relative flex items-center ${isOnline ? 'bg-[#712874]' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${isOnline ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
          </div>
        </section>

        {/* Section 2: เพิ่ม/แก้ไขรูปภาพ */}
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
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/192x128?text=Image+Not+Found';
                    }}
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

      {/* ================= Modal ยืนยันการลบแบนเนอร์ ================= */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[420px] p-10 flex flex-col items-center shadow-xl animate-fade-in-up">
            
            <div className="w-[64px] h-[64px] rounded-full border-[3px] border-black flex items-center justify-center mb-6">
              <span className="text-[36px] font-bold text-black leading-none">!</span>
            </div>
            
            <h3 className="text-[20px] font-bold text-gray-900 mb-3">ยืนยันการลบรูปภาพ</h3>
            <p className="text-[14px] text-gray-500 mb-8 text-center">คุณต้องการยืนยันการลบรูปภาพนี้หรือไม่</p>
            
            <div className="flex space-x-4 w-full justify-center">
              <button 
                onClick={closeConfirmModal}
                disabled={isDeleting}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors w-[120px]"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleDeleteBanner}
                disabled={isDeleting}
                className="px-6 py-2.5 bg-[#5B1F54] text-white rounded-lg text-[14px] font-medium hover:bg-[#461740] transition-colors w-[120px] flex justify-center items-center"
              >
                {isDeleting ? 'กำลังลบ...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= Modal ลบสำเร็จ ================= */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[420px] p-10 flex flex-col items-center shadow-xl animate-fade-in-up">
            
            <div className="w-[76px] h-[76px] rounded-full bg-[#6B2A68] flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <h3 className="text-[20px] font-bold text-gray-900 mb-3">ลบรูปภาพสำเร็จ</h3>
            <p className="text-[14px] text-gray-500 mb-8 text-center">รูปภาพถูกลบออกจากระบบแล้ว</p>
            
            <button 
              onClick={closeSuccessModal}
              className="px-8 py-2.5 bg-[#4A154B] text-white rounded-lg text-[14px] font-medium hover:bg-[#340f35] transition-colors w-[140px]"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

    </div>
  );
}