import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, Phone, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; 

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

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];
const THAI_MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS_OF_WEEK = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

export default function HomePage() {
  const [banners, setBanners] = useState<string[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activities, setActivities] = useState<any[]>([]);

  // ================= Calendar States =================
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); 
  const [showMonthPicker, setShowMonthPicker] = useState(false); 

  const API_BASE_URL = "http://localhost:3000/api";
  const IMAGE_BASE_URL = "http://localhost:3000";

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const actRes = await fetch(`${API_BASE_URL}/home/activities`);
        const actData = await actRes.json();
        if (actData.data) {
          setActivities(actData.data);
        }

        const bannerRes = await fetch(`${API_BASE_URL}/home`);
        if (bannerRes.ok) {
           const result = await bannerRes.json();
           if (!result.error && result.data?.carouselImages) {
             const images = result.data.carouselImages.map((b: any) => b.image);
             setBanners(images.length > 0 ? images : ['/placeholder-banner.jpg']); 
           }
        } else {
           setBanners(['/placeholder-banner.jpg']);
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      }
    };

    fetchHomeData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [banners.length]);

  const getImageUrl = (imagePath: string) => {
    if (!imagePath || imagePath === '/placeholder-banner.jpg') return 'https://placehold.co/1920x600?text=Banner';
    let cleanPath = imagePath.replace(/\\/g, '/');
    if (!cleanPath.includes('uploads/')) {
      cleanPath = cleanPath.startsWith('/') ? `uploads${cleanPath}` : `uploads/${cleanPath}`;
    }
    return cleanPath.startsWith('/') ? `${IMAGE_BASE_URL}${cleanPath}` : `${IMAGE_BASE_URL}/${cleanPath}`;
  };

  // ================= Helper Calendar =================
  const isDateInActivity = (date: Date, activity: any) => {
    if (!activity.startDate || !activity.dueDate) return false;
    const targetDate = new Date(date).setHours(0,0,0,0);
    const startDate = new Date(activity.startDate).setHours(0,0,0,0);
    const dueDate = new Date(activity.dueDate).setHours(0,0,0,0);
    return targetDate >= startDate && targetDate <= dueDate;
  };

  const hasActivityOnDate = (date: Date) => {
    return activities.some(act => isDateInActivity(date, act));
  };

  const isSameDay = (d1: Date | null, d2: Date) => {
    if (!d1) return false;
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, date: new Date(year, month - 1, daysInPrevMonth - i) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
    }
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
    }
    return days;
  };

  // ⭐ ฟังก์ชันสำหรับจัดรูปแบบวันที่แบบช่วง (Range)
  const formatDateRange = (startStr: string, endStr: string) => {
    if (!startStr) return '-';
    const startDate = new Date(startStr).toLocaleDateString('th-TH');
    if (!endStr) return startDate;
    const endDate = new Date(endStr).toLocaleDateString('th-TH');
    
    // ถ้าวันเริ่มกับวันจบเป็นวันเดียวกัน ให้แสดงแค่วันเดียว
    if (startDate === endDate) return startDate;
    return `${startDate} - ${endDate}`;
  };

  // ================= กรองกิจกรรม =================
  const filteredActivities = activities.filter(activity => {
    // 1. กรองตามหมวดหมู่
    const matchCategory = selectedCategory === 'ALL' || activity.activityType === selectedCategory;
    
    // 2. กรองให้แสดงเฉพาะกิจกรรมที่อยู่ในเดือนที่เลือก (currentDate)
    let matchMonth = false;
    if (activity.startDate) {
      const start = new Date(activity.startDate);
      const end = activity.dueDate ? new Date(activity.dueDate) : start;
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
      // เช็คว่าระยะเวลากิจกรรมคาบเกี่ยวเข้ามาในเดือนที่กำลังเปิดดูปฏิทินหรือไม่
      matchMonth = start <= monthEnd && end >= monthStart;
    }

    // 3. กรองตามวันที่เลือกจากปฏิทิน (ถ้ามีการคลิกเลือกวัน)
    const matchDate = selectedDate ? isDateInActivity(selectedDate, activity) : true;
    
    return matchCategory && matchMonth && matchDate;
  });

  const CategoryButton = ({ typeKey, label }: { typeKey: string, label: string }) => (
    <button 
      onClick={() => setSelectedCategory(typeKey)}
      className={`px-5 py-2 rounded-full text-sm font-medium transition border ${
        selectedCategory === typeKey 
          ? 'bg-[#712874] text-white border-[#712874]' 
          : 'bg-white text-gray-600 border-gray-200 hover:border-[#712874]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans">
      {/* ================= Navbar ================= */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm relative z-20">
        <Link 
          to="/" 
          onClick={() => {
            // เลื่อนหน้าจอกลับไปบนสุดอย่างนุ่มนวล
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // รีเซ็ตค่าการกรองต่างๆ ให้กลับเป็นค่าเริ่มต้น
            setSelectedCategory('ALL');
            setSelectedDate(null);
            setCurrentDate(new Date());
          }}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img src={logo} alt="Festia Logo" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold text-[#712874]">Festia Calendar</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/register" className="px-6 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition">
            ลงทะเบียน
          </Link>
          <Link to="/login" className="px-6 py-2 text-sm font-medium text-white bg-[#712874] rounded-full hover:bg-purple-900 transition">
            เข้าสู่ระบบ
          </Link>
        </div>
      </nav>

      {/* ================= Hero Banner & Search ================= */}
      <div className="relative h-[450px] w-full flex flex-col items-center justify-center overflow-hidden">
        {banners.map((img, index) => (
          <img 
            key={index}
            src={getImageUrl(img)} 
            alt={`Banner ${index}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentBanner ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        <div className="absolute inset-0 bg-black/40 z-10" />

        <div className="relative z-20 text-center w-full max-w-5xl px-4">
          <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-lg">
            ค้นพบกิจกรรมและเทศกาลทั่วไทย
          </h1>
          
          <div className="bg-white/95 p-3 rounded-xl flex flex-col md:flex-row gap-3 shadow-xl">
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="พิมพ์ชื่อเทศกาล หรือกิจกรรมที่ต้องการ"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#712874]"
              />
            </div>
            <div className="w-full md:w-48">
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-gray-600">
                <option>เลือกภูมิภาค (ทั้งหมด)</option>
              </select>
            </div>
            <div className="w-full md:w-48">
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-gray-600">
                <option>เลือกจังหวัด (ทั้งหมด)</option>
              </select>
            </div>
            <button className="w-full md:w-32 bg-[#FF9800] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#F57C00] transition flex items-center justify-center gap-2 shadow-md">
              <Search size={20} /> ค้นหา
            </button>
          </div>
        </div>
      </div>

      {/* ================= Main Content ================= */}
      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Calendar & Categories */}
        <div className="w-full md:w-1/3 flex flex-col gap-10">
          
          {/* Calendar Widget */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative">
            
            <div className="flex justify-between items-center mb-6 text-[#4A154B]">
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1 hover:bg-gray-100 rounded transition"><ChevronLeft size={24} strokeWidth={2.5}/></button>
              
              <div 
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 font-bold text-[18px]"
                onClick={() => setShowMonthPicker(!showMonthPicker)}
              >
                <span>{THAI_MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                {showMonthPicker ? <ChevronDown size={20} className="rotate-180 transition-transform" /> : <ChevronDown size={20} className="transition-transform"/>}
              </div>

              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1 hover:bg-gray-100 rounded transition"><ChevronRight size={24} strokeWidth={2.5}/></button>
            </div>
            
            <div className="grid grid-cols-7 text-center text-[13px] mb-4 font-bold text-[#4A154B]">
              {DAYS_OF_WEEK.map(day => <div key={day}>{day}</div>)}
            </div>
            
            <div className="grid grid-cols-7 gap-x-2 gap-y-2 text-[14px]">
              {getDaysInMonth().map((item, idx) => {
                const isSelected = isSameDay(selectedDate, item.date);
                const hasEvent = hasActivityOnDate(item.date);
                
                return (
                  <div 
                    key={idx} 
                    onClick={() => {
                      if (!item.isCurrentMonth) {
                         setCurrentDate(item.date);
                      }
                      setSelectedDate(isSelected ? null : item.date);
                    }}
                    className={`
                      relative aspect-square flex flex-col items-center justify-center font-medium cursor-pointer transition rounded-sm
                      ${item.isCurrentMonth ? 'text-gray-800 bg-[#E5E7EB]' : 'text-gray-400 bg-gray-100/50'}
                      ${isSelected ? '!bg-[#4A154B] !text-white' : 'hover:bg-gray-300'}
                    `}
                  >
                    <span className="mb-0.5">{item.day}</span>
                    {hasEvent && (
                      <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#FF9800]' : 'bg-[#FF9800]'}`}></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal เลือกเดือน/ปี */}
            {showMonthPicker && (
              <div className="absolute inset-x-0 top-16 bg-white z-30 p-4 rounded-xl shadow-xl border border-gray-100 animate-fade-in-up">
                <div className="relative flex justify-center items-center mb-4 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1))} className="p-1 hover:bg-gray-100 rounded transition">
                      <ChevronLeft size={20}/>
                    </button>
                    <span className="font-bold text-[#4A154B] text-[16px] w-12 text-center">
                      {currentDate.getFullYear()}
                    </span>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1))} className="p-1 hover:bg-gray-100 rounded transition">
                      <ChevronRight size={20}/>
                    </button>
                  </div>
                  <button onClick={() => setShowMonthPicker(false)} className="absolute right-0 text-gray-400 hover:text-red-500 p-1">
                    <X size={18}/>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {THAI_MONTHS_SHORT.map((month, index) => (
                    <button 
                      key={month}
                      onClick={() => {
                        setCurrentDate(new Date(currentDate.getFullYear(), index, 1));
                        setShowMonthPicker(false);
                      }}
                      className={`py-2 px-2 text-sm rounded-full transition-colors border ${
                        currentDate.getMonth() === index 
                          ? 'bg-[#4A154B] text-white border-[#4A154B]' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#4A154B]'
                      }`}
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
              <div className="flex flex-wrap gap-3">
                <CategoryButton typeKey="ALL" label="ทั้งหมด" />
                <CategoryButton typeKey="CULTURAL_FESTIVAL" label={ACTIVITY_TYPE_MAP['CULTURAL_FESTIVAL']} />
              </div>
              <div className="flex flex-wrap gap-3">
                <CategoryButton typeKey="EXHIBITION_ART" label={ACTIVITY_TYPE_MAP['EXHIBITION_ART']} />
                <CategoryButton typeKey="FOOD_DRINK_FESTIVAL" label={ACTIVITY_TYPE_MAP['FOOD_DRINK_FESTIVAL']} />
              </div>
              <div className="flex flex-wrap gap-3">
                <CategoryButton typeKey="PERFORMANCE_MUSIC" label={ACTIVITY_TYPE_MAP['PERFORMANCE_MUSIC']} />
              </div>
              <div className="flex flex-wrap gap-3">
                <CategoryButton typeKey="MARKET_FAIR" label={ACTIVITY_TYPE_MAP['MARKET_FAIR']} />
                <CategoryButton typeKey="TRAINING_SEMINAR" label={ACTIVITY_TYPE_MAP['TRAINING_SEMINAR']} />
              </div>
              <div className="flex flex-wrap gap-3">
                <CategoryButton typeKey="SPORT_RECREATION" label={ACTIVITY_TYPE_MAP['SPORT_RECREATION']} />
                <CategoryButton typeKey="COMMUNITY_TOURISM" label={ACTIVITY_TYPE_MAP['COMMUNITY_TOURISM']} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Activity List */}
        <div className="w-full md:w-2/3">
          <h2 className="text-2xl font-bold text-[#712874] mb-6 flex items-center justify-between">
            <span>กิจกรรมเดือน {THAI_MONTHS[currentDate.getMonth()]}</span>
          </h2>
          
          <div className="flex flex-col gap-6">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity, index) => (
                <div key={activity.id || index} className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col sm:flex-row hover:shadow-md transition-shadow">
                  <div className="w-full sm:w-[220px] h-[260px] sm:h-auto flex-shrink-0">
                    <img 
                      src={activity.activityFile?.[0]?.filePath ? getImageUrl(activity.activityFile[0].filePath) : 'https://placehold.co/300x400/f3f4f6/a1a1aa?text=No+Image'} 
                      alt={activity.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  <div className="p-6 flex flex-col justify-center w-full relative">
                    <Link to={`/activity/${activity.id}`} className="absolute inset-0 z-10"></Link>

                    <h3 className="text-[18px] font-bold text-[#712874] mb-2">{activity.name}</h3>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed border-b border-gray-100 pb-4 line-clamp-2">
                      {activity.tagline || activity.description || '-'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm relative z-20 pointer-events-none">
                      <div>
                        <span className="block font-bold text-[#712874] mb-1">วันที่</span>
                        <span className="text-gray-600">
                          {/* ⭐ เรียกใช้ฟังก์ชัน formatDateRange ตรงนี้ */}
                          {formatDateRange(activity.startDate, activity.dueDate)}
                        </span>
                      </div>
                      <div>
                        <span className="block font-bold text-[#712874] mb-1">สถานที่</span>
                        <span className="text-gray-600 truncate block pr-2" title={activity.location?.name}>
                           {activity.location?.name || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="block font-bold text-[#712874] mb-1">ค่าเข้าชม</span>
                        <span className="text-green-600 font-bold">{activity.price ? `${Number(activity.price).toLocaleString()} ฿` : 'ฟรี'}</span>
                      </div>
                      <div>
                        <span className="block font-bold text-[#712874] mb-1">ติดต่อ</span>
                        <span className="text-gray-600 truncate block pr-2">{activity.phone || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm text-gray-500">
                ยังไม่มีข้อมูลกิจกรรมสำหรับหมวดหมู่หรือวันที่ที่เลือก
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ================= Footer ================= */}
      <footer className="bg-[#712874] text-white pt-10 pb-6 px-8 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-purple-800 pb-8 mb-6">
          <div>
            <h3 className="text-xl font-bold mb-3">ช่วยเหลือ</h3>
            <div className="flex items-center gap-2 text-purple-200">
              <Phone size={18} />
              <span>08x-xxx-xxx</span>
            </div>
          </div>
          <div>
            <Link to="/admin/login" className="bg-white text-[#712874] px-6 py-2.5 rounded-full font-medium text-sm hover:bg-gray-100 transition shadow-md">
              เข้าสู่ระบบ Admin
            </Link>
          </div>
        </div>
        <div className="text-center text-purple-300 text-sm">
          © 2026 Festia Calendar. All rights reserved.
        </div>
      </footer>
    </div>
  );
}