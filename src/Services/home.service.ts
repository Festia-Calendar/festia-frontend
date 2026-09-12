/**
 * คำอธิบาย : Service สำหรับจัดการข้อมูลสำหรับหน้าแรก (Home) และหน้าค้นหากิจกรรม
 * ทำหน้าที่เชื่อมต่อกับ Backend (API) เพื่อดึงข้อมูลแบนเนอร์, ปฏิทินกิจกรรม, การค้นหา และรายละเอียดกิจกรรมสำหรับผู้ใช้งานทั่วไป (Public)
 */

import api from '../Libs/axios';

/**
 * คำอธิบาย : ออบเจกต์ที่รวมฟังก์ชันการเรียก API ที่เกี่ยวกับหน้าแรกและหน้าค้นหากิจกรรมสาธารณะ
 */
export const homeService = {
  
  /**
   * คำอธิบาย : ฟังก์ชันดึงข้อมูลรูปภาพแบนเนอร์ (Carousel Images) สำหรับแสดงผลเป็นสไลด์ในหน้าแรก
   * Input: -
   * Output: string[] (อาร์เรย์ของ URL รูปภาพแบนเนอร์ หากไม่มีข้อมูลจะส่งกลับเป็นอาร์เรย์ว่าง)
   */
  getBanners: async () => {
    try {
      const res = await api.get('/home');
      if (res.data && !res.data.error && res.data.data?.carouselImages) {
        return res.data.data.carouselImages.map((b: any) => b.image);
      }
      return [];
    } catch (error) {
      console.error("Error fetching banners:", error);
      return [];
    }
  },

  /**
   * คำอธิบาย : ฟังก์ชันดึงข้อมูลกิจกรรมทั้งหมดในช่วงเวลาที่กำหนด เพื่อนำมาตรวจสอบและแสดงจุด(ไข่ปลา)บนปฏิทิน
   * โดยจะทำการวนลูปดึงข้อมูลจนครบทุกหน้า (Pagination) แบบอัตโนมัติ
   * Input: startDate (string - วันที่เริ่มต้น), endDate (string - วันที่สิ้นสุด)
   * Output: any[] (อาร์เรย์ของข้อมูลกิจกรรมทั้งหมดในช่วงเวลานั้น)
   */
  getCalendarActivities: async (startDate: string, endDate: string) => {
    try {
      let allActivities: any[] = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const res = await api.get('/search', {
          params: { startDate, endDate, page: currentPage }
        });
        
        const responseData = res.data?.data;
        if (responseData && responseData.data) {
          allActivities = [...allActivities, ...responseData.data];
          if (responseData.pagination.hasNextPage) {
            currentPage++;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }
      return allActivities;
    } catch (error) {
      console.error("Error fetching calendar activities:", error);
      return [];
    }
  },

  /**
   * คำอธิบาย : ฟังก์ชันค้นหากิจกรรมแบบมีตัวกรอง (Filter) และรองรับการแบ่งหน้า (Pagination) สำหรับแสดงเป็นรายการ
   * Input: params (any - ออบเจกต์ของตัวกรอง เช่น keyword, zone, province, startDate, endDate, type, page)
   * Output: any (ข้อมูลรายการกิจกรรมที่ตรงตามเงื่อนไข พร้อมข้อมูล Pagination)
   */
  searchActivities: async (params: any) => {
    const res = await api.get('/search', { params });
    return res.data.data;
  },

  /**
   * คำอธิบาย : ฟังก์ชันดึงข้อมูลรายละเอียดของกิจกรรม พร้อมทั้งสุ่มดึงกิจกรรมที่เกี่ยวข้อง (Related Activities) มาแสดงผล
   * Input: id (string - รหัสของกิจกรรมที่ต้องการดูรายละเอียด)
   * Output: object (ประกอบด้วย activity: ข้อมูลรายละเอียดกิจกรรมหลัก, และ relatedActivities: อาร์เรย์ของกิจกรรมที่เกี่ยวข้องที่ถูกสุ่มลำดับแล้ว)
   */
  getActivityDetail: async (id: string) => {
    const res = await api.get(`/home/activity/${id}`);
    const data = res.data.data;
    
    // สุ่มกิจกรรมที่เกี่ยวข้อง
    let related = [];
    if (data.relatedActivities && Array.isArray(data.relatedActivities)) {
      related = [...data.relatedActivities].sort(() => 0.5 - Math.random());
    }

    return {
      activity: data.activity,
      relatedActivities: related
    };
  }
};