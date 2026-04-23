import React, { useState, useEffect, useCallback } from "react";
import supplierApi from "../../api/supplierApi";
import { PlusCircle, Search, Building2, Edit, Trash2, X } from "lucide-react";

export default function SupplierList() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState("");
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null); 
    const [formData, setFormData] = useState({
        supplierName: '', phoneNumber: '', address: '', taxCode: '', isActive: true
    });

    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await supplierApi.getAll(1, 100, keyword);
            // Backend C# trả về object có trường Data
            setSuppliers(res.data || []); 
        } catch (err) { console.error("Lỗi:", err); } 
        finally { setLoading(false); }
    }, [keyword]);

    useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

    const openModal = (supplier = null) => {
        if (supplier) {
            setEditingId(supplier.id);
            setFormData({ ...supplier });
        } else {
            setEditingId(null);
            setFormData({ supplierName: '', phoneNumber: '', address: '', taxCode: '', isActive: true });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await supplierApi.update(editingId, formData);
                alert("Cập nhật thành công!");
            } else {
                await supplierApi.create(formData);
                alert("Thêm mới thành công!");
            }
            setIsModalOpen(false);
            fetchSuppliers();
        } catch (err) { console.error(err); alert("Lỗi khi lưu dữ liệu!"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa nhà cung cấp này?")) return;
        try {
            const res = await supplierApi.delete(id);
            if (res.success === false) return alert("⚠️ " + res.message);
            alert("Xóa thành công!");
            fetchSuppliers();
        } catch (err) { 
            console.error(err); 
            alert("Không thể xóa. Nhà cung cấp này có thể đã phát sinh giao dịch!"); 
        }
    };

    return (
        <div className="p-2">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><Building2 size={32} className="text-blue-600" /> Nhà Cung Cấp</h1>
                <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"><PlusCircle size={20} /> Thêm mới</button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md mb-6 relative">
                <Search size={18} className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Tìm theo tên hoặc số điện thoại..." className="border w-full rounded-lg p-2 pl-10 outline-none focus:ring-2 focus:ring-blue-500" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </div>

            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-gray-600 font-semibold">Tên Nhà cung cấp</th>
                            <th className="p-4 text-gray-600 font-semibold">Điện thoại</th>
                            <th className="p-4 text-gray-600 font-semibold">Mã số thuế</th>
                            <th className="p-4 text-gray-600 font-semibold text-center">Trạng thái</th>
                            <th className="p-4 text-gray-600 font-semibold text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="5" className="text-center p-10">Đang tải...</td></tr> : 
                        suppliers.length === 0 ? <tr><td colSpan="5" className="text-center p-10 text-gray-400">Chưa có dữ liệu.</td></tr> :
                        suppliers.map((s) => (
                            <tr key={s.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-bold text-blue-600">{s.supplierName}</td>
                                <td className="p-4">{s.phoneNumber || "---"}</td>
                                <td className="p-4 text-gray-500">{s.taxCode || "---"}</td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.isActive ? "Đang giao dịch" : "Ngừng GD"}</span>
                                </td>
                                <td className="p-4 text-center">
                                    <button onClick={() => openModal(s)} className="text-blue-500 hover:text-blue-700 mr-3"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
                        <div className="flex justify-between items-center border-b pb-4 mb-4">
                            <h2 className="text-xl font-bold">{editingId ? "Sửa thông tin" : "Thêm Nhà cung cấp"}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <input required placeholder="Tên nhà cung cấp *" className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} />
                            <input placeholder="Số điện thoại" className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                            <input placeholder="Mã số thuế" className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.taxCode} onChange={e => setFormData({...formData, taxCode: e.target.value})} />
                            <textarea placeholder="Địa chỉ..." className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-20" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                            
                            <label className="flex items-center gap-2 font-semibold text-gray-700 cursor-pointer">
                                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4" />
                                Đang giao dịch (Cho phép nhập kho)
                            </label>

                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100 font-bold">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">Lưu lại</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}