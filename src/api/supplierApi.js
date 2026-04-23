import axiosClient from "./axiosClient";

const supplierApi = {
    // Gọi API phân trang, tạm thời lấy pageSize lớn để hiển thị hết vào Dropdown
    getAll: (page = 1, pageSize = 100, search = '') => 
        axiosClient.get(`/Supplier?page=${page}&pageSize=${pageSize}&search=${search}`),
    getById: (id) => axiosClient.get(`/Supplier/${id}`),
    create: (data) => axiosClient.post('/Supplier', data),
    update: (id, data) => axiosClient.put(`/Supplier/${id}`, data),
    delete: (id) => axiosClient.delete(`/Supplier/${id}`),
};

export default supplierApi;