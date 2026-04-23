import axiosClient from "./axiosClient";

const partApi = {
    getAll: () => axiosClient.get('/Parts'),
    getById: (id) => axiosClient.get(`/Parts/${id}`),
    create: (data) => axiosClient.post('/Parts', data),
    update: (id, data) => axiosClient.put(`/Parts/${id}`, data),
    delete: (id) => axiosClient.delete(`/Parts/${id}`),
};

export default partApi;