import React, { useState, useEffect, useCallback, useRef } from "react";
import repairOrderApi from "../../api/repairOrderApi";
import vehicleApi from "../../api/vehicleApi";
import serviceApi from "../../api/serviceApi";
import partApi from "../../api/partApi";
import userApi from "../../api/userApi";
import { 
    FileText, Search, PlusCircle, CreditCard, Eye, X, Car, 
    Wrench, Trash2, User, Calendar, CheckCircle, Package, 
    Info, Hash, ShieldCheck, QrCode, ArrowRight, Printer,
    Settings
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { QRCodeSVG } from 'qrcode.react';

export default function RepairOrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState("");
    
    const [availableServices, setAvailableServices] = useState([]);
    const [availableParts, setAvailableParts] = useState([]);
    const [technicians, setTechnicians] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); 
    const [orderDetailData, setOrderDetailData] = useState(null); 
    
    const [formData, setFormData] = useState({
        licensePlate: '', currentOdometer: 0, expectedDeliveryTime: '', 
        discountAmount: 0, taxAmount: 0, note: ''
    });

    const [selectedServices, setSelectedServices] = useState([]); 
    const [selectedParts, setSelectedParts] = useState([]);       

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const searchTimeoutRef = useRef(null);
    const location = useLocation();

    // ================= LOGIC GIỮ NGUYÊN =================
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await repairOrderApi.getAll();
            const filtered = keyword.trim() 
                ? res.filter(o => o.orderCode?.toLowerCase().includes(keyword.toLowerCase()) || o.licensePlate?.toLowerCase().includes(keyword.toLowerCase())) 
                : res;
            setOrders(filtered);
        } catch (err) { console.error("Lỗi:", err); } 
        finally { setLoading(false); }
    }, [keyword]);

    useEffect(() => { 
        fetchOrders(); 
        serviceApi.getAll().then(setAvailableServices).catch(console.error);
        partApi.getAll().then(setAvailableParts).catch(console.error);
        
        userApi.getAll().then(res => {
            const usersList = res.data || res.Data || res;
            const techs = usersList.filter(u => u.role === 'Technician' || u.role === 'TECHNICIAN');
            setTechnicians(techs);
        }).catch(console.error);

        if (location.state) {
            if (location.state.searchPlate) setKeyword(location.state.searchPlate);
            if (location.state.licensePlate) {
                setFormData(prev => ({ 
                    ...prev, 
                    licensePlate: location.state.licensePlate || prev.licensePlate,
                    note: location.state.expectedServices || prev.note 
                }));
                setIsModalOpen(true);
            }
            window.history.replaceState({}, document.title);
        }
    }, [fetchOrders, location.state]);

    const openModal = () => {
        setFormData({ licensePlate: '', currentOdometer: 0, expectedDeliveryTime: '', discountAmount: 0, taxAmount: 0, note: '' });
        setSelectedServices([]); setSelectedParts([]); setSearchTerm(""); setSearchResults([]);
        setIsModalOpen(true);
    };

    const handleViewDetails = async (orderCode) => {
        try {
            const data = await repairOrderApi.getByCode(orderCode);
            setOrderDetailData(data);
            setIsDetailModalOpen(true);
        } catch (error) {
            console.error(error);
            alert("Không thể tải chi tiết hóa đơn!");
        }
    };

    const handleSearchVehicle = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (!val.trim()) { setSearchResults([]); return; }
        searchTimeoutRef.current = setTimeout(async () => {
            try { setSearchResults(await vehicleApi.search(val)); } catch (error) { console.error(error); }
        }, 500);
    };

    const addService = (e) => {
        const sId = e.target.value;
        const service = availableServices.find(s => s.id === sId);
        if (service && !selectedServices.find(s => s.id === sId)) {
            setSelectedServices([...selectedServices, { 
                id: service.id, 
                name: service.serviceName, 
                price: service.price,
                mechanicId: '' 
            }]);
        }
        e.target.value = ""; 
    };

    const updateServiceMechanic = (index, mechanicId) => {
        const newServices = [...selectedServices];
        newServices[index].mechanicId = mechanicId;
        setSelectedServices(newServices);
    };

    const addPart = (e) => {
        const pId = e.target.value;
        const part = availableParts.find(p => p.id === pId);
        if (part && !selectedParts.find(p => p.id === pId)) setSelectedParts([...selectedParts, { id: part.id, name: part.partName, price: part.unitPrice, quantity: 1, discountPercent: 0, note: '' }]);
        e.target.value = ""; 
    };

    const updatePart = (index, field, value) => {
        const newParts = [...selectedParts];
        newParts[index][field] = value;
        setSelectedParts(newParts);
    };

    const calculateTotal = () => {
        const servicesTotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
        const partsTotal = selectedParts.reduce((sum, p) => sum + (p.price * p.quantity * (1 - p.discountPercent / 100)), 0);
        const rawTotal = servicesTotal + partsTotal;
        return { rawTotal, finalTotal: rawTotal - Number(formData.discountAmount || 0) + Number(formData.taxAmount || 0) };
    };
    const totals = calculateTotal();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.licensePlate) return alert("Vui lòng tìm và chọn Biển số xe!");
        const payload = {
            licensePlate: formData.licensePlate, 
            currentOdometer: Number(formData.currentOdometer),
            advisorId: "00000000-0000-0000-0000-000000000000", 
            expectedDeliveryTime: formData.expectedDeliveryTime ? new Date(formData.expectedDeliveryTime).toISOString() : null,
            discountAmount: Number(formData.discountAmount), 
            taxAmount: Number(formData.taxAmount), 
            note: formData.note,
            serviceIds: selectedServices.map(s => ({ serviceId: s.id, mechanicId: s.mechanicId || null })),
            selectedParts: selectedParts.map(p => ({ partId: p.id, quantity: Number(p.quantity), note: p.note, discountPercent: Number(p.discountPercent) }))
        };
        try {
            const res = await repairOrderApi.create(payload);
            if (res.data?.success === false || res.success === false) return alert("⚠️ THẤT BẠI: " + (res.data?.message || res.message));
            alert("✅ Tạo lệnh và giao việc thành công!");
            setIsModalOpen(false); fetchOrders();
        } catch (err) { console.error(err); alert("Lỗi khi tạo lệnh!"); }
    };

    const handlePay = async (orderCode) => {
        if (!window.confirm(`Xác nhận thanh toán cho lệnh ${orderCode}?`)) return;
        try {
            await repairOrderApi.pay({ orderCode: orderCode, amountPaid: 0, paymentMethod: "Cash" });
            alert("Thanh toán thành công!");
            fetchOrders();
        } catch (err) { console.error(err); alert("Lỗi thanh toán!"); }
    };

    // ================= GIAO DIỆN MỚI =================
    return (
        <div className="p-4 space-y-6">
            {/* TIÊU ĐỀ & NÚT TẠO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <FileText size={36} className="text-blue-600" /> QUẢN LÝ LỆNH SỬA CHỮA
                    </h1>
                    <p className="text-slate-500 font-medium">Theo dõi, điều phối và thanh toán lệnh sửa chữa</p>
                </div>
                <button 
                    onClick={openModal} 
                    className="group bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center gap-3"
                >
                    <PlusCircle size={24} className="group-hover:rotate-90 transition-transform duration-300" /> TẠO LỆNH MỚI
                </button>
            </div>

            {/* THANH TÌM KIẾM */}
            <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 flex items-center px-8 gap-4 group focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                <Search size={24} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Tìm theo mã lệnh hoặc biển số xe..." 
                    className="w-full py-2 outline-none text-lg font-bold text-slate-700 placeholder-slate-400 uppercase" 
                    value={keyword} 
                    onChange={(e) => setKeyword(e.target.value)} 
                />
                {keyword && <button onClick={() => setKeyword("")} className="text-slate-300 hover:text-slate-600"><X size={20}/></button>}
            </div>

            {/* BẢNG DANH SÁCH LỆNH */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b">
                                <th className="p-6 text-slate-500 font-black uppercase text-[10px] tracking-widest">Mã Lệnh</th>
                                <th className="p-6 text-slate-500 font-black uppercase text-[10px] tracking-widest">Khách hàng</th>
                                <th className="p-6 text-slate-500 font-black uppercase text-[10px] tracking-widest">Biển số</th>
                                <th className="p-6 text-slate-500 font-black uppercase text-[10px] tracking-widest text-right">Tổng tiền</th>
                                <th className="p-6 text-slate-500 font-black uppercase text-[10px] tracking-widest text-center">Trạng thái</th>
                                <th className="p-6 text-slate-500 font-black uppercase text-[10px] tracking-widest text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center p-20 text-slate-400 font-bold">Đang tải dữ liệu...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan="6" className="text-center p-20 text-slate-400 font-bold italic">Không tìm thấy lệnh sửa chữa phù hợp.</td></tr>
                            ) : (
                                orders.map(o => (
                                    <tr key={o.id || o.orderCode} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-6 font-black text-blue-600">{o.orderCode}</td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">{o.customerName}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">VIP Customer</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="bg-slate-900 text-white font-black px-4 py-2 rounded-xl text-sm tracking-widest border-b-4 border-slate-700">
                                                {o.licensePlate}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <span className="font-black text-xl text-slate-800">
                                                {(o.finalAmount || o.totalAmount).toLocaleString()}đ
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-wider ${o.isPaid || o.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600 shadow-sm'}`}>
                                                <div className={`w-2 h-2 rounded-full animate-pulse ${o.isPaid || o.status === 'Completed' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                                                {o.isPaid || o.status === 'Completed' ? 'Hoàn thành' : 'Đang xử lý'}
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex justify-center gap-3">
                                                <button onClick={() => handleViewDetails(o.orderCode)} className="p-3 bg-blue-100 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Xem chi tiết"><Eye size={20} /></button>
                                                {!o.isPaid && o.status !== 'Completed' && (
                                                    <button onClick={() => handlePay(o.orderCode)} className="p-3 bg-green-100 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Thanh toán"><CreditCard size={20} /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL CHI TIẾT (QR PASSPORT) */}
            {isDetailModalOpen && orderDetailData && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden my-auto">
                        <div className="bg-slate-900 p-8 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="absolute right-0 top-0 opacity-10 rotate-12"><FileText size={180}/></div>
                            <div className="relative z-10 space-y-1">
                                <h2 className="text-3xl font-black tracking-tight uppercase">Chi tiết Lệnh: {orderDetailData.orderCode}</h2>
                                <p className="text-slate-400 font-bold flex items-center gap-2"><Calendar size={16}/> Khởi tạo: {new Date(orderDetailData.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} className="relative z-10 bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-colors"><X size={32}/></button>
                        </div>
                        
                        <div className="p-10 space-y-10 overflow-y-auto">
                            {/* KHÁCH & XE CARDS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><User size={16}/> Khách hàng</h4>
                                    <div className="space-y-1">
                                        <p className="text-2xl font-black text-slate-800">{orderDetailData.customerName}</p>
                                        <p className="text-blue-600 font-bold">{orderDetailData.phoneNumber}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Car size={16}/> Phương tiện</h4>
                                    <div className="space-y-2">
                                        <p className="text-2xl font-black text-slate-800">{orderDetailData.vehicleInfo}</p>
                                        <span className="inline-block bg-slate-900 text-white px-3 py-1 rounded-lg font-black text-sm">{orderDetailData.licensePlate}</span>
                                    </div>
                                </div>
                            </div>

                            {/* DỊCH VỤ & PHỤ TÙNG */}
                            <div className="space-y-6">
                                <h4 className="text-xl font-black text-slate-800 flex items-center gap-2"><Wrench className="text-blue-600"/> DANH MỤC CÔNG VIỆC</h4>
                                <div className="rounded-[2rem] border border-slate-100 overflow-hidden bg-white">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 border-b">
                                            <tr>
                                                <th className="p-5 font-black text-[10px] uppercase text-slate-400">Hạng mục chi tiết</th>
                                                <th className="p-5 font-black text-[10px] uppercase text-slate-400 text-right">Đơn giá</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                                            {orderDetailData.services?.map((s, i) => (
                                                <tr key={'s'+i} className="hover:bg-slate-50/50">
                                                    <td className="p-5 flex items-center gap-3"><Settings className="text-blue-500" size={16}/> {s.serviceName}</td>
                                                    <td className="p-5 text-right">{s.actualPrice?.toLocaleString()}đ</td>
                                                </tr>
                                            ))}
                                            {orderDetailData.parts?.map((p, i) => (
                                                <tr key={'p'+i} className="hover:bg-slate-50/50">
                                                    <td className="p-5 flex items-center gap-3"><Package className="text-orange-500" size={16}/> {p.partName} <span className="text-slate-400 ml-2">x{p.quantity}</span></td>
                                                    <td className="p-5 text-right">{((p.actualPrice * p.quantity) * (1 - p.discountPercent / 100)).toLocaleString()}đ</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* QR & TOTALS (SMART VERIFIED) */}
                            <div className="flex flex-col lg:flex-row gap-8 items-stretch justify-between pt-8 border-t">
                                <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed border-slate-200 lg:w-1/2">
                                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                                        <QRCodeSVG 
                                            value={`${window.location.origin}/tra-cuu/${orderDetailData.licensePlate}`} 
                                            size={110}
                                            level={"H"}
                                            includeMargin={true}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <h5 className="font-black text-slate-800 text-lg flex items-center gap-2"><QrCode size={20} className="text-blue-600"/> SỔ BẢO DƯỠNG</h5>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed italic">Quét mã để tra cứu toàn bộ lịch sử chăm sóc xe của khách hàng.</p>
                                        <div className="flex items-center gap-2 pt-1">
                                            <ShieldCheck size={16} className="text-green-500"/>
                                            <span className="bg-green-100 text-green-700 text-[9px] px-3 py-1 rounded-full font-black tracking-widest uppercase">Verified by SmartGarage</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:w-1/3 bg-blue-600 p-8 rounded-[2rem] shadow-2xl shadow-blue-200 flex flex-col justify-center text-white relative overflow-hidden">
                                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10"><CreditCard size={100}/></div>
                                    <div className="relative z-10 space-y-1">
                                        <p className="text-blue-100 font-bold text-xs uppercase tracking-widest">Số tiền phải thu</p>
                                        <p className="text-4xl font-black tabular-nums">{orderDetailData.finalAmount?.toLocaleString()}đ</p>
                                    </div>
                                    <div className="relative z-10 pt-4 flex gap-2">
                                        <button className="flex-1 bg-white/20 hover:bg-white/30 p-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2"><Printer size={14}/> In Phiếu</button>
                                        <button className="flex-1 bg-white/20 hover:bg-white/30 p-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2">Chia sẻ <ArrowRight size={14}/></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL TẠO LỆNH (GIAO DIỆN HIỆN ĐẠI) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-7xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <div className="p-8 border-b flex justify-between items-center bg-slate-50">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3"><PlusCircle size={32} className="text-blue-600"/> TẠO LỆNH SỬA CHỮA & GIAO VIỆC</h2>
                                <p className="text-slate-500 font-bold text-sm">Hệ thống phân phối công việc thợ máy thông minh</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="bg-white hover:bg-red-50 p-3 rounded-2xl border transition-all text-slate-400 hover:text-red-500 shadow-sm"><X size={32} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 flex flex-col lg:grid lg:grid-cols-12 gap-10">
                            {/* CỘT TRÁI: THÔNG TIN TIẾP NHẬN */}
                            <div className="lg:col-span-4 space-y-8">
                                <div className="space-y-6">
                                    <h3 className="font-black text-blue-600 flex items-center gap-3 text-lg border-b-2 border-blue-50 pb-2"><Car size={24} /> THÔNG TIN TIẾP NHẬN</h3>
                                    
                                    <div className="relative group">
                                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Tìm biển số xe <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" size={20}/>
                                            <input 
                                                type="text" 
                                                placeholder="Nhập biển số xe..." 
                                                className="w-full p-4 pl-12 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-black text-xl uppercase tracking-widest transition-all" 
                                                value={formData.licensePlate || searchTerm} 
                                                onChange={handleSearchVehicle} 
                                            />
                                        </div>
                                        {searchResults.length > 0 && (
                                            <ul className="absolute z-50 w-full bg-white border-2 border-slate-100 rounded-[2rem] shadow-2xl mt-2 max-h-56 overflow-y-auto p-2 scrollbar-hide">
                                                {searchResults.map(v => (
                                                    <li key={v.id} onClick={() => { setFormData({...formData, licensePlate: v.licensePlate}); setSearchResults([]); setSearchTerm(""); }} className="p-4 hover:bg-blue-50 cursor-pointer rounded-2xl border-b last:border-0 flex justify-between items-center group/item transition-colors">
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-slate-800 text-lg group-hover/item:text-blue-700 transition-colors">{v.licensePlate}</span>
                                                            <span className="text-xs text-slate-400 font-bold">{v.make} {v.model}</span>
                                                        </div>
                                                        <ArrowRight size={20} className="text-slate-300 group-hover/item:translate-x-1 group-hover/item:text-blue-500 transition-all"/>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số ODO (Km)</label>
                                            <div className="relative">
                                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                                                <input type="number" className="w-full p-4 pl-12 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" value={formData.currentOdometer} onChange={e => setFormData({...formData, currentOdometer: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hẹn trả xe</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                                                <input type="datetime-local" className="w-full p-4 pl-12 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all text-xs" value={formData.expectedDeliveryTime} onChange={e => setFormData({...formData, expectedDeliveryTime: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ghi chú sửa chữa</label>
                                        <textarea placeholder="Khách báo xe kêu phanh, thay nhớt..." className="w-full p-4 bg-slate-50 rounded-2xl h-32 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium italic" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-green-600 uppercase tracking-widest ml-1">Giảm giá (VND)</label>
                                            <input type="number" className="w-full p-4 bg-green-50 border-2 border-transparent focus:border-green-500 rounded-2xl font-black text-green-700 outline-none" value={formData.discountAmount} onChange={e => setFormData({...formData, discountAmount: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">Thuế VAT (VND)</label>
                                            <input type="number" className="w-full p-4 bg-red-50 border-2 border-transparent focus:border-red-500 rounded-2xl font-black text-red-700 outline-none" value={formData.taxAmount} onChange={e => setFormData({...formData, taxAmount: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CỘT PHẢI: CHI TIẾT DỊCH VỤ & PHỤ TÙNG */}
                            <div className="lg:col-span-8 space-y-8 flex flex-col">
                                <h3 className="font-black text-blue-600 flex items-center gap-3 text-lg border-b-2 border-blue-50 pb-2"><Wrench size={24} /> CHI TIẾT DỊCH VỤ & PHỤ TÙNG</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                                    {/* PHẦN DỊCH VỤ */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Settings size={14}/> Dịch vụ/Tiền công</label>
                                            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black">{selectedServices.length} Hạng mục</span>
                                        </div>
                                        <select onChange={addService} className="w-full p-5 bg-white border-4 border-slate-50 rounded-[1.5rem] font-black text-slate-700 shadow-sm outline-none focus:border-blue-500 transition-all cursor-pointer" value="">
                                            <option value="" disabled>+ Chọn Dịch vụ từ danh sách</option>
                                            {availableServices.map(s => <option key={s.id} value={s.id}>{s.serviceName} - {s.price.toLocaleString()}đ</option>)}
                                        </select>
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {selectedServices.map((s, idx) => (
                                                <div key={s.id} className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm space-y-4 hover:border-blue-200 transition-all animate-in slide-in-from-right-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-black text-slate-800 text-sm">⚙️ {s.name}</span>
                                                        <button type="button" onClick={() => setSelectedServices(selectedServices.filter(x => x.id !== s.id))} className="bg-red-50 text-red-500 p-2 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                                                    </div>
                                                    <div className="flex items-center gap-4 bg-orange-50/50 p-4 rounded-2xl border-2 border-orange-50">
                                                        <span className="text-[10px] font-black text-orange-600 whitespace-nowrap uppercase tracking-widest flex items-center gap-2"><User size={14}/> Thợ máy:</span>
                                                        <select 
                                                            className="flex-1 p-2 text-sm bg-transparent font-black text-orange-700 outline-none"
                                                            value={s.mechanicId}
                                                            onChange={(e) => updateServiceMechanic(idx, e.target.value)}
                                                        >
                                                            <option value="">-- Click để phân thợ --</option>
                                                            {technicians.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* PHẦN PHỤ TÙNG */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Package size={14}/> Phụ tùng thay thế</label>
                                            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black">{selectedParts.length} Phụ tùng</span>
                                        </div>
                                        <select onChange={addPart} className="w-full p-5 bg-white border-4 border-slate-50 rounded-[1.5rem] font-black text-slate-700 shadow-sm outline-none focus:border-blue-500 transition-all cursor-pointer" value="">
                                            <option value="" disabled>+ Chọn Phụ tùng từ kho</option>
                                            {availableParts.map(p => <option key={p.id} value={p.id}>{p.partName} - {p.unitPrice.toLocaleString()}đ</option>)}
                                        </select>
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {selectedParts.map((p, index) => (
                                                <div key={p.id} className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm space-y-4 hover:border-orange-200 transition-all animate-in slide-in-from-right-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-black text-slate-800 text-sm">📦 {p.name}</span>
                                                        <button type="button" onClick={() => setSelectedParts(selectedParts.filter(x => x.id !== p.id))} className="bg-red-50 text-red-500 p-2 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SL:</span>
                                                            <input type="number" min="1" className="bg-transparent font-black text-slate-800 outline-none w-full text-center" value={p.quantity} onChange={(e) => updatePart(index, 'quantity', e.target.value)} />
                                                        </div>
                                                        <div className="flex items-center justify-end font-black text-blue-600 text-lg">
                                                            {((p.price * p.quantity) * (1 - p.discountPercent / 100)).toLocaleString()}đ
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* FOOTER MODAL: TỔNG TIỀN & SUBMIT */}
                                <div className="mt-auto bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 opacity-10 rotate-[-20deg]"><CreditCard size={150}/></div>
                                    <div className="relative z-10 space-y-1">
                                        <p className="text-blue-300 font-bold text-xs uppercase tracking-[0.3em]">Tổng dự toán cuối cùng</p>
                                        <p className="text-5xl font-black text-white tabular-nums tracking-tighter">{totals.finalTotal.toLocaleString()} <span className="text-2xl text-blue-400">VND</span></p>
                                    </div>
                                    <div className="relative z-10 flex gap-4 w-full md:w-auto">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-5 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl transition-all">HỦY BỎ</button>
                                        <button onClick={handleSubmit} className="flex-[2] md:flex-none px-12 py-5 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.03] active:scale-95 transition-all uppercase tracking-widest flex items-center gap-3 justify-center"><CheckCircle size={24}/> Tạo lệnh & Giao việc</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}} />
        </div>
    );
}