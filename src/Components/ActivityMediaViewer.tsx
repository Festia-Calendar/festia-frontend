/**
 * คำอธิบาย : Component สำหรับแสดงรูปภาพและวิดีโอของกิจกรรมแบบมีตัวอย่าง (Viewer & Thumbnails)
 * ใช้สำหรับแสดงรูปภาพหลักและมีแถบรูปขนาดเล็ก (Thumbnails) ให้กดเลือกดูรูปภาพหรือวิดีโออื่นๆ ของกิจกรรมได้
 */

import React, { useState } from 'react';

// ประกาศ Type สำหรับ Props ที่รับเข้ามา
interface ActivityMediaViewerProps {
  mediaFiles: any[];
  getImageUrl: (path: string) => string;
  isVideoFile: (path: string) => boolean;
}

/**
 * คำอธิบาย : ฟังก์ชัน Component สำหรับแสดงสื่อ (Media Viewer)
 * Input: props (ActivityMediaViewerProps) - รับ array ของไฟล์สื่อ, ฟังก์ชันแปลง URL รูปภาพ, และฟังก์ชันเช็คประเภทวิดีโอ
 * Output: UI แสดงรูปภาพขนาดใหญ่และ Thumbnails ด้านล่าง พร้อมระบบคลิกดูรูปขนาดเต็ม (Modal)
 */
export default function ActivityMediaViewer({ mediaFiles, getImageUrl, isVideoFile }: ActivityMediaViewerProps) {
  const [activeImage, setActiveImage] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  /**
   * คำอธิบาย : Hook สำหรับตั้งค่ารูปภาพเริ่มต้นเมื่อได้รับข้อมูลสื่อ (Media) ครั้งแรก
   * โดยจะเลือกรูปที่มีประเภทเป็น 'COVER' ก่อน หากไม่มีจะเลือกรูปแรกในลิสต์
   * Input: -
   * Output: -
   */
  React.useEffect(() => {
    if (mediaFiles && mediaFiles.length > 0 && !activeImage) {
      const cover = mediaFiles.find((f: any) => f.type === 'COVER')?.filePath;
      if (cover) setActiveImage(cover);
      else setActiveImage(mediaFiles[0].filePath);
    }
  }, [mediaFiles, activeImage]);

  if (!mediaFiles || mediaFiles.length === 0) {
    return (
      <div className="flex flex-col space-y-3">
        <div className="w-full aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden relative shadow-md flex items-center justify-center">
          <div className="text-gray-400 text-sm">ไม่มีรูปภาพ/วิดีโอ</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col space-y-3">
        {/* รูปใหญ่ด้านบน */}
        <div className="w-full aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden relative shadow-md flex items-center justify-center">
          {activeImage && (
            isVideoFile(activeImage) ? (
              <video 
                src={getImageUrl(activeImage)} 
                className="w-full h-full object-contain bg-black" 
                controls preload="metadata"
              />
            ) : (
              <img 
                onClick={() => setPreviewImage(getImageUrl(activeImage))}
                src={getImageUrl(activeImage)} 
                alt="Active Media" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" 
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x800/EEE/31343C?text=Image+Error'; }}
              />
            )
          )}
        </div>

        {/* Thumbnails 5 ช่องด้านล่าง */}
        <div className="grid grid-cols-5 gap-2">
          {mediaFiles.slice(0, 5).map((media: any, idx: number) => {
            const isSelected = activeImage === media.filePath;
            return (
              <div 
                key={idx} 
                onClick={() => setActiveImage(media.filePath)}
                className={`relative aspect-[4/3] bg-black rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${isSelected ? 'border-[#712874] ring-2 ring-[#712874]/30' : 'border-gray-200 hover:opacity-80'}`}
              >
                 {isVideoFile(media.filePath) ? (
                   <>
                      <video src={getImageUrl(media.filePath)} className="w-full h-full object-cover opacity-70" preload="metadata" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <svg className="w-6 h-6 text-white/90 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
                      </div>
                   </>
                 ) : (
                   <img 
                      src={getImageUrl(media.filePath)} alt={`Thumbnail ${idx}`} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/EEE/31343C?text=Error'; }}
                   />
                 )}
              </div>
            );
          })}
          {/* ช่องเทาๆ สำหรับส่วนที่ขาดให้ครบ 5 */}
          {Array.from({ length: Math.max(0, 5 - mediaFiles.length) }).map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-[4/3] bg-[#F5F5F5] rounded-lg border border-gray-200"></div>
          ))}
        </div>
      </div>

      {/* Modal ดูรูปใหญ่ */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black flex items-center justify-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
            >✕</button>
            {isVideoFile(previewImage) ? (
               <video src={previewImage} className="max-w-full max-h-[85vh] object-contain rounded-lg" controls autoPlay />
            ) : (
               <img src={previewImage} alt="Preview Large" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            )}
          </div>
        </div>
      )}
    </>
  );
}