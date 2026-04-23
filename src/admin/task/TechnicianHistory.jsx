import React, { useState, useEffect } from "react";
import technicianApi from "../../api/technicianApi";
import { CheckCircle, Car, Calendar, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TechnicianHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        technicianApi.getTaskHistory()
            .then(res => setHistory(res || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft />
                </button>
                <h1 className="text-3xl font-black text-gray-800">Lịch sử công việc</h1>
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-bold text-gray-600">Lệnh sửa chữa</th>
                            <th className="p-4 font-bold text-gray-600">Xe</th>
                            <th className="p-4 font-bold text-gray-600">Dịch vụ đã làm</th>
                            <th className="p-4 font-bold text-gray-600 text-center">Người thực hiện</th>
                            <th className="p-4 font-bold text-gray-600 text-center">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center p-10">Đang tải lịch sử...</td></tr>
                        ) : history.length === 0 ? (
                            <tr><td colSpan="5" className="text-center p-10 text-gray-400">Chưa có công việc nào hoàn thành.</td></tr>
                        ) : (
                            history.map(item => (
                                <tr key={item.taskId} className="border-b hover:bg-green-50/30 transition-colors">
                                    <td className="p-4 font-bold text-blue-600">#{item.orderCode}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 font-black text-gray-700">
                                            <Car size={16} className="text-gray-400"/> {item.licensePlate}
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-800">{item.serviceName}</td>
                                    <td className="p-4 text-center text-sm font-bold text-gray-500">
                                        <div className="flex items-center justify-center gap-1">
                                            <User size={14}/> {item.mechanicName}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black flex items-center justify-center gap-1 w-max mx-auto">
                                            <CheckCircle size={12}/> ĐÃ XONG
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}