import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // นำเข้า useNavigate
import api from '../../Libs/axios'; // ให้แน่ใจว่า path ตรงกับไฟล์ axios.ts ของคุณ
import logo from '../../assets/logo.png'; 

const LoginAdminPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate(); // เรียกใช้งาน useNavigate

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // ยิง API แบบ POST ไปที่ /auth/login
      const response = await api.post('/auth/login', {
        username: username,
        password: password
      });

      // เช็คว่า status เป็น 200 แบบที่เทสต์ผ่าน
      if (response.data.status === 200) {
        // ดึง Token และข้อมูล User จาก Response
        const token = response.data.data.token;
        const user = response.data.data.user;

        // บันทึก Token ลงใน localStorage ของเบราว์เซอร์
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        
        // ใช้ navigate ในการเปลี่ยนหน้าโดยแยกตาม Role
        if (user.role === 'SUPERADMIN') {
          navigate('/superadmin/activity');
        } else if (user.role === 'ADMIN') {
          navigate('/admin/activities'); 
        } else {
          navigate('/'); 
        }
      }
      
    } catch (error: any) {
      console.error("Login Error:", error);
      alert(error.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center relative font-sarabun">
      
      {/* โลโก้มุมซ้ายบน */}
      <div className="absolute top-6 left-6">
        <img src={logo} alt="Festia Logo" className="w-16 h-auto" />
      </div>

      {/* กล่อง Form Login */}
      <div className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
          เข้าสู่ระบบ Admin
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* ชื่อผู้ใช้ / อีเมล */}
          <div>
            <label className="block text-sm text-gray-700 mb-1.5 font-medium">
              ชื่อผู้ใช้ / อีเมล
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ป้อนชื่อผู้ใช้หรืออีเมล"
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600"
              required
            />
          </div>

          {/* รหัสผ่าน */}
          <div>
            <label className="block text-sm text-gray-700 mb-1.5 font-medium">
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ป้อนรหัสผ่าน"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 pr-10"
                required
              />
              {/* ปุ่มเปิด/ปิดตา รหัสผ่าน */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* ลืมรหัสผ่าน */}
            <div className="flex justify-end mt-2">
              <a href="#" className="text-sm text-gray-500 hover:text-purple-700 transition-colors">
                ลืมรหัสผ่าน
              </a>
            </div>
          </div>

          {/* ปุ่มเข้าสู่ระบบ */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white py-2.5 rounded-md transition-colors font-medium mt-2 ${
              isLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-[#6C256B] hover:bg-purple-900'
            }`}
          >
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginAdminPage;