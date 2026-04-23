import React, { useState, useEffect, useCallback } from "react";
import technicianApi from "../../api/technicianApi";
import { Wrench, CheckCircle, Clock, Car, PlayCircle, AlertCircle } from "lucide-react";

export default function TechnicianTaskList() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. TẢI DANH SÁCH CÔNG VIỆC ĐƯỢC GIAO
    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            // API này trả về danh sách dựa theo Token của thợ đang đăng nhập
            const res = await technicianApi.getMyTasks();
            setTasks(res || []);
        } catch (err) { 
            console.error("Lỗi tải công việc:", err); 
        } finally { 
            setLoading(false); 
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // 2. CẬP NHẬT TRẠNG THÁI CÔNG VIỆC (Pending -> InProgress -> Completed)
    const handleUpdateStatus = async (taskId, newStatus) => {
        const statusText = newStatus === 'InProgress' ? "BẮT ĐẦU thực hiện" : "HOÀN THÀNH";
        if (!window.confirm(`Bạn muốn xác nhận ${statusText} hạng mục này?`)) return;

        try {
            await technicianApi.updateTaskStatus(taskId, newStatus);
            alert("✅ Đã cập nhật trạng thái công việc!");
            fetchTasks(); // Tải lại danh sách để cập nhật giao diện
        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            alert("❌ Không thể cập nhật trạng thái!");
        }
    };

    // Hàm hỗ trợ hiển thị màu sắc theo trạng thái
    const getStatusTheme = (status) => {
        const s = status || 'Pending'; // Dự phòng nếu status bị null
        switch (s) {
            case 'InProgress': return 'border-blue-500 text-blue-600 bg-blue-50';
            case 'Completed': return 'border-green-500 text-green-600 bg-green-50';
            default: return 'border-orange-500 text-orange-600 bg-orange-50';
        }
    };
    return (
        <div className="p-4 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                        <Wrench size={36} className="text-blue-600" /> KHÔNG GIAN THỢ MÁY
                    </h1>
                    <p className="text-gray-500 font-bold italic mt-1">Quản lý và cập nhật tiến độ sửa chữa cá nhân</p>
                </div>
                <button 
                    onClick={fetchTasks}
                    className="bg-white border-2 border-gray-200 p-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                    title="Làm mới danh sách"
                >
                    <Clock className="text-gray-400" />
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center py-20 text-gray-400">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="font-bold">Đang kiểm tra danh sách việc được giao...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tasks.map(task => (
                        <div key={task.taskId} className={`bg-white rounded-3xl shadow-xl border-t-8 overflow-hidden hover:scale-[1.02] transition-all ${getStatusTheme(task.status)}`}>
                            <div className="p-6 space-y-5">
                                {/* HEADER CARD */}
                                <div className="flex justify-between items-center">
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-black text-[10px] tracking-widest uppercase">
                                        #{task.orderCode}
                                    </span>
                                    <div className="flex items-center gap-1 text-gray-800 font-black text-lg">
                                        <Car size={20} className="text-blue-600"/> {task.licensePlate}
                                    </div>
                                </div>
                                
                                {/* NỘI DUNG CÔNG VIỆC */}
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Hạng mục phụ trách:</p>
                                    <h3 className="text-xl font-black text-gray-900 leading-tight">{task.serviceName}</h3>
                                    <p className="text-sm text-blue-600 font-bold mt-2 flex items-center gap-1">
                                        <Wrench size={14}/> Phụ trách: {task.mechanicName}
                                    </p>
                                </div>

                                {/* TRẠNG THÁI HIỆN TẠI */}
                                <div className="flex items-center gap-2">
                                    {task.status === 'Pending' && <div className="flex items-center gap-1 text-xs font-bold text-orange-600"><AlertCircle size={14}/> Chờ thực hiện</div>}
                                    {task.status === 'InProgress' && <div className="flex items-center gap-1 text-xs font-bold text-blue-600 animate-pulse"><Clock size={14}/> Đang xử lý...</div>}
                                    {task.status === 'Completed' && <div className="flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircle size={14}/> Đã hoàn thành</div>}
                                </div>

                                {/* NÚT THAO TÁC THEO LUỒNG CÔNG VIỆC */}
                                <div className="flex gap-3 pt-2">
                                    {(task.status || 'Pending') === 'Pending' && (
                                        <button 
                                            onClick={() => handleUpdateStatus(task.taskId, 'InProgress')}
                                            className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                                        >
                                            <PlayCircle size={22}/> BẮT ĐẦU LÀM
                                        </button>
                                    )}
                                    
                                    {task.status === 'InProgress' && (
                                        <button 
                                            onClick={() => handleUpdateStatus(task.taskId, 'Completed')}
                                            className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
                                        >
                                            <CheckCircle size={22}/> XÁC NHẬN XONG
                                        </button>
                                    )}

                                    {task.status === 'Completed' && (
                                        <div className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black flex items-center justify-center gap-2 border-2 border-dashed">
                                            CHỜ BÀN GIAO XE
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {tasks.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-4 border-dashed border-gray-200">
                            <Clock size={60} className="text-gray-300 mb-4" />
                            <p className="text-xl font-black text-gray-400">CHƯA CÓ VIỆC ĐƯỢC GIAO</p>
                            <p className="text-gray-400 text-sm mt-1 italic">Bạn có thể thảnh thơi uống trà trong lúc chờ lệnh mới!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}