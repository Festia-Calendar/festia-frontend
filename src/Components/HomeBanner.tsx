/**
 * คำอธิบาย : Component สำหรับแสดงรูปภาพแบนเนอร์แบบเลื่อนสไลด์ (Carousel) และแถบค้นหากิจกรรมสำหรับหน้าแรก (Home)
 */

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface HomeBannerProps {
  banners: string[];
  getImageUrlPath: (path: string) => string;
  regionOptions: string[];
  availableProvinces: any[];
  onSearch: (keyword: string, zone: string, province: string) => void;
}

/**
 * คำอธิบาย : ฟังก์ชัน Component สำหรับแสดงแบนเนอร์และกล่องค้นหากิจกรรม
 * Input: props (HomeBannerProps) - ข้อมูลรูปภาพแบนเนอร์, ฟังก์ชันจัดการ URL รูปภาพ, ข้อมูลตัวเลือกภูมิภาคและจังหวัด, และฟังก์ชันเมื่อกดปุ่มค้นหา
 * Output: UI ส่วนหัวของหน้าแรกที่ประกอบด้วยรูปภาพสไลด์และฟอร์มสำหรับค้นหากิจกรรม
 */
export default function HomeBanner({ banners, getImageUrlPath, regionOptions, availableProvinces, onSearch }: HomeBannerProps) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');

  /**
   * คำอธิบาย : Hook สำหรับจัดการระบบเลื่อนรูปภาพแบนเนอร์อัตโนมัติ (Auto-slide) ทุกๆ 5 วินาที
   * Input: -
   * Output: -
   */
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="relative h-[450px] w-full flex flex-col items-center justify-center overflow-hidden">
      {banners.length > 0 ? banners.map((img, index) => (
        <img 
          key={index}
          src={getImageUrlPath(img)} 
          alt={`Banner ${index}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentBanner ? 'opacity-100' : 'opacity-0'}`}
        />
      )) : (
        <img src="https://placehold.co/1920x600?text=Banner" className="absolute inset-0 w-full h-full object-cover opacity-100" alt="Placeholder" />
      )}
      <div className="absolute inset-0 bg-black/40 z-10" />

      <div className="relative z-20 text-center w-full max-w-5xl px-4">
        <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-lg">ค้นพบกิจกรรมและเทศกาลทั่วไทย</h1>
        
        <div className="bg-white/95 p-3 rounded-xl flex flex-col md:flex-row gap-3 shadow-xl">
          <div className="flex-1">
            <input 
              type="text" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="พิมพ์ชื่อเทศกาล หรือกิจกรรมที่ต้องการ"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#712874]"
            />
          </div>
          
          <div className="w-full md:w-48">
            <select 
              value={selectedZone}
              onChange={(e) => {
                setSelectedZone(e.target.value);
                setSelectedProvince('');
              }}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-gray-600"
            >
              <option value="">เลือกภูมิภาค (ทั้งหมด)</option>
              {regionOptions.map(zone => <option key={zone} value={zone}>{zone}</option>)}
            </select>
          </div>
          
          <div className="w-full md:w-48">
            <select 
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              disabled={!selectedZone}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-gray-600 disabled:opacity-50"
            >
              <option value="">เลือกจังหวัด (ทั้งหมด)</option>
              {availableProvinces.map(prov => <option key={prov.id} value={prov.name_th}>{prov.name_th}</option>)}
            </select>
          </div>

          <button 
            onClick={() => onSearch(keyword, selectedZone, selectedProvince)}
            className="w-full md:w-32 bg-[#FF9800] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#F57C00] transition flex items-center justify-center gap-2 shadow-md"
          >
            <Search size={20} /> ค้นหา
          </button>
        </div>
      </div>
    </div>
  );
}