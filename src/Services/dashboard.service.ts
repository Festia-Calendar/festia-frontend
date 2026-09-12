/**
 * คำอธิบาย : Service สำหรับดึงข้อมูลสถิติภาพรวม (Dashboard)
 * ทำหน้าที่เชื่อมต่อกับ Backend (API) เพื่อดึงข้อมูลสถิติสำหรับนำไปแสดงบนกราฟและตารางรายงาน
 * รองรับทั้งการดึงข้อมูลของ Super Admin และ Admin
 */

import api from '../Libs/axios';

/**
 * คำอธิบาย : Interface สำหรับพารามิเตอร์ที่ใช้ในการกรองข้อมูล Dashboard
 */
export interface DashboardQueryParams {
  startDate?: string;
  endDate?: string;
  zone?: string;
  province?: string;
}

/**
 * คำอธิบาย : ออบเจกต์ที่รวมฟังก์ชันการเรียก API สำหรับหน้า Dashboard
 */
export const dashboardService = {
  // ==========================================
  // [Super Admin] ดึงข้อมูลสถิติภาพรวม
  // ==========================================
  
  /**
   * คำอธิบาย : ดึงข้อมูลสถิติภาพรวมของกิจกรรมทั้งหมดในระบบสำหรับ Super Admin
   * Input: params (DashboardQueryParams) - ตัวกรองข้อมูล เช่น ช่วงวันที่, ภูมิภาค, จังหวัด
   * Output: ข้อมูลสถิติสำหรับแสดงบน Dashboard (เช่น กิจกรรมแยกตามประเภท, ยอดเข้าชม, ฯลฯ)
   */
  getDashboardData: async (params: DashboardQueryParams) => {
    const response = await api.get('/superadmin/dashboard', { params });
    return response.data.data || response.data;
  },

  //
  // ==========================================
  // [Admin] ดึงข้อมูลสถิติภาพรวมของแอดมิน
  // ==========================================
  
  /**
   * คำอธิบาย : ดึงข้อมูลสถิติภาพรวมของกิจกรรมเฉพาะที่ Admin คนนั้นรับผิดชอบ
   * Input: params (DashboardQueryParams) - ตัวกรองข้อมูล เช่น ช่วงวันที่, ภูมิภาค, จังหวัด
   * Output: ข้อมูลสถิติสำหรับแสดงบน Dashboard สำหรับ Admin
   */
  getAdminDashboardData: async (params: DashboardQueryParams) => {
    const response = await api.get('/admin/dashboard', { params });
    return response.data.data || response.data;
  }
};