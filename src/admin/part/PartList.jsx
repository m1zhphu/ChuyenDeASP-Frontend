import React, { useState, useEffect, useCallback } from "react";
import partApi from "../../api/partApi";
import { PlusCircle, Search, Wrench, Edit, Trash2, X } from "lucide-react";

export default function PartList() {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState("");
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPart, setEditingPart] = useState(null); 
    const [formData, setFormData] = useState({
        partCode: '', partName: '', unitPrice: 0, stockQuantity: 0, unit: '', minStockLevel: 0, location: ''
    });

    const fetchParts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await partApi.getAll();
            const filtered = keyword.trim() 
                ? res.filter(p => p.partName.toLowerCase().includes(keyword.toLowerCase()) || p.partCode.toLowerCase().includes(keyword.toLowerCase()))
                : res;
            setParts(filtered);
        } catch (err) {
            console.error("Lỗi tải phụ tùng:", err);
        } finally { setLoading(false); }
    }, [keyword]);

    useEffect(() => { fetchParts(); }, [fetchParts]);

    const openModal = (part = null) => {
        if (part) {
            setEditingPart(part);
            setFormData({ ...part });
        } else {
            setEditingPart(null);
            setFormData({ partCode: '', partName: '', unitPrice: 0, stockQuantity: 0, unit: '', minStockLevel: 0, location: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPart) {
                await partApi.update(editingPart.id, formData);
                alert("Cập nhật thành công!");
            } else {
                await partApi.create(formData);
                alert("Thêm mới thành công!");
            }
            setIsModalOpen(false);
            fetchParts();
        } catch (err) {
            console.error(err); 
            alert("Lỗi khi lưu dữ liệu!"); 
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa phụ tùng này?")) return;
        try {
            await partApi.delete(id);
            fetchParts();
        } catch (err) {
            console.error(err); 
            alert("Lỗi khi xóa!"); 
        }
    };

    return (
        <div className="p-2">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <Wrench size={32} className="text-blue-600" /> Quản lý Phụ tùng
                </h1>
                <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg">
                    <PlusCircle size={20} /> Thêm phụ tùng
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md mb-6">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Tìm theo mã hoặc tên..." className="border w-full rounded-lg p-2 pl-10 outline-none focus:ring-2 focus:ring-blue-500" 
                        value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl overflow-hidden border">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-gray-600 font-semibold">Mã PT</th>
                            <th className="p-4 text-gray-600 font-semibold">Tên phụ tùng</th>
                            <th className="p-4 text-gray-600 font-semibold text-right">Đơn giá</th>
                            <th className="p-4 text-gray-600 font-semibold text-center">Tồn kho</th>
                            <th className="p-4 text-gray-600 font-semibold text-center">Đơn vị</th>
                            <th className="p-4 text-gray-600 font-semibold text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center p-10 text-gray-400">Đang tải dữ liệu...</td></tr>
                        ) : parts.length === 0 ? (
                            <tr><td colSpan="6" className="text-center p-10 text-gray-400">Chưa có dữ liệu phụ tùng.</td></tr>
                        ) : (
                            parts.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-blue-600">{p.partCode}</td>
                                    <td className="p-4">{p.partName}</td>
                                    <td className="p-4 text-right font-semibold">{p.unitPrice?.toLocaleString()}đ</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stockQuantity <= p.minStockLevel ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {p.stockQuantity}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center text-gray-500 text-sm italic">{p.unit}</td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => openModal(p)} className="text-blue-500 hover:text-blue-700 mr-3"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL FORM */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold">{editingPart ? "Sửa phụ tùng" : "Thêm phụ tùng"}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Mã phụ tùng *</label>
                                <input required className="w-full border rounded-lg p-2" value={formData.partCode} onChange={e => setFormData({...formData, partCode: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Tên phụ tùng *</label>
                                <input required className="w-full border rounded-lg p-2" value={formData.partName} onChange={e => setFormData({...formData, partName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Đơn giá</label>
                                <input type="number" className="w-full border rounded-lg p-2" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Đơn vị</label>
                                <input className="w-full border rounded-lg p-2" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                            </div>
                            <div className="col-span-2 flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border rounded-lg font-bold">Hủy</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}