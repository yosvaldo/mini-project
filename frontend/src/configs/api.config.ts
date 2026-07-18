import axios from "axios";

let accessTokenMemory: string | null = null;

export const setAccessToken = (token: string | null) => {
    accessTokenMemory = token;
};

export const apiStatic = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_API_URL || "http://localhost:8000"}`,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

apiStatic.interceptors.request.use((config) => {
    if (accessTokenMemory && config.headers) {
        config.headers.Authorization = `Bearer ${accessTokenMemory}`;
    }
    return config;
});

export default apiStatic;