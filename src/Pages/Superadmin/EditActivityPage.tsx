import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../Libs/axios'; 

// แก้ไขปัญหาไอคอน Marker ของ Leaflet หายใน React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const REGION_MAP: Record<number, string> = {
  1: "ภาคเหนือ", 2: "ภาคกลาง", 3: "ภาคตะวันออกเฉียงเหนือ", 
  4: "ภาคตะวันตก", 5: "ภาคตะวันออก", 6: "ภาคใต้"
};

const BASE_IMAGE_URL = 'http://localhost:3000/uploads/'; 

// ⭐ ฟังก์ชันเช็คไฟล์อัปโหลดใหม่: ถ้ามี property 'name' และไม่มี 'id' แสดงว่าเป็นไฟล์รูปใหม่แน่นอน
const isNewFile = (file: any) => file && typeof file === 'object' && 'name' in file && !file.id;

function LocationSelector({ position, setPosition, setFormData, setErrors }: any) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setFormData((prev: any) => ({ ...prev, latitude: String(e.latlng.lat), longitude: String(e.latlng.lng) }));
      if (setErrors) setErrors((prev: any) => ({ ...prev, map: '' }));
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

export default function EditActivityPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    name: '', activityType: '', price: '', statusActivity: 'PUBLISH',
    tagline: '', description: '', phone: '', facebook: '', line: '',
    locationName: '', region: '', province: '', district: '', subDistrict: '', addressDetail: '',
    latitude: '', longitude: '', startDate: '', startTime: '', endDate: '', endTime: ''
  });

  const [mapPosition, setMapPosition] = useState<{ lat: number, lng: number } | null>(null);
  const [thaiData, setThaiData] = useState<any[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // ⭐ State สำหรับเก็บ Error ของแต่ละช่อง
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ================= State สำหรับเก็บรูปเก่า/ใหม่ และ ID ที่ถูกลบ =================
  type ExistingFile = { id: number, filePath: string };
  const [coverFile, setCoverFile] = useState<File | ExistingFile | null>(null);
  const [mediaFiles, setMediaFiles] = useState<(File | ExistingFile)[]>([]);
  const [mediaDeleteIds, setMediaDeleteIds] = useState<number[]>([]);
  const [scheduleDeleteIds, setScheduleDeleteIds] = useState<number[]>([]);
  
  type Timeslot = { id?: number, startTime: string, endTime: string, description: string, files: (File | ExistingFile)[], deleteFileIds: number[] };
  type ScheduleDay = { date: string, timeslots: Timeslot[] };
  const [schedules, setSchedules] = useState<ScheduleDay[]>([]);

  // ================= Modal States =================
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    const fetchThaiData = async () => {
      setIsLoadingLocation(true);
      try {
        const response = await fetch('https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/province_with_district_and_sub_district.json');
        const data = await response.json();
        setThaiData(data);
      } catch (error) {
        console.error("Error fetching Thai data:", error);
      } finally {
        setIsLoadingLocation(false);
      }
    };
    fetchThaiData();
  }, []);

  useEffect(() => {
    const fetchActivityDetail = async () => {
      if (!id) return;
      try {
        const response = await api.get(`/superadmin/activity/${id}`);
        const act = response.data.data || response.data;
        
        const splitDateTime = (isoString: string) => {
          if (!isoString) return { date: '', time: '' };
          const d = new Date(isoString);
          const date = [d.getFullYear(), ('0'+(d.getMonth()+1)).slice(-2), ('0'+d.getDate()).slice(-2)].join('-');
          const time = [('0'+d.getHours()).slice(-2), ('0'+d.getMinutes()).slice(-2)].join(':');
          return { date, time };
        };

        const start = splitDateTime(act.startDate);
        const end = splitDateTime(act.dueDate);

        setFormData({
          name: act.name || '', activityType: act.activityType || '', price: act.price || '',
          statusActivity: act.statusActivity || 'PUBLISH', tagline: act.tagline || '', description: act.description || '',
          phone: act.phone || '', facebook: act.facebookUrl || '', line: act.lineUrl || '',
          locationName: act.location?.name || '', region: act.location?.zone || '', province: act.location?.province || '',
          district: act.location?.district || '', subDistrict: act.location?.subDistrict || '', addressDetail: act.location?.detail || '',
          latitude: act.location?.latitude || '', longitude: act.location?.longitude || '',
          startDate: start.date, startTime: start.time, endDate: end.date, endTime: end.time
        });

        if (act.location?.latitude && act.location?.longitude) {
          setMapPosition({ lat: Number(act.location.latitude), lng: Number(act.location.longitude) });
        }

        const cover = act.activityFile?.find((f: any) => f.type === 'COVER');
        if (cover) setCoverFile({ id: cover.id, filePath: cover.filePath }); 
        
        const gallery = act.activityFile?.filter((f: any) => f.type !== 'COVER').map((f: any) => ({ id: f.id, filePath: f.filePath })) || [];
        setMediaFiles(gallery);

        const formattedSchedules: ScheduleDay[] = [];
        const tempDates: Record<string, Timeslot[]> = {};

        act.schedules?.forEach((sch: any) => {
           const schStart = splitDateTime(sch.startDateTime);
           const schEnd = splitDateTime(sch.endDateTime);
           const schDate = schStart.date;
           
           if (!tempDates[schDate]) tempDates[schDate] = [];
           tempDates[schDate].push({
             id: sch.id,
             startTime: schStart.time,
             endTime: schEnd.time,
             description: sch.description || sch.title || '',
             files: sch.files?.map((f: any) => ({ id: f.id, filePath: f.filePath })) || [],
             deleteFileIds: []
           });
        });

        Object.keys(tempDates).forEach(dateStr => {
          formattedSchedules.push({ date: dateStr, timeslots: tempDates[dateStr] });
        });
        
        setSchedules(formattedSchedules.length > 0 ? formattedSchedules : [{ date: '', timeslots: [{ startTime: '', endTime: '', description: '', files: [], deleteFileIds: [] }] }]);

      } catch (error) {
        console.error("Fetch Activity Error:", error);
        alert("ไม่สามารถดึงข้อมูลกิจกรรมได้");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchActivityDetail();
  }, [id]);

  const regionOptions = Array.from(new Set(thaiData.map(p => REGION_MAP[p.geography_id]))).filter(Boolean);
  const availableProvinces = thaiData.filter(p => REGION_MAP[p.geography_id] === formData.region);
  const selectedProvinceObj = availableProvinces.find(p => p.name_th === formData.province);
  const availableDistricts = selectedProvinceObj ? (selectedProvinceObj.districts || selectedProvinceObj.amphure || []) : [];
  const selectedDistrictObj = availableDistricts.find((a: any) => a.name_th === formData.district);
  const availableSubDistricts = selectedDistrictObj ? (selectedDistrictObj.sub_districts || selectedDistrictObj.tambon || []) : [];

  // เคลียร์ Error เวลามีการเลือกข้อมูลใหม่
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, region: e.target.value, province: '', district: '', subDistrict: '' }));
    if (errors.region) setErrors(prev => ({ ...prev, region: '' }));
  };
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, province: e.target.value, district: '', subDistrict: '' }));
    if (errors.province) setErrors(prev => ({ ...prev, province: '' }));
  };
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, district: e.target.value, subDistrict: '' }));
    if (errors.district) setErrors(prev => ({ ...prev, district: '' }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // ⭐ ดักจับเฉพาะเบอร์โทรศัพท์ ให้กรอกได้แค่ตัวเลข และจำกัดแค่ 10 หลัก
    if (name === 'phone') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: onlyNums }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
      }
      return; 
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const addDay = () => setSchedules([...schedules, { date: '', timeslots: [{ startTime: '', endTime: '', description: '', files: [], deleteFileIds: [] }] }]);
  
  const removeDay = (dayIndex: number) => {
    const dayToRemove = schedules[dayIndex];
    const deletedIds: number[] = [];
    dayToRemove.timeslots.forEach(slot => { if (slot.id) deletedIds.push(slot.id); });
    
    if (deletedIds.length > 0) setScheduleDeleteIds(prev => [...prev, ...deletedIds]); 
    setSchedules(schedules.filter((_, i) => i !== dayIndex));
  };

  const addTimeSlot = (dayIndex: number) => {
    const newSchedules = [...schedules];
    newSchedules[dayIndex].timeslots.push({ startTime: '', endTime: '', description: '', files: [], deleteFileIds: [] });
    setSchedules(newSchedules);
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const newSchedules = [...schedules];
    const slotToRemove = newSchedules[dayIndex].timeslots[slotIndex];
    
    if (slotToRemove.id) setScheduleDeleteIds(prev => [...prev, slotToRemove.id]);
    
    newSchedules[dayIndex].timeslots.splice(slotIndex, 1);
    setSchedules(newSchedules);
  };

  const handleScheduleChange = (dayIndex: number, field: 'date', value: string) => {
    const newSchedules = [...schedules];
    newSchedules[dayIndex][field] = value;
    setSchedules(newSchedules);
  };

  const handleTimeSlotChange = (dayIndex: number, slotIndex: number, field: keyof Timeslot, value: string) => {
    const newSchedules = [...schedules];
    (newSchedules[dayIndex].timeslots[slotIndex] as any)[field] = value;
    setSchedules(newSchedules);
  };
  
  const handleScheduleFileChange = (dayIndex: number, slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newSchedules = [...schedules];
      const currentSlot = newSchedules[dayIndex].timeslots[slotIndex];
      if (currentSlot.files.length + filesArray.length <= 3) {
        currentSlot.files = [...currentSlot.files, ...filesArray];
        setSchedules(newSchedules);
      } else {
        alert("อัปโหลดได้สูงสุด 3 ไฟล์ต่อช่วงเวลา");
      }
    }
  };
  
  const removeScheduleFile = (dayIndex: number, slotIndex: number, fileIdx: number) => {
    const newSchedules = [...schedules];
    const currentSlot = { ...newSchedules[dayIndex].timeslots[slotIndex] };
    const fileToRemove = currentSlot.files[fileIdx];
    
    if (fileToRemove && (fileToRemove as ExistingFile).id) {
        currentSlot.deleteFileIds = [...currentSlot.deleteFileIds, (fileToRemove as ExistingFile).id];
    }
    
    currentSlot.files = currentSlot.files.filter((_, i) => i !== fileIdx);
    newSchedules[dayIndex].timeslots[slotIndex] = currentSlot;
    setSchedules(newSchedules);
  };

  const removeMediaFile = (idx: number) => {
    const fileToRemove = mediaFiles[idx];
    if (fileToRemove && (fileToRemove as ExistingFile).id) {
        setMediaDeleteIds(prev => [...prev, (fileToRemove as ExistingFile).id]);
    }
    setMediaFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const getFilePreview = (file: any) => {
    if (isNewFile(file)) return URL.createObjectURL(file as Blob);
    
    const timestamp = new Date().getTime(); 
    if (file?.filePath) return `${BASE_IMAGE_URL}${file.filePath}?t=${timestamp}`;
    if (typeof file === 'string') return `${BASE_IMAGE_URL}${file}?t=${timestamp}`;
    return '';
  };

  const isVideoFile = (file: any) => {
    if (isNewFile(file)) return file.type.startsWith('video/');
    const path = file?.filePath || (typeof file === 'string' ? file : '');
    return path.match(/\.(mp4|mov|m4v|webm)$/i);
  };

  // ⭐ ฟังก์ชันตรวจสอบฟอร์มก่อนกด Submit
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "กรุณากรอกชื่อกิจกรรม";
    if (!formData.activityType) newErrors.activityType = "กรุณาเลือกประเภทกิจกรรม";
    if (!formData.tagline.trim()) newErrors.tagline = "กรุณากรอกคำโปรย";
    if (!formData.description.trim()) newErrors.description = "กรุณากรอกรายละเอียด";
    
    if (!formData.phone) {
      newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์";
    } else if (formData.phone.length < 10) {
      newErrors.phone = "เบอร์โทรศัพท์ต้องมี 10 หลัก";
    }

    if (!formData.locationName.trim()) newErrors.locationName = "กรุณากรอกชื่อสถานที่จัดงาน";
    if (!formData.region) newErrors.region = "กรุณาเลือกภูมิภาค";
    if (!formData.province) newErrors.province = "กรุณาเลือกจังหวัด";
    if (!formData.district) newErrors.district = "กรุณาเลือกอำเภอ / เขต";
    if (!formData.subDistrict) newErrors.subDistrict = "กรุณาเลือกตำบล / แขวง";
    if (!formData.addressDetail.trim()) newErrors.addressDetail = "กรุณากรอกรายละเอียดที่อยู่";

    if (!formData.latitude || !formData.longitude) {
      newErrors.map = "กรุณาคลิกเลือกตำแหน่งบนแผนที่";
    }

    if (!formData.startDate) newErrors.startDate = "กรุณาระบุวันที่เริ่ม";
    if (!formData.startTime) newErrors.startTime = "กรุณาระบุเวลาเริ่ม";
    if (!formData.endDate) newErrors.endDate = "กรุณาระบุวันที่สิ้นสุด";
    if (!formData.endTime) newErrors.endTime = "กรุณาระบุเวลาสิ้นสุด";

    if (!coverFile) newErrors.cover = "กรุณาอัปโหลดภาพโปสเตอร์กิจกรรม (Cover)";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsConfirmModalOpen(true);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const confirmSubmit = async () => {
    setIsProcessing(true);
    try {
      const formDataToSend = new FormData();
      const flatScheduleFiles: File[] = [];
      const formattedSchedules: any[] = [];

      schedules.forEach(day => {
        day.timeslots.forEach(slot => {
          const fileIndexes: number[] = [];
          
          slot.files.forEach(file => {
            if (isNewFile(file)) {
               flatScheduleFiles.push(file as File);
               fileIndexes.push(flatScheduleFiles.length - 1);
            }
          });
          
          formattedSchedules.push({
            id: slot.id, 
            title: slot.description || "กิจกรรมย่อย",
            description: slot.description,
            startDateTime: day.date && slot.startTime ? `${day.date}T${slot.startTime}:00+07:00` : null,
            endDateTime: day.date && slot.endTime ? `${day.date}T${slot.endTime}:00+07:00` : null,
            fileIndexes: fileIndexes, 
            deleteFileIds: slot.deleteFileIds 
          });
        });
      });

      const activityJson = {
        locationId: null,
        location: {
          name: formData.locationName, zone: formData.region, province: formData.province,
          district: formData.district, subDistrict: formData.subDistrict, detail: formData.addressDetail,
          latitude: Number(formData.latitude), longitude: Number(formData.longitude)
        },
        name: formData.name, tagline: formData.tagline, description: formData.description,
        activityType: formData.activityType, phone: formData.phone,
        lineUrl: formData.line, facebookUrl: formData.facebook, price: formData.price ? Number(formData.price) : null,
        statusActivity: formData.statusActivity,
        startDate: formData.startDate && formData.startTime ? `${formData.startDate}T${formData.startTime}:00+07:00` : null,
        dueDate: formData.endDate && formData.endTime ? `${formData.endDate}T${formData.endTime}:00+07:00` : null,
        schedules: formattedSchedules,
        mediaDeleteIds: mediaDeleteIds, 
        scheduleDeleteIds: scheduleDeleteIds,
        isCoverDeleted: coverFile === null
      };

      formDataToSend.append("activity", JSON.stringify(activityJson));
      
      if (isNewFile(coverFile)) {
          formDataToSend.append("cover", coverFile as Blob);
      }
      
      mediaFiles.forEach(file => {
          if (isNewFile(file)) formDataToSend.append("media", file as Blob);
      });
      
      flatScheduleFiles.forEach(file => {
          formDataToSend.append("scheduleFiles", file);
      });

      await api.put(`/superadmin/activity/${id}`, formDataToSend, {
          headers: {
              "Content-Type": "multipart/form-data",
          },
      });

      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      alert(`เกิดข้อผิดพลาด: ${error.response?.data?.message || error.message}`);
      setIsConfirmModalOpen(false);
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    navigate('/superadmin/activity');
  };

  const Label = ({ title, required = false }: { title: string, required?: boolean }) => (
    <label className="block text-[14px] font-bold text-gray-800 mb-2">
      {title} {required && <span className="text-red-500">*</span>}
    </label>
  );

  // ฟังก์ชันช่วยกำหนดสี Class Name ของ Input อัตโนมัติ (เปลี่ยนเป็นสีแดงถ้าติด Error)
  const getInputClass = (fieldName: string) => {
    const baseClass = "w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors";
    return errors[fieldName] 
      ? `${baseClass} border-red-500 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500` 
      : `${baseClass} border-gray-300 focus:border-[#712874] bg-white`;
  };

  if (isLoadingData) return <div className="p-10 text-center text-gray-500">กำลังดึงข้อมูลกิจกรรม...</div>;

  return (
    <div className="w-full space-y-6 pb-10 relative">
      <h1 className="text-[24px] font-bold text-[#712874]">แก้ไขกิจกรรม</h1>

      <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handlePreSubmit} className="space-y-12" noValidate>
          
          <section className="space-y-5">
            <h2 className="text-[18px] font-bold text-[#712874] border-b border-gray-200 pb-2 mb-4">ข้อมูลทั่วไปของกิจกรรม</h2>
            
            <div>
              <Label title="ชื่อกิจกรรม" required />
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="กรอกชื่อกิจกรรม" className={getInputClass('name')} />
              {errors.name && <p className="text-red-500 text-[13px] mt-1.5">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label title="ประเภทกิจกรรม" required />
                <select name="activityType" value={formData.activityType} onChange={handleChange} className={getInputClass('activityType')}>
                  <option value="">เลือกประเภทกิจกรรม</option>
                  <option value="PERFORMANCE_MUSIC">การแสดง ดนตรี และความบันเทิง</option>
                  <option value="EXHIBITION_ART">นิทรรศการและศิลปะ</option>
                  <option value="CULTURAL_FESTIVAL">เทศกาลประเพณีและวัฒนธรรม</option>
                  <option value="FOOD_DRINK_FESTIVAL">เทศกาลอาหารและเครื่องดื่ม</option>
                  <option value="MARKET_FAIR">ตลาดนัดช้อปปิ้ง และงานแฟร์</option>
                  <option value="TRAINING_SEMINAR">การอบรมและเสวนา</option>
                  <option value="SPORT_RECREATION">กีฬา นันทนาการ</option>
                  <option value="COMMUNITY_TOURISM">ท่องเที่ยวชุมชน</option>
                </select>
                {errors.activityType && <p className="text-red-500 text-[13px] mt-1.5">{errors.activityType}</p>}
              </div>
              <div>
                <Label title="ราคา (บาท)" />
                <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="กรอกราคา" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#712874]" />
              </div>
              <div>
                <Label title="สถานะกิจกรรม" required />
                <select name="statusActivity" value={formData.statusActivity} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#712874] bg-white text-gray-700">
                  <option value="PUBLISH">เผยแพร่</option>
                  <option value="UNPUBLISH">ไม่เผยแพร่</option>
                  <option value="DRAFT">แบบร่าง</option>
                </select>
              </div>
            </div>

            <div>
              <Label title="คำโปรย" required />
              <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} placeholder="รายละเอียดสั้นๆ สำหรับแสดงหน้าแรก" className={getInputClass('tagline')} />
              {errors.tagline && <p className="text-red-500 text-[13px] mt-1.5">{errors.tagline}</p>}
            </div>

            <div>
              <Label title="รายละเอียด" required />
              <textarea name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="ระบุเนื้อหา กำหนดการ และรายละเอียดของกิจกรรม" className={`${getInputClass('description')} resize-y`}></textarea>
              {errors.description && <p className="text-red-500 text-[13px] mt-1.5">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label title="เบอร์โทรศัพท์" required />
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="กรอกเบอร์โทรศัพท์" className={getInputClass('phone')} />
                {errors.phone && <p className="text-red-500 text-[13px] mt-1.5">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label title="Link Facebook" />
                <input type="text" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="กรอก URL Facebook" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#712874]" />
              </div>
              <div>
                <Label title="Link Line" />
                <input type="text" name="line" value={formData.line} onChange={handleChange} placeholder="กรอก URL Line" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#712874]" />
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <h2 className="text-[18px] font-bold text-[#712874] border-b border-gray-200 pb-2 mb-4">วันเวลา และสถานที่ตั้ง</h2>
            
            <div>
              <Label title="ชื่อสถานที่จัดงาน" required />
              <input type="text" name="locationName" value={formData.locationName} onChange={handleChange} placeholder="เช่น วัดโพนชัย, ศูนย์การค้าเซ็นทรัล..." className={getInputClass('locationName')} />
              {errors.locationName && <p className="text-red-500 text-[13px] mt-1.5">{errors.locationName}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label title="ภูมิภาค" required />
                <select name="region" value={formData.region} onChange={handleRegionChange} className={getInputClass('region')}>
                  <option value="">{isLoadingLocation ? "กำลังโหลดข้อมูล..." : "เลือกภูมิภาค"}</option>
                  {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {errors.region && <p className="text-red-500 text-[13px] mt-1.5">{errors.region}</p>}
              </div>
              <div>
                <Label title="จังหวัด" required />
                <select name="province" value={formData.province} onChange={handleProvinceChange} disabled={!formData.region || isLoadingLocation} className={getInputClass('province')}>
                  <option value="">เลือกจังหวัด</option>
                  {availableProvinces.map(p => <option key={p.id} value={p.name_th}>{p.name_th}</option>)}
                </select>
                {errors.province && <p className="text-red-500 text-[13px] mt-1.5">{errors.province}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label title="อำเภอ / เขต" required />
                <select name="district" value={formData.district} onChange={handleDistrictChange} disabled={!formData.province || isLoadingLocation} className={getInputClass('district')}>
                  <option value="">เลือกอำเภอ / เขต</option>
                  {availableDistricts.map((d: any) => <option key={d.id} value={d.name_th}>{d.name_th}</option>)}
                </select>
                {errors.district && <p className="text-red-500 text-[13px] mt-1.5">{errors.district}</p>}
              </div>
              <div>
                <Label title="ตำบล / แขวง" required />
                <select name="subDistrict" value={formData.subDistrict} onChange={handleChange} disabled={!formData.district || isLoadingLocation} className={getInputClass('subDistrict')}>
                  <option value="">เลือกตำบล / แขวง</option>
                  {availableSubDistricts.map((sd: any) => <option key={sd.id} value={sd.name_th}>{sd.name_th}</option>)}
                </select>
                {errors.subDistrict && <p className="text-red-500 text-[13px] mt-1.5">{errors.subDistrict}</p>}
              </div>
            </div>

            <div>
              <Label title="รายละเอียดที่อยู่" required />
              <input type="text" name="addressDetail" value={formData.addressDetail} onChange={handleChange} placeholder="เลขที่, ถนน, ซอย, อำเภอ" className={getInputClass('addressDetail')} />
              {errors.addressDetail && <p className="text-red-500 text-[13px] mt-1.5">{errors.addressDetail}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label title="ละติจูด" required />
                <input type="text" value={formData.latitude} readOnly placeholder="ละติจูดของสถานที่จัดกิจกรรม" className={`${getInputClass('map')} bg-gray-50`} />
              </div>
              <div>
                <Label title="ลองจิจูด" required />
                <input type="text" value={formData.longitude} readOnly placeholder="ลองจิจูดของสถานที่จัดกิจกรรม" className={`${getInputClass('map')} bg-gray-50`} />
              </div>
            </div>
            {errors.map && <p className="text-red-500 text-[13px] mt-1">{errors.map}</p>}

            <div>
              <Label title="คลิกเลือกตำแหน่งบนแผนที่ (OpenStreetMap)" />
              <div className={`w-full h-[350px] bg-gray-100 rounded-xl overflow-hidden border ${errors.map ? 'border-red-500 ring-2 ring-red-500/30' : 'border-gray-300'} z-0`}>
                <MapContainer center={[mapPosition?.lat || 13.736717, mapPosition?.lng || 100.523186]} zoom={13} style={{ width: '100%', height: '100%' }}>
                  <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationSelector position={mapPosition} setPosition={setMapPosition} setFormData={setFormData} setErrors={setErrors} />
                </MapContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label title="วันที่เริ่มกิจกรรม" required />
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={getInputClass('startDate')} />
                {errors.startDate && <p className="text-red-500 text-[12px] mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <Label title="เวลาที่เริ่มกิจกรรม" required />
                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className={getInputClass('startTime')} />
                {errors.startTime && <p className="text-red-500 text-[12px] mt-1">{errors.startTime}</p>}
              </div>
              <div>
                <Label title="วันที่สิ้นสุดกิจกรรม" required />
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className={getInputClass('endDate')} />
                {errors.endDate && <p className="text-red-500 text-[12px] mt-1">{errors.endDate}</p>}
              </div>
              <div>
                <Label title="เวลาที่สิ้นสุดกิจกรรม" required />
                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className={getInputClass('endTime')} />
                {errors.endTime && <p className="text-red-500 text-[12px] mt-1">{errors.endTime}</p>}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-[18px] font-bold text-[#712874] border-b border-gray-200 pb-2 mb-4">กำหนดการกิจกรรมย่อย</h2>
            {schedules.map((day, dayIndex) => (
                <div key={dayIndex} className="bg-[#FAFAFA] border border-gray-200 rounded-xl p-6 relative">
                {dayIndex > 0 && (
                    <button type="button" onClick={() => removeDay(dayIndex)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-white rounded-full p-1 border shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                )}
                <div className="mb-6 w-full md:w-1/3 min-w-[200px]">
                    <Label title="วันที่" required />
                    <input type="date" value={day.date} onChange={(e) => handleScheduleChange(dayIndex, 'date', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white" required />
                </div>
                {day.timeslots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="space-y-4 mb-6 pb-6 border-b border-gray-200 border-dashed last:border-0 last:pb-0 last:mb-0">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        <div className="md:col-span-3">
                        <Label title="เวลาที่เริ่ม" required />
                        <input type="time" value={slot.startTime} onChange={(e) => handleTimeSlotChange(dayIndex, slotIndex, 'startTime', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white" required />
                        </div>
                        <div className="md:col-span-3">
                        <Label title="เวลาที่สิ้นสุด" required />
                        <input type="time" value={slot.endTime} onChange={(e) => handleTimeSlotChange(dayIndex, slotIndex, 'endTime', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white" required />
                        </div>
                        <div className={slotIndex > 0 ? "md:col-span-5" : "md:col-span-6"}>
                        <Label title="รายละเอียดกิจกรรมในช่วงเวลานี้" required />
                        <textarea rows={1} value={slot.description} onChange={(e) => handleTimeSlotChange(dayIndex, slotIndex, 'description', e.target.value)} placeholder="ระบุชื่อหรือรายละเอียดกิจกรรมย่อย" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white resize-y" required></textarea>
                        </div>
                        {slotIndex > 0 && (
                        <div className="md:col-span-1 flex items-end">
                            <button type="button" onClick={() => removeTimeSlot(dayIndex, slotIndex)} className="bg-[#FF6B6B] text-white px-3 py-2.5 rounded-lg text-sm w-full h-[42px] mt-[30px]">ลบ</button>
                        </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-1">
                      {slot.files.map((file, fIdx) => (
                         <div key={fIdx} className="relative w-[100px] h-[70px] border border-gray-300 rounded-lg flex items-center justify-center bg-gray-100 overflow-hidden">
                           <button type="button" onClick={() => removeScheduleFile(dayIndex, slotIndex, fIdx)} className="absolute top-1 right-1 z-10 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">✕</button>
                           
                           { isVideoFile(file) ? (
                              <video src={getFilePreview(file)} className="w-full h-full object-contain bg-black" controls preload="metadata" />
                           ) : (
                              <img src={getFilePreview(file)} alt="schedule" className="w-full h-full object-cover" />
                           )}
                         </div>
                      ))}
                      {slot.files.length < 3 && (
                        <label className="w-[100px] h-[70px] border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 bg-white">
                            <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => handleScheduleFileChange(dayIndex, slotIndex, e)} />
                            <svg className="w-5 h-5 mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            <span className="text-[10px]">{slot.files.length}/3</span>
                        </label>
                      )}
                    </div>
                    </div>
                ))}
                <button type="button" onClick={() => addTimeSlot(dayIndex)} className="mt-2 border px-4 py-2 rounded-lg text-[13px] bg-white shadow-sm">เพิ่มช่วงเวลา</button>
                </div>
            ))}
            <div className="flex justify-end pt-2">
                <button type="button" onClick={addDay} className="bg-[#712874] text-white px-6 py-2.5 rounded-lg text-sm shadow-sm">เพิ่มวัน</button>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-[18px] font-bold text-[#712874] border-b border-gray-200 pb-2 mb-4">รูปภาพและวิดีโอของกิจกรรม</h2>
            <div className="relative pl-6 space-y-8 border-l-2 border-[#F59E0B] ml-2">
              <div className="relative">
                <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-[#F59E0B] border-4 border-white shadow-sm"></div>
                <div>
                  <Label title="อัปโหลดภาพโปสเตอร์กิจกรรม (Cover)" required />
                  
                  <div className="flex flex-wrap gap-3 mt-2">
                    {coverFile ? (
                      <div className="relative w-[140px] h-[100px] border border-gray-300 rounded-lg flex items-center justify-center bg-gray-100 overflow-hidden">
                        <button type="button" onClick={() => setCoverFile(null)} className="absolute top-1 right-1 z-10 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">✕</button>
                        <img src={getFilePreview(coverFile)} alt="cover" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <label className={`w-[140px] h-[100px] border-2 border-dashed ${errors.cover ? 'border-red-500 bg-red-50' : 'border-gray-400 bg-white hover:bg-gray-50'} rounded-lg flex flex-col items-center justify-center text-gray-500 cursor-pointer relative`}>
                        <svg className={`w-8 h-8 mb-1 ${errors.cover ? 'text-red-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span className={`text-[11px] font-medium ${errors.cover ? 'text-red-500' : ''}`}>0 / 1</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { 
                          if (e.target.files && e.target.files.length > 0) {
                            setCoverFile(e.target.files[0]);
                            if (errors.cover) setErrors(prev => ({ ...prev, cover: '' }));
                          }
                        }} />
                      </label>
                    )}
                  </div>
                  {errors.cover && <p className="text-red-500 text-[13px] mt-1.5">{errors.cover}</p>}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-[#F59E0B] border-4 border-white shadow-sm"></div>
                <div>
                  <Label title="อัปโหลดภาพและวิดีโอเพิ่มเติมของกิจกรรม" />
                  
                  <div className="flex flex-wrap gap-3 mt-2">
                    {mediaFiles.map((file, idx) => (
                      <div key={idx} className="relative w-[140px] h-[100px] border border-gray-300 rounded-lg flex items-center justify-center bg-gray-100 overflow-hidden">
                        <button type="button" onClick={() => removeMediaFile(idx)} className="absolute top-1 right-1 z-10 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">✕</button>
                        
                        { isVideoFile(file) ? (
                          <video 
                            src={getFilePreview(file)} 
                            className="w-full h-full object-contain bg-black" 
                            controls 
                            preload="metadata" 
                          />
                        ) : (
                          <img src={getFilePreview(file)} alt="media" className="w-full h-full object-cover" />
                        )}
                        
                      </div>
                    ))}
                    
                    {mediaFiles.length < 4 && (
                      <label className="w-[140px] h-[100px] border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 bg-white relative">
                        <div className="flex space-x-2 mb-1">
                          <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        </div>
                        <span className="text-[11px] font-medium">{mediaFiles.length} / 4</span>
                        <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => {
                          if (e.target.files) {
                            const filesArray = Array.from(e.target.files);
                            if (mediaFiles.length + filesArray.length <= 4) {
                              setMediaFiles([...mediaFiles, ...filesArray]);
                            } else {
                              alert("อัปโหลดเพิ่มได้สูงสุด 4 ไฟล์");
                            }
                          }
                        }} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end items-center space-x-4 pt-8 border-t border-gray-200">
            <button type="button" onClick={() => navigate('/superadmin/activity')} className="px-6 py-2.5 rounded-xl text-sm font-medium border text-gray-700 hover:bg-gray-50 bg-white">
              ยกเลิก
            </button>
            <button type="submit" className="bg-[#712874] text-white font-medium px-8 py-2.5 rounded-xl text-sm shadow-sm">
              บันทึกการแก้ไข
            </button>
          </div>

        </form>
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[420px] p-10 flex flex-col items-center shadow-xl animate-fade-in-up">
            
            <div className="w-[64px] h-[64px] rounded-full border-[3px] border-black flex items-center justify-center mb-6">
              <span className="text-[36px] font-bold text-black leading-none">!</span>
            </div>
            
            <h3 className="text-[20px] font-bold text-gray-900 mb-3">ยืนยันการแก้ไขกิจกรรม</h3>
            <p className="text-[14px] text-gray-500 mb-8 text-center">คุณต้องการยืนยันการแก้ไขกิจกรรมหรือไม่</p>
            
            <div className="flex space-x-4 w-full justify-center">
              <button 
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isProcessing}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors w-[120px]"
              >
                ยกเลิก
              </button>
              <button 
                onClick={confirmSubmit}
                disabled={isProcessing}
                className="px-6 py-2.5 bg-[#5B1F54] text-white rounded-lg text-[14px] font-medium hover:bg-[#461740] transition-colors w-[120px] flex justify-center items-center"
              >
                {isProcessing ? 'กำลังบันทึก...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[420px] p-10 flex flex-col items-center shadow-xl animate-fade-in-up">
            
            <div className="w-[76px] h-[76px] rounded-full bg-[#6B2A68] flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <h3 className="text-[20px] font-bold text-gray-900 mb-3">แก้ไขกิจกรรมสำเร็จ</h3>
            <p className="text-[14px] text-gray-500 mb-8 text-center">ข้อมูลกิจกรรมถูกบันทึก</p>
            
            <button 
              onClick={closeSuccessModal}
              className="px-8 py-2.5 bg-[#4A154B] text-white rounded-lg text-[14px] font-medium hover:bg-[#340f35] transition-colors w-[140px]"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

    </div>
  );
}