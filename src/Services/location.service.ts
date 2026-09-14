/**
 * คำอธิบาย : Service สำหรับจัดการข้อมูลสถานที่ (Location)
 * ทำหน้าที่ดึงข้อมูลภูมิภาค จังหวัด อำเภอ และตำบลของประเทศไทยจากแหล่งข้อมูลภายนอก 
 * เพื่อนำมาใช้เป็นตัวเลือก (Dropdown) ภายในระบบ
 */

export const locationService = {
  /**
   * คำอธิบาย : ฟังก์ชันดึงข้อมูลจังหวัด อำเภอ และตำบล ทั้งหมดของประเทศไทยผ่าน API (ไฟล์ JSON จาก GitHub)
   * Input: -
   * Output: Array ของข้อมูลสถานที่ทั้งหมด (หากข้อมูลที่ได้เป็น Array จะส่งคืนข้อมูลนั้น หากเกิดข้อผิดพลาดจะส่งออก Error)
   */
  getThaiData: async () => {
    try {
      const response = await fetch('https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/province_with_district_and_sub_district.json');
      if (!response.ok) throw new Error("Network response was not ok");
      const resData = await response.json();
      return Array.isArray(resData) ? resData : [];
    } catch (err) {
      console.error("Error fetching Thai data:", err);
      throw err;
    }
  }
};