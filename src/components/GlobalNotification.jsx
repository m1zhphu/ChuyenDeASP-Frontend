import React, { useState, useEffect } from 'react';
import { Bell, X, ArrowRight } from 'lucide-react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useNavigate } from 'react-router-dom'; // THÊM DÒNG NÀY

export default function GlobalNotification() {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate(); // KHỞI TẠO NAVIGATE

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL; 
        const backendUrl = apiUrl.replace('/api', '') + '/notificationHub'; 

        const connection = new HubConnectionBuilder()
            .withUrl(backendUrl)
            .configureLogging(LogLevel.None)
            .withAutomaticReconnect() 
            .build();

        connection.on("ReceiveNotification", (message) => {
            console.log("📥 Mới nhận thông báo:", message);
            const newNotif = { id: Date.now(), text: message };
            setNotifications(prev => [...prev, newNotif]);
        });

        connection.start()
            .then(() => console.log("✅ Real-time connected:", backendUrl))
            .catch(err => {
                if (!err.message.includes('stopped during negotiation')) {
                    console.error("❌ SignalR Error:", err);
                }
            });

        return () => connection.stop();
    }, []);

    // HÀM XỬ LÝ KHI CLICK VÀO THÔNG BÁO
    const handleNotificationClick = (notif) => {
        // 1. Trích xuất biển số xe từ câu thông báo (format: "🔔 Xe [Biển số] đã...")
        // Ví dụ: "🔔 Xe 59D178989 đã hoàn thành..." -> lấy 59D178989
        const plateMatch = notif.text.match(/Xe\s(.*?)\sđã/);
        const licensePlate = plateMatch ? plateMatch[1] : "";

        // 2. Xóa thông báo này khỏi danh sách
        setNotifications(prev => prev.filter(n => n.id !== notif.id));

        // 3. Chuyển hướng sang trang Lệnh sửa chữa và gửi theo biển số
        navigate('/admin/repair-orders', { state: { searchPlate: licensePlate } });
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-h-[80vh] overflow-y-auto p-2 scrollbar-hide">
            {notifications.map(notif => (
                <div 
                    key={notif.id} 
                    onClick={() => handleNotificationClick(notif)} // CLICK ĐỂ ĐẾN TRANG THANH TOÁN
                    className="group bg-white border-l-4 border-blue-500 shadow-2xl rounded-xl p-4 flex items-start gap-3 w-85 cursor-pointer hover:bg-blue-50 transition-all animate-in slide-in-from-right-8 fade-in duration-300 border border-gray-100"
                >
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Bell size={20} className="animate-bounce" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-black text-gray-800 uppercase tracking-tighter flex justify-between">
                            Thông báo thợ máy
                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600"/>
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed font-medium">
                            {notif.text}
                        </p>
                        <p className="text-[10px] text-blue-500 font-bold mt-2 italic">Click để xem chi tiết & thanh toán</p>
                    </div>
                    {/* NÚT X: Chỉ để xóa, không điều hướng */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation(); // Chặn sự kiện click của thẻ div cha
                            setNotifications(prev => prev.filter(n => n.id !== notif.id));
                        }} 
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                        <X size={18} />
                    </button>
                </div>
            ))}
        </div>
    );
}