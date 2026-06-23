import axios, { AxiosInstance } from 'axios';

// تنظیمات axios instance
const axiosInstance: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://kaliznd.blhgroups.ir/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// اضافه کردن token احراز هویت به درخواست‌ها
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// مدیریت خطاهای جواب
// axiosInstance.interceptors.response.use(
//     (response) => {
//         return response;
//     },
//     (error) => {
//         if (error.response?.status === 401) {
//             // اگر توکن منقضی شد
//             localStorage.removeItem('authToken');
//             window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );

export default axiosInstance;
