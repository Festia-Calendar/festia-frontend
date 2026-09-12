/**
 * คำอธิบาย : Service สำหรับจัดการข้อมูลกิจกรรม (Activity) ทั้งหมด
 * ทำหน้าที่เชื่อมต่อกับ Backend (API) ผ่านไลบรารี Axios ที่ตั้งค่าไว้ 
 * รองรับการทำงานทั้งฝั่ง Super Admin (ดูแลระบบรวม) และ Admin (ดูแลระบบเฉพาะส่วน)
 */

import api from '../Libs/axios';

// ประกาศ Type ให้พารามิเตอร์ที่ใช้ค้นหา เพื่อกันพิมพ์ชื่อตัวแปรผิดและกำหนดรูปแบบชัดเจน
export interface ActivityQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  activityType?: string;
  zone?: string;
  province?: string;
  district?: string;
  subDistrict?: string;
  startDate?: string;
  dueDate?: string;
}

/**
 * คำอธิบาย : ออบเจกต์ที่รวมฟังก์ชันการเรียก API ที่เกี่ยวกับกิจกรรม (Activity Service)
 */
export const activityService = {

  // ==========================================
  // [Super Admin] ส่วนของหน้ากิจกรรม (Activity)
  // ==========================================

  /**
   * คำอธิบาย : ดึงรายการกิจกรรมทั้งหมดสำหรับ Super Admin
   * Input: params (ActivityQueryParams) - ตัวกรองและข้อมูลหน้า (Pagination)
   * Output: ข้อมูลรายการกิจกรรมทั้งหมด
   */
  getActivities: async (params: ActivityQueryParams) => {
    const response = await api.get('/superadmin/activities', { params });
    return response.data;
  },

  /**
   * คำอธิบาย : ลบกิจกรรมออกจากระบบโดย Super Admin
   * Input: id (number) - รหัสของกิจกรรม
   * Output: ข้อมูลการตอบกลับหลังทำการลบเสร็จสิ้น
   */
  deleteActivity: async (id: number) => {
    const response = await api.delete(`/superadmin/activity/${id}`);
    return response.data;
  },

  /**
   * คำอธิบาย : ดึงข้อมูลรายละเอียดของกิจกรรม 1 รายการโดย Super Admin
   * Input: id (string | number) - รหัสของกิจกรรม
   * Output: ข้อมูลรายละเอียดกิจกรรมนั้นๆ
   */
  getActivityById: async (id: string | number) => {
    const response = await api.get(`/superadmin/activity/${id}`);
    return response.data;
  },

  /**
   * คำอธิบาย : สร้างกิจกรรมใหม่โดย Super Admin
   * Input: formDataToSend (FormData) - ข้อมูลกิจกรรมและไฟล์ภาพ/วิดีโอ
   * Output: ข้อมูลกิจกรรมที่ถูกสร้าง
   */
  createActivity: async (formDataToSend: FormData) => {
    const response = await api.post('/superadmin/activity', formDataToSend, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * คำอธิบาย : แก้ไข/อัปเดตข้อมูลกิจกรรมโดย Super Admin
   * Input: id (number | string) - รหัสของกิจกรรม, formDataToSend (FormData) - ข้อมูลที่ถูกแก้ไข
   * Output: ข้อมูลกิจกรรมที่อัปเดตแล้ว
   */
  updateActivity: async (id: number | string, formDataToSend: FormData) => {
    const response = await api.put(`/superadmin/activity/${id}`, formDataToSend, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // ==========================================
  // [Super Admin] ส่วนของหน้าคำร้องขอกิจกรรม (Request Activity)
  // ==========================================

  /**
   * คำอธิบาย : ดึงรายการคำร้องขอกิจกรรมที่รอการอนุมัติ (Pending)
   * Input: params (ActivityQueryParams) - ตัวกรองและข้อมูลหน้า
   * Output: ข้อมูลรายการคำร้องขอกิจกรรม
   */
  getRequestActivities: async (params: ActivityQueryParams) => {
    const response = await api.get('/superadmin/activity-requests', { params });
    return response.data;
  },

  /**
   * คำอธิบาย : อนุมัติคำร้องขอกิจกรรม
   * Input: id (number) - รหัสของกิจกรรมที่ต้องการอนุมัติ
   * Output: ผลการทำงาน
   */
  approveActivity: async (id: number) => {
    const response = await api.patch(`/superadmin/activity-requests/${id}/approve`);
    return response.data;
  },

  /**
   * คำอธิบาย : ปฏิเสธคำร้องขอกิจกรรม
   * Input: id (number) - รหัสของกิจกรรม, reason (string) - เหตุผลที่ปฏิเสธ
   * Output: ผลการทำงาน
   */
  rejectActivity: async (id: number, reason: string) => {
    const response = await api.patch(`/superadmin/activity-requests/${id}/reject`, { reason });
    return response.data;
  },

  /**
   * คำอธิบาย : ดึงข้อมูลรายละเอียดของคำร้องขอกิจกรรม
   * Input: id (string | number) - รหัสของกิจกรรม
   * Output: ข้อมูลรายละเอียดของคำร้องขอ
   */
  getRequestActivityById: async (id: string | number) => {
    const response = await api.get(`/superadmin/activity-requests/${id}`);
    return response.data.data || response.data;
  },

  // ==========================================
  // [Super Admin] ส่วนของหน้าประวัติกิจกรรม (History Activity)
  // ==========================================

  /**
   * คำอธิบาย : ดึงประวัติกิจกรรม (กิจกรรมที่สิ้นสุดแล้วหรือถูกจัดการแล้ว)
   * Input: params (ActivityQueryParams) - ตัวกรองและข้อมูลหน้า
   * Output: ข้อมูลประวัติกิจกรรม
   */
  getHistoryActivities: async (params: ActivityQueryParams) => {
    const response = await api.get('/superadmin/activity/histories', { params });
    return response.data;
  },

  //
  // ==========================================
  // [Admin] ส่วนของแอดมิน (Admin Role)
  // ==========================================
  
  /**
   * คำอธิบาย : ดึงรายการกิจกรรมทั้งหมดที่ Admin คนนั้นรับผิดชอบ
   * Input: params (ActivityQueryParams) - ตัวกรองและข้อมูลหน้า
   * Output: ข้อมูลรายการกิจกรรมสำหรับ Admin
   */
  getAdminActivities: async (params: ActivityQueryParams) => {
    const response = await api.get('/admin/activities', { params });
    return response.data;
  },

  /**
   * คำอธิบาย : ลบกิจกรรมออกจากระบบโดย Admin
   * Input: id (number) - รหัสของกิจกรรม
   * Output: ข้อมูลการตอบกลับ
   */
  deleteAdminActivity: async (id: number) => {
    const response = await api.delete(`/admin/activity/${id}`);
    return response.data;
  },

  /**
   * คำอธิบาย : ดึงข้อมูลรายละเอียดของกิจกรรม 1 รายการโดย Admin
   * Input: id (string | number) - รหัสของกิจกรรม
   * Output: ข้อมูลรายละเอียดกิจกรรม
   */
  getAdminActivityById: async (id: string | number) => {
    const response = await api.get(`/admin/activity/${id}`);
    return response.data;
  },

  /**
   * คำอธิบาย : สร้างกิจกรรมใหม่โดย Admin
   * Input: formDataToSend (FormData) - ข้อมูลกิจกรรมและไฟล์
   * Output: ข้อมูลกิจกรรมที่ถูกสร้าง
   */
  createAdminActivity: async (formDataToSend: FormData) => {
    const response = await api.post('/admin/activity', formDataToSend, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * คำอธิบาย : แก้ไขข้อมูลกิจกรรมโดย Admin
   * Input: id (number | string) - รหัสกิจกรรม, formDataToSend (FormData) - ข้อมูลใหม่
   * Output: ข้อมูลกิจกรรมที่อัปเดต
   */
  updateAdminActivity: async (id: number | string, formDataToSend: FormData) => {
    const response = await api.put(`/admin/activity/${id}`, formDataToSend, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * คำอธิบาย : ดึงข้อมูลประวัติกิจกรรมที่สิ้นสุดแล้วหรือจัดการแล้วของ Admin
   * Input: params (ActivityQueryParams) - ตัวกรองและข้อมูลหน้า
   * Output: ข้อมูลประวัติกิจกรรมของ Admin
   */
  getAdminHistoryActivities: async (params: ActivityQueryParams) => {
    const response = await api.get('/admin/activity/histories', { params });
    return response.data;
  },
};