import React, { useState, useEffect, useCallback } from "react";
import serviceApi from "../../api/serviceApi";
import { PlusCircle, Search, Settings, Edit, Trash2, X } from "lucide-react";

export default function ServiceList() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState("");
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null); 
    const [formData, setFormData] = useState({
        serviceName: '', description: '', price: 0
    });

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const res = await serviceApi.getAll();
            const filtered = keyword.trim() 
                ? res.filter(s => s.serviceName?.toLowerCase().includes(keyword.toLowerCase()))
                : res;
            setServices(filtered);
        } catch (err) { console.error("Lỗi tải dịch vụ:", err); } 
        finally { setLoading(false); }
    }, [keyword]);

    useEffect(() => { fetchServices(); }, [fetchServices]);

    const openModal = (service = null) => {
        if (service) {
            setEditingService(service);
            setFormData({ ...service });
        } else {
            setEditingService(null);
            setFormData({ serviceName: '', description: '', price: 0 });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingService) {
                await serviceApi.update(editingService.id, formData);
                alert("Cập nhật thành công!");
            } else {
                await serviceApi.create(formData);
                alert("Thêm mới thành công!");
            }
            setIsModalOpen(false);
            fetchServices();
        } catch (err) {
            console.error(err); 
            alert("Lỗi khi lưu dữ liệu!"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa dịch vụ này?")) return;
        try {
            await serviceApi.delete(id);
            fetchServices();
        } catch (err) {
            console.error(err); 
            alert("Lỗi khi xóa!"); }
    };

    return (
        <div className="p-2">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <Settings size={32} className="text-blue-600" /> Quản lý Dịch vụ
                </h1>
                <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-lg">
                    <PlusCircle size={20} /> Thêm dịch vụ
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md mb-6 relative">
                <Search size={18} className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Tìm theo tên dịch vụ..." className="border w-full rounded-lg p-2 pl-10 outline-none focus:ring-2 focus:ring-blue-500" 
                    value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </div>

            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-gray-600 font-semibold w-1/3">Tên dịch vụ</th>
                            <th className="p-4 text-gray-600 font-semibold w-1/3">Mô tả</th>
                            <th className="p-4 text-gray-600 font-semibold text-right">Giá tiền (VNĐ)</th>
                            <th className="p-4 text-gray-600 font-semibold text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="4" className="text-center p-10">Đang tải...</td></tr> : 
                        services.map((s) => (
                            <tr key={s.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-bold text-gray-800">{s.serviceName}</td>
                                <td className="p-4 text-gray-500 text-sm">{s.description || "---"}</td>
                                <td className="p-4 text-right font-semibold text-blue-600">{s.price?.toLocaleString()}đ</td>
                                <td className="p-4 text-center">
                                    <button onClick={() => openModal(s)} className="text-blue-500 hover:text-blue-700 mr-3"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
                        <div className="flex justify-between items-center border-b pb-4 mb-4">
                            <h2 className="text-xl font-bold">{editingService ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <input required placeholder="Tên dịch vụ *" className="border p-2 rounded-lg" value={formData.serviceName} onChange={e => setFormData({...formData, serviceName: e.target.value})} />
                            <textarea placeholder="Mô tả chi tiết" className="border p-2 rounded-lg h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            <input type="number" placeholder="Giá tiền" className="border p-2 rounded-lg" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}