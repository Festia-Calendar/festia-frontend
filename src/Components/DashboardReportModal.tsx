/**
 * คำอธิบาย : Component สำหรับหน้าต่างพิมพ์รายงาน (Dashboard Report Modal)
 * ใช้สำหรับแสดงตารางสรุปจำนวนกิจกรรมและยอดวิวแยกตามจังหวัด รวมถึงมีฟังก์ชันส่งออกข้อมูลเป็น PDF และ Excel
 */

import React from 'react';

// ประกาศ Type สำหรับ Props ที่รับเข้ามา
interface DashboardReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalSelectedZone: string;
  setModalSelectedZone: (zone: string) => void;
  modalSelectedProvince: string;
  setModalSelectedProvince: (prov: string) => void;
  regionOptions: string[];
  modalAvailableProvinces: any[];
  isExportingExcel: boolean;
  isExporting: boolean;
  handleDownloadExcel: () => void;
  handleDownloadReportPDF: () => void;
  currentProvinceData: any[];
  reportPage: number;
  reportRowsPerPage: number;
  setReportRowsPerPage: (rows: number) => void;
  setReportPage: (page: number | ((prev: number) => number)) => void;
  totalProvinceCount: number;
  totalReportPages: number;
}

/**
 * คำอธิบาย : ฟังก์ชัน Component สำหรับแสดง Modal พิมพ์รายงานข้อมูลจังหวัด
 * Input: props (DashboardReportModalProps) - ข้อมูลตาราง, สถานะการดาวน์โหลด, สถานะการกรองข้อมูล และฟังก์ชันสั่งงานต่างๆ
 * Output: UI หน้าต่าง Modal ที่มีตัวกรองจังหวัด, ตารางสรุปข้อมูล และปุ่มดาวน์โหลดรายงาน
 */
export default function DashboardReportModal({
  isOpen, onClose, modalSelectedZone, setModalSelectedZone,
  modalSelectedProvince, setModalSelectedProvince, regionOptions,
  modalAvailableProvinces, isExportingExcel, isExporting,
  handleDownloadExcel, handleDownloadReportPDF, currentProvinceData,
  reportPage, reportRowsPerPage, setReportRowsPerPage, setReportPage,
  totalProvinceCount, totalReportPages
}: DashboardReportModalProps) {
  
  // หากไม่ได้เปิด Modal ไว้ ให้คืนค่าเป็น null เพื่อไม่ให้เรนเดอร์อะไร
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAFAFA] rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">
        
        {/* Header ของ Modal */}
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-white">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            <h2 className="text-xl font-bold text-gray-900">พิมพ์รายงานข้อมูลจังหวัด</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* แถบเครื่องมือกรองข้อมูลและดาวน์โหลด */}
        <div className="p-6 bg-white border-b border-gray-100 flex flex-wrap gap-4 items-end justify-between">
          <div className="flex flex-wrap gap-4 flex-1">
            <div className="w-48">
              <label className="block text-[12px] font-medium text-gray-500 mb-1">ภูมิภาค</label>
              <select 
                value={modalSelectedZone}
                onChange={(e) => { setModalSelectedZone(e.target.value); setModalSelectedProvince(''); }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#712874] bg-white cursor-pointer"
              >
                <option value="">ทุกภูมิภาค</option>
                {regionOptions.map(region => <option key={region} value={region}>{region}</option>)}
              </select>
            </div>
            <div className="w-48">
              <label className="block text-[12px] font-medium text-gray-500 mb-1">จังหวัด</label>
              <select 
                value={modalSelectedProvince}
                onChange={(e) => setModalSelectedProvince(e.target.value)}
                disabled={!modalSelectedZone}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#712874] bg-white disabled:opacity-50 cursor-pointer"
              >
                <option value="">ทุกจังหวัด</option>
                {modalAvailableProvinces.map(prov => <option key={prov.id} value={prov.name_th}>{prov.name_th}</option>)}
              </select>
            </div>
          </div>
          
          <div className="shrink-0 mt-4 md:mt-0 flex space-x-3">
            <button 
              onClick={handleDownloadExcel}
              disabled={isExportingExcel}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-70"
            >
              {isExportingExcel ? <span>กำลังสร้าง...</span> : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  <span>ดาวน์โหลด Excel</span>
                </>
              )}
            </button>
            <button 
              onClick={handleDownloadReportPDF}
              disabled={isExporting}
              className="px-5 py-2.5 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center space-x-2 disabled:opacity-70"
            >
              {isExporting ? <span>กำลังสร้าง PDF...</span> : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  <span>ดาวน์โหลด PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ตารางแสดงข้อมูล */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA]">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#712874] text-white text-[14px]">
                    <th className="py-4 px-6 font-semibold text-center w-24">อันดับ</th>
                    <th className="py-4 px-6 font-semibold">ชื่อจังหวัด</th>
                    <th className="py-4 px-6 font-semibold text-center w-48">จำนวนกิจกรรมทั้งหมด</th>
                    <th className="py-4 px-6 font-semibold text-center w-48">จำนวนการดู (ครั้ง)</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-[14px]">
                  {currentProvinceData.length > 0 ? (
                    currentProvinceData.map((item: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-6 text-center text-gray-500">{(reportPage - 1) * reportRowsPerPage + index + 1}</td>
                        <td className="py-3 px-6 font-medium">{item.province}</td>
                        <td className="py-3 px-6 text-center">{item.count.toLocaleString()}</td>
                        <td className="py-3 px-6 text-center">{item.viewCount.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="py-10 text-center text-gray-500">ไม่มีข้อมูลจังหวัดในตัวกรองนี้</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* แถบควบคุมการแบ่งหน้าตาราง (Pagination) */}
            <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between text-[13px] text-gray-600 bg-gray-50">
              <div className="flex items-center space-x-2">
                <span className="font-medium">จำนวนแถวต่อหน้า :</span>
                <select 
                  value={reportRowsPerPage}
                  onChange={(e) => { 
                    setReportRowsPerPage(Number(e.target.value)); 
                    setReportPage(1); 
                  }}
                  className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#712874] bg-white cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                <span className="font-medium">
                  {totalProvinceCount === 0 ? 0 : (reportPage - 1) * reportRowsPerPage + 1}-
                  {Math.min(reportPage * reportRowsPerPage, totalProvinceCount)} จากทั้งหมด {totalProvinceCount}
                </span>
                <div className="flex space-x-1">
                  <button onClick={() => setReportPage(prev => Math.max(prev - 1, 1))} disabled={reportPage === 1} className="p-1.5 transition-colors rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                  </button>
                  <button onClick={() => setReportPage(prev => Math.min(prev + 1, totalReportPages))} disabled={reportPage >= totalReportPages || totalReportPages === 0} className="p-1.5 transition-colors rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}