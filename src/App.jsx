import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import AdminLogin from './components/AdminLogin';
import AdminLayout from './components/AdminLayout';
import PartList from "./admin/part/PartList";
import CustomerList from "./admin/customer/CustomerList";
import VehicleList from "./admin/vehicle/VehicleList";
import ServiceList from "./admin/service/ServiceList";
import RepairOrderList from "./admin/order/RepairOrderList";
import SupplierList from "./admin/supplier/SupplierList";
import InventoryList from "./admin/inventory/InventoryList";
import Dashboard from './admin/dashboard/Dashboard';
import UserList from './admin/user/UserList';
import TechnicianHistory from './admin/task/TechnicianHistory';
import MechanicScheduler from './admin/task/MechanicScheduler';

// IMPORT 2 PHẦN MỚI
import AppointmentList from './admin/appointment/AppointmentList';
import CheckIn from './admin/checkin/CheckIn';
import TechnicianTaskList from './admin/task/TechnicianTaskList';

import PublicBooking from './client/PublicBooking';
import HomePage from './client/HomePage';
import VehicleHistory from './client/VehicleHistory';
// COMPONENT BẢO VỆ ROUTE THEO QUYỀN
const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;

  let role = null;
  try {
    const decoded = jwtDecode(token);
    role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
  } catch (error) {
    console.error(error);
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tra-cuu/:licensePlate" element={<VehicleHistory />} />
        <Route path="/dat-lich" element={<PublicBooking />} />
        
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" />} />
            
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* 1. NGHIỆP VỤ GARA (MỚI) - Admin và Advisor được vào */}
            <Route path="checkin" element={
                <ProtectedRoute allowedRoles={['Admin', 'ADMIN', 'Advisor']}>
                    <CheckIn />
                </ProtectedRoute>
            } />
            <Route path="appointments" element={
                <ProtectedRoute allowedRoles={['Admin', 'ADMIN', 'Advisor']}>
                    <AppointmentList />
                </ProtectedRoute>
            } />

            {/* 2. QUẢN LÝ LỆNH & KHO */}
            <Route path="repair-orders" element={
                <ProtectedRoute allowedRoles={['Admin', 'ADMIN', 'Advisor']}>
                    <RepairOrderList />
                </ProtectedRoute>
            } />
            <Route path="inventories" element={
                <ProtectedRoute allowedRoles={['Admin', 'ADMIN', 'Advisor']}>
                    <InventoryList />
                </ProtectedRoute>
            } />
            <Route path="suppliers" element={
                <ProtectedRoute allowedRoles={['Admin', 'ADMIN', 'Advisor']}>
                    <SupplierList />
                </ProtectedRoute>
            } />

            {/* 3. DỮ LIỆU NỀN */}
            <Route path="parts" element={<PartList />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="vehicles" element={<VehicleList />} />
            <Route path="services" element={<ServiceList />} />

            {/* 4. HỆ THỐNG & CÔNG VIỆC */}
            <Route path="users" element={
                <ProtectedRoute allowedRoles={['Admin', 'ADMIN']}>
                    <UserList />
                </ProtectedRoute>
            } />
            <Route path="tasks" element={
                <ProtectedRoute allowedRoles={['Admin', 'ADMIN', 'Technician']}>
                    <TechnicianTaskList />
                </ProtectedRoute>
            } />
            <Route path="tasks/history" element={
                <ProtectedRoute allowedRoles={['Admin', 'ADMIN', 'Technician']}>
                    <TechnicianHistory />
                </ProtectedRoute>
            } />
            <Route path="scheduler" element={
                <ProtectedRoute allowedRoles={['Admin', 'ADMIN', 'Advisor']}>
                    <MechanicScheduler />
                </ProtectedRoute>
            } />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;