/**
 * คำอธิบาย : Component สำหรับปฏิทินเลือกช่วงวันที่ (Date Range Picker) แบบกำหนดเอง
 * รองรับการเลือกวันเดียว, เลือกเป็นช่วง (Start-End), เลือกทั้งเดือน หรือเลือกทั้งปี
 */

import React, { useState, useEffect, useRef } from 'react';

// ตัวแปรค่าคงที่สำหรับชื่อเดือนและวันในภาษาไทย
const MONTH_NAMES_FULL = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const MONTH_NAMES_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const DAYS_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

// ประกาศ Type สำหรับ Props ที่รับเข้ามา
interface CustomDateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (dates: [Date | null, Date | null]) => void;
}

/**
 * คำอธิบาย : ฟังก์ชัน Component สำหรับแสดงปุ่มและหน้าต่าง Dropdown ปฏิทิน
 * Input: props (CustomDateRangePickerProps) - วันที่เริ่มต้น, วันที่สิ้นสุด และฟังก์ชัน onChange เพื่ออัปเดต state
 * Output: UI ช่องกดเลือกวันที่ พร้อมหน้าต่าง Dropdown ที่สามารถเลือกวัน/เดือน/ปี ได้
 */
export default function CustomDateRangePicker({ startDate, endDate, onChange }: CustomDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'dates' | 'months'>('dates');
  const [displayDate, setDisplayDate] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * คำอธิบาย : Hook สำหรับจัดการ Event คลิกนอกหน้าต่างปฏิทิน เพื่อปิด Dropdown อัตโนมัติ
   * Input: -
   * Output: -
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setView('dates');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * คำอธิบาย : ฟังก์ชันหาจำนวนวันทั้งหมดในเดือนนั้นๆ
   * Input: year (ปี ค.ศ.), month (เดือน 0-11)
   * Output: number (จำนวนวัน เช่น 28, 30, 31)
   */
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

  /**
   * คำอธิบาย : ฟังก์ชันหาวันแรกของเดือนว่าตรงกับวันอะไรในสัปดาห์ (อาทิตย์-เสาร์)
   * Input: year (ปี ค.ศ.), month (เดือน 0-11)
   * Output: number (0 = อาทิตย์, 1 = จันทร์ ... 6 = เสาร์)
   */
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  /**
   * คำอธิบาย : ฟังก์ชันจัดการเมื่อผู้ใช้งานคลิกเลือกวันในปฏิทิน
   * ควบคุมลอจิกการเลือกวันที่เริ่มต้น และวันที่สิ้นสุด (Start Date & End Date)
   * Input: day (วันที่ 1-31)
   * Output: -
   */
  const handleDayClick = (day: number) => {
    let clickedDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
    
    if (!startDate || (startDate && endDate)) {
      // กรณียังไม่เคยเลือก หรือเลือกครบ 2 วันแล้ว ให้เริ่มเลือกใหม่
      onChange([clickedDate, null]);
    } else if (startDate && !endDate) {
      // กรณีเลือกวันเริ่มต้นไปแล้ว ให้ถือว่าคลิกนี้คือวันสิ้นสุด
      if (clickedDate < startDate) {
        onChange([clickedDate, startDate]); // สลับตำแหน่งถ้าคลิกวันก่อนหน้า
      } else {
        onChange([startDate, clickedDate]);
      }
      setIsOpen(false);
    }
  };

  /**
   * คำอธิบาย : ฟังก์ชันเช็คว่าวันนั้นถูกเลือกเป็นวันที่เริ่มต้นหรือวันที่สิ้นสุดหรือไม่
   * Input: date (Date object)
   * Output: boolean
   */
  const isSelected = (date: Date) => {
    if (startDate && date.getTime() === startDate.getTime()) return true;
    if (endDate && date.getTime() === endDate.getTime()) return true;
    return false;
  };

  /**
   * คำอธิบาย : ฟังก์ชันเช็คว่าวันนั้นอยู่ระหว่างช่วงที่เลือก (ระหว่าง Start Date และ End Date) หรือไม่
   * Input: date (Date object)
   * Output: boolean
   */
  const isInRange = (date: Date) => {
    if (startDate && endDate) {
      return date > startDate && date < endDate;
    }
    return false;
  };

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับปุ่มลัด "เลือกทั้งเดือน"
   * Input: -
   * Output: -
   */
  const handleSelectWholeMonth = () => {
    const start = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
    const end = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0);
    onChange([start, end]);
    setIsOpen(false);
  };

  /**
   * คำอธิบาย : ฟังก์ชันสำหรับปุ่มลัด "เลือกทั้งปี"
   * Input: -
   * Output: -
   */
  const handleSelectWholeYear = () => {
    const start = new Date(displayDate.getFullYear(), 0, 1);
    const end = new Date(displayDate.getFullYear(), 11, 31);
    onChange([start, end]);
    setIsOpen(false);
  };

  /**
   * คำอธิบาย : ฟังก์ชันเรนเดอร์ UI วันที่ในปฏิทิน (รวมถึงช่องว่างก่อนหน้าและหลัง)
   * Input: -
   * Output: JSX Element Array (ตารางวันที่)
   */
  const renderCalendarDays = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayIndex = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month - 1);

    const days = [];

    // เติมช่องว่างของเดือนก่อนหน้า (สีเทาอ่อน)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push(<div key={`prev-${i}`} className="h-10 w-10 flex items-center justify-center text-gray-300 text-sm font-medium">{prevMonthDays - i}</div>);
    }

    // เติมวันในเดือนปัจจุบัน
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const selected = isSelected(currentDate);
      const inRange = isInRange(currentDate);

      let className = "h-10 w-10 flex items-center justify-center text-sm font-medium rounded-lg cursor-pointer transition-colors ";
      if (selected) className += "bg-[#712874] text-white shadow-md";
      else if (inRange) className += "bg-purple-100 text-[#712874]";
      else className += "bg-gray-100 text-gray-700 hover:bg-gray-200";

      days.push(<div key={`current-${i}`} onClick={() => handleDayClick(i)} className={className}>{i}</div>);
    }

    // เติมช่องว่างของเดือนถัดไปให้เต็มตาราง (42 ช่อง)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push(<div key={`next-${i}`} className="h-10 w-10 flex items-center justify-center text-gray-300 text-sm font-medium">{i}</div>);
    }

    return days;
  };

  // ================= คำนวณข้อความบนปุ่ม (Button Text) =================
  let buttonText = "เลือกวันที่ (วันเดียว หรือ หลายวัน)";
  if (startDate && endDate) {
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    
    // เช็คว่าเลือกทั้งปีหรือไม่
    const isWholeYear = startDate.getDate() === 1 && startDate.getMonth() === 0 && endDate.getDate() === 31 && endDate.getMonth() === 11 && startYear === endYear;
    // เช็คว่าเลือกทั้งเดือนหรือไม่
    const isWholeMonth = startDate.getDate() === 1 && endDate.getDate() === new Date(endYear, endMonth + 1, 0).getDate() && startMonth === endMonth && startYear === endYear;

    if (isWholeYear) buttonText = `ปี ${startYear + 543}`;
    else if (isWholeMonth) buttonText = `${MONTH_NAMES_FULL[startMonth]} ${startYear + 543}`;
    else buttonText = `${startDate.getDate()} ${MONTH_NAMES_SHORT[startMonth]} - ${endDate.getDate()} ${MONTH_NAMES_SHORT[endMonth]} ${endYear + 543}`;
  } else if (startDate) {
    buttonText = `${startDate.getDate()} ${MONTH_NAMES_SHORT[startDate.getMonth()]} ${startDate.getFullYear() + 543}`;
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#712874] bg-white text-gray-700 hover:bg-gray-50 transition-colors h-[42px]">
        <div className="flex items-center space-x-2 truncate">
          <svg className="w-4 h-4 text-[#712874] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <span className={`truncate ${startDate ? "font-medium text-[#712874]" : "text-gray-500"}`}>{buttonText}</span>
        </div>
        {startDate && <svg onClick={(e) => { e.stopPropagation(); onChange([null, null]); }} className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>}
      </button>

      {isOpen && (
        <div className="absolute top-12 left-0 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl p-5 w-[340px] animate-fade-in-up">
          {view === 'dates' ? (
            <>
              {/* แถบควบคุมเดือน (หน้าปฏิทิน) */}
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1))} className="p-1 hover:bg-gray-100 rounded-full text-[#712874]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg></button>
                <div className="text-[#712874] font-bold text-[16px] cursor-pointer flex items-center space-x-1 hover:bg-purple-50 px-3 py-1 rounded-lg transition-colors" onClick={() => setView('months')}>
                  <span>{MONTH_NAMES_FULL[displayDate.getMonth()]} {displayDate.getFullYear() + 543}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                <button onClick={() => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1))} className="p-1 hover:bg-gray-100 rounded-full text-[#712874]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg></button>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {DAYS_SHORT.map((day, i) => <div key={i} className="text-center text-[#712874] font-bold text-xs">{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>
              
              {/* ปุ่มลัดด้านล่าง */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <button onClick={handleSelectWholeMonth} className="flex-1 py-2 bg-purple-50 text-[#712874] rounded-lg text-[13px] font-semibold hover:bg-purple-100 transition-colors">เลือกทั้งเดือน</button>
                <button onClick={handleSelectWholeYear} className="flex-1 py-2 bg-purple-50 text-[#712874] rounded-lg text-[13px] font-semibold hover:bg-purple-100 transition-colors">เลือกทั้งปี</button>
              </div>
            </>
          ) : (
            <>
              {/* หน้าต่างเลือกเดือน */}
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => setDisplayDate(new Date(displayDate.getFullYear() - 1, displayDate.getMonth(), 1))} className="p-1 hover:bg-gray-100 rounded-full text-[#712874]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg></button>
                <div className="text-[#712874] font-bold text-[16px]">{displayDate.getFullYear() + 543}</div>
                <button onClick={() => setDisplayDate(new Date(displayDate.getFullYear() + 1, displayDate.getMonth(), 1))} className="p-1 hover:bg-gray-100 rounded-full text-[#712874]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg></button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {MONTH_NAMES_SHORT.map((month, index) => (
                  <button
                    key={month}
                    onClick={() => { setDisplayDate(new Date(displayDate.getFullYear(), index, 1)); setView('dates'); }}
                    className={`py-3 rounded-xl text-sm font-medium transition-colors border ${displayDate.getMonth() === index ? 'bg-[#712874] text-white border-[#712874] shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-[#712874] hover:text-[#712874]'}`}
                  >{month}</button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}