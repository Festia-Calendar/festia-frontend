/**
 * คำอธิบาย : Component สำหรับหน้าจอ "ประวัติกิจกรรมสำหรับ Admin" (Admin History Activity Page)
 * ทำหน้าที่แสดงรายการประวัติกิจกรรมภายใต้สิทธิ์ของ Admin พร้อมระบบตัวกรองค้นหาเชิงลึก, การแบ่งหน้า (Pagination) 
 * และตารางแสดงข้อมูลในโหมดประวัติแบบระบุสถานะ Admin (`isAdmin={true}`)
 */

import React, { useEffect, useState } from 'react';

// Import Services
import { locationService } from '../../Services/location.service';
import { activityService } from '../../Services/activity.service';

// Import Components
import ActivityFilterCard from '../../Components/ActivityFilterCard';
import ActivityTable from '../../Components/ActivityTable';
import ActivityPagination from '../../Components/ActivityPagination';

const ACTIVITY_TYPE_MAP: Record<string, string> = {
  PERFORMANCE_MUSIC: 'การแสดง ดนตรี และความบันเทิง',
  EXHIBITION_ART: 'นิทรรศการและศิลปะ',
  FOOD_DRINK_FESTIVAL: 'เทศกาลอาหารและเครื่องดื่ม',
  MARKET_FAIR: 'ตลาดและงานแฟร์',
  TRAINING_SEMINAR: 'การศึกษาและอบรม',
  SPORT_RECREATION: 'กีฬาและนันทนาการ',
  COMMUNITY_TOURISM: 'การท่องเที่ยวชุมชน',
  CULTURAL_FESTIVAL: 'เทศกาลประเพณีและวัฒนธรรม'
};

const REGION_MAP: Record<number, string> = {
  1: "ภาคเหนือ", 2: "ภาคกลาง", 3: "ภาคตะวันออกเฉียงเหนือ",
  4: "ภาคตะวันตก", 5: "ภาคตะวันออก", 6: "ภาคใต้"
};

/**
 * คำอธิบาย : ฟังก์ชัน Component หลักสำหรับหน้าประวัติกิจกรรมของ Admin
 * Input: -
 * Output: UI ตารางแสดงประวัติรายการกิจกรรมสำหรับ Admin พร้อมระบบตัวกรองและแบ่งหน้า
 */
export default function AdminHistoryActivityPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filter States
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedSubDistrict, setSelectedSubDistrict] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [activeFilters, setActiveFilters] = useState({
    search: '', type: '', region: '', province: '',
    district: '', subDistrict: '', startDate: '', endDate: ''
  });

  // Location Data States
  const [thaiData, setThaiData] = useState<any[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [availableProvinces, setAvailableProvinces] = useState<any[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<any[]>([]);
  const [availableSubDistricts, setAvailableSubDistricts] = useState<string[]>([]);

  /**
   * คำอธิบาย : Hook สำหรับดึงข้อมูลที่ตั้ง (จังหวัด อำเภอ ตำบล) ทั้งหมดของประเทศไทยจาก locationService
   * Input: -
   * Output: -
   */
  useEffect(() => {
    const fetchThaiData = async () => {
      try {
        const resData = await locationService.getThaiData();
        setThaiData(resData);
        const regions = Array.from(new Set(resData.map((p: any) => REGION_MAP[p.geography_id]))).filter(Boolean) as string[];
        setRegionOptions(regions);
      } catch (err) {
        console.error("Error fetching Thai data:", err);
      }
    };
    fetchThaiData();
  }, []);

  /**
   * คำอธิบาย : Hook สำหรับกรองรายชื่อจังหวัดตามภูมิภาคที่เลือก
   * Input: -
   * Output: -
   */
  useEffect(() => {
    if (selectedRegion && Array.isArray(thaiData)) {
      const provinces = thaiData.filter(p => REGION_MAP[p.geography_id] === selectedRegion);
      setAvailableProvinces(provinces);
    } else {
      setAvailableProvinces([]); setSelectedProvince(''); setSelectedDistrict(''); setSelectedSubDistrict('');
    }
  }, [selectedRegion, thaiData]);

  /**
   * คำอธิบาย : Hook สำหรับกรองรายชื่ออำเภอ/เขต ตามจังหวัดที่เลือก
   * Input: -
   * Output: -
   */
  useEffect(() => {
    if (selectedProvince && Array.isArray(thaiData)) {
      const provinceObj = thaiData.find(p => (p.name_th || p.name || '').trim() === selectedProvince.trim());
      const districts = provinceObj?.amphure || provinceObj?.amphures || provinceObj?.amphoe || provinceObj?.amphoes || provinceObj?.district || provinceObj?.districts || [];
      setAvailableDistricts(districts);
    } else {
      setAvailableDistricts([]); setSelectedDistrict(''); setSelectedSubDistrict('');
    }
  }, [selectedProvince, thaiData]);

  /**
   * คำอธิบาย : Hook สำหรับกรองรายชื่อตำบล/แขวง ตามอำเภอที่เลือก
   * Input: -
   * Output: -
   */
  useEffect(() => {
    if (selectedDistrict && Array.isArray(availableDistricts)) {
      const districtObj = availableDistricts.find(d => (d.name_th || d.name || '').trim() === selectedDistrict.trim());
      const tambons = districtObj?.tambon || districtObj?.tambons || districtObj?.subdistrict || districtObj?.subdistricts || districtObj?.sub_district || districtObj?.sub_districts || [];
      const formattedTambons = tambons.map((t: any) => typeof t === 'string' ? t : t?.name_th || t?.name || '').filter(Boolean);
      setAvailableSubDistricts(formattedTambons);
    } else {
      setAvailableSubDistricts([]); setSelectedSubDistrict('');
    }
  }, [selectedDistrict, availableDistricts]);

  /**
   * คำอธิบาย : Hook สำหรับดึงข้อมูลประวัติกิจกรรมของ Admin จาก API ผ่าน activityService ทุกครั้งที่ตัวกรองเปลี่ยน
   * Input: -
   * Output: -
   */
  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, activeFilters]);

  /**
   * คำอธิบาย : ฟังก์ชันยิง API ดึงรายการประวัติกิจกรรมของ Admin ตามเงื่อนไขที่กำหนด
   * Input: -
   * Output: -
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      const payload = await activityService.getAdminHistoryActivities({
        page: currentPage,
        limit: rowsPerPage,
        search: activeFilters.search || undefined,
        activityType: activeFilters.type || undefined,
        zone: activeFilters.region || undefined,
        province: activeFilters.province || undefined,
        district: activeFilters.district || undefined,
        subDistrict: activeFilters.subDistrict || undefined,
        startDate: activeFilters.startDate || undefined,
        dueDate: activeFilters.endDate || undefined,
      });
      
      setData(payload?.data?.data || []);
      setTotalCount(payload?.data?.pagination?.totalCount || 0);
      setTotalPages(payload?.data?.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ดึงข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  /**
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อกดปุ่มค้นหาข้อมูลประวัติกิจกรรม
   * Input: -
   * Output: -
   */
  const handleSearchSubmit = () => {
    setCurrentPage(1); 
    setActiveFilters({
      search: searchKeyword, type: selectedType, region: selectedRegion, province: selectedProvince,
      district: selectedDistrict, subDistrict: selectedSubDistrict, startDate: startDate, endDate: endDate
    });
  };

  /**
   * คำอธิบาย : ฟังก์ชันล้างค่าการค้นหาและรีเซ็ตฟิลเตอร์ทั้งหมด
   * Input: -
   * Output: -
   */
  const handleClearSearch = () => {
    setSearchKeyword(''); setSelectedType(''); setSelectedRegion(''); setSelectedProvince('');
    setSelectedDistrict(''); setSelectedSubDistrict(''); setStartDate(''); setEndDate('');
    setActiveFilters({ search: '', type: '', region: '', province: '', district: '', subDistrict: '', startDate: '', endDate: '' });
    setCurrentPage(1);
  };

  /**
   * คำอธิบาย : ฟังก์ชันเปลี่ยนหน้าข้อมูล (Pagination)
   * Input: direction ('prev' | 'next') - ทิศทางการเปลี่ยนหน้า
   * Output: -
   */
  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) setCurrentPage(prev => prev - 1);
    else if (direction === 'next' && currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  /**
   * คำอธิบาย : ฟังก์ชันเปลี่ยนจำนวนแถวที่แสดงผลต่อหน้า
   * Input: e (Event ของ Select)
   * Output: -
   */
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); 
  };

  const emptyRowsCount = rowsPerPage - data.length;

  return (
    <div className="w-full space-y-6 relative">
      <h1 className="text-[24px] font-bold text-[#712874]">ประวัติกิจกรรม</h1>

      <ActivityFilterCard 
        searchKeyword={searchKeyword} setSearchKeyword={setSearchKeyword}
        selectedType={selectedType} setSelectedType={setSelectedType}
        selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion}
        selectedProvince={selectedProvince} setSelectedProvince={setSelectedProvince}
        selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict}
        selectedSubDistrict={selectedSubDistrict} setSelectedSubDistrict={setSelectedSubDistrict}
        startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}
        regionOptions={regionOptions} availableProvinces={availableProvinces}
        availableDistricts={availableDistricts} availableSubDistricts={availableSubDistricts}
        handleClearSearch={handleClearSearch} handleSearchSubmit={handleSearchSubmit}
        ACTIVITY_TYPE_MAP={ACTIVITY_TYPE_MAP}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <ActivityTable 
          mode="history" 
          isAdmin={true}
          data={data} loading={loading} error={error} emptyRowsCount={emptyRowsCount} rowsPerPage={rowsPerPage}
          ACTIVITY_TYPE_MAP={ACTIVITY_TYPE_MAP}
        />
        <ActivityPagination 
          totalCount={totalCount} currentPage={currentPage} rowsPerPage={rowsPerPage} totalPages={totalPages}
          handlePageChange={handlePageChange} handleRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>

    </div>
  );
}