import axiosClient from "./axiosClient";

const userApi = {
    // Lấy danh sách nhân viên (Phân trang)
    getAll: (page = 1, pageSize = 10, search = "") => 
        axiosClient.get(`/User?page=${page}&pageSize=${pageSize}&search=${search}`),
    
    // Đăng ký tài khoản mới
    register: (data) => axiosClient.post('/User/register', data),
    
    // Khóa hoặc mở khóa tài khoản
    updateStatus: (id, isActive) => axiosClient.patch(`/User/${id}/status?isActive=${isActive}`),
    
    // Đổi mật khẩu cho user đang đăng nhập
    changePassword: (data) => axiosClient.post('/User/change-password', data),
};

export default userApi;