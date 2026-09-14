/**
 * คำอธิบาย : Component สำหรับหน้าหลัก (Home Page) ของเว็บไซต์ 
 * ทำหน้าที่แสดงแบนเนอร์, ปฏิทินกิจกรรม, ตัวกรองค้นหา และแสดงรายการกิจกรรมทั้งหมดสำหรับผู้ใช้งานทั่วไป
 * (รองรับปฏิทินแบบเลือกช่วงเวลา Date Range และระบบปิดปรับปรุงระบบ)
 */

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Phone, X } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import Services & Helpers
import { homeService } from '../Services/home.service';
import { locationService } from '../Services/location.service';
import { settingService } from '../Services/setting.service';

// Import Components
import HomeBanner from '../Components/HomeBanner';
import logo from '../assets/logo.png'; 

// ================= Constants =================
const ACTIVITY_TYPE_MAP: Record<string, string> = {
  ALL: 'ทั้งหมด',
  CULTURAL_FESTIVAL: 'เทศกาลประเพณีและวัฒนธรรม',
  EXHIBITION_ART: 'นิทรรศการและศิลปะ',
  PERFORMANCE_MUSIC: 'การแสดง ดนตรี และความบันเทิง',
  FOOD_DRINK_FESTIVAL: 'เทศกาลอาหารและเครื่องดื่ม',
  MARKET_FAIR: 'ตลาดนัด ช้อปปิ้ง และงานแฟร์',
  TRAINING_SEMINAR: 'การอบรมและเสวนา',
  SPORT_RECREATION: 'กีฬา นันทนาการ',
  COMMUNITY_TOURISM: 'ท่องเที่ยวชุมชน'
};

const THAI_MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const THAI_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const DAYS_OF_WEEK = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
const REGION_MAP: Record<number, string> = { 1: "ภาคเหนือ", 2: "ภาคกลาง", 3: "ภาคตะวันออกเฉียงเหนือ", 4: "ภาคตะวันตก", 5: "ภาคตะวันออก", 6: "ภาคใต้" };

/**
 * คำอธิบาย : ฟังก์ชัน Component สำหรับเรนเดอร์หน้าแรก
 * Input: -
 * Output: UI ของหน้าแรก (แบนเนอร์, ปฏิทิน, หมวดหมู่, และรายการกิจกรรม) หรือ หน้าจอปิดปรับปรุงระบบ
 */
export default function HomePage() {
  const [banners, setBanners] = useState<string[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [isSystemOnline, setIsSystemOnline] = useState<boolean>(true);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(true);

  // Location States
  const [thaiData, setThaiData] = useState<any[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [availableProvinces, setAvailableProvinces] = useState<any[]>([]);

  // Search & Pagination States
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeSearch, setActiveSearch] = useState({ keyword: '', zone: '', province: '' });
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Calendar States
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]); 
  const [showMonthPicker, setShowMonthPicker] = useState(false); 
  const [activitiesForCalendar, setActivitiesForCalendar] = useState<any[]>([]);

  const IMAGE_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:3000";

  /**
   * คำอธิบาย : Hook สำหรับตรวจสอบสถานะเปิด/ปิดระบบจาก Backend ทันทีที่เข้าเว็บ
   */
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const result = await settingService.getServerStatus();
        if (result && result.data) {
          setIsSystemOnline(result.data.serverOnline);
        }
      } catch (error) {
        console.error("Failed to check server status", error);
      } finally {
        setIsCheckingStatus(false);
      }
    };
    checkSystemStatus();
  }, []);

  /**
   * คำอธิบาย : Hook สำหรับโหลดข้อมูลตั้งต้น ได้แก่ ภูมิภาค/จังหวัด และ แบนเนอร์
   */
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const data = await locationService.getThaiData();
        setThaiData(data);
        setRegionOptions(Array.from(new Set(data.map((p: any) => REGION_MAP[p.geography_id]))).filter(Boolean) as string[]);
        
        const bannerImages = await homeService.getBanners();
        setBanners(bannerImages.length > 0 ? bannerImages : ['/placeholder-banner.jpg']);
      } catch (error) {
        console.error("Init data error:", error);
      }
    };
    fetchInitData();
  }, []);

  /**
   * คำอธิบาย : Hook สำหรับอัปเดตตัวเลือกจังหวัดเมื่อผู้ใช้งานเปลี่ยนภูมิภาค (Zone)
   */
  useEffect(() => {
    if (activeSearch.zone) {
      setAvailableProvinces(thaiData.filter(p => REGION_MAP[p.geography_id] === activeSearch.zone));
    } else {
      setAvailableProvinces([]);
    }
  }, [activeSearch.zone, thaiData]);

  /**
   * คำอธิบาย : Hook สำหรับโหลดข้อมูลกิจกรรมเพื่อแสดงเป็นจุดไข่ปลาบนปฏิทิน
   */
  useEffect(() => {
    const fetchCalendarDots = async () => {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
      const allActivities = await homeService.getCalendarActivities(start, end);
      setActivitiesForCalendar(allActivities);
    };
    fetchCalendarDots();
  }, [currentDate]);

  /**
   * คำอธิบาย : Hook สำหรับโหลดรายการกิจกรรมที่จะแสดงผลในหน้าเว็บ
   */
  useEffect(() => {
    const fetchActivities = async () => {
       setLoading(true);
       try {
         const formatYMD = (d: Date) => new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
         
         let searchStartDateStr, searchEndDateStr;
         
         if (dateRange[0] && dateRange[1]) {
           searchStartDateStr = formatYMD(dateRange[0]);
           searchEndDateStr = formatYMD(dateRange[1]);
         } 
         else if (dateRange[0] && !dateRange[1]) {
           searchStartDateStr = formatYMD(dateRange[0]);
           searchEndDateStr = formatYMD(dateRange[0]);
         } 
         else if (activeSearch.keyword || activeSearch.zone || activeSearch.province || selectedCategory !== 'ALL') {
           searchStartDateStr = undefined;
           searchEndDateStr = undefined;
         } 
         else {
           searchStartDateStr = formatYMD(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
           searchEndDateStr = formatYMD(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59));
         }

         const responseData = await homeService.searchActivities({
           keyword: activeSearch.keyword || undefined,
           zone: activeSearch.zone || undefined,
           province: activeSearch.province || undefined,
           type: selectedCategory !== 'ALL' ? selectedCategory : undefined,
           startDate: searchStartDateStr,
           endDate: searchEndDateStr,
           page: page
         });
         
         if (page === 1) setActivities(responseData.data);
         else setActivities(prev => [...prev, ...responseData.data]);
         
         setHasNextPage(responseData.pagination.hasNextPage);
       } catch (error) {
         console.error("Search error:", error);
       } finally {
         setLoading(false);
       }
    };
    fetchActivities();
  }, [page, selectedCategory, activeSearch, dateRange, currentDate]);

  const getImageUrlPath = (imagePath: string) => {
    if (!imagePath || imagePath === '/placeholder-banner.jpg') return 'https://placehold.co/1920x600?text=Banner';
    let cleanPath = imagePath.replace(/\\/g, '/');
    if (!cleanPath.includes('uploads/')) cleanPath = cleanPath.startsWith('/') ? `uploads${cleanPath}` : `uploads/${cleanPath}`;
    return cleanPath.startsWith('/') ? `${IMAGE_BASE_URL}${cleanPath}` : `${IMAGE_BASE_URL}/${cleanPath}`;
  };

  // ================= Calendar Logic Helpers =================

  /**
   * คำอธิบาย : ฟังก์ชันจัดการการคลิกวันที่บนปฏิทิน เพื่อสร้างช่วงวัน (Range)
   */
  const handleDateClick = (date: Date) => {
    const [start, end] = dateRange;
    if (!start || (start && end)) {
      setDateRange([date, null]);
    } else {
      if (date.getTime() === start.getTime()) {
         setDateRange([null, null]);
      } else if (date < start) {
         setDateRange([date, start]);
      } else {
         setDateRange([start, date]);
      }
    }
    setPage(1);
  };

  /**
   * คำอธิบาย : ฟังก์ชันเช็คว่าวันที่ระบุ อยู่ในช่วงวันจัดกิจกรรมนั้นๆ หรือไม่
   */
  const isDateInActivity = (date: Date, activity: any) => {
    if (!activity.startDate) return false;
    const target = new Date(date).setHours(0,0,0,0);
    const start = new Date(activity.startDate).setHours(0,0,0,0);
    const end = activity.dueDate ? new Date(activity.dueDate).setHours(0,0,0,0) : start;
    return target >= start && target <= end;
  };

  /**
   * คำอธิบาย : กรองกิจกรรมที่จะมาแสดงเฉพาะที่ตรงกับช่วง Range ในเครื่องมือปฏิทิน
   */
  const isActivityInRange = (act: any) => {
    const [start, end] = dateRange;
    if (!start) return true;
    
    const s = new Date(start).setHours(0,0,0,0);
    const e = end ? new Date(end).setHours(23,59,59,999) : new Date(start).setHours(23,59,59,999);
    
    const actStart = new Date(act.startDate).setHours(0,0,0,0);
    const actEnd = act.dueDate ? new Date(act.dueDate).setHours(23,59,59,999) : actStart;

    return actStart <= e && actEnd >= s;
  };
  
  const hasActivityOnDate = (date: Date) => activitiesForCalendar.some(act => isDateInActivity(date, act));

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  const isWithinRange = (date: Date) => {
    const [start, end] = dateRange;
    if (!start || !end) return false;
    const target = new Date(date).setHours(0,0,0,0);
    const s = new Date(start).setHours(0,0,0,0);
    const e = new Date(end).setHours(0,0,0,0);
    return target > s && target < e;
  };

  const getDaysInMonth = () => {
    const y = currentDate.getFullYear(), m = currentDate.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const daysInPrevMonth = new Date(y, m, 0).getDate();
    
    const days = [];
    for (let i = firstDay - 1; i >= 0; i--) days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, date: new Date(y, m - 1, daysInPrevMonth - i) });
    for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, isCurrentMonth: true, date: new Date(y, m, i) });
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) days.push({ day: i, isCurrentMonth: false, date: new Date(y, m + 1, i) });
    return days;
  };

  const formatDateRange = (startStr: string, endStr: string) => {
    if (!startStr) return '-';
    const s = new Date(startStr).toLocaleDateString('th-TH');
    const e = endStr ? new Date(endStr).toLocaleDateString('th-TH') : s;
    return s === e ? s : `${s} - ${e}`;
  };

  const CategoryButton = ({ typeKey, label }: { typeKey: string, label: string }) => (
    <button 
      onClick={() => { setSelectedCategory(typeKey); setPage(1); }}
      className={`px-5 py-2 rounded-full text-sm font-medium transition border ${selectedCategory === typeKey ? 'bg-[#712874] text-white border-[#712874]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#712874]'}`}
    >
      {label}
    </button>
  );

  const displayActivities = (dateRange[0] || dateRange[1]) ? activities.filter(isActivityInRange) : activities;

  if (isCheckingStatus) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FFFDF9] text-[#712874]">กำลังตรวจสอบสถานะระบบ...</div>;
  }
  if (!isSystemOnline) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-purple-50 text-[#712874] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">ขออภัย ระบบกำลังปิดปรับปรุง</h1>
          <p className="text-gray-500 mb-8">เรากำลังพัฒนาระบบให้ดียิ่งขึ้น กรุณากลับมาใช้งานใหม่อีกครั้งในภายหลัง</p>
          <Link to="/admin/login" className="text-sm text-[#712874] hover:underline font-medium">
            สำหรับผู้ดูแลระบบ (Admin Login)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans">
      {/* ================= Navbar ================= */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm relative z-20">
        <Link 
          to="/" 
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setSelectedCategory('ALL'); 
            setDateRange([null, null]);
            setCurrentDate(new Date());
            setActiveSearch({ keyword: '', zone: '', province: ''}); 
            setPage(1);
          }}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img src={logo} alt="Festia Logo" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold text-[#712874]">Festia Calendar</span>
        </Link>
      </nav>

      {/* ================= Banner & Search ================= */}
      <HomeBanner 
        banners={banners}
        getImageUrlPath={getImageUrlPath}
        regionOptions={regionOptions}
        availableProvinces={availableProvinces}
        onSearch={(keyword, zone, province) => {
          setActiveSearch({ keyword, zone, province });
          setPage(1);
        }}
      />

      {/* ================= Main Content ================= */}
      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Calendar & Categories */}
        <div className="w-full md:w-1/3 flex flex-col gap-10">
          
          {/* Calendar Widget */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative select-none">
            <div className="flex justify-between items-center mb-6 text-[#4A154B]">
              <button onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)); setDateRange([null, null]); setPage(1); }} className="p-1 hover:bg-gray-100 rounded transition"><ChevronLeft size={24} strokeWidth={2.5}/></button>
              
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 font-bold text-[18px]" onClick={() => setShowMonthPicker(!showMonthPicker)}>
                <span>{THAI_MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                {showMonthPicker ? <ChevronDown size={20} className="rotate-180 transition-transform" /> : <ChevronDown size={20} className="transition-transform"/>}
              </div>

              <button onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)); setDateRange([null, null]); setPage(1); }} className="p-1 hover:bg-gray-100 rounded transition"><ChevronRight size={24} strokeWidth={2.5}/></button>
            </div>
            
            <div className="grid grid-cols-7 text-center text-[13px] mb-4 font-bold text-[#4A154B]">
              {DAYS_OF_WEEK.map(day => <div key={day}>{day}</div>)}
            </div>
            
            <div className="grid grid-cols-7 gap-x-2 gap-y-2 text-[14px]">
              {getDaysInMonth().map((item, idx) => {
                const isStart = isSameDay(dateRange[0], item.date);
                const isEnd = isSameDay(dateRange[1], item.date);
                const isSelected = isStart || isEnd;
                const inRange = isWithinRange(item.date);
                const hasEvent = hasActivityOnDate(item.date);
                
                return (
                  <div 
                    key={idx} 
                    onClick={() => {
                      if (!item.isCurrentMonth) setCurrentDate(item.date);
                      handleDateClick(item.date);
                    }}
                    className={`relative aspect-square flex flex-col items-center justify-center font-medium cursor-pointer transition rounded-lg
                      ${item.isCurrentMonth ? (inRange ? 'text-[#712874]' : 'text-gray-800 bg-[#F3F4F6]') : (inRange ? 'text-[#712874]/50' : 'text-gray-400 bg-gray-50')}
                      ${isSelected ? '!bg-[#712874] !text-white' : ''}
                      ${inRange ? '!bg-[#F3E8FF] hover:bg-[#E9D5FF]' : 'hover:bg-gray-300'}
                    `}
                  >
                    <span className="mb-0.5 relative z-10">{item.day}</span>
                    {hasEvent && <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full z-10 ${isSelected ? 'bg-white' : 'bg-[#F59E0B]'}`}></div>}
                  </div>
                );
              })}
            </div>

            {/* Modal เลือกเดือน/ปี */}
            {showMonthPicker && (
              <div className="absolute inset-x-0 top-16 bg-white z-30 p-4 rounded-xl shadow-xl border border-gray-100 animate-fade-in-up">
                <div className="relative flex justify-center items-center mb-4 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-4">
                    <button onClick={() => { setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1)); setDateRange([null, null]); setPage(1); }} className="p-1 hover:bg-gray-100 rounded transition"><ChevronLeft size={20}/></button>
                    <span className="font-bold text-[#4A154B] text-[16px] w-12 text-center">{currentDate.getFullYear()}</span>
                    <button onClick={() => { setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1)); setDateRange([null, null]); setPage(1); }} className="p-1 hover:bg-gray-100 rounded transition"><ChevronRight size={20}/></button>
                  </div>
                  <button onClick={() => setShowMonthPicker(false)} className="absolute right-0 text-gray-400 hover:text-red-500 p-1"><X size={18}/></button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {THAI_MONTHS_SHORT.map((month, index) => (
                    <button 
                      key={month}
                      onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), index, 1)); setShowMonthPicker(false); setDateRange([null, null]); setPage(1); }}
                      className={`py-2 px-2 text-sm rounded-full transition-colors border ${currentDate.getMonth() === index ? 'bg-[#4A154B] text-white border-[#4A154B]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#4A154B]'}`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-[20px] font-bold text-[#712874] mb-5">ประเภทกิจกรรม</h3>
            <div className="flex flex-col gap-3 items-start">
              <div className="flex flex-wrap gap-3"><CategoryButton typeKey="ALL" label="ทั้งหมด" /><CategoryButton typeKey="CULTURAL_FESTIVAL" label={ACTIVITY_TYPE_MAP['CULTURAL_FESTIVAL']} /></div>
              <div className="flex flex-wrap gap-3"><CategoryButton typeKey="EXHIBITION_ART" label={ACTIVITY_TYPE_MAP['EXHIBITION_ART']} /><CategoryButton typeKey="FOOD_DRINK_FESTIVAL" label={ACTIVITY_TYPE_MAP['FOOD_DRINK_FESTIVAL']} /></div>
              <div className="flex flex-wrap gap-3"><CategoryButton typeKey="PERFORMANCE_MUSIC" label={ACTIVITY_TYPE_MAP['PERFORMANCE_MUSIC']} /></div>
              <div className="flex flex-wrap gap-3"><CategoryButton typeKey="MARKET_FAIR" label={ACTIVITY_TYPE_MAP['MARKET_FAIR']} /><CategoryButton typeKey="TRAINING_SEMINAR" label={ACTIVITY_TYPE_MAP['TRAINING_SEMINAR']} /></div>
              <div className="flex flex-wrap gap-3"><CategoryButton typeKey="SPORT_RECREATION" label={ACTIVITY_TYPE_MAP['SPORT_RECREATION']} /><CategoryButton typeKey="COMMUNITY_TOURISM" label={ACTIVITY_TYPE_MAP['COMMUNITY_TOURISM']} /></div>
            </div>
          </div>
        </div>

        {/* Right Column: Activity List */}
        <div className="w-full md:w-2/3">
          <h2 className="text-2xl font-bold text-[#712874] mb-6 flex items-center justify-between">
            <span>กิจกรรมเดือน {THAI_MONTHS[currentDate.getMonth()]}</span>
          </h2>
          
          <div className="flex flex-col gap-6">
            {loading && page === 1 ? (
               <div className="text-center text-gray-500 py-10">กำลังค้นหาข้อมูล...</div>
            ) : displayActivities.length > 0 ? (
              <>
                 {displayActivities.map((activity, index) => (
                   <div key={activity.id || index} className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col sm:flex-row hover:shadow-md transition-shadow">
                     <div className="w-full sm:w-[220px] h-[260px] sm:h-auto flex-shrink-0">
                       <img src={activity.activityFile?.[0]?.filePath ? getImageUrlPath(activity.activityFile[0].filePath) : 'https://placehold.co/300x400/f3f4f6/a1a1aa?text=No+Image'} alt={activity.name} className="w-full h-full object-cover" />
                     </div>
                     <div className="p-6 flex flex-col justify-center w-full relative">
                       <Link to={`/activity/${activity.id}`} className="absolute inset-0 z-10"></Link>
                       <h3 className="text-[18px] font-bold text-[#712874] mb-2">{activity.name}</h3>
                       <p className="text-sm text-gray-500 mb-6 leading-relaxed border-b border-gray-100 pb-4 line-clamp-2">{activity.tagline || activity.description || '-'}</p>
                       <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm relative z-20 pointer-events-none">
                         <div><span className="block font-bold text-[#712874] mb-1">วันที่</span><span className="text-gray-600">{formatDateRange(activity.startDate, activity.dueDate)}</span></div>
                         <div><span className="block font-bold text-[#712874] mb-1">สถานที่</span><span className="text-gray-600 truncate block pr-2" title={activity.location?.name}>{activity.location?.name || '-'}</span></div>
                         <div><span className="block font-bold text-[#712874] mb-1">ค่าเข้าชม</span><span className="text-green-600 font-bold">{activity.price ? `${Number(activity.price).toLocaleString()} ฿` : 'ฟรี'}</span></div>
                         <div><span className="block font-bold text-[#712874] mb-1">ติดต่อ</span><span className="text-gray-600 truncate block pr-2">{activity.phone || '-'}</span></div>
                       </div>
                     </div>
                   </div>
                 ))}
                 
                 {hasNextPage && (
                    <div className="text-center mt-4 relative z-30">
                       <button onClick={() => setPage(prev => prev + 1)} disabled={loading} className="px-6 py-2 border border-[#712874] text-[#712874] rounded-full hover:bg-purple-50 transition-colors font-medium disabled:opacity-50 cursor-pointer">
                          {loading ? 'กำลังโหลด...' : 'โหลดกิจกรรมเพิ่มเติม'}
                       </button>
                    </div>
                 )}
              </>
            ) : (
              <>
                <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm text-gray-500">ยังไม่มีข้อมูลกิจกรรมสำหรับหมวดหมู่หรือวันที่ที่เลือก</div>
                {hasNextPage && (
                    <div className="text-center mt-4 relative z-30">
                       <button onClick={() => setPage(prev => prev + 1)} disabled={loading} className="px-6 py-2 border border-[#712874] text-[#712874] rounded-full hover:bg-purple-50 transition-colors font-medium disabled:opacity-50 cursor-pointer">
                          {loading ? 'กำลังโหลด...' : 'โหลดกิจกรรมเพิ่มเติม (อาจมีข้อมูลหน้าถัดไป)'}
                       </button>
                    </div>
                 )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================= Footer ================= */}
      <footer className="bg-[#712874] text-white pt-10 pb-6 px-8 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-purple-800 pb-8 mb-6">
          <div>
            <h3 className="text-xl font-bold mb-3">ช่วยเหลือ</h3>
            <div className="flex items-center gap-2 text-purple-200"><Phone size={18} /><span>08x-xxx-xxx</span></div>
          </div>
          <div><Link to="/admin/login" className="bg-white text-[#712874] px-6 py-2.5 rounded-full font-medium text-sm hover:bg-gray-100 transition shadow-md relative z-30">เข้าสู่ระบบ Admin</Link></div>
        </div>
        <div className="text-center text-purple-300 text-sm">© 2026 Festia Calendar. All rights reserved.</div>
      </footer>
    </div>
  );
}