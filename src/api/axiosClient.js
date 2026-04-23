import axios from 'axios';

const axiosClient = axios.create({
    // baseURL: 'https://smart-garage-api-7478.onrender.com/api',
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// INTERCEPTOR REQUEST: Can thiệp TRƯỚC KHI gửi yêu cầu lên Backend
axiosClient.interceptors.request.use(
    (config) => {
        // Vào kho lưu trữ của trình duyệt (localStorage) để tìm xem có token không
        const token = localStorage.getItem('token'); 
        if (token) {
            // Nếu có, kẹp nó vào phần Header với định dạng chuẩn của JWT
            config.headers.Authorization = `Bearer ${token}`; 
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// INTERCEPTOR RESPONSE: Can thiệp SAU KHI nhận dữ liệu từ Backend về
axiosClient.interceptors.response.use(
    (response) => {
        // Chỉ lấy phần data, bỏ qua các thông số rườm rà của HTTP
        return response.data;
    },
    (error) => {
        console.error("Lỗi gọi API:", error);
        
        // Bắt lỗi 401 (Chưa đăng nhập hoặc Token hết hạn)
        if (error.response && error.response.status === 401) {
            console.log("Token đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.");
            // Sau này chúng ta có thể gọi lệnh tự động đá người dùng văng ra trang Login ở đây
        }
        
        return Promise.reject(error);
    }
);

export default axiosClient;