import axiosClient from "./axiosClient";

const inventoryApi = {
    getAll: (page = 1, pageSize = 100, search = '') => 
        axiosClient.get(`/Inventory?page=${page}&pageSize=${pageSize}&search=${search}`),
    getById: (id) => axiosClient.get(`/Inventory/${id}`),
    import: (data) => axiosClient.post('/Inventory/import', data),
};

export default inventoryApi;