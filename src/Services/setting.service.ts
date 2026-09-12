/**
 * คำอธิบาย : Service สำหรับจัดการการตั้งค่าระบบ (Settings)
 * ทำหน้าที่เชื่อมต่อกับ Backend (API) เพื่อจัดการรูปภาพแบนเนอร์ (Banner) เช่น การดึงรายการ, อัปโหลดเพิ่ม และลบรูปภาพ สำหรับ Super Admin
 */

import api from '../Libs/axios';

/**
 * คำอธิบาย : ออบเจกต์ที่รวมฟังก์ชันการเรียก API สำหรับจัดการรูปภาพ Banner
 */
export const settingService = {
  
  /**
   * คำอธิบาย : ฟังก์ชันดึงรายการรูปภาพ Banner ทั้งหมดที่มีอยู่ในระบบ
   * Input: -
   * Output: ข้อมูลรายการรูปภาพ Banner ทั้งหมด
   */
  getBanners: async () => {
    const response = await api.get('/superadmin/banners');
    return response.data;
  },

  /**
   * คำอธิบาย : ฟังก์ชันอัปโหลดรูปภาพ Banner ใหม่เข้าสู่ระบบ
   * Input: file (File) - ไฟล์รูปภาพที่ผู้ใช้งานเลือกเพื่ออัปโหลด
   * Output: ข้อมูลผลการอัปโหลดหรือข้อมูล Banner ใหม่ที่ถูกบันทึก
   */
  uploadBanner: async (file: File) => {
    const formData = new FormData();
    formData.append("banner", file); // ชื่อ field ต้องตรงกับ Backend
    
    const response = await api.post('/superadmin/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * คำอธิบาย : ฟังก์ชันลบรูปภาพ Banner ออกจากระบบ
   * Input: id (number) - รหัสประจำตัว (ID) ของรูปภาพ Banner ที่ต้องการลบ
   * Output: ข้อมูลการตอบกลับจากระบบหลังทำการลบเสร็จสิ้น
   */
  deleteBanner: async (id: number) => {
    const response = await api.delete(`/superadmin/banner/${id}`);
    return response.data;
  }
};