/**
 * คำอธิบาย : Component ศูนย์รวมสำหรับจัดการหน้าต่างแจ้งเตือน (Modals) ของระบบ
 * ทำหน้าที่แสดง UI ยืนยัน, แจ้งความสำเร็จ, รับข้อความปฏิเสธ, และแสดงสถานะกำลังโหลด (Processing)
 */

import React from 'react';

// รวบรวมทุก State ของ Modal ไว้ใน Type เดียว
export type ModalStateType = 
  | 'none' 
  | 'confirmDelete' | 'successDelete' // ลบกิจกรรม
  | 'confirmApprove' | 'successApprove' // อนุมัติกิจกรรม
  | 'rejectReason' | 'confirmReject' | 'successReject' // ปฏิเสธกิจกรรม
  | 'confirmDeleteBanner' | 'successDeleteBanner' // ลบรูปแบนเนอร์ (Setting)
  | 'confirmCreate' | 'successCreate' // สร้างกิจกรรม
  | 'processing' // หน้าโหลดกำลังอัปโหลด
  | 'confirmEdit' | 'successEdit'; // แก้ไขกิจกรรม

// ประกาศ Type สำหรับ Props ที่รับเข้ามา
interface ModalProps {
  modalState: ModalStateType;
  setModalState: (state: ModalStateType) => void;
  isProcessing: boolean;
  
  // Action Handlers
  handleDelete?: () => void;
  handleApprove?: () => void;
  handleReject?: () => void;
  handleDeleteBanner?: () => void;
  
  // ⭐ เพิ่ม: ฟังก์ชันสำหรับการเปลี่ยนหน้า (Navigate) เมื่อทำสำเร็จในหน้าสร้าง/แก้ไข
  handleSuccessClose?: () => void; 
  
  // Form State
  rejectReason?: string;
  setRejectReason?: (reason: string) => void;
}

/**
 * คำอธิบาย : ฟังก์ชัน Component สำหรับแสดงหน้าต่าง Modal หลายรูปแบบ
 * Input: props (ModalProps) - รับ state เพื่อบอกว่าต้องแสดง modal แบบไหน, มีฟังก์ชันผูกปุ่มกดยืนยันต่างๆ
 * Output: JSX Element ที่เป็นฉากหลังสีดำทึบ (Backdrop) และกล่องข้อความแจ้งเตือน (Dialog box) ตรงกลางหน้าจอ
 */
export default function ActivityModals({
  modalState, setModalState, isProcessing,
  handleDelete, handleApprove, handleReject, handleDeleteBanner, handleSuccessClose,
  rejectReason, setRejectReason
}: ModalProps) {

  if (modalState === 'none') return null;

  /**
   * คำอธิบาย : ฟังก์ชันจัดการตอนกดปิด Modal แจ้งเตือนความสำเร็จ (Success Modal)
   * หากมีฟังก์ชัน handleSuccessClose (ใช้สำหรับพากลับหน้าหลัก) ให้เรียกใช้ก่อน
   * Input: -
   * Output: -
   */
  const closeSuccessModal = () => {
    if (handleSuccessClose) {
      handleSuccessClose();
    } else {
      setModalState('none');
    }
  };

  /**
   * คำอธิบาย : ฟังก์ชันกดปิด Modal กลับสู่สถานะว่างเปล่า (none)
   * Input: -
   * Output: -
   */
  const closeModal = () => setModalState('none');

  /**
   * คำอธิบาย : ฟังก์ชันสร้างโครงสร้าง UI สำหรับ Modal กดยืนยัน (Confirm Modal)
   * Input: 
   *  - title (หัวข้อ)
   *  - desc (คำอธิบาย)
   *  - onConfirm (ฟังก์ชันเมื่อกดยืนยัน)
   *  - btnColor (สีพื้นหลังปุ่ม)
   *  - btnHover (สีปุ่มเมื่อ Hover)
   *  - btnText (ข้อความบนปุ่ม)
   * Output: JSX Element สำหรับแสดง Modal
   */
  const renderConfirmModal = (title: string, desc: string, onConfirm: () => void, btnColor: string, btnHover: string, btnText: string) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[420px] p-10 flex flex-col items-center shadow-xl animate-fade-in-up">
        <div className="w-[64px] h-[64px] rounded-full border-[3px] border-black flex items-center justify-center mb-6">
          <span className="text-[36px] font-bold text-black leading-none">!</span>
        </div>
        <h3 className="text-[20px] font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-[14px] text-gray-500 mb-8 text-center">{desc}</p>
        <div className="flex space-x-4 w-full justify-center">
          <button onClick={closeModal} disabled={isProcessing} className="px-6 py-2.5 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors w-[120px]">
            ยกเลิก
          </button>
          <button onClick={onConfirm} disabled={isProcessing} className={`px-6 py-2.5 ${btnColor} text-white rounded-lg text-[14px] font-medium hover:${btnHover} transition-colors w-[120px] flex justify-center items-center`}>
            {isProcessing ? 'รอสักครู่...' : btnText}
          </button>
        </div>
      </div>
    </div>
  );

  /**
   * คำอธิบาย : ฟังก์ชันสร้างโครงสร้าง UI สำหรับ Modal แจ้งเตือนเมื่อทำงานเสร็จสมบูรณ์ (Success Modal)
   * Input: title (หัวข้อ), desc (คำอธิบาย)
   * Output: JSX Element สำหรับแสดง Modal แบบสำเร็จ (ปุ่มเดี่ยว)
   */
  const renderSuccessModal = (title: string, desc: string) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[420px] p-10 flex flex-col items-center shadow-xl animate-fade-in-up">
        <div className="w-[76px] h-[76px] rounded-full bg-[#6B2A68] flex items-center justify-center mb-6 shadow-inner">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h3 className="text-[20px] font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-[14px] text-gray-500 mb-8 text-center">{desc}</p>
        <button onClick={closeSuccessModal} className="px-8 py-2.5 bg-[#4A154B] text-white rounded-lg text-[14px] font-medium hover:bg-[#340f35] transition-colors w-[140px]">
          ปิด
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ----------------- Manage Activity Modals ----------------- */}
      {modalState === 'confirmDelete' && renderConfirmModal('ยืนยันการลบกิจกรรม', 'คุณต้องการยืนยันการลบกิจกรรมหรือไม่', handleDelete!, 'bg-[#5B1F54]', 'bg-[#461740]', 'ยืนยัน')}
      {modalState === 'successDelete' && renderSuccessModal('ลบกิจกรรมสำเร็จ', 'กิจกรรมถูกลบออกจากระบบแล้ว')}

      {/* ----------------- Request Activity Modals ----------------- */}
      {modalState === 'confirmApprove' && renderConfirmModal('ยืนยันการอนุมัติกิจกรรม', 'คุณต้องการยืนยันการอนุมัติกิจกรรมหรือไม่', handleApprove!, 'bg-[#5B1F54]', 'bg-[#461740]', 'ยืนยัน')}
      {modalState === 'successApprove' && renderSuccessModal('อนุมัติกิจกรรมสำเร็จ', 'กิจกรรมถูกอนุมัติเรียบร้อยแล้ว')}
      
      {modalState === 'confirmReject' && renderConfirmModal('ยืนยันการปฏิเสธกิจกรรม', 'คุณต้องการยืนยันการปฏิเสธกิจกรรมหรือไม่', handleReject!, 'bg-[#5B1F54]', 'bg-[#461740]', 'ยืนยัน')}
      {modalState === 'successReject' && renderSuccessModal('ปฏิเสธกิจกรรมสำเร็จ', 'กิจกรรมถูกปฏิเสธเรียบร้อยแล้ว')}

      {/* ----------------- Setting Banner Modals ----------------- */}
      {modalState === 'confirmDeleteBanner' && renderConfirmModal('ยืนยันการลบรูปภาพ', 'คุณต้องการยืนยันการลบรูปภาพนี้หรือไม่', handleDeleteBanner!, 'bg-[#5B1F54]', 'bg-[#461740]', 'ยืนยัน')}
      {modalState === 'successDeleteBanner' && renderSuccessModal('ลบรูปภาพสำเร็จ', 'รูปภาพถูกลบออกจากระบบแล้ว')}

      {/* ----------------- Create & Edit Activity Modals ----------------- */}
      {modalState === 'confirmCreate' && renderConfirmModal('ยืนยันการสร้างกิจกรรม', 'คุณต้องการยืนยันการสร้างกิจกรรมหรือไม่', handleApprove!, 'bg-[#5B1F54]', 'bg-[#461740]', 'ยืนยัน')}
      {modalState === 'successCreate' && renderSuccessModal('สร้างกิจกรรมสำเร็จ', 'ข้อมูลกิจกรรมถูกบันทึกเรียบร้อยแล้ว')}

      {/* ----------------- Edit Activity Modals ----------------- */}
      {modalState === 'confirmEdit' && renderConfirmModal('ยืนยันการแก้ไขกิจกรรม', 'คุณต้องการยืนยันการแก้ไขกิจกรรมหรือไม่', handleApprove!, 'bg-[#5B1F54]', 'bg-[#461740]', 'ยืนยัน')}
      {modalState === 'successEdit' && renderSuccessModal('แก้ไขกิจกรรมสำเร็จ', 'ข้อมูลกิจกรรมถูกอัปเดตเรียบร้อยแล้ว')}

      {/* Modal โหลด (Processing) - เอาไว้ใช้ตอนอัปโหลดรูปหรือวิดีโอนานๆ */}
      {modalState === 'processing' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[320px] p-8 flex flex-col items-center shadow-xl animate-fade-in-up">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#712874] rounded-full animate-spin mb-6"></div>
            <h3 className="text-[18px] font-bold text-gray-900 mb-2">กำลังดำเนินการ...</h3>
            <p className="text-[14px] text-gray-500 text-center">กรุณารอสักครู่ ระบบกำลังบันทึกข้อมูล</p>
          </div>
        </div>
      )}

      {/* Modal พิเศษ: กรอกเหตุผล (ไม่ซ้ำกับใคร) */}
      {modalState === 'rejectReason' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[420px] p-10 flex flex-col items-center shadow-xl animate-fade-in-up">
            <div className="w-[64px] h-[64px] rounded-full border-[3px] border-black flex items-center justify-center mb-6">
              <span className="text-[36px] font-bold text-black leading-none">!</span>
            </div>
            <h3 className="text-[20px] font-bold text-gray-900 mb-3">ปฏิเสธคำขออนุมัติ</h3>
            <p className="text-[14px] text-gray-500 mb-6 text-center">กรุณากรอกเหตุผลการปฏิเสธ</p>
            <textarea 
              value={rejectReason} onChange={(e) => setRejectReason?.(e.target.value)}
              placeholder="เหตุผลการปฏิเสธ" rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#712874] resize-none mb-8"
            ></textarea>
            <div className="flex space-x-4 w-full justify-center">
              <button onClick={closeModal} className="px-6 py-2.5 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors w-[120px]">ยกเลิก</button>
              <button onClick={() => setModalState('confirmReject')} disabled={!rejectReason?.trim()} className="px-6 py-2.5 bg-[#5B1F54] text-white rounded-lg text-[14px] font-medium hover:bg-[#461740] disabled:opacity-50 transition-colors w-[120px]">ส่ง</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}