import axiosClient from "./axiosClient";

const dashboardApi = {
    getStats: () => axiosClient.get('/Dashboard/stats'),
};

export default dashboardApi;