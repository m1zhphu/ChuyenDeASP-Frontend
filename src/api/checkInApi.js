import axiosClient from "./axiosClient";

const checkInApi = {
    // Quét biển số xe để kiểm tra thông tin nhanh
    process: (licensePlate) => axiosClient.get(`/CheckIn/${licensePlate}`),
    quickOnboard: (data) => {
        return axiosClient.post('/CheckIn/quick-onboard', data);
    }
};

export default checkInApi;