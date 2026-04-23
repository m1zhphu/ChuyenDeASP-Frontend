import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom'; 
import { 
    LayoutDashboard, Wrench, Users, Car, Settings, FileText, 
    ShieldCheck, UserCheck, CalendarRange, PackageSearch, 
    Truck, Warehouse, ChevronDown, ChevronRight , History
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

export default function Sidebar() {
  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : {};
  const userRole = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
  const location = useLocation();

  // Trạng thái đóng mở của các nhóm Menu
  const [openMenus, setOpenMenus] = useState({
    operations: true,
    inventory: true,
    management: true,
    system: true
  });

  const toggleMenu = (key) => {
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Cấu trúc Menu phân cấp
  const navigation = [
    {
      group: "TỔNG QUAN",
      key: "dashboard",
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, roles: ['Admin', 'Advisor', 'Technician'] },
        { name: 'Lịch điều phối', path: '/admin/scheduler', icon: <CalendarRange size={20} />, roles: ['Admin', 'Advisor'] },
        { name: 'Công việc thợ', path: '/admin/tasks', icon: <Wrench size={20} />, roles: ['Admin', 'Technician'] },
        { name: 'Lịch sử công việc', path: '/admin/tasks/history', icon: <History size={20} />, roles: ['Admin', 'Technician'] },
      ]
    },
    {
      group: "NGHIỆP VỤ GARA",
      key: "operations",
      items: [
        { name: 'Tiếp nhận xe', path: '/admin/checkin', icon: <UserCheck size={20} />, roles: ['Admin', 'Advisor'] },
        { name: 'Lịch hẹn', path: '/admin/appointments', icon: <CalendarRange size={20} />, roles: ['Admin', 'Advisor'] },
        { name: 'Lệnh sửa chữa', path: '/admin/repair-orders', icon: <FileText size={20} />, roles: ['Admin', 'Advisor'] },
      ]
    },
    {
      group: "KHO & VẬT TƯ",
      key: "inventory",
      items: [
        { name: 'Phụ tùng', path: '/admin/parts', icon: <PackageSearch size={20} />, roles: ['Admin', 'Advisor'] },
        { name: 'Nhà cung cấp', path: '/admin/suppliers', icon: <Truck size={20} />, roles: ['Admin', 'Advisor'] },
        { name: 'Nhập kho', path: '/admin/inventories', icon: <Warehouse size={20} />, roles: ['Admin', 'Advisor'] },
      ]
    },
    {
      group: "QUẢN LÝ DỮ LIỆU",
      key: "management",
      items: [
        { name: 'Khách hàng', path: '/admin/customers', icon: <Users size={20} />, roles: ['Admin', 'Advisor'] },
        { name: 'Xe cộ', path: '/admin/vehicles', icon: <Car size={20} />, roles: ['Admin', 'Advisor'] },
        { name: 'Dịch vụ', path: '/admin/services', icon: <Settings size={20} />, roles: ['Admin', 'Advisor'] },
      ]
    },
    {
      group: "HỆ THỐNG",
      key: "system",
      items: [
        { name: 'Nhân viên', path: '/admin/users', icon: <ShieldCheck size={20} />, roles: ['Admin'] },
      ]
    }
  ];

  const linkStyle = "flex items-center gap-3 rounded-lg py-2.5 px-4 text-sm font-medium transition-all duration-200 mb-1";
  const activeLink = "bg-blue-600 text-white shadow-md shadow-blue-200";
  const inactiveLink = "text-gray-600 hover:bg-blue-50 hover:text-blue-600";

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 flex-col border-r border-gray-100 bg-white flex shadow-sm">
      
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-50 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white font-black text-xl shadow-inner border border-white/30">
          SG
        </div>
        <div>
          <h1 className="text-lg font-bold text-white leading-tight">Smart Garage</h1>
          <p className="text-[10px] text-blue-100 font-medium tracking-widest uppercase">Professional ERP</p>
        </div>
      </div>

      {/* Navigation Scroll Area */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
        {navigation.map((group) => {
          // Lọc các item trong group theo role của user
          const visibleItems = group.items.filter(item => item.roles.includes(userRole));
          
          // Nếu group không có item nào user được xem thì ẩn cả group
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.key} className="mb-6">
              {/* Group Header có nút Toggle */}
              <button 
                onClick={() => toggleMenu(group.key)}
                className="w-full flex items-center justify-between mb-2 px-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-blue-500 transition-colors"
              >
                <span>{group.group}</span>
                {openMenus[group.key] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {/* Danh sách Item (Animate khi đóng mở) */}
              {openMenus[group.key] && (
                <ul className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-300">
                  {visibleItems.map((item) => (
                    <li key={item.path}>
                      <NavLink 
                        to={item.path} 
                        className={({ isActive }) => `${linkStyle} ${isActive ? activeLink : inactiveLink}`}
                      >
                        <span className={`${location.pathname === item.path ? 'text-white' : 'text-blue-500'}`}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Status Footer */}
      <div className="p-4 border-t border-gray-50 bg-gray-50/50">
        <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-200">
                {userRole?.charAt(0)}
            </div>
            <div className="overflow-hidden">
                <p className="text-xs font-bold text-gray-800 truncate">{decoded.unique_name || "Quản trị viên"}</p>
                <p className="text-[10px] text-gray-500 font-medium uppercase">{userRole}</p>
            </div>
        </div>
      </div>
    </aside>
  );
}