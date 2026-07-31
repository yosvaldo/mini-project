import axios from "axios";
import useAuthStore from "../stores/authStore"; 

let accessTokenMemory: string | null = null;

export const setAccessToken = (token: string | null) => {
    accessTokenMemory = token;
};

export const getAccessToken = () => accessTokenMemory;

const rawBaseUrl = import.meta.env.VITE_BASE_API_URL || "http://localhost:8000/api";
const baseURL = rawBaseUrl.endsWith("/") ? rawBaseUrl : `${rawBaseUrl}/`;

export const api = axios.create({
    baseURL,
    withCredentials: true, 
});

api.interceptors.request.use((config) => {
    const token = accessTokenMemory || useAuthStore.getState().accessToken;

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (!config.headers["Content-Type"] && !(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
    }

    return config;
});

export default api;