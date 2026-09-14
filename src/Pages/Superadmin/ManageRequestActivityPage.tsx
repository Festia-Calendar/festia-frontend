/**
 * คำอธิบาย : Component สำหรับหน้าจอ "จัดการคำขออนุมัติกิจกรรม" (Manage Request Activity Page)
 * ทำหน้าที่แสดงรายการคำร้องขอกิจกรรมทั้งหมดที่รอการตรวจสอบ พร้อมระบบตัวกรอง, แบ่งหน้า (Pagination) 
 * และปุ่มควบคุมการอนุมัติหรือปฏิเสธคำขอผ่านหน้าต่างยืนยัน (Modal) สำหรับผู้ดูแลระบบระดับสูง
 */

import React, { useState, useEffect } from 'react';

// Import Services
import { locationService } from '../../Services/location.service';
import { activityService } from '../../Services/activity.service';

// Import Components 
import ActivityFilterCard from '../../Components/ActivityFilterCard';
import ActivityTable from '../../Components/ActivityTable';
import ActivityPagination from '../../Components/ActivityPagination';
import Modal, { type ModalStateType } from '../../Components/Modal';

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
 * คำอธิบาย : ฟังก์ชัน Component หลักสำหรับหน้าจออนุมัติคำขอกิจกรรม
 * Input: -
 * Output: UI ตารางแสดงรายการคำร้องขอกิจกรรมที่รอการอนุมัติ พร้อมระบบตัวกรองค้นหาและปุ่มกระทำ
 */
export default function ManageRequestActivityPage() {
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

  // Modal State สำหรับหน้า Request
  const [modalState, setModalState] = useState<ModalStateType>('none');
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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
   * คำอธิบาย : Hook สำหรับดึงข้อมูลคำร้องขอกิจกรรมจาก API ผ่าน activityService ทุกครั้งที่หน้า, จำนวนแถว หรือฟิลเตอร์เปลี่ยน
   * Input: -
   * Output: -
   */
  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, activeFilters]);

  /**
   * คำอธิบาย : ฟังก์ชันยิง API ดึงรายการคำร้องขอกิจกรรมที่รอการอนุมัติ
   * Input: -
   * Output: -
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      const payload = await activityService.getRequestActivities({
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
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อกดปุ่มค้นหาข้อมูลคำร้องขอ
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
   * คำอธิบาย : ฟังก์ชันล้างค่าตัวกรองและรีเซ็ตการค้นหา
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

  /**
   * คำอธิบาย : ฟังก์ชันยืนยันการอนุมัติคำขอกิจกรรม ผ่านทาง activityService
   * Input: -
   * Output: -
   */
  const handleApprove = async () => {
    if (selectedActivityId === null) return;
    setIsProcessing(true);
    try {
      await activityService.approveActivity(selectedActivityId);
      
      setModalState('successApprove');
      if (data.length === 1 && currentPage > 1) setCurrentPage(prev => prev - 1);
      else fetchData();
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.response?.data?.message || err.message}`);
      setModalState('none');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * คำอธิบาย : ฟังก์ชันยืนยันการปฏิเสธคำขอกิจกรรม พร้อมเหตุผล ผ่านทาง activityService
   * Input: -
   * Output: -
   */
  const handleReject = async () => {
    if (selectedActivityId === null) return;
    setIsProcessing(true);
    try {
      await activityService.rejectActivity(selectedActivityId, rejectReason);
      
      setModalState('successReject');
      if (data.length === 1 && currentPage > 1) setCurrentPage(prev => prev - 1);
      else fetchData();
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.response?.data?.message || err.message}`);
      setModalState('none');
    } finally {
      setIsProcessing(false);
    }
  };

  const emptyRowsCount = rowsPerPage - data.length;

  return (
    <div className="w-full space-y-6 relative">
      <h1 className="text-[24px] font-bold text-[#712874]">อนุมัติกิจกรรม</h1>

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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <ActivityTable 
          mode="request"
          data={data} loading={loading} error={error} emptyRowsCount={emptyRowsCount} rowsPerPage={rowsPerPage}
          ACTIVITY_TYPE_MAP={ACTIVITY_TYPE_MAP}
          openRejectModal={(id) => { setSelectedActivityId(id); setRejectReason(''); setModalState('rejectReason'); }}
          openApproveConfirm={(id) => { setSelectedActivityId(id); setModalState('confirmApprove'); }}
        />
        
        <ActivityPagination 
          totalCount={totalCount} currentPage={currentPage} rowsPerPage={rowsPerPage} totalPages={totalPages}
          handlePageChange={handlePageChange} handleRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>

      <Modal 
        modalState={modalState} setModalState={setModalState} isProcessing={isProcessing}
        handleApprove={handleApprove} handleReject={handleReject}
        rejectReason={rejectReason} setRejectReason={setRejectReason}
      />
    </div>
  );
}