/**
 * คำอธิบาย : Component สำหรับหน้าจอ "จัดการกิจกรรม" (Manage Activity Page) ของระบบ
 * ทำหน้าที่แสดงรายการกิจกรรมทั้งหมดในรูปแบบตาราง พร้อมระบบค้นหา, ตัวกรอง (Filters), การแบ่งหน้า (Pagination) 
 * และการจัดการลบกิจกรรมผ่านหน้าต่างแจ้งเตือน (Modal) สำหรับผู้ดูแลระบบ
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Import Services ที่เราแยกไว้
import { locationService } from '../../Services/location.service';
import { activityService } from '../../Services/activity.service';

// Import Components
import ActivityFilterCard from '../../Components/ActivityFilterCard';
import ActivityTable from '../../Components/ActivityTable';
import ActivityPagination from '../../Components/ActivityPagination';
import Modal, { type ModalStateType } from '../../Components/Modal';

const ACTIVITY_TYPE_MAP: Record<string, string> = {
  CULTURAL_FESTIVAL: 'เทศกาลประเพณีและวัฒนธรรม',
  EXHIBITION_ART: 'นิทรรศการและศิลปะ',
  PERFORMANCE_MUSIC: 'การแสดง ดนตรี และความบันเทิง',
  FOOD_DRINK_FESTIVAL: 'เทศกาลอาหารและเครื่องดื่ม',
  MARKET_FAIR: 'ตลาดนัด ช้อปปิ้ง และงานแฟร์',
  TRAINING_SEMINAR: 'การอบรมและเสวนา',
  SPORT_RECREATION: 'กีฬา นันทนาการ',
  COMMUNITY_TOURISM: 'ท่องเที่ยวชุมชน'
};

const REGION_MAP: Record<number, string> = {
  1: "ภาคเหนือ", 2: "ภาคกลาง", 3: "ภาคตะวันออกเฉียงเหนือ",
  4: "ภาคตะวันตก", 5: "ภาคตะวันออก", 6: "ภาคใต้"
};

/**
 * คำอธิบาย : ฟังก์ชัน Component หลักสำหรับหน้าจอจัดการกิจกรรม
 * Input: -
 * Output: UI ตารางแสดงรายการกิจกรรม พร้อมปุ่มสร้างใหม่ ตัวกรอง และปุ่มจัดการลบ
 */
export default function ManageActivityPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
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

  // Modal State
  const [modalState, setModalState] = useState<ModalStateType>('none');
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  /**
   * คำอธิบาย : Hook สำหรับดึงข้อมูลที่ตั้ง (จังหวัด อำเภอ ตำบล) ทั้งหมดของประเทศไทย
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
   * คำอธิบาย : Hook กรองรายการจังหวัดตามภูมิภาคที่เลือก
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
   * คำอธิบาย : Hook กรองรายการอำเภอ/เขต ตามจังหวัดที่เลือก
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
   * คำอธิบาย : Hook กรองรายการตำบล/แขวง ตามอำเภอที่เลือก
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
   * คำอธิบาย : Hook สำหรับดึงข้อมูลกิจกรรมจาก API ทุกครั้งที่หน้า, จำนวนแถว, หรือตัวกรองหลักเปลี่ยนไป
   * Input: -
   * Output: -
   */
  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, activeFilters]);

  /**
   * คำอธิบาย : ฟังก์ชันเรียก API ดึงข้อมูลรายการกิจกรรมพร้อมตัวกรองและข้อมูลแบ่งหน้า
   * Input: -
   * Output: -
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      const payload = await activityService.getActivities({
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
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อกดปุ่มค้นหาข้อมูลด้วยเงื่อนไขที่เลือก
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
   * คำอธิบาย : ฟังก์ชันเคลียร์ค่าตัวกรองทั้งหมดกลับสู่ค่าเริ่มต้น
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
   * Input: e (Event)
   * Output: -
   */
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); 
  };

  /**
   * คำอธิบาย : ฟังก์ชันลบกิจกรรมที่เลือกผ่านทาง activityService
   * Input: -
   * Output: -
   */
  const handleDelete = async () => {
    if (activityToDelete === null) return;
    setIsDeleting(true);
    try {
      // เรียกใช้ Service ลบกิจกรรม
      await activityService.deleteActivity(activityToDelete);
      
      setModalState('successDelete');
      if (data.length === 1 && currentPage > 1) setCurrentPage(prev => prev - 1);
      else fetchData();
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาดในการลบ: ${err.response?.data?.message || err.message}`);
      setModalState('none');
    } finally {
      setIsDeleting(false);
      setActivityToDelete(null);
    }
  };

  const emptyRowsCount = rowsPerPage - data.length;

  return (
    <div className="w-full space-y-6 relative">
      <h1 className="text-[24px] font-bold text-[#712874]">จัดการกิจกรรม</h1>

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

      <div className="flex justify-end">
        <Link 
          to="/superadmin/activity/create" 
          className="bg-[#712874] text-white font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-purple-900 transition-colors shadow-sm inline-block"
        >
          สร้างกิจกรรมใหม่
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <ActivityTable 
          mode="manage"
          data={data} loading={loading} error={error} emptyRowsCount={emptyRowsCount} rowsPerPage={rowsPerPage}
          ACTIVITY_TYPE_MAP={ACTIVITY_TYPE_MAP}
          openDeleteConfirm={(id) => { setActivityToDelete(id); setModalState('confirmDelete'); }}
        />
        <ActivityPagination 
          totalCount={totalCount} currentPage={currentPage} rowsPerPage={rowsPerPage} totalPages={totalPages}
          handlePageChange={handlePageChange} handleRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>

      <Modal 
        modalState={modalState} setModalState={setModalState} isProcessing={isDeleting}
        handleDelete={handleDelete}
      />
    </div>
  );
}