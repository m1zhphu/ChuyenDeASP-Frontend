import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './TopBar';
import { jwtDecode } from 'jwt-decode';
import GlobalNotification from '../components/GlobalNotification';

export default function AdminLayout() {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  let isAuthorized = false;
  let errorMessage = "";

  try {
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedToken.role;
    const validRoles = ['Admin', 'ADMIN', 'Advisor', 'Technician'];
    
    if (validRoles.includes(userRole)) {
        isAuthorized = true;
    } else {
        errorMessage = "Tài khoản của bạn không có quyền truy cập hệ thống.";
    }
  } catch (error) {
    console.error("Token không hợp lệ:", error);
    errorMessage = "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.";
  }

  if (!isAuthorized) {
    localStorage.removeItem('token'); 
    return <Navigate to="/" replace state={{ message: errorMessage }} />;
  }

  return (
    // h-screen overflow-hidden: Khóa toàn bộ khung hình vào đúng 1 màn hình, không cho cuộn cả trang
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      
      {/* 1. Sidebar - Đứng yên bên trái (w-72) */}
      <Sidebar />

      {/* 2. Vùng nội dung bên phải (Phần còn lại của màn hình) */}
      {/* ml-72: Chừa đúng 288px cho Sidebar */}
      <div className="flex-1 flex flex-col ml-72 min-w-0 h-full">
        
        {/* Thanh Topbar nằm cố định trên cùng của vùng nội dung */}
        <Topbar />

        {/* Vùng chứa nội dung chính (Dashboard, Lệnh sửa chữa, v.v.) */}
        {/* flex-1 overflow-y-auto: Chỉ duy nhất vùng này được cuộn khi dữ liệu dài */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* 3. Thành phần thông báo Real-time (Nằm đè lên trên cùng bên phải) */}
      <GlobalNotification />
    </div>
  );
}