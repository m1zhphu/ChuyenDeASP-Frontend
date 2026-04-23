import React, { useState, useEffect, useCallback } from "react";
import userApi from "../../api/userApi";
import { Users, UserPlus, Shield, Lock, Unlock, Mail, Phone, Search, X } from "lucide-react";

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState("");
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: '', password: '', fullName: '', role: 'Advisor', email: '', phoneNumber: ''
    });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await userApi.getAll(1, 100, keyword);
            setUsers(res.data || []); // C# trả về { totalRecords, data }
        } catch (err) { console.error("Lỗi tải nhân sự:", err); } 
        finally { setLoading(false); }
    }, [keyword]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleUpdateStatus = async (id, currentStatus) => {
        const action = currentStatus ? "KHÓA" : "MỞ KHÓA";
        if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;
        try {
            await userApi.updateStatus(id, !currentStatus);
            alert(`${action} thành công!`);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert("Lỗi khi cập nhật trạng thái!"); }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await userApi.register(formData);
            if (res.success === false) return alert("⚠️ " + res.message);
            alert("Tạo tài khoản thành công!");
            setIsModalOpen(false);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert("Lỗi khi đăng ký tài khoản!"); }
    };

    return (
        <div className="p-2">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <Shield size={32} className="text-indigo-600" /> Quản lý Nhân sự
                </h1>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg">
                    <UserPlus size={20} /> Thêm nhân viên
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md mb-6 relative">
                <Search size={18} className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Tìm theo tên hoặc tên đăng nhập..." className="border w-full rounded-lg p-2 pl-10 outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </div>

            <div className="bg-white rounded-xl shadow-xl overflow-hidden border">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-gray-600 font-semibold">Nhân viên</th>
                            <th className="p-4 text-gray-600 font-semibold">Username</th>
                            <th className="p-4 text-gray-600 font-semibold">Vai trò</th>
                            <th className="p-4 text-gray-600 font-semibold text-center">Trạng thái</th>
                            <th className="p-4 text-gray-600 font-semibold text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="5" className="text-center p-10">Đang tải...</td></tr> : 
                        users.map(u => (
                            <tr key={u.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                    <div className="font-bold text-gray-800">{u.fullName}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1"><Mail size={12}/> {u.email || "---"}</div>
                                </td>
                                <td className="p-4 font-mono text-sm">{u.username}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'Admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${u.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {u.isActive ? "Hoạt động" : "Bị khóa"}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button onClick={() => handleUpdateStatus(u.id, u.isActive)} className={`${u.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}`}>
                                        {u.isActive ? <Lock size={20}/> : <Unlock size={20}/>}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL THÊM NHÂN VIÊN */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
                        <div className="flex justify-between items-center border-b pb-4 mb-4">
                            <h2 className="text-xl font-bold">Đăng ký tài khoản nhân viên</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleRegister} className="grid grid-cols-1 gap-4">
                            <input required placeholder="Tên đăng nhập *" className="border p-2 rounded-lg" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                            <input required type="password" placeholder="Mật khẩu *" className="border p-2 rounded-lg" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                            <input required placeholder="Họ và tên *" className="border p-2 rounded-lg" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                            <select className="border p-2 rounded-lg font-bold bg-gray-50" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                <option value="Advisor">Advisor (Cố vấn dịch vụ)</option>
                                <option value="Technician">Technician (Thợ máy)</option>
                                <option value="Admin">Admin (Quản trị viên)</option>
                            </select>
                            <input type="email" placeholder="Email" className="border p-2 rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            <input type="tel" placeholder="Số điện thoại" className="border p-2 rounded-lg" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                            
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border rounded-lg font-bold">Hủy</button>
                                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-md">Tạo tài khoản</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}