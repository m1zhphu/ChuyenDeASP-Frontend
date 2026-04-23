import React, { useState } from 'react';
import appointmentApi from '../api/appointmentApi'; 
// ĐÃ THÊM ICON Mail
import { Calendar, User, Phone, Car, Wrench, CheckCircle, ShieldCheck, Clock, PenTool, Mail } from 'lucide-react';

export default function PublicBooking() {
    const [formData, setFormData] = useState({
        customerName: '',
        phoneNumber: '',
        email: '', // <--- BỔ SUNG TRƯỜNG EMAIL VÀO STATE
        licensePlate: '',
        appointmentDate: '',
        expectedServices: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await appointmentApi.bookOnline(formData);
            if(res.success !== false) {
                setSuccess(true);
            } else {
                alert("Lỗi: " + res.message);
            }
        } catch (error) {
            alert("Không thể đặt lịch lúc này. " + (error.response?.data?.message || ""));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="max-w-lg w-full bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={60} className="text-green-400" />
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tight">Xác Nhận Thành Công!</h2>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-left space-y-3">
                        <p className="text-gray-300 text-lg">Khách hàng: <span className="font-bold text-white">{formData.customerName}</span></p>
                        <p className="text-gray-300 text-lg">Biển số xe: <span className="font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-lg">{formData.licensePlate.toUpperCase()}</span></p>
                        <p className="text-gray-300 text-lg">Thời gian: <span className="font-bold text-blue-400">{new Date(formData.appointmentDate).toLocaleString('vi-VN')}</span></p>
                    </div>
                    <p className="text-gray-400 leading-relaxed italic">
                        Smart Garage sẽ liên hệ với bạn qua SĐT <span className="font-bold text-white">{formData.phoneNumber}</span> trong ít phút để xác nhận.
                        {formData.email && <span className="block mt-2 text-green-400">Thông tin chi tiết đã được gửi đến email của bạn!</span>}
                    </p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black text-lg py-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 mt-4"
                    >
                        ĐẶT THÊM LỊCH MỚI
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row font-sans relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Phần Banner Trái */}
            <div className="lg:w-5/12 p-8 lg:p-16 flex flex-col justify-center relative z-10 border-r border-white/5">
                <div className="mb-12">
                    <span className="bg-blue-600 text-white text-xs font-black tracking-widest px-4 py-2 rounded-full uppercase">Smart Garage ERP</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-black mb-6 text-white leading-tight tracking-tight">
                    Chăm sóc<br/>Xế yêu<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Chuẩn 5 Sao.</span>
                </h1>
                <p className="text-xl text-gray-400 mb-10 leading-relaxed font-medium">
                    Hệ thống nhận diện thông minh, quy trình minh bạch, không mất thời gian chờ đợi.
                </p>
                
                <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="bg-blue-500/20 p-3 rounded-xl"><ShieldCheck className="text-blue-400" size={24}/></div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Phụ tùng chính hãng</h3>
                            <p className="text-gray-400 text-sm">Cam kết 100% xuất xứ rõ ràng</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="bg-orange-500/20 p-3 rounded-xl"><Clock className="text-orange-400" size={24}/></div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Tiết kiệm thời gian</h3>
                            <p className="text-gray-400 text-sm">Ưu tiên khoang sửa chữa khi đặt trước</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="bg-green-500/20 p-3 rounded-xl"><PenTool className="text-green-400" size={24}/></div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Báo giá minh bạch</h3>
                            <p className="text-gray-400 text-sm">Chốt giá trên hệ thống trước khi làm</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Phần Form Phải */}
            <div className="lg:w-7/12 p-6 lg:p-16 flex items-center justify-center relative z-10">
                <div className="w-full max-w-xl bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 opacity-20"><Calendar size={120}/></div>
                        <h2 className="text-3xl font-black text-white relative z-10">ĐẶT LỊCH HẸN NGAY</h2>
                        <p className="text-blue-200 mt-2 font-medium relative z-10">Vui lòng điền thông tin bên dưới</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Hàng 1: Tên & SĐT */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Họ và Tên <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                    <input required type="text" placeholder="Nguyễn Văn A" 
                                        className="w-full pl-12 p-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-blue-500 focus:bg-slate-800 outline-none transition-all font-medium"
                                        value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Số điện thoại <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                    <input required type="tel" placeholder="0987.xxx.xxx" 
                                        className="w-full pl-12 p-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-blue-500 focus:bg-slate-800 outline-none transition-all font-medium"
                                        value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        {/* Hàng 2: Email & Biển số */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email liên hệ</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                    <input type="email" placeholder="email@gmail.com" 
                                        className="w-full pl-12 p-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-blue-500 focus:bg-slate-800 outline-none transition-all font-medium"
                                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Biển số xe <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                    <input required type="text" placeholder="51G-12345" 
                                        className="w-full pl-12 p-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-blue-500 focus:bg-slate-800 outline-none transition-all font-bold uppercase"
                                        value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        {/* Hàng 3: Ngày giờ */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Ngày giờ tới xưởng <span className="text-red-500">*</span></label>
                            <input required type="datetime-local" 
                                className="w-full p-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white focus:border-blue-500 focus:bg-slate-800 outline-none transition-all font-medium"
                                value={formData.appointmentDate} onChange={e => setFormData({...formData, appointmentDate: e.target.value})} />
                        </div>

                        {/* Hàng 4: Ghi chú */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Tình trạng xe / Yêu cầu</label>
                            <div className="relative">
                                <Wrench className="absolute left-4 top-5 text-gray-400" size={20}/>
                                <textarea placeholder="Ví dụ: Xe bị xước xát mâm, cần thay nhớt..." 
                                    className="w-full pl-12 p-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-blue-500 focus:bg-slate-800 outline-none transition-all font-medium min-h-[120px] custom-scrollbar"
                                    value={formData.expectedServices} onChange={e => setFormData({...formData, expectedServices: e.target.value})} />
                            </div>
                        </div>

                        <button disabled={loading} type="submit" 
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black text-xl py-5 rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 mt-4 flex justify-center items-center gap-2"
                        >
                            {loading ? "ĐANG GỬI YÊU CẦU..." : "XÁC NHẬN ĐẶT LỊCH"}
                        </button>
                    </form>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
            `}} />
        </div>
    );
}