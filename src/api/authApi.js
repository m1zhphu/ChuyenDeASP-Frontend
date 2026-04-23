import axiosClient from "./axiosClient";

const authApi = {
    // Hàm gọi API đăng nhập
    login: (data) => {
        // data sẽ chứa { username: "...", password: "..." }
        const url = '/Auth/login';
        return axiosClient.post(url, data);
    }
};

export default authApi;