import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ShieldCheck, Zap, Star, Wrench, CheckCircle, ArrowRight, CarFront, Clock, Settings, ChevronRight, QrCode } from 'lucide-react';
// IMPORT SERVICE API (Bạn nhớ kiểm tra lại đường dẫn import cho đúng nhé)
import serviceApi from '../api/serviceApi'; 
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";

export default function HomePage() {
    const navigate = useNavigate();
    
    // Khai báo State để lưu danh sách dịch vụ từ Backend
    const [services, setServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(true);

    // Cuộn lên đầu trang và gọi API khi trang vừa load
    useEffect(() => {
        window.scrollTo(0, 0);
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoadingServices(true);
            // Gọi API lấy danh sách dịch vụ (Giả sử bạn có hàm getAll hoặc lấy tất cả không phân trang)
            const res = await serviceApi.getAll(); 
            
            // Xử lý dữ liệu trả về: Lọc ra các dịch vụ đang hoạt động (IsActive)
            // Lưu ý: Cấu trúc res có thể là res.data tùy thuộc vào cách bạn viết axiosClient
            const dataList = res.data || res;
            
            if (Array.isArray(dataList)) {
                const activeServices = dataList.filter(s => s.isActive !== false);
                setServices(activeServices);
            }
        } catch (error) {
            console.error("Lỗi khi tải bảng giá dịch vụ:", error);
        } finally {
            setLoadingServices(false);
        }
    };
    const handleUploadQR = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const html5QrCode = new Html5Qrcode("qr-reader-silent"); // Vùng ẩn để xử lý
        html5QrCode.scanFile(file, true)
            .then(decodedText => {
                // Giả sử link là: http://localhost:5173/tra-cuu/74D140760
                // Chúng ta sẽ lấy phần path và điều hướng
                const url = new URL(decodedText);
                navigate(url.pathname);
            })
            .catch(err => {
                alert("Không tìm thấy mã QR hợp lệ trong ảnh!");
                console.error(err);
            });
    };

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-300 selection:bg-blue-500/30 overflow-x-hidden">
            
            {/* ====== NAVBAR ====== */}
            <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="bg-blue-600 p-2 rounded-xl">
                            <CarFront className="text-white" size={28} />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight">Smart<span className="text-blue-500">Garage</span></span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 font-bold text-sm">
                        <a href="#ve-chung-toi" className="hover:text-white transition-colors">Về chúng tôi</a>
                        <a href="#dich-vu" className="hover:text-white transition-colors">Bảng giá Dịch vụ</a>
                        <button 
                            onClick={() => navigate('/dat-lich')}
                            className="bg-white text-slate-900 px-6 py-2.5 rounded-full hover:bg-blue-50 transition-colors flex items-center gap-2"
                        >
                            <Calendar size={18}/> Đặt lịch ngay
                        </button>
                    </div>
                </div>
            </nav>

            {/* ====== HERO SECTION ====== */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-bold text-blue-400 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Zap size={16}/> Tích hợp AI Nhận Diện Biển Số Tiên Tiến
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
                        Định nghĩa lại cách <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Chăm sóc Xế yêu.</span>
                    </h1>
                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        Không phải chờ đợi. Không mập mờ giá cả. Smart Garage mang đến trải nghiệm bảo dưỡng ô tô hoàn toàn tự động, minh bạch và chuyên nghiệp chuẩn 5 sao.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
                        <button 
                            onClick={() => navigate('/dat-lich')}
                            className="w-full sm:w-auto bg-blue-600 text-white font-black text-lg px-10 py-5 rounded-2xl hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            ĐẶT LỊCH HẸN ƯU TIÊN <ArrowRight size={20}/>
                        </button>
                        <a href="#dich-vu" className="w-full sm:w-auto bg-white/5 text-white font-bold text-lg px-10 py-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-center">
                            Xem Bảng Giá
                        </a>
                    </div>
                </div>
            </section>

            {/* ====== TÍNH NĂNG NỔI BẬT ====== */}
            <section id="ve-chung-toi" className="py-24 bg-slate-900/50 border-y border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">Tại sao chọn Smart Garage?</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Chúng tôi ứng dụng hệ thống ERP và Trí tuệ nhân tạo (AI) vào quản lý, giúp tối ưu hóa 100% quy trình phục vụ bạn.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-slate-950 p-8 rounded-3xl border border-white/5 hover:border-blue-500/50 transition-colors group">
                            <div className="bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="text-blue-500" size={32}/>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Nhận diện AI 3 Giây</h3>
                            <p className="text-slate-400 leading-relaxed">Hệ thống Camera YOLO tự động nhận diện biển số xe ngay khi bạn vừa lăn bánh vào xưởng, lên hồ sơ trong tích tắc.</p>
                        </div>
                        <div className="bg-slate-950 p-8 rounded-3xl border border-white/5 hover:border-orange-500/50 transition-colors group">
                            <div className="bg-orange-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Clock className="text-orange-500" size={32}/>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Không Thời Gian Chờ</h3>
                            <p className="text-slate-400 leading-relaxed">Khách hàng đặt lịch trước luôn được ưu tiên giữ khoang sửa chữa. Đến là làm ngay, tiết kiệm tối đa thời gian vàng ngọc.</p>
                        </div>
                        <div className="bg-slate-950 p-8 rounded-3xl border border-white/5 hover:border-green-500/50 transition-colors group">
                            <div className="bg-green-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="text-green-500" size={32}/>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Minh Bạch Tuyệt Đối</h3>
                            <p className="text-slate-400 leading-relaxed">Chốt giá dịch vụ và phụ tùng trước khi tiến hành. Cập nhật tiến độ Real-time đến thiết bị di động của khách hàng.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ====== BẢNG GIÁ DỊCH VỤ (DATA TỪ DATABASE) ====== */}
            <section id="dich-vu" className="py-24 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">Dịch vụ & Bảng giá</h2>
                            <p className="text-slate-400 max-w-xl">Chi phí hợp lý, phụ tùng chính hãng 100%. Bảng giá được cập nhật trực tiếp từ hệ thống ERP của xưởng.</p>
                        </div>
                        <button 
                            onClick={() => navigate('/dat-lich')}
                            className="flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition-colors group"
                        >
                            Đặt lịch ngay <ChevronRight className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                    </div>

                    {/* HIỂN THỊ DANH SÁCH DỊCH VỤ TỪ API */}
                    {loadingServices ? (
                        <div className="text-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-slate-400 font-bold">Đang tải bảng giá hệ thống...</p>
                        </div>
                    ) : services.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 p-10 rounded-3xl text-center">
                            <p className="text-slate-400 font-bold text-lg">Hệ thống đang cập nhật bảng giá dịch vụ.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Hiển thị tối đa 6 dịch vụ tiêu biểu lên Landing Page cho đỡ dài */}
                            {services.slice(0, 8).map((svc) => (
                                <div key={svc.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex justify-between items-center hover:bg-white/10 transition-colors cursor-default group">
                                    <div className="space-y-1">
                                        <h4 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Settings size={20} className="text-blue-500 group-hover:rotate-90 transition-transform duration-500"/> 
                                            {svc.serviceName}
                                        </h4>
                                        <p className="text-slate-400 text-sm line-clamp-1">
                                            {svc.description || `Thời gian thực hiện dự kiến: ${svc.estimatedTime || '30 phút'}`}
                                        </p>
                                    </div>
                                    <div className="text-right pl-4 shrink-0">
                                        <span className="block text-xl font-black text-blue-400">
                                            {svc.price === 0 ? "Miễn phí" : `${svc.price.toLocaleString('vi-VN')}đ`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="mt-10 text-center">
                        <p className="text-sm text-slate-500 italic">* Bảng giá mang tính chất tham khảo. Kỹ thuật viên sẽ kiểm tra thực tế và báo giá chính xác qua hệ thống ERP trước khi thi công.</p>
                    </div>
                </div>
            </section>

            {/* ====== SECTION TEST QR (Dành cho Developer) ====== */}
            <section className="py-20 bg-slate-900 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                    <div className="inline-block p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400 font-bold text-sm">
                        🧪 PHÒNG THỬ NGHIỆM (TEST ONLY)
                    </div>
                    <h2 className="text-3xl font-black text-white">Kiểm tra Sổ bảo dưỡng qua ảnh QR</h2>
                    <p className="text-slate-400">Tải lên ảnh mã QR đã in trên hóa đơn để kiểm tra tính năng tra cứu lịch sử mà không cần dùng Camera điện thoại.</p>
                    
                    <div className="flex justify-center">
                        <label className="cursor-pointer group relative">
                            <div className="bg-white/5 border-2 border-dashed border-white/20 p-12 rounded-[2.5rem] group-hover:border-blue-500/50 group-hover:bg-white/10 transition-all flex flex-col items-center gap-4">
                                <QrCode size={48} className="text-blue-500" />
                                <span className="text-white font-bold">NHẤN ĐỂ CHỌN ẢNH QR</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleUploadQR} />
                            </div>
                        </label>
                    </div>
                    <div id="qr-reader-silent" className="hidden"></div> {/* Element ẩn để xử lý thư viện */}
                </div>
            </section>

            {/* ====== FOOTER ====== */}
            <footer className="bg-slate-950 border-t border-white/5 py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <CarFront className="text-blue-500" size={28} />
                            <span className="text-2xl font-black text-white tracking-tight">Smart<span className="text-blue-500">Garage</span></span>
                        </div>
                        <p className="text-slate-500 max-w-sm">Hệ thống xưởng dịch vụ ô tô tiên phong ứng dụng công nghệ AI và mô hình quản trị ERP thời gian thực.</p>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-bold mb-4">Liên Hệ</h4>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li>📍 Số 1 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức</li>
                            <li>📞 Hotline: 0987.654.321</li>
                            <li>✉️ Email: hi@smartgarage.vn</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-bold mb-4">Dành cho Nhân viên</h4>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li><button onClick={() => navigate('/admin/login')} className="hover:text-blue-400 transition-colors">Đăng nhập Quản trị (ERP)</button></li>
                            <li>Tài liệu hướng dẫn MAUI App</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center text-slate-600 text-sm">
                    &copy; {new Date().getFullYear()} Smart Garage. Xây dựng bởi Nguyễn Cửu Minh Phú.
                </div>
            </footer>
        </div>
    );
}