import React, { useState, useEffect, useCallback } from "react";
import customerApi from "../../api/customerApi";
import { PlusCircle, Search, Users, Edit, Trash2, X } from "lucide-react";

export default function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState("");
    
    // Quản lý Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null); 
    
    // SỬA LỖI 1: Đổi 'phone' thành 'phoneNumber'
    const [formData, setFormData] = useState({
        fullName: '', phoneNumber: '', email: '', address: '' 
    });

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await customerApi.getAll();
            const filtered = keyword.trim() 
                ? res.filter(c => 
                    (c.fullName?.toLowerCase().includes(keyword.toLowerCase())) || 
                    // SỬA LỖI 2: Đổi 'c.phone' thành 'c.phoneNumber' trong lúc tìm kiếm
                    (c.phoneNumber?.includes(keyword))
                  )
                : res;
            setCustomers(filtered);
        } catch (err) {
            console.error("Lỗi tải khách hàng:", err);
        } finally { setLoading(false); }
    }, [keyword]);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const openModal = (customer = null) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({ ...customer });
        } else {
            setEditingCustomer(null);
            // SỬA LỖI 3: Khởi tạo lại với 'phoneNumber'
            setFormData({ fullName: '', phoneNumber: '', email: '', address: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCustomer) {
                await customerApi.update(editingCustomer.id, formData);
                alert("Cập nhật thành công!");
            } else {
                await customerApi.create(formData);
                alert("Thêm mới thành công!");
            }
            setIsModalOpen(false);
            fetchCustomers();
        } catch (err) {
            console.error(err); 
            alert("Lỗi khi lưu dữ liệu!"); 
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa khách hàng này?")) return;
        try {
            await customerApi.delete(id);
            fetchCustomers();
        } catch (err) {
            console.error(err); 
            alert("Lỗi khi xóa!"); 
        }
    };

    return (
        <div className="p-2">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <Users size={32} className="text-blue-600" /> Quản lý Khách hàng
                </h1>
                <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-lg">
                    <PlusCircle size={20} /> Thêm khách hàng
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md mb-6">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Tìm theo tên hoặc số điện thoại..." className="border w-full rounded-lg p-2 pl-10 outline-none focus:ring-2 focus:ring-blue-500" 
                        value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-gray-600 font-semibold">Tên khách hàng</th>
                            <th className="p-4 text-gray-600 font-semibold">Số điện thoại</th>
                            <th className="p-4 text-gray-600 font-semibold">Email</th>
                            <th className="p-4 text-gray-600 font-semibold">Địa chỉ</th>
                            <th className="p-4 text-gray-600 font-semibold text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center p-10 text-gray-400">Đang tải dữ liệu...</td></tr>
                        ) : customers.length === 0 ? (
                            <tr><td colSpan="5" className="text-center p-10 text-gray-400">Chưa có dữ liệu khách hàng</td></tr>
                        ) : customers.map((c) => (
                            <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                                <td className="p-4 font-medium text-gray-800">{c.fullName}</td>
                                {/* SỬA LỖI 4: Hiển thị đúng c.phoneNumber */}
                                <td className="p-4 text-blue-600 font-semibold">{c.phoneNumber}</td>
                                <td className="p-4 text-gray-600">{c.email || "---"}</td>
                                <td className="p-4 text-gray-600">{c.address || "---"}</td>
                                <td className="p-4 text-center">
                                    <button onClick={() => openModal(c)} className="text-blue-500 hover:text-blue-700 mr-3"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL FORM */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold">{editingCustomer ? "Sửa thông tin" : "Thêm khách hàng"}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-500 hover:text-gray-800" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Tên khách hàng *</label>
                                <input required className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Số điện thoại *</label>
                                {/* SỬA LỖI 5: Gắn value và onChange đúng biến formData.phoneNumber */}
                                <input required type="tel" className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Email</label>
                                <input type="email" className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Địa chỉ</label>
                                <input className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-50 font-semibold">Hủy</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}