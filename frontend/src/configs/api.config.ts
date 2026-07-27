import axios from "axios";
import useAuthStore from "../stores/authStore"; 

let accessTokenMemory: string | null = null;

export const setAccessToken = (token: string | null) => {
    accessTokenMemory = token;
};

export const getAccessToken = () => accessTokenMemory;

export const api = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_API_URL || "http://localhost:8000/api"}`,
    withCredentials: true, 
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = accessTokenMemory || useAuthStore.getState().accessToken;

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;