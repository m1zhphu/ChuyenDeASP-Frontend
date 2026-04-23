import axiosClient from "./axiosClient";

const appointmentApi = {
    // Lấy danh sách lịch hẹn (Phân trang & Lọc)
    getAll: (page = 1, pageSize = 10, status = '', fromDate = null, toDate = null) => {
        let url = `/Appointment?page=${page}&pageSize=${pageSize}`;
        if (status) url += `&status=${status}`;
        if (fromDate) url += `&fromDate=${fromDate}`;
        if (toDate) url += `&toDate=${toDate}`;
        return axiosClient.get(url);
    },
    create: (data) => axiosClient.post('/Appointment', data),
    updateStatus: (id, status) => axiosClient.put(`/Appointment/${id}/status`, { status }),
    bookOnline: (data) => axiosClient.post('/Appointment/public-book', data)
};

export default appointmentApi;