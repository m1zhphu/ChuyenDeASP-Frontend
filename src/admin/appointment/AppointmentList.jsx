import React, { useState, useEffect, useCallback, useRef } from "react";
import appointmentApi from "../../api/appointmentApi";
import customerApi from "../../api/customerApi";
import { 
    Calendar as CalendarIcon, Clock, CheckCircle, XCircle, 
    User, Car, Search, PlusCircle, Filter, X, UserCheck, Wrench
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AppointmentList() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    
    // --- STATE CHO MODAL TẠO LỊCH ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        customerId: '', 
        vehicleId: null, 
        appointmentDate: '', 
        expectedServices: ''
    });

    // --- STATE TÌM KHÁCH HÀNG ---
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCustomerDisplay, setSelectedCustomerDisplay] = useState("");
    const searchTimeoutRef = useRef(null);

    // 1. Tải danh sách lịch hẹn
    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await appointmentApi.getAll(1, 100, statusFilter);
            // C# trả về { TotalRecords, Data }
            setAppointments(res.data || []); 
        } catch (err) { 
            console.error("Lỗi tải lịch hẹn:", err); 
        } finally { 
            setLoading(false); 
        }
    }, [statusFilter]);

    useEffect(() => { 
        fetchAppointments(); 
    }, [fetchAppointments]);

    // 2. Xử lý cập nhật trạng thái
    const handleUpdateStatus = async (app, newStatus) => {
        const labels = { 'Confirmed': 'Xác nhận', 'Cancelled': 'Hủy', 'Arrived': 'Khách đã đến' };
        if (!window.confirm(`Chuyển trạng thái lịch sang: ${labels[newStatus]}?`)) return;
        
        try {
            await appointmentApi.updateStatus(app.id, newStatus);
            
            // LOGIC THÔNG MINH KHI XE ĐÃ ĐẾN
            if (newStatus === 'Arrived') {
                alert("✅ Đã cập nhật! Chuyển hướng đến trang Lập phiếu sửa chữa...");
                // Tự động nhảy sang trang Lập phiếu và truyền theo dữ liệu
                navigate('/admin/repair-orders', { 
                    state: { 
                        licensePlate: app.licensePlate,
                        expectedServices: app.expectedServices // Mang theo yêu cầu của khách
                    } 
                });
            } else {
                alert("✅ Đã cập nhật trạng thái!");
                fetchAppointments(); // Reload lại danh sách
            }
        } catch (err) {
            console.error(err)
            alert("❌ Lỗi khi cập nhật!");
        }
    };

    // 3. Xử lý tìm và chọn khách hàng
    const handleSearchCustomer = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (!val.trim()) { setSearchResults([]); return; }

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const results = await customerApi.search(val);
                setSearchResults(results);
            } catch (error) { console.error(error); }
        }, 500);
    };

    const selectCustomer = (customer) => {
        setFormData({ ...formData, customerId: customer.id });
        setSelectedCustomerDisplay(`${customer.fullName} - ${customer.phoneNumber}`);
        setSearchResults([]);
        setSearchTerm("");
    };

    // 4. Gửi form đặt lịch
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.customerId) return alert("Vui lòng chọn khách hàng!");

        try {
            const res = await appointmentApi.create(formData);
            // Kiểm tra property success trả về từ Service
            if (res.success === false) return alert("⚠️ " + res.message);
            
            alert("✅ Đặt lịch hẹn thành công!");
            setIsModalOpen(false);
            resetForm();
            fetchAppointments();
        } catch (err) {
            console.error(err);
            alert("❌ Lỗi hệ thống: " + (err.response?.data?.message || "Không thể đặt lịch"));
        }
    };

    const resetForm = () => {
        setFormData({ customerId: '', vehicleId: null, appointmentDate: '', expectedServices: '' });
        setSelectedCustomerDisplay("");
        setSearchTerm("");
        setSearchResults([]);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Arrived': return 'bg-green-100 text-green-700 border-green-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-2">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <CalendarIcon size={32} className="text-blue-600" /> Quản lý Lịch Hẹn
                </h1>
                <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                >
                    <PlusCircle size={20} /> Đặt lịch mới
                </button>
            </div>

            {/* BỘ LỌC TRẠNG THÁI */}
            <div className="flex flex-wrap gap-3 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 items-center">
                <div className="flex items-center gap-2 text-gray-500 font-bold text-sm uppercase mr-2">
                    <Filter size={16}/> Lọc:
                </div>
                {['', 'Pending', 'Confirmed', 'Arrived', 'Cancelled'].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)} 
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${statusFilter === s ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-50 text-gray-500 hover:bg-gray-200'}`}>
                        {s || 'Tất cả lịch'}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-20 text-gray-400 font-medium">Đang tải lịch hẹn...</div>
                ) : appointments.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed text-gray-400">Không tìm thấy lịch hẹn nào.</div>
                ) : (
                    appointments.map(app => (
                        <div key={app.id} className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
                            <div className={`p-3 text-center text-[10px] font-black uppercase tracking-widest border-b ${getStatusStyle(app.status)}`}>
                                {app.status}
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="font-black text-xl text-gray-800">{app.customerName}</h3>
                                        <p className="text-sm font-bold text-blue-600 flex items-center gap-1"><Clock size={14}/> {app.customerPhone}</p>
                                    </div>
                                    <div className="bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-200 font-black text-yellow-700 text-sm shadow-sm">
                                        {app.licensePlate}
                                    </div>
                                </div>
                                
                                <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-2xl">
                                    <div className="flex items-center gap-3 font-bold">
                                        <CalendarIcon size={16} className="text-gray-400"/> 
                                        {new Date(app.appointmentDate).toLocaleString('vi-VN')}
                                    </div>
                                    <div className="flex items-start gap-3 italic leading-relaxed">
                                        <Wrench size={16} className="text-gray-400 mt-1 shrink-0"/> 
                                        {app.expectedServices || "Kiểm tra tổng quát"}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    {app.status === 'Pending' && (
                                        <button onClick={() => handleUpdateStatus(app, 'Confirmed')} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">XÁC NHẬN</button>
                                    )}
                                    {app.status === 'Confirmed' && (
                                        <button onClick={() => handleUpdateStatus(app, 'Arrived')} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black text-sm hover:bg-green-700 shadow-lg shadow-green-100 transition-all">XE ĐÃ ĐẾN</button>
                                    )}
                                    {app.status !== 'Cancelled' && app.status !== 'Arrived' && (
                                        <button onClick={() => handleUpdateStatus(app, 'Cancelled')} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100" title="Hủy lịch">
                                            <XCircle size={24}/>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ================= MODAL ĐẶT LỊCH MỚI ================= */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-2xl font-black text-gray-800">Đặt Lịch Hẹn Mới</h2>
                            <button onClick={() => {setIsModalOpen(false); resetForm();}}><X size={24} className="text-gray-400 hover:text-red-500" /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* TÌM KHÁCH HÀNG */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Khách hàng đặt lịch *</label>
                                {selectedCustomerDisplay ? (
                                    <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl border-2 border-blue-100">
                                        <div className="flex items-center gap-3">
                                            <UserCheck className="text-blue-600" />
                                            <span className="font-black text-blue-800">{selectedCustomerDisplay}</span>
                                        </div>
                                        <button type="button" onClick={() => {setFormData({...formData, customerId: ''}); setSelectedCustomerDisplay("");}} className="text-red-500 font-bold text-xs hover:underline">Thay đổi</button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Tìm tên hoặc SĐT..." 
                                            className="w-full p-4 pl-12 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                            value={searchTerm}
                                            onChange={handleSearchCustomer}
                                        />
                                        {searchResults.length > 0 && (
                                            <ul className="absolute z-50 w-full bg-white border rounded-2xl shadow-2xl mt-2 max-h-48 overflow-y-auto">
                                                {searchResults.map(c => (
                                                    <li key={c.id} onClick={() => selectCustomer(c)} className="p-4 hover:bg-blue-50 cursor-pointer border-b flex flex-col transition-colors">
                                                        <span className="font-black text-gray-800">{c.fullName}</span>
                                                        <span className="text-xs text-gray-500 font-bold">📞 {c.phoneNumber}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Ngày & Giờ hẹn *</label>
                                <input 
                                    required 
                                    type="datetime-local" 
                                    className="w-full p-4 bg-gray-100 rounded-2xl font-black outline-none focus:ring-2 focus:ring-blue-500" 
                                    value={formData.appointmentDate}
                                    onChange={e => setFormData({...formData, appointmentDate: e.target.value})} 
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Dịch vụ yêu cầu</label>
                                <textarea 
                                    placeholder="Ví dụ: Thay nhớt, kiểm tra phanh..." 
                                    className="w-full p-4 bg-gray-100 rounded-2xl h-28 outline-none focus:ring-2 focus:ring-blue-500 font-medium italic"
                                    value={formData.expectedServices}
                                    onChange={e => setFormData({...formData, expectedServices: e.target.value})} 
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => {setIsModalOpen(false); resetForm();}} 
                                    className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-colors"
                                >
                                    HỦY BỎ
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                                >
                                    XÁC NHẬN ĐẶT LỊCH
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}