import React, { useState, useEffect } from "react";
import dashboardApi from "../../api/dashboardApi";
import { Users, Car, FileText, DollarSign, AlertTriangle, ArrowRight } from "lucide-react";

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardApi.getStats()
            .then(res => { setStats(res); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-500">Đang tải dữ liệu hệ thống...</div>;

    return (
        <div className="p-4 space-y-8">
            <h1 className="text-3xl font-extrabold text-gray-800">Tổng quan Garage</h1>

            {/* 4 THẺ THỐNG KÊ CHÍNH */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Users size={28}/>} color="bg-blue-500" title="Khách hàng" value={stats?.totalCustomers} />
                <StatCard icon={<Car size={28}/>} color="bg-purple-500" title="Xe quản lý" value={stats?.totalVehicles} />
                <StatCard icon={<FileText size={28}/>} color="bg-orange-500" title="Lệnh sửa chữa" value={stats?.totalRepairOrders} />
                <StatCard icon={<DollarSign size={28}/>} color="bg-green-600" title="Doanh thu" value={`${stats?.totalRevenue?.toLocaleString()}đ`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* DANH SÁCH LỆNH MỚI NHẤT */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden border">
                    <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-700 flex items-center gap-2"><FileText size={20}/> Lệnh sửa chữa gần đây</h2>
                        <button className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline">Xem tất cả <ArrowRight size={14}/></button>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="p-4">Mã lệnh</th>
                                <th className="p-4">Khách hàng</th>
                                <th className="p-4 text-right">Tổng tiền</th>
                                <th className="p-4 text-center">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {stats?.recentOrders?.map(order => (
                                <tr key={order.orderCode} className="hover:bg-gray-50">
                                    <td className="p-4 font-bold text-blue-600">{order.orderCode}</td>
                                    <td className="p-4 font-medium">{order.customerName}</td>
                                    <td className="p-4 text-right font-bold text-red-600">{order.finalAmount?.toLocaleString()}đ</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* CẢNH BÁO TỒN KHO */}
                <div className="bg-white rounded-2xl shadow-lg border">
                    <div className="p-5 border-b bg-red-50">
                        <h2 className="font-bold text-red-700 flex items-center gap-2"><AlertTriangle size={20}/> Cảnh báo hết hàng</h2>
                    </div>
                    <div className="p-5 space-y-4">
                        {stats?.lowStockParts?.length === 0 ? <p className="text-gray-400 text-sm text-center">Tồn kho đang ở mức an toàn.</p> :
                        stats?.lowStockParts?.map(part => (
                            <div key={part.partName} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                                <span className="font-bold text-gray-700">{part.partName}</span>
                                <span className="text-red-600 font-black">Chỉ còn: {part.stockQuantity}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Component Thẻ thống kê nhỏ
function StatCard({ icon, color, title, value }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border flex items-center gap-5 hover:scale-105 transition">
            <div className={`${color} text-white p-4 rounded-xl shadow-lg`}>{icon}</div>
            <div>
                <p className="text-gray-400 font-semibold text-sm">{title}</p>
                <p className="text-2xl font-black text-gray-800">{value}</p>
            </div>
        </div>
    );
}