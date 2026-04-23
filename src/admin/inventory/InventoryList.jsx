import React, { useState, useEffect, useCallback } from "react";
import inventoryApi from "../../api/inventoryApi";
import supplierApi from "../../api/supplierApi";
import partApi from "../../api/partApi";
import { PackagePlus, Search, PlusCircle, Eye, X, Building2, Trash2 } from "lucide-react";

export default function InventoryList() {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [suppliers, setSuppliers] = useState([]);
    const [parts, setParts] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailData, setDetailData] = useState(null);

    // Form nhập kho
    const [formData, setFormData] = useState({
        receiptCode: '', supplierId: '', note: ''
    });
    const [selectedParts, setSelectedParts] = useState([]); 

    const fetchReceipts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await inventoryApi.getAll();
            setReceipts(res.data || []);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { 
        fetchReceipts(); 
        supplierApi.getAll().then(res => setSuppliers(res.data?.filter(s => s.isActive) || [])).catch(console.error);
        partApi.getAll().then(setParts).catch(console.error);
    }, [fetchReceipts]);

    const openModal = () => {
        const autoCode = `PN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random()*1000)}`;
        setFormData({ receiptCode: autoCode, supplierId: '', note: '' });
        setSelectedParts([]);
        setIsModalOpen(true);
    };

    const handleViewDetail = async (id) => {
        try {
            const res = await inventoryApi.getById(id);
            setDetailData(res);
            setIsDetailModalOpen(true);
        } catch (error) {
            console.error(error); 
            alert("Lỗi khi lấy chi tiết!"); }
    };

    // GIỎ HÀNG NHẬP
    const addPart = (e) => {
        const pId = e.target.value;
        if (!pId) return;
        const part = parts.find(p => p.id === pId);
        if (part && !selectedParts.find(p => p.id === pId)) {
            setSelectedParts([...selectedParts, { id: part.id, name: part.partName, quantity: 1, importPrice: part.unitPrice }]); // Gợi ý giá gốc
        }
        e.target.value = ""; 
    };

    const updatePart = (index, field, value) => {
        const newParts = [...selectedParts];
        newParts[index][field] = value;
        setSelectedParts(newParts);
    };

    const totalAmount = selectedParts.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.importPrice)), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.supplierId) return alert("Vui lòng chọn Nhà cung cấp!");
        if (selectedParts.length === 0) return alert("Vui lòng chọn ít nhất 1 mặt hàng để nhập kho!");

        const payload = {
            receiptCode: formData.receiptCode,
            supplierId: formData.supplierId,
            userId: "00000000-0000-0000-0000-000000000000", // Cập nhật bằng Token User ID sau
            note: formData.note,
            details: selectedParts.map(p => ({
                partId: p.id,
                quantity: Number(p.quantity),
                importPrice: Number(p.importPrice)
            }))
        };

        try {
            const res = await inventoryApi.import(payload);
            if (res.success === false) return alert("⚠️ Lỗi: " + res.message);
            alert("✅ Nhập kho thành công! Tồn kho đã được cộng thêm.");
            setIsModalOpen(false);
            fetchReceipts();
        } catch (err) { console.error(err); alert("Lỗi khi nhập kho!"); }
    };

    return (
        <div className="p-2">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><PackagePlus size={32} className="text-blue-600" /> Nhập Kho Phụ Tùng</h1>
                <button onClick={openModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"><PlusCircle size={20} /> Tạo phiếu nhập mới</button>
            </div>

            {/* Bảng Danh Sách Phiếu Nhập */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-gray-600 font-semibold">Mã Phiếu</th>
                            <th className="p-4 text-gray-600 font-semibold">Nhà cung cấp</th>
                            <th className="p-4 text-gray-600 font-semibold">Ngày nhập</th>
                            <th className="p-4 text-gray-600 font-semibold text-right">Tổng tiền nhập</th>
                            <th className="p-4 text-center">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="5" className="text-center p-10">Đang tải...</td></tr> : 
                        receipts.length === 0 ? <tr><td colSpan="5" className="text-center p-10 text-gray-400">Chưa có dữ liệu nhập kho.</td></tr> :
                        receipts.map(r => (
                            <tr key={r.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-bold text-blue-600">{r.receiptCode}</td>
                                <td className="p-4 font-medium">{r.supplierName}</td>
                                <td className="p-4 text-gray-500">{new Date(r.createdAt).toLocaleString()}</td>
                                <td className="p-4 text-right font-bold text-red-600">{r.totalAmount?.toLocaleString()}đ</td>
                                <td className="p-4 text-center">
                                    <button onClick={() => handleViewDetail(r.id)} className="text-blue-500 hover:text-blue-700"><Eye size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL TẠO PHIẾU NHẬP */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b bg-blue-50 flex justify-between items-center rounded-t-2xl">
                            <h2 className="text-2xl font-bold text-blue-800">Tạo Phiếu Nhập Kho</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={28} className="text-gray-500 hover:text-red-500" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
                            {/* CỘT TRÁI: Thông tin phiếu */}
                            <div className="flex-1 space-y-4">
                                <div><label className="block text-sm font-semibold mb-1">Mã Phiếu Nhập</label><input type="text" className="border w-full p-2 rounded bg-gray-100 font-bold" value={formData.receiptCode} readOnly /></div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-blue-700">🏢 Chọn Nhà Cung Cấp *</label>
                                    <select className="border w-full p-2 rounded bg-yellow-50 outline-none focus:ring-2" value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})}>
                                        <option value="" disabled>-- Vui lòng chọn --</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.supplierName}</option>)}
                                    </select>
                                </div>
                                <div><label className="block text-sm font-semibold mb-1">Ghi chú nhập hàng</label><textarea className="border w-full p-2 rounded h-24" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} /></div>
                            </div>

                            {/* CỘT PHẢI: Danh sách Phụ tùng */}
                            <div className="flex-[1.5] border rounded-xl p-4 bg-gray-50 flex flex-col">
                                <select onChange={addPart} className="border w-full p-2 rounded font-bold outline-none mb-4 shadow-sm" defaultValue="">
                                    <option value="" disabled>+ Click để thêm phụ tùng vào phiếu</option>
                                    {parts.map(p => <option key={p.id} value={p.id}>{p.partName} (Đang còn: {p.stockQuantity})</option>)}
                                </select>
                                
                                <div className="flex-1 overflow-y-auto space-y-2 border-t pt-2">
                                    {selectedParts.map((p, index) => (
                                        <div key={p.id} className="bg-white p-3 rounded shadow-sm flex items-center justify-between border border-blue-100">
                                            <div className="font-bold flex-1">📦 {p.name}</div>
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <label className="text-xs text-gray-500 block">Số lượng nhập</label>
                                                    <input type="number" min="1" className="border w-20 p-1 rounded font-bold text-center" value={p.quantity} onChange={e => updatePart(index, 'quantity', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 block">Giá mua vào (VND)</label>
                                                    <input type="number" min="0" className="border w-32 p-1 rounded font-bold text-right" value={p.importPrice} onChange={e => updatePart(index, 'importPrice', e.target.value)} />
                                                </div>
                                                <div className="text-right w-24">
                                                    <label className="text-xs text-gray-500 block">Thành tiền</label>
                                                    <span className="font-bold text-blue-700">{(p.quantity * p.importPrice).toLocaleString()}</span>
                                                </div>
                                                <button onClick={() => setSelectedParts(selectedParts.filter(x => x.id !== p.id))} className="text-red-500 ml-2 mt-4"><Trash2 size={20}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-4 bg-blue-600 text-white rounded-lg flex justify-between items-center shadow-inner">
                                    <span className="font-bold text-lg">TỔNG TIỀN THANH TOÁN:</span>
                                    <span className="text-3xl font-black">{totalAmount.toLocaleString()} đ</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t bg-white rounded-b-2xl flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 border rounded font-bold hover:bg-gray-100">Hủy</button>
                            <button onClick={handleSubmit} className="px-8 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 shadow">XÁC NHẬN NHẬP KHO</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CHI TIẾT */}
            {isDetailModalOpen && detailData && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h2 className="text-xl font-bold text-blue-800">Chi Tiết: {detailData.receiptCode}</h2>
                            <button onClick={() => setIsDetailModalOpen(false)}><X /></button>
                        </div>
                        <p><strong>Nhà cung cấp:</strong> {detailData.supplierName}</p>
                        <p><strong>Ngày nhập:</strong> {new Date(detailData.createdAt).toLocaleString()}</p>
                        
                        <table className="w-full mt-4 border text-sm">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="p-2">Tên phụ tùng</th>
                                    <th className="p-2 text-center">SL nhập</th>
                                    <th className="p-2 text-right">Đơn giá</th>
                                    <th className="p-2 text-right">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {detailData.items?.map((item, i) => (
                                    <tr key={i}>
                                        <td className="p-2">{item.partName}</td>
                                        <td className="p-2 text-center">{item.quantity}</td>
                                        <td className="p-2 text-right">{item.importPrice?.toLocaleString()}đ</td>
                                        <td className="p-2 text-right font-bold">{(item.quantity * item.importPrice).toLocaleString()}đ</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-4 text-right">
                            <span className="text-lg">Tổng hóa đơn: </span>
                            <span className="text-2xl font-bold text-red-600">{detailData.totalAmount?.toLocaleString()}đ</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}