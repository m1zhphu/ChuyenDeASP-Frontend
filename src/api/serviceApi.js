import axiosClient from "./axiosClient";

const serviceApi = {
    getAll: () => axiosClient.get('/Services'),
    getById: (id) => axiosClient.get(`/Services/${id}`),
    create: (data) => axiosClient.post('/Services', data),
    update: (id, data) => axiosClient.put(`/Services/${id}`, data),
    delete: (id) => axiosClient.delete(`/Services/${id}`),
};

export default serviceApi;