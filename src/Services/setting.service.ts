/**
 * คำอธิบาย : Service สำหรับจัดการการตั้งค่าระบบ (Settings)
 * ทำหน้าที่เชื่อมต่อกับ Backend (API) เพื่อจัดการรูปภาพแบนเนอร์ (Banner) และจัดการสถานะเซิร์ฟเวอร์ สำหรับ Super Admin
 */

import api from '../Libs/axios';

/**
 * คำอธิบาย : ออบเจกต์ที่รวมฟังก์ชันการเรียก API สำหรับจัดการการตั้งค่าระบบ
 */
export const settingService = {
  
  // ================= Banners Management =================

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
  },

  // ================= System Configuration =================

  /**
   * คำอธิบาย : ฟังก์ชันดึงสถานะการทำงานปัจจุบันของระบบ (เปิด/ปิด)
   * Input: -
   * Output: ข้อมูลสถานะของเซิร์ฟเวอร์ (serverOnline)
   */
  getServerStatus: async () => {
    const response = await api.get('/server-status');
    return response.data;
  },

  /**
   * คำอธิบาย : ฟังก์ชันสั่งเปิดระบบให้ใช้งานได้ (Online)
   * Input: -
   * Output: ผลการทำงานตอบกลับว่าเปิดเซิร์ฟเวอร์สำเร็จ
   */
  enableServer: async () => {
    const response = await api.post('/superadmin/server/enable');
    return response.data;
  },

  /**
   * คำอธิบาย : ฟังก์ชันสั่งปิดระบบ (Offline)
   * Input: -
   * Output: ผลการทำงานตอบกลับว่าปิดเซิร์ฟเวอร์สำเร็จ
   */
  disableServer: async () => {
    const response = await api.post('/superadmin/server/disable');
    return response.data;
  }
};