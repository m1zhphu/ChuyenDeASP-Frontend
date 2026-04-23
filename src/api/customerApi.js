import axiosClient from "./axiosClient";

const customerApi = {
    getAll: () => axiosClient.get('/Customer'),
    getById: (id) => axiosClient.get(`/Customer/${id}`),
    create: (data) => axiosClient.post('/Customer', data),
    update: (id, data) => axiosClient.put(`/Customer/${id}`, data),
    delete: (id) => axiosClient.delete(`/Customer/${id}`),
    search: (keyword) => axiosClient.get(`/Customer/search?keyword=${keyword}`),
};

export default customerApi;