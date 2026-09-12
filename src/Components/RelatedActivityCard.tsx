/**
 * คำอธิบาย : Component สำหรับแสดงการ์ดกิจกรรมที่เกี่ยวข้อง (Related Activity Card)
 * ใช้สำหรับแสดงข้อมูลกิจกรรมแบบย่อ (เช่น รูปภาพ, ชื่อ, คำโปรย, วันที่, สถานที่, ค่าเข้าชม) 
 * เพื่อใช้แนะนำกิจกรรมอื่นๆ ที่น่าสนใจในหน้าดูรายละเอียดกิจกรรม
 */

import React from 'react';
import { Link } from 'react-router-dom';

// ประกาศ Type สำหรับ Props ที่รับเข้ามา
interface RelatedActivityCardProps {
  activity: any;
  getImageUrl: (path: string) => string;
  formatDateRange: (start: string, end: string) => string;
  formatPrice: (price: any) => string;
}

/**
 * คำอธิบาย : ฟังก์ชัน Component สำหรับเรนเดอร์การ์ดกิจกรรม
 * Input: props (RelatedActivityCardProps) - ข้อมูลออบเจกต์กิจกรรม และฟังก์ชันจัดการรูปแบบข้อมูล (รูปภาพ, วันที่, ราคา)
 * Output: UI การ์ดกิจกรรมที่สามารถคลิกเพื่อลิงก์ (Navigate) ไปยังหน้าดูรายละเอียดของกิจกรรมนั้นๆ ได้
 */
export default function RelatedActivityCard({ activity, getImageUrl, formatDateRange, formatPrice }: RelatedActivityCardProps) {
  return (
    <Link 
      to={`/activity/${activity.id}`}
      className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex flex-col sm:flex-row hover:shadow-md transition-all duration-300 group"
    >
      <div className="w-full sm:w-[160px] h-[200px] sm:h-auto flex-shrink-0 relative overflow-hidden">
        <img 
          src={activity.activityFile?.[0]?.filePath ? getImageUrl(activity.activityFile[0].filePath) : 'https://placehold.co/300x400/f3f4f6/a1a1aa?text=No+Image'} 
          alt={activity.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
      </div>
      
      <div className="p-5 flex flex-col justify-center w-full">
        <h4 className="text-[16px] font-bold text-[#712874] mb-1.5 line-clamp-1">{activity.name}</h4>
        <p className="text-[13px] text-gray-500 mb-4 line-clamp-2 min-h-[38px] border-b border-gray-100 pb-3">
          {activity.tagline || activity.description || '-'}
        </p>
        
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[12px]">
          <div>
            <span className="block font-bold text-[#712874] mb-0.5">วันที่</span>
            <span className="text-gray-600">{formatDateRange(activity.startDate, activity.dueDate)}</span>
          </div>
          <div>
            <span className="block font-bold text-[#712874] mb-0.5">สถานที่</span>
            <span className="text-gray-600 truncate block pr-2" title={activity.location?.name}>
              {activity.location?.name || '-'}
            </span>
          </div>
          <div>
            <span className="block font-bold text-[#712874] mb-0.5">ค่าเข้าชม</span>
            <span className="text-green-600 font-bold">{formatPrice(activity.price)}</span>
          </div>
          <div>
            <span className="block font-bold text-[#712874] mb-0.5">ติดต่อ</span>
            <span className="text-gray-600 truncate block pr-2">{activity.phone || '-'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}