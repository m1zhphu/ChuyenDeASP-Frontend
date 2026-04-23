import axiosClient from "./axiosClient";

const repairOrderApi = {
    // Mình giả định bạn có viết hàm lấy tất cả danh sách (Nếu C# chưa có, bạn nhớ thêm vào nhé)
    getAll: () => axiosClient.get('/RepairOrder'), 
    
    // Tìm 1 lệnh theo mã
    getByCode: (orderCode) => axiosClient.get(`/RepairOrder/${orderCode}`),
    
    // Tạo lệnh mới
    create: (data) => axiosClient.post('/RepairOrder/create', data),
    
    // Thanh toán
    pay: (data) => axiosClient.post('/RepairOrder/pay', data),
    getHistoryByPlate: (plate) => axiosClient.get(`/RepairOrder/history/${plate}`),
};

export default repairOrderApi;