/**
 * คำอธิบาย : Component สำหรับแสดงการ์ดกรองข้อมูลกิจกรรม (Filter Card)
 * ใช้สำหรับเลือกเงื่อนไขการค้นหา เช่น ชื่อกิจกรรม, ประเภท, ภูมิภาค, จังหวัด, อำเภอ, ตำบล และช่วงวันที่
 */

import React from 'react';

// ประกาศ Type สำหรับ Props ที่รับเข้ามา
interface ActivityFilterCardProps {
  searchKeyword: string;
  setSearchKeyword: (val: string) => void;
  selectedType: string;
  setSelectedType: (val: string) => void;
  selectedRegion: string;
  setSelectedRegion: (val: string) => void;
  selectedProvince: string;
  setSelectedProvince: (val: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (val: string) => void;
  selectedSubDistrict: string;
  setSelectedSubDistrict: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  regionOptions: string[];
  availableProvinces: any[];
  availableDistricts: any[];
  availableSubDistricts: string[];
  handleClearSearch: () => void;
  handleSearchSubmit: () => void;
  ACTIVITY_TYPE_MAP: Record<string, string>;
}

/**
 * คำอธิบาย : ฟังก์ชัน Component สำหรับหน้าต่างกรองข้อมูลกิจกรรม (Activity Filter Card)
 * Input: props (ActivityFilterCardProps) - ข้อมูลและฟังก์ชันที่ใช้จัดการ state ของตัวกรอง
 * Output: UI การ์ดที่มีช่อง Input และ Select สำหรับกรองข้อมูล พร้อมปุ่มค้นหาและล้างค่า
 */
export default function ActivityFilterCard(props: ActivityFilterCardProps) {
  const {
    searchKeyword, setSearchKeyword,
    selectedType, setSelectedType,
    selectedRegion, setSelectedRegion,
    selectedProvince, setSelectedProvince,
    selectedDistrict, setSelectedDistrict,
    selectedSubDistrict, setSelectedSubDistrict,
    startDate, setStartDate,
    endDate, setEndDate,
    regionOptions, availableProvinces, availableDistricts, availableSubDistricts,
    handleClearSearch, handleSearchSubmit,
    ACTIVITY_TYPE_MAP
  } = props;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      {/* แถวแรก: ค้นหา, ประเภท, ภูมิภาค, จังหวัด */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-[13px] text-gray-500 mb-1.5">ค้นหาด้วยชื่อกิจกรรม</label>
          <input 
            type="text" 
            placeholder="พิมพ์คำค้นหา" 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#712874] focus:ring-1 focus:ring-[#712874] transition-colors" 
          />
        </div>
        <div>
          <label className="block text-[13px] text-gray-500 mb-1.5">ค้นหาด้วยประเภทกิจกรรม</label>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#712874] bg-white transition-colors"
          >
            <option value="">ทุกประเภท</option>
            {Object.entries(ACTIVITY_TYPE_MAP).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[13px] text-gray-500 mb-1.5">ค้นหาด้วยภูมิภาค</label>
          <select 
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setSelectedProvince('');
              setSelectedDistrict('');
              setSelectedSubDistrict('');
            }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#712874] bg-white transition-colors text-gray-500"
          >
            <option value="">ภูมิภาค</option>
            {regionOptions?.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[13px] text-gray-500 mb-1.5">ค้นหาด้วยจังหวัด</label>
          <select 
            value={selectedProvince}
            onChange={(e) => {
              setSelectedProvince(e.target.value);
              setSelectedDistrict('');
              setSelectedSubDistrict('');
            }}
            disabled={!selectedRegion}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#712874] bg-white transition-colors disabled:opacity-50"
          >
            <option value="">ทุกจังหวัด</option>
            {availableProvinces?.map((prov, i) => (
              <option key={`prov-${i}`} value={prov.name_th || prov.name}>{prov.name_th || prov.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* แถวสอง: อำเภอ, ตำบล, วันที่, ปุ่มค้นหา */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-[13px] text-gray-500 mb-1.5">ค้นหาด้วยอำเภอ</label>
          <select 
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setSelectedSubDistrict('');
            }}
            disabled={!selectedProvince}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#712874] bg-white transition-colors disabled:opacity-50"
          >
            <option value="">ทุกอำเภอ</option>
            {availableDistricts?.map((dist: any, i: number) => (
              <option key={`dist-${i}`} value={dist.name_th || dist.name}>{dist.name_th || dist.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[13px] text-gray-500 mb-1.5">ค้นหาด้วยตำบล</label>
          <select 
            value={selectedSubDistrict}
            onChange={(e) => setSelectedSubDistrict(e.target.value)}
            disabled={!selectedDistrict}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#712874] bg-white transition-colors disabled:opacity-50"
          >
            <option value="">ทุกตำบล</option>
            {availableSubDistricts?.map((sub: string, index: number) => (
              <option key={`sub-${sub}-${index}`} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
        
        {/* ส่วนของวันที่ และ ปุ่มค้นหา */}
        <div className="md:col-span-2 flex flex-col md:flex-row gap-4 items-end w-full">
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <div>
              <label className="block text-[13px] text-gray-500 mb-1.5">วันที่เริ่มกิจกรรม</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-[#712874] transition-colors" 
              />
            </div>
            <div>
              <label className="block text-[13px] text-gray-500 mb-1.5">วันที่สิ้นสุดกิจกรรม</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-[#712874] transition-colors" 
              />
            </div>
          </div>
          <div className="flex space-x-2 pb-[1px] shrink-0">
              <button 
                onClick={handleClearSearch}
                className="bg-purple-50 text-[#712874] font-medium px-4 py-2 rounded-lg text-[13px] hover:bg-purple-100 transition-colors"
              >
                ล้างค่า
              </button>
              <button 
                onClick={handleSearchSubmit}
                className="bg-[#712874] text-white font-medium px-5 py-2 rounded-lg text-[13px] hover:bg-purple-900 transition-colors"
              >
                ค้นหากิจกรรม
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}