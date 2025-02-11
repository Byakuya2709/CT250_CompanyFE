import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();
const commonConfig = {
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
};

export const api = axios.create({
    baseURL: 'http://localhost:8080/',
    ...commonConfig
});

export const setAuthorization = (token) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const removeAuthorization = () => {
    delete api.defaults.headers.common['Authorization'];
}
api.interceptors.request.use((config) => {
    console.log('Request Headers:', config.headers);
    return config;
}, (error) => {
    return Promise.reject(error);
});


api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response) {
        const status = error.response.status;
        const message = error.response.data.message || 'An error occurred';

        // Hiển thị thông báo lỗi với Toast
        if (status === 401) {
            toast.error(`Unauthorized: ${message}`);
        } else if (status === 403) {
            toast.error(`Access Denied: ${message}`);
        } else {
            toast.error(`Error ${status}: ${message}`);
        }
    } else if (error.request) {
        // Không có phản hồi từ server
        toast.error('No response from server. Please check your network.');
    } else {
        // Các lỗi khác
        toast.error(`Error: ${error.message}`);
    }

    return Promise.reject(error);
});