import React, { useState } from "react";
import checkInApi from "../../api/checkInApi";
// ĐÃ FIX LỖI IMPORT: Bổ sung Eye, Hash, Wrench, Package, ArrowLeft, Clock
import { 
    Search, Car, User, History, PlusCircle, AlertCircle, 
    CalendarCheck, X, Zap, Eye, Hash, Wrench, Package, ArrowLeft, Clock 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CheckIn() {
    const [licensePlate, setLicensePlate] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // State cho Modal Quick Onboard
    const [showQuickModal, setShowQuickModal] = useState(false);
    const [quickData, setQuickData] = useState({ name: '', phone: '', email: '', address: '' });
    const [quickLoading, setQuickLoading] = useState(false);

    const navigate = useNavigate();

    const handleCheckIn = async (e) => {
        e.preventDefault();
        if (!licensePlate.trim()) return;
        
        setLoading(true);
        try {
            const data = await checkInApi.process(licensePlate);
            setResult(data);
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối hệ thống!");
        } finally { setLoading(false); }
    };

    const handleQuickOnboard = async (e) => {
        e.preventDefault();
        if (!quickData.name.trim()) return alert("Vui lòng nhập tên khách hàng!");
        
        if (quickData.phone) {
            const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
            if (!phoneRegex.test(quickData.phone)) return alert("Số điện thoại không hợp lệ!");
        }

        if (quickData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(quickData.email)) return alert("Định dạng email không hợp lệ!");
        }

        setQuickLoading(true);
        try {
            const response = await checkInApi.quickOnboard({
                licensePlate: result.licensePlate,
                customerName: quickData.name,
                phoneNumber: quickData.phone,
                email: quickData.email,
                address: quickData.address
            });
            
            setResult(response);
            setShowQuickModal(false);
            setQuickData({ name: '', phone: '', email: '', address: '' });
        } catch (err) {
            console.error(err)
            alert("Lỗi tạo hồ sơ nhanh!");
        } finally {
            setQuickLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 relative">
            {/* NÚT QUAY LẠI DASHBOARD */}
            <button 
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors"
            >
                <ArrowLeft size={20}/> Quay lại Dashboard
            </button>

            <div className="text-center space-y-3">
                <h1 className="text-4xl font-black text-gray-800 tracking-tight uppercase">TIẾP NHẬN XE VÀO XƯỞNG</h1>
                <p className="text-gray-500 font-medium italic">Hệ thống nhận diện phương tiện thông minh</p>
            </div>

            {/* THANH TÌM KIẾM CHÍNH */}
            <form onSubmit={handleCheckIn} className="relative group">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600">
                    <Car size={32} />
                </div>
                <input 
                    type="text" 
                    placeholder="NHẬP BIỂN SỐ XE..." 
                    className="w-full p-8 pl-20 text-4xl font-black uppercase border-4 border-gray-200 rounded-3xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all shadow-xl tracking-widest"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                />
                <button 
                    disabled={loading}
                    className="absolute right-4 top-4 bottom-4 bg-blue-600 text-white px-10 rounded-2xl font-black text-xl flex items-center gap-3 hover:bg-blue-700 active:scale-95 transition-all shadow-lg"
                >
                    {loading ? "..." : <><Search size={28}/> KIỂM TRA</>}
                </button>
            </form>

            {/* HIỂN THỊ KẾT QUẢ */}
            {result && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in zoom-in duration-500">
                    {/* CỘT TRÁI: THÔNG TIN CHÍNH */}
                    <div className="lg:col-span-7 space-y-6">
                        {result.isExisting ? (
                            <div className="bg-white p-8 rounded-3xl shadow-2xl border-t-8 border-green-500 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><Car size={120}/></div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <User className="text-green-500"/> Thông tin khách hàng & xe
                                </h2>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-gray-400 uppercase">Chủ xe</p>
                                        <p className="text-2xl font-black text-gray-800">{result.customerName}</p>
                                        <p className="text-blue-600 font-bold">{result.phoneNumber || "Chưa có SĐT"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-gray-400 uppercase">Phương tiện</p>
                                        <p className="text-2xl font-black text-gray-800">{result.make} {result.model}</p>
                                        <p className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg font-black inline-block border border-yellow-200">{result.licensePlate}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 mt-10">
                                    <button 
                                        onClick={() => navigate('/admin/repair-orders', { state: { licensePlate: result.licensePlate } })}
                                        className="flex-[2] bg-gradient-to-r from-blue-600 to-blue-800 text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:shadow-blue-300 shadow-xl transition-all hover:scale-[1.02]"
                                    >
                                        <PlusCircle size={28}/> LẬP PHIẾU NGAY
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/tra-cuu/${result.licensePlate}`)}
                                        className="flex-1 bg-slate-800 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-lg"
                                    >
                                        <Clock size={24}/> LỊCH SỬ
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-10 rounded-3xl shadow-xl border-t-8 border-orange-500 text-center space-y-6">
                                <AlertCircle size={80} className="mx-auto text-orange-500 animate-bounce"/>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-800">XE MỚI CHƯA CÓ TRÊN HỆ THỐNG</h2>
                                    <p className="text-gray-500 mt-2 font-medium">Chọn tạo hồ sơ nhanh để lập phiếu sửa chữa ngay lập tức.</p>
                                </div>
                                <div className="flex gap-4 mt-4">
                                    <button 
                                        onClick={() => setShowQuickModal(true)} 
                                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-black text-lg flex justify-center items-center gap-2 hover:shadow-orange-300 shadow-xl transition-all hover:scale-[1.02]"
                                    >
                                        <Zap size={24}/> TẠO NHANH HỒ SƠ KHÁCH HÀNG
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PHẦN HIỂN THỊ LỊCH SỬ CHI TIẾT (ĐÃ NÂNG CẤP) */}
                        {result.maintenanceHistory && result.maintenanceHistory.length > 0 && (
                            <div className="bg-slate-50 p-6 sm:p-8 rounded-[2rem] border border-slate-200 mt-8 shadow-inner">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight">
                                        <History size={24} className="text-blue-600"/> Lịch sử bảo dưỡng gần đây
                                    </h3>
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                        {result.maintenanceHistory.length} lần gần nhất
                                    </span>
                                </div>
                                
                                <div className="space-y-4">
                                    {result.maintenanceHistory.map((item, idx) => (
                                        <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all group">
                                            {/* Header của Lịch sử: Ngày, Mã, Tiền */}
                                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4 border-b border-slate-50 pb-4">
                                                <div className="flex items-center gap-4">
                                                    {/* Khối Hiển thị Ngày tháng xịn xò */}
                                                    <div className="bg-blue-50 text-blue-700 p-2 rounded-xl flex flex-col items-center justify-center min-w-[70px] group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        <span className="text-[10px] font-black uppercase">Tháng {new Date(item.createdAt || item.date).getMonth() + 1}</span>
                                                        <span className="text-2xl font-black leading-none my-0.5">{new Date(item.createdAt || item.date).getDate()}</span>
                                                        <span className="text-[10px] font-bold">{new Date(item.createdAt || item.date).getFullYear()}</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="font-black text-slate-800 text-lg tracking-tight leading-none">{item.orderCode}</p>
                                                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                            <Hash size={12}/> ODO: {item.currentOdometer?.toLocaleString() || "---"} KM
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng hóa đơn</p>
                                                    <p className="font-black text-blue-600 text-lg">
                                                        {item.finalAmount?.toLocaleString() || item.totalAmount?.toLocaleString() || "0"}đ
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Body của Lịch sử: Danh sách Dịch vụ & Phụ tùng */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 border-b pb-1">
                                                        <Wrench size={12}/> Dịch vụ
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {item.services?.map((s, i) => (
                                                            <span key={'s'+i} className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold">
                                                                {typeof s === 'string' ? s : s.serviceName}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 border-b pb-1">
                                                        <Package size={12}/> Phụ tùng
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {item.parts?.length > 0 ? item.parts.map((p, i) => (
                                                            <span key={'p'+i} className="bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-1 rounded-md text-xs font-bold">
                                                                {typeof p === 'string' ? p : p.partName}
                                                            </span>
                                                        )) : <span className="text-xs text-slate-400 italic font-medium">Không thay thế phụ tùng</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CỘT PHẢI: TRẠNG THÁI & LỊCH HẸN */}
                    <div className="lg:col-span-5">
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-full">
                            <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2 mb-6"><History/> Trạng thái hôm nay</h3>
                            
                            {result.activeAppointmentId ? (
                                <div className="bg-blue-50 p-6 rounded-2xl border-2 border-dashed border-blue-200 space-y-4">
                                    <div className="flex items-center gap-2 text-blue-700 font-black">
                                        <CalendarCheck/> CÓ LỊCH HẸN HÔM NAY
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Khách hàng đã đặt lịch trước trên hệ thống. Ưu tiên tiếp nhận và kiểm tra.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                    <History size={48} className="mb-2"/>
                                    <p className="font-bold uppercase tracking-widest text-xs mt-4">Không có lịch hẹn</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ====== MODAL TẠO NHANH ====== */}
            {showQuickModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 flex justify-between items-center text-white shrink-0">
                            <h3 className="font-black text-xl flex items-center gap-2"><Zap/> Tạo Hồ Sơ Nhanh</h3>
                            <button onClick={() => setShowQuickModal(false)} className="hover:text-gray-200"><X size={28}/></button>
                        </div>
                        
                        <form onSubmit={handleQuickOnboard} className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Biển số xe</label>
                                <input 
                                    type="text" 
                                    disabled 
                                    value={result.licensePlate} 
                                    className="w-full p-3.5 bg-gray-100 border border-gray-200 rounded-xl font-black text-xl text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Tên khách hàng <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    required
                                    autoFocus
                                    placeholder="Nhập tên khách hàng..." 
                                    className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none font-bold"
                                    value={quickData.name}
                                    onChange={e => setQuickData({...quickData, name: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Số điện thoại</label>
                                <input 
                                    type="tel" 
                                    placeholder="VD: 0987654321..." 
                                    className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none font-bold"
                                    value={quickData.phone}
                                    onChange={e => setQuickData({...quickData, phone: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Email liên hệ</label>
                                <input 
                                    type="email" 
                                    placeholder="Nhập email nếu có..." 
                                    className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none font-bold"
                                    value={quickData.email}
                                    onChange={e => setQuickData({...quickData, email: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Địa chỉ</label>
                                <input 
                                    type="text" 
                                    placeholder="Nhập địa chỉ khách hàng..." 
                                    className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none font-bold"
                                    value={quickData.address}
                                    onChange={e => setQuickData({...quickData, address: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={quickLoading}
                                className="w-full bg-orange-600 text-white p-4 rounded-xl font-black text-lg hover:bg-orange-700 active:scale-95 transition-all mt-6 shrink-0"
                            >
                                {quickLoading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN TẠO NHANH"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}} />
        </div>
    );
}