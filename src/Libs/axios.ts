/**
 * คำอธิบาย : ไลบรารีสำหรับจัดการการเชื่อมต่อ API (HTTP Request) ด้วย Axios
 * ใช้ตั้งค่าเริ่มต้น (Configuration) เช่น Base URL, การแนบ Cookie อัตโนมัติ และดักจับ Error กรณี Token หมดอายุ
 */

import axios from 'axios';

/**
 * คำอธิบาย : สร้างและตั้งค่าเริ่มต้นให้กับ Axios Instance
 * กำหนด baseURL และสั่งให้ส่ง Cookie ไปกับทุก Request อัตโนมัติ (withCredentials: true)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * คำอธิบาย : ตัวดักจับ (Interceptor) สำหรับ HTTP Response ที่ตอบกลับมาจาก Server
 * ตรวจสอบสถานะ (Status Code) หากเป็น 401 (Unauthorized) ระบบจะทำการล้างข้อมูลผู้ใช้และบังคับให้กลับไปหน้า Login
 * Input: response (ข้อมูลที่ได้จาก Server), error (ข้อผิดพลาดที่เกิดขึ้น)
 * Output: response (กรณีสำเร็จ) หรือ Promise.reject (กรณีเกิดข้อผิดพลาด)
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // ถ้า Backend ตอบกลับมาว่า 401 (Unauthorized) แปลว่ายังไม่ได้ Login หรือ Cookie หมดอายุ
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;