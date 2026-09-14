/**
 * คำอธิบาย : Component สำหรับแสดงแถบจัดการหน้า (Pagination) ของตารางรายการกิจกรรม
 * ใช้สำหรับแสดงผลรวมจำนวนรายการ, เลือกจำนวนแถวที่ต้องการแสดงต่อหน้า, และปุ่มกดเพื่อเปลี่ยนหน้า (ย้อนกลับ/ถัดไป)
 */

import React from 'react';

// ประกาศ Type สำหรับ Props ที่รับเข้ามา
interface ActivityPaginationProps {
  totalCount: number;
  currentPage: number;
  rowsPerPage: number;
  totalPages: number;
  handlePageChange: (direction: 'prev' | 'next') => void;
  handleRowsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * คำอธิบาย : ฟังก์ชัน Component สำหรับจัดการการแบ่งหน้า (Pagination) ของตาราง
 * Input: props (ActivityPaginationProps) - รับค่าจำนวนรายการทั้งหมด, หน้าปัจจุบัน, แถวต่อหน้า, หน้าทั้งหมด และฟังก์ชันจัดการ event การเปลี่ยนหน้า
 * Output: UI แถบควบคุมการแบ่งหน้า (Pagination bar) ที่อยู่ด้านล่างของตาราง
 */
export default function ActivityPagination({
  totalCount, currentPage, rowsPerPage, totalPages, handlePageChange, handleRowsPerPageChange
}: ActivityPaginationProps) {
  return (
    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-[13px] text-gray-600 bg-[#FAFAFA]">
      <div className="flex items-center space-x-6">
        <span>ทั้งหมด {totalCount} แถว</span>
        <div className="flex items-center space-x-2">
          <span>จำนวนแถวต่อหน้า</span>
          <select 
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#712874] bg-[#FAFAFA] cursor-pointer"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span>
          {totalCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-
          {Math.min(currentPage * rowsPerPage, totalCount)} จาก {totalCount}
        </span>
        <div className="flex space-x-1">
          <button 
            onClick={() => handlePageChange('prev')}
            disabled={currentPage === 1}
            className={`p-1.5 transition-colors rounded ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-[#712874] hover:bg-purple-50'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <button 
            onClick={() => handlePageChange('next')}
            disabled={currentPage >= totalPages || totalPages === 0}
            className={`p-1.5 transition-colors rounded ${currentPage >= totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-[#712874] hover:bg-purple-50'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
}