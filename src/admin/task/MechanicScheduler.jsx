import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axiosClient from '../../api/axiosClient';
import { X, ArrowLeftRight, Users, Clock, AlertCircle, PlayCircle, CheckCircle2 } from 'lucide-react';

export default function MechanicScheduler() {
    const [events, setEvents] = useState([]);
    const [mechanics, setMechanics] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // 1. HÀM PHÂN LOẠI MÀU SẮC & TRẠNG THÁI (ĐỒNG BỘ VỚI BACKEND)
    const getEventStyle = (status) => {
        switch (status) {
            case 'Completed': 
                return { bg: '#10b981', border: '#059669', text: 'Đã xong', textClass: 'text-emerald-600', bgClass: 'bg-emerald-50' };
            case 'InProgress': 
                return { bg: '#3b82f6', border: '#2563eb', text: 'Đang làm', textClass: 'text-blue-600', bgClass: 'bg-blue-50' };
            default: // Pending hoặc các trạng thái khác
                return { bg: '#f59e0b', border: '#d97706', text: 'Chờ làm', textClass: 'text-amber-600', bgClass: 'bg-amber-50' };
        }
    };

    // 2. LOAD DỮ LIỆU
    useEffect(() => {
        const loadAllData = async () => {
            try {
                const [evRes, mechRes] = await Promise.all([
                    axiosClient.get('/Technician/scheduler-events'),
                    axiosClient.get('/Technician/list-mechanics')
                ]);
                
                const rawEvents = evRes.data || evRes;
                if (Array.isArray(rawEvents)) {
                    setEvents(rawEvents.map(item => {
                        const style = getEventStyle(item.status);
                        return {
                            id: item.id,
                            title: item.title,
                            start: item.start,
                            end: item.end,
                            backgroundColor: style.bg,
                            borderColor: style.border,
                            extendedProps: { 
                                mechanic: item.mechanicName, 
                                mechanicId: item.resourceId,
                                status: item.status,
                                statusText: style.text
                            }
                        };
                    }));
                }
                setMechanics(mechRes.data || mechRes);
            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
            }
        };

        loadAllData();
    }, []);

    // 3. REFRESH SAU KHI CẬP NHẬT
    const refreshData = async () => {
        try {
            const evRes = await axiosClient.get('/Technician/scheduler-events');
            const rawEvents = evRes.data || evRes;
            if (Array.isArray(rawEvents)) {
                setEvents(rawEvents.map(item => {
                    const style = getEventStyle(item.status);
                    return {
                        id: item.id,
                        title: item.title,
                        start: item.start,
                        end: item.end,
                        backgroundColor: style.bg,
                        borderColor: style.border,
                        extendedProps: { 
                            mechanic: item.mechanicName, 
                            mechanicId: item.resourceId,
                            status: item.status,
                            statusText: style.text
                        }
                    };
                }));
            }
        } catch (err) {
            console.error("Lỗi làm mới dữ liệu:", err);
        }
    };

    // 4. CLICK VÀO THẺ ĐỂ MỞ MODAL
    const handleEventClick = (info) => {
        const style = getEventStyle(info.event.extendedProps.status);
        setSelectedEvent({
            id: info.event.id,
            title: info.event.title,
            currentMechanic: info.event.extendedProps.mechanic,
            status: info.event.extendedProps.status,
            statusText: style.text,
            statusClasses: `${style.bgClass} ${style.textClass}`
        });
        setShowModal(true);
    };

    // 5. ĐỔI THỢ (GỌI API)
    const handleReassign = async (newMechId) => {
        if (selectedEvent?.status === 'Completed') {
            return alert("Công việc đã hoàn thành, không thể đổi thợ!");
        }
        try {
            await axiosClient.put('/Technician/reassign-mechanic', {
                taskId: selectedEvent.id,
                newMechanicId: newMechId
            });
            setShowModal(false);
            refreshData(); 
        } catch (err) {
            console.error("Lỗi đổi thợ:", err);
            alert("Không thể thay đổi thợ máy!");
        }
    };

    // 6. KÉO THẢ ĐỔI GIỜ
    const handleEventDrop = async (info) => {
        if (info.event.extendedProps.status === 'Completed') {
            info.revert();
            return alert("Công việc đã hoàn thành, không thể đổi giờ!");
        }
        try {
            await axiosClient.put('/Technician/update-event-time', {
                taskId: info.event.id,
                newStart: info.event.start.toISOString()
            });
        } catch (err) {
            console.error("Lỗi kéo thả:", err);
            info.revert();
            alert("Lỗi khi thay đổi thời gian!");
        }
    };

    return (
        <div className="bg-white p-4 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 h-full flex flex-col animate-in fade-in duration-500">
            {/* HEADER & CHÚ THÍCH */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6 shrink-0">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Điều Phối Nhân Sự</h2>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        <ArrowLeftRight size={16}/> Click vào thẻ để đổi thợ. Kéo thả để đổi giờ.
                    </p>
                </div>
                
                {/* 3 MÀU TRẠNG THÁI HIỆN ĐẠI */}
                <div className="flex flex-wrap gap-3 p-1.5 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
                        <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Chờ làm</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
                        <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Đang làm</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
                        <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Đã Xong</span>
                    </div>
                </div>
            </div>

            {/* LỊCH FULLCALENDAR */}
            <div className="rounded-[2rem] border border-slate-200 overflow-hidden bg-white shadow-sm flex-1 relative">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay' // Đã khôi phục nút Day
                    }}
                    locale="vi"
                    events={events}
                    editable={true}
                    selectable={true}
                    
                    /* ĐÃ FIX LỖI CHIỀU CAO & MẤT TRỤC GIỜ NẰM Ở ĐÂY */
                    height="75vh"            // Quản lý chiều cao cố định
                    slotEventOverlap={false} 
                    allDaySlot={false}       
                    slotMinTime="07:00:00"   
                    slotMaxTime="19:00:00" 
                    slotDuration="00:30:00" 
                    dayMaxEvents={3}
                    scrollTime="08:00:00"
                    stickyHeaderDates={true}

                    eventClick={handleEventClick}
                    eventDrop={handleEventDrop}
                    eventContent={(info) => {
                        const isCompleted = info.event.extendedProps.status === 'Completed';
                        return (
                            <div className="p-2 flex flex-col justify-between h-full overflow-hidden text-white relative">
                                <div className="space-y-1 z-10">
                                    <div className="font-black text-[11px] uppercase tracking-wider truncate drop-shadow-sm" title={info.event.title}>
                                        {info.event.title}
                                    </div>
                                    <div className="text-[10px] font-bold flex items-center gap-1.5 opacity-95 truncate bg-black/20 w-fit px-1.5 py-0.5 rounded-md backdrop-blur-sm" title={info.event.extendedProps.mechanic}>
                                        <Users size={10} className="shrink-0"/> 
                                        <span className="truncate">{info.event.extendedProps.mechanic || 'Chưa phân thợ'}</span>
                                    </div>
                                </div>
                                <div className="text-[9px] font-black flex items-center justify-between opacity-90 mt-1 z-10">
                                    <span className="flex items-center gap-1 bg-black/10 px-1.5 py-0.5 rounded">
                                        <Clock size={10}/> {info.event.start.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                    {isCompleted && <CheckCircle2 size={12} className="text-white drop-shadow-sm"/>}
                                </div>
                            </div>
                        )
                    }}
                />
            </div>

            {/* MODAL THAY ĐỔI NHÂN SỰ */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="bg-slate-50 p-6 px-8 flex justify-between items-center border-b border-slate-100">
                            <h3 className="font-black text-xl text-slate-800 flex items-center gap-3">
                                <div className="bg-white shadow-sm p-2 rounded-xl text-blue-600 border border-slate-100">
                                    <ArrowLeftRight size={20} />
                                </div>
                                PHÂN CÔNG THỢ MÁY
                            </h3>
                            <button onClick={() => setShowModal(false)} className="bg-white shadow-sm p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors border border-slate-100">
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-8 pt-6 space-y-6">
                            {/* Khối thông tin công việc hiện tại */}
                            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hạng mục</p>
                                        <h4 className="font-black text-lg text-slate-800 leading-tight">{selectedEvent?.title}</h4>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedEvent?.statusClasses}`}>
                                        {selectedEvent?.statusText}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                    <p className="text-xs font-bold text-slate-500">Người đang nhận:</p>
                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                                        <Users size={14} className="text-slate-400"/>
                                        <span className="text-sm font-black text-slate-700">
                                            {selectedEvent?.currentMechanic || 'Chưa gán thợ'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Danh sách thợ thay thế */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Chọn nhân sự thay thế</p>
                                <div className="max-h-[280px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                    {mechanics.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => handleReassign(m.id)}
                                            disabled={selectedEvent?.status === 'Completed'}
                                            className="w-full text-left p-4 rounded-2xl border-2 border-transparent bg-slate-50 hover:border-blue-500 hover:bg-blue-50 focus:bg-blue-100 transition-all flex justify-between items-center group disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="bg-white shadow-sm w-10 h-10 rounded-full flex items-center justify-center text-slate-600 font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    {m.fullName.charAt(0)}
                                                </div>
                                                <span className="font-bold text-slate-700 group-hover:text-blue-700 transition-colors">{m.fullName}</span>
                                            </div>
                                            <div className="bg-white p-2 rounded-xl shadow-sm text-slate-400 group-hover:text-blue-500 transition-colors">
                                                <ArrowLeftRight size={16} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .fc { font-family: inherit; }
                /* Tùy chỉnh thẻ công việc */
                .fc-v-event { 
                    border-radius: 10px; 
                    border-width: 0 0 0 4px; 
                    cursor: pointer; 
                    transition: all 0.2s ease; 
                    box-shadow: 0 2px 4px rgb(0 0 0 / 0.05); 
                    margin: 2px 3px;
                }
                .fc-v-event:hover { 
                    transform: translateY(-2px) scale(1.01); 
                    filter: brightness(1.05); 
                    box-shadow: 0 8px 16px -4px rgb(0 0 0 / 0.15);
                    z-index: 50 !important; 
                }
                /* Tùy chỉnh lưới giờ */
                .fc .fc-timegrid-slot { height: 3.5rem !important; border-bottom: 1px dashed #e2e8f0; }
                .fc .fc-timegrid-slot-minor { border-top-style: dashed; border-color: #f1f5f9; }
                .fc .fc-timegrid-axis-cushion { font-weight: 900; color: #64748b; font-size: 12px; }
                .fc .fc-col-header-cell-cushion { padding: 12px 8px; font-weight: 900; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; }
                /* Tùy chỉnh nút bấm của Calendar */
                .fc .fc-button-primary { 
                    background: #fff !important; 
                    border: 2px solid #e2e8f0 !important; 
                    color: #64748b !important; 
                    font-weight: 900 !important; 
                    border-radius: 12px !important; 
                    text-transform: capitalize;
                    padding: 6px 16px;
                    transition: all 0.2s;
                    box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
                }
                .fc .fc-button-primary:not(:disabled):hover { background: #f8fafc !important; border-color: #cbd5e1 !important; color: #0f172a !important; }
                .fc .fc-button-active { background: #3b82f6 !important; border-color: #3b82f6 !important; color: #fff !important; box-shadow: none; }
                
                /* Tùy chỉnh thanh cuộn Modal */
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
            `}} />
        </div>
    );
}