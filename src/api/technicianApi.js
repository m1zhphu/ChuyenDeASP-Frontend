import axiosClient from "./axiosClient";

const technicianApi = {
    // Thợ lấy danh sách việc cần làm
    getMyTasks: () => axiosClient.get('/Technician/my-tasks'),
    
    // Cập nhật trạng thái công việc (Ví dụ: Đã xong)
    updateTaskStatus: (taskId, status) => axiosClient.put(`/Technician/tasks/${taskId}`, { status }),
    getTaskHistory: () => axiosClient.get('/Technician/history'),
};

export default technicianApi;