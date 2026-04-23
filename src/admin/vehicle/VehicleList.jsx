import React, { useState, useEffect, useCallback, useRef } from "react";
import vehicleApi from "../../api/vehicleApi";
import customerApi from "../../api/customerApi"; // Nhớ import thêm cái này
import { PlusCircle, Search, Car, Edit, Trash2, X, UserCheck } from "lucide-react";

export default function VehicleList() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState("");
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null); 
    const [formData, setFormData] = useState({
        licensePlate: '', make: '', model: '', vinNumber: '', customerId: '' 
    });

    // === STATE CHO TÍNH NĂNG TÌM KHÁCH HÀNG THÔNG MINH ===
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCustomerDisplay, setSelectedCustomerDisplay] = useState(""); // Hiển thị tên người đã chọn
    const searchTimeoutRef = useRef(null); // Dùng để chống ddos API khi gõ phím quá nhanh

    const fetchVehicles = useCallback(async () => {
        setLoading(true);
        try {
            const res = await vehicleApi.getAll();
            const filtered = keyword.trim() 
                ? res.filter(v => v.licensePlate?.toLowerCase().includes(keyword.toLowerCase()))
                : res;
            setVehicles(filtered);
        } catch (err) { console.error("Lỗi tải xe:", err); } 
        finally { setLoading(false); }
    }, [keyword]);

    useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

    const openModal = (vehicle = null) => {
        if (vehicle) {
            setEditingVehicle(vehicle);
            setFormData({ ...vehicle });
            // Trong thực tế, lúc Edit xe cần gọi API lấy tên khách hàng dựa vào vehicle.customerId để gán vào display. Tạm thời mình để rỗng hoặc ID.
            setSelectedCustomerDisplay("Khách hàng ID: " + vehicle.customerId); 
        } else {
            setEditingVehicle(null);
            setFormData({ licensePlate: '', make: '', model: '', color: '', customerId: '' });
            setSelectedCustomerDisplay("");
            setSearchTerm("");
            setSearchResults([]);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!formData.customerId) {
            alert("Vui lòng tìm và chọn Khách hàng (Chủ xe)!");
            return;
        }

        try {
            if (editingVehicle) {
                await vehicleApi.update(editingVehicle.id, formData);
                alert("Cập nhật thành công!");
            } else {
                await vehicleApi.create(formData);
                alert("Thêm mới thành công!");
            }
            setIsModalOpen(false);
            fetchVehicles();
        } catch (err) { console.error(err); alert("Lỗi khi lưu dữ liệu!"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa xe này?")) return;
        try {
            await vehicleApi.delete(id);
            fetchVehicles();
        } catch (err) { console.error(err); alert("Lỗi khi xóa!"); }
    };

    // Hàm xử lý khi gõ tìm kiếm (Tối ưu chống gọi API liên tục)
    const handleSearchCustomer = (e) => {
        const val = e.target.value;
        setSearchTerm(val);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (!val.trim()) {
            setSearchResults([]);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const results = await customerApi.search(val);
                setSearchResults(results);
            } catch (error) { console.error("Lỗi tìm khách hàng", error); }
        }, 500); // Đợi user gõ xong nửa giây mới gọi API
    };

    // Hàm khi click chọn 1 người từ danh sách
    const selectCustomer = (customer) => {
        setFormData({ ...formData, customerId: customer.id });
        setSelectedCustomerDisplay(`${customer.fullName} - ${customer.phoneNumber}`);
        setSearchResults([]); // Ẩn danh sách
        setSearchTerm(""); // Reset ô gõ
    };

    return (
        <div className="p-2">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <Car size={32} className="text-blue-600" /> Quản lý Xe cộ
                </h1>
                <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-lg">
                    <PlusCircle size={20} /> Thêm xe
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md mb-6 relative">
                <Search size={18} className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Tìm theo biển số..." className="border w-full rounded-lg p-2 pl-10 outline-none focus:ring-2 focus:ring-blue-500" 
                    value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </div>

            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-gray-600 font-semibold">Biển số</th>
                            <th className="p-4 text-gray-600 font-semibold">Hãng xe</th>
                            <th className="p-4 text-gray-600 font-semibold">Dòng xe</th>
                            <th className="p-4 text-gray-600 font-semibold">Số VIN</th>
                            <th className="p-4 text-gray-600 font-semibold text-center">Bảo dưỡng cuối</th>
                            <th className="p-4 text-gray-600 font-semibold text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center p-10">Đang tải...</td></tr>
                        ) : vehicles.length === 0 ? (
                            <tr><td colSpan="6" className="text-center p-10 text-gray-400">Chưa có dữ liệu</td></tr>
                        ) : (
                            vehicles.map((v) => (
                                <tr key={v.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-bold text-blue-600">{v.licensePlate}</td>
                                    <td className="p-4">{v.make}</td>
                                    <td className="p-4">{v.model}</td>
                                    <td className="p-4 text-gray-500">{v.vinNumber || "---"}</td>
                                    <td className="p-4 text-center text-gray-500">
                                        {v.lastServiceDate ? new Date(v.lastServiceDate).toLocaleDateString('vi-VN') : "Chưa có dữ liệu"}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-3">
                                            <button onClick={() => openModal(v)} className="text-blue-500 hover:text-blue-700">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Form có tích hợp Searchable Dropdown */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
                        <div className="flex justify-between items-center border-b pb-4 mb-4">
                            <h2 className="text-xl font-bold">{editingVehicle ? "Sửa thông tin xe" : "Thêm xe mới"}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-500 hover:text-gray-800" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            
                            {/* KHU VỰC TÌM KIẾM KHÁCH HÀNG CHUYÊN NGHIỆP */}
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <label className="block text-sm font-semibold text-blue-800 mb-1">👤 Chọn Chủ Xe *</label>
                                
                                {/* Ô hiển thị người đã chọn (Nếu có) */}
                                {selectedCustomerDisplay ? (
                                    <div className="flex justify-between items-center bg-white p-2 rounded border border-blue-200">
                                        <span className="font-semibold text-gray-700 flex items-center gap-2">
                                            <UserCheck size={18} className="text-green-600" /> {selectedCustomerDisplay}
                                        </span>
                                        {/* Nút hủy chọn */}
                                        <button type="button" onClick={() => {setFormData({...formData, customerId: ''}); setSelectedCustomerDisplay("");}} className="text-red-500 hover:text-red-700 text-sm font-bold">Đổi</button>
                                    </div>
                                ) : (
                                    // Ô Gõ tìm kiếm nếu chưa chọn ai
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Gõ SĐT hoặc Tên để tìm..." 
                                            className="border w-full p-2 pl-9 rounded outline-none focus:ring-2 focus:ring-blue-400 bg-white" 
                                            value={searchTerm} 
                                            onChange={handleSearchCustomer} 
                                        />
                                        
                                        {/* Bảng thả xuống hiển thị kết quả */}
                                        {searchResults.length > 0 && (
                                            <ul className="absolute z-10 w-full bg-white border rounded shadow-xl mt-1 max-h-48 overflow-y-auto">
                                                {searchResults.map(c => (
                                                    <li key={c.id} onClick={() => selectCustomer(c)} className="p-2 hover:bg-blue-100 cursor-pointer border-b flex flex-col">
                                                        <span className="font-bold text-gray-800">{c.fullName}</span>
                                                        <span className="text-sm text-gray-500">📞 {c.phoneNumber}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>

                            <input required placeholder="Biển số (VD: 51H-123.45) *" className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value})} />
                            <div className="grid grid-cols-2 gap-3">
                                <input placeholder="Hãng xe (VD: Toyota)" className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} />
                                <input placeholder="Dòng xe (VD: Vios)" className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                            </div>
                            {/* Đổi input color thành vinNumber */}
                            <input placeholder="Số khung / Số máy (VIN)" className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.vinNumber} onChange={e => setFormData({...formData, vinNumber: e.target.value})} />
                            
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border rounded-lg font-semibold hover:bg-gray-50">Hủy</button>
                                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700">Lưu thông tin</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}