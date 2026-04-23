import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import repairOrderApi from '../api/repairOrderApi';
import { 
    Car, Calendar, User, Wrench, Package, ArrowLeft, 
    CheckCircle2, Clock, ShieldCheck, Activity, Receipt,
    QrCode, MapPin, BadgeCheck, DollarSign
} from 'lucide-react';

export default function VehicleHistory() {
    const { licensePlate } = useParams();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await repairOrderApi.getHistoryByPlate(licensePlate);
                setHistory(res.data || res);
            } catch (error) {
                console.error("Lỗi tải lịch sử:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [licensePlate]);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
                <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping"></div>
                <div className="relative bg-blue-600 p-4 rounded-full">
                    <Car size={32} className="text-white animate-bounce" />
                </div>
            </div>
            <p className="font-black text-blue-400 tracking-widest uppercase text-sm animate-pulse">Đang đồng bộ dữ liệu ERP...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans selection:bg-blue-500/30">
            {/* ====== HEADER ====== */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/')} 
                        className="bg-slate-100 hover:bg-slate-200 p-2.5 rounded-full transition-all text-slate-600 hover:text-blue-600 active:scale-95"
                    >
                        <ArrowLeft size={20}/>
                    </button>
                    <div className="text-center flex flex-col items-center">
                        <h1 className="text-lg font-black text-slate-800 tracking-tight">SỔ BẢO DƯỠNG SỐ</h1>
                        <div className="flex items-center gap-1 text-[9px] font-black text-blue-600 tracking-widest uppercase">
                            <ShieldCheck size={10}/> Smart Garage ERP
                        </div>
                    </div>
                    <div className="w-10"></div> {/* Spacer */}
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 pt-6 space-y-8">
                {/* ====== THE VEHICLE PASSPORT CARD ====== */}
                <div className="bg-slate-900 rounded-[2rem] p-1 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <QrCode size={150} />
                    </div>
                    
                    <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-[1.8rem] p-8 border border-white/10 relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-blue-500/20 text-blue-400 p-3 rounded-2xl border border-blue-500/30">
                                <Car size={32} />
                            </div>
                            <span className="flex items-center gap-1.5 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/30">
                                <BadgeCheck size={14}/> Đã xác thực
                            </span>
                        </div>
                        
                        <div className="space-y-1 mb-8">
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Biển số đăng ký</p>
                            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter drop-shadow-md font-mono">
                                {licensePlate.toUpperCase()}
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Activity size={12}/> Tình trạng</span>
                                <span className="text-slate-200 font-bold text-sm">Hoạt động tốt</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><MapPin size={12}/> Nơi quản lý</span>
                                <span className="text-slate-200 font-bold text-sm">Smart Garage VN</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ====== TIMELINE LỊCH SỬ ====== */}
                <div className="space-y-6">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 px-2 uppercase tracking-tight">
                        <Clock className="text-blue-600" size={24}/> Dòng thời gian bảo dưỡng
                    </h3>

                    {history.length === 0 ? (
                        <div className="bg-white p-12 rounded-[2rem] border-2 border-dashed border-slate-200 text-center space-y-4 shadow-sm">
                            <Receipt size={48} className="mx-auto text-slate-300"/>
                            <div>
                                <p className="text-slate-800 font-black text-lg">Chưa có dữ liệu</p>
                                <p className="text-slate-500 text-sm font-medium mt-1">Hệ thống chưa ghi nhận lần sửa chữa nào cho xe này.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative before:absolute before:left-[23px] sm:before:left-[27px] before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-blue-600 before:to-slate-200 before:rounded-full space-y-8">
                            {history.map((order, idx) => {
                                // Xử lý Dữ liệu Ngày tháng & Tiền
                                const dateObj = new Date(order.createdAt || order.date);
                                const totalAmount = order.finalAmount || order.totalAmount || 0;

                                return (
                                    <div key={order.orderCode} className="relative pl-16 sm:pl-20 animate-in slide-in-from-bottom-8 duration-700 fade-in" style={{ animationDelay: `${idx * 150}ms` }}>
                                        
                                        {/* TIMELINE DOT */}
                                        <div className="absolute left-0 sm:left-1 top-4 w-12 h-12 bg-white border-4 border-blue-600 rounded-full flex items-center justify-center z-10 shadow-lg shadow-blue-600/20">
                                            <CheckCircle2 size={24} className="text-blue-600 font-black"/>
                                        </div>

                                        {/* RECORD CARD */}
                                        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden group hover:border-blue-300 transition-colors">
                                            
                                            {/* HEADER CARD: Hiển thị Ngày dạng Block và Tổng tiền */}
                                            <div className="bg-slate-50/80 p-4 sm:p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
                                                <div className="flex items-center gap-4">
                                                    {/* Block Ngày Tháng */}
                                                    <div className="bg-blue-600 text-white p-2 rounded-xl flex flex-col items-center justify-center min-w-[70px] shadow-md shadow-blue-200">
                                                        <span className="text-[10px] font-black uppercase">Tháng {dateObj.getMonth() + 1}</span>
                                                        <span className="text-2xl font-black leading-none my-0.5">{dateObj.getDate()}</span>
                                                        <span className="text-[10px] font-bold text-blue-200">{dateObj.getFullYear()}</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã Phiếu</p>
                                                        <span className="font-black text-slate-800 text-lg font-mono tracking-tight">{order.orderCode}</span>
                                                    </div>
                                                </div>

                                                {/* Khối hiển thị Tổng tiền */}
                                                <div className="text-right bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm self-start sm:self-auto ml-auto">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Tổng thanh toán</p>
                                                    <p className="font-black text-blue-600 text-xl flex items-center justify-end gap-0.5">
                                                        {totalAmount.toLocaleString()} <span className="text-sm">đ</span>
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* BODY CARD: Chi tiết dịch vụ & phụ tùng */}
                                            <div className="p-5 sm:p-6 space-y-6">
                                                {/* Section Dịch vụ */}
                                                {order.services && order.services.length > 0 && (
                                                    <div className="space-y-3">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b pb-2">
                                                            <Wrench size={14} className="text-blue-500"/> Dịch vụ thực hiện
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {order.services.map((s, i) => (
                                                                <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-blue-100 shadow-sm">
                                                                    {typeof s === 'string' ? s : s.serviceName}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Section Phụ tùng */}
                                                {order.parts && order.parts.length > 0 && (
                                                    <div className="space-y-3">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b pb-2">
                                                            <Package size={14} className="text-orange-500"/> Vật tư & Phụ tùng
                                                        </p>
                                                        <ul className="grid grid-cols-1 gap-2">
                                                            {order.parts.map((p, i) => (
                                                                <li key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                                    <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full bg-orange-400"></div> {typeof p === 'string' ? p : p.partName}
                                                                    </span>
                                                                    <span className="text-xs font-black text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                                                                        x{p.quantity || 1}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {/* FOOTER CARD */}
                                            <div className="bg-slate-900 p-5 sm:p-6 flex justify-between items-center mt-2">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chỉ số ODO</p>
                                                    <p className="font-black text-white text-xl flex items-end gap-1">
                                                        {order.currentOdometer?.toLocaleString() || "---"} <span className="text-xs text-blue-400 mb-1">KM</span>
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/30">
                                                        <CheckCircle2 size={12}/> Hoàn tất
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            
            {/* FOOTER */}
            <div className="max-w-3xl mx-auto mt-16 text-center px-6">
                <div className="inline-flex items-center gap-2 bg-white py-2 px-4 rounded-full border border-slate-200 shadow-sm mb-4">
                    <ShieldCheck size={16} className="text-blue-600"/>
                    <span className="text-xs font-black text-slate-700 tracking-tight">Dữ liệu được bảo mật bởi Smart Garage ERP</span>
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                    © {new Date().getFullYear()} Smart Garage. Phiếu bảo dưỡng điện tử có giá trị tương đương phiếu giấy trong hệ thống của chúng tôi.
                </p>
            </div>
        </div>
    );
}