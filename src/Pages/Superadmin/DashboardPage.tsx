/**
 * คำอธิบาย : Component สำหรับหน้าแดชบอร์ด (Dashboard) ของระบบสำหรับสิทธิ์ Super Admin
 * แสดงผลสถิติภาพรวม เช่น กราฟวงกลม (สัดส่วนกิจกรรมแต่ละประเภท), กราฟแท่ง (จำนวนกิจกรรมรายเดือน), 
 * ตาราง 10 อันดับกิจกรรมยอดนิยม และมีฟังก์ชันสำหรับ Export รายงานสถิติเป็น PDF หรือ Excel
 */

import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList, Legend
} from 'recharts';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Import Service และ Components
import { dashboardService } from '../../Services/dashboard.service';
import CustomDateRangePicker from '../../Components/CustomDateRangePicker';
import DashboardReportModal from '../../Components/DashboardReportModal';

// ================= Constants =================
const ACTIVITY_TYPE_MAP: Record<string, string> = {
  CULTURAL_FESTIVAL: 'เทศกาลประเพณีและวัฒนธรรม',
  EXHIBITION_ART: 'นิทรรศการและศิลปะ',
  FOOD_DRINK_FESTIVAL: 'เทศกาลอาหารและเครื่องดื่ม',
  PERFORMANCE_MUSIC: 'การแสดง ดนตรี และความบันเทิง',
  MARKET_FAIR: 'ตลาดนัด ช้อปปิ้ง และงานแฟร์',
  TRAINING_SEMINAR: 'การอบรมและเสวนา',
  SPORT_RECREATION: 'กีฬา นันทนาการ',
  COMMUNITY_TOURISM: 'ท่องเที่ยวชุมชน'
};

const MONTH_NAMES_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const REGION_MAP: Record<number, string> = {
  1: "ภาคเหนือ", 2: "ภาคกลาง", 3: "ภาคตะวันออกเฉียงเหนือ",
  4: "ภาคตะวันตก", 5: "ภาคตะวันออก", 6: "ภาคใต้"
};

const PIE_COLORS = [
  '#8B5CF6', '#F59E0B', '#10B981', '#3B82F6', 
  '#EC4899', '#06B6D4', '#F97316', '#EAB308'
];

// ================= Main Dashboard Component =================

/**
 * คำอธิบาย : ฟังก์ชัน Component หลักสำหรับหน้า Dashboard ของ Super Admin
 * Input: -
 * Output: UI ของหน้า Dashboard ที่รวมตัวกรองข้อมูล กราฟสถิติ ตารางยอดนิยม และปุ่มส่งออกรายงาน
 */
export default function DashboardSuperAdmin() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // States สำหรับ Modal Export
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);
  const [reportPage, setReportPage] = useState<number>(1);
  const [reportRowsPerPage, setReportRowsPerPage] = useState<number>(10);

  // Filters หน้าหลัก
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  
  // Filters สำหรับ Modal 
  const [modalSelectedZone, setModalSelectedZone] = useState<string>('');
  const [modalSelectedProvince, setModalSelectedProvince] = useState<string>('');

  const [isTop10Open, setIsTop10Open] = useState<boolean>(true);
  const [thaiData, setThaiData] = useState<any[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [availableProvinces, setAvailableProvinces] = useState<any[]>([]);
  const [modalAvailableProvinces, setModalAvailableProvinces] = useState<any[]>([]);

  /**
   * คำอธิบาย : Hook สำหรับโหลดข้อมูลจังหวัด อำเภอ ตำบล จาก API ภายนอก (ทำงานครั้งเดียวตอนโหลดหน้า)
   * Input: -
   * Output: -
   */
  useEffect(() => {
    const fetchThaiData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/province_with_district_and_sub_district.json');
        if (!response.ok) throw new Error("Network response was not ok");
        const resData = await response.json();
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
   * คำอธิบาย : Hook จัดการการกรองจังหวัดในหน้าหลัก เมื่อเลือกภูมิภาค (Zone)
   * Input: -
   * Output: -
   */
  useEffect(() => {
    if (selectedZone) {
      const provinces = thaiData.filter(p => REGION_MAP[p.geography_id] === selectedZone);
      setAvailableProvinces(provinces);
    } else {
      setAvailableProvinces([]);
      setSelectedProvince('');
    }
  }, [selectedZone, thaiData]);

  /**
   * คำอธิบาย : Hook จัดการการกรองจังหวัดใน Modal Export เมื่อเลือกภูมิภาค (Zone)
   * Input: -
   * Output: -
   */
  useEffect(() => {
    if (modalSelectedZone) {
      const provinces = thaiData.filter(p => REGION_MAP[p.geography_id] === modalSelectedZone);
      setModalAvailableProvinces(provinces);
    } else {
      setModalAvailableProvinces([]);
      setModalSelectedProvince('');
    }
  }, [modalSelectedZone, thaiData]);

  /**
   * คำอธิบาย : ฟังก์ชันแปลงรูปแบบวันที่สำหรับส่งไปยัง Backend API (YYYY-MM-DD)
   * Input: date (Date | null) - ค่าวันที่ต้องการแปลง
   * Output: string (ตัวอย่าง: "2024-03-15") หรือ undefined หากไม่มีค่า
   */
  const formatDateForAPI = (date: Date | null) => {
    if (!date) return undefined;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  /**
   * คำอธิบาย : Hook ดึงข้อมูลแดชบอร์ดจาก Backend เมื่อตัวกรอง (ภูมิภาค, จังหวัด, วันที่) มีการเปลี่ยนแปลง
   * Input: -
   * Output: -
   */
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const data = await dashboardService.getDashboardData({
          startDate: formatDateForAPI(dateRange[0]),
          endDate: formatDateForAPI(dateRange[1]),
          zone: selectedZone || undefined,
          province: selectedProvince || undefined,
        });
        setDashboardData(data);
      } catch (err: any) {
        console.error(err.response?.data?.message || 'ดึงข้อมูลแดชบอร์ดไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [dateRange, selectedZone, selectedProvince]);

  const pieData = dashboardData?.activityByType?.map((item: any) => ({
    name: ACTIVITY_TYPE_MAP[item.type] || item.type,
    value: item.count
  })) || [];

  const barData = dashboardData?.activityByMonth?.map((item: any) => ({
    name: MONTH_NAMES_FULL[item.month - 1],
    count: item.count
  })) || [];

  const top10Data = dashboardData?.popularActivities || [];
  const rawProvinceReportData = dashboardData?.activityByProvince || [];
  
  const filteredProvinceData = rawProvinceReportData.filter((item: any) => {
    if (modalSelectedProvince && item.province !== modalSelectedProvince) return false;
    if (modalSelectedZone) {
      const provInfo = thaiData.find(p => p.name_th === item.province);
      if (provInfo && REGION_MAP[provInfo.geography_id] !== modalSelectedZone) return false;
    }
    return true;
  });
  
  const totalProvinceCount = filteredProvinceData.length;
  const totalReportPages = Math.ceil(totalProvinceCount / reportRowsPerPage);
  const currentProvinceData = filteredProvinceData.slice((reportPage - 1) * reportRowsPerPage, reportPage * reportRowsPerPage);

  const rowsPerPagePDF = 25;
  const totalPagesPDF = Math.ceil(filteredProvinceData.length / rowsPerPagePDF) || 1;

  useEffect(() => {
    setReportPage(1); 
  }, [filteredProvinceData.length, reportRowsPerPage]);

  /**
   * คำอธิบาย : ฟังก์ชันเปิด Modal สำหรับพิมพ์รายงาน และคัดลอกค่าฟิลเตอร์ปัจจุบันจากหน้าหลักมาใช้งาน
   * Input: -
   * Output: -
   */
  const handleOpenExportModal = () => {
    setModalSelectedZone(selectedZone);
    setModalSelectedProvince(selectedProvince);
    setIsExportModalOpen(true);
  };

  /**
   * คำอธิบาย : ฟังก์ชันดาวน์โหลดรายงานเป็นไฟล์ PDF โดยเรนเดอร์ HTML เป็นรูปภาพ (html-to-image) แล้วนำไปแทรกใน PDF (jsPDF)
   * Input: -
   * Output: - (สั่งดาวน์โหลดไฟล์ PDF ไปที่เครื่องผู้ใช้งาน)
   */
  const handleDownloadReportPDF = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const pdf = new jsPDF('p', 'mm', 'a4');

      for (let i = 0; i < totalPagesPDF; i++) {
        const pageElement = document.getElementById(`pdf-page-${i}`);
        if (!pageElement) continue;

        const dataUrl = await toPng(pageElement, { 
          quality: 1, 
          backgroundColor: '#ffffff',
          pixelRatio: 2,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left'
          }
        });

        if (i > 0) pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297);
      }

      pdf.save(`รายงานข้อมูลจังหวัด_${new Date().getTime()}.pdf`);
      setIsExportModalOpen(false);
    } catch (err) {
      console.error("Export PDF Error: ", err);
      alert("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF");
    }
    setIsExporting(false);
  };

  /**
   * คำอธิบาย : ฟังก์ชันสร้างและดาวน์โหลดรายงานข้อมูลจังหวัดเป็นไฟล์ Excel (.xlsx) ด้วยไลบรารี ExcelJS
   * Input: -
   * Output: - (สั่งดาวน์โหลดไฟล์ Excel ไปที่เครื่องผู้ใช้งาน)
   */
  const handleDownloadExcel = async () => {
    setIsExportingExcel(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('รายงานข้อมูลจังหวัด');

      worksheet.columns = [
        { key: 'rank', width: 12 },
        { key: 'province', width: 35 },
        { key: 'count', width: 25 },
        { key: 'views', width: 25 }
      ];

      worksheet.mergeCells('A1:D1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'รายงานข้อมูลจังหวัด';
      titleCell.font = { size: 18, bold: true, color: { argb: 'FF712874' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(1).height = 35;

      const dateText = dateRange[0] && dateRange[1] 
        ? `ข้อมูลรวมช่วงเวลา: ${dateRange[0].getDate()}/${dateRange[0].getMonth()+1}/${dateRange[0].getFullYear()+543} - ${dateRange[1].getDate()}/${dateRange[1].getMonth()+1}/${dateRange[1].getFullYear()+543}`
        : 'ข้อมูลรวมทุกช่วงเวลา';
      worksheet.mergeCells('A2:D2');
      const dateCell = worksheet.getCell('A2');
      dateCell.value = dateText;
      dateCell.font = { size: 12, color: { argb: 'FF555555' } };
      dateCell.alignment = { horizontal: 'center', vertical: 'middle' };

      const filterText = `ภูมิภาค: ${modalSelectedZone || 'ทุกภูมิภาค'} | จังหวัด: ${modalSelectedProvince || 'ทุกจังหวัด'}`;
      worksheet.mergeCells('A3:D3');
      const filterCell = worksheet.getCell('A3');
      filterCell.value = filterText;
      filterCell.font = { size: 12, color: { argb: 'FF555555' } };
      filterCell.alignment = { horizontal: 'center', vertical: 'middle' };
      
      worksheet.getRow(4).height = 10;

      const headerRow = worksheet.getRow(5);
      headerRow.values = ['อันดับ', 'ชื่อจังหวัด', 'จำนวนกิจกรรมทั้งหมด', 'จำนวนการดู (ครั้ง)'];
      headerRow.height = 25;
      
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF712874' } };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
          left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
          bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
          right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
        };
      });

      filteredProvinceData.forEach((item: any, index: number) => {
        const row = worksheet.addRow({
          rank: index + 1,
          province: item.province,
          count: item.count,
          views: item.viewCount
        });
        
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
            left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
            bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
            right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
          };
          if (colNumber !== 2) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else {
            cell.alignment = { vertical: 'middle' };
          }
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `รายงานข้อมูลจังหวัด_${new Date().getTime()}.xlsx`);

    } catch (error) {
      console.error("Export Excel Error: ", error);
      alert("เกิดข้อผิดพลาดในการสร้างไฟล์ Excel");
    }
    setIsExportingExcel(false);
  };

  const RADIAN = Math.PI / 180;

  /**
   * คำอธิบาย : ฟังก์ชันปรับแต่ง Label ของกราฟวงกลม (Pie Chart) ให้แสดงเปอร์เซ็นต์และจำนวน
   * Input: Property การเรนเดอร์กราฟจาก Recharts (cx, cy, midAngle, innerRadius, outerRadius, percent, value)
   * Output: SVG Text Element
   */
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
    if (percent === 0) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ outline: 'none' }}>
        <tspan x={x} dy="-0.4em" fontSize="18px" fontWeight="bold">{`${(percent * 100).toFixed(0)}%`}</tspan>
        <tspan x={x} dy="1.4em" fontSize="13px" fontWeight="normal" fill="#FFF8F8">{`(${value} รายการ)`}</tspan>
      </text>
    );
  };

  if (loading && !dashboardData) {
    return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูลแดชบอร์ด...</div>;
  }

  return (
    <div className="w-full space-y-6 pb-10 relative">
      
      <h1 className="text-[24px] font-bold text-[#712874]">รายงาน</h1>

      {/* ================= Top Filters & Print Button ================= */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
        
        <div className="w-full md:w-1/4">
          <label className="block text-[13px] text-gray-500 mb-1.5">ค้นหาด้วยภูมิภาค</label>
          <select 
            value={selectedZone}
            onChange={(e) => { setSelectedZone(e.target.value); setSelectedProvince(''); }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#712874] bg-white text-gray-700 cursor-pointer h-[42px]"
          >
            <option value="">ทุกภูมิภาค</option>
            {regionOptions.map(region => <option key={region} value={region}>{region}</option>)}
          </select>
        </div>
        
        <div className="w-full md:w-1/4">
          <label className="block text-[13px] text-gray-500 mb-1.5">ค้นหาด้วยจังหวัด</label>
          <select 
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            disabled={!selectedZone}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#712874] bg-white text-gray-700 disabled:opacity-50 cursor-pointer h-[42px]"
          >
            <option value="">ทุกจังหวัด</option>
            {availableProvinces.map(prov => <option key={prov.id} value={prov.name_th}>{prov.name_th}</option>)}
          </select>
        </div>

        <div className="w-full md:w-[35%]">
          <label className="block text-[13px] text-gray-500 mb-1.5">ปฏิทินกิจกรรม</label>
          <CustomDateRangePicker startDate={dateRange[0]} endDate={dateRange[1]} onChange={setDateRange} />
        </div>

        <div className="w-full md:w-auto shrink-0">
          <button 
            onClick={handleOpenExportModal}
            className="w-full h-[42px] flex items-center justify-center space-x-2 border-2 border-[#712874] text-[#712874] px-5 rounded-lg text-[14px] font-semibold hover:bg-purple-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            <span>พิมพ์รายงาน</span>
          </button>
        </div>

      </div>

      {/* ================= Pie Chart Card ================= */}
      <div className="bg-[#FAF8F8] p-6 rounded-2xl shadow-sm border border-gray-100 [&_*:focus]:outline-none [&_*:focus-visible]:outline-none">
        <h2 className="text-[18px] font-bold text-[#712874] mb-4">จำนวนกิจกรรมที่มีในแต่ละประเภท</h2>
        <div className="flex justify-center items-center h-[460px] w-full">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" style={{ outline: 'none' }}>
              <PieChart style={{ outline: 'none' }}>
                <Pie
                  data={pieData} cx="40%" cy="50%" labelLine={false} label={renderCustomizedLabel} outerRadius="95%" dataKey="value" stroke="white" strokeWidth={3} style={{ outline: 'none' }}
                >
                  {pieData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} style={{ outline: 'none' }} />
                  ))}
                </Pie>
                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" iconSize={20}
                  wrapperStyle={{ fontSize: '18px', lineHeight: '40px', fontWeight: '500', color: '#4B5563', outline: 'none', right: '5%' }} 
                />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', outline: 'none' }} itemStyle={{ outline: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : ( <div className="text-gray-400">ไม่พบข้อมูลในเงื่อนไขที่เลือก</div> )}
        </div>
      </div>

      {/* ================= Bar Chart Card ================= */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative [&_*:focus]:outline-none [&_*:focus-visible]:outline-none">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[18px] font-bold text-[#712874]">จำนวนกิจกรรมที่มีในแต่ละเดือน</h2>
        </div>
        <div className="text-[13px] text-gray-500 mb-2">จำนวน</div>
        <div className="h-[320px] w-full relative pb-4">
          <ResponsiveContainer width="100%" height="100%" style={{ outline: 'none' }}>
            <BarChart data={barData} margin={{ top: 20, right: 40, left: -20, bottom: 5 }} style={{ outline: 'none' }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
              <YAxis axisLine={{ stroke: '#D1D5DB' }} tickLine={{ stroke: '#D1D5DB' }} tick={{ fill: '#6B7280', fontSize: 12 }} allowDecimals={false} />
              <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', outline: 'none' }} />
              <Bar dataKey="count" fill="#9F79A1" radius={[4, 4, 0, 0]} maxBarSize={50} style={{ outline: 'none' }}>
                <LabelList dataKey="count" position="top" fill="#6B7280" fontSize={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="absolute bottom-[16px] right-2 text-[12px] text-gray-500 font-medium">เดือน</div>
        </div>
      </div>

      {/* ================= Top 10 Table Card ================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div 
          className="px-6 py-5 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsTop10Open(!isTop10Open)}
        >
          <h2 className="text-[18px] font-bold text-gray-900">10 กิจกรรมยอดนิยม</h2>
          <svg className={`w-6 h-6 text-gray-900 transform transition-transform duration-300 ${isTop10Open ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path>
          </svg>
        </div>
        
        {isTop10Open && (
          <div className="animate-fade-in-up">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="bg-[#712874] text-white text-[14px]">
                  <th className="py-4 px-6 font-semibold w-[15%] text-center">อันดับ</th>
                  <th className="py-4 px-6 font-semibold w-[60%]">ชื่อกิจกรรม</th>
                  <th className="py-4 px-6 font-semibold w-[25%] text-center">จำนวนการเข้าชม (ครั้ง)</th>
                </tr>
              </thead>
              <tbody className="text-gray-800 text-[14px] font-medium">
                {top10Data.length > 0 ? (
                  top10Data.map((item: any, index: number) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6 text-center">{index + 1}</td>
                      <td className="py-4 px-6">{item.name}</td>
                      <td className="py-4 px-6 text-center">{item.viewCount?.toLocaleString() || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="py-8 text-center text-gray-500 font-normal">ไม่มีข้อมูลกิจกรรม</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= Export Report Modal Component ================= */}
      <DashboardReportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        modalSelectedZone={modalSelectedZone}
        setModalSelectedZone={setModalSelectedZone}
        modalSelectedProvince={modalSelectedProvince}
        setModalSelectedProvince={setModalSelectedProvince}
        regionOptions={regionOptions}
        modalAvailableProvinces={modalAvailableProvinces}
        isExportingExcel={isExportingExcel}
        isExporting={isExporting}
        handleDownloadExcel={handleDownloadExcel}
        handleDownloadReportPDF={handleDownloadReportPDF}
        currentProvinceData={currentProvinceData}
        reportPage={reportPage}
        reportRowsPerPage={reportRowsPerPage}
        setReportRowsPerPage={setReportRowsPerPage}
        setReportPage={setReportPage}
        totalProvinceCount={totalProvinceCount}
        totalReportPages={totalReportPages}
      />

      {/* ================= Hidden Pages for Multi-page PDF Export ================= */}
      <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -100, opacity: 0.001, pointerEvents: 'none' }}>
        <div id="pdf-export-container" className="flex flex-col">
          {Array.from({ length: totalPagesPDF }).map((_, pageIndex) => {
            const chunk = filteredProvinceData.slice(pageIndex * rowsPerPagePDF, (pageIndex + 1) * rowsPerPagePDF);
            return (
              <div 
                key={pageIndex} 
                id={`pdf-page-${pageIndex}`} 
                style={{ 
                  width: '794px', 
                  height: '1123px',
                  backgroundColor: '#ffffff', 
                  padding: '40px',
                  boxSizing: 'border-box',
                  position: 'relative'
                }}
              >
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-[#712874] mb-2">รายงานข้อมูลจังหวัด</h1>
                  <p className="text-gray-600">
                    {dateRange[0] && dateRange[1] 
                      ? `ข้อมูลระหว่างวันที่ ${dateRange[0].getDate()}/${dateRange[0].getMonth()+1}/${dateRange[0].getFullYear()+543} ถึง ${dateRange[1].getDate()}/${dateRange[1].getMonth()+1}/${dateRange[1].getFullYear()+543}`
                      : 'ข้อมูลรวมทุกช่วงเวลา'}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {modalSelectedZone ? `ภูมิภาค: ${modalSelectedZone}` : 'ทุกภูมิภาค'} | {modalSelectedProvince ? `จังหวัด: ${modalSelectedProvince}` : 'ทุกจังหวัด'}
                  </p>
                </div>

                <table className="w-full text-left border-collapse border border-gray-200 table-fixed">
                  <colgroup>
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '40%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-[#712874] text-white">
                      <th className="py-3 px-4 font-semibold text-center border border-[#712874]">อันดับ</th>
                      <th className="py-3 px-4 font-semibold border border-[#712874]">ชื่อจังหวัด</th>
                      <th className="py-3 px-4 font-semibold text-center border border-[#712874]">จำนวนกิจกรรมทั้งหมด</th>
                      <th className="py-3 px-4 font-semibold text-center border border-[#712874]">จำนวนการดู (ครั้ง)</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800">
                    {chunk.length > 0 ? (
                      chunk.map((item: any, i: number) => (
                        <tr key={i}>
                          <td className="py-2 px-4 text-center border border-gray-200">{pageIndex * rowsPerPagePDF + i + 1}</td>
                          <td className="py-2 px-4 border border-gray-200 truncate">{item.province}</td>
                          <td className="py-2 px-4 text-center border border-gray-200">{item.count.toLocaleString()}</td>
                          <td className="py-2 px-4 text-center border border-gray-200">{item.viewCount.toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="py-4 text-center border border-gray-200">ไม่มีข้อมูลจังหวัดในตัวกรองนี้</td></tr>
                    )}
                  </tbody>
                </table>

                <div className="absolute bottom-10 right-10 text-sm text-gray-500 font-medium">
                  หน้า {pageIndex + 1} / {totalPagesPDF}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}