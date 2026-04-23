import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

const AdminLoginStyles = () => (
    <style>
        {`
        /* Giữ nguyên toàn bộ CSS cũ của bạn ở đây */
        .login-wrapper { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #ece9e6 0%, #ffffff 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; }
        .login-card { background: #ffffff; padding: 2.5rem 3rem; border-radius: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); width: 100%; max-width: 420px; box-sizing: border-box; text-align: center; }
        .login-icon { width: 60px; height: 60px; margin-bottom: 1rem; color: #007bff; }
        .login-card h2 { text-align: center; color: #222; font-weight: 700; font-size: 1.8rem; margin-top: 0; margin-bottom: 2rem; }
        .form-group { margin-bottom: 1.25rem; text-align: left; }
        .form-group label { display: block; margin-bottom: 0.5rem; color: #555; font-weight: 600; font-size: 0.9rem; }
        .password-input-wrapper { position: relative; }
        .form-group input { width: 100%; padding: 0.85rem 1rem; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; font-size: 1rem; transition: border-color 0.3s ease, box-shadow 0.3s ease; }
        input[type="password"], input[type="text"]#password { padding-right: 3.5rem; }
        .form-group input:focus { outline: none; border-color: #007bff; box-shadow: 0 0 0 3px rgba(0,123,255,0.1); }
        .password-toggle-btn { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; color: #888; }
        .password-toggle-btn svg { width: 20px; height: 20px; }
        .password-toggle-btn:hover { color: #333; }
        .login-btn { width: 100%; padding: 0.9rem; border: none; border-radius: 8px; background-color: #007bff; color: white; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background-color 0.3s ease, transform 0.1s ease; margin-top: 1rem; }
        .login-btn:hover { background-color: #0056b3; }
        .login-btn:active { transform: scale(0.99); }
        .login-btn:disabled { background-color: #aaa; cursor: not-allowed; }
        .error-message { color: #d93025; background-color: #fbeae9; border: 1px solid #f5c6cb; padding: 0.8rem; border-radius: 8px; text-align: center; margin-bottom: 1.25rem; font-size: 0.9rem; }
        .register-link { margin-top: 1.5rem; text-align: center; color: #555; font-size: 0.9rem; }
        .register-link a { color: #007bff; text-decoration: none; font-weight: 600; }
        .register-link a:hover { text-decoration: underline; }
        `}
    </style>
);

const LockIcon = () => ( <svg className="login-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /> </svg> );
const EyeIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> );
const EyeSlashedIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L12 12" /></svg> );

function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); 
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.message) {
            setError(location.state.message);
        }
    }, [location.state]); 

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setLoading(true);
        setError(''); 

        console.log("👉 BƯỚC 1: Bắt đầu gửi yêu cầu đăng nhập...");

        try {
            const result = await authApi.login({ 
                username: username, 
                password: password 
            });

            console.log("👉 BƯỚC 2: Backend đã trả lời! Dữ liệu là:", result);

            // Kiểm tra xem C# có trả về đúng biến success và data không
            if (result && result.success) {
                console.log("👉 BƯỚC 3: Tuyệt vời! Token lấy được là:", result.data.token);
                
                // Lưu token
                localStorage.setItem('token', result.data.token);
                
                // In ra kiểm tra xem đã lưu thành công vào LocalStorage chưa
                console.log("👉 BƯỚC 4: Kiểm tra bộ nhớ:", localStorage.getItem('token'));
                
                // Chuyển trang
                navigate('/admin/dashboard'); 
            } else {
                console.warn("⚠️ CẢNH BÁO: Không tìm thấy Token trong dữ liệu trả về!");
                throw new Error(result?.message || 'Tài khoản không hợp lệ hoặc thiếu Token!');
            }

        } catch (err) {
            console.error("❌ BƯỚC LỖI: Bị kẹt ở Catch block:", err);
            const errorMsg = err.response?.data?.message || err.message || 'Lỗi kết nối đến Backend C#!';
            setError(errorMsg);
        } finally {
            setLoading(false); 
        }
    };

    return (
        <>
            <AdminLoginStyles /> 
            <div className="login-wrapper">
                <div className="login-card">
                    
                    <LockIcon />
                    <h2>Hệ Thống Quản Trị</h2>
                    
                    <form onSubmit={handleSubmit}>
                        {error && <p className="error-message">{error}</p>}

                        <div className="form-group">
                            <label htmlFor="username">Tên đăng nhập</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"} 
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button 
                                    type="button" 
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeSlashedIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>
                        
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default AdminLogin;