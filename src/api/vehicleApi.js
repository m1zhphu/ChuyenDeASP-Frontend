import axiosClient from "./axiosClient";

const vehicleApi = {
    getAll: () => axiosClient.get('/Vehicles'),
    getById: (id) => axiosClient.get(`/Vehicles/${id}`),
    create: (data) => axiosClient.post('/Vehicles', data),
    update: (id, data) => axiosClient.put(`/Vehicles/${id}`, data),
    delete: (id) => axiosClient.delete(`/Vehicles/${id}`),
    search: (keyword) => axiosClient.get(`/Vehicles/search?keyword=${keyword}`),
};

export default vehicleApi;